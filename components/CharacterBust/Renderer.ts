import * as THREE from "three";

import { CameraRig } from "./Camera";
import { LightingRig } from "./Lights";
import { SpringVec2 } from "./Spring";

export class CharacterRenderer {
  readonly canvas: HTMLCanvasElement;

  readonly renderer: THREE.WebGLRenderer;

  readonly scene: THREE.Scene;

  readonly camera: CameraRig;

  readonly lights: LightingRig;

  readonly clock = new THREE.Clock();

  readonly pointer = new SpringVec2(120, 18);

  private animationId = 0;

  private width = 1;
  private height = 1;

  private mouse = new THREE.Vector2();

  private resizeObserver?: ResizeObserver;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    /*
    ------------------------------------------------------

    Scene

    ------------------------------------------------------
    */

    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color("#F7F4EF");

    /*
    ------------------------------------------------------

    Renderer

    ------------------------------------------------------
    */

    this.renderer = new THREE.WebGLRenderer({
      canvas,

      antialias: true,

      alpha: true,

      powerPreference: "high-performance",
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure = 1.05;

    /*
    ------------------------------------------------------

    Camera

    ------------------------------------------------------
    */

    this.camera = new CameraRig();

    this.scene.add(this.camera.rig);

    /*
    ------------------------------------------------------

    Lights

    ------------------------------------------------------
    */

    this.lights = new LightingRig();

    this.lights.addTo(this.scene);

    /*
    ------------------------------------------------------

    Resize

    ------------------------------------------------------
    */

    this.resize();

    this.resizeObserver =
      new ResizeObserver(() => this.resize());

    this.resizeObserver.observe(canvas);

    /*
    ------------------------------------------------------

    Pointer

    ------------------------------------------------------
    */

    canvas.addEventListener(
      "pointermove",
      this.onPointerMove
    );

    canvas.addEventListener(
      "pointerleave",
      this.onPointerLeave
    );
  }

  /*
  --------------------------------------------------------

  POINTER

  --------------------------------------------------------
  */

  private onPointerMove = (
    e: PointerEvent
  ) => {
    const rect =
      this.canvas.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width) *
        2 -
      1;

    const y =
      -(
        ((e.clientY - rect.top) /
          rect.height) *
          2 -
        1
      );

    this.mouse.set(x, y);
  };

  private onPointerLeave = () => {
    this.mouse.set(0, 0);
  };
  

  /*
--------------------------------------------------------

PUBLIC API

--------------------------------------------------------
*/

add(object: THREE.Object3D) {
  this.scene.add(object);
  this.mountedObjects.push(object);
}

remove(object: THREE.Object3D) {
  this.scene.remove(object);

  this.mountedObjects =
    this.mountedObjects.filter(o => o !== object);
}

clear() {
  this.mountedObjects.forEach((obj) => {
    this.scene.remove(obj);
  });

  this.mountedObjects = [];
}

/*
--------------------------------------------------------

START

--------------------------------------------------------
*/

start() {
  this.clock.start();

  this.animate();
}

stop() {
  cancelAnimationFrame(this.animationId);
}

private animate = () => {
  this.animationId =
    requestAnimationFrame(this.animate);

  const dt = Math.min(
    this.clock.getDelta(),
    1 / 30
  );

  const elapsed =
    this.clock.getElapsedTime();

  /*
  --------------------------------------------

  Springs

  --------------------------------------------
  */

  this.pointer.set(
    this.mouse.x,
    this.mouse.y
  );

  this.pointer.update(dt);

  /*
  --------------------------------------------

  Breathing

  --------------------------------------------
  */

  this.breathing =
    Math.sin(elapsed * 1.15) * 0.015;

  /*
  --------------------------------------------

  Lights

  --------------------------------------------
  */

  this.lights.update(elapsed);

  /*
  --------------------------------------------

  Camera

  --------------------------------------------
  */

  this.camera.setTarget(
    this.pointer.x.get() * 0.18,

    0.15 +
      this.pointer.y.get() * 0.12,

    0
  );

  this.camera.update();

  /*
  --------------------------------------------

  User Objects

  --------------------------------------------
  */

  this.mountedObjects.forEach((object) => {
    object.rotation.y =
      this.pointer.x.get() * 0.35;

    object.rotation.x =
      -this.pointer.y.get() * 0.18;

    object.position.y = this.breathing;
  });

  /*
  --------------------------------------------

  Render

  --------------------------------------------
  */

  this.renderer.render(
    this.scene,
    this.camera.camera
  );
};




private resize() {
  const rect =
    this.canvas.getBoundingClientRect();

  this.width = Math.max(1, rect.width);

  this.height = Math.max(1, rect.height);

  this.renderer.setSize(
    this.width,
    this.height,
    false
  );

  this.camera.setAspect(
    this.width,
    this.height
  );
}

dispose() {
  this.stop();

  this.resizeObserver?.disconnect();

  this.canvas.removeEventListener(
    "pointermove",
    this.onPointerMove
  );

  this.canvas.removeEventListener(
    "pointerleave",
    this.onPointerLeave
  );

  this.renderer.dispose();

  this.clear();

  this.lights.dispose();
}