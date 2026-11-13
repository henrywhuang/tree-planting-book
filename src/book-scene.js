import {
  Group,
  Vector3,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  Texture,
  SRGBColorSpace,
  CircleGeometry,
  RingGeometry,
  CanvasTexture,
  AdditiveBlending,
  DoubleSide,
} from "../vendor/three.module.js";
import {
  scene,
  camera,
  renderer,
  coverHinge,
  openBookAt,
  closeBookAt,
  turnPageAt,
} from "./render/studio.js";
import {
  createCharacter,
  animateCharacter,
  reachWithHand,
  placeFoot,
} from "./render/character.js";
import {
  createRoadScene,
  createSign,
  createComparison,
  createOption,
} from "./render/paper.js";
import { createCelebration } from "./render/celebration.js";
import { createLocomotion } from "./render/locomotion.js";
import { createStageSizer } from "./render/layout.js";
import { visualAssets } from "./content.js";
import { treeCount } from "./progress.js";

export const clamp = (value) => Math.min(1, Math.max(0, value));
export const smooth = (value) => {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const lerp = (from, to, amount) => from + (to - from) * amount;
export const positionsFor = (count) =>
  Array.from(
    { length: count },
    (_, index) => -3.2 + (6.4 * index) / (count - 1),
  );

function disposeObject(object) {
  if (!object) return;
  object.traverse((node) => {
    node.geometry?.dispose();
    const materials = node.material
      ? Array.isArray(node.material)
        ? node.material
        : [node.material]
      : [];
    for (const material of materials) {
      if (!material.userData.shared) material.map?.dispose();
      material.dispose();
    }
  });
  object.removeFromParent();
}

function plantingRing(x) {
  const group = new Group();
  group.position.set(x, 0.115, 0);
  const fill = new Mesh(
    new CircleGeometry(0.29, 40),
    new MeshBasicMaterial({
      color: "#bce880",
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      toneMapped: false,
      side: DoubleSide,
    }),
  );
  const border = new Mesh(
    new RingGeometry(0.29, 0.33, 40),
    new MeshBasicMaterial({
      color: "#f4ffd4",
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      toneMapped: false,
      side: DoubleSide,
    }),
  );
  for (const part of [fill, border]) {
    part.rotation.x = -Math.PI / 2;
    group.add(part);
  }
  return group;
}

function roadGlow(from, to) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, 128);
  for (const [at, color] of [
    [0, "#84ffba00"],
    [0.18, "#b7ffbd88"],
    [0.42, "#fffdefff"],
    [0.58, "#fffdefff"],
    [0.82, "#b7ffbd88"],
    [1, "#84ffba00"],
  ])
    gradient.addColorStop(at, color);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const mesh = new Mesh(
    new PlaneGeometry(to - from - 0.05, 1.08),
    new MeshBasicMaterial({
      map: texture,
      color: "#e0ff94",
      transparent: true,
      opacity: 1,
      depthWrite: false,
      toneMapped: false,
      blending: AdditiveBlending,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set((from + to) / 2, 0.115, 0.02);
  return mesh;
}

export class BookScene {
  static async create(onFootstep) {
    const book = new BookScene();
    book.rings = [];
    book.glows = [];
    book.options = [];
    book.root = new Group();
    book.root.position.y = 0.355;
    scene.add(book.root);
    book.sheet = new Group();
    book.root.add(book.sheet);
    book.actor = await createCharacter("guide");
    book.actor.traverse((node) => {
      node.userData.sizingDecorative = true;
    });
    book.root.add(book.actor);
    book.party = createCelebration(book.root);
    book.locomotion = createLocomotion(onFootstep);
    const image = new Image();
    image.src = visualAssets.cover;
    await image.decode();
    const texture = new Texture(image);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    const cover = new Mesh(
      new PlaneGeometry(4.2, 6),
      new MeshBasicMaterial({ map: texture, toneMapped: false }),
    );
    cover.rotation.x = -Math.PI / 2;
    cover.position.set(2.2, 0.069, 0);
    coverHinge.add(cover);
    book.sizer = createStageSizer({
      scene,
      book: coverHinge.parent,
      contents: [book.root],
    });
    book.resetActor();
    return book;
  }

  resetActor() {
    this.actor.scale.setScalar(0.82);
    this.actor.rotation.set(-0.27, 0, 0);
    this.actor.position.set(-3.6, 0, 1.4);
    this.locomotion.reset(this.actor);
  }

  build(state) {
    for (const child of [...this.sheet.children]) disposeObject(child);
    this.roadScene = null;
    this.chart = null;
    this.sign = null;
    this.rings = [];
    this.glows = [];
    this.options = [];
    this.sheet.scale.setScalar(1);
    this.resetActor();
    if (state.chapter === 4) {
      this.chart = createComparison();
      this.sheet.add(this.chart);
      if (state.discovered) this.setTitle("段数＝棵数－1");
      return;
    }
    const count = treeCount(state);
    const positions = positionsFor(count);
    this.roadScene = createRoadScene(positions, { gaps: true, numbers: true });
    this.sheet.add(this.roadScene.root);
    for (const x of positions) {
      const ring = plantingRing(x);
      this.roadScene.root.add(ring);
      this.rings.push(ring);
    }
    for (let index = 0; index < count - 1; index++) {
      const glow = roadGlow(positions[index], positions[index + 1]);
      this.roadScene.root.add(glow);
      this.glows.push(glow);
    }
    if (state.chapter === 3) this.setTitle(`${count}棵树`);
    if (state.chapter === 5) this.setTitle(`两端都种 ${count}棵树`);
    if (state.chapter === 6) {
      this.setTitle("两端植树歌");
      this.sheet.add(createOption("3棵树 / 2段", 0, 1.14, 2.65, 0.45));
    }
    this.sync(state);
  }

  setTitle(text) {
    disposeObject(this.sign);
    this.sign = createSign(
      text,
      0,
      1.75,
      -1.85,
      text.length > 8 ? 4.3 : 3.7,
      0.58,
    );
    this.sheet.add(this.sign);
  }

  sync(state) {
    if (!this.roadScene) return;
    const count = treeCount(state);
    let planted = Array(count).fill(true);
    let counted = Array(count - 1).fill(false);
    let roadVisible = true;
    if (state.chapter <= 3) {
      ({ planted, counted } = state.lessons[count]);
    } else if (state.chapter === 5) {
      const revealed = ["retry", "result"].includes(state.practice.phase);
      planted.fill(revealed);
      counted.fill(revealed);
      roadVisible = revealed;
    } else if (state.chapter === 6) counted.fill(true);
    const { trees, flags, labels, road } = this.roadScene;
    trees.forEach((tree, index) => {
      tree.visible = planted[index];
      tree.rotation.x = -0.15;
      tree.scale.setScalar(1);
    });
    road.group.visible = roadVisible;
    flags.forEach((flag) => {
      flag.visible = roadVisible && planted.every(Boolean);
    });
    road.bars.forEach((bar, index) => {
      bar.visible = counted[index];
    });
    road.guides.forEach((guide, index) => {
      guide.visible = counted[index];
    });
    labels.forEach((label) => {
      if (/^\d+$/.test(label.text))
        label.object.visible = counted[Number(label.text) - 1];
    });
    this.rings.forEach((ring, index) => {
      ring.visible = state.chapter <= 3 && !planted[index];
    });
    this.glows.forEach((glow, index) => {
      glow.visible =
        state.chapter === 2 &&
        planted.every(Boolean) &&
        index === counted.findIndex((value) => !value);
    });
  }

  clearOptions() {
    this.options?.forEach(disposeObject);
    this.options = [];
  }

  option(label, value, index = 0, total = 3) {
    const wide = label.length > 5;
    const x = (index - (total - 1) / 2) * (wide ? 3.2 : 1.6);
    const width = wide ? 2.9 : total === 3 ? 1.35 : 1.1;
    const option = createOption(label, x, 2, width, 0.72);
    option.userData.value = value;
    this.sheet.add(option);
    this.options.push(option);
    return option;
  }

  revealCount(index) {
    const roadScene = this.roadScene;
    if (!roadScene) return;
    roadScene.road.bars.forEach((bar, at) => {
      if (at <= index) bar.visible = true;
    });
    roadScene.road.guides.forEach((guide, at) => {
      if (at <= index) guide.visible = true;
    });
    roadScene.labels.forEach((label) => {
      if (/^\d+$/.test(label.text) && Number(label.text) <= index + 1)
        label.object.visible = true;
    });
  }

  grow(progress) {
    const t = smooth(progress);
    if (this.chart) {
      this.chart.scale.y = Math.max(0.001, t);
      return;
    }
    if (!this.roadScene) return;
    const road = this.roadScene.road;
    road.floor.scale.x = Math.max(0.001, t);
    road.floor.position.x = -3.2 + 3.2 * t;
    this.roadScene.flags.forEach((flag, index) => {
      flag.scale.y = Math.max(
        0.001,
        smooth((progress - 0.12 - index * 0.08) / 0.72),
      );
    });
    this.roadScene.trees.forEach((tree, index) => {
      if (tree.visible)
        tree.scale.y = Math.max(
          0.001,
          smooth((progress - index * 0.045) / 0.72),
        );
    });
    this.rings.forEach((ring) => {
      ring.scale.setScalar(Math.max(0.001, t));
    });
  }

  pulse(time, walkActive = false) {
    this.rings.forEach((ring, index) => {
      const amount = 0.5 + 0.5 * Math.sin(time * 2.7 + index * 0.2);
      ring.scale.setScalar(1 + 0.055 * amount);
      ring.children[0].material.opacity = 0.17 + 0.2 * amount;
      ring.children[1].material.opacity = 0.45 + 0.45 * amount;
    });
    this.glows.forEach((glow) => {
      if (!glow.visible || walkActive) return;
      const amount = 0.5 + 0.5 * Math.sin(time * 3.5);
      glow.material.opacity = 0.12 + 0.88 * amount;
      glow.scale.set(1 + 0.035 * amount, 0.82 + 0.35 * amount, 1);
      glow.material.color.set(amount > 0.55 ? "#dfff75" : "#74f7b4");
    });
    this.party.update(time);
  }

  animateActor(time, pose, reachTree = null, walking = true) {
    animateCharacter(this.actor, time, pose);
    const groundY =
      this.actor.position.y < 0
        ? lerp(-0.04, 0.38, clamp((this.actor.position.y + 0.36) / 0.36))
        : 0.38 + this.actor.position.y * 0.477;
    this.locomotion.apply(this.actor, time, { groundY, enabled: walking });
    if (reachTree) {
      reachTree.updateWorldMatrix(true, false);
      reachWithHand(
        this.actor,
        1,
        reachTree.localToWorld(new Vector3(0, 0.36, 0.075)),
        "plant-tree",
      );
    }
  }

  coverActor(time, speaking = false) {
    this.actor.scale.setScalar(1.08);
    this.actor.position.set(-2.7, -0.36, 1.35);
    this.actor.rotation.set(
      -0.1,
      Math.atan2(camera.position.x + 2.7, camera.position.z - 1.35),
      0,
    );
    animateCharacter(this.actor, time, {
      energy: 0.3,
      look: 1,
      left: 28 + 18 * Math.sin(time * 3),
      right: -65,
      lean: 0.025 * Math.sin(time * 2),
      sing: speaking,
    });
    this.actor.updateWorldMatrix(true, true);
    for (let foot = 0; foot < 2; foot++) {
      const position = this.actor.localToWorld(
        new Vector3(foot === 0 ? -0.28 : 0.28, 0, 0),
      );
      position.y = -0.04;
      placeFoot(this.actor, foot, position, "stance");
    }
  }

  readingCamera() {
    camera.position.set(0, 12.4, 9.6);
    camera.lookAt(0, 0.7, 0);
    camera.updateMatrixWorld(true);
  }

  render(width, height) {
    this.sizer.apply();
    this.sizer.fit(camera, { width, height });
    renderer.render(scene, camera);
  }
}

export {
  Vector3,
  renderer,
  camera,
  scene,
  coverHinge,
  openBookAt,
  closeBookAt,
  turnPageAt,
};
