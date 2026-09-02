import React from 'react';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SidebarImproveProfile({ 
  profileData, 
  completion = 80, 
  prefix = 'jma', 
  containerClass = 'jma-sidebar-card' 
}) {
  const navigate = useNavigate();

  // Determine check states based on data or mock
  const hasExp = profileData ? (profileData.experience || []).length > 0 : true;
  const hasEmail = profileData ? !!profileData.email : true;
  const hasResume = profileData ? !!profileData.resumeUrl : true;
  const hasEdu = profileData ? (profileData.education || []).length > 0 : true;
  const hasSkills = profileData ? (profileData.skills || []).length > 0 : false;
  const hasPhoto = profileData ? !!profileData.profilePic : false;

  const bgStyle = prefix === 'ajd' 
    ? { background: `conic-gradient(#10b981 ${completion}%, #e2e8f0 0)` }
    : {}; 

  const btnClass = prefix === 'ajd' 
    ? 'ajd-card-cta ajd-cta-solid ajd-cta-row'
    : 'jma-card-cta jma-cta-solid';

  return (
    <div className={containerClass}>
      <div className={`${prefix}-profile-top`}>
        <div className={`${prefix}-profile-text`}>
          <h2>Improve {prefix === 'ajd' ? 'your profile' : 'Your Profile'}</h2>
          <p>Complete these steps to {prefix === 'ajd' ? 'rank higher with recruiters.' : 'increase your chances of getting hired.'}</p>
        </div>
        <div className={`${prefix}-circle-progress`} style={bgStyle}>
          <div className={`${prefix}-circle-inner`}>{completion}%</div>
        </div>
      </div>
      <div className={`${prefix}-checklist`}>
        <div className={`${prefix}-check-item ${hasExp ? "done" : ""}`}>
          {hasExp ? <Check size={14} color="#10b981" /> : <Circle size={14} />} {prefix === 'ajd' ? 'Work exp.' : 'Add Work Experience'}
        </div>
        <div className={`${prefix}-check-item ${hasEmail ? "done" : ""}`}>
          {hasEmail ? <Check size={14} color="#10b981" /> : <Circle size={14} />} Verify email
        </div>
        <div className={`${prefix}-check-item ${hasResume ? "done" : ""}`}>
          {hasResume ? <Check size={14} color="#10b981" /> : <Circle size={14} />} {prefix === 'ajd' ? 'Resume' : 'Upload Resume'}
        </div>
        <div className={`${prefix}-check-item ${hasEdu ? "done" : ""}`}>
          {hasEdu ? <Check size={14} color="#10b981" /> : <Circle size={14} />} {prefix === 'ajd' ? 'Education' : 'Add Education'}
        </div>
        <div className={`${prefix}-check-item ${hasSkills ? "done" : ""}`}>
          {hasSkills ? <Check size={14} color="#10b981" /> : <Circle size={14} />} {prefix === 'ajd' ? 'Skills' : 'Add Skills'}
        </div>
        <div className={`${prefix}-check-item ${hasPhoto ? "done" : ""}`}>
          {hasPhoto ? <Check size={14} color="#10b981" /> : <Circle size={14} />} {prefix === 'ajd' ? 'Photo' : 'Add Portfolio'}
        </div>
      </div>
      <button 
        type="button" 
        className={btnClass} 
        onClick={() => navigate("/profile")}
      >
        Improve profile <ArrowRight size={14} />
      </button>
    </div>
  );
}
