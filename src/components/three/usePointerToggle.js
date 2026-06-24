'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';

// Small movement threshold (px) below which a pointer interaction still
// counts as a tap, even with a bit of natural hand/finger jitter.
const MOVE_THRESHOLD = 6;
// Reasonable tap/click duration ceiling (ms) — a press held longer than
// this is treated as something other than a quick tap.
const MAX_TAP_DURATION = 500;

/**
 * Robust click-vs-drag detection for a single interactive group, shared
 * by JarScene/VapeScene/AmpersandScene so there is exactly one
 * implementation of "was this a tap" across every product.
 *
 * Spread the returned handlers onto one wrapping <group> per scene (not
 * per sub-mesh) — R3F bubbles pointer events up through ancestors, so a
 * single set of handlers on the outer group covers every child mesh
 * without per-mesh stopPropagation or duplicate logic, and avoids
 * cursor/hover flicker at internal mesh boundaries.
 *
 * Pointer capture (R3F's own object-level capture, independent of the
 * browser's native canvas listeners) keeps move/up events arriving even
 * if the pointer slips off the hit area mid-gesture — OrbitControls is
 * a separate native listener on the canvas and is never affected by
 * this capture or by stopPropagation here.
 */
export function usePointerToggle(onTap, enabled) {
    const gesture = useRef(null);
    const { gl } = useThree();

    const onPointerDown = useCallback(
        (e) => {
            if (!enabled) return;
            e.stopPropagation();
            e.target?.setPointerCapture?.(e.pointerId);
            gesture.current = { x: e.clientX, y: e.clientY, time: performance.now(), moved: false, id: e.pointerId };
        },
        [enabled]
    );

    const onPointerMove = useCallback((e) => {
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        if (dx * dx + dy * dy > MOVE_THRESHOLD * MOVE_THRESHOLD) {
            g.moved = true;
        }
    }, []);

    const onPointerUp = useCallback(
        (e) => {
            const g = gesture.current;
            gesture.current = null;
            if (!g || g.id !== e.pointerId) return;
            e.target?.releasePointerCapture?.(e.pointerId);
            const duration = performance.now() - g.time;
            if (!g.moved && duration <= MAX_TAP_DURATION && enabled) {
                onTap();
            }
        },
        [onTap, enabled]
    );

    const onPointerCancel = useCallback((e) => {
        const g = gesture.current;
        gesture.current = null;
        if (g && g.id === e.pointerId) {
            e.target?.releasePointerCapture?.(e.pointerId);
        }
    }, []);

    // Hover affordance only (desktop mice/trackpads) — one pair on the
    // outer group, so it fires once per enter/exit of the whole product
    // rather than flickering at every internal mesh seam. The actual
    // DOM mutation happens in an effect (not the event callback itself)
    // so it never touches the value returned from useThree() outside a
    // recognized effect escape hatch.
    const [hovering, setHovering] = useState(false);

    const onPointerOver = useCallback(() => {
        if (enabled) setHovering(true);
    }, [enabled]);

    const onPointerOut = useCallback(() => setHovering(false), []);

    // Copy the DOM node into a plain ref first, so the cursor-mutating
    // effect below never references the value useThree() returns.
    const domElRef = useRef(null);
    useEffect(() => {
        domElRef.current = gl?.domElement ?? null;
    }, [gl]);

    useEffect(() => {
        const el = domElRef.current;
        if (!el) return;
        el.style.cursor = hovering && enabled ? 'pointer' : 'grab';
    }, [hovering, enabled]);

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerOver, onPointerOut };
}
