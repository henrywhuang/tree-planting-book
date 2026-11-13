import {
  MeshStandardMaterial,
  Mesh,
  SphereGeometry,
  CylinderGeometry,
  TorusGeometry,
  LatheGeometry,
  Vector2,
  Shape,
  ExtrudeGeometry,
  Group,
  CatmullRomCurve3,
  Vector3,
  TubeGeometry,
  DoubleSide,
  SpotLight,
  ConeGeometry,
  ShapeGeometry,
  WebGLRenderer,
  PCFSoftShadowMap,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  Scene,
  Color,
  PerspectiveCamera,
  HemisphereLight,
  DirectionalLight,
  CanvasTexture,
  NoColorSpace,
  MeshPhysicalMaterial,
  BoxGeometry,
  LineSegments,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  BufferAttribute,
  PlaneGeometry,
  FrontSide,
  BackSide,
} from "../../vendor/three.module.js";
function createDeskDecor(parent, groundY = -0.112) {
  let Q = (u, j = {}) =>
      new MeshStandardMaterial({
        color: u,
        roughness: 0.82,
        metalness: 0,
        ...j,
      }),
    w = Q("#a6cbd8"),
    C = Q("#7aaebd"),
    E = Q("#fff0d0"),
    I = Q("#eeb4a5"),
    i = Q("#bf857e"),
    B = ["#86b5cb", "#e4a1b5", "#e6bd6c", "#93b997", "#b9a5ce"];
  function t(u, j, H, oA = 0, mA = 0, WA = 0) {
    let yA = new Mesh(u, j);
    return (
      yA.position.set(oA, mA, WA),
      (yA.castShadow = !0),
      (yA.receiveShadow = !0),
      H.add(yA),
      yA
    );
  }
  function S(u, j, H, oA, mA, WA, yA, gQ) {
    let d = t(new SphereGeometry(1, 28, 20), gQ, u, j, H, oA);
    return (d.scale.set(mA, WA, yA), d);
  }
  function U(u, j, H, oA, mA, WA = 0, yA = 0, gQ = 0, d = 40) {
    return t(new CylinderGeometry(j, H, oA, d), mA, u, WA, yA, gQ);
  }
  function o(u, j, H, oA, mA, WA, yA) {
    let gQ = t(new TorusGeometry(j, H, 10, 48), oA, u, mA, WA, yA);
    return ((gQ.rotation.x = Math.PI / 2), gQ);
  }
  function h(u, j, H, oA = 0, mA = 0, WA = 0) {
    return t(
      new LatheGeometry(
        j.map((yA) => new Vector2(...yA)),
        48,
      ),
      H,
      u,
      oA,
      mA,
      WA,
    );
  }
  function a(u, j, H, oA, mA, WA, yA, gQ, d) {
    let z = new Shape();
    (z.moveTo(-j / 2 + mA, -H / 2),
      z.lineTo(j / 2 - mA, -H / 2),
      z.quadraticCurveTo(j / 2, -H / 2, j / 2, -H / 2 + mA),
      z.lineTo(j / 2, H / 2 - mA),
      z.quadraticCurveTo(j / 2, H / 2, j / 2 - mA, H / 2),
      z.lineTo(-j / 2 + mA, H / 2),
      z.quadraticCurveTo(-j / 2, H / 2, -j / 2, H / 2 - mA),
      z.lineTo(-j / 2, -H / 2 + mA),
      z.quadraticCurveTo(-j / 2, -H / 2, -j / 2 + mA, -H / 2));
    let kA = new ExtrudeGeometry(z, {
      depth: oA,
      bevelEnabled: !0,
      bevelSize: 0.025,
      bevelThickness: 0.018,
      bevelSegments: 3,
      curveSegments: 10,
    });
    return (
      kA.rotateX(-Math.PI / 2),
      kA.translate(0, -oA / 2, 0),
      t(kA, WA, u, yA, gQ, d)
    );
  }
  let P = new Group();
  ((P.name = "\u513F\u7AE5\u4E66\u684C\u88C5\u9970"), parent.add(P));
  let R = new Group();
  ((R.name = "\u7C89\u84DD\u8611\u83C7\u53F0\u706F"),
    R.position.set(-5.95, groundY, -1.3),
    P.add(R),
    h(
      R,
      [
        [0, 0],
        [0.49, 0],
        [0.6, 0.035],
        [0.65, 0.09],
        [0.63, 0.16],
        [0.54, 0.22],
        [0.38, 0.25],
        [0, 0.25],
      ],
      w,
    ),
    o(R, 0.51, 0.026, C, 0, 0.028, 0));
  let f = new CatmullRomCurve3([
    new Vector3(0, 0.2, -0.12),
    new Vector3(-0.14, 0.86, -0.25),
    new Vector3(-0.15, 1.65, -0.2),
    new Vector3(0.04, 1.98, 0.1),
  ]);
  (t(new TubeGeometry(f, 32, 0.092, 12, !1), E, R),
    S(R, 0.04, 1.98, 0.1, 0.145, 0.145, 0.145, C));
  let J = new Group();
  (J.position.set(0.04, 1.94, 0.13),
    (J.rotation.z = 0.2),
    R.add(J),
    h(
      J,
      [
        [0.64, 0],
        [0.67, 0.055],
        [0.65, 0.16],
        [0.56, 0.37],
        [0.41, 0.53],
        [0.23, 0.64],
        [0.12, 0.66],
        [0, 0.66],
      ],
      w,
    ),
    h(
      J,
      [
        [0.59, 0.015],
        [0.59, 0.09],
        [0.5, 0.29],
        [0.34, 0.45],
        [0.14, 0.54],
        [0, 0.54],
      ],
      Q("#fff1d3", {
        side: DoubleSide,
      }),
    ),
    o(J, 0.626, 0.035, E, 0, 0.035, 0));
  let p = U(
    J,
    0.53,
    0.53,
    0.026,
    Q("#fff2c5", {
      emissive: "#ffd99a",
      emissiveIntensity: 0.28,
    }),
    0,
    0.062,
    0,
  );
  ((p.castShadow = !1), S(R, 0.2, 0.245, 0.18, 0.1, 0.035, 0.1, E));
  let M = new CatmullRomCurve3([
    new Vector3(-5.65, groundY + 0.02, -1.7),
    new Vector3(-6.25, groundY + 0.025, -2.45),
    new Vector3(-6.08, groundY + 0.02, -3.35),
    new Vector3(-6.7, groundY + 0.015, -4.2),
  ]);
  t(new TubeGeometry(M, 40, 0.022, 7, !1), Q("#9aafa5"), P);
  let F = new SpotLight("#ffdea6", 1.8, 6, 0.67, 1, 1.5);
  (F.position.set(-5.8, 2.02, -1.12),
    F.target.position.set(-5.3, groundY, 0.1),
    P.add(F),
    P.add(F.target));
  let K = new Group();
  ((K.name = "\u871C\u6843\u5F69\u94C5\u7B14\u7B52"),
    K.position.set(5.4, groundY, -0.65),
    P.add(K),
    h(
      K,
      [
        [0, 0],
        [0.43, 0],
        [0.5, 0.06],
        [0.52, 0.16],
        [0.53, 0.88],
        [0.51, 1],
        [0.46, 1.035],
      ],
      I,
    ),
    U(K, 0.454, 0.454, 0.03, i, 0, 0.26, 0),
    o(K, 0.473, 0.058, I, 0, 1, 0),
    o(K, 0.482, 0.032, E, 0, 0.18, 0));
  let Y = new Group();
  (Y.position.set(0.02, 0.55, 0.515), K.add(Y));
  for (let u = 0; u < 5; u++) {
    let j = (u * Math.PI * 2) / 5;
    S(Y, Math.cos(j) * 0.105, Math.sin(j) * 0.105, 0, 0.09, 0.09, 0.025, E);
  }
  S(Y, 0, 0, 0.025, 0.065, 0.065, 0.03, Q("#e8c476"));
  function n(u, j, H, oA, mA, WA, yA = 0, gQ = 0) {
    let d = new Group();
    (d.position.set(oA, mA, WA), d.rotation.set(gQ, 0, yA), u.add(d));
    let z = Q(j),
      kA = Q("#edd4ac");
    return (
      U(d, 0.061, 0.061, H, z, 0, H / 2, 0, 6),
      U(d, 0.055, 0.061, 0.035, E, 0, 0.035, 0, 6),
      t(new ConeGeometry(0.063, 0.2, 6), kA, d, 0, H + 0.1, 0),
      t(new ConeGeometry(0.022, 0.075, 6), z, d, 0, H + 0.184, 0),
      d
    );
  }
  [
    [-0.23, 0.05, 1.63, -0.15, 0.13],
    [0.08, -0.22, 1.78, 0.12, -0.08],
    [0.21, 0.13, 1.52, 0.19, -0.11],
    [-0.11, 0.25, 1.82, -0.06, 0.17],
    [0.02, 0.03, 1.95, 0.04, 0.02],
  ].forEach(([u, j, H, oA, mA], WA) => n(K, B[WA], H, u, 0.25, j, oA, mA));
  let k = new Group();
  ((k.name = "\u5C0F\u7EC3\u4E60\u672C"),
    k.position.set(5.55, groundY, -2.65),
    (k.rotation.y = -0.12),
    P.add(k),
    a(k, 1.17, 1.42, 0.045, 0.12, Q("#9bb8d2"), 0, 0.06, 0),
    a(k, 1.1, 1.34, 0.065, 0.1, E, 0, 0.105, 0),
    a(k, 1.17, 1.42, 0.035, 0.12, Q("#9bb8d2"), 0, 0.155, 0));
  let q = new Group();
  ((q.rotation.y = 0.17),
    k.add(q),
    a(q, 1.1, 1.35, 0.035, 0.1, Q("#c4b3d8"), -0.04, 0.21, 0.015),
    a(q, 1.04, 1.29, 0.055, 0.09, E, -0.04, 0.255, 0.015),
    a(q, 1.1, 1.35, 0.03, 0.1, Q("#c4b3d8"), -0.04, 0.3, 0.015),
    a(q, 0.045, 1.34, 0.01, 0.012, E, 0.34, 0.328, 0.015));
  let x = new Group();
  ((x.name = "\u53CC\u8272\u5706\u89D2\u6A61\u76AE"),
    x.position.set(5.36, groundY + 0.05, 1.46),
    (x.rotation.y = 0.23),
    P.add(x),
    a(x, 0.86, 0.5, 0.13, 0.16, E, 0, 0.035, 0),
    a(x, 0.53, 0.51, 0.14, 0.13, Q("#e7b5bd"), 0.15, 0.04, 0));
  let c = n(P, "#8bb8a7", 1.15, 6, groundY + 0.1, 2.55, Math.PI / 2, 0);
  c.rotation.y = 0.23;
  let W = new Group();
  (W.position.set(-5.4, -0.02, 2.5), (W.rotation.y = -0.25), P.add(W));
  let L = Q("#ecc2b8");
  (S(W, -0.1, 0.025, -0.05, 0.15, 0.025, 0.15, L),
    S(W, 0.1, 0.025, -0.05, 0.15, 0.025, 0.15, L));
  let O = new Shape();
  (O.moveTo(-0.22, -0.03),
    O.lineTo(0.22, -0.03),
    O.lineTo(0, 0.25),
    O.closePath());
  let gA = new ShapeGeometry(O);
  return (
    gA.rotateX(Math.PI / 2),
    t(
      gA,
      new MeshStandardMaterial({
        color: "#ecc2b8",
        roughness: 1,
        side: DoubleSide,
      }),
      W,
      0,
      0.025,
      0.02,
    ),
    P
  );
}
var clampBook = (g) => Math.max(0, Math.min(1, g)),
  easeBook = (g) => ((g = clampBook(g)), g * g * g * (g * (g * 6 - 15) + 10)),
  coverCamera = {
    position: [8.5, 11.8, 11.2],
    target: [1.9, 0.18, 0],
  },
  openCamera = {
    position: [0, 13.7, 4.4],
    target: [0, 0.18, 0],
  },
  closingCamera = {
    position: [0, 13.7, 4.4],
    target: [0, 0.3, 0],
  },
  openingArcCamera = {
    position: [6, 26, 14],
    target: [1.3, 1.6, 0],
  },
  overheadCamera = {
    position: [0, 25, 12],
    target: [0, 1.6, 0],
  };
