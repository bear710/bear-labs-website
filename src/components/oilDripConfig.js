// Drip lane configuration — plain module with no imports.
// Both ScrollOilWaterfall.js and useOilWaterfallProgress.js import from here
// so neither file creates a cross-dependency with the other.
//
// Each drip is a lane in the left-side oil curtain. The *silhouette* of a
// drip (shoulder width, mid bulges, neck, integrated rounded tip, edge
// asymmetry, lateral drift, highlight side, satellite) is derived
// deterministically from `seed` + `type` inside the hook (see getProfile),
// so this file stays compact while every drip still gets a unique,
// stable, hand-poured shape.
//
// Fields:
//   type:          'thick' | 'medium' | 'thin' | 'thread' — drives width,
//                  detail level, tip character, highlight strength.
//   seed:          integer feeding the deterministic profile RNG.
//   xFrac:         centre x as a fraction of the measured curtain width.
//   wFrac:         base width as a fraction of curtain width.
//   maxLen:        how far down the page it can grow (fraction of docHeight).
//   startProgress: normalised scroll progress at which it begins to flow.
//   speed:         growth-rate multiplier after startProgress.
//   opacity:       group opacity.
//   poolFrac:      y within the top pool where it emerges (0 top … 1 bottom).
export const DRIP_CONFIGS = [
    { id: 0, type: 'thick',  seed: 1017, xFrac: 0.085, wFrac: 0.132, maxLen: 0.95, startProgress: 0.02, speed: 1.00, opacity: 0.95, poolFrac: 0.86 },
    { id: 1, type: 'thread', seed: 2029, xFrac: 0.185, wFrac: 0.020, maxLen: 0.42, startProgress: 0.12, speed: 0.74, opacity: 0.72, poolFrac: 0.60 },
    { id: 2, type: 'medium', seed: 3041, xFrac: 0.285, wFrac: 0.086, maxLen: 0.80, startProgress: 0.05, speed: 1.12, opacity: 0.92, poolFrac: 0.92 },
    { id: 3, type: 'thin',   seed: 4057, xFrac: 0.395, wFrac: 0.040, maxLen: 0.34, startProgress: 0.16, speed: 0.82, opacity: 0.80, poolFrac: 0.70 },
    { id: 4, type: 'thick',  seed: 5077, xFrac: 0.515, wFrac: 0.140, maxLen: 1.00, startProgress: 0.01, speed: 1.20, opacity: 0.96, poolFrac: 0.96 },
    { id: 5, type: 'medium', seed: 6091, xFrac: 0.625, wFrac: 0.066, maxLen: 0.62, startProgress: 0.09, speed: 0.95, opacity: 0.90, poolFrac: 0.80 },
    { id: 6, type: 'thread', seed: 7103, xFrac: 0.710, wFrac: 0.022, maxLen: 0.28, startProgress: 0.22, speed: 0.70, opacity: 0.68, poolFrac: 0.56 },
    { id: 7, type: 'thick',  seed: 8117, xFrac: 0.800, wFrac: 0.118, maxLen: 0.88, startProgress: 0.04, speed: 1.05, opacity: 0.94, poolFrac: 0.90 },
    { id: 8, type: 'thread', seed: 9133, xFrac: 0.875, wFrac: 0.018, maxLen: 0.20, startProgress: 0.26, speed: 0.64, opacity: 0.64, poolFrac: 0.50 },
    { id: 9, type: 'medium', seed: 1151, xFrac: 0.930, wFrac: 0.058, maxLen: 0.72, startProgress: 0.07, speed: 1.10, opacity: 0.88, poolFrac: 0.78 },
];
