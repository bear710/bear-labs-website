'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './WeedmapsLocator.module.css';

const SCRIPT_SRC = 'https://bearlabs.wm.store/static/js/retailers-embed.js';
const IFRAME_ID = 'wm-store-retailers-embed';
const FAIL_AFTER_MS = 10000;

/**
 * Weedmaps retailer locator embed.
 *
 * INVESTIGATED BEHAVIOR of retailers-embed.js (fetched and read directly
 * — see commit/report notes): it is a small IIFE that, on the
 * document's `DOMContentLoaded` event, builds an <iframe> pointed at
 * `{origin}/retailers?embed=true` and inserts it via
 * `scriptTag.insertAdjacentElement('beforebegin', frame)` — i.e. it has
 * no container-ID lookup at all; it simply inserts the iframe as the
 * previous sibling of wherever its own <script> tag ends up. It exposes
 * no globals and requires no init call.
 *
 * The critical wrinkle: by the time any client component can inject a
 * script, `document.readyState` is already `'complete'` — the page's
 * real DOMContentLoaded fired long ago, so the embed's own listener for
 * it will never run on its own. Dispatching a synthetic
 * `DOMContentLoaded` event immediately after the script loads re-fires
 * that (already-registered) listener and reliably produces the iframe.
 * This was verified directly against the live script before relying on
 * it (see report).
 */
let scriptRequested = false;

export default function WeedmapsLocator() {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

    // Lazy-load: only start fetching/injecting the third-party script
    // once the section is close to the viewport, so it never competes
    // with the initial page render.
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || typeof IntersectionObserver === 'undefined') {
            // Fallback for environments without IntersectionObserver —
            // deferred a tick so this stays an async reaction rather
            // than a synchronous setState call inside the effect body.
            const id = window.setTimeout(() => setShouldLoad(true), 0);
            return () => window.clearTimeout(id);
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(wrapper);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!shouldLoad) return undefined;
        const container = containerRef.current;
        if (!container) return undefined;

        let cancelled = false;
        // Covers both "the iframe is already present" (checked on the
        // first tick instead of synchronously, so this never calls
        // setState directly in the effect body) and "the iframe has
        // just been created" once the script runs.
        const poll = window.setInterval(() => {
            if (container.querySelector(`#${IFRAME_ID}`)) {
                window.clearInterval(poll);
                if (!cancelled) setStatus('ready');
            }
        }, 150);

        const failTimeout = window.setTimeout(() => {
            window.clearInterval(poll);
            if (!cancelled) setStatus('error');
        }, FAIL_AFTER_MS);

        const cleanup = () => {
            cancelled = true;
            window.clearInterval(poll);
            window.clearTimeout(failTimeout);
        };

        // Module-level guard: survives React 18 Strict Mode's dev-only
        // mount -> unmount -> remount double-invoke, so the <script> is
        // only ever requested once per page load even though this
        // effect body may run twice in development. If a prior
        // invocation already requested it, just keep polling (above)
        // for the iframe it will produce.
        if (scriptRequested) {
            return cleanup;
        }
        scriptRequested = true;

        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.onload = () => {
            // See the file-level note: re-fires the embed's own
            // (already-registered, otherwise dead) DOMContentLoaded
            // listener so it builds its iframe.
            document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: false }));
        };
        script.onerror = () => {
            if (process.env.NODE_ENV !== 'production') {
                console.error('[WeedmapsLocator] failed to load script:', SCRIPT_SRC);
            }
            cleanup();
            setStatus('error');
        };
        container.appendChild(script);

        return cleanup;
    }, [shouldLoad]);

    return (
        <div ref={wrapperRef} className={styles.locatorWrapper}>
            {status === 'loading' && (
                <p className={styles.loadingState} role="status">
                    Loading nearby retailers…
                </p>
            )}
            {status === 'error' && (
                <p className={styles.errorState} role="status">
                    The store locator could not be loaded. Shop Bear Labs on Weedmaps instead.
                </p>
            )}
            <div ref={containerRef} className={styles.embedContainer} data-state={status} />
        </div>
    );
}
