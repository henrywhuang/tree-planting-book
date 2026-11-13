import {
  Group,
  Mesh,
  RingGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Color,
  Vector3,
} from "../../vendor/three.module.js";
import { visualAssets } from "../content.js";
import {
  createLocomotion,
  travelDuration,
  moveCharacter,
} from "./locomotion.js";
import { createSongShot, songRoot } from "./song-props.js";
import { prepareShotLayout, createStageSizer } from "./layout.js";
import {
  scene,
  coverHinge,
  camera,
  renderer,
  openBookAt,
  closeBookAt,
  turnPageAt,
} from "./studio.js";
import { animateCharacter, placeFoot, reachWithHand } from "./character.js";
var onSongFootstep = () => {},
  songLocomotion = createLocomotion((g) => onSongFootstep(g)),
  currentSongShot = null,
  songOutro = null;
function setSongFootstepHandler(handler) {
  onSongFootstep = handler;
}
function getSongLocomotion() {
  return currentSongShot
    ? {
        ...currentSongShot.avatar.userData.rig.locomotion,
        feet: currentSongShot.avatar.userData.rig.feet,
      }
    : null;
}
var songOffset = 6,
  songEndTime = 43.584,
  songEndHold = 49,
  songExitStart = 44.45,
  songCloseEnd = 48.15,
  clampSong = (g) => Math.max(0, Math.min(1, g)),
  easeSong = (g) => ((g = clampSong(g)), g * g * (3 - 2 * g)),
  smootherSong = (g) => (
    (g = clampSong(g)),
    g * g * g * (g * (g * 6 - 15) + 10)
  ),
  lerpSong = (g, A, Q) => g + (A - g) * Q,
  toRadians = (g) => (g * Math.PI) / 180,
  backOut = (g) => (
    (g = clampSong(g)),
    g === 1
      ? 1
      : 1 + 2.70158 * Math.pow(g - 1, 3) + 1.70158 * Math.pow(g - 1, 2)
  );
function revealPaper(object, progress, axis = "x") {
  ((progress = clampSong(progress)),
    (object.visible = progress > 0),
    axis === "fold"
      ? (object.rotation.x = lerpSong(-Math.PI / 2, -0.15, easeSong(progress)))
      : (object.scale[axis] = Math.max(0.001, backOut(progress))));
}
var songShots = [];
for (let g of visualAssets.plan.shots) {
  let A = await createSongShot(g);
  (prepareShotLayout(A),
    (A.paper = new Group()),
    [...A.group.children]
      .filter((Q) => Q !== A.avatar)
      .forEach((Q) => A.paper.add(Q)),
    A.group.add(A.paper),
    songShots.push(A));
}
var songPageTurns = [
    {
      id: 1,
      from: 4,
      to: 5,
      boundary: 10.2,
      cameraStart: 8.55,
      fold: 9.25,
      lift: 9.55,
      land: 10.5,
      finish: 11.35,
      actor: [3.2, 3.75],
      help: !0,
    },
    {
      id: 2,
      from: 7,
      to: 8,
      boundary: 16.9,
      cameraStart: 15.48,
      fold: 16.18,
      lift: 16.48,
      land: 17.43,
      finish: 18.28,
      actor: [-0.55, 3.75],
      help: !1,
    },
    {
      id: 3,
      from: 11,
      to: 12,
      boundary: 28.82,
      cameraStart: 27.24,
      fold: 27.94,
      lift: 28.24,
      land: 29.32,
      finish: 30.17,
      actor: [-3.65, 3.75],
      help: !1,
    },
  ],
  songFocusRing = new Mesh(
    new RingGeometry(0.2, 0.27, 40),
    new MeshBasicMaterial({
      color: "#FFC94E",
      side: DoubleSide,
    }),
  );
songFocusRing.rotation.x = -Math.PI / 2;
songFocusRing.position.y = 0.49;
scene.add(songFocusRing);
var songSizer = createStageSizer({
  scene: scene,
  book: coverHinge.parent,
  contents: [songRoot],
  markers: [songFocusRing],
});
function renderSongFrame() {
  songSizer.apply();
  let g = songSizer.fit(camera, {
    width: renderer.domElement.clientWidth,
    height: renderer.domElement.clientHeight,
  });
  (renderer.render(scene, camera),
    (window.__stageSizing = {
      scale: songSizer.scale,
      cameraRetreat: g,
    }));
}
var motionCues = new Map();
for (let g of songShots)
  g.group.traverse((A) =>
    motionCues.set(A, {
      p: A.position.clone(),
      r: A.rotation.clone(),
      s: A.scale.clone(),
      visible: A.visible,
    }),
  );
function resetShot(g) {
  (g.group.traverse((A) => {
    let Q = motionCues.get(A);
    (A.position.copy(Q.p),
      A.rotation.copy(Q.r),
      A.scale.copy(Q.s),
      (A.visible = Q.visible));
  }),
    (g.group.visible = !0));
}
function moveShotCamera(g, A) {
  let Q = g.roads[0];
  Q &&
    ((Q.floor.scale.x = Math.max(0.001, A)),
    (Q.floor.position.x = -3.2 + 3.2 * A));
}
function findTree(g, A, Q) {
  let w = g.bars[A];
  if (!w) return;
  let C = motionCues.get(w);
  ((Q = clampSong(Q)),
    (w.visible = Q > 0),
    (w.scale.x = Math.max(0.001, Q)),
    (w.position.x = g.xs[A] + (C.p.x - g.xs[A]) * Q));
  let E = g.group.children.indexOf(w) + 1,
    I =
      A + 1 < g.bars.length
        ? g.group.children.indexOf(g.bars[A + 1])
        : g.group.children.length;
  g.group.children.slice(E, I).forEach((i) => (i.visible = Q > 0.65));
}
function performPlanting(g, A, Q, w, C, E, I, i) {
  let B = g.bars[A],
    t = B.geometry.parameters.width,
    S = 1 - easeSong(I);
  if (
    ((B.visible = !0),
    (B.scale.x = Math.max(0.001, (w - Q - 0.06 + 0.06 * S) / t)),
    (B.position.x = (Q + w) / 2),
    C)
  ) {
    let h = new Color(C),
      a = new Color(E);
    B.material.forEach((P, R) => {
      R !== 3 && P.color.copy(h).lerp(a, easeSong(I));
    });
  }
  let U = g.group.children.indexOf(B) + 1,
    o =
      A + 1 < g.bars.length
        ? g.group.children.indexOf(g.bars[A + 1])
        : g.group.children.length;
  g.group.children.slice(U, o).forEach((h) => (h.visible = i));
}
function performCounting(g, A) {
  if (g.heldSign) {
    let Q = g.heldSign,
      w = easeSong(A);
    ((Q.group.visible = A > 0),
      (Q.group.position.y = lerpSong(1.1, 1.9, w)),
      (Q.group.position.z = lerpSong(0.4, -0.05, w)),
      (Q.group.rotation.x = lerpSong(-0.9, -0.12, w)));
    return;
  }
  for (let Q of g.labels)
    Q.text.includes("\u68F5  /") &&
      (revealPaper(Q.object, A, "fold"),
      (Q.object.rotation.x = lerpSong(-Math.PI / 2, -0.48, easeSong(A))));
}
function setToolPose(g, A, Q, w) {
  (revealPaper(g, A, "fold"),
    A >= 1 &&
      (g.rotation.z =
        0.025 * Math.sin(Q * 4 + w) * Math.exp(-Math.max(0, Q) * 0.6)));
}
function setActorFacing(g, A) {
  g.flags.forEach((Q, w) => {
    ((Q.rotation.y = toRadians(16 * Math.sin(A * 5 + w) * Math.exp(-A))),
      revealPaper(Q, (A - w * 0.18) / 0.3, "fold"));
  });
}
var songCaption = document.getElementById("song-caption"),
  songLine = document.getElementById("song-line"),
  lyricWords = -1;
