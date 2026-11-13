import {
  Shape,
  ShapeGeometry,
  CanvasTexture,
  SRGBColorSpace,
  Group,
  Sprite,
  SpriteMaterial,
  Mesh,
  MeshBasicMaterial,
  DoubleSide,
  AdditiveBlending,
} from "../../vendor/three.module.js";
var partyColors = [
    "#CE4878",
    "#C88D24",
    "#298CB2",
    "#7C50AE",
    "#479465",
    "#D47746",
  ],
  partyNoise = (g) => {
    let A = Math.sin(g * 127.1 + 31.7) * 43758.5453;
    return A - Math.floor(A);
  };
function createStarGeometry() {
  let g = new Shape();
  for (let A = 0; A < 10; A++) {
    let Q = (A * Math.PI) / 5,
      w = A % 2 ? 0.43 : 1,
      C = Math.sin(Q) * w,
      E = Math.cos(Q) * w;
    A ? g.lineTo(C, E) : g.moveTo(C, E);
  }
  return (g.closePath(), new ShapeGeometry(g));
}
function createLeafGeometry() {
  let g = new Shape();
  return (
    g.moveTo(0, -1),
    g.bezierCurveTo(-1.1, -0.4, -0.8, 0.8, 0, 1),
    g.bezierCurveTo(0.8, 0.8, 1.1, -0.4, 0, -1),
    new ShapeGeometry(g)
  );
}
var starGeometry = createStarGeometry(),
  leafGeometry = createLeafGeometry(),
  numberTextureCache = [];
