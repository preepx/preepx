import React from "react";
import { useNavigate } from "react-router-dom";
import { Video, FileText, PlayCircle, ChevronRight } from "lucide-react";

export default function PracticeGrid() {
  const navigate = useNavigate();

  return (
    <section className="ud-section">
      <div className="ud-section-head">
        <h2>Continue Practicing</h2>
        <p>Your next session is one click away</p>
      </div>
      <div className="ud-practice-grid">
        <button
          type="button"
          className="ud-practice-card ud-practice-primary"
          onClick={() => navigate("/interview")}
        >
          <div className="ud-practice-glow" />
          <div className="ud-practice-icon"><Video size={26} /></div>
          <div className="ud-practice-body">
            <h3>Start Mock Interview</h3>
            <p>Live AI interview with webcam, voice & instant scoring</p>
            <span className="ud-practice-cta">Start now <ChevronRight size={16} /></span>
          </div>
          <PlayCircle size={28} className="ud-practice-play" />
        </button>

        <button
          type="button"
          className="ud-practice-card ud-practice-secondary"
          onClick={() => navigate("/objective-exam")}
        >
          <div className="ud-practice-glow" />
          <div className="ud-practice-icon"><FileText size={26} /></div>
          <div className="ud-practice-body">
            <h3>Objective Exam</h3>
            <p>Quick MCQ quizzes to test your technical knowledge</p>
            <span className="ud-practice-cta">Take quiz <ChevronRight size={16} /></span>
          </div>
        </button>
      </div>
    </section>
  );
}
