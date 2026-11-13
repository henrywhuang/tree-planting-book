import {
  Texture,
  SRGBColorSpace,
  Mesh,
  PlaneGeometry,
  MeshStandardMaterial,
  DoubleSide,
  MeshDepthMaterial,
  RGBADepthPacking,
  Group,
  Shape,
  ExtrudeGeometry,
  CircleGeometry,
  MeshBasicMaterial,
  LineCurve3,
  Vector3,
  TubeGeometry,
  QuadraticBezierCurve3,
} from "../../vendor/three.module.js";
import { visualAssets } from "../content.js";
var characterDocument = new DOMParser().parseFromString(
    await (await fetch(visualAssets.character)).text(),
    "image/svg+xml",
  ),
  characterTextures = new Map(),
  poses = {
    pull: [75, -75, -12, 12],
    water: [35, -65, 0, 8],
    guide: [70, -55, 0, 0],
    invite: [50, -130, -5, 8],
    step: [35, -25, 23, -28],
    point: [75, -85, -4, 4],
    proud: [105, -105, -10, 10],
    think: [15, -135, 0, 0],
    notice: [30, -110, 0, 0],
    heart: [80, -80, 0, 0],
    present: [95, -100, 0, 0],
    scratch: [120, -10, 0, 0],
    draw: [30, -65, 8, -8],
    wave: [20, -135, -5, 5],
  };
