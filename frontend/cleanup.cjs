const fs = require('fs');
const path = require('path');

const root = 'c:/Users/ck436/OneDrive/Desktop/preepx/frontend/src';

const filesToDelete = [
  'pages/ApplyJobsDashboard.jsx',
  'pages/JobBoard.jsx',
  'pages/jobs/JobsMyApplications.jsx',
  'pages/jobs/JobsAssessments.jsx',
  'pages/jobs/JobsProfile.jsx',
  'pages/MyJobApplications.jsx', // Duplicate
  'layouts/JobsLayout.jsx',
  'components/TopCompaniesWidget.jsx',
  'services/candidateJobsAPI.js',
  'styles/ApplyJobsDashboard.css',
  'styles/JobBoard.css',
  'styles/JobsAssessments.css',
  'styles/JobsLayout.css',
  'styles/JobsMyApplications.css',
  'styles/JobsProfile.css'
];

console.log("Cleaning up old files...");

let deletedCount = 0;
filesToDelete.forEach(file => {
  const filePath = path.join(root, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedCount++;
    } catch (err) {
      console.error(`❌ Failed to delete ${file}:`, err.message);
    }
  } else {
    console.log(`ℹ️ Already gone: ${file}`);
  }
});

// Try removing empty pages/jobs folder
try {
  const jobsDir = path.join(root, 'pages/jobs');
  if (fs.existsSync(jobsDir)) {
    fs.rmdirSync(jobsDir);
    console.log(`✅ Removed empty folder: pages/jobs`);
  }
} catch (e) {
  // Folder might not be empty, ignore
}

console.log(`\nCleanup complete! Deleted ${deletedCount} files.`);
