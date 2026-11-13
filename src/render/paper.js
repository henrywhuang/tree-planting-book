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
} from "../../vendor/three.module.js";
import { visualAssets } from "../content.js";
var palette = {
    tree: "#28B45E",
    leaf: "#8BDE40",
    focus: "#70D847",
    trunk: "#C88745",
    road: "#F5D05A",
    rose: "#F282A0",
    sky: "#50B6ED",
    grape: "#AC84EC",
    greenInk: "#2D6C45",
    roseInk: "#B34669",
    grapeInk: "#674195",
  },
  paperColors = {
    "#b3d2ac": palette.tree,
    "#c9dfbb": palette.leaf,
    "#d1e5b9": palette.focus,
    "#b59170": palette.trunk,
    "#9fbe96": "#3B9C46",
    "#a4c39c": "#3B9C46",
    "#f0deba": palette.road,
    "#ddc8a4": "#D6AC4E",
    "#e1cda8": "#E7BB5B",
    "#e5d0ae": "#EFCD67",
    "#b09375": "#B18C39",
    "#eed0bd": palette.rose,
    "#bed5e6": palette.sky,
    "#d4c7e3": palette.grape,
    "#e8c5b2": palette.rose,
    "#b8d1dc": palette.sky,
    "#99836e": "#9D3F56",
    "#f0dec6": "#F8B8C8",
    "#6e8996": "#255E8A",
    "#e0eaf0": "#A7DAF6",
    "#efd6bd": "#F49DAD",
    "#dfc77f": "#EFC742",
    "#b3cfdb": "#56BDE5",
    "#a3becb": "#2C9AB8",
    "#bdd8e5": "#58C8E9",
    "#d7b895": "#EFBD43",
    "#b7cdb8": "#7ACA74",
    "#dca7a2": "#F1789B",
    "#efcfbc": "#FFE1BF",
    "#e8bdb0": "#F889A6",
    "#c0d7b4": "#82D04B",
    "#e1ead6": "#C6EC94",
    "#516b57": "#2F6242",
    "#52654e": "#2D6035",
    "#5b705b": "#2F6242",
    "#6c6380": "#594071",
    "#686079": "#594071",
    "#9a766b": "#B14F69",
    "#f1d6bd": "#FFDBAB",
    "#5a7357": palette.greenInk,
    "#947864": "#8F6336",
    "#f6e4c7": "#FFE2A4",
    "#6d7f63": "#386A3B",
    "#fff1d7": "#FFF0C8",
    "#9c9a86": "#9C5D99",
    "#f9efd9": "#FBE3EF",
    "#e5d7be": "#F3D99F",
    "#829478": "#51844C",
  },
  resolvePaperColor = (g) => paperColors[g.toLowerCase()] || g;
var paperEdgeMaterial = new MeshStandardMaterial({
    color: "#d9ceba",
    roughness: 1,
  }),
  paperMaterial = (g) =>
    new MeshStandardMaterial({
      color: resolvePaperColor(g),
      roughness: 1,
      side: DoubleSide,
    }),
  gapColors = ["#eed0bd", "#bed5e6", "#d4c7e3"],
  sparePaperRoot = new Group();
sparePaperRoot.position.y = 0.355;
var activePaperRoot,
  activePaperScene,
  boardFont = new FontFace("BoardSC", `url(${visualAssets.font})`);