function interpolateCamera(g, A, Q, w, C) {
  C = clampBook(C);
  let E = C * C * (3 - 2 * C),
    I = 1 - E;
  return {
    position: g.position.map(
      (i, B) =>
        I * I * I * i +
        3 * I * I * E * A.position[B] +
        3 * I * E * E * Q.position[B] +
        E * E * E * w.position[B],
    ),
    target: g.target.map(
      (i, B) =>
        I * I * I * i +
        3 * I * I * E * A.target[B] +
        3 * I * E * E * Q.target[B] +
        E * E * E * w.target[B],
    ),
  };
}
var closeDuration = 3.7;
function getOpeningPose(g) {
  let A = easeBook((g - 0.4) / 2.5),
    Q = easeBook((g - 0.5) / 2.5),
    w = [0.58, 0.88, 1.18, 1.48].map((I) => easeBook((g - I) / 2.45)),
    C = interpolateCamera(
      coverCamera,
      openingArcCamera,
      overheadCamera,
      openCamera,
      (g - 0.15) / 3.9,
    ),
    E = g > 0.4 && g < 3.93;
  return {
    cover: A,
    block: Q,
    pages: w,
    direction: 1,
    openness: w[3],
    camera: C,
    phase: E ? "open-with-page-fan" : g <= 0.4 ? "cover" : "settle",
    moving: E,
  };
}
function getClosingPose(g) {
  let A = clampBook(g) * closeDuration,
    Q = 1 - easeBook((A - 1) / 2.3),
    w = 1 - easeBook((A - 0.86) / 2.2),
    C = [0.74, 0.52, 0.3, 0.08].map((i) => 1 - easeBook((A - i) / 1.95)),
    E = interpolateCamera(
      closingCamera,
      overheadCamera,
      openingArcCamera,
      coverCamera,
      A / closeDuration,
    ),
    I = A > 0.08 && A < 3.3;
  return {
    cover: Q,
    block: w,
    pages: C,
    direction: -1,
    openness: Q,
    camera: E,
    phase: I ? "close-with-page-fan" : A <= 0.08 ? "open" : "settle",
    moving: I,
  };
}
function applyCameraPose(g, A) {
  (g.position.set(...A.position),
    g.lookAt(...A.target),
    g.updateMatrixWorld(!0));
}
var initialWidth = 1920,
  initialHeight = 1080,
  openingDuration = 5.8,
  canvas = document.getElementById("book-view"),
  renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: !0,
    alpha: !1,
    preserveDrawingBuffer: !0,
  });
