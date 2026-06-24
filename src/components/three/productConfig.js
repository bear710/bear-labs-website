/**
 * Single source of truth for the product showroom.
 *
 * No component in this directory should branch on a specific product id
 * or name. Every visual/behavioral difference between products must be
 * expressed as a field here and resolved generically (see
 * resolveJarVariant, buildCameraViews, getTransitionPose below).
 */

export const CATEGORIES = [
    { id: 'pioca', label: 'Pioca', hasTiers: false },
    { id: 'rosin', label: 'Live Rosin', hasTiers: true },
    { id: 'resin', label: 'Live Resin', hasTiers: true },
    { id: 'vape', label: 'Vape', hasTiers: false },
    { id: 'ampersand', label: 'Ampersand', hasTiers: false },
];

// Brand tier accents, matching the hex values already used elsewhere on
// the site (see ProductShowcase.js / globals.css) so the showroom reads
// as part of the same system rather than inventing a new palette.
const TIER_ACCENTS = {
    1: '#FFE032',
    2: '#81CBD2',
    3: '#FFE032',
    4: '#6BC4CC',
};

// railLabel is always derived by joining these lines, so the visible
// multi-line rail button and its accessible name can never drift apart.
const VAPE_RAIL_LINES = ['Live Resin', '510 Thread', 'Vapes'];
const AMPERSAND_RAIL_LINES = ['Ampersand', 'Live Rosin', 'Ingestible'];

function jarProduct({
    id,
    category,
    tier,
    name,
    shortName,
    railLabelLines,
    description,
    accent,
    materialVariant = 'standard',
    scale = 1,
}) {
    return {
        id,
        name,
        shortName,
        // Single source of truth for the rail: the full accessible name
        // is always derived from the same lines the button displays, so
        // they can never drift apart.
        railLabelLines,
        railLabel: railLabelLines.join(' '),
        category,
        tier,
        interactionType: 'open',
        modelType: 'jar',
        modelPath: null,
        description,
        accent,
        materialVariant,
        initialCameraPosition: [0, 1.05, 4.2],
        focusCameraPosition: [0, 3.6, 2.4],
        orbitTarget: [0, 0.2, 0],
        scale,
        entryDirection: 'right',
        exitDirection: 'left',
        supportsOpen: true,
        supportsExtraction: false,
    };
}

export const PRODUCTS = [
    jarProduct({
        id: 'pioca-superconcentrate',
        category: 'pioca',
        tier: null,
        name: 'Pioca Live Rosin Superconcentrate',
        shortName: 'Pioca',
        railLabelLines: ['Pioca'],
        description: 'Our most exclusive press — small-batch, ultra-refined, and built for connoisseurs who want the absolute peak expression of a single cultivar.',
        accent: '#caa86b',
        materialVariant: 'specialized',
        scale: 1.08,
    }),
    jarProduct({
        id: 'rosin-tier-1',
        category: 'rosin',
        tier: 1,
        name: 'Live Rosin — Tier 1',
        shortName: 'Tier 1',
        railLabelLines: ['Tier 1', 'Live Rosin'],
        description: 'The apex of excellence. 90u-120u live rosin from ultra-exclusive, pheno-hunted, farm-specific genetics.',
        accent: TIER_ACCENTS[1],
    }),
    jarProduct({
        id: 'rosin-tier-2',
        category: 'rosin',
        tier: 2,
        name: 'Live Rosin — Tier 2',
        shortName: 'Tier 2',
        railLabelLines: ['Tier 2', 'Live Rosin'],
        description: 'Top-shelf without the top price. Same high-caliber 90u-120u live rosin at a friendlier price.',
        accent: TIER_ACCENTS[2],
    }),
    jarProduct({
        id: 'rosin-tier-3',
        category: 'rosin',
        tier: 3,
        name: 'Live Rosin — Tier 3',
        shortName: 'Tier 3',
        railLabelLines: ['Tier 3', 'Live Rosin'],
        description: 'The perfect balance of craft and value, from high-yielding strains that still bring elite flavor and potency.',
        accent: TIER_ACCENTS[3],
    }),
    jarProduct({
        id: 'rosin-tier-4',
        category: 'rosin',
        tier: 4,
        name: 'Live Rosin — Tier 4',
        shortName: 'Tier 4',
        railLabelLines: ['Tier 4', 'Live Rosin'],
        description: 'The most affordable way to experience true solventless excellence, pressed from 90u-160u.',
        accent: TIER_ACCENTS[4],
    }),
    jarProduct({
        id: 'resin-tier-1',
        category: 'resin',
        tier: 1,
        name: 'Live Resin — Tier 1',
        shortName: 'Tier 1',
        railLabelLines: ['Tier 1', 'Live Resin'],
        description: 'Premium spectrum sauce — clean, flavorful diamonds drenched in terp-loaded sauce from rare, farm-direct genetics.',
        accent: TIER_ACCENTS[1],
    }),
    jarProduct({
        id: 'resin-tier-2',
        category: 'resin',
        tier: 2,
        name: 'Live Resin — Tier 2',
        shortName: 'Tier 2',
        railLabelLines: ['Tier 2', 'Live Resin'],
        description: 'Craft resin with a punch — nearly Tier 1 flavor and effects from high-yielding cultivars, at a more accessible price.',
        accent: TIER_ACCENTS[2],
    }),
    jarProduct({
        id: 'resin-tier-3',
        category: 'resin',
        tier: 3,
        name: 'Live Resin — Tier 3',
        shortName: 'Tier 3',
        railLabelLines: ['Tier 3', 'Live Resin'],
        description: 'The everyday essential — solid flavor and dependable potency for your daily dab.',
        accent: TIER_ACCENTS[3],
    }),
    jarProduct({
        id: 'resin-tier-4',
        category: 'resin',
        tier: 4,
        name: 'Live Resin — Tier 4',
        shortName: 'Tier 4',
        railLabelLines: ['Tier 4', 'Live Resin'],
        description: 'The budget banger — full-spectrum resin that still delivers on flavor and effect.',
        accent: TIER_ACCENTS[4],
    }),
    {
        id: 'vape-510',
        category: 'vape',
        tier: null,
        name: '510 Thread Live Resin Vape',
        shortName: '510 Vape',
        railLabelLines: VAPE_RAIL_LINES,
        railLabel: VAPE_RAIL_LINES.join(' '),
        interactionType: 'extract',
        modelType: 'vapePackage',
        modelPath: null,
        description: '100% live resin, distillate-free, delivered through medical-grade ceramic hardware for true-to-strain flavor.',
        accent: '#81CBD2',
        materialVariant: 'standard',
        initialCameraPosition: [0, 0.55, 3.6],
        focusCameraPosition: [0, 1.5, 1.5],
        orbitTarget: [0, 0.15, 0],
        scale: 1,
        entryDirection: 'right',
        exitDirection: 'left',
        supportsOpen: false,
        supportsExtraction: true,
    },
    {
        id: 'ampersand',
        category: 'ampersand',
        tier: null,
        name: 'Ampersand Fast-Acting Ingestible',
        shortName: 'Ampersand',
        railLabelLines: AMPERSAND_RAIL_LINES,
        railLabel: AMPERSAND_RAIL_LINES.join(' '),
        interactionType: 'reveal',
        modelType: 'ampersandPackage',
        modelPath: null,
        description: 'A zero-calorie, zero-sugar edible live rosin concentrate that melts on your tongue for a fast, predictable lift.',
        accent: '#FFE032',
        materialVariant: 'standard',
        initialCameraPosition: [0, 0.6, 3.3],
        focusCameraPosition: [0, 1.35, 1.1],
        orbitTarget: [0, 0.1, 0],
        scale: 1,
        entryDirection: 'right',
        exitDirection: 'left',
        supportsOpen: true,
        supportsExtraction: false,
    },
];