await boardFont.load();
document.fonts.add(boardFont);
await document.fonts.load("600 64px BoardSC");
function extrudePaper(g, A, Q, w = 0, C = 0.025) {
  let E = new Mesh(
    new ExtrudeGeometry(g, {
      depth: C,
      bevelEnabled: !1,
      curveSegments: 20,
    }),
    [paperMaterial(A), paperEdgeMaterial],
  );
  return (
    (E.position.z = w),
    (E.castShadow = !0),
    (E.receiveShadow = !0),
    Q.add(E),
    E
  );
}
function polygonPaper(g, A, Q, w = 0) {
  let C = new Shape();
  return (
    g.forEach(([E, I], i) => (i ? C.lineTo(E, I) : C.moveTo(E, I))),
    C.closePath(),
    extrudePaper(C, A, Q, w)
  );
}
function roundedPaperShape(g, A, Q = 0.06) {
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
function circlePaper(g, A, Q, w = 0.018) {
  let C = new CatmullRomCurve3(g.map((I) => new Vector3(...I))),
    E = new Mesh(
      new TubeGeometry(C, Math.max(4, g.length * 6), w, 5, !1),
      paperMaterial(A),
    );
  return (Q.add(E), E);
}
function paperText(
  g,
  A,
  Q,
  w,
  C = 1.2,
  E = 0.32,
  I = "#516b57",
  i = "#fff7e5",
  B = -0.48,
  t = activePaperRoot,
) {
  let S = new Group();
  if (
    (S.position.set(A, Q, w),
    (S.rotation.x = B),
    t.add(S),
    extrudePaper(roundedPaperShape(C, E, 0.045), i, S, 0, 0.025),
    t === activePaperRoot && C > 0.7)
  ) {
    let R = g.includes("\uFF0D1") ? palette.rose : palette.leaf,
      f = extrudePaper(
        roundedPaperShape(C + 0.055, E + 0.055, 0.05),
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
    t === activePaperRoot && Q > 0.055 && B > -1.3 && g !== "?")
  )
    for (let R of [-C * 0.38, C * 0.38])
      polygonPaper(
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
    activePaperScene.labels.push({
      text: g,
      object: S,
    }),
    S
  );
}
function treeCrownShape(g, A = 0.28) {
  let Q = new Shape();
  (Q.moveTo(-A / 2, 0),
    Q.lineTo(A / 2, 0),
    Q.lineTo(A / 2, 0.15),
    Q.lineTo(-A / 2, 0.15),
    Q.closePath());
  let w = extrudePaper(Q, "#eee5d1", g, -0.16);
  return ((w.rotation.x = -Math.PI / 2), w);
}
function createTree(g, A, Q = 1, w = !1, C = activePaperRoot) {
  let E = new Group();
  (E.position.set(g, 0.025, A),
    (E.rotation.x = -0.15),
    E.scale.setScalar(Q),
    C.add(E),
    treeCrownShape(E, 0.3),
    polygonPaper(
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
    polygonPaper(
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
  let i = extrudePaper(I, w ? "#d1e5b9" : "#b3d2ac", E, 0, 0.036),
    B = extrudePaper(I, "#c9dfbb", E, 0.045, 0.022);
  return (
    B.scale.set(0.77, 0.77, 1),
    B.position.set(-0.06, 0.23, 0.045),
    (E.userData.canopies = [i, B]),
    circlePaper(
      [
        [0, 0.7, 0.077],
        [0.06, 0.9, 0.077],
        [0.03, 1.18, 0.077],
      ],
      "#9fbe96",
      E,
      0.01,
    ),
    circlePaper(
      [
        [0.04, 0.88, 0.08],
        [-0.15, 1, 0.08],
      ],
      "#a4c39c",
      E,
      0.008,
    ),
    activePaperScene.trees.push(E),
    E
  );
}
function createRoad(g, A = !0, Q = !0, w = activePaperRoot, C = {}) {
  let E = C.width || 6.4,
    I = C.depth || 0.72,
    i = C.z || 0,
    B = new Group();
  ((B.position.z = i), w.add(B));
  let t = new Mesh(new BoxGeometry(E, 0.035, I), [
    paperMaterial("#ddc8a4"),
    paperMaterial("#ddc8a4"),
    paperMaterial("#f0deba"),
    paperMaterial("#d9c7a8"),
    paperMaterial("#e1cda8"),
    paperMaterial("#e1cda8"),
  ]);
  ((t.position.y = 0.025),
    (t.castShadow = !1),
    (t.receiveShadow = !0),
    B.add(t));
  let S =
    C.xs ||
    (g > 1
      ? Array.from(
          {
            length: g,
          },
          (U, o) => -E / 2 + (o * E) / (g - 1),
        )
      : []);
  if (A)
    for (let U = 0; U < g - 1; U++) {
      let o = S[U + 1] - S[U],
        h = new Mesh(new BoxGeometry(o - 0.06, 0.028, I * 0.79), [
          paperMaterial(gapColors[U % 3]),
          paperMaterial(gapColors[U % 3]),
          paperMaterial(gapColors[U % 3]),
          paperMaterial("#e7d6bc"),
          paperMaterial(gapColors[U % 3]),
          paperMaterial(gapColors[U % 3]),
        ]);
      (h.position.set((S[U] + S[U + 1]) / 2, 0.065, 0),
        (h.receiveShadow = !0),
        B.add(h),
        circlePaper(
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
          paperText(
            `${U + 1}`,
            (S[U] + S[U + 1]) / 2,
            0.035,
            I * 0.9,
            0.3,
            0.23,
            "#6c6380",
            gapColors[U % 3],
            -Math.PI / 2,
            B,
          ));
    }
  return (
    activePaperScene.roads.push({
      xs: S,
      group: B,
      floor: t,
      bars: B.children.filter(
        (U) => U.isMesh && U !== t && U.geometry.type === "BoxGeometry",
      ),
      guides: B.children.filter((U) => U.geometry?.type === "TubeGeometry"),
    }),
    {
      xs: S,
      group: B,
    }
  );
}
function createEndpointFlag(g, A, Q, w = activePaperRoot) {
  let C = new Group();
  (C.position.set(g, 0.015, A),
    (C.rotation.x = -0.15),
    w.add(C),
    polygonPaper(
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
    polygonPaper(
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
    activePaperScene.flags.push(C),
    C
  );
}
function createRoadScene(positions, { gaps = !1, numbers = !1 } = {}) {
  return (
    (activePaperRoot = new Group()),
    (activePaperScene = {
      group: activePaperRoot,
      trees: [],
      roads: [],
      labels: [],
      flags: [],
      tools: [],
    }),
    createRoad(positions.length, gaps, numbers, activePaperRoot, {
      xs: positions,
    }),
    positions.forEach((w, C) =>
      createTree(w, -0.32, 1, C === 0 || C === positions.length - 1),
    ),
    createEndpointFlag(-3.55, -0.4, -1),
    createEndpointFlag(3.55, -0.4, 1),
    activePaperScene.labels
      .filter((w) => /^\d+$/.test(w.text))
      .forEach((w) => {
        ((w.object.rotation.x = -0.15), (w.object.position.y = 0.08));
      }),
    {
      ...activePaperScene,
      root: activePaperRoot,
      road: activePaperScene.roads[0],
    }
  );
}
function createSign(text, x, y, z, width = 2.6, height = 0.48) {
  activePaperScene ||
    ((activePaperScene = {
      labels: [],
    }),
    (activePaperRoot = new Group()));
  let I = paperText(
    text,
    x,
    y,
    z,
    width,
    height,
    "#2D6C45",
    "#FFF6DE",
    -0.18,
    new Group(),
  );
  if (y > 0.2)
    for (let i of [-width * 0.35, width * 0.35])
      polygonPaper(
        [
          [i - 0.032, -y],
          [i + 0.032, -y],
          [i + 0.032, 0.04],
          [i - 0.032, 0.04],
        ],
        "#d8c598",
        I,
        -0.035,
      );
  return I;
}
function createComparison() {
  let g = new Group();
  (g.position.set(0, 0.08, -0.1),
    (g.rotation.x = -0.15),
    extrudePaper(roundedPaperShape(5.3, 1.8, 0.1), "#fff4d8", g, 0, 0.065));
  let A = document.createElement("canvas");
  ((A.width = 1320), (A.height = 450));
  let Q = A.getContext("2d");
  ((Q.fillStyle = "#fff4d8"),
    Q.fillRect(0, 0, A.width, A.height),
    (Q.textAlign = "center"),
    (Q.textBaseline = "middle"),
    (Q.font = "600 66px BoardSC"));
  for (let [E, I, i, B] of [
    [125, "\u68F5\u6570", [2, 3, 4], "#2D6C45"],
    [310, "\u6BB5\u6570", [1, 2, 3], "#674195"],
  ])
    ((Q.fillStyle = B),
      Q.fillText(I, 190, E),
      i.forEach((t, S) => {
        ((Q.fillStyle =
          E === 125 ? "#deedb3" : ["#f7b5c8", "#a3ddf4", "#d3b4ee"][S]),
          Q.beginPath(),
          Q.roundRect
            ? Q.roundRect(410 + S * 280 - 82, E - 62, 164, 124, 20)
            : Q.rect(410 + S * 280 - 82, E - 62, 164, 124),
          Q.fill(),
          (Q.fillStyle = B),
          Q.fillText(String(t), 410 + S * 280, E));
      }));
  ((Q.strokeStyle = "#d8d5ba"),
    (Q.lineWidth = 3),
    Q.beginPath(),
    Q.moveTo(80, 220),
    Q.lineTo(1240, 220),
    Q.stroke());
  let w = new CanvasTexture(A);
  w.colorSpace = SRGBColorSpace;
  let C = new Mesh(
    new PlaneGeometry(5.17, 1.7),
    new MeshBasicMaterial({
      map: w,
      toneMapped: !1,
    }),
  );
  return (C.position.set(0, 0.9, 0.075), g.add(C), g);
}
function createOption(text, x, z, width = 1.35, height = 0.72) {
  let E = createSign(text, x, 0.1, z, width, height);
  return (
    (E.rotation.x = -Math.PI / 2),
    (E.userData = {
      ...E.userData,
      w: width,
      h: height,
    }),
    E
  );
}
export {
  resolvePaperColor,
  palette,
  createRoadScene,
  createSign,
  createComparison,
  createOption,
};
