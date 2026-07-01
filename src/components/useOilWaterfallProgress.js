'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DRIP_CONFIGS } from './oilDripConfig';

let pluginRegistered = false;
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SETTLE_MS = [300, 1400, 3200];
const POOL_DEPTH_FRAC = 0.11;

// ── small math helpers ─────────────────────────────────────────────────────
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const r1 = (v) => Math.round(v * 10) / 10;   // 1-decimal rounding to shrink path strings

// How far down the viewport the leading oil tips are allowed to reach, as a
// fraction of viewport height. Smaller = tips sit higher. Mobile keeps them
// slightly higher than desktop so streams don't run behind off-screen sections.
const frontierFactorFor = (w) => (w <= 600 ? 0.80 : w <= 1024 ? 0.82 : 0.85);

// Deterministic RNG (mulberry32) — same seed always yields the same sequence,
// so every drip's silhouette is stable between renders and refreshes.
function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ── per-drip shape profile (derived once, cached by id) ─────────────────────
// Turns a compact {type, seed} into the full set of silhouette parameters:
// shoulder, mid bulges, taper, independent left/right edge undulation
// (asymmetry), lateral drift + a single kink, integrated-tip character
// (neck vs. swell, roundness, lean), highlight side/strength, satellite.
const profileCache = new Map();
function getProfile(cfg) {
    const cached = profileCache.get(cfg.id);
    if (cached) return cached;
    const rnd = mulberry32(cfg.seed);
    const type = cfg.type;
    const isThick = type === 'thick';
    const isMed = type === 'medium';
    const isThread = type === 'thread';

    // Viscous width undulation authored in ABSOLUTE PIXELS (not fractions of
    // the drip's full length) so bulges are visible at viewport scale — the
    // fix for "looks like straight parallel tubes". Three superimposed sine
    // waves at different pixel wavelengths give multi-scale, hand-poured
    // swelling. Left and right edges use per-wave phase offsets (asym*) so the
    // silhouette is never mirror-symmetric.
    const ampScale = isThick ? 1 : isMed ? 0.85 : type === 'thin' ? 0.62 : 0.34;
    const prof = {
        shoulder: 1.28 + 0.4 * rnd(),           // wider where it meets the pool
        shoulderLen: 0.05 + 0.05 * rnd(),        // fraction of maxLen for shoulder blend
        taper: 0.1 + 0.16 * rnd(),               // gentle overall thinning down the length
        // multi-scale viscous swelling (px wavelengths, amplitudes as width mult)
        wl1: 210 + rnd() * 130, a1: 0.20 * ampScale * (0.7 + 0.6 * rnd()), ph1: rnd() * Math.PI * 2,
        wl2: 380 + rnd() * 240, a2: 0.13 * ampScale * (0.7 + 0.6 * rnd()), ph2: rnd() * Math.PI * 2,
        wl3: 700 + rnd() * 500, a3: 0.09 * ampScale * (0.7 + 0.6 * rnd()), ph3: rnd() * Math.PI * 2,
        asym1: (rnd() * 2 - 1) * 1.3, asym2: (rnd() * 2 - 1) * 1.3, asym3: (rnd() * 2 - 1) * 1.3,
        // lateral movement — gentle S-weave over hundreds of px, plus one kink
        driftAmp: (isThread ? 0.010 : 0.022) * (0.5 + rnd()), // fraction of curtain W
        driftWl: 700 + rnd() * 700,
        driftPhase: rnd() * Math.PI * 2,
        kinkPos: 0.35 + 0.2 * rnd(),
        kinkAmt: (rnd() - 0.5) * (isThread ? 0.010 : 0.022),  // signed, fraction of W
        // integrated terminal
        endWidth: (isThick ? 0.95 : isMed ? 0.8 : type === 'thin' ? 0.6 : 0.42) * (0.85 + 0.3 * rnd()),
        hasNeck: !isThread && rnd() < 0.5,
        neckDepth: 0.22 + 0.2 * rnd(),
        terminalRound: 0.85 + 0.4 * rnd(),
        tipLean: (rnd() - 0.5) * (isThread ? 0.6 : 1.5),  // × baseHW
        // material
        hlSide: rnd() < 0.5 ? -1 : 1,
        hlStrength: isThick ? 0.95 : isMed ? 0.72 : 0.4,
        // satellite droplet
        hasSatellite: (isThick || isMed) && rnd() < 0.5,
        satSize: 0.42 + 0.3 * rnd(),
        satGapMul: 2.4 + rnd() * 1.6,
        // How far (px) this drip's tip lags BEHIND the scroll frontier. In the
        // frontier-bound regime a drip's tip sits at frontierY + frontierOffset,
        // so this is what staggers the leading edge into an irregular silhouette
        // instead of one flat horizontal cap. Thick drips define the leading
        // edge (near/just past the frontier); thinner types trail farther up.
        frontierOffset: isThick
            ? -100 + rnd() * 125          // [-100, +25]  — dominant leading edge
            : isMed
            ? -220 + rnd() * 140          // [-220, -80]
            : type === 'thin'
            ? -360 + rnd() * 160          // [-360, -200]
            : -560 + rnd() * 180,         // [-560, -380]  — short hanging threads
    };
    profileCache.set(cfg.id, prof);
    return prof;
}

