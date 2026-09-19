import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Briefcase, Mic, ClipboardList, Code2 } from "lucide-react";
import HeroMockup from "./HeroMockup";

function HeroSection({ onRecruiterClick }) {
  const navigate = useNavigate();

  const handleRecruiterClick = () => {
    if (onRecruiterClick) {
      onRecruiterClick();
    } else {
      navigate('/auth?role=recruiter');
    }
  };

  return (
    <section className="relative flex items-start lg:items-center justify-center px-4 sm:px-6 overflow-hidden lg:min-h-[calc(100vh-70px)] bg-transparent" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 text-left">
        {/* Left Column: Heading, Subtitle & Buttons */}
        <div className="flex-1 w-full max-w-xl lg:translate-x-12 text-center lg:text-left">
          <h1
            className="font-extrabold leading-tight tracking-normal mb-4"
            style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontFamily: 'Rubik, sans-serif', color: '#000000' }}
          >
            Prepare. Prove. <br />
            <span style={{
              background: 'linear-gradient(90deg, #7C3AED 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline'
            }}>Get Hired.</span>
          </h1>
          <p
            className="mb-6 leading-relaxed mx-auto lg:mx-0 max-w-[460px]"
            style={{ fontFamily: 'Rubik, sans-serif', color: '#334155', fontSize: '12px' }}
          >
            PreepX is an AI-powered platform that helps candidates prepare better and helps recruiters hire the right talent faster.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2 sm:gap-3 mb-5 justify-center lg:justify-start flex-nowrap w-full px-2 mx-auto lg:mx-0 relative left-2 sm:left-0" style={{ marginTop: '16px', maxWidth: '360px' }}>
            <div className="flex flex-col gap-1 items-center flex-1 lg:flex-none">
              <button
                onClick={() => navigate('/auth?role=candidate')}
                className="group relative inline-flex items-center justify-center text-white transition-all transform hover:-translate-y-0.5 overflow-hidden hover:opacity-90 leading-none w-full h-[38px] sm:h-[46px]"
                style={{
                  background: 'linear-gradient(90deg, #3D5EFF 0%, #6017C7 100%)',
                  gap: '4px',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '0 8px',
                  boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(10px, 2.8vw, 15px)',
                  letterSpacing: '0px',
                  whiteSpace: 'nowrap'
                }}
              >
                <img src="/landing/Vector.svg" alt="Candidate" className="w-[12px] h-[12px] sm:w-[16px] sm:h-[16px]" />
                <span>I'm a Candidate</span>
                <span className="ml-0.5 sm:ml-1">→</span>
              </button>
              <span className="text-[8.5px] sm:text-[11px] text-[#555] font-medium text-center block w-full leading-tight">Start preparing for your dream role</span>
            </div>

            <div className="flex flex-col gap-1 items-center flex-1 lg:flex-none">
              <button
                onClick={handleRecruiterClick}
                className="group relative inline-flex items-center justify-center text-white transition-all transform hover:-translate-y-0.5 overflow-hidden hover:opacity-90 leading-none w-full h-[38px] sm:h-[46px]"
                style={{
                  background: 'linear-gradient(90deg, #3D5EFF 0%, #6017C7 100%)',
                  gap: '4px',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '0 8px',
                  boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(10px, 2.8vw, 15px)',
                  letterSpacing: '0px',
                  whiteSpace: 'nowrap'
                }}
              >
                <img src="/landing/fluent-mdl2_add-work.svg" alt="Recruiter" className="w-[12px] h-[12px] sm:w-[16px] sm:h-[16px]" />
                <span>I'm a Recruiter</span>
                <span className="ml-0.5 sm:ml-1">→</span>
              </button>
              <span className="text-[8.5px] sm:text-[11px] text-[#555] font-medium text-center block w-full leading-tight">Find and hire the best talent</span>
            </div>
          </div>

          {/* Feature Tags */}
          <div className="flex flex-nowrap items-center gap-1.5 justify-center lg:justify-start overflow-x-auto" style={{ marginTop: '12px' }}>
            <div
              className="inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 font-medium text-slate-900 shadow-sm whitespace-nowrap flex-shrink-0"
              style={{ height: '32px', gap: '4px', borderRadius: '8px', borderWidth: '1.5px', padding: '0px 8px', boxSizing: 'border-box', fontSize: '10px' }}
            >
              <img src="/landing/bi_mic-fill.svg" alt="Mic" className="w-3 h-3" />
              <span>AI Mock Interviews</span>
            </div>
            <div
              className="inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 font-medium text-slate-900 shadow-sm whitespace-nowrap flex-shrink-0"
              style={{ height: '32px', gap: '4px', borderRadius: '8px', borderWidth: '1.5px', padding: '0px 8px', boxSizing: 'border-box', fontSize: '10px' }}
            >
              <img src="/landing/fluent_notepad-edit-20-filled.svg" alt="Exam" className="w-3 h-3" />
              <span>Objective Exam</span>
            </div>
            <div
              className="inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 font-medium text-slate-900 shadow-sm whitespace-nowrap flex-shrink-0"
              style={{ height: '32px', gap: '4px', borderRadius: '8px', borderWidth: '1.5px', padding: '0px 8px', boxSizing: 'border-box', fontSize: '10px' }}
            >
              <img src="/landing/hugeicons_message-programming.svg" alt="Code" className="w-3 h-3" />
              <span>Coding Challenges</span>
            </div>
          </div>

        </div>

        {/* Right Column: Hidden on mobile */}
        <div className="hidden lg:flex flex-1 w-full flex-col justify-end items-end gap-6 max-w-lg lg:translate-y-4 lg:-translate-x-8">
          <div className="w-full h-[320px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100">
            {/* Placeholder for future content/mockup */}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
