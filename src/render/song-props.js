import {
  MeshStandardMaterial,
  DoubleSide,
  Group,
  Mesh,
  ExtrudeGeometry,
  Shape,
  CatmullRomCurve3,
  Vector3,
  TubeGeometry,
  CanvasTexture,
  SRGBColorSpace,
  PlaneGeometry,
  MeshBasicMaterial,
  BoxGeometry,
  Path,
  TorusGeometry,
} from "../../vendor/three.module.js";
import { visualAssets } from "../content.js";
import { resolvePaperColor, palette } from "./paper.js";
import { scene, camera } from "./studio.js";
import { createCharacter } from "./character.js";
var songPaperEdge = new MeshStandardMaterial({
    color: "#d9ceba",
    roughness: 1,
  }),
  songPaperMaterial = (g) =>
    new MeshStandardMaterial({
      color: resolvePaperColor(g),
      roughness: 1,
      side: DoubleSide,
    }),
  songGapColors = ["#eed0bd", "#bed5e6", "#d4c7e3"],
  songRoot = new Group();
songRoot.position.y = 0.355;
scene.add(songRoot);
var activeShotRoot,
  activeShot,
  songFont = new FontFace("BoardSC", `url(${visualAssets.font})`);
await songFont.load();
document.fonts.add(songFont);
await document.fonts.load("600 64px BoardSC");
function extrudeSongPaper(g, A, Q, w = 0, C = 0.025) {
  let E = new Mesh(
    new ExtrudeGeometry(g, {
      depth: C,
      bevelEnabled: !1,
      curveSegments: 20,
    }),
    [songPaperMaterial(A), songPaperEdge],
  );
  return (
    (E.position.z = w),
    (E.castShadow = !0),
    (E.receiveShadow = !0),
    Q.add(E),
    E
  );
}
function songPolygon(g, A, Q, w = 0) {
  let C = new Shape();
  return (
    g.forEach(([E, I], i) => (i ? C.lineTo(E, I) : C.moveTo(E, I))),
    C.closePath(),
    extrudeSongPaper(C, A, Q, w)
  );
}
function songCircle(g, A, Q, w, C, E = 0) {
  let I = new Shape();
  return (I.absarc(g, A, Q, 0, Math.PI * 2, !1), extrudeSongPaper(I, w, C, E));
}
function songRoundedShape(g, A, Q = 0.06) {
  let w = new Shape();
  return (
    w.moveTo(-g / 2 + Q, 0),
    w.lineTo(g / 2 - Q, 0),
    w.quadraticCurveTo(g / 2, 0, g / 2, Q),
    w.lineTo(g / 2, A - Q),
    w.quadraticCurveTo(g / 2, A, g / 2 - Q, A),
    w.lineTo(-g / 2 + Q, A),
    w.quadraticCurveTo(-g / 2, A, -g / 2, A - Q),
    w.lineTo(-g / 2, Q),
    w.quadraticCurveTo(-g / 2, 0, -g / 2 + Q, 0),
    w
  );
}
function songEllipse(g, A, Q, w = 0.018) {
  let C = new CatmullRomCurve3(g.map((I) => new Vector3(...I))),
    E = new Mesh(
      new TubeGeometry(C, Math.max(4, g.length * 6), w, 5, !1),
      songPaperMaterial(A),
    );
  return (Q.add(E), E);
}
function songText(
  g,
  A,
  Q,
  w,
  C = 1.2,
  E = 0.32,
  I = "#516b57",
  i = "#fff7e5",
  B = -0.48,
  t = activeShotRoot,
) {
  let S = new Group();
  if (
    (S.position.set(A, Q, w),
    (S.rotation.x = B),
    t.add(S),
    extrudeSongPaper(songRoundedShape(C, E, 0.045), i, S, 0, 0.025),
    t === activeShotRoot && C > 0.7)
  ) {
    let R = g.includes("\uFF0D1") ? palette.rose : palette.leaf,
      f = extrudeSongPaper(
        songRoundedShape(C + 0.055, E + 0.055, 0.05),
        R,
        S,
        -0.028,
        0.02,
      );
    f.position.y = -0.0275;
  }
  let U = document.createElement("canvas");
  ((U.width = 1200), (U.height = Math.round((1200 * E) / C)));
  let o = U.getContext("2d");
  (o.clearRect(0, 0, U.width, U.height),
    (o.fillStyle = resolvePaperColor(I)),
    (o.font = `600 ${Math.floor(U.height * 0.65)}px BoardSC`),
    (o.textAlign = "center"),
    (o.textBaseline = "middle"));
  let h = null;
  if (g === "\u6BB5\u6570\uFF1D\u68F5\u6570\uFF0D1")
    h = [
      ["\u6BB5\u6570\uFF1D\u68F5\u6570", palette.greenInk],
      ["\uFF0D1", palette.roseInk],
    ];
  else if (/^\d+－1＝\d+$/.test(g)) {
    let [R, f] = g.split("\uFF0D1\uFF1D");
    h = [
      [R, palette.greenInk],
      ["\uFF0D1", palette.roseInk],
      ["\uFF1D", palette.greenInk],
      [f, palette.grapeInk],
    ];
  }
  if (h) {
    o.textAlign = "left";
    let R = (U.width - h.reduce((f, [J]) => f + o.measureText(J).width, 0)) / 2;
    for (let [f, J] of h)
      ((o.fillStyle = J),
        o.fillText(f, R, U.height / 2),
        (R += o.measureText(f).width));
  } else o.fillText(g, U.width / 2, U.height / 2, U.width * 0.92);
  let a = new CanvasTexture(U);
  a.colorSpace = SRGBColorSpace;
  let P = new Mesh(
    new PlaneGeometry(C, E),
    new MeshBasicMaterial({
      map: a,
      transparent: !0,
      depthWrite: !1,
    }),
  );
  if (
    (P.position.set(0, E / 2, 0.028),
    S.add(P),
    t === activeShotRoot && Q > 0.055 && B > -1.3 && g !== "?")
  )
    for (let R of [-C * 0.38, C * 0.38])
      songPolygon(
        [
          [R - 0.04, -Q],
          [R + 0.04, -Q],
          [R + 0.04, 0.025],
          [R - 0.04, 0.025],
        ],
        "#eee5d1",
        S,
        -0.035,
      );
  return (
    activeShot.labels.push({
      text: g,
      object: S,
    }),
    S
  );
}
function songTreeShape(g, A = 0.28) {
  let Q = new Shape();
  (Q.moveTo(-A / 2, 0),
    Q.lineTo(A / 2, 0),
    Q.lineTo(A / 2, 0.15),
    Q.lineTo(-A / 2, 0.15),
    Q.closePath());
  let w = extrudeSongPaper(Q, "#eee5d1", g, -0.16);
  return ((w.rotation.x = -Math.PI / 2), w);
}
function songTree(g, A, Q = 1, w = !1, C = activeShotRoot) {
  let E = new Group();
  (E.position.set(g, 0.025, A),
    (E.rotation.x = -0.15),
    E.scale.setScalar(Q),
    C.add(E),
    songTreeShape(E, 0.3),
    songPolygon(
      [
        [-0.085, 0],
        [0.085, 0],
        [0.067, 0.88],
        [0.12, 1.12],
        [-0.06, 1.2],
      ],
      "#b59170",
      E,
      0.035,
    ),
    songPolygon(
      [
        [0, 0.62],
        [0.29, 0.95],
        [0.32, 1.06],
        [0.04, 0.86],
      ],
      "#b59170",
      E,
      0.04,
    ));
  let I = new Shape();
  (I.moveTo(-0.38, 0.65),
    I.bezierCurveTo(-0.71, 0.66, -0.66, 1.12, -0.4, 1.2),
    I.bezierCurveTo(-0.51, 1.57, -0.05, 1.72, 0.15, 1.47),
    I.bezierCurveTo(0.5, 1.72, 0.78, 1.28, 0.53, 1.06),
    I.bezierCurveTo(0.79, 0.69, 0.35, 0.44, 0.12, 0.65),
    I.bezierCurveTo(-0.1, 0.47, -0.25, 0.51, -0.38, 0.65),
    I.closePath());
  let i = extrudeSongPaper(I, w ? "#d1e5b9" : "#b3d2ac", E, 0, 0.036),
    B = extrudeSongPaper(I, "#c9dfbb", E, 0.045, 0.022);
  return (
    B.scale.set(0.77, 0.77, 1),
    B.position.set(-0.06, 0.23, 0.045),
    (E.userData.canopies = [i, B]),
    songEllipse(
      [
        [0, 0.7, 0.077],
        [0.06, 0.9, 0.077],
        [0.03, 1.18, 0.077],
      ],
      "#9fbe96",
      E,
      0.01,
    ),
    songEllipse(
      [
        [0.04, 0.88, 0.08],
        [-0.15, 1, 0.08],
      ],
      "#a4c39c",
      E,
      0.008,
    ),
    activeShot.trees.push(E),
    E
  );
}
function songRoad(g, A = !0, Q = !0, w = activeShotRoot, C = {}) {
  let E = C.width || 6.4,
    I = C.depth || 0.72,
    i = C.z || 0,
    B = new Group();
  ((B.position.z = i), w.add(B));
  let t = new Mesh(new BoxGeometry(E, 0.035, I), [
    songPaperMaterial("#ddc8a4"),
    songPaperMaterial("#ddc8a4"),
    songPaperMaterial("#f0deba"),
    songPaperMaterial("#d9c7a8"),
    songPaperMaterial("#e1cda8"),
    songPaperMaterial("#e1cda8"),
  ]);
  ((t.position.y = 0.025),
    (t.castShadow = !0),
    (t.receiveShadow = !0),
    B.add(t));
  let S =
    g > 1
      ? Array.from(
          {
            length: g,
          },
          (U, o) => -E / 2 + (o * E) / (g - 1),
        )
      : [];
  if (A)
    for (let U = 0; U < g - 1; U++) {
      let o = S[U + 1] - S[U],
        h = new Mesh(new BoxGeometry(o - 0.06, 0.028, I * 0.79), [
          songPaperMaterial(songGapColors[U % 3]),
          songPaperMaterial(songGapColors[U % 3]),
          songPaperMaterial(songGapColors[U % 3]),
          songPaperMaterial("#e7d6bc"),
          songPaperMaterial(songGapColors[U % 3]),
          songPaperMaterial(songGapColors[U % 3]),
        ]);
      (h.position.set((S[U] + S[U + 1]) / 2, 0.065, 0),
        (h.receiveShadow = !0),
        B.add(h),
        songEllipse(
          [
            [S[U] + 0.025, 0.09, I * 0.64],
            [(S[U] + S[U + 1]) / 2, 0.09, I * 0.76],
            [S[U + 1] - 0.025, 0.09, I * 0.64],
          ],
          "#b09375",
          B,
          0.012,
        ),
        Q &&
          songText(
            `${U + 1}`,
            (S[U] + S[U + 1]) / 2,
            0.035,
            I * 0.9,
            0.3,
            0.23,
            "#6c6380",
            songGapColors[U % 3],
            -Math.PI / 2,
            B,
          ));
    }
  return (
    activeShot.roads.push({
      xs: S,
      group: B,
      floor: t,
      bars: B.children.filter(
        (U) => U.isMesh && U !== t && U.geometry.type === "BoxGeometry",
      ),
    }),
    {
      xs: S,
      group: B,
    }
  );
}
function songFlag(g, A, Q, w = activeShotRoot) {
  let C = new Group();
  (C.position.set(g, 0.015, A),
    (C.rotation.x = -0.15),
    w.add(C),
    songPolygon(
      [
        [-0.018, 0],
        [0.018, 0],
        [0.018, 0.72],
        [-0.018, 0.72],
      ],
      "#baa788",
      C,
    ));
  let E = Q < 0 ? -1 : 1;
  return (
    songPolygon(
      [
        [0, 0.5],
        [E * 0.43, 0.5],
        [E * 0.35, 0.68],
        [E * 0.43, 0.83],
        [0, 0.83],
      ],
      Q < 0 ? "#e8c5b2" : "#b8d1dc",
      C,
      0.028,
    ),
    activeShot.flags.push(C),
    C
  );
}
function createFlowerPatch(g, A, Q) {
  let { xs: w } = songRoad(g, A, !0);
  (w.forEach((C, E) =>
    songTree(
      C,
      -0.32,
      1,
      Q === "ends" || Q === "remember" ? E === 0 || E === g - 1 : !1,
    ),
  ),
    g &&
      (songFlag(w[0] - 0.35, -0.38, -1),
      songFlag(w.at(-1) + 0.35, -0.38, 1),
      songText(
        "\u7AEF\u70B9",
        w[0],
        0.028,
        0.89,
        0.57,
        0.23,
        "#99836e",
        "#f0dec6",
        -Math.PI / 2,
      ),
      songText(
        "\u7AEF\u70B9",
        w.at(-1),
        0.028,
        0.89,
        0.57,
        0.23,
        "#6e8996",
        "#e0eaf0",
        -Math.PI / 2,
      )));
  for (let [C, E] of [
    [-3.75, 1.75],
    [3.65, 1.85],
  ]) {
    let I = new Group();
    (I.position.set(C, 0.025, E),
      (I.rotation.x = -Math.PI / 2),
      activeShotRoot.add(I));
    for (let i = 0; i < 5; i++) {
      let B = (i * Math.PI * 2) / 5;
      songCircle(Math.cos(B) * 0.075, Math.sin(B) * 0.075, 0.055, "#efd6bd", I);
    }
    songCircle(0, 0, 0.05, "#dfc77f", I, 0.026);
  }
  return w;
}
async function addSongCharacter(g, A = -3.15, Q = 1.8, w = 1) {
  let C = await createCharacter(g);
  return (
    C.position.set(A, 0, Q),
    (C.rotation.x = -0.27),
    C.scale.setScalar(w),
    activeShotRoot.add(C),
    (activeShot.avatar = C),
    C
  );
}
function createGardenTool(g, A, Q) {
  let w = new Group();
  if (
    (w.position.set(A, 0.06, Q),
    (w.rotation.x = -0.2),
    activeShotRoot.add(w),
    g === "can")
  ) {
    (extrudeSongPaper(songRoundedShape(0.43, 0.34, 0.06), "#b3cfdb", w, 0.06),
      songPolygon(
        [
          [0.2, 0.12],
          [0.52, 0.37],
          [0.58, 0.32],
          [0.27, 0.04],
        ],
        "#b3cfdb",
        w,
        0.05,
      ));
    let C = new Shape();
    C.absarc(-0.21, 0.21, 0.17, 0, Math.PI * 2);
    let E = new Path();
    (E.absarc(-0.21, 0.21, 0.115, 0, Math.PI * 2, !0),
      C.holes.push(E),
      extrudeSongPaper(C, "#a3becb", w),
      (w.userData.drops = []));
    for (let I = 0; I < 3; I++)
      w.userData.drops.push(
        songCircle(0.56 + I * 0.07, 0.23 - I * 0.1, 0.022, "#bdd8e5", w, 0.09),
      );
  } else if (g === "glass") {
    let C = new Shape();
    C.absarc(0, 0.44, 0.29, 0, Math.PI * 2);
    let E = new Path();
    (E.absarc(0, 0.44, 0.23, 0, Math.PI * 2, !0),
      C.holes.push(E),
      extrudeSongPaper(C, "#d7b895", w, 0.09),
      songPolygon(
        [
          [0.03, 0.18],
          [0.12, 0.17],
          [0.2, -0.13],
          [0.09, -0.16],
        ],
        "#b7cdb8",
        w,
        0.1,
      ));
  } else
    g === "crayon" &&
      (songPolygon(
        [
          [-0.05, 0],
          [0.05, 0],
          [0.05, 0.73],
          [0, 0.88],
          [-0.05, 0.73],
        ],
        "#dca7a2",
        w,
        0.08,
      ),
      songPolygon(
        [
          [-0.05, 0.14],
          [0.05, 0.14],
          [0.05, 0.56],
          [-0.05, 0.56],
        ],
        "#efcfbc",
        w,
        0.109,
      ));
  return (
    activeShot.tools.push({
      kind: g,
      object: w,
    }),
    w
  );
}
function createFormula(g, A, Q, w = activeShotRoot) {
  let C = new Shape();
  (C.moveTo(0, 0),
    C.bezierCurveTo(-0.38, 0.24, -0.25, 0.55, 0, 0.34),
    C.bezierCurveTo(0.25, 0.55, 0.38, 0.24, 0, 0));
  let E = new Group();
  return (
    E.position.set(g, A, Q),
    (E.rotation.x = -0.2),
    w.add(E),
    extrudeSongPaper(C, "#e8bdb0", E),
    (activeShot.heart = E),
    E
  );
}
function createCaseChart() {
  (songText(
    "\u68F5\u6570",
    -2.6,
    0.09,
    1.28,
    0.65,
    0.26,
    "#2D6C45",
    "#e1ead6",
    -Math.PI / 2,
  ),
    songText(
      "\u6BB5\u6570",
      -2.6,
      0.09,
      1.88,
      0.65,
      0.26,
      "#674195",
      "#f4ead8",
      -Math.PI / 2,
    ));
  for (let g = 0; g < 4; g++) {
    let A = -1.45 + g * 1.04,
      Q = new Group();
    (Q.position.set(A, 0.06, 1.18),
      (Q.rotation.x = -Math.PI / 2),
      activeShotRoot.add(Q),
      songCircle(0, 0.1, 0.18, "#c0d7b4", Q),
      songText(
        `${g + 1}`,
        A,
        0.09,
        1.28,
        0.24,
        0.22,
        "#52654e",
        "#e1ead6",
        -Math.PI / 2,
      ),
      g < 3 &&
        songText(
          `${g + 1}`,
          A,
          0.09,
          1.88,
          0.47,
          0.28,
          "#686079",
          songGapColors[g],
          -Math.PI / 2,
        ));
  }
  songText("\u5C111", 2.3, 0.12, 1.75, 0.85, 0.36, "#9a766b", "#f1d6bd", -0.7);
}
function addMathSigns(g, A) {
  let Q = new Group();
  (Q.position.set(-0.45, 0.025, A), activeShotRoot.add(Q));
  let w = new Mesh(
    new BoxGeometry(5.45, 0.045, 1.26),
    songPaperMaterial("#fbf1df"),
  );
  ((w.position.y = -0.008), (w.receiveShadow = !0), Q.add(w));
  let { xs: C } = songRoad(g, !0, !1, Q, {
    width: 3.75,
    depth: 0.31,
    z: 0.15,
  });
  (C.forEach((E) => songTree(E, -0.15, 0.43, !1, Q)),
    songText(
      `${g}\u68F5  ${g - 1}\u6BB5`,
      2.25,
      0.02,
      0.35,
      1,
      0.27,
      "#5b705b",
      "#f4ead8",
      -0.8,
      Q,
    ),
    activeShot.rows.push(Q));
}
function createPairingChart() {
  let g = new Mesh(
    new BoxGeometry(3.3, 0.025, 3),
    songPaperMaterial("#fff7e9"),
  );
  (g.position.set(1.45, 0.045, 0.08),
    (activeShot.sketchpad = g),
    (g.rotation.y = -0.04),
    (g.receiveShadow = !0),
    activeShotRoot.add(g),
    songText("?", 1.5, 1.55, 1.1, 0.62, 0.63, "#9c9a86", "#f9efd9", -0.3));
  let A = new Group();
  (A.position.set(-2.55, 0.08, -0.2),
    (A.rotation.x = -Math.PI / 2),
    (A.rotation.z = 0.08),
    activeShotRoot.add(A),
    (activeShot.postcard = A),
    extrudeSongPaper(songRoundedShape(1.6, 1.8, 0.08), "#e5d7be", A, 0),
    songText(
      "4\uFF0D1\uFF1D3",
      0,
      0.9,
      0.04,
      1.4,
      0.3,
      "#829478",
      "#fff4de",
      0,
      A,
    ));
}
async function createSongShot(g) {
  ((activeShotRoot = new Group()),
    songRoot.add(activeShotRoot),
    (activeShot = {
      shot: g,
      group: activeShotRoot,
      trees: [],
      roads: [],
      labels: [],
      flags: [],
      tools: [],
      rows: [],
    }));
  let A = g.mode;
  if (A === "compare")
    (addMathSigns(2, -1.8),
      addMathSigns(3, -0.1),
      addMathSigns(4, 1.6),
      await addSongCharacter("think", -3.85, 1.2, 0.8));
  else if (A === "forget")
    (createPairingChart(),
      await addSongCharacter("scratch", 1.6, 1.15, 0.97),
      createGardenTool("crayon", 2.65, 1.22));
  else if (A === "road") {
    (songRoad(0, !1, !1), await addSongCharacter("pull", 0.45, 0.85, 1));
    let Q = new Mesh(
      new TorusGeometry(0.21, 0.027, 5, 30, Math.PI * 1.6),
      songPaperMaterial("#e5d0ae"),
    );
    (Q.position.set(3.12, 0.22, 0),
      (Q.rotation.y = Math.PI / 2),
      activeShotRoot.add(Q));
  } else {
    if (A === "draw") {
      let E = new Mesh(
        new BoxGeometry(7.45, 0.014, 3.95),
        songPaperMaterial("#fff9e9"),
      );
      (E.position.set(0, 0.005, 0.22),
        (E.receiveShadow = !0),
        activeShotRoot.add(E),
        songEllipse(
          [
            [-3.55, 0.02, 1.28],
            [-1, 0.02, 1.26],
            [1.1, 0.02, 1.29],
            [3.5, 0.02, 1.28],
          ],
          "#dacdb5",
          activeShotRoot,
          0.008,
        ));
    }
    createFlowerPatch(g.trees, g.gaps, A);
    let Q = {
        ends: [1.85, 1.85],
        gaps: [3.85, 1.85],
        demo2: [-3.85, 1.75],
        demo3: [-3.85, 1.75],
        demo4: [-3.85, 1.8],
        pair: [-3.85, 1.95],
        remember: [-3.85, 1.9],
        formula: [-3.85, 1.9],
        draw: [-3.85, 1.8],
        ending: [3.85, 1.85],
      },
      [w, C] = Q[A] || [-3.85, 1.8];
    (await addSongCharacter(g.pose, w, C, 0.95),
      A === "ends" && createGardenTool("can", 2.65, 1.5),
      A === "gaps" && createGardenTool("glass", 1.05, 1.08),
      ["demo2", "demo3", "demo4", "draw"].includes(A) &&
        songText(
          `${g.trees}\u68F5  /  ${g.trees - 1}\u6BB5`,
          1.6,
          0.12,
          1.9,
          2.7,
          0.48,
        ),
      A === "pair" && createCaseChart(),
      A === "remember" && createFormula(-2.85, 0.9, 2),
      A === "formula" &&
        ((activeShot.formulaPlate = songText(
          "",
          0,
          1.67,
          -1.45,
          5,
          0.69,
          "#5a7357",
          "#fff1d9",
          -0.2,
        )),
        (activeShot.formulaParts = [
          ["\u6BB5\u6570", -1.65, 1.1, "#2D6C45"],
          ["\uFF1D", -0.65, 0.65, "#2D6C45"],
          ["\u68F5\u6570", 0.45, 1.1, "#2D6C45"],
          ["\uFF0D1", 1.78, 0.95, "#B34669"],
        ].map(([E, I, i, B]) =>
          songText(
            E,
            I,
            0.08,
            0.055,
            i,
            0.52,
            B,
            E === "\uFF0D1" ? "#ffe3ee" : "#fff1d9",
            0,
            activeShot.formulaPlate,
          ),
        )),
        songText(
          "4\uFF0D1\uFF1D3",
          1.4,
          0.1,
          1.85,
          2.8,
          0.52,
          "#947864",
          "#f6e4c7",
          -0.75,
        )),
      A === "draw" &&
        (createGardenTool("crayon", -3.35, 1.6),
        songText(
          "3\uFF0D1\uFF1D2",
          0,
          1.55,
          -1.55,
          3.2,
          0.55,
          "#6d7f63",
          "#fff1d7",
          -0.25,
        )),
      A === "ending" &&
        songText(
          "3\uFF0D1\uFF1D2",
          0,
          1.28,
          -1.55,
          3,
          0.52,
          "#6d7f63",
          "#fff1d7",
          -0.5,
        ));
  }
  if (["compare", "forget"].includes(A))
    (camera.position.set(0, 11.8, 8.9), camera.lookAt(0, 0.5, 0));
  else if (A === "ending")
    (camera.position.set(0, 13.7, 4.4), camera.lookAt(0, 0.3, 0));
  else {
    let Q = [
      "demo2",
      "demo3",
      "demo4",
      "gaps",
      "pair",
      "formula",
      "draw",
    ].includes(A);
    (camera.position.set(0, Q ? 7.7 : 9.1, Q ? 10.4 : 12),
      camera.lookAt(0, 0.9, 0));
  }
  return (
    (activeShot.camera = camera.position.clone()),
    (activeShot.target = new Vector3(
      0,
      ["compare", "forget"].includes(A) ? 0.5 : A === "ending" ? 0.3 : 0.9,
      0,
    )),
    (activeShotRoot.visible = !1),
    activeShot
  );
  window.__boardPose = {
    id: g.id,
    trees: g.trees,
    gaps: g.gaps,
    mode: g.mode,
    ip: "character_01",
  };
}
export { createSongShot, songRoot };
