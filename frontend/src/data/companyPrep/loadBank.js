const bankModules = import.meta.glob("./banks/*.json", { eager: true });

const banksBySlug = {};
for (const [path, mod] of Object.entries(bankModules)) {
  const file = path.split("/").pop().replace(".json", "");
  const data = mod?.default || mod;
  banksBySlug[data.slug || file] = data;
}

export function getCompanyBank(slug) {
  const bank = banksBySlug[slug];
  if (!bank) return { slug, company_name: slug, questions: [] };
  return {
    slug: bank.slug || slug,
    company_name: bank.company_name || slug,
    questions: Array.isArray(bank.questions) ? bank.questions : [],
  };
}

export function getQuestion(slug, questionId) {
  const bank = getCompanyBank(slug);
  return bank.questions.find((q) => String(q.id) === String(questionId)) || null;
}
