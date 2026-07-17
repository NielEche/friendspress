export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export class Spring {
  value: number;
  velocity: number;
  target: number;

  stiffness: number;
  damping: number;
  mass: number;

  constructor(
    initial = 0,
    {
      stiffness = 180,
      damping = 20,
      mass = 1,
    }: SpringOptions = {}
  ) {
    this.value = initial;
    this.target = initial;
    this.velocity = 0;

    this.stiffness = stiffness;
    this.damping = damping;
    this.mass = mass;
  }

  set(target: number) {
    this.target = target;
  }

  jump(value: number) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }

  update(dt: number) {
    const force = this.stiffness * (this.target - this.value);

    const damping = this.damping * this.velocity;

    const accel = (force - damping) / this.mass;

    this.velocity += accel * dt;

    this.value += this.velocity * dt;

    return this.value;
  }

  get() {
    return this.value;
  }
}

export class SpringVec2 {
  x: Spring;
  y: Spring;

  constructor(
    stiffness = 180,
    damping = 20
  ) {
    this.x = new Spring(0, {
      stiffness,
      damping,
    });

    this.y = new Spring(0, {
      stiffness,
      damping,
    });
  }

  set(x: number, y: number) {
    this.x.set(x);
    this.y.set(y);
  }

  update(dt: number) {
    this.x.update(dt);
    this.y.update(dt);
  }
}

export class SpringVec3 {
  x: Spring;
  y: Spring;
  z: Spring;

  constructor(
    stiffness = 180,
    damping = 20
  ) {
    this.x = new Spring(0, {
      stiffness,
      damping,
    });

    this.y = new Spring(0, {
      stiffness,
      damping,
    });

    this.z = new Spring(0, {
      stiffness,
      damping,
    });
  }

  set(
    x: number,
    y: number,
    z: number
  ) {
    this.x.set(x);
    this.y.set(y);
    this.z.set(z);
  }

  update(dt: number) {
    this.x.update(dt);
    this.y.update(dt);
    this.z.update(dt);
  }
}