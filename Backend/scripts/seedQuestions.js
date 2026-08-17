require("dotenv").config();
const mongoose = require("mongoose");
const CodingProblem = require("../models/CodingProblem");
const problemsData = require("./sample_problems.json");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing problems (optional, but good for testing)
    // await CodingProblem.deleteMany();
    
    // Iterate with index to assign dayNumber
    const totalProblems = problemsData.length;
    for (let i = 0; i < totalProblems; i++) {
      const item = problemsData[i];
      const title = item.title;
      
      // Calculate day number (distribute evenly across 100 days)
      const dayNumber = Math.min(100, Math.ceil((i + 1) * 100 / totalProblems));
      
      const existing = await CodingProblem.findOne({ title });
      
      // Map user's custom JSON format to our Mongoose Schema
      const description = `**Problem Statement**\n${item.problem_statement}\n\n**Input Format**\n${item.input_format}\n\n**Output Format**\n${item.output_format}`;
      
      // Determine topic based on title keywords
      let assignedTopics = ["Array"];
      const lowerTitle = item.title.toLowerCase();
      if (lowerTitle.includes("hash") || lowerTitle.includes("frequency") || lowerTitle.includes("cache") || lowerTitle.includes("distinct") || lowerTitle.includes("duplicate file")) {
        assignedTopics = ["HashMap"];
      } else if (lowerTitle.includes("string") || lowerTitle.includes("anagram") || lowerTitle.includes("palindrome") || lowerTitle.includes("word") || lowerTitle.includes("character") || lowerTitle.includes("prefix")) {
        assignedTopics = ["String"];
      } else if (lowerTitle.includes("list") || lowerTitle.includes("node") || lowerTitle.includes("pointer")) {
        assignedTopics = ["Linked List"];
      } else if (lowerTitle.includes("stack") || lowerTitle.includes("parentheses") || lowerTitle.includes("calculator") || lowerTitle.includes("postfix") || lowerTitle.includes("prefix eval") || lowerTitle.includes("polish") || lowerTitle.includes("asteroid") || lowerTitle.includes("histogram")) {
        assignedTopics = ["Stack"];
      }
      
      const testCases = [];
      if (item.example_input && item.example_output) {
        testCases.push({
          input: String(item.example_input),
          output: String(item.example_output)
        });
      }

      const problemToSave = {
        title: item.title,
        description: description,
        difficulty: "easy", // Default since it's missing in their JSON
        topics: assignedTopics,
        dayNumber: dayNumber, // Assign the calculated day
        acceptanceRate: Math.floor(Math.random() * 50) + 40, // Random 40-90%
        points: 100,
        testCases: testCases,
        boilerplateCode: {
          javascript: "function solve(input) {\n    // Write your code here\n}",
          python: "def solve(input):\n    # Write your code here\n    pass"
        }
      };

      if (!existing) {
        await CodingProblem.create(problemToSave);
        console.log(`Added: ${title} (Day ${dayNumber})`);
      } else {
        // Update existing to ensure it has dayNumber and correct topics
        await CodingProblem.updateOne({ title }, { $set: problemToSave });
        console.log(`Updated: ${title} (Day ${dayNumber})`);
      }
    }
    
    console.log("Data import complete!");
    process.exit();
  } catch (error) {
    console.error(`Error during import: ${error.message}`);
    process.exit(1);
  }
};

importData();