renderer.setSize(initialWidth, initialHeight, !1);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = !0;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
var scene = new Scene();
scene.background = new Color("#e8dfd2");
var camera = new PerspectiveCamera(
  35.5,
  initialWidth / initialHeight,
  0.1,
  100,
);
scene.add(new HemisphereLight("#fff7e9", "#a9bba6", 2.15));
var keyLight = new DirectionalLight("#fff0d9", 1.85);
keyLight.position.set(-7, 13, -5);
keyLight.castShadow = !0;
keyLight.shadow.mapSize.set(2048, 2048);
Object.assign(keyLight.shadow.camera, {
  left: -13,
  right: 13,
  top: 13,
  bottom: -13,
  near: 1,
  far: 40,
});
keyLight.shadow.bias = -2e-4;
keyLight.shadow.normalBias = 0.001;
keyLight.shadow.radius = 4;
scene.add(keyLight);
scene.add(keyLight.target);
var fillLight = new DirectionalLight("#ecf4ff", 0.6);
fillLight.position.set(6, 6, 8);
scene.add(fillLight);
function seededNoise(g, A = 0) {
  let Q = Math.imul(g + 374761393, A + 668265263);
  return (
    (Q = Q ^ (Q >>> 13)),
    ((Math.imul(Q, 1274126177) ^ (Q >>> 16)) >>> 0) / 4294967295
  );
}
function createTexture(g, A, Q) {
  let w = document.createElement("canvas");
  ((w.width = g), (w.height = A), Q(w.getContext("2d"), g, A));
  let C = new CanvasTexture(w);
  return ((C.colorSpace = SRGBColorSpace), (C.anisotropy = 8), C);
}
var woodTexture = createTexture(2048, 1024, (g, A, Q) => {
    let w = g.createImageData(A, Q);
    for (let C = 0; C < Q; C++)
      for (let E = 0; E < A; E++) {
        let I = Math.floor(C / (Q / 3)),
          i = E / A,
          B = C / Q,
          t =
            B * 115 +
            1.8 * Math.sin(i * 6.7 + I * 1.7) +
            0.4 * Math.sin(i * 18 + B * 8),
          S = Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI), 7) * 5,
          U = 2 * Math.sin(B * 21 + Math.sin(i * 4)) + 0.8 * Math.sin(t * 3.2),
          o = (seededNoise(E + C * A, 17) - 0.5) * 2,
          h = (C * A + E) * 4,
          a = I === 1 ? 3 : I === 2 ? -3 : 0;
        ((w.data[h] = 202 + a + U - S + o),
          (w.data[h + 1] = 165 + a + U - S * 0.92 + o),
          (w.data[h + 2] = 129 + a + U - S * 0.75 + o),
          (w.data[h + 3] = 255));
      }
    g.putImageData(w, 0, 0);
    for (let C of [Q / 3, (2 * Q) / 3])
      ((g.fillStyle = "rgba(86,61,34,.15)"),
        g.fillRect(0, C, A, 1),
        (g.fillStyle = "rgba(255,236,204,.10)"),
        g.fillRect(0, C + 1, A, 1));
    for (let C = 0; C < 4200; C++) {
      g.strokeStyle = `rgba(78,51,27,${0.02 + seededNoise(C, 6) * 0.1})`;
      let E = seededNoise(C, 2) * A,
        I = seededNoise(C, 4) * Q;
      (g.beginPath(),
        g.moveTo(E, I),
        g.lineTo(E + 4 + seededNoise(C, 7) * 21, I + 0.6 * Math.sin(C)),
        g.stroke());
    }
  }),
  woodBump = woodTexture.clone();
