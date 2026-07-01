'use client';
import { useId, useRef } from 'react';
import styles from './ScrollOilWaterfall.module.css';
import useOilWaterfallProgress from './useOilWaterfallProgress';
import { DRIP_CONFIGS } from './oilDripConfig';

const DEV = process.env.NODE_ENV === 'development';

/**
 * Left-side oil-paint curtain. A wide organic pool of vivid golden oil
 * emerges from behind the BEAR LABS header wordmark and sends 10 irregular
 * drip streams downward, each grown by its own scroll-progress reveal curve.
 *
 * Each drip is ONE continuous closed path regenerated at its current length
 * (see useOilWaterfallProgress → buildDrip): shoulder → asymmetric bulging
 * body → integrated rounded/teardrop tip, all in a single Catmull-Rom loop.
 * There are no separate leading-bulb ellipses and no reveal-clip rectangles —
 * the rounded terminal is part of the body itself, so it never reads as a
 * detached head on a stem.
 *
 * Per drip we render three stacked paths: body (gold gradient), a soft amber
 * shadow ribbon, and a warm-white highlight ribbon — the last two curve with
 * the silhouette and taper into the tip. Thick/medium drips carry a satellite
 * falling droplet below their tip; threads stay bare and delicate.
 */
export default function ScrollOilWaterfall() {
    const N = DRIP_CONFIGS.length;
    const svgRef          = useRef(null);
    const poolPathRef     = useRef(null);
    const dripBodyRefs    = useRef(new Array(N).fill(null));
    const dripHlRefs      = useRef(new Array(N).fill(null));
    const dripShadowRefs  = useRef(new Array(N).fill(null));
    const satelliteRefs   = useRef(new Array(N).fill(null));
    const debugRef        = useRef(null);

    const uid        = useId().replace(/[^a-zA-Z0-9]/g, '');
    const gradId     = `owg-${uid}`;
    const hlGradId   = `owh-${uid}`;
    const poolGlowId = `owpg-${uid}`;

    useOilWaterfallProgress({
        svgRef,
        poolPathRef,
        dripBodyRefs,
        dripHlRefs,
        dripShadowRefs,
        satelliteRefs,
        debugRef: DEV ? debugRef : null,
    });

    return (
        <>
            <svg
                ref={svgRef}
                className={styles.waterfall}
                width="0"
                height="0"
                viewBox="0 0 0 0"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    {/* Body oil colour — bright yellow core → honey → amber settle */}
                    <linearGradient id={gradId} x1="0" y1="0" x2="0.15" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0%"   stopColor="#FFE844" />
                        <stop offset="20%"  stopColor="#FFD400" />
                        <stop offset="46%"  stopColor="#F3B300" />
                        <stop offset="70%"  stopColor="#E08A00" />
                        <stop offset="88%"  stopColor="#F5C000" />
                        <stop offset="100%" stopColor="#B86800" />
                    </linearGradient>

                    {/* Warm-white specular — fades out toward the tip */}
                    <linearGradient id={hlGradId} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0%"   stopColor="#FFFBC0" stopOpacity="0.85" />
                        <stop offset="50%"  stopColor="#FFEE88" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#FFD84D" stopOpacity="0.08" />
                    </linearGradient>

                    {/* Soft glow behind the pooled top edge only (small filter region) */}
                    <filter id={poolGlowId} x="-20%" y="-20%" width="140%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* ── Top pool — always visible, emerges from behind the header ── */}
                <g filter={`url(#${poolGlowId})`} opacity="0.96">
                    <path ref={poolPathRef} d="" fill={`url(#${gradId})`} />
                </g>

                {/* ── Drip streams (+ satellites) — subtle sway via CSS wrapper ── */}
                <g className={styles.streamMotion}>
                    {DRIP_CONFIGS.map((cfg, i) => (
                        <g key={cfg.id} opacity={cfg.opacity}>
                            {/* body */}
                            <path ref={(el) => { dripBodyRefs.current[i] = el; }} d="" fill={`url(#${gradId})`} />
                            {/* amber edge shadow (over body, low opacity) */}
                            <path ref={(el) => { dripShadowRefs.current[i] = el; }} d="" fill="#6B3D00" opacity="0.4" />
                            {/* warm-white specular */}
                            <path ref={(el) => { dripHlRefs.current[i] = el; }} d="" fill={`url(#${hlGradId})`} />
                        </g>
                    ))}
                    {DRIP_CONFIGS.map((cfg, i) => (
                        <path
                            key={`sat-${cfg.id}`}
                            ref={(el) => { satelliteRefs.current[i] = el; }}
                            d=""
                            fill={`url(#${gradId})`}
                            opacity={cfg.opacity * 0.7}
                        />
                    ))}
                </g>
            </svg>

            {DEV && <pre ref={debugRef} className={styles.debugReadout} />}
        </>
    );
}
