import * as THREE from "three";

export class LightingRig {
  readonly group = new THREE.Group();

  readonly ambient: THREE.AmbientLight;

  readonly key: THREE.DirectionalLight;

  readonly fill: THREE.DirectionalLight;

  readonly rim: THREE.DirectionalLight;

  readonly bounce: THREE.PointLight;

  constructor() {
    /*
    ------------------------------------------------------------------

    AMBIENT

    ------------------------------------------------------------------
    */

    this.ambient = new THREE.AmbientLight(
      0xf8efe2,
      0.55
    );

    this.group.add(this.ambient);

    /*
    ------------------------------------------------------------------

    KEY LIGHT

    ------------------------------------------------------------------
    */

    this.key = new THREE.DirectionalLight(
      0xfff3de,
      2.4
    );

    this.key.position.set(
      3.5,
      4.8,
      4.2
    );

    this.key.castShadow = true;

    this.key.shadow.mapSize.set(
      2048,
      2048
    );

    this.key.shadow.bias = -0.00008;

    this.key.shadow.radius = 6;

    this.key.shadow.camera.left = -5;
    this.key.shadow.camera.right = 5;
    this.key.shadow.camera.top = 5;
    this.key.shadow.camera.bottom = -5;

    this.group.add(this.key);

    /*
    ------------------------------------------------------------------

    FILL LIGHT

    ------------------------------------------------------------------
    */

    this.fill = new THREE.DirectionalLight(
      0xdceeff,
      0.65
    );

    this.fill.position.set(
      -4,
      2.8,
      3
    );

    this.group.add(this.fill);

    /*
    ------------------------------------------------------------------

    RIM

    ------------------------------------------------------------------
    */

    this.rim = new THREE.DirectionalLight(
      0xffb96a,
      1.2
    );

    this.rim.position.set(
      -3,
      2,
      -4
    );

    this.group.add(this.rim);

    /*
    ------------------------------------------------------------------

    BOUNCE

    ------------------------------------------------------------------
    */

    this.bounce = new THREE.PointLight(
      0xffdcb5,
      0.55,
      12
    );

    this.bounce.position.set(
      0,
      -2,
      3
    );

    this.group.add(this.bounce);
  }

  addTo(scene: THREE.Scene) {
    scene.add(this.group);
  }

  update(time: number) {
    /*
    Tiny breathing motion.

    Enough to feel alive.

    Not enough to notice.
    */

    this.key.position.x =
      3.5 + Math.sin(time * 0.18) * 0.08;

    this.key.position.y =
      4.8 + Math.cos(time * 0.15) * 0.05;

    this.rim.intensity =
      1.15 + Math.sin(time * 0.4) * 0.04;
  }

  dispose() {
    this.group.removeFromParent();
  }
}