woodBump.colorSpace = NoColorSpace;
var matTexture = createTexture(1024, 1024, (g, A, Q) => {
    let w = g.createImageData(A, Q);
    for (let C = 0; C < Q; C++)
      for (let E = 0; E < A; E++) {
        let I =
            (seededNoise(E + C * A, 23) - 0.5) * 7 +
            Math.sin(E * 1.2) * Math.sin(C * 1.9),
          i = (C * A + E) * 4;
        ((w.data[i] = 110 + I),
          (w.data[i + 1] = 151 + I),
          (w.data[i + 2] = 128 + I),
          (w.data[i + 3] = 255));
      }
    g.putImageData(w, 0, 0);
    for (let C = 0; C < 12e3; C++) {
      let E = seededNoise(C, 12) * A,
        I = seededNoise(C, 31) * Q,
        i = seededNoise(C, 8) * Math.PI;
      ((g.strokeStyle = C % 2 ? "rgba(196,207,179,.15)" : "rgba(14,37,28,.13)"),
        (g.lineWidth = 0.4),
        g.beginPath(),
        g.moveTo(E, I),
        g.lineTo(E + Math.cos(i) * 3, I + Math.sin(i) * 3),
        g.stroke());
    }
  }),
  matBump = matTexture.clone();
matBump.colorSpace = NoColorSpace;
var paperTexture = createTexture(512, 512, (g, A, Q) => {
    ((g.fillStyle = "#fffdf5"), g.fillRect(0, 0, A, Q));
    for (let w = 0; w < 15e3; w++)
      ((g.fillStyle = `rgba(103,86,51,${seededNoise(w, 4) * 0.032})`),
        g.fillRect(seededNoise(w, 2) * A, seededNoise(w, 5) * Q, 1, 0.5));
  }),
  paperBump = createTexture(512, 512, (g, A, Q) => {
    ((g.fillStyle = "#e8b75e"), g.fillRect(0, 0, A, Q));
    for (let w = 0; w < 512; w += 2)
      ((g.strokeStyle =
        w % 4 ? "rgba(255,238,181,.06)" : "rgba(101,65,4,.035)"),
        (g.lineWidth = 0.5),
        g.beginPath(),
        g.moveTo(w, 0),
        g.lineTo(w, Q),
        g.stroke(),
        g.beginPath(),
        g.moveTo(0, w),
        g.lineTo(A, w),
        g.stroke());
  }),
  pageMaterial = new MeshStandardMaterial({
    map: paperTexture,
    roughness: 0.93,
    side: DoubleSide,
    color: "#fffdf9",
  }),
  bookMaterial = new MeshStandardMaterial({
    color: "#ded8c7",
    roughness: 1,
  }),
  coverMaterial = new MeshStandardMaterial({
    map: paperBump,
    roughness: 0.94,
    color: "#fff5d8",
  }),
  bookEdgeMaterial = new MeshPhysicalMaterial({
    map: matTexture,
    color: "#ffffff",
    bumpMap: matBump,
    bumpScale: 0.01,
    roughness: 0.99,
    sheen: 0.3,
    sheenRoughness: 1,
    sheenColor: new Color("#c0d7b9"),
  });
