import {
  MeshStandardMaterial,
  Shape,
  Mesh,
  ExtrudeGeometry,
  Group,
  CanvasTexture,
  SRGBColorSpace,
  PlaneGeometry,
  MeshBasicMaterial,
  BoxGeometry,
  Vector3,
} from "../../vendor/three.module.js";
var signEdgeMaterial = new MeshStandardMaterial({
  color: "#d9ceba",
  roughness: 1,
});
function signShape(g, A, Q = 0.045) {
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
function extrudeSign(g, A, Q, w = 0, C = 0.025) {
  let E = new Mesh(
    new ExtrudeGeometry(g, {
      depth: C,
      bevelEnabled: !1,
      curveSegments: 12,
    }),
    [
      new MeshStandardMaterial({
        color: A,
        roughness: 1,
      }),
      signEdgeMaterial,
    ],
  );
  return (
    (E.position.z = w),
    (E.castShadow = !0),
    (E.receiveShadow = !0),
    Q.add(E),
    E
  );
}
function createPaperCard(g, A, Q, w = "#fff7e5", C = "#2D6C45", E = null) {
  let I = new Group();
  if (E) {
    let i = extrudeSign(signShape(A + 0.055, Q + 0.055), E, I, -0.025, 0.02);
    i.position.y = -0.0275;
  }
  if ((extrudeSign(signShape(A, Q), w, I), g)) {
    let i = document.createElement("canvas");
    ((i.width = 1200), (i.height = Math.round((1200 * Q) / A)));
    let B = i.getContext("2d");
    ((B.font = `600 ${Math.floor(i.height * 0.65)}px BoardSC`),
      (B.textAlign = "center"),
      (B.textBaseline = "middle"),
      (B.fillStyle = C),
      B.fillText(g, i.width / 2, i.height / 2, i.width * 0.92));
    let t = new CanvasTexture(i);
    t.colorSpace = SRGBColorSpace;
    let S = new Mesh(
      new PlaneGeometry(A, Q),
      new MeshBasicMaterial({
        map: t,
        transparent: !0,
        depthWrite: !1,
      }),
    );
    (S.position.set(0, Q / 2, 0.028), I.add(S));
  }
  return I;
}
function createHeldSign(g) {
  let A = new Group();
  (A.position.set(0, 1.9, -0.05), (A.rotation.x = -0.12));
  let Q = createPaperCard(
    `${g}\u68F5 / ${g - 1}\u6BB5`,
    2.7,
    0.48,
    "#fff7e5",
    "#2D6C45",
    "#8BDE40",
  );
  A.add(Q);
  let w = [];
  for (let E of [-0.7, 0.7]) {
    let I = new Mesh(
      new BoxGeometry(0.055, 0.96, 0.025),
      new MeshStandardMaterial({
        color: "#e5c684",
        roughness: 1,
      }),
    );
    (I.position.set(E, -0.44, -0.024),
      (I.castShadow = !0),
      A.add(I),
      w.push(new Vector3(E, -0.88, -0.01)));
  }
  let C = null;
  return (
    g > 2 &&
      ((C = createPaperCard(
        `${g - 1}\u68F5 / ${g - 2}\u6BB5`,
        2.7,
        0.48,
        "#fff7e5",
        "#2D6C45",
        "#8BDE40",
      )),
      (C.position.z = 0.004),
      (C.visible = !1),
      A.add(C)),
    {
      group: A,
      face: Q,
      previous: C,
      handles: w,
      value: [g, g - 1],
    }
  );
}
function createSongChart() {
  let g = createPaperCard("", 5.6, 1.8, "#fff7e5", "#2D6C45", "#8BDE40");
  (g.position.set(0.35, -0.025, 0), (g.rotation.x = -0.12));
  let A = [];
  for (let [C, E, I] of [
    ["\u68F5\u6570", 1.03, "#2D6C45"],
    ["\u6BB5\u6570", 0.28, "#674195"],
  ]) {
    let i = createPaperCard(C, 1.05, 0.48, "#fff7e5", I);
    (i.position.set(-2.06, E, 0.04), g.add(i), A.push(i));
  }
  let Q = [],
    w = ["#F282A0", "#50B6ED", "#AC84EC"];
  for (let C = 0; C < 3; C++) {
    let E = new Group();
    ((E.position.x = -0.65 + C * 1.27), g.add(E));
    let I = createPaperCard(String(C + 2), 0.94, 0.5, "#c6ec94", "#2D6C45");
    (I.position.set(0, 1.02, 0.04), E.add(I));
    let i = createPaperCard(String(C + 1), 0.94, 0.5, w[C], "#594071");
    (i.position.set(0, 0.27, 0.04), E.add(i));
    let B = new Mesh(
      new BoxGeometry(0.025, 0.14, 0.012),
      new MeshStandardMaterial({
        color: "#d2bf98",
        roughness: 1,
      }),
    );
    (B.position.set(0, 0.86, 0.035),
      E.add(B),
      Q.push({
        group: E,
        upper: I,
        lower: i,
        value: [C + 2, C + 1],
      }));
  }
  for (let C of [-2.3, 2.3]) {
    let E = new Mesh(
      new BoxGeometry(0.4, 0.014, 0.48),
      new MeshStandardMaterial({
        color: "#eee0bb",
        roughness: 1,
      }),
    );
    (E.position.set(C, 0.008, -0.14),
      (E.rotation.x = 0.12),
      (E.castShadow = !0),
      (E.receiveShadow = !0),
      g.add(E));
  }
  return {
    group: g,
    labels: A,
    columns: Q,
    grip: new Vector3(-2.78, 0.68, 0.075),
    values: {
      trees: [2, 3, 4],
      segments: [1, 2, 3],
    },
  };
}
function prepareShotLayout(g) {
  for (let A of g.roads)
    for (let Q of g.labels.filter(
      (w) => w.object.parent === A.group && /^\d$/.test(w.text),
    ))
      ((Q.object.rotation.x = -0.12),
        (Q.object.position.y = -0.015),
        Q.object.scale.setScalar(1.45));
  if (["demo2", "demo3", "demo4"].includes(g.shot.mode)) {
    let A = g.labels.filter((Q) => Q.text.includes("\u68F5  /"));
    (A.forEach((Q) => Q.object.removeFromParent()),
      (g.labels = g.labels.filter((Q) => !A.includes(Q))),
      (g.heldSign = createHeldSign(g.shot.trees)),
      g.group.add(g.heldSign.group),
      g.avatar.position.set(0, 0.043, 0.3),
      (g.avatar.rotation.x = 0),
      g.avatar.scale.setScalar(0.75));
  }
  ["compare", "pair"].includes(g.shot.mode) &&
    ([...g.group.children]
      .filter((A) => A !== g.avatar)
      .forEach((A) => g.group.remove(A)),
    Object.assign(g, {
      trees: [],
      roads: [],
      labels: [],
      flags: [],
      tools: [],
      rows: [],
    }),
    (g.chart = createSongChart()),
    g.group.add(g.chart.group),
    g.avatar.position.set(-3.15, 0, 0.65),
    g.avatar.scale.setScalar(0.9),
    g.camera.set(
      0,
      g.shot.mode === "compare" ? 8.7 : 7.7,
      g.shot.mode === "compare" ? 11.8 : 10.4,
    ),
    g.target.set(0, 1, 0));
}
var sizingRules = {
  schemaVersion: 1,
  bookScale: 1.2,
  contentScale: 1.2,
  anchorY: -0.035,
  approvedOn: "2026-11-04",
  approvedPreview:
    "\u5C3A\u5BF8\u9884\u89C8/\u4E66\u672C\u653E\u592720/\u653E\u592720%_\u6559\u5B66\u753B\u9762.png",
  appliesTo:
    "\u5F53\u524D\u53CA\u540E\u7EED\u6240\u6709\u7ACB\u4F53\u4E66\u4E3B\u9898",
  deskScale: 1,
  cameraScale: 1,
  safeMarginPixels: 24,
  contentBottomMarginPixels: 24,
  decorShiftX: {
    粉蓝蘑菇台灯: -0.35,
    蜜桃彩铅笔筒: 0.65,
    小练习本: 0.35,
    双色圆角橡皮: 0.65,
    loosePencil: 0.9,
    heartSticker: -0.45,
    lampCableAndLight: -0.35,
  },
};
function createStageSizer({
  scene: scene,
  book: book,
  contents = [],
  markers = [],
}) {
  let C = book.position.clone(),
    E = contents.map((P) => P.position.clone()),
    I = markers.map((P) => P.position.clone()),
    i = scene.getObjectByName("\u513F\u7AE5\u4E66\u684C\u88C5\u9970"),
    B = i
      ? i.children.map((P) => ({
          object: P,
          x: P.position.x,
        }))
      : [],
    t = sizingRules.bookScale,
    S = sizingRules.anchorY;
  function U(P) {
    return ((P.x *= t), (P.y = S + (P.y - S) * t), (P.z *= t), P);
  }
  function o() {
    (book.scale.setScalar(1),
      book.position.copy(C),
      contents.forEach((P, R) => {
        (P.scale.setScalar(1), P.position.copy(E[R]));
      }),
      markers.forEach((P, R) => {
        (P.scale.setScalar(1), P.position.copy(I[R]));
      }),
      B.forEach(({ object: P, x: R }) => (P.position.x = R)));
  }
  function h() {
    (book.scale.setScalar(t),
      contents.forEach((P, R) => {
        (P.scale.setScalar(sizingRules.contentScale),
          P.position.copy(E[R]),
          U(P.position));
      }),
      markers.forEach((P) => {
        (P.scale.setScalar(t), U(P.position));
      }));
    for (let { object: P, x: R } of B) {
      let f = sizingRules.decorShiftX[P.name],
        J = 0;
      (f !== void 0
        ? (J = f)
        : P.isGroup && R > 5.9
          ? (J = sizingRules.decorShiftX.loosePencil)
          : P.isGroup && R < -5
            ? (J = sizingRules.decorShiftX.heartSticker)
            : (P.geometry?.type === "TubeGeometry" || R < -4.5) &&
              (J = sizingRules.decorShiftX.lampCableAndLight),
        (P.position.x = R + J));
    }
    scene.updateMatrixWorld(!0);
  }
  function a(P, { width: R = 1920, height: f = 1080 } = {}) {
    P.updateMatrixWorld(!0);
    let J = P.position.clone(),
      p = J.clone(),
      M = J.clone(),
      F = sizingRules.safeMarginPixels,
      K = 0,
      Y = null;
    function n(s, k) {
      let q = 1 - (2 * F) / R,
        x = 1 - (2 * F) / f,
        c = 1 - (2 * k) / f;
      s.traverseVisible((W) => {
        if (W.userData.sizingDecorative) return;
        let L = W.geometry?.attributes?.position;
        if (L)
          for (let O = 0; O < L.count; O++) {
            (J.fromBufferAttribute(L, O).applyMatrix4(W.matrixWorld),
              p.copy(J).applyMatrix4(P.matrixWorldInverse));
            let gA = -p.z;
            if (gA <= 0) continue;
            M.copy(J).project(P);
            let u = Math.max(
              gA * (Math.abs(M.x) / q - 1),
              gA * ((M.y >= 0 ? M.y / x : -M.y / c) - 1),
            );
            u > K &&
              ((K = u),
              (Y = {
                name: W.name,
                type: W.geometry.type,
                parent: W.parent?.name,
                screen: M.toArray(),
                world: J.toArray(),
              }));
          }
      });
    }
    if (
      (n(book, F),
      contents.forEach((s) => n(s, sizingRules.contentBottomMarginPixels)),
      K > 1e-6)
    ) {
      let s = P.getWorldDirection(J);
      (P.position.addScaledVector(s, -K - 0.02), P.updateMatrixWorld(!0));
    }
    return ((window.__stageFitCause = Y), Math.max(0, K));
  }
  return {
    scale: t,
    reset: o,
    apply: h,
    fit: a,
    point: U,
  };
}
export { prepareShotLayout, createStageSizer };
