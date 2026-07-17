import * as THREE from "three";

export const COLORS = {
  white: "#F8F6F2",
  dark: "#2E2A26",
  warmSheen: "#FFE4BF",
};

export interface ClayMaterialOptions
  extends Partial<THREE.MeshPhysicalMaterialParameters> {
  color: THREE.ColorRepresentation;
}

export function createClayMaterial({
  color,
  ...rest
}: ClayMaterialOptions): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,

    // Base clay look
    roughness: 0.68,
    metalness: 0,

    // Soft highlights
    clearcoat: 0.12,
    clearcoatRoughness: 0.42,

    // Warm ceramic sheen
    sheen: 0.45,
    sheenColor: new THREE.Color(COLORS.warmSheen),
    sheenRoughness: 0.82,

    envMapIntensity: 0.65,

    side: THREE.FrontSide,

    ...rest,
  });
}

/* -------------------------------------------------------------------------- */
/*                                  SKIN                                      */
/* -------------------------------------------------------------------------- */

export function createSkinMaterial(
  color: THREE.ColorRepresentation
): THREE.MeshPhysicalMaterial {
  return createClayMaterial({
    color,

    roughness: 0.74,

    sheen: 0.58,

    clearcoat: 0.08,
  });
}

/* -------------------------------------------------------------------------- */
/*                                   HAIR                                     */
/* -------------------------------------------------------------------------- */

export function createHairMaterial(
  color: THREE.ColorRepresentation
): THREE.MeshPhysicalMaterial {
  return createClayMaterial({
    color,

    roughness: 0.82,

    sheen: 0.18,

    clearcoat: 0.02,
  });
}

/* -------------------------------------------------------------------------- */
/*                                 CLOTHING                                   */
/* -------------------------------------------------------------------------- */

export function createClothMaterial(
  color: THREE.ColorRepresentation
): THREE.MeshPhysicalMaterial {
  return createClayMaterial({
    color,

    roughness: 0.90,

    sheen: 0.10,

    clearcoat: 0,
  });
}

/* -------------------------------------------------------------------------- */
/*                                  GLASSES                                   */
/* -------------------------------------------------------------------------- */

export function createPlasticMaterial(
  color: THREE.ColorRepresentation
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,

    roughness: 0.28,

    metalness: 0,

    clearcoat: 1,

    clearcoatRoughness: 0.06,
  });
}

/* -------------------------------------------------------------------------- */
/*                                   WHITE                                    */
/* -------------------------------------------------------------------------- */

export function createWhiteMaterial(): THREE.MeshPhysicalMaterial {
  return createClayMaterial({
    color: COLORS.white,

    roughness: 0.62,
  });
}

/* -------------------------------------------------------------------------- */
/*                                   DARK                                     */
/* -------------------------------------------------------------------------- */

export function createDarkMaterial(): THREE.MeshPhysicalMaterial {
  return createClayMaterial({
    color: COLORS.dark,

    roughness: 0.72,
  });
}

/* -------------------------------------------------------------------------- */
/*                                  ACCENT                                    */
/* -------------------------------------------------------------------------- */

export function createAccentMaterial(
  color: THREE.ColorRepresentation
): THREE.MeshPhysicalMaterial {
  return createClayMaterial({
    color,

    roughness: 0.56,

    sheen: 0.34,
  });
}

/* -------------------------------------------------------------------------- */
/*                                EXPORT GROUP                                */
/* -------------------------------------------------------------------------- */

export const Materials = {
  createClayMaterial,

  createSkinMaterial,

  createHairMaterial,

  createClothMaterial,

  createPlasticMaterial,

  createWhiteMaterial,

  createDarkMaterial,

  createAccentMaterial,
};