const fs = require('fs');
const path = require('path');

const root = 'c:/Users/ck436/OneDrive/Desktop/preepx/frontend/src';

const moves = [
  {
    src: 'pages/ApplyJobsDashboard.jsx',
    dest: 'features/apply-jobs/pages/ApplyJobsDashboard.jsx',
    replaces: [
      { from: '@/services/candidateJobsAPI', to: '../services/candidateJobsAPI' },
      { from: '@/styles/ApplyJobsDashboard.css', to: '../styles/ApplyJobsDashboard.css' }
    ]
  },
  {
    src: 'pages/JobBoard.jsx',
    dest: 'features/apply-jobs/pages/JobBoard.jsx',
    replaces: [
      { from: '@/services/candidateJobsAPI', to: '../services/candidateJobsAPI' },
      { from: '@/styles/JobBoard.css', to: '../styles/JobBoard.css' },
      { from: '@/styles/ApplyJobsDashboard.css', to: '../styles/ApplyJobsDashboard.css' }
    ]
  },
  {
    src: 'pages/jobs/JobsMyApplications.jsx',
    dest: 'features/apply-jobs/pages/JobsMyApplications.jsx',
    replaces: [
      { from: '@/services/candidateJobsAPI', to: '../services/candidateJobsAPI' },
      { from: '@/styles/ApplyJobsDashboard.css', to: '../styles/ApplyJobsDashboard.css' },
      { from: '@/styles/JobsMyApplications.css', to: '../styles/JobsMyApplications.css' }
    ]
  },
  {
    src: 'pages/jobs/JobsAssessments.jsx',
    dest: 'features/apply-jobs/pages/JobsAssessments.jsx',
    replaces: [
      { from: '@/styles/ApplyJobsDashboard.css', to: '../styles/ApplyJobsDashboard.css' },
      { from: '@/styles/JobsAssessments.css', to: '../styles/JobsAssessments.css' }
    ]
  },
  {
    src: 'pages/jobs/JobsProfile.jsx',
    dest: 'features/apply-jobs/pages/JobsProfile.jsx',
    replaces: [
      { from: '@/styles/JobsProfile.css', to: '../styles/JobsProfile.css' }
    ]
  },
  {
    src: 'layouts/JobsLayout.jsx',
    dest: 'features/apply-jobs/layout/JobsLayout.jsx',
    replaces: [
      { from: '@/services/candidateJobsAPI', to: '../services/candidateJobsAPI' },
      { from: '@/styles/JobsLayout.css', to: '../styles/JobsLayout.css' }
    ]
  },
  {
    src: 'services/candidateJobsAPI.js',
    dest: 'features/apply-jobs/services/candidateJobsAPI.js',
    replaces: []
  },
  {
    src: 'components/TopCompaniesWidget.jsx',
    dest: 'features/apply-jobs/components/TopCompaniesWidget.jsx',
    replaces: []
  },
  // CSS FILES
  { src: 'styles/ApplyJobsDashboard.css', dest: 'features/apply-jobs/styles/ApplyJobsDashboard.css', replaces: [] },
  { src: 'styles/JobBoard.css', dest: 'features/apply-jobs/styles/JobBoard.css', replaces: [] },
  { src: 'styles/JobsAssessments.css', dest: 'features/apply-jobs/styles/JobsAssessments.css', replaces: [] },
  { src: 'styles/JobsLayout.css', dest: 'features/apply-jobs/styles/JobsLayout.css', replaces: [] },
  { src: 'styles/JobsMyApplications.css', dest: 'features/apply-jobs/styles/JobsMyApplications.css', replaces: [] },
  { src: 'styles/JobsProfile.css', dest: 'features/apply-jobs/styles/JobsProfile.css', replaces: [] }
];

moves.forEach(move => {
  const srcPath = path.join(root, move.src);
  const destPath = path.join(root, move.dest);
  
  if (fs.existsSync(srcPath)) {
    // Create dir if not exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    // Read, Replace, Write
    let content = fs.readFileSync(srcPath, 'utf8');
    move.replaces.forEach(replace => {
      // global replace string
      content = content.split(replace.from).join(replace.to);
    });
    fs.writeFileSync(destPath, content);
    console.log(`Moved and updated ${move.src} to ${move.dest}`);
    
    // Optional: Delete old file
    fs.unlinkSync(srcPath);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
});

// App.jsx update
const appJsxPath = path.join(root, 'App.jsx');
if (fs.existsSync(appJsxPath)) {
  let appContent = fs.readFileSync(appJsxPath, 'utf8');
  appContent = appContent.replace(
    'const ApplyJobsDashboard = lazy(() => import("./pages/ApplyJobsDashboard"));',
    'const ApplyJobsDashboard = lazy(() => import("./features/apply-jobs/pages/ApplyJobsDashboard"));'
  );
  appContent = appContent.replace(
    'const JobBoard = lazy(() => import("./pages/JobBoard"));',
    'const JobBoard = lazy(() => import("./features/apply-jobs/pages/JobBoard"));'
  );
  appContent = appContent.replace(
    'const JobsMyApplications = lazy(() => import("./pages/jobs/JobsMyApplications"));',
    'const JobsMyApplications = lazy(() => import("./features/apply-jobs/pages/JobsMyApplications"));'
  );
  appContent = appContent.replace(
    'const JobsAssessments = lazy(() => import("./pages/jobs/JobsAssessments"));',
    'const JobsAssessments = lazy(() => import("./features/apply-jobs/pages/JobsAssessments"));'
  );
  appContent = appContent.replace(
    'const JobsProfile = lazy(() => import("./pages/jobs/JobsProfile"));',
    'const JobsProfile = lazy(() => import("./features/apply-jobs/pages/JobsProfile"));'
  );
  appContent = appContent.replace(
    'const JobsLayout = lazy(() => import("./layouts/JobsLayout"));',
    'const JobsLayout = lazy(() => import("./features/apply-jobs/layout/JobsLayout"));'
  );
  fs.writeFileSync(appJsxPath, appContent);
  console.log("Updated App.jsx imports");
}

// Delete duplicate MyJobApplications if unused
const duplicatePath = path.join(root, 'pages/MyJobApplications.jsx');
if (fs.existsSync(duplicatePath)) {
    fs.unlinkSync(duplicatePath);
    console.log("Deleted old duplicate MyJobApplications.jsx");
}

// Also check if src/pages/jobs is empty, and try to remove it
try {
    const jobsDir = path.join(root, 'pages/jobs');
    if (fs.existsSync(jobsDir)) {
        fs.rmdirSync(jobsDir);
        console.log("Removed empty pages/jobs dir");
    }
} catch (e) {
    console.warn("Could not remove pages/jobs dir (might not be empty)");
}
