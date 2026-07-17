import * as THREE from "three";

export interface CameraRigOptions {
  fov?: number;
  near?: number;
  far?: number;

  position?: THREE.Vector3;
  target?: THREE.Vector3;
}

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  readonly rig: THREE.Group;

  readonly target: THREE.Vector3;

  constructor({
    fov = 24,
    near = 0.1,
    far = 100,

    position = new THREE.Vector3(0, 0.15, 5),

    target = new THREE.Vector3(0, 0.15, 0),
  }: CameraRigOptions = {}) {
    this.camera = new THREE.PerspectiveCamera(
      fov,
      1,
      near,
      far
    );

    this.rig = new THREE.Group();

    this.rig.position.copy(position);

    this.rig.add(this.camera);

    this.camera.position.set(0, 0, 0);

    this.target = target.clone();

    this.update();
  }

  setAspect(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  setPosition(
    x: number,
    y: number,
    z: number
  ) {
    this.rig.position.set(x, y, z);
  }

  move(
    dx: number,
    dy: number,
    dz: number
  ) {
    this.rig.position.x += dx;
    this.rig.position.y += dy;
    this.rig.position.z += dz;
  }

  lerpTo(
    x: number,
    y: number,
    z: number,
    alpha = 0.08
  ) {
    this.rig.position.lerp(
      new THREE.Vector3(x, y, z),
      alpha
    );
  }

  setTarget(
    x: number,
    y: number,
    z: number
  ) {
    this.target.set(x, y, z);
  }

  reset() {
    this.rig.position.set(0, 0.15, 5);
    this.target.set(0, 0.15, 0);
    this.update();
  }

  update() {
    this.rig.lookAt(this.target);
  }

  viewportHeight(distance = 5) {
    const fov = THREE.MathUtils.degToRad(this.camera.fov);

    return 2 * Math.tan(fov / 2) * distance;
  }
}