function deskMaterial(g, A, Q, w, C, E = 0, I = 0, i = 0) {
  let B = new Mesh(new BoxGeometry(g, A, Q), w);
  return (
    B.position.set(E, I, i),
    (B.castShadow = !0),
    (B.receiveShadow = !0),
    C.add(B),
    B
  );
}
function createRoundedSlab(g, A, Q, w, C) {
  let E = new Shape();
  (E.moveTo(-g / 2 + w, -A / 2),
    E.lineTo(g / 2 - w, -A / 2),
    E.quadraticCurveTo(g / 2, -A / 2, g / 2, -A / 2 + w),
    E.lineTo(g / 2, A / 2 - w),
    E.quadraticCurveTo(g / 2, A / 2, g / 2 - w, A / 2),
    E.lineTo(-g / 2 + w, A / 2),
    E.quadraticCurveTo(-g / 2, A / 2, -g / 2, A / 2 - w),
    E.lineTo(-g / 2, -A / 2 + w),
    E.quadraticCurveTo(-g / 2, -A / 2, -g / 2 + w, -A / 2));
  let I = new ExtrudeGeometry(E, {
    depth: Q,
    bevelEnabled: !0,
    bevelSegments: 3,
    steps: 1,
    bevelSize: Math.min(0.025, Q * 0.22),
    bevelThickness: Math.min(0.015, Q * 0.22),
    curveSegments: 12,
  });
  (I.rotateX(-Math.PI / 2), I.translate(0, -Q / 2, 0));
  let i = I.attributes.position,
    B = I.attributes.uv;
  for (let S = 0; S < i.count; S++)
    B.setXY(S, i.getX(S) / g + 0.5, i.getZ(S) / A + 0.5);
  let t = new Mesh(I, C);
  return ((t.castShadow = !0), (t.receiveShadow = !0), t);
}
var deskTop = new MeshStandardMaterial({
    map: woodTexture,
    bumpMap: woodBump,
    bumpScale: 0.007,
    roughness: 0.76,
  }),
  deskEdge = createRoundedSlab(21, 12.5, 0.5, 0.48, deskTop);
deskEdge.position.set(0, -0.38, -1.7);
scene.add(deskEdge);
var matSlab = new MeshStandardMaterial({
  color: "#be916c",
  roughness: 0.82,
});
deskMaterial(20.2, 0.65, 0.15, matSlab, scene, 0, -0.93, 4.35);
for (let g of [-9.1, 9.1])
  for (let A of [-6.7, 3.8])
    deskMaterial(0.6, 4.5, 0.6, matSlab, scene, g, -2.9, A);
