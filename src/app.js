import {
  BookScene,
  Vector3,
  renderer,
  camera,
  scene,
  coverHinge,
  openBookAt,
  closeBookAt,
  turnPageAt,
  clamp,
  smooth,
  lerp,
} from "./book-scene.js";
import { travelDuration, moveCharacter } from "./render/locomotion.js";
import { songRoot } from "./render/song-props.js";
import {
  setSongFootstepHandler,
  songSoundCues,
  songOffset,
  playSongFrame,
  showSong,
  hideSong,
  beginSongOutro,
  getOutroSoundTimes,
  playSongOutroFrame,
} from "./render/song.js";
import { BookView, $ } from "./view.js";
import { BookAudio } from "./audio.js";
import {
  CHAPTERS,
  createProgressStore,
  treeCount,
  answerChoices,
  answerIsCorrect,
  isSolved,
  finishValidation,
  advanceProgress,
  resetChapter,
} from "./progress.js";

const COUNT_VOICES = [
  "oneCount",
  "twoCount",
  "threeCount",
  "fourCount",
  "fiveCount",
  "sixCount",
  "sevenCount",
];
const now = () => performance.now() / 1000;
const plantPosition = (x) => new Vector3(Math.max(-3.65, x - 0.63), 0.02, 0.25);

class TreePlantingBook {
  constructor() {
    let storage;
    try {
      storage = window.localStorage;
    } catch {
      /* Session still works without storage. */
    }
    this.store = createProgressStore(storage);
    this.mode = "cover";
    this.animation = null;
    this.autoNext = null;
    this.reviewing = false;
    this.feedback = "";
    this.previousSongTime = songOffset;
    this.view = new BookView((action) => {
      if (this.animation) return;
      this.audio.unlock();
      this.audio.effect("tap", 0.2);
      action();
    });
    this.audio = new BookAudio(this.state, (message) =>
      this.view.announce(message),
    );
  }

  get state() {
    return this.store.state;
  }

  async start() {
    this.book = await BookScene.create((event) => this.footstep(event));
    setSongFootstepHandler((event) => this.footstep(event));
    this.audio.song.addEventListener("ended", () => this.endSong());
    this.audio.song.addEventListener("error", () => {
      if (this.mode !== "song") return;
      hideSong();
      this.mode = "reading";
      this.audio.stopMusic();
      this.renderActions(false);
      this.view.hint("儿歌没有加载完成，请再点一次播放。");
    });
    this.bindControls();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe($("stage"));
    this.resize();
    this.renderActions(false);
    this.lastFrame = 0;
    requestAnimationFrame((time) => this.frame(time));
  }

  save() {
    this.store.save();
    $("storage-note").innerHTML = this.store.available
      ? "点1号可以重听引导。<br>进度保存在这台设备。"
      : "点1号可以重听引导。<br>当前浏览器无法保存进度，本次仍可正常学习。";
  }

