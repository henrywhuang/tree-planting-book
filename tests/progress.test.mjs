import test from "node:test";
import assert from "node:assert/strict";
import {
  createProgress,
  createProgressStore,
  normalizeProgress,
  advanceProgress,
  finishValidation,
  resetChapter,
  treeCount,
  STORAGE_KEY,
} from "../src/progress.js";

test("2 → 3 → 4 → rule → 5 → 6 → 7 → song follows the complete learning path", () => {
  const state = createProgress();
  state.chapter = 2;
  state.unlocked = 2;
  Object.assign(state.lessons[2], {
    planted: [true, true],
    counted: [true],
    solved: true,
  });
  assert.equal(advanceProgress(state), true);
  assert.equal(treeCount(state), 3);
  for (const count of [3, 4]) {
    state.lessons[count].planted.fill(true);
    state.lessons[count].choice = count - 1;
    assert.equal(finishValidation(state), true);
    assert.equal(advanceProgress(state), true);
  }
  assert.equal(state.chapter, 4);
  state.discovered = true;
  advanceProgress(state);
  for (const count of [5, 6, 7]) {
    assert.equal(treeCount(state), count);
    state.practice.choice = count - 1;
    assert.equal(finishValidation(state), true);
    advanceProgress(state);
  }
  assert.equal(state.chapter, 6);
  assert.equal(state.unlocked, 6);
  assert.deepEqual(state.practice.solved, [true, true, true]);
});

test("a wrong guess reveals the actual gaps and allows retry without advancing", () => {
  const state = createProgress();
  state.chapter = 3;
  state.lessons[3].planted.fill(true);
  state.lessons[3].choice = 3;
  assert.equal(finishValidation(state), false);
  assert.equal(state.lessons[3].verified, true);
  assert.deepEqual(state.lessons[3].counted, [true, true]);
  assert.equal(advanceProgress(state), false);
  state.lessons[3].choice = 2;
  assert.equal(finishValidation(state), true);
  state.chapter = 5;
  state.practice.choice = 5;
  assert.equal(finishValidation(state), false);
  assert.equal(state.practice.phase, "retry");
  assert.equal(advanceProgress(state), false);
  state.practice.choice = 4;
  assert.equal(finishValidation(state), true);
});

test("an interrupted validation recovers to a selectable question after reload", () => {
  const state = createProgress();
  state.unlocked = 5;
  state.chapter = 5;
  state.practice.index = 1;
  state.practice.phase = "verifying";
  state.practice.choice = 5;
  const recovered = normalizeProgress(JSON.parse(JSON.stringify(state)));
  assert.equal(recovered.chapter, 5);
  assert.equal(treeCount(recovered), 6);
  assert.equal(recovered.practice.phase, "choose");
});

test("malformed storage cannot unlock invalid chapters or create invalid tree arrays", () => {
  const recovered = normalizeProgress({
    version: 1,
    chapter: 999,
    unlocked: 5,
    lessonCount: -1,
    lessons: { 3: { planted: [true], counted: [true, true], solved: true } },
    practice: { index: 100, phase: "result", solved: [] },
  });
  assert.equal(recovered.chapter, 1);
  assert.equal(recovered.lessonCount, 3);
  assert.deepEqual(recovered.lessons[3].planted, [true, false, false]);
  assert.deepEqual(recovered.lessons[3].counted, [false, false]);
  assert.equal(recovered.lessons[3].solved, false);
  assert.equal(recovered.practice.phase, "choose");
});

test("redo resets only the current exercise and preserves settings and unlocked chapters", () => {
  const state = createProgress({ sound: false, captions: true });
  state.chapter = 5;
  state.unlocked = 6;
  state.practice.index = 1;
  state.practice.solved = [true, true, false];
  state.practice.phase = "result";
  resetChapter(state);
  assert.deepEqual(state.practice.solved, [true, false, false]);
  assert.equal(state.unlocked, 6);
  assert.equal(state.sound, false);
  assert.equal(state.captions, true);
});

test("storage persists progress; restarting preserves audio and subtitle preferences", () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  };
  const store = createProgressStore(storage);
  store.state.sound = false;
  store.state.captions = true;
  store.state.chapter = 4;
  store.state.unlocked = 4;
  store.save();
  assert.equal(JSON.parse(data.get(STORAGE_KEY)).chapter, 4);
  assert.equal(createProgressStore(storage).state.chapter, 4);
  store.restart();
  assert.equal(store.state.chapter, 1);
  assert.equal(store.state.sound, false);
  assert.equal(store.state.captions, true);
});

test("denied or corrupt storage does not prevent starting or completing a session", () => {
  const corrupt = createProgressStore({
    getItem: () => "{broken",
    setItem: () => {
      throw new Error("denied");
    },
  });
  assert.equal(corrupt.state.chapter, 1);
  assert.doesNotThrow(() => corrupt.save());
  assert.equal(corrupt.available, false);
  assert.doesNotThrow(() => corrupt.restart());
});