// Smooth closed outline through an ordered point loop (Catmull-Rom → cubic
// bezier). One continuous curve, no kinks, no separate segments — the
// integrated rounded tip is just part of the same loop.
function catmullClosed(pts) {
    const n = pts.length;
    if (n < 3) return '';
    let d = `M ${r1(pts[0][0])} ${r1(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const p3 = pts[(i + 2) % n];
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${r1(c1x)} ${r1(c1y)}, ${r1(c2x)} ${r1(c2y)}, ${r1(p2[0])} ${r1(p2[1])}`;
    }
    return `${d} Z`;
}

// ── curtain / pool measurement (unchanged behaviour) ───────────────────────
function measureCurtainWidth() {
    const header = document.querySelector('[data-oil-origin]');
    const logoLink = document.querySelector('[data-oil-logo]');
    if (!header || !logoLink) return Math.round(window.innerWidth * 0.22);
    const padL = parseFloat(getComputedStyle(header).paddingLeft) || 0;
    const logoW = logoLink.offsetWidth || 130;
    const raw = Math.round(padL + logoW + 14);
    const vw = window.innerWidth;
    const cap = vw <= 600 ? 0.46 : vw <= 1024 ? 0.35 : 0.32;
    return Math.min(raw, Math.round(vw * cap));
}

// Top pool — wide irregular sagging lower edge. Drip shoulders overlap up
// into it so the joins are seamless (same fill colour, no visible seam).
function genPoolPath(W, poolH) {
    const t = poolH;
    return [
        'M 0 0', `L ${W} 0`, `L ${W} ${t * 0.38}`,
        `C ${W * 0.96} ${t * 0.92}, ${W * 0.90} ${t * 1.20}, ${W * 0.81} ${t * 0.80}`,
        `C ${W * 0.77} ${t * 0.56}, ${W * 0.71} ${t * 1.30}, ${W * 0.62} ${t * 1.04}`,
        `C ${W * 0.58} ${t * 0.78}, ${W * 0.51} ${t * 1.34}, ${W * 0.43} ${t * 1.00}`,
        `C ${W * 0.39} ${t * 0.74}, ${W * 0.32} ${t * 1.24}, ${W * 0.24} ${t * 0.84}`,
        `C ${W * 0.19} ${t * 0.54}, ${W * 0.12} ${t * 1.14}, ${W * 0.06} ${t * 0.70}`,
        `C ${W * 0.03} ${t * 0.40}, 0 ${t * 0.54}, 0 ${t * 0.30}`,
        'Z',
    ].join(' ');
}