deskMaterial(
  70,
  0.1,
  60,
  new MeshStandardMaterial({
    color: "#dfd2c3",
    roughness: 1,
  }),
  scene,
  0,
  -5.2,
  0,
);
var matOutline = createRoundedSlab(
  13.16,
  8.16,
  0.02,
  0.24,
  new MeshStandardMaterial({
    color: "#243d32",
    roughness: 0.96,
  }),
);
matOutline.position.y = -0.101;
scene.add(matOutline);
var matSeam = createRoundedSlab(13.1, 8.1, 0.044, 0.24, bookEdgeMaterial);
matSeam.position.y = -0.07;
scene.add(matSeam);
var matStitches = [],
  stitchMaterial = 13.1 / 2 - 0.11,
  stitchPositions = 8.1 / 2 - 0.11;
for (let g = 0; g < 160; g++) {
  let A = -stitchMaterial + (2 * stitchMaterial * g) / 160;
  matStitches.push(
    new Vector3(A, -0.035, -stitchPositions),
    new Vector3(A + 0.035, -0.035, -stitchPositions),
    new Vector3(A, -0.035, stitchPositions),
    new Vector3(A + 0.035, -0.035, stitchPositions),
  );
}
for (let g = 0; g < 95; g++) {
  let A = -stitchPositions + (2 * stitchPositions * g) / 95;
  matStitches.push(
    new Vector3(-stitchMaterial, -0.035, A),
    new Vector3(-stitchMaterial, -0.035, A + 0.035),
    new Vector3(stitchMaterial, -0.035, A),
    new Vector3(stitchMaterial, -0.035, A + 0.035),
  );
}
scene.add(
  new LineSegments(
    new BufferGeometry().setFromPoints(matStitches),
    new LineBasicMaterial({
      color: "#a2b19a",
      transparent: !0,
      opacity: 0.48,
    }),
  ),
);
createDeskDecor(scene);
var bookRoot = new Group();
scene.add(bookRoot);
bookRoot.position.y = -0.035;
var pageWidth = 4.13,
  pageHeight = 5.95,
  coverWidth = 4.4,
  coverHeight = 6.22,
  hingePosition = createRoundedSlab(
    coverWidth,
    coverHeight,
    0.085,
    0.07,
    coverMaterial,
  );
hingePosition.position.set(coverWidth / 2, 0.055, 0);
bookRoot.add(hingePosition);
var coverHinge = new Group();
bookRoot.add(coverHinge);
var frontCover = createRoundedSlab(
  coverWidth,
  coverHeight,
  0.085,
  0.07,
  coverMaterial,
);
frontCover.position.x = coverWidth / 2;
coverHinge.add(frontCover);
for (let g of [0.18, 0.235]) {
  let A = [
    new Vector3(g, 0.064, -coverHeight / 2 + g),
    new Vector3(coverWidth - g, 0.064, -coverHeight / 2 + g),
    new Vector3(coverWidth - g, 0.064, coverHeight / 2 - g),
    new Vector3(g, 0.064, coverHeight / 2 - g),
    new Vector3(g, 0.064, -coverHeight / 2 + g),
  ];
  coverHinge.add(
    new Line(
      new BufferGeometry().setFromPoints(A),
      new LineBasicMaterial({
        color: g < 0.2 ? "#bb861e" : "#efc24e",
        transparent: !0,
        opacity: 0.62,
      }),
    ),
  );
}
deskMaterial(
  pageWidth - 0.02,
  0.008,
  pageHeight - 0.02,
  pageMaterial,
  coverHinge,
  pageWidth / 2,
  -0.052,
  0,
);
var pageBlockHinge = new Group();
bookRoot.add(pageBlockHinge);
deskMaterial(
  pageWidth,
  0.235,
  pageHeight,
  bookMaterial,
  pageBlockHinge,
  pageWidth / 2,
  0.2275,
  0,
);
var loosePages = new Group();
bookRoot.add(loosePages);
deskMaterial(
  pageWidth,
  0.235,
  pageHeight,
  bookMaterial,
  loosePages,
  pageWidth / 2,
  -0.1175,
  0,
);
function createLeaf(g, A, Q) {
  for (let w = 0; w < 29; w++) {
    let C = Q + ((A - Q) * w) / 28,
      E = [
        new Vector3(0.025, C, -pageHeight / 2 - 0.001),
        new Vector3(pageWidth, C, -pageHeight / 2 - 0.001),
        new Vector3(pageWidth + 0.001, C, pageHeight / 2 + 0.001),
        new Vector3(0.025, C, pageHeight / 2 + 0.001),
      ];
    g.add(
      new Line(
        new BufferGeometry().setFromPoints(E),
        new LineBasicMaterial({
          color: w % 4 === 0 ? "#bbb5a5" : "#f6f1e4",
          transparent: !0,
          opacity: 0.47,
        }),
      ),
    );
  }
}
createLeaf(pageBlockHinge, 0.345, 0.11);
createLeaf(loosePages, 0, -0.235);
var pageSegments = 70,
  pageDepthSegments = 22;
