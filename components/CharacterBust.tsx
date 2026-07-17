"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { BustParams } from "@/lib/characters";

// ---------- tiny seeded value-noise (no external deps) ----------
function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}
function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}
function smoothNoise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const c000 = hash3(xi, yi, zi), c100 = hash3(xi + 1, yi, zi);
  const c010 = hash3(xi, yi + 1, zi), c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1), c101 = hash3(xi + 1, yi, zi + 1);
  const c011 = hash3(xi, yi + 1, zi + 1), c111 = hash3(xi + 1, yi + 1, zi + 1);
  const x00 = lerp(c000, c100, u), x10 = lerp(c010, c110, u);
  const x01 = lerp(c001, c101, u), x11 = lerp(c011, c111, u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
}

function weldGeometry(geo: THREE.BufferGeometry, tolerance = 1e-4): THREE.BufferGeometry {
  const posAttr = geo.getAttribute("position");
  const count = posAttr.count;
  const shift = 1 / tolerance;
  const hashToIndex = new Map<string, number>();
  const newPositions: number[] = [];
  const remap = new Int32Array(count);

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i), y = posAttr.getY(i), z = posAttr.getZ(i);
    const key = `${Math.round(x * shift)}_${Math.round(y * shift)}_${Math.round(z * shift)}`;
    let idx = hashToIndex.get(key);
    if (idx === undefined) {
      idx = newPositions.length / 3;
      hashToIndex.set(key, idx);
      newPositions.push(x, y, z);
    }
    remap[i] = idx;
  }

  const newIndices: number[] = [];
  const indexAttr = geo.getIndex();
  if (indexAttr) {
    for (let i = 0; i < indexAttr.count; i++) newIndices.push(remap[indexAttr.getX(i)]);
  } else {
    for (let i = 0; i < count; i++) newIndices.push(remap[i]);
  }

  const welded = new THREE.BufferGeometry();
  welded.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
  welded.setIndex(newIndices);
  welded.computeVertexNormals();
  return welded;
}

function clayify(geo: THREE.BufferGeometry, amplitude = 0.02, scale = 3, seed = 0) {
  const g = weldGeometry(geo);
  const pos = g.attributes.position;
  const norm = g.attributes.normal;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(norm, i);
    const noise = smoothNoise(v.x * scale + seed, v.y * scale + seed * 1.7, v.z * scale + seed * 2.3) - 0.5;
    v.addScaledVector(n, noise * amplitude);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

function withOffset(mat: THREE.MeshPhysicalMaterial, factor = -2) {
  const m = mat.clone();
  m.polygonOffset = true;
  m.polygonOffsetFactor = factor;
  m.polygonOffsetUnits = factor;
  return m;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function clayMat(color: THREE.ColorRepresentation, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.32,
    ...extra,
  });
}

function roundedBox(w: number, h: number, d: number, r = 0.12) {
  const hw = w / 2, hd = d / 2, rr = Math.min(r, hw - 0.001, hd - 0.001);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + rr, -hd);
  shape.lineTo(hw - rr, -hd); shape.quadraticCurveTo(hw, -hd, hw, -hd + rr);
  shape.lineTo(hw, hd - rr); shape.quadraticCurveTo(hw, hd, hw - rr, hd);
  shape.lineTo(-hw + rr, hd); shape.quadraticCurveTo(-hw, hd, -hw, hd - rr);
  shape.lineTo(-hw, -hd + rr); shape.quadraticCurveTo(-hw, -hd, -hw + rr, -hd);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: Math.min(0.09, r * 0.65),
    bevelThickness: Math.min(0.09, r * 0.65),
    curveSegments: 14,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, h / 2, 0);
  return geo;
}

