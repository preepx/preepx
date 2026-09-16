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
    <section className="relative flex items-center justify-center py-12 px-6 overflow-hidden min-h-[calc(100vh-70px)] bg-transparent">
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 text-left">
        {/* Left Column: Heading, Subtitle & Buttons */}
        <div className="flex-1 max-w-xl lg:translate-x-12">
          <h1
            className="font-extrabold text-[#000000] leading-none tracking-normal mb-5"
            style={{ fontSize: '48px', fontFamily: 'Rubik, sans-serif' }}
          >
            Prepare. Prove. <br />
            Get Hired.
          </h1>
          <p
            className="text-sm md:text-base text-[#000000] mb-8 max-w-[460px] leading-relaxed"
            style={{ fontFamily: 'Rubik, sans-serif' }}
          >
            PreepX is an AI-powered platform that helps candidates prepare better and helps recruiters hire the right talent faster.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 mb-8" style={{ marginTop: '20px' }}>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/auth?role=candidate')}
                className="group relative inline-flex items-center justify-center text-[#000000] transition-all transform hover:-translate-y-0.5 overflow-hidden hover:opacity-90 leading-none"
                style={{
                  background: 'linear-gradient(90deg, #3D5EFF 0%, #6017C7 100%)',
                  width: '230px',
                  height: '46px',
                  gap: '10px',
                  borderRadius: '10px',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: '#1e293b',
                  padding: '8px',
                  boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  letterSpacing: '0px',
                  whiteSpace: 'nowrap'
                }}
              >
                <img src="/landing/Vector.svg" alt="Candidate" className="w-[18px] h-[18px]" />
                <span>I'm a Candidate</span>
                <img src="/landing/Vector%20(1).svg" alt="arrow" className="transition-transform group-hover:translate-x-1 w-4 h-4" />
              </button>
              <span className="text-[13px] text-[#000000] font-medium px-1 w-[230px] text-center block">Start preparing for your dream role</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleRecruiterClick}
                className="group relative inline-flex items-center justify-center text-[#000000] transition-all transform hover:-translate-y-0.5 overflow-hidden hover:opacity-90 leading-none"
                style={{
                  background: 'linear-gradient(90deg, #3D5EFF 0%, #6017C7 100%)',
                  width: '230px',
                  height: '46px',
                  gap: '10px',
                  borderRadius: '10px',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: '#1e293b',
                  padding: '8px',
                  boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  letterSpacing: '0px',
                  whiteSpace: 'nowrap'
                }}
              >
                <img src="/landing/fluent-mdl2_add-work.svg" alt="Recruiter" className="w-[18px] h-[18px]" />
                <span>I'm a Recruiter</span>
                <img src="/landing/Vector%20(1).svg" alt="arrow" className="transition-transform group-hover:translate-x-1 w-4 h-4" />
              </button>
              <span className="text-[13px] text-[#000000] font-medium px-1 w-[230px] text-center block">Find and hire the best talent</span>
            </div>
          </div>

          {/* Feature Tags */}
          <div className="flex flex-nowrap items-center justify-between w-[480px]" style={{ marginTop: '12px' }}>
            <div
              className="inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 text-[13px] font-medium text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 whitespace-nowrap"
              style={{ width: '154px', height: '49px', gap: '6px', borderRadius: '10px', borderWidth: '2px', padding: '0px', boxSizing: 'border-box' }}
            >
              <img src="/landing/bi_mic-fill.svg" alt="Mic" className="w-4 h-4" />
              <span>AI Mock Interviews</span>
            </div>
            <div
              className="inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 text-[13px] font-medium text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 whitespace-nowrap"
              style={{ width: '154px', height: '49px', gap: '6px', borderRadius: '10px', borderWidth: '2px', padding: '0px', boxSizing: 'border-box' }}
            >
              <img src="/landing/fluent_notepad-edit-20-filled.svg" alt="Exam" className="w-4 h-4" />
              <span>Objective Exam</span>
            </div>
            <div
              className="inline-flex items-center justify-center bg-[#E5E9FF] border-slate-900 text-[13px] font-medium text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 whitespace-nowrap"
              style={{ width: '154px', height: '49px', gap: '6px', borderRadius: '10px', borderWidth: '2px', padding: '0px', boxSizing: 'border-box' }}
            >
              <img src="/landing/hugeicons_message-programming.svg" alt="Code" className="w-4 h-4" />
              <span>Coding Challenges</span>
            </div>
          </div>
        </div>

        {/* Right Column: Blank White Card & Feature Tags */}
        <div className="flex-1 w-full flex flex-col justify-end items-end gap-6 max-w-lg mt-8 lg:mt-0 lg:translate-y-4 lg:-translate-x-8">
          <div className="w-full h-[320px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100">
            {/* Placeholder for future content/mockup */}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
