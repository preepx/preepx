import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Lightbulb, BookOpen, Code2, ListChecks, ChevronRight
} from "lucide-react";
import { getCompanyBySlug } from "@/data/companyPrep/companies";
import { isQuestionSolved, markQuestionSolved } from "@/data/companyPrep/progress";
import qapi from "@/utils/qapi";
import notify from "@/utils/notify";
import "@/styles/CompanyPrep.css";

export default function CompanyQuestionPractice() {
  const { slug, questionId } = useParams();
  const navigate = useNavigate();
  const company = getCompanyBySlug(slug);

  const [questionsData, setQuestionsData] = useState([]);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    qapi.get(`/company-prep?company=${slug}`)
      .then(res => {
        console.log(`🔥 Fetched Data for Practice from Database!`);
        setQuestionsData(res.data);
        const q = res.data.find(item => String(item.id || item._id) === String(questionId));
        setQuestion(q || null);
      })
      .catch(err => console.error("Error fetching question", err))
      .finally(() => setLoading(false));
  }, [slug, questionId]);

  const [solved, setSolved] = useState(() => isQuestionSolved(slug, questionId));
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState("");

  const neighbors = useMemo(() => {
    const list = Array.isArray(questionsData) ? questionsData : [];
    const idx = list.findIndex((q) => String(q.id || q._id) === String(questionId));
    return {
      prev: idx > 0 ? list[idx - 1] : null,
      next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
    };
  }, [questionsData, questionId]);

  useEffect(() => {
    setSolved(isQuestionSolved(slug, questionId));
    setPicked(null);
    setChecked(false);
    setShowAnswer(false);
    setCode(question?.starterCode?.[lang] || question?.starterCode?.javascript || "");
  }, [slug, questionId, question, lang]);

  const markSolved = () => {
    markQuestionSolved(slug, questionId);
    setSolved(true);
    notify.success("Marked as solved");
  };

  if (loading) {
    return (
      <div className="cp-page">
        <p className="cp-empty">Loading question...</p>
      </div>
    );
  }

  if (!company || !question) {
    return (
      <div className="cp-page">
        <button type="button" className="cp-back" onClick={() => navigate(`/company-prep/${slug}`)}>
          <ArrowLeft size={16} /> Back to bank
        </button>
        <p className="cp-empty">Question not found.</p>
      </div>
    );
  }

  const checkMcq = () => {
    setChecked(true);
    if (picked === question.answer) {
      markSolved();
    }
  };

  return (
    <div className="cp-page cp-practice">
      <div className="cp-practice-nav">
        <button type="button" className="cp-back" onClick={() => navigate(`/company-prep/${slug}`)}>
          <ArrowLeft size={16} /> {company.name}
        </button>
        <div className="cp-practice-nav-right">
          {neighbors.prev && (
            <button type="button" className="cp-nav-q" onClick={() => navigate(`/company-prep/${slug}/${neighbors.prev.id || neighbors.prev._id}`)}>
              Prev
            </button>
          )}
          {neighbors.next && (
            <button type="button" className="cp-nav-q" onClick={() => navigate(`/company-prep/${slug}/${neighbors.next.id || neighbors.next._id}`)}>
              Next <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      <header className="cp-practice-head" style={{ "--accent": company.pColor1, "--accent-2": company.pColor2 }}>
        <div className="cp-logo-lg sm">
          <img src={company.logo} alt="" />
        </div>
        <div>
          <div className="cp-name-row">
            <span className={`cp-chip ${question.type === "coding" ? "cp-chip-coding" : question.type === "mcq" ? "cp-chip-mcq" : "cp-chip-theory"}`}>
              {question.type === "coding" ? <Code2 size={12} /> : question.type === "mcq" ? <ListChecks size={12} /> : <BookOpen size={12} />}
              {question.type.toUpperCase()}
            </span>
            <span className={`cp-diff ${question.difficulty?.toLowerCase()}`}>{question.difficulty}</span>
            {solved && <span className="cp-solved"><CheckCircle2 size={14} /> Solved</span>}
          </div>
          <h1>{question.title}</h1>
          <p>{question.topic} · {company.name} prep</p>
        </div>
      </header>

      <div className="cp-workspace">
        <section className="cp-panel">
          {question.type === "coding" && (
            <>
              <h3>Problem</h3>
              <p className="cp-body">{question.statement}</p>
              {question.examples?.length > 0 && (
                <>
                  <h3>Examples</h3>
                  {question.examples.map((ex, i) => (
                    <div key={i} className="cp-example">
                      <div><strong>Input</strong><pre>{ex.input}</pre></div>
                      <div><strong>Output</strong><pre>{ex.output}</pre></div>
                    </div>
                  ))}
                </>
              )}
              {question.constraints && (
                <>
                  <h3>Constraints</h3>
                  <p className="cp-body">{question.constraints}</p>
                </>
              )}
              {question.hints?.length > 0 && (
                <details className="cp-hints">
                  <summary><Lightbulb size={14} /> Hints</summary>
                  <ul>{question.hints.map((h, i) => <li key={i}>{h}</li>)}</ul>
                </details>
              )}
            </>
          )}

          {question.type === "mcq" && (
            <>
              <h3>Question</h3>
              <p className="cp-body">{question.title}</p>
              <div className="cp-options">
                {(question.options || []).map((opt, i) => {
                  let cls = "";
                  if (checked) {
                    if (i === question.answer) cls = "correct";
                    else if (i === picked) cls = "wrong";
                  } else if (picked === i) cls = "picked";
                  return (
                    <button key={i} type="button" className={`cp-option ${cls}`} onClick={() => !checked && setPicked(i)}>
                      <span>{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {!checked ? (
                <button type="button" className="cp-primary" disabled={picked == null} onClick={checkMcq}>
                  Check answer
                </button>
              ) : (
                <div className="cp-explain">
                  {picked === question.answer ? "Correct." : "Not quite."} {question.explanation}
                </div>
              )}
            </>
          )}

          {question.type === "theory" && (
            <>
              <h3>Prompt</h3>
              <p className="cp-body">{question.prompt || question.title}</p>
              {!showAnswer ? (
                <button type="button" className="cp-primary" onClick={() => setShowAnswer(true)}>
                  Reveal model answer
                </button>
              ) : (
                <div className="cp-model">
                  <h3>Key points</h3>
                  <ul>{(question.keyPoints || []).map((k, i) => <li key={i}>{k}</li>)}</ul>
                  <h3>Model answer</h3>
                  <p className="cp-body">{question.modelAnswer}</p>
                </div>
              )}
            </>
          )}
        </section>

        <section className="cp-panel cp-editor-panel">
          {question.type === "coding" ? (
            <>
              <div className="cp-lang-tabs">
                {Object.keys(question.starterCode || { javascript: true }).map((l) => (
                  <button key={l} type="button" className={lang === l ? "active" : ""} onClick={() => setLang(l)}>
                    {l}
                  </button>
                ))}
              </div>
              <textarea
                className="cp-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />
              <button type="button" className="cp-primary" onClick={markSolved} disabled={solved}>
                {solved ? "Solved" : "Mark as solved"}
              </button>
            </>
          ) : (
            <div className="cp-notes">
              <h3>Your notes</h3>
              <textarea placeholder="Write your approach here..." />
              {!solved && (
                <button type="button" className="cp-primary" onClick={markSolved}>
                  Mark as solved
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
