import JarScene from './JarScene';
import VapeScene from './VapeScene';
import AmpersandScene from './AmpersandScene';

/**
 * modelType -> scene component. Every entry must accept the same prop
 * contract: { product, interactionState, interactionGo, transitionReady,
 * reducedMotion }. ProductStage picks a component from here and never
 * branches on product id/category itself.
 */
export const MODEL_REGISTRY = {
    jar: JarScene,
    vapePackage: VapeScene,
    ampersandPackage: AmpersandScene,
};
