const User = require("../../../models/User");
const Interview = require("../../../models/Interview");
const MCQResult = require("../../../models/MCQResult");
const CodingResult = require("../../../models/CodingResult");
const JobApplication = require("../../../models/JobApplication");

const WEIGHTS = {
  skills: 0.4,
  experience: 0.2,
  role: 0.15,
  projects: 0.1,
  preepx: 0.15,
};

function normalizeSkill(skill) {
  return skill.toLowerCase().trim().replace(/[^a-z0-9+#.\s-]/gi, "");
}

function getUserHaystack(user) {
  return [
    user.degree,
    user.bio,
    user.college,
    user.github,
    user.preferredRole,
    ...(user.skills || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchSkills(user, requiredSkills = [], preferredSkills = []) {
  const allJobSkills = [...new Set([...requiredSkills, ...preferredSkills].map(normalizeSkill))].filter(Boolean);
  if (!allJobSkills.length) return { score: 70, matched: [], missing: [] };

  const haystack = getUserHaystack(user);
  const userSkills = (user.skills || []).map(normalizeSkill);
  const matched = [];
  const missing = [];

  for (const skill of allJobSkills) {
    const found =
      userSkills.some((s) => s.includes(skill) || skill.includes(s)) ||
      haystack.includes(skill);
    if (found) matched.push(skill);
    else missing.push(skill);
  }

  const requiredOnly = requiredSkills.map(normalizeSkill).filter(Boolean);
  const requiredMatched = requiredOnly.filter((s) => matched.includes(s));
  const requiredScore = requiredOnly.length ? (requiredMatched.length / requiredOnly.length) * 100 : (matched.length / allJobSkills.length) * 100;

  return {
    score: Math.round(requiredScore),
    matched,
    missing: missing.slice(0, 8),
  };
}

function matchExperience(user, job) {
  const userYears = user.experienceYears ?? inferExperienceYears(user);
  const min = job.experienceMin ?? 0;
  const max = job.experienceMax ?? min + 5;

  if (userYears >= min && userYears <= max) return { score: 100, years: userYears };
  if (userYears < min) {
    const gap = min - userYears;
    return { score: Math.max(0, 100 - gap * 25), years: userYears };
  }
  const over = userYears - max;
  return { score: Math.max(40, 100 - over * 10), years: userYears };
}

function inferExperienceYears(user) {
  const levelMap = { fresher: 0, junior: 1, mid: 3, senior: 6 };
  const bioMatch = (user.bio || "").match(/(\d+(?:\.\d+)?)\s*(?:\+?\s*)?(?:years?|yrs?)/i);
  if (bioMatch) return parseFloat(bioMatch[1]);
  if (user.level >= 5) return 3;
  if (user.level >= 3) return 2;
  return 1;
}

function matchRole(user, jobRole) {
  const haystack = getUserHaystack(user);
  const role = (jobRole || "").toLowerCase();
  if (!role) return 50;
  const tokens = role.split(/\s+/).filter((t) => t.length > 2);
  if (!tokens.length) return 50;
  const hits = tokens.filter((t) => haystack.includes(t)).length;
  return Math.round((hits / tokens.length) * 100);
}

function matchProjects(user) {
  const bio = (user.bio || "").toLowerCase();
  const github = (user.github || "").toLowerCase();
  let score = 30;
  if (bio.length > 80) score += 25;
  if (github.includes("github.com")) score += 25;
  if (bio.match(/project|built|developed|created|implemented/i)) score += 20;
  return Math.min(100, score);
}

async function calcPreepxScore(userId) {
  const [interviews, mcqResults, codingResults] = await Promise.all([
    Interview.find({ userId, status: "completed" }).lean(),
    MCQResult.find({ userId }).lean(),
    CodingResult.find({ userId }).lean(),
  ]);

  const parts = [];
  if (interviews.length) {
    parts.push(
      interviews.reduce((s, i) => s + (i.maxScore ? (i.totalScore / i.maxScore) * 100 : 0), 0) / interviews.length
    );
  }
  if (mcqResults.length) {
    parts.push(
      mcqResults.reduce((s, r) => s + (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0), 0) / mcqResults.length
    );
  }
  if (codingResults.length) {
    const passed = codingResults.filter((r) => r.status?.toLowerCase().includes("pass")).length;
    parts.push((passed / codingResults.length) * 100);
  }
  if (!parts.length) return 35;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

function buildExplanation(matched, missing, expYears, job) {
  const parts = [];
  if (matched.length) parts.push(`Strong match on ${matched.slice(0, 4).join(", ")}`);
  if (missing.length) parts.push(`Missing: ${missing.slice(0, 3).join(", ")}`);
  parts.push(`Experience: ${expYears} years (role requires ${job.experienceMin ?? 0}-${job.experienceMax ?? "?"} yrs)`);
  return parts.join(". ") + ".";
}

async function scoreCandidate(user, job) {
  const requiredSkills = job.requiredSkills?.length ? job.requiredSkills : job.skills || [];
  const skillResult = matchSkills(user, requiredSkills, job.preferredSkills || []);
  const expResult = matchExperience(user, job);
  const roleScore = matchRole(user, job.role);
  const projectScore = matchProjects(user);
  const preepxScore = await calcPreepxScore(user._id);

  const matchScore = Math.round(
    skillResult.score * WEIGHTS.skills +
      expResult.score * WEIGHTS.experience +
      roleScore * WEIGHTS.role +
      projectScore * WEIGHTS.projects +
      preepxScore * WEIGHTS.preepx
  );

  return {
    user,
    matchScore,
    skillsScore: skillResult.score,
    experienceScore: expResult.score,
    roleScore,
    projectScore,
    performanceScore: preepxScore,
    profileScore: calcProfileScore(user),
    matchedSkills: skillResult.matched,
    missingSkills: skillResult.missing,
    experienceYears: expResult.years,
    matchExplanation: buildExplanation(skillResult.matched, skillResult.missing, expResult.years, job),
    matchBreakdown: {
      profileDetails: `Profile completeness: ${calcProfileScore(user)}%`,
      performanceDetails: `PrepEx scores: ${preepxScore}%`,
      skillsDetails: `Required skills: ${skillResult.score}% (${skillResult.matched.length} matched)`,
    },
  };
}

const PROFILE_FIELDS = ["mobile", "college", "degree", "address", "bio", "github", "linkedin", "profilePic"];

function calcProfileScore(user) {
  const filled = PROFILE_FIELDS.filter((f) => user[f] && String(user[f]).trim() !== "").length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

async function matchCandidatesForJob(job) {
  const users = await User.find({
    isBlocked: { $ne: true },
    "hiringVisibility.profileVisible": { $ne: false },
  }).lean();

  const existingApps = await JobApplication.find({ jobId: job._id }).select("userId").lean();
  const existingUserIds = new Set(existingApps.map((a) => a.userId.toString()));

  const results = [];
  for (const user of users) {
    if (existingUserIds.has(user._id.toString())) continue;
    const scored = await scoreCandidate(user, job);
    if (scored.matchScore < 40) continue;
    results.push(scored);
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, 50);
}

async function saveMatchedCandidates(job, matches, recruiterId, companyId) {
  const created = [];
  for (const m of matches) {
    const app = await JobApplication.create({
      jobId: job._id,
      userId: m.user._id,
      recruiterId,
      companyId,
      matchScore: m.matchScore,
      profileScore: m.profileScore,
      performanceScore: m.performanceScore,
      skillsScore: m.skillsScore,
      experienceScore: m.experienceScore,
      roleScore: m.roleScore,
      matchedSkills: m.matchedSkills,
      missingSkills: m.missingSkills,
      experienceYears: m.experienceYears,
      matchExplanation: m.matchExplanation,
      matchBreakdown: m.matchBreakdown,
      status: "matched",
      source: "auto_matched",
      statusHistory: [{ from: null, to: "matched", changedBy: recruiterId, note: "Auto-matched by PreepX" }],
    });
    created.push(app);
  }
  return created;
}

module.exports = {
  matchCandidatesForJob,
  saveMatchedCandidates,
  scoreCandidate,
  calcProfileScore,
  calcPreepxScore,
};
