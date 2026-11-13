import { Vector3 } from "../../vendor/three.module.js";
import { placeFoot } from "./character.js";
var clampWalk = (g) => Math.max(0, Math.min(1, g)),
  easeWalk = (g) => ((g = clampWalk(g)), g * g * (3 - 2 * g));
function createLocomotion(onFootstep = () => {}) {
  let A = new WeakMap(),
    Q = new WeakMap();
  function w(E) {
    A.delete(E);
  }
  function C(
    E,
    I,
    { groundY: i = 0.4005, label: B = "walk", enabled: t = !0 } = {},
  ) {
    let S = E.position.clone(),
      U = E.userData.rig,
      o = E.userData.transfer,
      h = A.get(E);
    if (o && t) {
      A.delete(E);
      let K = Q.get(E);
      (!K || K.id !== o.id) &&
        ((K = {
          id: o.id,
          takeoff: !1,
          land: !1,
        }),
        Q.set(E, K));
      let Y = o.p,
        n = clampWalk((Y - 0.16) / 0.68),
        s = Y > 0.16 && Y < 0.84;
      if (
        (Y >= 0.16 &&
          !K.takeoff &&
          ((K.takeoff = !0),
          onFootstep({
            type: "takeoff",
            label: B,
            time: I,
          })),
        Y >= 0.84 &&
          !K.land &&
          ((K.land = !0),
          onFootstep({
            type: "jump-land",
            label: B,
            time: I,
          })),
        (U.body.position.y += s
          ? o.height * Math.sin(Math.PI * n)
          : Y < 0.16
            ? -0.09 * Math.sin((Math.PI * Y) / 0.16)
            : -0.09 * Math.sin((Math.PI * (Y - 0.84)) / 0.16)),
        (U.body.scale.y = s
          ? 1.02
          : Y < 0.16
            ? 1 - 0.1 * Math.sin((Math.PI * Y) / 0.16)
            : 1 - 0.1 * Math.sin((Math.PI * (Y - 0.84)) / 0.16)),
        U.arms.forEach(
          (k, q) =>
            (k.rotation.z =
              ((q === 0 ? 1 : -1) * (s ? 75 : 30) * Math.PI) / 180),
        ),
        (U.feet = []),
        s)
      )
        U.legs.forEach((k, q) => {
          ((k.rotation.z = (q === 0 ? -1 : 1) * 0.5), k.scale.setScalar(0.85));
        });
      else
        for (let k = 0; k < 2; k++)
          placeFoot(
            E,
            k,
            new Vector3(S.x + (k === 0 ? -0.25 : 0.25), i, S.z),
            "stance",
          );
      U.locomotion = {
        moving: s,
        mode: "jump",
        label: B,
        progress: Y,
        airborne: s,
        distance: o.distance,
      };
      return;
    }
    let a = Q.get(E);
    (a &&
      (a.takeoff &&
        !a.land &&
        onFootstep({
          type: "jump-land",
          label: B,
          time: I,
        }),
      Q.delete(E)),
      (U.body.scale.y = 1));
    let P = (K) => new Vector3(S.x + (K === 0 ? -0.25 : 0.25), i, S.z);
    if (!t) {
      (w(E),
        (U.locomotion = {
          moving: !1,
          mode: "performance",
        }));
      return;
    }
    h ||
      ((h = {
        prev: S.clone(),
        time: I,
        distance: 0,
        heading: new Vector3(1, 0, 0),
        feet: [0, 1].map((K) => ({
          p: P(K),
          swing: !1,
          from: null,
          to: null,
        })),
        moving: !1,
        stop: I,
      }),
      A.set(E, h));
    let R = S.clone().sub(h.prev);
    R.y = 0;
    let f = R.length(),
      J = I - h.time;
    if (J < 0 || J > 0.3 || f > 1)
      return (
        w(E),
        C(E, I, {
          groundY: i,
          label: B,
        })
      );
    let p = f > 4e-4 && J > 0,
      M = J > 0 ? f / J : 0;
    p && ((h.distance += f), h.heading.copy(R.normalize()), (h.stop = I));
    let F = h.distance / 0.72;
    if (p) {
      let K = Math.sin(F * Math.PI * 2);
      ((U.body.position.y += 0.027 * Math.abs(K)),
        (U.body.rotation.z += -0.025 * h.heading.x + 0.018 * K),
        U.arms.forEach(
          (Y, n) =>
            (Y.rotation.z =
              (((n === 0 ? 15 : -15) + (n === 0 ? 1 : -1) * 25 * K) * Math.PI) /
              180),
        ));
    }
    ((U.feet = []),
      h.feet.forEach((K, Y) => {
        let n = F + Y * 0.5,
          s = n - Math.floor(n),
          k = p && s > 0.6;
        if (
          (k &&
            !K.swing &&
            ((K.from = K.p.clone()),
            (K.to = P(Y).addScaledVector(h.heading, 0.3))),
          k)
        ) {
          let q = easeWalk((s - 0.6) / 0.4);
          (K.p.copy(K.from).lerp(K.to, q),
            (K.p.y = i + 0.13 * Math.sin(Math.PI * q)));
        } else if (K.swing)
          (K.p.copy(K.to),
            (K.p.y = i),
            onFootstep({
              foot: Y,
              label: B,
              speed: M,
              time: I,
            }));
        else if (p) K.p.y = i;
        else {
          let q = easeWalk((I - h.stop) / 0.22);
          (K.p.lerp(P(Y), q), (K.p.y = i));
        }
        ((K.swing = k), placeFoot(E, Y, K.p, k ? "swing" : "stance"));
      }),
      h.prev.copy(S),
      (h.time = I),
      (h.moving = p),
      (U.locomotion = {
        moving: p,
        speed: M,
        distance: h.distance,
        heading: h.heading.toArray(),
        mode: "walk",
        label: B,
      }));
  }
  return {
    apply: C,
    reset: w,
  };
}
var jumpThreshold = 2.4,
  clampTransfer = (g) => Math.max(0, Math.min(1, g)),
  easeTransfer = (g) => ((g = clampTransfer(g)), g * g * (3 - 2 * g)),
  horizontalDistance = (g, A) => Math.hypot(A.x - g.x, A.z - g.z);
function travelDuration(from, to) {
  let Q = horizontalDistance(from, to);
  return Q > jumpThreshold
    ? 0.74 + Math.min(0.08, (Q - jumpThreshold) * 0.015)
    : Math.max(0.32, Q / 2.7);
}
function moveCharacter(character, from, to, elapsed, duration, transferId) {
  let I = clampTransfer(elapsed / duration),
    i = horizontalDistance(from, to),
    B = i > jumpThreshold,
    t = easeTransfer(B ? (I - 0.16) / 0.68 : I);
  return (
    character.position.copy(from).lerp(to, t),
    (character.userData.transfer =
      B && elapsed >= 0 && elapsed <= duration
        ? {
            id: transferId,
            p: I,
            distance: i,
            height: Math.min(0.95, 0.55 + i * 0.045),
          }
        : null),
    I
  );
}
export { createLocomotion, travelDuration, moveCharacter };