// ── the drip geometry engine ────────────────────────────────────────────────
// Generates ONE continuous closed body path for the drip at its current
// length, plus optional curved highlight/shadow ribbons that follow the
// silhouette. The rounded terminal is part of the body loop — there is no
// separate bulb/ellipse element anywhere.
function buildDrip(cfg, prof, anchorY, len, W, maxLenPx, isMobile) {
    if (len < 6) return { body: '', hl: '', shadow: '' };

    const baseHW = Math.max((cfg.wFrac * W) / 2, 1.1);
    const cx0 = cfg.xFrac * W;

    // Rounded terminal depth, and where the trunk stops so the cap can close.
    const capDepth = Math.min(baseHW * prof.endWidth * prof.terminalRound * 1.6, len * 0.5);
    const bodyEnd = Math.max(len - capDepth, len * 0.4);
    const capDepthEff = len - bodyEnd;
    const overlap = Math.min(baseHW * 1.6, anchorY * 0.7, 28); // overlap up into pool
    const topD = -overlap;

    const centerAt = (d) => {
        const s = clamp(d / maxLenPx, 0, 1);
        let x = cx0 + W * prof.driftAmp * Math.sin((2 * Math.PI * d) / prof.driftWl + prof.driftPhase);
        const kEnv = Math.exp(-((s - prof.kinkPos) ** 2) / (2 * 0.01));
        x += W * prof.kinkAmt * kEnv;
        return x;
    };

    const tipZone = Math.min(capDepth * 3.0, len * 0.5);
    const widthsAt = (d) => {
        const s = clamp(d / maxLenPx, 0, 1);
        let base = lerp(prof.shoulder, 1, smoothstep(0, prof.shoulderLen, s));
        base *= 1 - prof.taper * s;
        // multi-scale viscous swelling, independent per edge (pixel wavelengths)
        const undL =
            prof.a1 * Math.sin((2 * Math.PI * d) / prof.wl1 + prof.ph1) +
            prof.a2 * Math.sin((2 * Math.PI * d) / prof.wl2 + prof.ph2) +
            prof.a3 * Math.sin((2 * Math.PI * d) / prof.wl3 + prof.ph3);
        const undR =
            prof.a1 * Math.sin((2 * Math.PI * d) / prof.wl1 + prof.ph1 + prof.asym1) +
            prof.a2 * Math.sin((2 * Math.PI * d) / prof.wl2 + prof.ph2 + prof.asym2) +
            prof.a3 * Math.sin((2 * Math.PI * d) / prof.wl3 + prof.ph3 + prof.asym3);
        let hwL = baseHW * base * Math.max(1 + undL, 0.28);
        let hwR = baseHW * base * Math.max(1 + undR, 0.28);

        // Integrated tip: within tipZone above the current end, blend the trunk
        // width toward the terminal width (with a neck dip or a slight swell so
        // the end is "weighted"). The actual rounding is the cap arc below.
        const td = len - d;
        if (td < tipZone) {
            const u = clamp(td / tipZone, 0, 1); // 0 at bodyEnd … 1 at zone top
            let endMul = prof.endWidth;
            if (prof.hasNeck) {
                const neck = Math.exp(-((u - 0.55) ** 2) / (2 * 0.03));
                endMul *= 1 - prof.neckDepth * neck;
            } else {
                const swell = Math.exp(-((u - 0.25) ** 2) / (2 * 0.05));
                endMul *= 1 + 0.12 * swell;
            }
            const tw = baseHW * endMul;
            const bl = smoothstep(0, 1, u);
            hwL = lerp(tw, hwL, bl);
            hwR = lerp(tw, hwR, bl);
        }
        return { hwL, hwR };
    };

    // ~52px sample spacing so the shortest (~210px) width wavelength is
    // resolved smoothly; capped so very long drips don't explode the string.
    const nS = Math.max(4, Math.round(Math.min((bodyEnd - topD) / 52, 48) * (isMobile ? 0.65 : 1)));
    const pts = [];
    // right edge: top → bodyEnd
    for (let i = 0; i <= nS; i++) {
        const d = lerp(topD, bodyEnd, i / nS);
        pts.push([centerAt(d) + widthsAt(d).hwR, anchorY + d]);
    }
    // rounded cap: right → tip → left (half-ellipse, leaning by tipLean)
    const capN = isMobile ? 4 : 6;
    const cxEnd = centerAt(bodyEnd);
    const wEnd = widthsAt(bodyEnd);
    const Rx = cxEnd + wEnd.hwR;
    const Lx = cxEnd - wEnd.hwL;
    const midX = (Rx + Lx) / 2;
    const halfSpan = (Rx - Lx) / 2;
    const lean = prof.tipLean * baseHW;
    for (let k = 1; k < capN; k++) {
        const a = Math.PI * (k / capN);
        pts.push([midX + Math.cos(a) * halfSpan + lean * Math.sin(a), anchorY + bodyEnd + Math.sin(a) * capDepthEff]);
    }
    // left edge: bodyEnd → top
    for (let i = nS; i >= 0; i--) {
        const d = lerp(topD, bodyEnd, i / nS);
        pts.push([centerAt(d) - widthsAt(d).hwL, anchorY + d]);
    }
    const body = catmullClosed(pts);

    // Curved highlight + amber shadow ribbons that follow the geometry and
    // narrow toward the tip. Skipped on threads/thin (and medium on mobile)
    // to keep delicate streams clean and cheap.
    let hl = '';
    let shadow = '';
    const wantDetail = (cfg.type === 'thick' || cfg.type === 'medium') && !(isMobile && cfg.type === 'medium');
    if (wantDetail) {
        hl = genRibbon(centerAt, widthsAt, anchorY, topD + (bodyEnd - topD) * 0.06, bodyEnd * 0.86, prof.hlSide, 0.46, 0.15 * prof.hlStrength, isMobile);
        shadow = genRibbon(centerAt, widthsAt, anchorY, topD + (bodyEnd - topD) * 0.03, bodyEnd * 0.94, -prof.hlSide, 0.66, 0.2, isMobile);
    }
    return { body, hl, shadow };
}

