const STORAGE_KEY = "preepx_company_solved";

function readMap() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getSolvedIds(slug) {
  const map = readMap();
  return Array.isArray(map[slug]) ? map[slug] : [];
}

export function isQuestionSolved(slug, questionId) {
  return getSolvedIds(slug).includes(questionId);
}

export function markQuestionSolved(slug, questionId) {
  const map = readMap();
  const current = new Set(map[slug] || []);
  current.add(questionId);
  map[slug] = [...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  return map[slug];
}

export function computeBankStats(questions = [], solvedIds = []) {
  if (!Array.isArray(questions)) questions = [];
  const solvedSet = new Set(solvedIds.map(String));
  const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
  const byType = { coding: 0, mcq: 0, theory: 0 };
  let solved = 0;

  for (const q of questions) {
    if (!q) continue;
    const diff = q.difficulty || "Easy";
    if (byDiff[diff] != null) byDiff[diff] += 1;
    if (byType[q.type] != null) byType[q.type] += 1;
    const qId = q.id || q._id;
    if (solvedSet.has(String(qId))) solved += 1;
  }

  const total = questions.length;
  const progress = total ? Math.round((solved / total) * 100) : 0;
  return { total, solved, progress, byDiff, byType };
}
