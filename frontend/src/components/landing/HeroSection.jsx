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

          {/* Action Buttons & Feature Tags Section (Centered relative to the buttons) */}
          <div className="w-full sm:max-w-[412px] mx-auto lg:mx-0" style={{ marginTop: '16px' }}>
            {/* Action Buttons */}
            <div className="flex flex-row gap-2 sm:gap-3 mb-5 justify-between flex-nowrap w-full">
              <div className="flex flex-col gap-1 items-center flex-1 w-full sm:w-[195px] lg:w-[200px]">
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
                    fontSize: 'clamp(9px, 2.5vw, 15px)',
                    letterSpacing: '0px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <img src="/landing/Vector.svg" alt="Candidate" className="w-[10px] h-[10px] min-[360px]:w-[12px] min-[360px]:h-[12px] sm:w-[16px] sm:h-[16px]" />
                  <span>I'm a Candidate</span>
                  <span className="ml-0.5 sm:ml-1">→</span>
                </button>
                <span className="text-[7.5px] min-[360px]:text-[8.5px] sm:text-[11px] text-[#555] font-medium text-center block w-full leading-tight">Start preparing for your dream role</span>
              </div>

              <div className="flex flex-col gap-1 items-center flex-1 w-full sm:w-[195px] lg:w-[200px]">
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
                    fontSize: 'clamp(9px, 2.5vw, 15px)',
                    letterSpacing: '0px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <img src="/landing/fluent-mdl2_add-work.svg" alt="Recruiter" className="w-[10px] h-[10px] min-[360px]:w-[12px] min-[360px]:h-[12px] sm:w-[16px] sm:h-[16px]" />
                  <span>I'm a Recruiter</span>
                  <span className="ml-0.5 sm:ml-1">→</span>
                </button>
                <span className="text-[7.5px] min-[360px]:text-[8.5px] sm:text-[11px] text-[#555] font-medium text-center block w-full leading-tight">Find and hire the best talent</span>
              </div>
            </div>

            {/* Feature Tags - Stretches from "Start preparing..." to "...best talent" */}
            <div className="flex flex-row items-center gap-1.5 sm:gap-2.5 w-full" style={{ marginTop: '14px' }}>
              <div
                className="flex-1 min-w-0 inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 font-medium text-slate-900 shadow-sm whitespace-nowrap cursor-default hover:bg-[#dbe2ff] transition-all"
                style={{ height: '34px', gap: '5px', borderRadius: '8px', borderWidth: '1.5px', padding: '0px 6px', boxSizing: 'border-box' }}
              >
                <img src="/landing/bi_mic-fill.svg" alt="Mic" className="w-3 h-3 flex-shrink-0" />
                <span className="text-[9px] min-[360px]:text-[9.5px] sm:text-[10.5px] truncate">AI Mock Interviews</span>
              </div>

              <div
                className="flex-1 min-w-0 inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 font-medium text-slate-900 shadow-sm whitespace-nowrap cursor-default hover:bg-[#dbe2ff] transition-all"
                style={{ height: '34px', gap: '5px', borderRadius: '8px', borderWidth: '1.5px', padding: '0px 6px', boxSizing: 'border-box' }}
              >
                <img src="/landing/fluent_notepad-edit-20-filled.svg" alt="Exam" className="w-3 h-3 flex-shrink-0" />
                <span className="text-[9px] min-[360px]:text-[9.5px] sm:text-[10.5px] truncate">Objective Exam</span>
              </div>

              <div
                className="flex-1 min-w-0 inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 font-medium text-slate-900 shadow-sm whitespace-nowrap cursor-default hover:bg-[#dbe2ff] transition-all"
                style={{ height: '34px', gap: '5px', borderRadius: '8px', borderWidth: '1.5px', padding: '0px 6px', boxSizing: 'border-box' }}
              >
                <img src="/landing/hugeicons_message-programming.svg" alt="Code" className="w-3 h-3 flex-shrink-0" />
                <span className="text-[9px] min-[360px]:text-[9.5px] sm:text-[10.5px] truncate">Coding Challenges</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Landing Page Image */}
        <img
          src="/landing/landingepageimage.svg"
          alt="PreepX Platform"
          className="hidden lg:block flex-1 w-full max-w-[500px] h-auto object-cover mix-blend-multiply lg:translate-y-2 lg:-translate-x-2"
        />
      </div>
    </section>
  );
}

export default HeroSection;