export function getProductById(id) {
    return PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
}

export function getProductsByCategory(category) {
    return PRODUCTS.filter((p) => p.category === category);
}

export function getDefaultProductForCategory(category) {
    const products = getProductsByCategory(category);
    return products[0] || PRODUCTS[0];
}

export function getProductByCategoryAndTier(category, tier) {
    return PRODUCTS.find((p) => p.category === category && p.tier === tier) || getDefaultProductForCategory(category);
}

export function getAdjacentProduct(currentId, direction) {
    const index = PRODUCTS.findIndex((p) => p.id === currentId);
    if (index === -1) return PRODUCTS[0];
    const nextIndex = (index + direction + PRODUCTS.length) % PRODUCTS.length;
    return PRODUCTS[nextIndex];
}

/**
 * Derives a restrained jar material variant from product config. Keeps
 * all jar-specific visual branching in one place instead of scattered
 * across PlaceholderJar/JarScene.
 */
export function resolveJarVariant(product) {
    const isSpecialized = product.materialVariant === 'specialized';
    return {
        glassColor: isSpecialized ? '#0e1210' : '#1a1d1f',
        labelColor: isSpecialized ? '#1c1f1d' : '#2a2d30',
        lidColor: isSpecialized ? '#08090a' : '#0d0f10',
        lidMetalness: isSpecialized ? 0.75 : 0.55,
        productColor: isSpecialized ? '#3a2a14' : '#b5751f',
        accent: product.accent,
        scale: product.scale ?? 1,
    };
}

const TRANSITION_POSES = {
    left: { position: [-2.4, 0, 0.4], rotationY: -0.55 },
    right: { position: [2.4, 0, 0.4], rotationY: 0.55 },
    back: { position: [0, -0.3, -2.0], rotationY: 0.25 },
};

export function getTransitionPose(direction) {
    return TRANSITION_POSES[direction] || TRANSITION_POSES.left;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpVec3(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

// On mobile the canvas is roughly square instead of 4:3, so pulling the
// camera in toward its target is a deliberate reframe, not just a CSS
// scale-down of the desktop composition.
const MOBILE_PULL = 0.2;

/**
 * Builds the named camera views CameraController understands, purely
 * from product config. CameraController never needs to know which
 * product is active — only this resolved object.
 */
export function buildCameraViews(product, { mobile = false } = {}) {
    const target = product.orbitTarget;
    const focusPosition = product.focusCameraPosition;
    const closerFocus = lerpVec3(focusPosition, [target[0], target[1] + 0.3, target[2]], 0.35);

    const views = {
        inspecting: { position: product.initialCameraPosition, target },
        open: { position: focusPosition, target },
        productFocus: { position: closerFocus, target },
    };

    if (!mobile) return views;

    return {
        inspecting: { position: lerpVec3(views.inspecting.position, target, MOBILE_PULL), target },
        open: { position: lerpVec3(views.open.position, target, MOBILE_PULL), target },
        productFocus: { position: lerpVec3(views.productFocus.position, target, MOBILE_PULL), target },
    };
}