function updateLyric(shot, elapsed) {
  let Q = shot.shot;
  if (Q.id === 14) {
    songCaption.style.opacity = "0";
    return;
  }
  (lyricWords !== Q.id &&
    (songLine.replaceChildren(
      ...Array.from(Q.lyric).map((E) => {
        let I = document.createElement("span");
        return ((I.textContent = E), I);
      }),
    ),
    (lyricWords = Q.id)),
    (songCaption.style.opacity = String(easeSong(elapsed / 0.12))),
    (songCaption.style.translate = `0 ${18 * (1 - easeSong(elapsed / 0.22))}px`));
  let w = Math.max(0.3, Q.vocalEnd - Q.start),
    C = [...songLine.children];
  C.forEach((E, I) => {
    let i = clampSong((elapsed - I * 0.025) / 0.16);
    ((E.style.opacity = String(i)),
      (E.style.translate = `0 ${8 * (1 - i)}px`),
      (E.style.color =
        elapsed / w > I / Math.max(1, C.length - 1) ? "#27764d" : "#53634e"));
  });
}
function animateShot(g, A, Q) {
  let w = g.avatar,
    C = motionCues.get(w),
    E = songShots[Math.max(0, Q.id - 2)];
  if (Q.id > 1 && ![5, 8, 9, 12, 13].includes(Q.id)) {
    let h = motionCues.get(E.avatar).p.clone();
    (Q.id === 2 && ((h.x = 2.5), (h.y = 0.043), (h.z = 0)),
      Q.id === 14 && (h.x = 3.85));
    let a = easeSong(A / (Q.id === 3 ? 1.15 : 0.5));
    ((w.position.x = lerpSong(h.x, C.p.x, a)),
      (w.position.z = lerpSong(h.z, C.p.z, a)));
  }
  let I = 0.65,
    i = 0,
    B = 0,
    t = null,
    S = null,
    U = 0,
    o = A < Q.vocalEnd - Q.start;
  if (Q.mode === "road") {
    let h = easeSong((A - 0.1) / 1.85),
      a = 5 * h;
    (w.position.set(-2.5 + a, 0.043, 0),
      (I = 1.1),
      (U = -0.05 + 0.035 * Math.sin(a * 11.4)),
      (t = 15 + 38 * Math.sin((a / 0.55) * Math.PI * 2)),
      (S = -15 - 38 * Math.sin((a / 0.55) * Math.PI * 2)),
      (i = 1),
      (B = 0.025 * Math.sin((a / 0.55) * Math.PI * 2) ** 2));
  } else if (Q.mode === "ends")
    ((i = A < 0.65 ? -1 : 1),
      (t = 30),
      (S = lerpSong(-65, -130, easeSong((A - 0.4) / 0.6))),
      (U = 0.07 * Math.sin(Math.PI * clampSong((A - 1.2) / 0.7))));
  else if (Q.mode === "row") {
    let h = easeSong(A / 0.3),
      a = easeSong((A - 0.85) / 0.25);
    (w.position.set(
      lerpSong(1.85, lerpSong(-0.216, 0.216, a), h),
      0.043,
      lerpSong(1.85, 0, h),
    ),
      (B =
        0.23 * Math.sin(Math.PI * clampSong(A / 0.3)) -
        0.13 *
          (Math.sin(Math.PI * clampSong((A - 0.3) / 0.55)) +
            Math.sin(Math.PI * clampSong((A - 1.1) / 0.55)))),
      (U = 0),
      (i = A < 0.95 ? -1 : 1),
      (I = 0.2));
  } else if (Q.mode === "gaps")
    ((i = A < 1.7 ? -1 : 0),
      (S = A > 1.65 ? -100 - 13 * Math.sin(A * 12) : -75),
      (t = 50),
      (w.position.x = lerpSong(
        0.216,
        lerpSong(
          lerpSong(-2.13, 2.13, easeSong((A - 0.1) / 1.5)) + 0.9,
          3.85,
          easeSong((A - 1.65) / 0.4),
        ),
        easeSong(A / 0.3),
      )),
      (w.position.z = lerpSong(0, 1.85, easeSong(A / 0.3))));
  else if (Q.mode === "demo2")
    (w.position.set(0, 0.043, 0.3),
      (B = 0),
      (I = 0.2),
      (t = 80),
      (S = -80),
      (i = A < 1 ? 0 : 1));
  else if (Q.mode === "demo3")
    (w.position.set(0, 0.043, 0.3),
      (t = 80),
      (S = -80),
      (i = A < 1 ? -1 : 1),
      (I = 0.2));
  else if (Q.mode === "demo4")
    (w.position.set(0, 0.043, 0.3),
      (t = 80),
      (S = -80),
      (B = 0.025 * Math.sin(Math.PI * clampSong((A - 1.05) / 0.5))),
      (i = 0),
      (I = 0.2));
  else if (Q.mode === "compare")
    ((I = 0.13),
      (i = A < 1.1 ? 1 : A < 2.1 ? -0.5 : 0),
      (S = -135),
      (t = 15),
      (o = !1));
  else if (Q.mode === "pair")
    ((I = 0.25), (i = A < 1 ? 1 : 0), (S = -85), (t = 15));
  else if (Q.mode === "remember")
    ((t = lerpSong(80, 135, easeSong((A - 0.85) / 0.4))),
      (S = lerpSong(-80, -135, easeSong((A - 0.85) / 0.4))),
      (i = A < 0.4 ? -1 : A < 0.8 ? 1 : 0));
  else if (Q.mode === "formula")
    ((t = 95), (S = -100), (I = A > 3.5 ? 0.12 : 0.45), (i = A < 2 ? 1 : 0));
  else if (Q.mode === "forget") {
    ((t = 120 + 15 * Math.sin(A * 11) * (1 - easeSong((A - 2) / 0.6))),
      (S = -10 - 65 * easeSong((A - 2.5) / 0.5)),
      (U = 0.07 * Math.sin(A * 3)),
      (i = A < 2.2 ? -1 : 1),
      (o = !1),
      (w.position.x = lerpSong(-3.85, 1.6, easeSong((A - 1.6) / 1.25))),
      (w.position.z = lerpSong(1.9, 1.15, easeSong((A - 1.6) / 1.25))));
    let h = easeSong((A - 3.2) / (Q.end - Q.start - 3.2));
    ((w.position.x = lerpSong(w.position.x, -4.48, h)),
      (w.position.z = lerpSong(w.position.z, 0.05, h)),
      (B = -0.2 * h),
      (S = lerpSong(S, -65, h)),
      (U = lerpSong(U, -0.1, h)));
  } else if (Q.mode === "draw") {
    (w.scale.setScalar(lerpSong(0.97, C.s.x, easeSong(A / 0.35))),
      (i = A < 2 ? -1 : 0),
      (I = 0.5),
      (S = -65 + 15 * Math.sin(A * 12) * (1 - easeSong((A - 1.5) / 0.4))),
      (U = -0.1 * (1 - easeSong((A - 1.5) / 0.5))));
    let h = easeSong((A - 1.15) / 0.65);
    ((w.position.x = lerpSong(
      lerpSong(-4.48, 1.92, easeSong((A - 0.08) / 1.05)),
      3.85,
      h,
    )),
      (w.position.z = lerpSong(0.05, 1.8, h)),
      (B = -0.2 * (1 - h)));
  } else
    Q.mode === "ending" &&
      ((S = -100 - 16 * Math.sin(A * 14)), (t = 20), (o = !1), (I = 0.25));
  animateCharacter(w, Q.start + A, {
    energy: I,
    look: i,
    hop: B,
    sing: o,
    left: t,
    right: S,
    lean: U,
  });
}
function animateTransition(g, A) {
  let Q = g.shot,
    w = g.roads[0];
  if (
    (animateShot(g, A, Q),
    g.trees.forEach(
      (C, E) => (C.rotation.z = 0.012 * Math.sin((A + Q.start) * 3 + E * 1.7)),
    ),
    Q.mode === "road")
  ) {
    let C = easeSong((A - 0.1) / 1.85),
      E = 1.4 + 5 * C;
    moveShotCamera(g, E / 6.4);
    let I = g.paper.children.find((i) => i.geometry?.type === "TorusGeometry");
    I &&
      ((I.position.x = -3.2 + E),
      (I.rotation.x = A * 5),
      I.scale.setScalar(Math.max(0.001, 1 - easeSong((A - 1.9) / 0.35))));
  } else if (Q.mode === "ends") {
    (setActorFacing(g, A),
      g.trees.forEach((E, I) =>
        setToolPose(E, (A - 0.28 - I * 0.42) / 0.5, A, I),
      ));
    let C = g.tools.find((E) => E.kind === "can")?.object;
    C &&
      ((C.rotation.z = -0.28 * Math.sin(Math.PI * clampSong((A - 1.1) / 0.8))),
      (C.position.y = lerpSong(0.06, 0.96, easeSong((A - 0.4) / 0.6))),
      C.userData.drops?.forEach((E, I) => {
        let i = ((A - 1.1) * 2.2 + I / 3) % 1;
        ((E.visible = A > 1.1 && A < 2.08),
          E.position.set(0.6 + 0.08 * i, 0.22 - 0.85 * i, 0.09),
          E.scale.setScalar(Math.sin(Math.PI * clampSong(i))));
      }));
  } else if (Q.mode === "row")
    (setToolPose(g.trees[1], (A - 0.3) / 0.55, A, 1),
      setToolPose(g.trees[2], (A - 1.1) / 0.55, A, 2));
  else if (Q.mode === "gaps") {
    w.bars.forEach((E, I) => findTree(w, I, (A - 0.25 - I * 0.36) / 0.48));
    let C = g.tools.find((E) => E.kind === "glass")?.object;
    C &&
      ((C.position.x = lerpSong(-2.13, 2.13, easeSong((A - 0.1) / 1.5))),
      (C.position.y = lerpSong(0.4, 0.06, easeSong((A - 1.7) / 0.35))),
      (C.position.z = 1.6),
      (C.rotation.z = 0.1 * Math.sin(A * 7)));
  } else if (Q.mode === "demo2")
    (g.trees.forEach((C, E) => {
      C.rotation.x +=
        0.1 * Math.sin(Math.PI * clampSong((A - 0.1 - E * 0.23) / 0.4));
    }),
      findTree(w, 0, (A - 0.85) / 0.48),
      performCounting(g, (A - 0.95) / 0.38));
  else if (Q.mode === "demo3")
    (setToolPose(g.trees[1], (A - 0.14) / 0.55, A, 1),
      performPlanting(w, 0, -3.2, 0, null, null, (A - 0.55) / 0.4, A > 0.85),
      performPlanting(
        w,
        1,
        0,
        3.2,
        "#F282A0",
        "#50B6ED",
        (A - 0.55) / 0.4,
        A > 0.85,
      ),
      performCounting(g, 1));
  else if (Q.mode === "demo4") {
    let C = easeSong(A / 0.5);
    ((g.trees[1].position.x = lerpSong(0, -3.2 / 3, C)),
      setToolPose(g.trees[2], (A - 0.18) / 0.5, A, 2),
      performPlanting(
        w,
        0,
        -3.2,
        g.trees[1].position.x,
        null,
        null,
        (A - 0.55) / 0.4,
        A > 0.9,
      ),
      performPlanting(
        w,
        1,
        g.trees[1].position.x,
        3.2 / 3,
        null,
        null,
        (A - 0.55) / 0.4,
        A > 0.9,
      ),
      performPlanting(
        w,
        2,
        3.2 / 3,
        3.2,
        "#50B6ED",
        "#AC84EC",
        (A - 0.55) / 0.4,
        A > 0.9,
      ),
      performCounting(g, 1));
  } else if (Q.mode === "compare") animateSongActor(g, A);
  else if (Q.mode === "pair") animateSongActor(g, A);
  else if (Q.mode === "remember") {
    (g.trees.forEach((E, I) => animateDraw(E, (A - I * 0.1) / 0.45)),
      (g.roads[0].group.scale.x = Math.max(0.001, easeSong(A / 0.45))),
      g.flags.forEach(
        (E, I) =>
          (E.rotation.y = toRadians(
            45 * Math.sin(Math.PI * clampSong((A - I * 0.35) / 0.5)),
          )),
      ),
      g.trees.forEach((E, I) => {
        (I === 0 || I === 3) &&
          (E.rotation.x +=
            0.09 * Math.sin(Math.PI * clampSong((A - I * 0.12) / 0.45)));
      }));
    let C = g.heart;
    (C.scale.setScalar(Math.max(0.001, backOut((A - 0.75) / 0.45))),
      (C.position.x = lerpSong(-2.4, -3.85, easeSong((A - 0.8) / 0.45))),
      (C.position.y = lerpSong(0.9, 0.65, easeSong((A - 0.8) / 0.45))),
      (C.position.z = 2.1));
  } else if (Q.mode === "formula") {
    (revealPaper(g.formulaPlate, (A - 0.2) / 0.75, "fold"),
      (g.formulaPlate.rotation.x = lerpSong(
        -Math.PI / 2,
        -0.2,
        easeSong((A - 0.2) / 0.75),
      )),
      g.formulaParts.forEach((E, I) =>
        revealPaper(E, (A - [0.2, 0.85, 1.45, 2.65][I]) / 0.34, "x"),
      ),
      g.labels.forEach((E) => {
        E.text === "4\uFF0D1\uFF1D3" &&
          revealPaper(E.object, (A - 2.95) / 0.4, "x");
      }));
    let C = Math.sin(Math.PI * clampSong((A - 2.2) / 0.65));
    g.trees.forEach((E) => (E.scale.y = 1 + 0.045 * C));
  } else if (Q.mode === "forget") {
    let C = g.labels.find((t) => t.text === "?")?.object;
    C &&
      ((C.rotation.z = 0.1 * Math.sin(A * 5)),
      C.scale.setScalar(
        Math.max(0.001, backOut((A - 0.15) / 0.45)) *
          (1 - easeSong((A - 2.4) / 0.4)),
      ));
    let E = g.tools.find((t) => t.kind === "crayon")?.object;
    E &&
      ((E.position.x -= 0.45 * easeSong((A - 2.6) / 0.5)),
      (E.position.y += 0.5 * easeSong((A - 2.6) / 0.5)),
      (E.rotation.z = -0.4 * easeSong((A - 2.6) / 0.5)));
    let I = easeSong((A - 3.2) / (Q.end - Q.start - 3.2));
    E &&
      I > 0 &&
      ((E.position.x = lerpSong(E.position.x, -3.65, I)),
      (E.position.y = lerpSong(E.position.y, 0.82, I)),
      (E.position.z = lerpSong(E.position.z, -0.15, I)),
      (E.rotation.z = lerpSong(E.rotation.z, -2.6, I)));
    let i = easeSong((A - 3.1) / (Q.end - Q.start - 3.1));
    (g.sketchpad.scale.set(
      lerpSong(1, 7.45 / 3.3, i),
      1,
      lerpSong(1, 3.95 / 3, i),
    ),
      g.sketchpad.position.set(
        lerpSong(1.45, 0, i),
        lerpSong(0.045, 0.005, i),
        lerpSong(0.08, 0.22, i),
      ));
    let B = easeSong((A - 3) / 0.65);
    ((g.postcard.rotation.x = lerpSong(-Math.PI / 2, -Math.PI, B)),
      g.postcard.scale.setScalar(Math.max(0.001, 1 - B)),
      (g.postcard.visible = B < 0.99));
  } else if (Q.mode === "draw") {
    let C = easeSong((A - 0.08) / 1.05);
    (moveShotCamera(g, C),
      g.trees.forEach((I, i) =>
        setToolPose(I, (A - 0.5 - i * 0.32) / 0.4, A, i),
      ),
      w.bars.forEach((I, i) => findTree(w, i, (A - 2.2 - i * 0.35) / 0.4)),
      performCounting(g, (A - 2.85) / 0.3),
      g.labels.forEach((I) => {
        I.text === "3\uFF0D1\uFF1D2" &&
          ((I.object.visible = A > 2.95),
          revealPaper(I.object, (A - 2.95) / 0.3, "x"));
      }));
    let E = g.tools.find((I) => I.kind === "crayon")?.object;
    if (E) {
      let I = easeSong((A - 1.15) / 0.65);
      ((E.position.x = lerpSong(lerpSong(-3.65, 2.75, C), 3.55, I)),
        (E.position.y = lerpSong(0.82, 0.06, I)),
        (E.position.z = lerpSong(-0.15, 1.6, I)),
        (E.rotation.z = lerpSong(-2.6, 0, I)));
    }
    if (A > 1.5 && A < 2.35) {
      let I = Math.min(2, Math.floor((A - 1.5) / 0.28));
      ((songFocusRing.visible = !0),
        songFocusRing.position.set(g.trees[I].position.x, 0.48, -0.32));
    }
    if (A >= 2.35 && A < 3.08) {
      let I = A < 2.7 ? 0 : 1;
      ((songFocusRing.visible = !0),
        songFocusRing.position.set((w.xs[I] + w.xs[I + 1]) / 2, 0.47, 0.07));
    }
  }
}
function resetSongCue(g, A) {
  let Q = easeSong(A);
  (g.trees.forEach((w, C) => {
    let E = easeSong((A - C * 0.025) / 0.88);
    ((w.rotation.x = lerpSong(w.rotation.x, -Math.PI / 2, E)),
      (w.rotation.z *= 1 - E));
  }),
    g.flags.forEach(
      (w) => (w.rotation.x = lerpSong(w.rotation.x, -Math.PI / 2, Q)),
    ),
    g.labels
      .filter((w) => w.object.parent === g.paper)
      .forEach((w) => {
        ((w.object.rotation.x = lerpSong(w.object.rotation.x, -Math.PI / 2, Q)),
          (w.object.position.y *= 1 - Q));
      }),
    g.tools.forEach(({ object: w }) => {
      ((w.rotation.x = lerpSong(w.rotation.x, -Math.PI / 2, Q)),
        (w.position.y = lerpSong(w.position.y, 0.012, Q)));
    }),
    g.heart &&
      ((g.heart.rotation.x = lerpSong(g.heart.rotation.x, -Math.PI / 2, Q)),
      (g.heart.position.y *= 1 - Q)),
    g.heldSign &&
      ((g.heldSign.group.rotation.x = lerpSong(
        g.heldSign.group.rotation.x,
        -Math.PI / 2,
        Q,
      )),
      (g.heldSign.group.position.y = lerpSong(
        g.heldSign.group.position.y,
        0.03,
        Q,
      ))),
    (g.paper.visible = A < 0.995));
}
function animateDraw(g, A) {
  let Q = clampSong(A);
  setToolPose(g, Q / 0.78, 0, 0);
  let w = backOut((Q - 0.35) / 0.65);
  for (let C of g.userData.canopies || []) {
    let E = motionCues.get(C),
      I = lerpSong(0.28, 1, w);
    ((C.scale.x = E.s.x * lerpSong(0.15, 1, w)),
      (C.scale.y = E.s.y * I),
      (C.position.y = E.p.y + 1.05 * E.s.y * (1 - I)));
  }
  g.children
    .filter((C) => C.geometry?.type === "TubeGeometry")
    .forEach((C) => (C.visible = Q > 0.75));
}
function animateCompare(g, A) {
  if (g.shot.mode === "demo2")
    (moveShotCamera(g, easeSong(A / 0.25)),
      g.trees.forEach((Q, w) => animateDraw(Q, (A - w * 0.1) / 0.42)),
      g.flags.forEach((Q, w) =>
        revealPaper(Q, (A - 0.15 - w * 0.1) / 0.3, "fold"),
      ),
      g.labels
        .filter((Q) => Q.text === "\u7AEF\u70B9")
        .forEach((Q) => (Q.object.visible = A > 0.25)));
  else if (g.shot.mode === "compare")
    g.chart.group.rotation.x = lerpSong(
      -Math.PI / 2,
      -0.12,
      easeSong(A / 0.45),
    );
  else if (g.shot.mode === "forget") {
    let Q = easeSong(A / 0.35);
    ((g.sketchpad.scale.x = Math.max(0.001, Q)),
      (g.sketchpad.scale.z = lerpSong(0.3, 1, Q)),
      (g.sketchpad.position.x = -0.2 + 1.65 * Q),
      g.postcard.scale.setScalar(Math.max(0.001, backOut((A - 0.12) / 0.4))),
      g.labels
        .filter((w) => w.text === "?")
        .forEach((w) =>
          w.object.scale.multiplyScalar(
            Math.max(0.001, easeSong((A - 0.18) / 0.3)),
          ),
        ),
      g.tools.forEach(({ object: w }) =>
        w.scale.setScalar(Math.max(0.001, backOut((A - 0.16) / 0.35))),
      ));
  }
}
function animatePair(g, A) {
  let Q = songShots[g.from - 1],
    w = songShots[g.to - 1],
    C = new Vector3(0, 18.5, 9.25),
    E = new Vector3(0, 1.3, 0);
  if (A < g.lift) {
    let I = smootherSong((A - g.cameraStart) / (g.lift - g.cameraStart));
    (camera.position.copy(Q.camera).lerp(C, I),
      camera.lookAt(Q.target.clone().lerp(E, I)));
  } else if (A < g.land) (camera.position.copy(C), camera.lookAt(E));
  else {
    let I = smootherSong((A - g.land) / (g.finish - g.land));
    (camera.position.copy(C).lerp(w.camera, I),
      camera.lookAt(E.clone().lerp(w.target, I)));
  }
  camera.updateMatrixWorld();
}
function animateFormula(g, A, Q) {
  let w = g.avatar,
    C = new Vector3(A.actor[0], 0, A.actor[1]),
    E = Q - A.land;
  if (Q < A.lift) {
    let S = easeSong((Q - A.fold) / (A.lift - A.fold));
    w.position.lerp(C, S);
  } else if (Q < A.land) w.position.copy(C);
  else {
    let S = w.position.clone(),
      U = smootherSong(E / (A.finish - A.land));
    w.position.copy(C).lerp(S, U);
  }
  let I = clampSong((Q - A.fold) / (A.lift - A.fold)) * (1 - easeSong(E / 0.4)),
    i = g.avatar.userData.rig.body,
    B = easeSong(E / (A.finish - A.land)),
    t = w.userData.rig.angles;
  (animateCharacter(w, Q, {
    energy: 0.45,
    look: Q < A.land ? 1 : 0,
    sing: B > 0.75,
    right: lerpSong(
      A.help ? lerpSong(-65, -110, clampSong((Q - A.lift) / 0.6)) : -98,
      t[1],
      B,
    ),
    left: lerpSong(35, t[0], B),
    hop: 0,
    lean: -0.04,
  }),
    (i.scale.y = lerpSong(1, 0.88, I)),
    (w.rotation.x = lerpSong(motionCues.get(w).r.x, -0.55, I)));
}
function animateEnding(g, A) {
  let w = easeSong((A - 19.82) / 0.6);
  w <= 0 ||
    (camera.position.copy(g.camera).lerp(songShots[8].camera, w),
    camera.lookAt(g.target.clone().lerp(songShots[8].target, w)),
    camera.updateMatrixWorld());
}
function animateSongActor(g, A) {
  let Q = g.shot.mode === "compare";
  if (
    ((g.chart.group.rotation.x = -0.12),
    g.chart.columns.forEach((w, C) => {
      let E = Q ? backOut((A - 0.85 - C * 0.4) / 0.3) : 1;
      if (
        ((w.group.visible = E > 0), (w.group.scale.x = Math.max(0.001, E)), !Q)
      ) {
        let I = Math.sin(Math.PI * clampSong((A - 0.15 - C * 0.24) / 0.32));
        ((w.lower.position.y = 0.27 + 0.065 * I),
          w.lower.scale.setScalar(1 + 0.05 * I));
      }
    }),
    !Q)
  ) {
    let w = easeSong((A - 1.45) / 0.35);
    ((g.chart.group.rotation.x = lerpSong(-0.12, -Math.PI / 2, w)),
      (g.chart.group.visible = w < 0.995));
  }
}
function placeSongActor(g, A = 0.4005, Q = null) {
  if (!g.userData.rig.locomotion?.moving)
    for (let w = 0; w < 2; w++)
      placeFoot(
        g,
        w,
        new Vector3(
          g.position.x + (w === 0 ? -0.33 : 0.33),
          A,
          Q ?? g.position.z,
        ),
        "stance",
      );
}
function animateHand(g, A, Q, w) {
  let C = g.avatar,
    E = g.shot.mode;
  if (!(Q && w < Q.finish - 0.1)) {
    if (E === "row") {
      A >= 0.3 && placeSongActor(C, 0.4005, 0);
      let I = A < 0.95 ? 1 : 2,
        i = I === 1 ? 0.3 : 1.1;
      if (A >= i - 0.02 && A <= i + 0.6) {
        let B = g.trees[I];
        (B.updateWorldMatrix(!0, !1),
          reachWithHand(
            C,
            I === 1 ? 0 : 1,
            B.localToWorld(new Vector3(0, 0.36, 0.075)),
            `plant-tree-${I}`,
          ));
      }
    }
    if ((E === "forget" && A >= 2.75) || (E === "draw" && A <= 1.8)) {
      let I = g.tools.find((i) => i.kind === "crayon")?.object;
      I &&
        (I.updateWorldMatrix(!0, !1),
        reachWithHand(
          C,
          1,
          I.localToWorld(new Vector3(0, 0.15, 0.04)),
          "carry-crayon",
        ));
    }
    if (g.heldSign) {
      let I = g.heldSign;
      if (I.previous) {
        let i = easeSong((A - 0.72) / 0.38);
        ((I.previous.visible = i < 0.5),
          (I.face.visible = i >= 0.5),
          (I.previous.rotation.x = lerpSong(0, Math.PI / 2, clampSong(i * 2))),
          (I.face.rotation.x = lerpSong(
            -Math.PI / 2,
            0,
            clampSong((i - 0.5) * 2),
          )));
      }
      (I.group.visible &&
        (I.group.updateWorldMatrix(!0, !1),
        I.handles.forEach((i, B) =>
          reachWithHand(
            C,
            B,
            I.group.localToWorld(i.clone()),
            "hold-result-sign",
          ),
        )),
        placeSongActor(C, 0.4005, 0.3));
    }
    g.chart &&
      g.chart.group.visible &&
      (g.chart.group.updateWorldMatrix(!0, !1),
      reachWithHand(
        C,
        1,
        g.chart.group.localToWorld(g.chart.grip.clone()),
        "support-comparison-chart",
      ),
      placeSongActor(C, 0.341, 0.65));
  }
}
function animateShotPose(g, A) {
  let Q = g.camera.clone(),
    w = g.target.clone(),
    C = g.camera.clone(),
    E = g.shot.id - 1;
  E === 0 ? Q.set(0, 13.7, 4.4) : Q.copy(songShots[E - 1].camera);
  let I = easeSong(A / (g.shot.mode === "ending" ? 0.74 : 0.65));
  camera.position.copy(Q.lerp(C, I));
  let i = E ? songShots[E - 1].target : new Vector3(0, 0.18, 0);
  (camera.lookAt(i.clone().lerp(w, I)), camera.updateMatrixWorld());
}
function findShotAt(g) {
  songCaption.style.opacity = "0";
  let A = songShots.at(-1),
    Q = g - songOffset - A.shot.start;
  (openBookAt(5.8, {
    draw: !1,
  }),
    resetShot(A),
    animateTransition(A, Q),
    camera.position.set(0, 13.7, 4.4),
    camera.lookAt(0, 0.3, 0),
    camera.updateMatrixWorld());
  let w = clampSong((g - 43.78) / 0.56);
  (resetSongCue(A, w),
    A.roads.forEach(
      (I) => (I.group.scale.x = Math.max(0.001, 1 - easeSong(w))),
    ));
  let C = easeSong((g - 44.02) / 0.4);
  ((A.avatar.rotation.x = lerpSong(
    motionCues.get(A.avatar).r.x,
    -Math.PI / 2,
    C,
  )),
    (A.avatar.position.y = lerpSong(motionCues.get(A.avatar).p.y, -0.06, C)),
    (A.avatar.visible = g < 44.42),
    g >= songExitStart &&
      ((A.group.visible = !1),
      closeBookAt(
        clampSong((g - songExitStart) / (songCloseEnd - songExitStart)),
        {
          draw: !1,
        },
      )),
    renderSongFrame(),
    (window.__showState = {
      time: g,
      shot: 15,
      outro: !0,
      phase:
        g < 43.78
          ? "wave"
          : g < songExitStart
            ? "fold"
            : g < songCloseEnd
              ? "close"
              : "cover-hold",
      propsFolded: w,
      ipFolded: C,
      visibleIP: A.group.visible && A.avatar.visible,
      visiblePaper: A.group.visible && A.paper.visible,
      closeProgress: clampSong(
        (g - songExitStart) / (songCloseEnd - songExitStart),
      ),
      closed: g >= songCloseEnd,
      originalSong: !0,
    }));
}
function playSongFrame(timeline) {
  if (
    ((timeline = Math.max(0, Math.min(songEndHold, timeline))),
    songSizer.reset(),
    songShots.forEach((i) => (i.group.visible = !1)),
    turnPageAt(null),
    (songFocusRing.visible = !1),
    timeline < songOffset)
  ) {
    if (
      ((songCaption.style.opacity = "0"),
      openBookAt(Math.max(0, timeline - 1), {
        draw: !1,
      }),
      timeline > 5)
    ) {
      let i = songShots[0];
      (resetShot(i),
        (i.avatar.position.x = lerpSong(
          -4,
          -2.5,
          easeSong((timeline - 5) / 0.75),
        )),
        (i.avatar.position.z = lerpSong(
          0.95,
          0,
          easeSong((timeline - 5) / 0.75),
        )),
        (i.avatar.position.y = 0.043),
        i.avatar.scale.setScalar(
          Math.max(0.001, backOut((timeline - 5) / 0.45)),
        ),
        moveShotCamera(i, (1.4 / 6.4) * easeSong((timeline - 5) / 0.5)));
      let B = i.paper.children.find(
        (t) => t.geometry?.type === "TorusGeometry",
      );
      (B && (B.position.x = -1.8),
        animateCharacter(i.avatar, timeline, {
          energy: 0.75,
          look: 0,
          sing: !1,
          right: -115,
          hop: 0.1 * Math.sin(Math.PI * clampSong((timeline - 5) / 0.6)),
        }),
        timeline > 5.75 && placeSongActor(i.avatar, 0.4005, 0));
    }
    (renderSongFrame(),
      (window.__showState = {
        time: timeline,
        shot: 0,
        intro: !0,
      }));
    return;
  }
  if (timeline >= songEndTime) {
    findShotAt(timeline);
    return;
  }
  openBookAt(5.8, {
    draw: !1,
  });
  let A = Math.min(37.583, timeline - songOffset),
    Q =
      songShots.find((i) => A >= i.shot.start && A < i.shot.end) ||
      songShots.at(-1),
    w = songPageTurns.find((i) => A >= i.fold && A < i.finish),
    C = w && A < w.land ? songShots[w.from - 1] : Q;
  resetShot(C);
  let E = Math.min(
    C.shot.end - C.shot.start - 0.001,
    Math.max(0, A - C.shot.start),
  );
  (animateTransition(C, E),
    animateShotPose(C, E),
    updateLyric(Q, A - Q.shot.start),
    w
      ? (A < w.land
          ? (resetSongCue(C, clampSong((A - w.fold) / (w.lift - w.fold))),
            A >= w.lift && turnPageAt((A - w.lift) / (w.land - w.lift)))
          : animateCompare(C, A - w.land),
        animateFormula(C, w, A),
        animatePair(w, A))
      : C.shot.mode === "compare"
        ? animateEnding(C, A)
        : C.shot.mode === "pair" &&
          (camera.position.copy(C.camera),
          camera.lookAt(C.target),
          camera.updateMatrixWorld()));
  let I = songPageTurns.find((i) => A >= i.cameraStart && A < i.fold);
  (I && animatePair(I, A),
    (currentSongShot = C),
    songLocomotion.apply(C.avatar, timeline, {
      groundY: 0.355 + C.avatar.position.y + 0.0025,
      label: "song-" + C.shot.mode,
    }),
    animateHand(C, E, w, A),
    renderSongFrame(),
    (window.__showState = {
      time: timeline,
      songTime: A,
      shot: Q.shot.id,
      displayShot: C.shot.id,
      mode: C.shot.mode,
      treeCount: C.trees.length,
      intervalCount: C.shot.gaps ? C.shot.trees - 1 : 0,
      onlyCharacter: "01",
      originalSong: !0,
      pageTurn: w
        ? {
            id: w.id,
            phase: A < w.lift ? "fold" : A < w.land ? "turn" : "grow",
            progress: clampSong((A - w.lift) / (w.land - w.lift)),
          }
        : null,
      flyingSheet: !1,
    }));
}
function beginSongOutro() {
  let g = currentSongShot || songShots.at(-1),
    A = g.avatar,
    Q = A.position.clone(),
    w = [
      new Vector3(Q.x, -0.36, 3.6),
      new Vector3(-2.7, -0.36, 3.6),
      new Vector3(-2.7, -0.36, 1.35),
    ],
    C = 0,
    E = Q.clone(),
    I = w.map((i) => {
      let B = travelDuration(E, i),
        t = {
          from: E.clone(),
          to: i,
          at: C,
          duration: B,
        };
      return ((C += B), (E = i), t);
    });
  return (
    (songOutro = {
      r: g,
      route: I,
      walkEnd: C,
      closeAt: C + 0.2,
      duration: C + 0.2 + 3.7,
      scale: A.scale.x,
      rotation: A.rotation.clone(),
      camera: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      paperScale: g.paper.scale.y,
    }),
    songLocomotion.reset(A),
    songOutro.duration
  );
}
function getOutroSoundTimes() {
  return songOutro
    ? [
        0.12,
        0.38,
        songOutro.closeAt + 0.42,
        songOutro.closeAt + 0.82,
        songOutro.closeAt + 1.25,
        songOutro.closeAt + 1.8,
        songOutro.closeAt + 3.35,
      ]
    : [];
}
function playSongOutroFrame(elapsed) {
  if (!songOutro) return;
  (songSizer.reset(),
    turnPageAt(null),
    (songFocusRing.visible = !1),
    openBookAt(5.8, {
      draw: !1,
    }),
    songShots.forEach((i) => (i.group.visible = i === songOutro.r)));
  let A = songOutro.r,
    Q = A.avatar;
  ((A.paper.scale.y = Math.max(
    0.001,
    songOutro.paperScale * (1 - smootherSong(elapsed / 0.68)),
  )),
    (A.paper.visible = elapsed < 0.68));
  let w =
      songOutro.route.find((i) => elapsed < i.at + i.duration) ||
      songOutro.route.at(-1),
    C = smootherSong((elapsed - w.at) / w.duration);
  (moveCharacter(Q, w.from, w.to, elapsed - w.at, w.duration, "exit:" + w.at),
    Q.scale.setScalar(
      lerpSong(
        songOutro.scale,
        1.08,
        smootherSong(elapsed / songOutro.walkEnd),
      ),
    ),
    Q.rotation.set(
      lerpSong(
        songOutro.rotation.x,
        -0.1,
        smootherSong(elapsed / songOutro.walkEnd),
      ),
      0,
      0,
    ),
    animateCharacter(Q, elapsed, {
      energy: 0.25,
      look: 0,
      left: 28,
      right:
        elapsed >= songOutro.walkEnd ? -65 - 15 * Math.sin(elapsed * 9) : -30,
      sing: elapsed < 2.8,
    }),
    songLocomotion.apply(Q, elapsed, {
      groundY: lerpSong(-0.04, 0.38, clampSong((Q.position.y + 0.36) / 0.36)),
      label: "song-exit",
    }));
  let E = smootherSong(elapsed / songOutro.walkEnd),
    I = camera.clone();
  (I.position.set(0, 13.7, 4.4),
    I.lookAt(0, 0.3, 0),
    camera.position.copy(songOutro.camera).lerp(I.position, E),
    camera.quaternion.copy(songOutro.quaternion).slerp(I.quaternion, E),
    camera.updateMatrixWorld(!0),
    elapsed >= songOutro.closeAt &&
      closeBookAt(clampSong((elapsed - songOutro.closeAt) / 3.7), {
        draw: !1,
      }),
    (Q.rotation.y =
      Math.atan2(camera.position.x + 2.7, camera.position.z - 1.35) *
      smootherSong((elapsed - songOutro.walkEnd) / 3.7)),
    renderSongFrame(),
    (window.__showState = {
      outro: !0,
      phase: elapsed < songOutro.walkEnd ? "walk-off-page" : "close",
      closed: elapsed >= songOutro.duration,
      originalSong: !0,
      endingFromCurrentShot: A.shot.id,
    }));
}
function hideSong() {
  ((songRoot.visible = !1),
    (songFocusRing.visible = !1),
    (songCaption.style.opacity = "0"));
}
function showSong() {
  songRoot.visible = !0;
}
hideSong();
var songSoundCues = [
  {
    at: 6.15,
    id: "drag",
    volume: 0.24,
  },
  {
    at: 7.93,
    id: "skid",
    volume: 0.25,
  },
  {
    at: 9.32,
    id: "paper",
    volume: 0.22,
  },
  {
    at: 9.74,
    id: "paper",
    volume: 0.22,
  },
  {
    at: 10.64,
    id: "tap",
    volume: 0.25,
  },
  {
    at: 11.7,
    id: "paper",
    volume: 0.26,
  },
  {
    at: 12.22,
    id: "tap",
    volume: 0.22,
  },
  {
    at: 12.5,
    id: "paper",
    volume: 0.26,
  },
  {
    at: 13.04,
    id: "tap",
    volume: 0.22,
  },
  {
    at: 13.1,
    id: "precise",
    volume: 0.2,
  },
  {
    at: 13.9,
    id: "paper",
    volume: 0.23,
  },
  {
    at: 14.26,
    id: "paper",
    volume: 0.23,
  },
  {
    at: 14.62,
    id: "paper",
    volume: 0.23,
  },
  {
    at: 15.25,
    id: "paper",
    volume: 0.28,
  },
  {
    at: 15.55,
    id: "paper",
    volume: 0.4,
  },
  {
    at: 15.77,
    id: "paper",
    volume: 0.3,
  },
  {
    at: 16.5,
    id: "tap",
    volume: 0.22,
  },
  {
    at: 16.58,
    id: "paper",
    volume: 0.26,
  },
  {
    at: 16.7,
    id: "paper",
    volume: 0.26,
  },
  {
    at: 17.1,
    id: "land",
    volume: 0.26,
  },
  {
    at: 17.2,
    id: "paper",
    volume: 0.25,
  },
  {
    at: 17.6,
    id: "confirm0",
    volume: 0.24,
  },
  {
    at: 18.74,
    id: "paper",
    volume: 0.27,
  },
  {
    at: 19.32,
    id: "paper",
    volume: 0.25,
  },
  {
    at: 19.98,
    id: "confirm1",
    volume: 0.23,
  },
  {
    at: 21.13,
    id: "paper",
    volume: 0.27,
  },
  {
    at: 21.48,
    id: "drag",
    volume: 0.22,
  },
  {
    at: 21.68,
    id: "paper",
    volume: 0.25,
  },
  {
    at: 22.18,
    id: "paper",
    volume: 0.28,
  },
  {
    at: 22.28,
    id: "confirm2",
    volume: 0.23,
  },
  {
    at: 22.48,
    id: "paper",
    volume: 0.4,
  },
  {
    at: 22.7,
    id: "paper",
    volume: 0.3,
  },
  {
    at: 23.43,
    id: "tap",
    volume: 0.22,
  },
  {
    at: 23.45,
    id: "paper",
    volume: 0.25,
  },
  {
    at: 23.8,
    id: "paper",
    volume: 0.24,
  },
  {
    at: 24.2,
    id: "paper",
    volume: 0.24,
  },
  {
    at: 24.6,
    id: "paper",
    volume: 0.24,
  },
  {
    at: 26.7,
    id: "tap",
    volume: 0.2,
  },
  {
    at: 26.83,
    id: "tap",
    volume: 0.2,
  },
  {
    at: 26.96,
    id: "tap",
    volume: 0.2,
  },
  {
    at: 27.37,
    id: "confirm3",
    volume: 0.2,
  },
  {
    at: 28.37,
    id: "paper",
    volume: 0.2,
  },
  {
    at: 28.72,
    id: "paper",
    volume: 0.2,
  },
  {
    at: 29.52,
    id: "response",
    volume: 0.18,
  },
  {
    at: 30.59,
    id: "paper",
    volume: 0.25,
  },
  {
    at: 33.18,
    id: "precise",
    volume: 0.27,
  },
  {
    at: 33.94,
    id: "paper",
    volume: 0.28,
  },
  {
    at: 34.24,
    id: "paper",
    volume: 0.4,
  },
  {
    at: 34.46,
    id: "paper",
    volume: 0.3,
  },
  {
    at: 35.32,
    id: "tap",
    volume: 0.22,
  },
  {
    at: 35.65,
    id: "question1",
    volume: 0.19,
  },
  {
    at: 37.67,
    id: "tap",
    volume: 0.24,
  },
  {
    at: 38.27,
    id: "paper",
    volume: 0.24,
  },
  {
    at: 39.38,
    id: "pencil1",
    volume: 0.32,
  },
  {
    at: 39.9,
    id: "paper",
    volume: 0.2,
  },
  {
    at: 40.22,
    id: "paper",
    volume: 0.2,
  },
  {
    at: 40.54,
    id: "paper",
    volume: 0.2,
  },
  {
    at: 40.88,
    id: "tap",
    volume: 0.18,
  },
  {
    at: 41.16,
    id: "tap",
    volume: 0.18,
  },
  {
    at: 41.44,
    id: "tap",
    volume: 0.18,
  },
  {
    at: 41.78,
    id: "tap",
    volume: 0.18,
  },
  {
    at: 42.12,
    id: "tap",
    volume: 0.18,
  },
  {
    at: 42.4,
    id: "confirm1",
    volume: 0.23,
  },
];
export {
  setSongFootstepHandler,
  songOffset,
  playSongFrame,
  beginSongOutro,
  getOutroSoundTimes,
  playSongOutroFrame,
  hideSong,
  showSong,
  songSoundCues,
};
