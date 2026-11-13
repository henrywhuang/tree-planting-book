import { Vector3, camera } from "./book-scene.js";

const $ = (id) => document.getElementById(id);
const paths = {
  sound:
    '<path d="m11 5-6 4H2v6h3l6 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 5-6 4H2v6h3l6 4zM16 9l5 6M21 9l-5 6"/>',
  reset: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  menu: '<path d="M4 5h16M4 12h16M4 19h16"/>',
  captions:
    '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M9 9H6v6h3m8-6h-3v6h3"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;

export class BookView {
  constructor(activate) {
    this.activate = activate;
    this.hotspots = [];
    this.width = 1;
    this.height = 1;
    this.focusToRestore = null;
    this.trail = [];
    this.digit = 0;
    this.lastPointer = { x: -100, y: -100, time: 0 };
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    $("reset-btn").innerHTML = icon("reset");
    $("menu-btn").innerHTML = icon("menu");
    $("captions-btn").innerHTML = icon("captions");
    this.trailContext = $("trail").getContext("2d");
    for (const event of ["pointermove", "pointerdown"])
      $("stage").addEventListener(event, (pointer) => this.addTrail(pointer));
  }

  clear() {
    const focused = document.activeElement;
    if (focused?.parentElement === $("hotspots"))
      this.focusToRestore = focused.getAttribute("aria-label");
    $("hotspots").replaceChildren();
    this.hotspots = [];
  }

  add(
    label,
    action,
    {
      object,
      point = [0, 0, 0],
      quad,
      kind = "",
      width = 60,
      height = 60,
      value,
    } = {},
  ) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `hotspot ${kind}`;
    button.setAttribute("aria-label", label);
    if (value !== undefined) button.dataset.value = String(value);
    button.onclick = () => this.activate(action);
    $("hotspots").append(button);
    this.hotspots.push({ button, object, point, quad, kind, width, height });
    return button;
  }

  lock(locked) {
    this.hotspots.forEach(({ button }) => {
      button.disabled = locked;
    });
  }

  select(value) {
    for (const { button } of this.hotspots) {
      if (button.dataset.value !== undefined) {
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.value) === value),
        );
      }
    }
  }

  project(point, object) {
    const position = object.localToWorld(new Vector3(...point));
    position.project(camera);
    return {
      x: ((position.x + 1) * this.width) / 2,
      y: ((1 - position.y) * this.height) / 2,
      z: position.z,
    };
  }

  positionHotspots() {
    for (const spot of this.hotspots) {
      const { button, object, point, quad, width, height } = spot;
      if (quad) {
        const corners = quad.map((corner) => this.project(corner, object));
        const x = Math.min(...corners.map((corner) => corner.x));
        const y = Math.min(...corners.map((corner) => corner.y));
        const w = Math.max(
          52,
          Math.max(...corners.map((corner) => corner.x)) - x,
        );
        const h = Math.max(
          52,
          Math.max(...corners.map((corner) => corner.y)) - y,
        );
        Object.assign(button.style, {
          left: `${x}px`,
          top: `${y}px`,
          width: `${w}px`,
          height: `${h}px`,
          transform: "none",
          clipPath: `polygon(${corners.map((corner) => `${((corner.x - x) * 100) / w}% ${((corner.y - y) * 100) / h}%`).join(",")})`,
        });
      } else {
        const position = this.project(point, object);
        let w = width;
        if (spot.kind === "option") {
          const half = object.userData.w / 2;
          w = Math.max(
            60,
            Math.abs(
              this.project([half, 0, 0], object).x -
                this.project([-half, 0, 0], object).x,
            ) + 8,
          );
        }
        Object.assign(button.style, {
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${w}px`,
          height: `${height}px`,
          visibility: position.z < 1 ? "visible" : "hidden",
        });
      }
    }
  }

  bubble(id, actor, text, visible) {
    const element = $(id);
    element.hidden = !visible;
    if (!visible) return;
    if (text !== undefined) element.textContent = text;
    const point = this.project([0.1, 1.8, 0], actor);
    const margin =
      id === "speech-bubble" ? Math.min(150, this.width / 2 - 12) : 78;
    element.style.left = `${Math.max(margin, Math.min(this.width - margin, point.x))}px`;
    element.style.top = `${Math.max(id === "speech-bubble" ? 90 : 56, point.y - 12)}px`;
  }

  settings(state) {
    $("sound-btn").innerHTML = icon(state.sound ? "sound" : "mute");
    $("sound-btn").setAttribute(
      "aria-label",
      state.sound ? "关闭声音" : "打开声音",
    );
    $("captions-btn").setAttribute("aria-pressed", String(state.captions));
    $("captions-btn").setAttribute(
      "aria-label",
      state.captions ? "隐藏1号的字幕" : "显示1号的字幕",
    );
  }

  hint(message) {
    $("task-hint").textContent = message;
    $("task-hint").hidden = !message;
  }
  announce(message) {
    $("a11y-status").textContent = message;
  }

  addTrail(event) {
    if (
      this.reducedMotion.matches ||
      (event.type === "pointermove" && event.pointerType === "touch")
    )
      return;
    const bounds = $("stage").getBoundingClientRect();
    const x = event.clientX - bounds.left,
      y = event.clientY - bounds.top;
    const time = performance.now() / 1000;
    if (
      event.type === "pointermove" &&
      (Math.hypot(x - this.lastPointer.x, y - this.lastPointer.y) < 16 ||
        time - this.lastPointer.time < 0.045)
    )
      return;
    this.lastPointer = { x, y, time };
    this.trail.push({
      x,
      y,
      time,
      digit: String(++this.digit % 10),
      color: ["#e77d9d", "#d6a934", "#4aa7ce", "#9275c9", "#77ae47"][
        this.digit % 5
      ],
      angle: ((this.digit % 5) - 2) * 0.13,
    });
    if (this.trail.length > 26) this.trail.shift();
  }

  drawTrail(time) {
    const context = this.trailContext;
    context.clearRect(0, 0, this.width, this.height);
    this.trail = this.trail.filter((particle) => time - particle.time < 0.75);
    for (const particle of this.trail) {
      const age = time - particle.time;
      context.save();
      context.globalAlpha = (1 - age / 0.75) * 0.7;
      context.translate(
        particle.x + Math.sin(age * 5) * 6,
        particle.y - age * 28,
      );
      context.rotate(particle.angle);
      context.font = "700 17px BoardSC";
      context.fillStyle = particle.color;
      context.fillText(particle.digit, 0, 0);
      context.restore();
    }
  }
}

export { $ };