function createPageGeometry() {
  let g = new BufferGeometry(),
    A = new Float32Array((pageSegments + 1) * (pageDepthSegments + 1) * 3),
    Q = new Float32Array((pageSegments + 1) * (pageDepthSegments + 1) * 2),
    w = [];
  for (let E = 0; E <= pageDepthSegments; E++)
    for (let I = 0; I <= pageSegments; I++) {
      let i = E * (pageSegments + 1) + I;
      ((Q[i * 2] = I / pageSegments),
        (Q[i * 2 + 1] = E / pageDepthSegments),
        I < pageSegments &&
          E < pageDepthSegments &&
          w.push(
            i,
            i + pageSegments + 1,
            i + 1,
            i + 1,
            i + pageSegments + 1,
            i + pageSegments + 2,
          ));
    }
  (g.setAttribute("position", new BufferAttribute(A, 3)),
    g.setAttribute("uv", new BufferAttribute(Q, 2)),
    g.setIndex(w),
    g.computeVertexNormals());
  let C = new Mesh(g, pageMaterial);
  return ((C.castShadow = !0), (C.receiveShadow = !0), bookRoot.add(C), C);
}
var leftPageGeometry = createPageGeometry(),
  leftLeaf = Array.from(
    {
      length: 4,
    },
    () => createPageGeometry(),
  ),
  rightLeaf = new Line(
    new BufferGeometry().setFromPoints([
      new Vector3(0.025, 0.362, -pageHeight / 2 + 0.01),
      new Vector3(0.025, 0.362, pageHeight / 2 - 0.01),
    ]),
    new LineBasicMaterial({
      color: "#9b907b",
      transparent: !0,
      opacity: 0.38,
    }),
  );