async function loadCharacterPart(partId, viewBox, attributes = "") {
  if (characterTextures.has(partId)) return characterTextures.get(partId);
  let w = characterDocument.getElementById(partId).cloneNode(!0);
  w.removeAttribute("opacity");
  let C = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="${viewBox}" ${attributes}>${new XMLSerializer().serializeToString(w)}</svg>`,
    E = new Image();
  await new Promise((i, B) => {
    ((E.onload = i),
      (E.onerror = B),
      (E.src =
        "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(C)))));
  });
  let I = new Texture(E);
  return (
    (I.colorSpace = SRGBColorSpace),
    (I.needsUpdate = !0),
    (I.anisotropy = 4),
    characterTextures.set(partId, I),
    I
  );
}
async function addCharacterPart(
  partId,
  viewBox,
  width,
  height,
  parent,
  x,
  y,
  z,
  attributes = "",
) {
  let t = await loadCharacterPart(partId, viewBox, attributes),
    S = new Mesh(
      new PlaneGeometry(width, height),
      new MeshStandardMaterial({
        map: t,
        transparent: !0,
        alphaTest: 0.2,
        roughness: 1,
        side: DoubleSide,
      }),
    );
  return (
    S.position.set(x, y, z),
    (S.castShadow = !0),
    (S.customDepthMaterial = new MeshDepthMaterial({
      depthPacking: RGBADepthPacking,
      map: t,
      alphaTest: 0.2,
    })),
    parent.add(S),
    S
  );
}
async function createCharacter(poseName) {
  let A = new Group(),
    Q = new Group();
  A.add(Q);
  let w = [],
    C = [],
    E = [],
    I = [];
  for (let [h, a, P, R] of [
    [0, "arm_left", -0.56, 0.79],
    [1, "arm_right", 0.56, 0.79],
    [2, "leg_left", -0.24, 0.35],
    [3, "leg_right", 0.24, 0.35],
  ]) {
    let f = new Group();
    (f.position.set(P, R, 0.01),
      Q.add(f),
      await addCharacterPart(
        a,
        "-50 -50 100 100",
        1,
        1,
        f,
        0,
        0,
        0,
        'stroke="#332F33" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"',
      ),
      (h < 2 ? w : C).push(f));
  }
  let i = characterDocument
      .getElementById("block_01_surface")
      .querySelector("path")
      .getAttribute("d")
      .match(/-?\d+(?:\.\d+)?/g)
      .map(Number),
    B = new Shape();
  for (let h = 0; h < i.length; h += 2) {
    let a = (i[h] - 60) * 0.01,
      P = (153 - i[h + 1]) * 0.01;
    h ? B.lineTo(a, P) : B.moveTo(a, P);
  }
  B.closePath();
  let t = new Mesh(
    new ExtrudeGeometry(B, {
      depth: 0.025,
      bevelEnabled: !1,
    }),
    new MeshStandardMaterial({
      color: "#d9ceba",
      roughness: 1,
    }),
  );
  ((t.castShadow = !0),
    Q.add(t),
    await addCharacterPart(
      "block_01_surface",
      "0 0 120 120",
      1.2,
      1.2,
      Q,
      0,
      0.93,
      0.026,
    ));
  for (let [h, a, P] of [
    ["eye_left", -0.3, "10 18 40 42"],
    ["eye_right", 0.3, "70 18 40 42"],
  ]) {
    let R = characterDocument.getElementById(h),
      f = R.querySelector("circle");
    f.remove();
    let J = await addCharacterPart(h, P, 0.4, 0.42, Q, a, 1.14, 0.035);
    (R.append(f), E.push(J));
    let p = new Mesh(
      new CircleGeometry(0.046, 24),
      new MeshBasicMaterial({
        color: "#242024",
      }),
    );
    (p.position.set(a + 0.01, 1.23, 0.042), Q.add(p), I.push(p));
  }
  let S = await addCharacterPart(
      "mouth",
      "44 56 32 30",
      0.32,
      0.3,
      Q,
      0,
      0.82,
      0.043,
    ),
    U = await addCharacterPart(
      "mouth_talk",
      "44 56 32 30",
      0.32,
      0.3,
      Q,
      0,
      0.82,
      0.043,
    ),
    o = [0, 1].map(() => {
      let h = new LineCurve3(new Vector3(), new Vector3(0.1, 0.1, 0)),
        a = new Mesh(
          new TubeGeometry(h, 12, 0.018, 6, !1),
          new MeshStandardMaterial({
            color: "#332F33",
            roughness: 1,
          }),
        );
      return ((a.visible = !1), (a.castShadow = !0), Q.add(a), a);
    });
  return (
    (A.userData.rig = {
      body: Q,
      arms: w,
      legs: C,
      eyes: E,
      pupils: I,
      mouth: S,
      talk: U,
      pose: poseName,
      contactArms: o,
      contacts: [],
      feet: [],
      angles: poses[poseName] || poses.guide,
    }),
    A
  );
}
function animateCharacter(
  character,
  time,
  {
    energy = 1,
    look = 0,
    hop = 0,
    sing = !0,
    left = null,
    right = null,
    lean = 0,
  } = {},
) {
  let t = character.userData.rig,
    S = t.angles;
  ((t.contacts = []),
    (t.feet = []),
    t.contactArms.forEach((h) => (h.visible = !1)),
    t.arms.forEach((h) => (h.visible = !0)),
    t.arms.forEach(
      (h, a) =>
        (h.rotation.z =
          (-(a === 0 && left !== null
            ? left
            : a === 1 && right !== null
              ? right
              : S[a] + Math.sin(time * 5 + a * 1.6) * 8 * energy) *
            Math.PI) /
          180),
    ),
    t.arms.forEach((h) => (h.position.z = 0.052)),
    t.legs.forEach((h) => {
      (h.scale.setScalar(1), (h.position.z = 0.01));
    }),
    t.legs.forEach(
      (h, a) =>
        (h.rotation.z =
          (-(S[a + 2] + Math.sin(time * 7 + a * Math.PI) * 6 * energy) *
            Math.PI) /
          180),
    ),
    (t.body.position.y = hop + 0.014 * Math.sin(time * 6) * energy),
    (t.body.rotation.z = lean + 0.018 * Math.sin(time * 3.2) * energy));
  let U = (time + 0.8) % 3.8,
    o = U < 0.16 ? Math.max(0.08, Math.abs(U - 0.08) / 0.08) : 1;
  (t.eyes.forEach((h) => (h.scale.y = o)),
    t.pupils.forEach((h, a) => {
      ((h.position.x = (a === 0 ? -0.29 : 0.31) + look * 0.036),
        (h.position.y =
          1.23 + (t.pose === "think" ? 0.025 : t.pose === "draw" ? -0.028 : 0)),
        (h.scale.y = o));
    }),
    (t.talk.visible = sing && Math.sin(time * 13) > 0.1),
    (t.mouth.visible = !t.talk.visible),
    (t.talk.scale.y = 0.65 + 0.35 * Math.abs(Math.sin(time * 8))));
}
function reachWithHand(character, handIndex, target, kind = "prop") {
  let C = character.userData.rig;
  C.body.updateWorldMatrix(!0, !1);
  let E = C.body.worldToLocal(target.clone()),
    I = C.arms[handIndex].position.clone(),
    i = I.clone().lerp(E, 0.52);
  ((i.y += 0.1), (i.x += handIndex === 0 ? -0.08 : 0.08));
  let B = new QuadraticBezierCurve3(I, i, E),
    t = C.contactArms[handIndex];
  (t.geometry.dispose(),
    (t.geometry = new TubeGeometry(B, 12, 0.018, 6, !1)),
    (t.visible = !0),
    (C.arms[handIndex].visible = !1),
    C.body.updateWorldMatrix(!0, !0));
  let S = C.body.localToWorld(B.getPoint(1));
  C.contacts.push({
    hand: handIndex,
    kind: kind,
    target: target.toArray(),
    actual: S.toArray(),
    error: S.distanceTo(target),
  });
}
function placeFoot(character, footIndex, target, phase = "stance") {
  let C = character.userData.rig,
    E = C.legs[footIndex];
  C.body.updateWorldMatrix(!0, !1);
  let I = C.body.worldToLocal(target.clone()),
    i = I.x - E.position.x,
    B = I.y - E.position.y,
    t = new Vector3(footIndex === 0 ? -0.18 : 0.18, -0.35, 0);
  ((E.rotation.z = Math.atan2(B, i) - Math.atan2(t.y, t.x)),
    E.scale.setScalar(Math.hypot(i, B) / Math.hypot(t.x, t.y)),
    (E.position.z = I.z),
    E.updateWorldMatrix(!0, !1));
  let S = E.localToWorld(t.clone());
  C.feet.push({
    foot: footIndex,
    phase: phase,
    target: target.toArray(),
    actual: S.toArray(),
    error: S.distanceTo(target),
  });
}
export { createCharacter, placeFoot, animateCharacter, reachWithHand };
