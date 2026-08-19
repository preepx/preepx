const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const Question = mongoose.model('Question', new mongoose.Schema({ skill: String }, { strict: false }));
  
  const countDa = await Question.countDocuments({ skill: 'dataanalyst' });
  const countDaOriginal = await Question.countDocuments({ skill: 'Data_Analyst' });
  const allSkills = await Question.distinct('skill');
  
  console.log(`Count for dataanalyst: ${countDa}`);
  console.log(`Count for Data_Analyst: ${countDaOriginal}`);
  console.log(`All available skills in DB: ${allSkills.join(', ')}`);
  
  process.exit(0);
}

check();