  bindControls() {
    $("sound-btn").onclick = () => {
      this.audio.unlock();
      this.state.sound = !this.state.sound;
      this.audio.sync();
      this.view.settings(this.state);
      this.save();
    };
    $("captions-btn").onclick = () => {
      this.state.captions = !this.state.captions;
      this.view.settings(this.state);
      this.save();
    };
    $("ip-callout").onclick = () => {
      this.audio.unlock();
      this.audio.speak("v3_cover");
    };
    $("reset-btn").onclick = () => this.redo();
    $("menu-btn").onclick = () => this.setMenu($("menu").hidden);
    $("menu-close").onclick = () => this.setMenu(false, true);
    $("restart-btn").onclick = () => this.restart();
    $("next-step").onclick = () => {
      this.audio.unlock();
      this.next();
    };
    $("song-end").onclick = () => this.endSong();
    $("song-pause").onclick = () => this.toggleSong();
    document.addEventListener("pointerdown", (event) => {
      if (
        !$("menu").contains(event.target) &&
        !$("menu-btn").contains(event.target)
      )
        this.setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("menu").hidden) {
        this.setMenu(false, true);
        return;
      }
      if (
        event.key === "ArrowRight" &&
        this.mode === "reading" &&
        !this.animation &&
        $("menu").hidden &&
        isSolved(this.state) &&
        this.state.chapter < 6
      ) {
        event.preventDefault();
        this.audio.unlock();
        this.next();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.mode === "song" && !this.audio.song.paused) {
        this.audio.song.pause();
        $("song-pause").textContent = "继续播放";
      }
      if (!document.hidden && this.autoNext) this.autoNext.due = now() + 1;
    });
    window.addEventListener("pagehide", () => this.save());
    $("book-view").addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.audio.stopMusic();
      $("loading").hidden = false;
      $("load-detail").textContent =
        "画面暂时中断，进度已经保存。请重新打开小书。";
      $("retry-btn").hidden = false;
      $("retry-btn").onclick = () => location.reload();
      this.save();
    });
  }

  setMenu(open, restoreFocus = false) {
    $("menu").hidden = !open;
    $("menu-btn").setAttribute("aria-expanded", String(open));
    if (open) $("menu-close").focus({ preventScroll: true });
    else if (restoreFocus) $("menu-btn").focus({ preventScroll: true });
  }

  renderBookmarks() {
    const list = $("chapter-list");
    list.replaceChildren();
    CHAPTERS.forEach((title, index) => {
      const chapter = index + 1;
      const button = document.createElement("button");
      button.type = "button";
      button.disabled = chapter > this.state.unlocked;
      button.className = chapter === this.state.chapter ? "current" : "";
      if (chapter === this.state.chapter)
        button.setAttribute("aria-current", "step");
      const name = document.createElement("span");
      name.textContent = `${String(chapter).padStart(2, "0")}  ${title}`;
      const status = document.createElement("span");
      status.textContent =
        chapter > this.state.unlocked
          ? "未解锁"
          : chapter < this.state.unlocked || this.state.complete
            ? "✓"
            : "→";
      status.setAttribute("aria-hidden", "true");
      button.append(name, status);
      button.onclick = () => this.visit(chapter);
      list.append(button);
    });
  }

  renderActions(speak = true) {
    this.view.clear();
    this.book.clearOptions();
    this.view.settings(this.state);
    this.renderBookmarks();
    $("reset-btn").disabled = this.mode !== "reading" || !!this.animation;
    $("menu-btn").disabled = !!this.animation;
    $("next-step").hidden = true;
    $("song-controls").hidden = this.mode !== "song";
    $("song-caption").hidden = this.mode !== "song";
    $("chapter-label").textContent =
      this.mode === "reading"
        ? `${String(this.state.chapter).padStart(2, "0")} / 06 · ${CHAPTERS[this.state.chapter - 1]}`
        : "两端植树";
    if (this.mode === "cover" || this.mode === "closed") {
      this.view.add("打开立体书", () => this.open(), {
        object: coverHinge,
        quad: [
          [0.08, 0.08, -3],
          [4.32, 0.08, -3],
          [4.32, 0.08, 3],
          [0.08, 0.08, 3],
        ],
        kind: "cover",
      });
      this.view.add("听1号介绍", () => this.audio.speak("v3_cover"), {
        object: this.book.actor,
        point: [0, 0.9, 0],
        kind: "character",
        width: 84,
        height: 108,
      });
      this.view.hint(
        this.state.complete
          ? "小路种好啦！点开小书，可以再听一次儿歌。"
          : this.state.unlocked > 1
            ? "点击书本，继续上次的小路。"
            : "点击书本，开启两端植树的秘密。",
      );
      return;
    }
    if (this.mode !== "reading") {
      this.view.hint("");
      return;
    }
    this.book.sync(this.state);
    this.view.add("听1号提示", () => this.repeatHint(), {
      object: this.book.actor,
      point: [0, 1, 0.02],
      kind: "character",
      width: 84,
      height: 108,
    });
    const chapter = this.state.chapter;
    const count = treeCount(this.state);
    let voice = "";
    let hint = "";
    if (chapter <= 3) {
      const lesson = this.state.lessons[count];
      if (!lesson.planted.every(Boolean)) {
        voice =
          chapter === 1 ? "v3_ends" : count === 3 ? "v3_case3" : "v3_case4";
        hint =
          chapter === 1
            ? "点亮两个光圈，把树种到小路的两端。"
            : `点光圈种好${count}棵树，再来数段。`;
        lesson.planted.forEach((planted, index) => {
          if (!planted)
            this.view.add(`种第${index + 1}棵树`, () => this.plant(index), {
              object: this.book.root,
              point: [this.book.roadScene.road.xs[index], 0.12, 0],
              kind: "plant",
            });
        });
      } else if (chapter === 2 && !lesson.solved) {
        voice = "v3_road";
        hint = "点击发光的小路，和1号一起走一走。";
        const xs = this.book.roadScene.road.xs;
        this.view.add("走过第1段", () => this.walkFirstGap(), {
          object: this.book.root,
          quad: [
            [xs[0] + 0.03, 0.12, -0.34],
            [xs[1] - 0.03, 0.12, -0.34],
            [xs[1] - 0.03, 0.12, 0.34],
            [xs[0] + 0.03, 0.12, 0.34],
          ],
          kind: "road",
        });
      } else if (lesson.solved) hint = `${count}棵树，分成${count - 1}段。`;
      else {
        hint = this.feedback || "先选一张段数牌，再和1号一起数一数。";
        answerChoices(count).forEach((choice, index) =>
          this.addOption(
            `${choice}段`,
            choice,
            index,
            3,
            () => this.chooseLesson(choice),
            lesson.choice,
          ),
        );
      }
    } else if (chapter === 4) {
      if (this.state.discovered) hint = "发现啦！两端都种树，段数＝棵数－1。";
      else {
        voice = "v3_law";
        hint = this.feedback || "看看记录，选出棵数和段数之间的规律。";
        [
          ["段数=棵数-1", -1],
          ["段数=棵数+1", 1],
        ].forEach(([label, choice], index) =>
          this.addOption(label, choice, index, 2, () =>
            this.chooseRule(choice),
          ),
        );
      }
    } else if (chapter === 5) {
      const practice = this.state.practice;
      if (practice.solved[practice.index])
        hint = `验证成功：${count}棵树，有${count - 1}段。`;
      else {
        voice = practice.phase === "retry" ? "v3_retry" : `v3_question${count}`;
        hint = this.feedback || `两端都种，${count}棵树有几段？先猜一猜。`;
        answerChoices(count).forEach((choice, index) =>
          this.addOption(
            `${choice}段`,
            choice,
            index,
            3,
            () => this.choosePractice(choice),
            practice.choice,
          ),
        );
      }
    } else {
      voice = "v3_song";
      hint = "跟着儿歌，把小秘密记在心里。";
      this.addOption("播放", 0, 0, 1, () => this.startSong());
    }
    this.view.hint(hint);
    if (speak && voice) this.audio.speak(voice);
    if (isSolved(this.state) && chapter < 6) {
      $("next-step").hidden = false;
      if (!this.reviewing && !this.autoNext)
        this.autoNext = { due: now() + 1, key: this.routeKey() };
    }
    this.save();
  }

  addOption(label, value, index, total, action, selected) {
    const object = this.book.option(label, value, index, total);
    const button = this.view.add(label, action, {
      object,
      point: [0, 0.36, 0.06],
      kind: "option",
      height: 62,
      value,
    });
    if (selected !== undefined && selected !== null)
      button.setAttribute("aria-pressed", String(selected === value));
  }

  routeKey() {
    return `${this.state.chapter}:${this.state.lessonCount}:${this.state.practice.index}`;
  }

  repeatHint() {
    if (this.animation) return;
    const count = treeCount(this.state);
    if (this.state.chapter <= 3) {
      const lesson = this.state.lessons[count];
      this.audio.speak(
        !lesson.planted.every(Boolean)
          ? this.state.chapter === 1
            ? "v3_ends"
            : `v3_case${count}`
          : this.state.chapter === 2
            ? "v3_road"
            : "v2_choose",
      );
    } else
      this.audio.speak(
        this.state.chapter === 4
          ? "v3_law"
          : this.state.chapter === 5
            ? `v3_question${count}`
            : "v3_song",
      );
  }

  begin(kind, duration, data = {}, onComplete, keepVoice = false) {
    this.autoNext = null;
    if (!keepVoice) this.audio.stopVoice();
    this.animation = {
      kind,
      duration,
      start: now(),
      cues: new Set(),
      ...data,
      onComplete,
    };
    this.view.lock(true);
    $("reset-btn").disabled = true;
    $("menu-btn").disabled = true;
    $("next-step").hidden = true;
    this.save();
  }

  cue(animation, id, sound, volume = 0.4) {
    if (animation.cues.has(id)) return;
    animation.cues.add(id);
    this.audio.effect(sound, volume);
  }

  open() {
    if (this.animation) return;
    this.setMenu(false);
    this.audio.unlock();
    this.audio.stopMusic();
    if (
      this.state.chapter === 1 &&
      this.state.lessons[2].planted.every(Boolean)
    ) {
      this.state.chapter = 2;
      this.state.unlocked = Math.max(this.state.unlocked, 2);
    }
    this.book.build(this.state);
    this.mode = "opening";
    this.view.clear();
    this.view.hint("");
    this.audio.piano.currentTime = 0;
    this.audio.play(this.audio.piano);
    this.begin("opening", 5.55, {}, () => {
      this.mode = "reading";
      this.audio.piano.pause();
      this.book.resetActor();
      this.book.sync(this.state);
    });
  }

  plant(index) {
    if (this.animation) return;
    const lesson = this.state.lessons[treeCount(this.state)];
    if (lesson.planted[index]) return;
    this.reviewing = false;
    this.feedback = "";
    const from = this.book.actor.position.clone();
    const target = plantPosition(this.book.roadScene.road.xs[index]);
    const move = travelDuration(from, target);
    lesson.planted[index] = true;
    this.begin("plant", move + 0.9, { index, from, target, move }, () => {
      if (this.state.chapter === 1 && lesson.planted.every(Boolean)) {
        this.state.chapter = 2;
        this.state.unlocked = Math.max(this.state.unlocked, 2);
      }
    });
  }

  walkFirstGap() {
    if (this.animation) return;
    this.reviewing = false;
    const xs = this.book.roadScene.road.xs;
    const from = this.book.actor.position.clone();
    const reverse = Math.abs(from.x - xs[1]) < Math.abs(from.x - xs[0]);
    const startX = xs[reverse ? 1 : 0],
      endX = xs[reverse ? 0 : 1];
    const approach = travelDuration(from, new Vector3(startX, 0.043, 0));
    const walking = Math.max(0.65, Math.abs(endX - startX) / 2.7);
    this.begin(
      "walk",
      approach + walking + 0.88,
      { from, approach, walking, startX, endX },
      () => {
        const lesson = this.state.lessons[2];
        lesson.counted[0] = true;
        lesson.verified = true;
        lesson.solved = true;
        this.celebrate();
      },
    );
  }

  countPlan(from) {
    const xs = this.book.roadScene.road.xs;
    const approach = travelDuration(from, new Vector3(xs[0], 0.043, 0));
    let at = approach;
    const segments = xs.slice(0, -1).map((x, index) => {
      const move = Math.max(0.42, (xs[index + 1] - x) / 2.7);
      const segment = {
        from: x,
        to: xs[index + 1],
        at,
        move,
        end: at + move + 0.55,
      };
      at = segment.end;
      return segment;
    });
    return { from: from.clone(), approach, segments, duration: at + 0.25 };
  }

  chooseLesson(choice) {
    const count = treeCount(this.state),
      lesson = this.state.lessons[count];
    lesson.choice = choice;
    this.view.select(choice);
    this.reviewing = false;
    if (lesson.verified) {
      if (answerIsCorrect(count, choice)) {
        lesson.solved = true;
        this.celebrate();
      } else {
        this.feedback = "再看一看彩色的小路，选出正确的段数。";
        this.renderActions(false);
        this.audio.speak("v3_retry");
      }
      return;
    }
    const plan = this.countPlan(this.book.actor.position);
    this.view.hint("1号正在走小路，一起数段。");
    this.begin("count", plan.duration, { plan, spoken: -1 }, () => {
      if (finishValidation(this.state)) this.celebrate();
      else {
        this.feedback = "再看一看彩色的小路，选出正确的段数。";
        this.audio.speak("v3_retry");
      }
    });
  }

  chooseRule(choice) {
    this.reviewing = false;
    if (choice !== -1) {
      this.feedback = "再看看记录：段数比棵数少1。";
      this.view.hint(this.feedback);
      this.audio.speak("v3_law");
      return;
    }
    this.state.discovered = true;
    this.book.setTitle("段数＝棵数－1");
    this.celebrate();
  }

  choosePractice(choice) {
    const practice = this.state.practice,
      count = treeCount(this.state);
    practice.choice = choice;
    this.view.select(choice);
    this.reviewing = false;
    if (practice.phase === "retry") {
      if (finishValidation(this.state)) this.celebrate();
      else {
        this.feedback = "数一数已经亮起的小路，再选一次。";
        this.renderActions(false);
        this.audio.speak("v3_retry");
      }
      return;
    }
    practice.phase = "verifying";
    let at = 0.5;
    let previous = this.book.actor.position.clone();
    const tasks = this.book.roadScene.road.xs.map((x) => {
      const target = plantPosition(x),
        move = travelDuration(previous, target);
      const task = {
        at,
        from: previous.clone(),
        target,
        move,
        end: at + move + 0.75,
      };
      at = task.end;
      previous = target;
      return task;
    });
    const plan = this.countPlan(previous);
    this.view.hint("先种好树，再和1号一起数一数。");
    this.view.hotspots.forEach(({ button }) => {
      if (button.dataset.value !== undefined)
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.value) === choice),
        );
    });
    this.begin(
      "validate",
      at + plan.duration,
      { tasks, countAt: at, plan, spoken: -1 },
      () => {
        if (finishValidation(this.state)) this.celebrate();
        else {
          this.feedback = "数一数已经亮起的小路，再选一次。";
        }
      },
    );
  }

  celebrate() {
    const variant = this.state.celebrations++ % 3;
    this.feedback = "";
    this.audio.speak("correct");
    this.book.glows.forEach((glow) => {
      glow.visible = false;
    });
    this.book.party.burst(variant, now());
    this.audio.effect("confirm1", 0.45);
    this.view.hint("你发现啦！");
    this.begin("celebrate", 3.4, { variant }, undefined, true);
  }

  transition(change, turn = true) {
    if (this.animation) return;
    this.audio.stopMusic();
    hideSong();
    this.begin("transition", turn ? 2.15 : 1.35, {
      change,
      turn,
      switched: false,
      from: this.book.actor.position.clone(),
      fromCamera: camera.position.clone(),
    });
    this.view.hint("");
  }

  next() {
    if (
      this.animation ||
      this.mode !== "reading" ||
      !isSolved(this.state) ||
      this.state.chapter >= 6
    )
      return;
    const chapter = this.state.chapter;
    const sameChapter =
      (chapter === 3 && this.state.lessonCount === 3) ||
      (chapter === 5 && this.state.practice.index < 2);
    this.transition(() => {
      advanceProgress(this.state);
      this.feedback = "";
    }, !sameChapter);
  }

  visit(chapter) {
    if (this.animation || chapter > this.state.unlocked) return;
    this.setMenu(false);
    this.audio.unlock();
    this.reviewing = true;
    this.autoNext = null;
    if (this.mode === "song") return;
    if (this.mode === "cover" || this.mode === "closed") {
      this.state.chapter = chapter;
      this.open();
    } else if (chapter !== this.state.chapter)
      this.transition(() => {
        this.state.chapter = chapter;
        this.feedback = "";
      });
    else this.renderActions(false);
  }

  redo() {
    if (this.animation || this.mode !== "reading") return;
    this.reviewing = false;
    this.autoNext = null;
    this.feedback = "";
    this.audio.stopVoice();
    this.audio.stopMusic();
    this.transition(() => resetChapter(this.state), false);
  }

  restart() {
    if (this.animation || this.mode === "song") return;
    this.setMenu(false);
    this.autoNext = null;
    this.reviewing = false;
    this.feedback = "";
    this.audio.stopMusic();
    this.audio.stopVoice();
    if (this.mode === "reading") {
      this.transition(() => {
        this.store.restart();
        this.audio.settings = this.state;
        this.audio.sync();
      }, false);
    } else {
      this.store.restart();
      this.audio.settings = this.state;
      this.audio.sync();
      this.open();
    }
  }

  async startSong() {
    if (this.animation || this.mode !== "reading") return;
    this.audio.unlock();
    this.audio.stopVoice();
    this.audio.stopMusic();
    this.autoNext = null;
    this.mode = "song";
    this.view.clear();
    this.view.hint("");
    this.book.clearOptions();
    this.audio.song.currentTime = 0;
    this.previousSongTime = songOffset;
    showSong();
    playSongFrame(songOffset);
    $("song-controls").hidden = false;
    $("song-caption").hidden = false;
    $("song-pause").textContent = "暂停儿歌";
    $("reset-btn").disabled = true;
    $("menu-btn").disabled = true;
    if (!(await this.audio.play(this.audio.song))) {
      if (this.mode !== "song") return;
      hideSong();
      this.mode = "reading";
      this.renderActions(false);
      this.view.hint("请再点一下播放，开启儿歌。");
    }
  }

  async toggleSong() {
    if (this.mode !== "song") return;
    if (this.audio.song.paused) {
      this.audio.unlock();
      if (await this.audio.play(this.audio.song))
        $("song-pause").textContent = "暂停儿歌";
    } else {
      this.audio.song.pause();
      $("song-pause").textContent = "继续播放";
    }
  }

  endSong() {
    if (this.mode !== "song" || this.animation) return;
    this.audio.song.pause();
    this.mode = "closing";
    $("song-controls").hidden = true;
    $("song-caption").hidden = true;
    const duration = beginSongOutro();
    this.audio.speak("v3_goodbye");
    this.begin(
      "song-exit",
      duration,
      {},
      () => {
        hideSong();
        this.mode = "closed";
        this.state.complete = true;
        this.view.announce("学习完成！两端都种树，段数等于棵数减1。");
      },
      true,
    );
  }

  footstep(event) {
    this.audio.effect(
      event.type
        ? event.type === "takeoff"
          ? "paper"
          : "land"
        : event.foot === 0
          ? "foot1"
          : "foot2",
      event.type ? 0.4 : 0.5,
    );
  }

  animateCount(time, animation, pose) {
    const plan = animation.plan;
    if (time < plan.approach) {
      moveCharacter(
        this.book.actor,
        plan.from,
        new Vector3(plan.segments[0].from, 0.043, 0),
        time,
        plan.approach,
        `${animation.start}:count-approach`,
      );
    } else {
      const index = Math.max(
        0,
        plan.segments.findIndex((segment) => time < segment.end),
      );
      const at =
        time >= plan.segments.at(-1).end ? plan.segments.length - 1 : index;
      const segment = plan.segments[at];
      const fraction = smooth((time - segment.at) / segment.move);
      this.book.actor.position.set(
        lerp(segment.from, segment.to, fraction),
        0.043,
        0,
      );
      if (fraction > 0.99 && animation.spoken !== at) {
        animation.spoken = at;
        this.book.revealCount(at);
        this.audio.speak(COUNT_VOICES[at]);
        this.audio.effect("tap", 0.32);
      }
    }
    pose.look = 1;
    pose.right = -90;
  }

  animate(time, pose) {
    const animation = this.animation;
    const age = time - animation.start;
    let reachTree = null;
    if (animation.kind === "plant") {
      moveCharacter(
        this.book.actor,
        animation.from,
        animation.target,
        age,
        animation.move,
        `${animation.start}:plant`,
      );
      const tree = this.book.roadScene.trees[animation.index];
      const growth = smooth((age - animation.move) / 0.65);
      tree.visible = growth > 0;
      tree.scale.set(1, Math.max(0.001, growth), 1);
      tree.rotation.x = lerp(-0.65, -0.15, growth);
      this.book.rings[animation.index].visible = false;
      pose.look = 1;
      if (age > animation.move && growth < 1) {
        reachTree = tree;
        this.cue(animation, "unfold", "paper", 0.48);
      }
      if (growth > 0.97) this.cue(animation, "plant", "land", 0.62);
    } else if (animation.kind === "walk") {
      const progress = smooth((age - animation.approach) / animation.walking);
      if (age < animation.approach)
        moveCharacter(
          this.book.actor,
          animation.from,
          new Vector3(animation.startX, 0.043, 0),
          age,
          animation.approach,
          `${animation.start}:approach`,
        );
      else
        this.book.actor.position.set(
          lerp(animation.startX, animation.endX, progress),
          0.043,
          0,
        );
      const glow = this.book.glows[0];
      glow.visible = true;
      glow.material.opacity = 0.5;
      glow.scale.x = Math.max(0.001, progress);
      glow.position.x =
        animation.startX + ((animation.endX - animation.startX) * progress) / 2;
      pose.look = Math.sign(animation.endX - animation.startX);
      if (age >= animation.approach && !animation.spoken) {
        animation.spoken = true;
        this.audio.speak("v3_one");
      }
      if (age >= animation.approach + animation.walking)
        this.book.revealCount(0);
    } else if (animation.kind === "count")
      this.animateCount(age, animation, pose);
    else if (animation.kind === "validate") {
      const { road, flags, trees } = this.book.roadScene;
      road.group.visible = true;
      road.floor.scale.x = Math.max(0.001, smooth(age / 0.5));
      road.floor.position.x = -3.2 + 3.2 * smooth(age / 0.5);
      flags.forEach((flag) => {
        flag.visible = age >= animation.countAt;
      });
      trees.forEach((tree, index) => {
        const task = animation.tasks[index];
        const growth = smooth((age - task.at - task.move) / 0.6);
        tree.visible = growth > 0;
        tree.scale.y = Math.max(0.001, growth);
        tree.rotation.x = lerp(-0.65, -0.15, growth);
        if (growth > 0 && growth < 1)
          this.cue(animation, `paper-${index}`, "paper", 0.45);
        if (growth > 0.97) this.cue(animation, `land-${index}`, "land", 0.6);
      });
      if (age < animation.countAt) {
        const task =
          animation.tasks.find((item) => age < item.end) ||
          animation.tasks.at(-1);
        moveCharacter(
          this.book.actor,
          task.from,
          task.target,
          age - task.at,
          task.move,
          `${animation.start}:tree:${task.at}`,
        );
        pose.look = 1;
        if (age > task.at + task.move)
          reachTree = trees[animation.tasks.indexOf(task)];
      } else this.animateCount(age - animation.countAt, animation, pose);
    } else if (animation.kind === "celebrate") {
      pose.left = 135;
      pose.right = -135;
      pose.energy = 0.45;
      pose.look = 0;
      pose.hop =
        0.6 * Math.sin(Math.PI * clamp(age / 0.62)) +
        0.46 * Math.sin(Math.PI * clamp((age - 0.72) / 0.62));
      pose.lean = 0.05 * Math.sin(age * 8);
      if (animation.variant === 1) {
        pose.left = 75;
        pose.right = -75;
        pose.hop *= 0.5;
      }
      if (animation.variant === 2) {
        pose.lean = 0.13 * Math.sin(age * 6);
        pose.left = 110 + 20 * Math.sin(age * 8);
        pose.right = -110 - 20 * Math.sin(age * 8);
      }
      if (age > 0.62) this.cue(animation, "hop1", "land");
      if (age > 1.34) this.cue(animation, "hop2", "land", 0.35);
    } else if (animation.kind === "transition") {
      const switchAt = animation.turn ? 1.12 : 0.35;
      if (age < switchAt) {
        this.book.sheet.scale.y = Math.max(0.001, 1 - smooth(age / 0.32));
        if (animation.turn) {
          camera.position
            .copy(animation.fromCamera)
            .lerp(new Vector3(0, 18.8, 9.4), smooth(age / 0.36));
          camera.lookAt(0, 0.8, 0);
          if (age > 0.36) turnPageAt((age - 0.36) / 0.76);
        }
      } else {
        if (!animation.switched) {
          animation.change();
          this.book.build(this.state);
          animation.switched = true;
          this.audio.effect("paper", 0.3);
          this.save();
        }
        this.book.sheet.scale.y = Math.max(
          0.001,
          smooth((age - switchAt) / 0.65),
        );
        this.book.grow(clamp((age - switchAt) / 0.65));
        if (animation.turn) {
          camera.position
            .set(0, 18.8, 9.4)
            .lerp(new Vector3(0, 12.4, 9.6), smooth((age - switchAt) / 0.7));
          camera.lookAt(0, 0.7, 0);
        }
      }
      moveCharacter(
        this.book.actor,
        animation.from,
        new Vector3(-3.6, 0, 1.4),
        age,
        travelDuration(animation.from, new Vector3(-3.6, 0, 1.4)),
        `${animation.start}:handoff`,
      );
      pose.energy = 0.25;
    }
    return reachTree;
  }

  frame(milliseconds) {
    requestAnimationFrame((time) => this.frame(time));
    const time = milliseconds / 1000;
    const active =
      this.animation || this.mode === "song" || this.view.trail.length;
    if (time - this.lastFrame < (active ? 1 / 60 : 1 / 30) * 0.8) return;
    this.lastFrame = time;
    this.book.sizer.reset();
    this.book.actor.userData.transfer = null;
    this.book.sheet.scale.setScalar(1);
    this.book.sheet.visible = true;
    this.book.root.visible = true;
    this.book.actor.visible = true;
    turnPageAt(null);
    const pose = {
      energy: 0.2,
      look: 0.25 * Math.sin(time * 0.8),
      left: 26 + 4 * Math.sin(time * 1.7),
      right: -58,
      hop: 0.012 * Math.sin(time * 2.2),
      lean: 0.035 * Math.sin(time * 1.2),
      sing: this.audio.speaking,
    };
    const animation = this.animation;
    if (this.mode === "song") {
      this.book.root.visible = false;
      showSong();
      const songTime =
        songOffset + Math.min(this.audio.song.currentTime, 37.584);
      playSongFrame(songTime);
      if (
        songTime >= this.previousSongTime &&
        songTime - this.previousSongTime < 0.5
      ) {
        songSoundCues.forEach((cue) => {
          if (cue.at > this.previousSongTime && cue.at <= songTime)
            this.audio.effect(cue.id, Math.min(0.65, cue.volume * 1.6));
        });
      }
      this.previousSongTime = songTime;
    } else if (animation?.kind === "song-exit") {
      this.book.root.visible = false;
      const age = time - animation.start;
      playSongOutroFrame(age);
      getOutroSoundTimes().forEach((at, index, cues) => {
        if (age > at)
          this.cue(
            animation,
            `exit-${index}`,
            index === cues.length - 1 ? "wood" : "paper",
            0.42,
          );
      });
    } else {
      hideSong();
      if (this.mode === "cover" || this.mode === "closed") {
        openBookAt(0, { draw: false });
        this.book.sheet.visible = false;
        this.book.coverActor(time);
      } else if (animation?.kind === "opening") {
        const age = time - animation.start;
        openBookAt(Math.min(5.8, age), { draw: false });
        const cameraProgress = smooth((age - 4.05) / 1.5);
        if (age >= 4.05) {
          camera.position.lerp(new Vector3(0, 12.4, 9.6), cameraProgress);
          camera.lookAt(0, lerp(0.18, 0.7, cameraProgress), 0);
        }
        this.book.sheet.visible = age >= 3.95;
        if (this.book.sheet.visible) this.book.grow(clamp((age - 3.95) / 1.5));
        const actorProgress = smooth((age - 4) / 1.45);
        this.book.actor.position.set(
          lerp(-2.7, -3.6, actorProgress),
          lerp(-0.36, 0, actorProgress),
          lerp(lerp(1.35, 3.6, smooth(age / 1.7)), 1.4, actorProgress),
        );
        this.book.actor.scale.setScalar(lerp(1.08, 0.82, actorProgress));
        this.book.actor.rotation.set(
          lerp(-0.1, -0.27, actorProgress),
          lerp(0.5, 0, actorProgress),
          0,
        );
        this.book.animateActor(time, {
          energy: 0.65,
          look: 1,
          left: 35,
          right: -85,
          hop: 0,
          sing: false,
        });
        [1.5, 2.65, 2.9, 3.2, 3.5].forEach((at, index) => {
          if (age > at) this.cue(animation, `page-${index}`, "paper", 0.35);
        });
      } else {
        openBookAt(5.8, { draw: false });
        this.book.readingCamera();
        const reachTree = animation ? this.animate(time, pose) : null;
        if (!animation && this.view.reducedMotion.matches)
          Object.assign(pose, {
            energy: 0.03,
            lean: 0,
            hop: 0,
            left: 26,
            right: -58,
          });
        this.book.animateActor(
          time,
          pose,
          reachTree,
          animation?.kind !== "celebrate",
        );
      }
      this.book.pulse(time, animation?.kind === "walk");
      this.book.render(this.view.width, this.view.height);
    }
    this.view.positionHotspots();
    const cover = this.mode === "cover" || this.mode === "closed";
    this.view.bubble("ip-callout", this.book.actor, undefined, cover);
    this.view.bubble(
      "speech-bubble",
      this.book.actor,
      this.audio.caption,
      !cover &&
        this.mode !== "song" &&
        animation?.kind !== "song-exit" &&
        (this.state.captions || !this.state.sound) &&
        !!this.audio.caption,
    );
    this.view.drawTrail(time);
    if (
      animation &&
      time - animation.start >= animation.duration &&
      this.animation === animation
    ) {
      this.animation = null;
      animation.onComplete?.();
      if (!this.animation) this.renderActions();
    }
    if (
      this.autoNext &&
      !this.animation &&
      this.mode === "reading" &&
      !this.reviewing &&
      $("menu").hidden &&
      !document.hidden &&
      time >= this.autoNext.due &&
      !this.audio.speaking
    ) {
      const scheduled = this.autoNext;
      this.autoNext = null;
      if (scheduled.key === this.routeKey()) this.next();
    }
    // A read-only diagnostic snapshot supports regression checks without bypassing UI actions.
    this.snapshot = {
      mode: this.mode,
      chapter: this.state.chapter,
      count: treeCount(this.state),
      busy: this.animation?.kind || null,
      trees:
        this.book.roadScene?.trees.filter((tree) => tree.visible).length || 0,
      gaps:
        this.book.roadScene?.road.bars.filter((bar) => bar.visible).length || 0,
      songTime: this.audio.song.currentTime,
      songPaused: this.audio.song.paused,
      complete: this.state.complete,
    };
  }

  resize() {
    const stage = $("stage");
    this.view.width = Math.max(1, stage.clientWidth);
    this.view.height = Math.max(1, stage.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(this.view.width, this.view.height, false);
    camera.aspect = this.view.width / this.view.height;
    camera.updateProjectionMatrix();
    $("trail").width = this.view.width;
    $("trail").height = this.view.height;
  }
}

const app = new TreePlantingBook();
await app.start();
window.BookApp = Object.freeze({
  proof: () => structuredClone(app.snapshot),
  progress: () => structuredClone(app.state),
});