// A thin curved strip biased toward one edge of the drip, tapering to nothing
// near the tip — provides the glossy specular (or, on the opposite side, a
// soft amber shadow) that follows the organic silhouette.
function genRibbon(centerAt, widthsAt, anchorY, dTop, dBot, side, edgeFrac, halfFrac, isMobile) {
    if (dBot - dTop < 6) return '';
    const nS = Math.max(4, Math.round(Math.min((dBot - dTop) / 90, 30) * (isMobile ? 0.65 : 1)));
    const outer = [];
    const inner = [];
    for (let i = 0; i <= nS; i++) {
        const f = i / nS;
        const d = lerp(dTop, dBot, f);
        const cx = centerAt(d);
        const w = side > 0 ? widthsAt(d).hwR : widthsAt(d).hwL;
        const taper = (1 - smoothstep(0.55, 1, f)) * smoothstep(0, 0.12, f); // fade both ends
        const center = cx + side * w * edgeFrac;
        const half = Math.max(w * halfFrac * taper, 0.25);
        outer.push([center + side * half, anchorY + d]);
        inner.push([center - side * half, anchorY + d]);
    }
    return catmullClosed([...outer, ...inner.reverse()]);
}

// A small detached falling droplet (pointed top, rounded bottom) — clearly
// separate from, and smaller than, the main stream's integrated tip.
function genSatellite(cx, cy, rx, ry) {
    return [
        `M ${r1(cx)} ${r1(cy - ry)}`,
        `C ${r1(cx + rx * 0.95)} ${r1(cy - ry * 0.15)}, ${r1(cx + rx)} ${r1(cy + ry * 0.55)}, ${r1(cx)} ${r1(cy + ry)}`,
        `C ${r1(cx - rx)} ${r1(cy + ry * 0.55)}, ${r1(cx - rx * 0.95)} ${r1(cy - ry * 0.15)}, ${r1(cx)} ${r1(cy - ry)}`,
        'Z',
    ].join(' ');
}

function dripRevealPx(cfg, progress, docH) {
    if (progress <= cfg.startProgress) return 0;
    const rel = (progress - cfg.startProgress) * cfg.speed;
    return easeOutCubic(Math.min(rel, 1)) * cfg.maxLen * docH;
}