function createNumberTexture(g) {
  if (numberTextureCache[g]) return numberTextureCache[g];
  let A = document.createElement("canvas");
  ((A.width = 128), (A.height = 160));
  let Q = A.getContext("2d");
  ((Q.font = "800 133px BoardSC"),
    (Q.textAlign = "center"),
    (Q.textBaseline = "middle"),
    (Q.fillStyle = partyColors[g % partyColors.length]),
    Q.fillText(String(g + 1), 64, 88));
  let w = new CanvasTexture(A);
  return ((w.colorSpace = SRGBColorSpace), (numberTextureCache[g] = w), w);
}
function createParticleTexture() {
  let g = document.createElement("canvas");
  g.width = g.height = 96;
  let A = g.getContext("2d"),
    Q = A.createRadialGradient(48, 48, 3, 48, 48, 47);
  (Q.addColorStop(0, "#ffffffc0"),
    Q.addColorStop(0.24, "#ffffff6b"),
    Q.addColorStop(0.6, "#ffffff1c"),
    Q.addColorStop(1, "#ffffff00"),
    (A.fillStyle = Q),
    A.fillRect(0, 0, 96, 96));
  let w = new CanvasTexture(g);
  return ((w.colorSpace = SRGBColorSpace), w);
}
var particleTexture = createParticleTexture();
function createCelebration(parent) {
  let A = new Group();
  parent.add(A);
  let Q = [],
    w = 0,
    C = -99,
    E = 0,
    I = matchMedia("(prefers-reduced-motion:reduce)").matches;
  function i() {
    for (let S of Q)
      (S.mesh.material.dispose(),
        A.remove(S.mesh),
        S.halo && (S.halo.material.dispose(), A.remove(S.halo)));
    Q = [];
  }
  function B(S, U) {
    (i(), (w = S), (C = U), E++);
    for (let o = 0; o < (I ? 22 : 132); o++) {
      let h = partyNoise(o + E * 70) * Math.PI * 2,
        a = 1.2 + partyNoise(o + 201) * 2,
        P = S === 0 ? Math.floor(o / 33) * 0.16 : 0,
        R;
      S === 2 && o % 3 !== 0
        ? (R = new Sprite(
            new SpriteMaterial({
              map: createNumberTexture(o % 9),
              transparent: !0,
              depthWrite: !1,
              toneMapped: !1,
            }),
          ))
        : (R = new Mesh(
            S === 1 ? leafGeometry : starGeometry,
            new MeshBasicMaterial({
              color: partyColors[o % 6],
              side: DoubleSide,
              transparent: !0,
              depthWrite: !1,
              toneMapped: !1,
            }),
          ));
      let f =
        o % 3 === 0
          ? new Sprite(
              new SpriteMaterial({
                map: particleTexture,
                color: partyColors[o % 6],
                transparent: !0,
                opacity: 0.5,
                depthWrite: !1,
                toneMapped: !1,
                blending: AdditiveBlending,
              }),
            )
          : null;
      (f && ((f.userData.sizingDecorative = !0), (f.renderOrder = 2), A.add(f)),
        (R.renderOrder = 3),
        (R.userData.sizingDecorative = !0));
      let J = S === 2 ? 0.4 : S === 1 ? 0.17 : 0.14;
      (R.scale.setScalar(J),
        A.add(R),
        Q.push({
          mesh: R,
          halo: f,
          delay: P,
          a: h,
          sp: a,
          scale: J,
          spin: (partyNoise(o + 305) - 0.5) * 8,
          origin:
            S === 0
              ? [(Math.floor(o / 33) - 1.5) * 1.9, 2.7, -0.25]
              : [(partyNoise(o + 100) - 0.5) * 5.5, 0.15, 0.35],
          rise: 3.1 + partyNoise(o + 401) * 1.8,
        }));
    }
  }
  function t(S) {
    let U = S - C;
    if (((A.visible = U >= 0 && U < 3.8), !!A.visible))
      for (let o of Q) {
        let h = U - o.delay,
          a = o.mesh;
        if (h < 0) {
          ((a.visible = !1), o.halo && (o.halo.visible = !1));
          continue;
        }
        ((a.visible = !0), o.halo && (o.halo.visible = !0));
        let P = Math.min(1, h / 3.5);
        if (w === 0) {
          let R = Math.min(1, h / 0.48);
          if (h < 0.48)
            (a.position.set(o.origin[0], 0.1 + R * 2.6, o.origin[2]),
              a.scale.setScalar(0.065 + R * 0.075));
          else {
            let f = h - 0.48;
            (a.position.set(
              o.origin[0] + Math.cos(o.a) * o.sp * f,
              o.origin[1] + Math.sin(o.a) * o.sp * f - 0.65 * f * f,
              o.origin[2] + Math.cos(o.a * 0.7) * f * 0.35,
            ),
              a.scale.setScalar(o.scale * (1 + 0.4 * Math.sin(f * 4))));
          }
        } else
          (a.position.set(
            o.origin[0] + Math.cos(o.a) * o.sp * h * 0.64,
            o.origin[1] + o.rise * h - 1.15 * h * h,
            o.origin[2] + Math.sin(o.a) * h * 0.9,
          ),
            a.scale.setScalar(o.scale * (0.7 + 0.3 * Math.sin(Math.PI * P))));
        (I &&
          (a.position.set(
            o.origin[0] + Math.cos(o.a) * 0.3,
            o.origin[1] + 0.15,
            o.origin[2],
          ),
          a.scale.setScalar(o.scale * 0.7)),
          (a.rotation.z = I ? 0 : o.spin * h),
          a.isMesh && (a.rotation.y = 0.35 * Math.sin(h * 3 + o.a)),
          (a.material.opacity = Math.max(
            0,
            Math.min(1, 1.4 - Math.pow(P, 2.1)),
          )),
          o.halo &&
            (o.halo.position.copy(a.position),
            o.halo.scale.setScalar(a.scale.x * (w === 2 ? 3 : 4.6)),
            (o.halo.material.opacity =
              a.material.opacity *
              (I ? 0.22 : 0.36 + 0.16 * Math.sin(h * 5 + o.a)))));
      }
  }
  return {
    burst: B,
    update: t,
    get variant() {
      return w;
    },
    get active() {
      return A.visible;
    },
    get proof() {
      return {
        palette: partyColors,
        halos: Q.filter((S) => S.halo).length,
        particles: Q.length,
        active: A.visible,
      };
    },
  };
}
export { createCelebration };