export default function CharacterBust({
  params,
  accent,
  seed = 0,
}: {
  params: BustParams;
  accent: string;
  seed?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const rand = seededRandom(seed || 1);
    const jitter = (amt: number) => (rand() - 0.5) * 2 * amt * 0.22;

    const SKIN = 0xe6b98d;
    const SKIN_SHADE = 0xd6a878;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0.2, 4.7);

    scene.add(new THREE.HemisphereLight(0xfff3d6, 0x8a6a4a, 0.7));
    const key = new THREE.DirectionalLight(0xfff2da, 0.95);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0015;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 3;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff9d4d, 0.9);
    rim.position.set(-2.6, 1.6, -3.2);
    scene.add(rim);
    const rimFill = new THREE.PointLight(0xffb066, 0.35, 8);
    rimFill.position.set(-1.5, 0.6, -1.8);
    scene.add(rimFill);

    const shadowFloor = new THREE.Mesh(
      new THREE.CircleGeometry(1.7, 40),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = -1.79;
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);

    const skinMat = clayMat(SKIN);
    const skinShadeMat = clayMat(SKIN_SHADE);
    const accentColor = new THREE.Color(accent);
    const accentMat = clayMat(accentColor);
    const hairMat = clayMat(params.hairColor, { roughness: 0.45 });
    const darkMat = clayMat(0x2a2620, { roughness: 0.4 });
    const whiteMat = clayMat(0xf6f1e8, { roughness: 0.4 });
    const topMat = clayMat(params.topColor);
    const topSecondaryMat = params.topColorSecondary ? clayMat(params.topColorSecondary) : null;
    const skinOverlayMat = withOffset(skinMat, -2);
    const skinShadeOverlayMat = withOffset(skinShadeMat, -2);
    const whiteOverlayMat = withOffset(whiteMat, -4);

    function castReceive(o: THREE.Object3D) {
      o.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          (c as THREE.Mesh).castShadow = true;
          (c as THREE.Mesh).receiveShadow = true;
        }
      });
      return o;
    }

    const plinth = new THREE.Mesh(
      clayify(new THREE.CylinderGeometry(1.02, 1.22, 0.36, 28, 3), 0.02, 2.4, seed + 11),
      skinShadeMat
    );
    plinth.position.y = -1.62;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const rig = new THREE.Group();
    scene.add(rig);

    const torso = new THREE.Mesh(clayify(roundedBox(1.4, 0.98, 0.8, 0.42), 0.015, 3, seed + 1), skinMat);
    torso.scale.set(1 + jitter(0.03), 1 + jitter(0.02), 1 + jitter(0.03));
    torso.position.y = -1.32;
    torso.rotation.z = jitter(0.03);
    rig.add(torso);

    const top = new THREE.Mesh(clayify(roundedBox(1.46, 0.5, 0.86, 0.34), 0.014, 3.4, seed + 2), topMat);
    top.scale.set(1 + jitter(0.025), 1, 1 + jitter(0.025));
    top.position.y = -1.14;
    rig.add(top);

    if (params.topStyle === "turtleneck") {
      const collar = new THREE.Mesh(clayify(new THREE.TorusGeometry(0.26, 0.085, 12, 24), 0.015, 4, seed + 20), topSecondaryMat ?? topMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = -0.82;
      rig.add(collar);
    }
    if (params.topStyle === "jacket" && topSecondaryMat) {
      for (const side of [-1, 1]) {
        const trim = new THREE.Mesh(clayify(roundedBox(0.11, 0.46, 0.06, 0.05), 0.012, 5, seed + 30 + side), topSecondaryMat);
        trim.position.set(side * 0.28, -0.98, 0.44);
        trim.rotation.z = side * 0.1;
        rig.add(trim);
      }
    }

    function addAccent() {
      switch (params.accent) {
        case "collar-block": {
          const stripe = new THREE.Mesh(clayify(roundedBox(0.46, 0.32, 0.08, 0.1), 0.015, 5, seed + 40), accentMat);
          stripe.position.set(0, -0.95, 0.43);
          stripe.rotation.x = -0.05;
          rig.add(stripe);
          break;
        }
        case "id-badge": {
          const badge = new THREE.Mesh(clayify(roundedBox(0.17, 0.22, 0.03, 0.05), 0.012, 6, seed + 41), accentMat);
          badge.position.set(-0.3, -0.88, 0.44);
          badge.rotation.z = jitter(0.1);
          rig.add(badge);
          break;
        }
        case "collar-knot": {
          for (const side of [-1, 1]) {
            const lobe = new THREE.Mesh(clayify(new THREE.SphereGeometry(0.09, 14, 14), 0.008, 6, seed + 45 + side), accentMat);
            lobe.scale.set(1.3, 0.75, 0.55);
            lobe.position.set(side * 0.1, -0.68, 0.45);
            lobe.rotation.z = side * 0.35;
            rig.add(lobe);
          }
          const knot = new THREE.Mesh(clayify(new THREE.SphereGeometry(0.045, 12, 12), 0.006, 6, seed + 47), accentMat);
          knot.position.set(0, -0.68, 0.47);
          rig.add(knot);
          break;
        }
        case "chain": {
          for (let i = 0; i < 5; i++) {
            const link = new THREE.Mesh(new THREE.TorusGeometry(0.047, 0.015, 8, 16), accentMat);
            const t = i / 4;
            link.position.set((t - 0.5) * 0.3, -0.72 + Math.sin(t * Math.PI) * 0.08, 0.46);
            link.rotation.z = Math.PI / 2;
            rig.add(link);
          }
          break;
        }
        case "vest-diamond": {
          for (const [dx, dy] of [[-0.17, -0.82], [0.17, -0.82], [0, -0.98], [-0.17, -1.12], [0.17, -1.12]]) {
            const d = new THREE.Mesh(clayify(roundedBox(0.16, 0.16, 0.04, 0.03), 0.01, 6, seed + dx * 10 + dy), accentMat);
            d.position.set(dx, dy, 0.43);
            d.rotation.z = Math.PI / 4;
            rig.add(d);
          }
          break;
        }
        case "track-stripes": {
          for (const side of [-1, 1]) {
            const stripe = new THREE.Mesh(clayify(roundedBox(0.1, 0.8, 0.06, 0.04), 0.01, 6, seed + 50 + side), accentMat);
            stripe.position.set(side * 0.62, -0.65, 0.35);
            stripe.rotation.y = side * 0.5;
            rig.add(stripe);
          }
          break;
        }
        case "turtleneck-fold": {
          const fold = new THREE.Mesh(clayify(new THREE.TorusGeometry(0.28, 0.05, 10, 24), 0.012, 5, seed + 51), accentMat);
          fold.rotation.x = Math.PI / 2;
          fold.position.y = -0.76;
          rig.add(fold);
          break;
        }
      }
    }
    addAccent();

    const propGroup = new THREE.Group();
    function addProp() {
      switch (params.prop) {
        case "orbit-ring": {
          const ring = new THREE.Mesh(clayify(new THREE.TorusGeometry(0.17, 0.02, 10, 36), 0.008, 6, seed + 60), accentMat);
          ring.rotation.x = Math.PI / 2.4;
          propGroup.add(ring);
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), accentMat);
          dot.position.set(0.17, 0, 0);
          propGroup.add(dot);
          break;
        }
        case "id-badge": {
          propGroup.add(new THREE.Mesh(clayify(roundedBox(0.17, 0.23, 0.03, 0.04), 0.01, 6, seed + 61), accentMat));
          break;
        }
        case "coffee-cup": {
          const cup = new THREE.Mesh(clayify(new THREE.CylinderGeometry(0.075, 0.06, 0.14, 16), 0.008, 5, seed + 62), accentMat);
          propGroup.add(cup);
          const handle = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.014, 8, 16), accentMat);
          handle.position.set(0.095, 0, 0);
          handle.rotation.y = Math.PI / 2;
          propGroup.add(handle);
          break;
        }
        case "medallion": {
          const disc = new THREE.Mesh(clayify(new THREE.CylinderGeometry(0.095, 0.095, 0.025, 24), 0.008, 6, seed + 63), accentMat);
          disc.rotation.x = Math.PI / 2;
          propGroup.add(disc);
          break;
        }
        case "telescope": {
          const tube = new THREE.Mesh(clayify(new THREE.CylinderGeometry(0.032, 0.048, 0.33, 12), 0.008, 6, seed + 64), accentMat);
          tube.rotation.z = Math.PI / 3;
          propGroup.add(tube);
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.048, 0), accentMat);
          star.position.set(0.16, 0.14, 0);
          propGroup.add(star);
          break;
        }
      }
    }
    addProp();
    propGroup.position.set(0, 1.05, 0.15);
    propGroup.scale.setScalar(1.05);
    scene.add(propGroup);

    const head = new THREE.Group();
    head.position.y = -0.15;
    scene.add(head);

    const neck = new THREE.Mesh(clayify(new THREE.CylinderGeometry(0.24, 0.3, 0.26, 20, 3), 0.012, 4, seed + 3), skinMat);
    neck.position.y = -0.5;
    head.add(neck);

    const neckAO = new THREE.Mesh(
      new THREE.TorusGeometry(0.27, 0.05, 10, 28),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.14, depthWrite: false })
    );
    neckAO.rotation.x = Math.PI / 2;
    neckAO.position.y = -0.63;
    head.add(neckAO);

    const skullGeo = new THREE.IcosahedronGeometry(0.58, 4);
    skullGeo.scale(1.04, 1.16, 0.98);
    clayify(skullGeo, 0.011, 4, seed + 4);
    const skull = new THREE.Mesh(skullGeo, skinMat);
    skull.position.y = 0.06;
    head.add(skull);

    const jaw = new THREE.Mesh(clayify(new THREE.SphereGeometry(0.34, 20, 20), 0.014, 4, seed + 15), skinOverlayMat);
    jaw.scale.set(1.05, 0.62, 0.92);
    jaw.position.set(0, -0.32, 0.05);
    head.add(jaw);

    const noseBridge = new THREE.Mesh(clayify(new THREE.SphereGeometry(0.11, 14, 14), 0.008, 5, seed + 14), skinOverlayMat);
    noseBridge.scale.set(0.7, 1, 1.15);
    noseBridge.position.set(0, 0.08, 0.48);
    head.add(noseBridge);
    const noseBulb = new THREE.Mesh(clayify(new THREE.SphereGeometry(0.15, 18, 18), 0.012, 5, seed + 141), skinOverlayMat);
    noseBulb.scale.set(1.02, 0.92, 0.98);
    noseBulb.position.set(0, -0.04, 0.63);
    head.add(noseBulb);

    function addEye(side: number) {
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 20), whiteMat);
      sclera.scale.set(1, 1.08, 0.8);
      sclera.position.set(side * 0.25, 0.21, 0.46);
      head.add(sclera);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), darkMat);
      pupil.position.set(side * 0.25 + side * 0.012, 0.2, 0.575);
      head.add(pupil);
      const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), whiteMat);
      highlight.position.set(side * 0.25 + side * 0.03, 0.22, 0.615);
      head.add(highlight);
      const brow = new THREE.Mesh(clayify(roundedBox(0.24, 0.06, 0.09, 0.025), 0.01, 6, seed + 70 + side), skinShadeOverlayMat);
      brow.position.set(side * 0.25, 0.34, 0.47);
      brow.rotation.z = side * 0.06;
      head.add(brow);
    }
    addEye(-1);
    addEye(1);

    const mouthArc = Math.PI * 0.85;
    const mouthGroove = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.022, 10, 28, mouthArc), darkMat);
    mouthGroove.position.set(0, -0.15, 0.51);
    mouthGroove.rotation.z = -Math.PI / 2 - mouthArc / 2;
    head.add(mouthGroove);
    const teeth = new THREE.Mesh(clayify(roundedBox(0.26, 0.07, 0.05, 0.02), 0.006, 6, seed + 16), whiteOverlayMat);
    teeth.position.set(0, -0.16, 0.52);
    head.add(teeth);

    function addHair() {
      switch (params.hairStyle) {
        case "side-part": {
          const cap = new THREE.Mesh(clayify(roundedBox(0.86, 0.22, 0.8, 0.32), 0.018, 4, seed + 5), hairMat);
          cap.position.y = 0.52;
          head.add(cap);
          const sweep = new THREE.Mesh(clayify(roundedBox(0.32, 0.1, 0.66, 0.15), 0.014, 5, seed + 6), hairMat);
          sweep.position.set(-0.2, 0.42, 0);
          sweep.rotation.z = 0.16;
          head.add(sweep);
          break;
        }
        case "curly": {
          const spots: [number, number][] = [[0, 0], [0.25, 0.16], [-0.25, 0.16], [0.25, -0.16], [-0.25, -0.16], [0, 0.27], [0, -0.27]];
          for (const [dx, dz] of spots) {
            const puff = new THREE.Mesh(clayify(new THREE.SphereGeometry(0.19, 14, 14), 0.02, 5, seed + dx * 20 + dz * 30), hairMat);
            puff.position.set(dx, 0.5, dz);
            head.add(puff);
          }
          break;
        }
        case "ponytail": {
          const cap = new THREE.Mesh(clayify(roundedBox(0.88, 0.2, 0.82, 0.34), 0.018, 4, seed + 7), hairMat);
          cap.position.y = 0.5;
          head.add(cap);
          const tail = new THREE.Mesh(clayify(new THREE.ConeGeometry(0.14, 0.58, 14), 0.014, 4, seed + 8), hairMat);
          tail.position.set(0, 0.12, -0.46);
          tail.rotation.x = Math.PI * 0.44;
          head.add(tail);
          break;
        }
        case "slick": {
          const cap = new THREE.Mesh(clayify(roundedBox(0.84, 0.19, 0.78, 0.3), 0.016, 4, seed + 9), hairMat);
          cap.position.y = 0.5;
          head.add(cap);
          const quiff = new THREE.Mesh(clayify(roundedBox(0.32, 0.13, 0.34, 0.15), 0.014, 5, seed + 10), hairMat);
          quiff.position.set(0, 0.58, 0.22);
          quiff.rotation.x = -0.28;
          head.add(quiff);
          break;
        }
        case "neat": {
          const cap = new THREE.Mesh(clayify(roundedBox(0.84, 0.17, 0.78, 0.3), 0.016, 4, seed + 12), hairMat);
          cap.position.y = 0.49;
          head.add(cap);
          break;
        }
      }
    }
    addHair();

    if (params.glasses) {
      const frameGeo = new THREE.TorusGeometry(0.11, 0.018, 10, 20);
      const l = new THREE.Mesh(frameGeo, darkMat);
      l.position.set(-0.24, 0.2, 0.5);
      head.add(l);
      const r = new THREE.Mesh(frameGeo, darkMat);
      r.position.set(0.24, 0.2, 0.5);
      head.add(r);
      const bridge = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), darkMat);
      bridge.scale.set(3.2, 0.6, 0.6);
      bridge.position.set(0, 0.2, 0.5);
      head.add(bridge);
    }

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(clayify(new THREE.SphereGeometry(0.13, 14, 14), 0.01, 5, seed + 80 + side), skinOverlayMat);
      ear.scale.set(0.55, 1, 0.85);
      ear.position.set(side * 0.56, 0.08, 0.02);
      ear.rotation.y = side * 0.3;
      head.add(ear);
    }

    castReceive(rig);
    castReceive(head);
    propGroup.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).receiveShadow = true;
    });

    let targetYaw = 0, targetPitch = 0, curYaw = 0, curPitch = 0;
    function onPointerMove(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetYaw = THREE.MathUtils.clamp(-nx * 0.5, -0.5, 0.5);
      targetPitch = THREE.MathUtils.clamp(ny * 0.22, -0.22, 0.22);
    }
    window.addEventListener("pointermove", onPointerMove);

    function resize() {
      const w = mount!.clientWidth, h = mount!.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let raf = 0, t0 = 0, lastT = 0;
    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      const t = now / 1000;
      if (!t0) { t0 = t; lastT = t; }
      const dt = Math.min(0.05, t - lastT);
      lastT = t;
      const smooth = 1 - Math.pow(0.001, dt);
      curYaw += (targetYaw - curYaw) * smooth;
      curPitch += (targetPitch - curPitch) * smooth;
      head.rotation.y = curYaw;
      head.rotation.x = curPitch;
      head.position.y = -0.15 + Math.sin((t - t0) * 1.1) * 0.012;
      propGroup.position.y = 1.05 + Math.sin((t - t0) * 1.6) * 0.05;
      propGroup.rotation.y = (t - t0) * 0.6;
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      if (mount!.contains(renderer.domElement)) mount!.removeChild(renderer.domElement);
    };
  }, [params, accent, seed]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}