// ── main hook ────────────────────────────────────────────────────────────
export default function useOilWaterfallProgress({
    svgRef,
    poolPathRef,
    dripBodyRefs,
    dripHlRefs,
    dripShadowRefs,
    satelliteRefs,
    debugRef,
}) {
    useEffect(() => {
        const svg = svgRef.current;
        const poolPath = poolPathRef.current;
        if (!svg || !poolPath) return undefined;

        if (!pluginRegistered) {
            gsap.registerPlugin(ScrollTrigger);
            pluginRegistered = true;
        }

        const motionMq = window.matchMedia(MOTION_QUERY);
        let trigger = null;
        const timeouts = [];
        let docH = 0;
        let curtainW = 0;
        let poolH = 0;
        let isMobile = false;
        const lastLen = new Array(DRIP_CONFIGS.length).fill(-1);

        const setD = (el, d) => { if (el) el.setAttribute('d', d); };

        function renderDrip(cfg, i, len) {
            const prof = getProfile(cfg);
            const anchorY = poolH * cfg.poolFrac;
            const maxLenPx = cfg.maxLen * docH;
            const { body, hl, shadow } = buildDrip(cfg, prof, anchorY, len, curtainW, maxLenPx, isMobile);
            setD(dripBodyRefs.current[i], body);
            setD(dripHlRefs.current[i], hl);
            setD(dripShadowRefs.current[i], shadow);

            const satEl = satelliteRefs.current[i];
            if (satEl) {
                const baseHW = Math.max((cfg.wFrac * curtainW) / 2, 1.1);
                // Appears once a drip is a reasonable length (frontier-capped
                // lengths seldom reach a large fraction of a huge maxLenPx).
                if (prof.hasSatellite && len > Math.min(maxLenPx * 0.3, window.innerHeight * 0.55)) {
                    const cx = centerXForSatellite(cfg, prof, curtainW, baseHW);
                    const gap = baseHW * prof.satGapMul;
                    const sz = baseHW * prof.satSize;
                    const cy = anchorY + len + gap;
                    if (cy + 2 * sz < docH) satEl.setAttribute('d', genSatellite(cx, cy, sz * 0.82, sz));
                    else satEl.setAttribute('d', '');
                } else {
                    satEl.setAttribute('d', '');
                }
            }
        }

        function measureAndBuild() {
            docH = document.documentElement.scrollHeight;
            curtainW = measureCurtainWidth();
            isMobile = window.innerWidth <= 600;
            const header = document.querySelector('[data-oil-origin]');
            const headerH = header ? header.offsetHeight : 60;
            poolH = Math.round(headerH + window.innerHeight * POOL_DEPTH_FRAC);

            svg.setAttribute('width', String(curtainW));
            svg.setAttribute('height', String(docH));
            svg.setAttribute('viewBox', `0 0 ${curtainW} ${docH}`);
            poolPath.setAttribute('d', genPoolPath(curtainW, poolH));

            lastLen.fill(-1);
            if (motionMq.matches) buildStatic();
            else update();
        }

        function update() {
            if (motionMq.matches || !docH) return;
            // Cheap reads only (scrollY / innerHeight) — no per-frame layout
            // measurement; anchors + docH are cached from measureAndBuild.
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const maxScroll = Math.max(docH - vh, 1);
            const progress = Math.min(scrollY / maxScroll, 1);
            // Scroll frontier in document coordinates — the approximate lowest
            // point the leading oil tips may reach right now.
            const frontierY = scrollY + vh * frontierFactorFor(window.innerWidth);

            DRIP_CONFIGS.forEach((cfg, i) => {
                const prof = getProfile(cfg);
                const anchorY = poolH * cfg.poolFrac;
                const maxLenPx = cfg.maxLen * docH;
                // desired = organic staggered growth (personality / birth stagger)
                const desiredLen = dripRevealPx(cfg, progress, docH);
                // allowed = how long it may be so its tip lands at frontierY+offset
                const allowedLen = frontierY - anchorY + prof.frontierOffset;
                // Visible length is the *lesser* of desire, frontier and the
                // configured document ceiling — so no stream runs far ahead of
                // the visitor, yet each keeps its own tip height and eventual max.
                const len = Math.max(0, Math.min(desiredLen, allowedLen, maxLenPx));

                // Quantize: skip regeneration when a drip barely changed length,
                // but always act on the transition to/from zero.
                if (Math.abs(len - lastLen[i]) < 2 && !(len === 0 && lastLen[i] > 0)) return;
                lastLen[i] = len;
                renderDrip(cfg, i, len);
            });

            if (debugRef?.current) writeDebug();
        }

        function buildStatic() {
            // Reduced motion: fixed, naturally-integrated drips; no scroll coupling.
            DRIP_CONFIGS.forEach((cfg, i) => {
                const len = cfg.maxLen * window.innerHeight * 0.16;
                lastLen[i] = len;
                renderDrip(cfg, i, len);
                const satEl = satelliteRefs.current[i];
                if (satEl) satEl.setAttribute('d', '');
            });
        }

        function writeDebug() {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            const ff = frontierFactorFor(window.innerWidth);
            const frontierY = scrollY + vh * ff;
            const maxScroll = Math.max(docH - vh, 1);
            const progress = Math.min(scrollY / maxScroll, 1);
            const lines = [
                `scrollY:${Math.round(scrollY)} vh:${vh} ff:${ff} frontierY:${Math.round(frontierY)}`,
                `docH:${docH} curtain:${curtainW} mobile:${isMobile}`,
                'D(t) anchor desired allowed visible tip%',
            ];
            DRIP_CONFIGS.forEach((cfg, i) => {
                const prof = getProfile(cfg);
                const anchorY = poolH * cfg.poolFrac;
                const maxLenPx = cfg.maxLen * docH;
                const desired = dripRevealPx(cfg, progress, docH);
                const allowed = frontierY - anchorY + prof.frontierOffset;
                const vis = Math.max(0, Math.min(desired, allowed, maxLenPx));
                const tipPct = Math.round(((anchorY + vis - scrollY) / vh) * 100);
                lines.push(`D${i}(${cfg.type[0]}) ${Math.round(anchorY)} ${Math.round(desired)} ${Math.round(allowed)} ${Math.round(vis)} ${tipPct}%`);
            });
            debugRef.current.textContent = lines.join('\n');
        }

        function applyReducedMotion() {
            if (motionMq.matches) {
                if (trigger) { trigger.kill(); trigger = null; }
                if (!docH) measureAndBuild();
                else buildStatic();
            } else {
                measureAndBuild();
                if (!trigger) {
                    trigger = ScrollTrigger.create({
                        trigger: document.documentElement,
                        start: 'top top',
                        end: 'bottom bottom',
                        onUpdate: update,
                    });
                }
            }
        }

        applyReducedMotion();

        const onResize = () => { if (!motionMq.matches) { measureAndBuild(); ScrollTrigger.refresh(); } };
        window.addEventListener('resize', onResize);
        motionMq.addEventListener('change', applyReducedMotion);
        SETTLE_MS.forEach((ms) => {
            const t = window.setTimeout(() => { if (!motionMq.matches) { measureAndBuild(); ScrollTrigger.refresh(); } }, ms);
            timeouts.push(t);
        });

        return () => {
            window.removeEventListener('resize', onResize);
            motionMq.removeEventListener('change', applyReducedMotion);
            timeouts.forEach(clearTimeout);
            if (trigger) trigger.kill();
        };
    }, [svgRef, poolPathRef, dripBodyRefs, dripHlRefs, dripShadowRefs, satelliteRefs, debugRef]);
}

// Satellite x mirrors the drip's tip lean/centre so it reads as fluid that
// dripped off the same stream.
function centerXForSatellite(cfg, prof, W, baseHW) {
    return cfg.xFrac * W + prof.tipLean * baseHW;
}