bookRoot.add(rightLeaf);
function deformPage(g, A, Q, w, C = 0) {
  let E = g.geometry.attributes.position.array,
    I = [],
    i = [],
    B = 0.025,
    t = Q;
  for (let S = 0; S <= pageSegments; S++) {
    if (S) {
      let U = (S - 0.5) / pageSegments,
        o = A + w * Math.sin(Math.PI * U) * (0.9 + 0.1 * Math.sin(U * 6));
      ((B += (pageWidth / pageSegments) * Math.cos(o)),
        (t += (pageWidth / pageSegments) * Math.sin(o)));
    }
    (I.push(B), i.push(t));
  }
  for (let S = 0; S <= pageDepthSegments; S++)
    for (let U = 0; U <= pageSegments; U++) {
      let o = U / pageSegments,
        h = S / pageDepthSegments,
        a = (S * (pageSegments + 1) + U) * 3,
        P = -C * Math.exp(-o * 14);
      ((E[a] = I[U]),
        (E[a + 1] =
          i[U] + P + 0.007 * Math.sin(h * Math.PI) * Math.sin(o * Math.PI)),
        (E[a + 2] =
          (h - 0.5) * pageHeight +
          0.015 *
            Math.sin(A) *
            Math.sin(o * Math.PI) *
            Math.sin(h * Math.PI * 2)));
    }
  ((g.geometry.attributes.position.needsUpdate = !0),
    g.geometry.computeVertexNormals(),
    g.geometry.computeBoundingSphere());
}
var spineGeometry = new CylinderGeometry(
  0.16,
  0.16,
  coverHeight - 0.1,
  28,
  1,
  !1,
  Math.PI / 2,
  Math.PI,
);
spineGeometry.rotateX(Math.PI / 2);
var spine = new Mesh(spineGeometry, coverMaterial);
spine.position.set(-0.025, 0.3, 0);
spine.castShadow = !0;
bookRoot.add(spine);
var ribbonGeometry = new PlaneGeometry(0.105, 1.02, 2, 24);
ribbonGeometry.rotateX(-Math.PI / 2);
var ribbonVertices = ribbonGeometry.attributes.position;
for (let g = 0; g < ribbonVertices.count; g++) {
  let A = ribbonVertices.getZ(g),
    Q = (A + 0.51) / 1.02;
  ribbonVertices.setXYZ(
    g,
    ribbonVertices.getX(g) + 0.16 * Q * Q,
    0.012 + 0.025 * Math.sin(Q * Math.PI),
    pageHeight / 2 + 0.02 + Q * 0.94,
  );
}
ribbonGeometry.computeVertexNormals();
var ribbon = new Mesh(
  ribbonGeometry,
  new MeshStandardMaterial({
    color: "#173457",
    roughness: 0.9,
    side: DoubleSide,
  }),
);
ribbon.castShadow = !0;
ribbon.receiveShadow = !0;
bookRoot.add(ribbon);
ribbon.userData.sizingDecorative = !0;
var clampPage = (g) => Math.min(1, Math.max(0, g));
var lerpPage = (g, A, Q) => g + (A - g) * Q;
function applyBookPose(g) {
  let A = (E) => ((E = clampPage(E)), E * E * (3 - 2 * E)),
    Q = g.cover;
  ((coverHinge.rotation.z = Math.PI * Q),
    (coverHinge.position.y = lerpPage(0.668, 0.106, Q)),
    (spine.position.y = lerpPage(0.3, 0.11, Q)));
  let w = g.block;
  ((loosePages.rotation.z = Math.PI * w),
    (loosePages.position.y = lerpPage(0.597, 0.119, w)),
    (rightLeaf.visible = g.pages.every((E) => E >= 0.999999)),
    deformPage(leftPageGeometry, 0, 0.37, 0, 0.012),
    (leftPageGeometry.castShadow = !1));
  let C = [];
  for (let E = 0; E < leftLeaf.length; E++) {
    let I = g.pages[E];
    (C.push(Math.PI * I),
      deformPage(
        leftLeaf[E],
        Math.PI * I,
        lerpPage(0.602 + E * 0.005, 0.37 + (leftLeaf.length - 1 - E) * 8e-4, I),
        (g.direction > 0 ? -0.55 : 0.45) *
          Math.sin(Math.PI * I) *
          (1 - E * 0.04),
        lerpPage(0.006, 0.012, I),
      ),
      (leftLeaf[E].castShadow = I < 0.995));
  }
  return ((bookRoot.rotation.x = 0), C);
}
function openBookAt(elapsed, { draw = !0 } = {}) {
  elapsed = Math.min(openingDuration, Math.max(0, elapsed));
  let Q = getOpeningPose(elapsed),
    w = applyBookPose(Q);
  (applyCameraPose(camera, Q.camera),
    draw && renderer.render(scene, camera),
    (window.__bookState = {
      time: elapsed,
      coverAngle: coverHinge.rotation.z,
      pageAngles: w,
      openness: Q.openness,
      phase: Q.phase,
      moving: Q.moving,
      direction: Q.direction,
      camera: [...camera.position],
      blankInterior: !0,
    }));
}
openBookAt(0);
function closeBookAt(progress, { draw = !0 } = {}) {
  let Q = clampPage(progress),
    w = getClosingPose(Q),
    C = applyBookPose(w);
  (applyCameraPose(camera, w.camera),
    draw && renderer.render(scene, camera),
    (window.__bookState = {
      time: 5.8,
      coverAngle: coverHinge.rotation.z,
      pageAngles: C,
      openness: w.openness,
      phase: w.phase,
      moving: w.moving,
      direction: w.direction,
      camera: [...camera.position],
      closing: !0,
      closeProgress: Q,
      closed: w.openness <= 1e-6,
      blankInterior: !0,
    }));
}
var turningGeometry = createPageGeometry();
turningGeometry.material = pageMaterial.clone();
turningGeometry.material.side = FrontSide;
var turningLeaf = new Mesh(
  turningGeometry.geometry.clone(),
  new MeshStandardMaterial({
    map: paperTexture,
    color: "#f5eddc",
    roughness: 0.96,
    side: BackSide,
  }),
);
bookRoot.add(turningLeaf);
turningLeaf.castShadow = !0;
turningLeaf.receiveShadow = !0;
function turnPageAt(progress = null) {
  let A = progress !== null && progress >= 0 && progress <= 1;
  if (((turningGeometry.visible = A), (turningLeaf.visible = A), !A)) {
    window.__chapterPage = {
      active: !1,
    };
    return;
  }
  let Q = clampPage(progress),
    w = Q * Q * (3 - 2 * Q);
  deformPage(
    turningGeometry,
    Math.PI * w,
    0.378,
    0.42 * Math.sin(Math.PI * w),
    0.01,
  );
  let C = turningGeometry.geometry.attributes.position,
    E = turningGeometry.geometry.attributes.normal,
    I = turningLeaf.geometry.attributes.position;
  for (let i = 0; i < C.count; i++)
    I.setXYZ(
      i,
      C.getX(i) - E.getX(i) * 0.007,
      C.getY(i) - E.getY(i) * 0.007,
      C.getZ(i) - E.getZ(i) * 0.007,
    );
  ((I.needsUpdate = !0),
    turningLeaf.geometry.computeVertexNormals(),
    turningLeaf.geometry.computeBoundingSphere(),
    (window.__chapterPage = {
      active: !0,
      progress: Q,
      angle: Math.PI * w,
      hingeX: 0.025,
      hingeY: 0.333,
      width: pageWidth,
      height: pageHeight,
      attachedToBook: !0,
    }));
}
turnPageAt(null);
export {
  scene,
  camera,
  coverHinge,
  renderer,
  openBookAt,
  closeBookAt,
  turnPageAt,
  bookRoot,
};
