export const LANGUAGES = [
  { value: 'c-7', base: 'c', label: 'C (gcc 7.3.0)' },
  { value: 'c-13', base: 'c', label: 'C (GCC 13.2.0)' },
  { value: 'cpp-13', base: 'cpp', label: 'C++ (GCC 13.2.0)' },
  { value: 'cpp-7', base: 'cpp', label: 'C++ (g++ 7.3.0)' },
  { value: 'csharp', base: 'csharp', label: 'C# (mcs 5.4.0.201)' },
  { value: 'java-7', base: 'java', label: 'Java (openjdk 1.7.0_91)' },
  { value: 'java-8', base: 'java', label: 'Java 8 (oracle 1.8.0_91)' },
  { value: 'java-21', base: 'java', label: 'Java (OpenJDK 21.0)' },
  { value: 'node-24', base: 'javascript', label: 'JavaScript (Node.js 24.4.1)' },
  { value: 'node-12', base: 'javascript', label: 'JavaScript (Node.js 12.14.0)' },
  { value: 'python-3.12', base: 'python', label: 'Python (3.12.11)' },
  { value: 'python-2.7', base: 'python', label: 'Python (2.7.17)' },
  { value: 'python-3.8', base: 'python', label: 'Python (3.8.1)' },
];

export const BOILERPLATES = {
  c: `#include <stdio.h>\n#include <string.h>\n#include <math.h>\n#include <stdlib.h>\n\nint main() {\n\n    /* Enter your code here. Read input from STDIN. Print output to STDOUT */\n    return 0;\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
  python: `# Write your code here\nimport sys\ninput = sys.stdin.readline\n`,
  javascript: `function solve(input) {\n    // Write your code here\n}\n`,
  csharp: `using System;\nusing System.Collections.Generic;\nusing System.IO;\nclass Solution {\n    static void Main(String[] args) {\n        /* Enter your code here. Read input from STDIN. Print output to STDOUT. */\n    }\n}`
};

export const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
