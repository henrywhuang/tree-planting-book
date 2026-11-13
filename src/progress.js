export const STORAGE_KEY = "tree-planting-book:progress:v1";

export const CHAPTERS = [
  "两端种树",
  "走过一段",
  "种好再数：2、3、4棵",
  "发现规律",
  "种树验证：5、6、7棵",
  "唱着记住",
];

export const PRACTICE_COUNTS = [5, 6, 7];

export function createLesson(count) {
  return {
    planted: Array(count).fill(false),
    counted: Array(count - 1).fill(false),
    choice: null,
    verified: false,
    solved: false,
  };
}

export function createProgress(settings = {}) {
  return {
    version: 1,
    chapter: 1,
    unlocked: 1,
    lessonCount: 3,
    lessons: { 2: createLesson(2), 3: createLesson(3), 4: createLesson(4) },
    discovered: false,
    practice: {
      index: 0,
      phase: "choose",
      choice: null,
      solved: [false, false, false],
    },
    celebrations: 0,
    complete: false,
    sound: settings.sound !== false,
    captions: settings.captions === true,
  };
}

const integer = (value, min, max, fallback) =>
  Number.isInteger(value) && value >= min && value <= max ? value : fallback;

function flags(value, length) {
  return Array.from({ length }, (_, index) => value?.[index] === true);
}

// Storage is user-controlled and may contain a partial or interrupted session.
export function normalizeProgress(value) {
  if (!value || value.version !== 1) return createProgress();
  const result = createProgress(value);
  result.unlocked = integer(value.unlocked, 1, 6, 1);
  result.chapter = integer(value.chapter, 1, result.unlocked, 1);
  result.lessonCount = integer(value.lessonCount, 3, 4, 3);
  for (const count of [2, 3, 4]) {
    const saved = value.lessons?.[count];
    if (!saved) continue;
    const lesson = result.lessons[count];
    lesson.planted = flags(saved.planted, count);
    const allPlanted = lesson.planted.every(Boolean);
    lesson.counted = allPlanted
      ? flags(saved.counted, count - 1)
      : Array(count - 1).fill(false);
    lesson.choice = integer(saved.choice, 0, count, null);
    lesson.verified =
      allPlanted && lesson.counted.every(Boolean) && saved.verified === true;
    lesson.solved =
      allPlanted && lesson.counted.every(Boolean) && saved.solved === true;
  }
  result.discovered = value.discovered === true;
  const practice = value.practice || {};
  result.practice.index = integer(practice.index, 0, 2, 0);
  result.practice.solved = flags(practice.solved, 3);
  result.practice.choice = integer(practice.choice, 0, 7, null);
  result.practice.phase = ["choose", "retry", "result"].includes(practice.phase)
    ? practice.phase
    : "choose";
  if (result.practice.solved[result.practice.index])
    result.practice.phase = "result";
  if (
    result.practice.phase === "result" &&
    !result.practice.solved[result.practice.index]
  ) {
    result.practice.phase = "choose";
  }
  result.celebrations = integer(value.celebrations, 0, 1000000, 0);
  result.complete = value.complete === true;
  return result;
}

export function createProgressStore(storage) {
  let state;
  let available = true;
  try {
    state = normalizeProgress(
      JSON.parse(storage?.getItem(STORAGE_KEY) || "null"),
    );
  } catch {
    state = createProgress();
  }
  return {
    get state() {
      return state;
    },
    get available() {
      return available;
    },
    save() {
      try {
        if (!storage) throw new Error("Storage unavailable");
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        available = true;
      } catch {
        available = false;
      }
    },
    restart() {
      state = createProgress(state);
      this.save();
      return state;
    },
  };
}

export function treeCount(state) {
  if (state.chapter <= 2) return 2;
  if (state.chapter === 3) return state.lessonCount;
  if (state.chapter === 5) return PRACTICE_COUNTS[state.practice.index];
  return 3;
}

export function answerChoices(count) {
  return [count - 2, count - 1, count];
}

export function isSolved(state) {
  if (state.chapter <= 3) return state.lessons[treeCount(state)].solved;
  if (state.chapter === 4) return state.discovered;
  if (state.chapter === 5) return state.practice.solved[state.practice.index];
  return state.complete;
}

export function answerIsCorrect(count, choice) {
  return choice === count - 1;
}

export function finishValidation(state) {
  const count = treeCount(state);
  if (state.chapter === 5) {
    const correct = answerIsCorrect(count, state.practice.choice);
    state.practice.phase = correct ? "result" : "retry";
    state.practice.solved[state.practice.index] = correct;
    return correct;
  }
  const lesson = state.lessons[count];
  lesson.counted.fill(true);
  lesson.verified = true;
  lesson.solved = answerIsCorrect(count, lesson.choice);
  return lesson.solved;
}

export function advanceProgress(state) {
  if (!isSolved(state) || state.chapter === 6) return false;
  if (state.chapter === 3 && state.lessonCount === 3) {
    state.lessonCount = 4;
  } else if (state.chapter === 5 && state.practice.index < 2) {
    state.practice.index++;
    state.practice.phase = "choose";
    state.practice.choice = null;
  } else {
    state.chapter++;
    state.unlocked = Math.max(state.unlocked, state.chapter);
  }
  return true;
}

export function resetChapter(state) {
  if (state.chapter <= 2) {
    state.lessons[2] = createLesson(2);
    state.chapter = 1;
  } else if (state.chapter === 3) {
    state.lessons[state.lessonCount] = createLesson(state.lessonCount);
  } else if (state.chapter === 4) {
    state.discovered = false;
  } else if (state.chapter === 5) {
    state.practice.phase = "choose";
    state.practice.choice = null;
    state.practice.solved[state.practice.index] = false;
  }
}
