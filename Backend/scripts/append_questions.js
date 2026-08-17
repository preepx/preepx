const fs = require('fs');

const stringsList = [
  "Valid Anagram", "Valid Palindrome", "Reverse String", "Reverse Words", "Longest Common Prefix",
  "Roman to Integer", "Integer to Roman", "String Compression", "Longest Substring Without Repeating Characters",
  "Group Anagrams", "Minimum Window Substring", "Decode String", "Zigzag Conversion", "Count and Say",
  "Compare Version Numbers", "Multiply Strings", "Implement strStr", "KMP Pattern Matching", "Rabin-Karp",
  "Z Algorithm", "Longest Palindromic Substring", "Shortest Palindrome", "Text Justification", "Reverse Vowels",
  "Isomorphic Strings", "Word Pattern", "Add Binary", "Valid Parentheses String", "Custom String Sort", "String Rotation"
];

const hashmapList = [
  "Two Sum using HashMap", "Frequency Counter", "Top K Frequent Elements", "Happy Number", "Isomorphic Strings",
  "Group Shifted Strings", "Subarray Sum Equals K", "Longest Harmonious Subsequence", "Word Frequency",
  "Count Distinct Elements", "Find Duplicate File", "Common Characters", "First Unique Character", "Majority Element II",
  "Longest Equal Subarray", "Count Good Pairs", "Most Frequent Even Number", "Intersection of Arrays",
  "Find Difference of Arrays", "Pair Sum", "Random Pick", "Design HashMap", "Design HashSet",
  "Sparse Vector Dot Product", "LRU Cache"
];

const filePath = 'c:\\Users\\ck436\\OneDrive\\Desktop\\interview-coch\\backend\\scripts\\sample_problems.json';

try {
  let data = [];
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  let currentId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) : 0;

  stringsList.forEach(title => {
    currentId++;
    data.push({
      id: currentId,
      title: title,
      problem_statement: `Solve the problem: ${title}. Given the appropriate string inputs, find the solution according to standard algorithms.`,
      input_format: "First line contains string input.",
      output_format: "Print the correct output string or integer.",
      example_input: "example_string",
      example_output: "expected_output"
    });
  });

  hashmapList.forEach(title => {
    currentId++;
    data.push({
      id: currentId,
      title: title,
      problem_statement: `Solve the problem: ${title}. Optimize the solution using a HashMap (Hash Table).`,
      input_format: "First line contains N. Second line contains array elements.",
      output_format: "Print the required counts or elements.",
      example_input: "5\\n1 2 2 3 1",
      example_output: "correct_answer"
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Successfully added 55 new questions. Total questions now: ${data.length}`);
} catch (error) {
  console.error("Error updating JSON:", error);
}
