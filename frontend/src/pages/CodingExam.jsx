import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Webcam from 'react-webcam';
import { Play, CheckCircle2, XCircle, Clock, ArrowLeft, Terminal, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFaceDetection } from '../hooks/useFaceDetection';
import API from '../utils/api';
import './CodingExam.css';

const mockQuestions = {
  easy: [
    {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
      ],
      starterCode: {
        javascript: 'function twoSum(nums, target) {\n    // Write your code here\n    \n}',
        python: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}',
        csharp: 'public class Solution {\n    public int[] TwoSum(int[] nums, int target) {\n        // Write your code here\n        \n    }\n}',
        go: 'func twoSum(nums []int, target int) []int {\n    // Write your code here\n    \n}',
        rust: 'impl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        // Write your code here\n        \n    }\n}',
        ruby: 'def two_sum(nums, target)\n    # Write your code here\n    \nend',
        php: 'class Solution {\n    /**\n     * @param Integer[] $nums\n     * @param Integer $target\n     * @return Integer[]\n     */\n    function twoSum($nums, $target) {\n        // Write your code here\n        \n    }\n}',
        swift: 'class Solution {\n    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {\n        // Write your code here\n        \n    }\n}',
        typescript: 'function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n    \n}',
        kotlin: 'class Solution {\n    fun twoSum(nums: IntArray, target: Int): IntArray {\n        // Write your code here\n        \n    }\n}',
        scala: 'object Solution {\n    def twoSum(nums: Array[Int], target: Int): Array[Int] = {\n        // Write your code here\n        \n    }\n}',
        r: 'twoSum <- function(nums, target) {\n    # Write your code here\n    \n}',
        objectivec: '@implementation Solution\n- (NSArray<NSNumber *> *)twoSum:(NSArray<NSNumber *> *)nums target:(NSInteger)target {\n    // Write your code here\n    \n}\n@end',
        perl: 'sub twoSum {\n    my ($nums, $target) = @_;\n    # Write your code here\n    \n}',
        haskell: 'twoSum :: [Int] -> Int -> [Int]\ntwoSum nums target =\n    -- Write your code here\n    ',
        lua: 'function twoSum(nums, target)\n    -- Write your code here\n    \nend',
        dart: 'class Solution {\n    List<int> twoSum(List<int> nums, int target) {\n        // Write your code here\n        \n    }\n}'
      }
    },
    {
      title: 'Valid Palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
      examples: [
        { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
        { input: 's = "race a car"', output: 'false' }
      ],
      starterCode: {
        javascript: 'function isPalindrome(s) {\n    // Write your code here\n    \n}',
        python: 'def isPalindrome(s):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your code here\n        \n    }\n};',
        java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your code here\n        \n    }\n}',
        csharp: 'public class Solution {\n    public bool IsPalindrome(string s) {\n        // Write your code here\n        \n    }\n}',
        go: 'func isPalindrome(s string) bool {\n    // Write your code here\n    \n}',
        rust: 'impl Solution {\n    pub fn is_palindrome(s: String) -> bool {\n        // Write your code here\n        \n    }\n}',
        ruby: 'def is_palindrome(s)\n    # Write your code here\n    \nend',
        php: 'class Solution {\n    /**\n     * @param String $s\n     * @return Boolean\n     */\n    function isPalindrome($s) {\n        // Write your code here\n        \n    }\n}',
        swift: 'class Solution {\n    func isPalindrome(_ s: String) -> Bool {\n        // Write your code here\n        \n    }\n}',
        typescript: 'function isPalindrome(s: string): boolean {\n    // Write your code here\n    \n}',
        kotlin: 'class Solution {\n    fun isPalindrome(s: String): Boolean {\n        // Write your code here\n        \n    }\n}',
        scala: 'object Solution {\n    def isPalindrome(s: String): Boolean = {\n        // Write your code here\n        \n    }\n}',
        r: 'isPalindrome <- function(s) {\n    # Write your code here\n    \n}',
        objectivec: '@implementation Solution\n- (BOOL)isPalindrome:(NSString *)s {\n    // Write your code here\n    \n}\n@end',
        perl: 'sub isPalindrome {\n    my ($s) = @_;\n    # Write your code here\n    \n}',
        haskell: 'isPalindrome :: String -> Bool\nisPalindrome s =\n    -- Write your code here\n    ',
        lua: 'function isPalindrome(s)\n    -- Write your code here\n    \nend',
        dart: 'class Solution {\n    bool isPalindrome(String s) {\n        // Write your code here\n        \n    }\n}'
      }
    },
    {
      title: 'Contains Duplicate',
      description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
      examples: [
        { input: 'nums = [1,2,3,1]', output: 'true' },
        { input: 'nums = [1,2,3,4]', output: 'false' }
      ],
      starterCode: {
        javascript: 'function containsDuplicate(nums) {\n    // Write your code here\n    \n}',
        python: 'def containsDuplicate(nums):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Write your code here\n        \n    }\n};',
      }
    },
    {
      title: 'Valid Anagram',
      description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
      examples: [
        { input: 's = "anagram", t = "nagaram"', output: 'true' },
        { input: 's = "rat", t = "car"', output: 'false' }
      ],
      starterCode: {
        javascript: 'function isAnagram(s, t) {\n    // Write your code here\n    \n}',
        python: 'def isAnagram(s, t):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        // Write your code here\n        \n    }\n};',
      }
    },
    {
      title: 'Best Time to Buy and Sell Stock',
      description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
      examples: [
        { input: 'prices = [7,1,5,3,6,4]', output: '5' },
        { input: 'prices = [7,6,4,3,1]', output: '0' }
      ],
      starterCode: {
        javascript: 'function maxProfit(prices) {\n    // Write your code here\n    \n}',
        python: 'def maxProfit(prices):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your code here\n        \n    }\n};',
      }
    }
  ],
  medium: [
    {
      title: 'Longest Substring Without Repeating Characters',
      description: 'Given a string s, find the length of the longest substring without repeating characters.',
      examples: [
        { input: 's = "abcabcbb"', output: '3' },
        { input: 's = "bbbbb"', output: '1' }
      ],
      starterCode: {
        javascript: 'function lengthOfLongestSubstring(s) {\n    // Write your code here\n    \n}',
        python: 'def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        \n    }\n};',
        java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        \n    }\n}',
        csharp: 'public class Solution {\n    public int LengthOfLongestSubstring(string s) {\n        // Write your code here\n        \n    }\n}',
        go: 'func lengthOfLongestSubstring(s string) int {\n    // Write your code here\n    \n}',
        rust: 'impl Solution {\n    pub fn length_of_longest_substring(s: String) -> i32 {\n        // Write your code here\n        \n    }\n}',
        ruby: 'def length_of_longest_substring(s)\n    # Write your code here\n    \nend',
        php: 'class Solution {\n    /**\n     * @param String $s\n     * @return Integer\n     */\n    function lengthOfLongestSubstring($s) {\n        // Write your code here\n        \n    }\n}',
        swift: 'class Solution {\n    func lengthOfLongestSubstring(_ s: String) -> Int {\n        // Write your code here\n        \n    }\n}',
        typescript: 'function lengthOfLongestSubstring(s: string): number {\n    // Write your code here\n    \n}',
        kotlin: 'class Solution {\n    fun lengthOfLongestSubstring(s: String): Int {\n        // Write your code here\n        \n    }\n}',
        scala: 'object Solution {\n    def lengthOfLongestSubstring(s: String): Int = {\n        // Write your code here\n        \n    }\n}',
        r: 'lengthOfLongestSubstring <- function(s) {\n    # Write your code here\n    \n}',
        objectivec: '@implementation Solution\n- (NSInteger)lengthOfLongestSubstring:(NSString *)s {\n    // Write your code here\n    \n}\n@end',
        perl: 'sub lengthOfLongestSubstring {\n    my ($s) = @_;\n    # Write your code here\n    \n}',
        haskell: 'lengthOfLongestSubstring :: String -> Int\nlengthOfLongestSubstring s =\n    -- Write your code here\n    ',
        lua: 'function lengthOfLongestSubstring(s)\n    -- Write your code here\n    \nend',
        dart: 'class Solution {\n    int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        \n    }\n}'
      }
    },
    {
      title: 'Group Anagrams',
      description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
      examples: [
        { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
      ],
      starterCode: {
        javascript: 'function groupAnagrams(strs) {\n    // Write your code here\n    \n}',
        python: 'def groupAnagrams(strs):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        // Write your code here\n        \n    }\n};',
      }
    },
    {
      title: 'Maximum Subarray',
      description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nA subarray is a contiguous part of an array.',
      examples: [
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }
      ],
      starterCode: {
        javascript: 'function maxSubArray(nums) {\n    // Write your code here\n    \n}',
        python: 'def maxSubArray(nums):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your code here\n        \n    }\n};',
      }
    }
  ],
  hard: [
    {
      title: 'Median of Two Sorted Arrays',
      description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).',
      examples: [
        { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' },
        { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000' }
      ],
      starterCode: {
        javascript: 'function findMedianSortedArrays(nums1, nums2) {\n    // Write your code here\n    \n}',
        python: 'def findMedianSortedArrays(nums1, nums2):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your code here\n        \n    }\n};',
        java: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n        \n    }\n}',
        csharp: 'public class Solution {\n    public double FindMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n        \n    }\n}',
        go: 'func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {\n    // Write your code here\n    \n}',
        rust: 'impl Solution {\n    pub fn find_median_sorted_arrays(nums1: Vec<i32>, nums2: Vec<i32>) -> f64 {\n        // Write your code here\n        \n    }\n}',
        ruby: 'def find_median_sorted_arrays(nums1, nums2)\n    # Write your code here\n    \nend',
        php: 'class Solution {\n    /**\n     * @param Integer[] $nums1\n     * @param Integer[] $nums2\n     * @return Float\n     */\n    function findMedianSortedArrays($nums1, $nums2) {\n        // Write your code here\n        \n    }\n}',
        swift: 'class Solution {\n    func findMedianSortedArrays(_ nums1: [Int], _ nums2: [Int]) -> Double {\n        // Write your code here\n        \n    }\n}',
        typescript: 'function findMedianSortedArrays(nums1: number[], nums2: number[]): number {\n    // Write your code here\n    \n}',
        kotlin: 'class Solution {\n    fun findMedianSortedArrays(nums1: IntArray, nums2: IntArray): Double {\n        // Write your code here\n        \n    }\n}',
        scala: 'object Solution {\n    def findMedianSortedArrays(nums1: Array[Int], nums2: Array[Int]): Double = {\n        // Write your code here\n        \n    }\n}',
        r: 'findMedianSortedArrays <- function(nums1, nums2) {\n    # Write your code here\n    \n}',
        objectivec: '@implementation Solution\n- (double)findMedianSortedArrays:(NSArray<NSNumber *> *)nums1 nums2:(NSArray<NSNumber *> *)nums2 {\n    // Write your code here\n    \n}\n@end',
        perl: 'sub findMedianSortedArrays {\n    my ($nums1, $nums2) = @_;\n    # Write your code here\n    \n}',
        haskell: 'findMedianSortedArrays :: [Int] -> [Int] -> Double\nfindMedianSortedArrays nums1 nums2 =\n    -- Write your code here\n    ',
        lua: 'function findMedianSortedArrays(nums1, nums2)\n    -- Write your code here\n    \nend',
        dart: 'class Solution {\n    double findMedianSortedArrays(List<int> nums1, List<int> nums2) {\n        // Write your code here\n        \n    }\n}'
      }
    },
    {
      title: 'Trapping Rain Water',
      description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
      examples: [
        { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }
      ],
      starterCode: {
        javascript: 'function trap(height) {\n    // Write your code here\n    \n}',
        python: 'def trap(height):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your code here\n        \n    }\n};',
      }
    }
  ]
};

const CodingExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const difficulty = searchParams.get('difficulty') || 'easy';
  const initialLanguage = searchParams.get('lang') || 'javascript';

  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);

  // Randomly select a question that hasn't been seen yet
  const [question] = useState(() => {
    const questions = mockQuestions[difficulty] || mockQuestions.easy;

    // Get previously seen questions from localStorage
    let seenQuestions = JSON.parse(localStorage.getItem('seenCodingQuestions') || '[]');

    // Filter out seen questions for the current difficulty
    let availableQuestions = questions.filter(q => !seenQuestions.includes(q.title));

    // If all questions for this difficulty have been seen, reset the seen list for this difficulty
    if (availableQuestions.length === 0) {
      const currentDifficultyTitles = questions.map(q => q.title);
      seenQuestions = seenQuestions.filter(title => !currentDifficultyTitles.includes(title));
      availableQuestions = questions;
    }

    // Pick a random question from the available ones
    const selected = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    // Add it to seen list and save
    seenQuestions.push(selected.title);
    localStorage.setItem('seenCodingQuestions', JSON.stringify(seenQuestions));

    return selected;
  });

  const [code, setCode] = useState(question.starterCode[currentLanguage] || question.starterCode.javascript);
  const initialTime = difficulty === 'hard' ? 1800 : difficulty === 'medium' ? 1500 : 1200;
  const [timeLeft, setTimeLeft] = useState(initialTime); // Set based on difficulty
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFullscreen, setIsFullscreen] = useState(true);

  const camRef = useRef(null);
  const { faceWarning } = useFaceDetection([camRef], true);

  // Update boilerplate code when language changes
  useEffect(() => {
    setCode(question.starterCode[currentLanguage] || question.starterCode.javascript);
  }, [currentLanguage, question]);

  const isFullscreenRef = useRef(true);

  useEffect(() => {
    // Request fullscreen on mount
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log(err));
    }

    const timer = setInterval(() => {
      if (isFullscreenRef.current) {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      isFullscreenRef.current = isFull;
    };

    const handleResize = () => setIsMobile(window.innerWidth < 768);

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running test cases...');
    setTestResults(null);

    try {
      const response = await API.post('/coding/evaluate', {
        title: question.title,
        description: question.description,
        language: currentLanguage,
        code
      });

      if (response.data.passed) {
        setTestResults('pass');
        setOutput(response.data.feedback || 'All test cases passed successfully!');
      } else {
        setTestResults('fail');
        setOutput(response.data.feedback || 'Test cases failed.');
      }
    } catch (err) {
      setTestResults('fail');
      setOutput(err.response?.data?.message || err.message || 'Failed to evaluate code.');
    } finally {
      setIsRunning(false);
    }
  };

  if (isMobile) {
    return (
      <div className="coding-exam-mobile-restricted">
        <Terminal size={48} className="mobile-icon" />
        <h2>Desktop Mode Required</h2>
        <p>The Coding Exam requires a physical keyboard and a larger screen to write code effectively. Please open this on your PC/Laptop, or enable "Desktop site" in your mobile browser settings.</p>
        <button className="back-btn-mobile" onClick={() => navigate('/coding-practice')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      {faceWarning && (
        <div className="global-face-warn-overlay">
          <div className="global-face-warn-content">
            <ShieldCheck size={48} className="warn-icon" />
            <h2>Proctoring Warning</h2>
            <p>{faceWarning}</p>
          </div>
        </div>
      )}
      {!isFullscreen && (
        <div className="fullscreen-warning-overlay" style={{ zIndex: 10001 }}>
          <div className="fullscreen-warning-content">
            <h2>Fullscreen Required</h2>
            <p>The exam must be taken in fullscreen mode to prevent distractions. Timers and recording are paused.</p>
            <div className="fullscreen-actions">
              <button className="exit-fullscreen-btn" onClick={() => navigate('/coding-practice')}>
                Exit Practice
              </button>
              <button
                className="enter-fullscreen-btn"
                onClick={() => {
                  const elem = document.documentElement;
                  if (elem.requestFullscreen) elem.requestFullscreen();
                }}
              >
                Enter Fullscreen to Continue
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`coding-exam-container ${!isFullscreen ? 'blurred' : ''}`}>
        {/* Top Navbar */}
        <nav className="exam-navbar">
          <div className="nav-left">
            <button className="back-btn" onClick={() => navigate('/coding-practice')}>
              <ArrowLeft size={20} />
              <span>Leave</span>
            </button>
            <span className="exam-title">{question.title} <span className={`diff-badge ${difficulty}`}>{difficulty}</span></span>
          </div>
          <div className="nav-right">
            <div className={`timer-badge ${timeLeft < 300 ? 'danger' : ''}`}>
              <Clock size={18} />
              {formatTime(timeLeft)}
            </div>
            <button className="submit-exam-btn" onClick={async () => {
              const timeSpentSecs = initialTime - timeLeft;

              // Save to localStorage
              const history = JSON.parse(localStorage.getItem('codingPracticeHistory') || '[]');
              const record = {
                title: question.title,
                difficulty,
                language: currentLanguage,
                status: testResults || 'untested',
                timeSpentSecs,
                date: new Date().toISOString()
              };
              history.push(record);
              localStorage.setItem('codingPracticeHistory', JSON.stringify(history));

              // Save to Backend Database
              const user = JSON.parse(localStorage.getItem('user'));
              if (user && user._id) {
                try {
                  const res = await API.post('/coding/results', {
                    userId: user._id,
                    ...record
                  });
                  if (res.data?.pointsEarned > 0) {
                    toast.success(`🎉 You earned ${res.data.pointsEarned} XP!`);
                    window.dispatchEvent(new Event('walletUpdated'));
                  } else {
                    toast.info('Practice submitted!');
                  }
                } catch (err) {
                  console.error("Failed to save coding result to backend:", err);
                }
              }

              navigate('/coding-practice');
            }}>
              Submit Practice
            </button>

            <div className="nav-cam-wrapper">
              <Webcam ref={camRef} audio={false} mirrored className="nav-cam-feed" screenshotFormat="image/jpeg" />
            </div>
          </div>
        </nav>

        <div className="exam-main">
          {/* Left Panel: Question */}
          <div className="question-panel">
            <div className="panel-content">
              <h2>{question.title}</h2>
              <div className="description">
                {question.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <h3>Examples:</h3>
              <div className="examples-list">
                {question.examples.map((ex, i) => (
                  <div key={i} className="example-box">
                    <div className="ex-label">Example {i + 1}</div>
                    <div className="ex-line"><strong>Input:</strong> {ex.input}</div>
                    <div className="ex-line"><strong>Output:</strong> {ex.output}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Editor and Output */}
          <div className="editor-panel">
            <div className="editor-header">
              <select
                className="lang-selector-inline"
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="swift">Swift</option>
                <option value="typescript">TypeScript</option>
                <option value="kotlin">Kotlin</option>
                <option value="scala">Scala</option>
                <option value="r">R</option>
                <option value="objectivec">Objective-C</option>
                <option value="perl">Perl</option>
                <option value="haskell">Haskell</option>
                <option value="lua">Lua</option>
                <option value="dart">Dart</option>
              </select>
            </div>

            <div
              className="editor-wrapper"
              onCopy={(e) => { e.preventDefault(); toast.warning("Copying is disabled during the exam."); }}
              onPaste={(e) => { e.preventDefault(); toast.warning("Pasting is disabled during the exam."); }}
              onCut={(e) => { e.preventDefault(); toast.warning("Cutting is disabled during the exam."); }}
            >
              <Editor
                height="100%"
                language={currentLanguage}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val)}
                onMount={(editor, monaco) => {
                  editor.onKeyDown((e) => {
                    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                    const cmdKey = isMac ? e.metaKey : e.ctrlKey;
                    // e.browserEvent.code checks the physical key
                    if (cmdKey && (e.browserEvent.code === 'KeyC' || e.browserEvent.code === 'KeyV' || e.browserEvent.code === 'KeyX')) {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.warning("Copy/Paste is disabled during the exam.");
                    }
                  });
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
              />
            </div>

            <div className="console-panel">
              <div className="console-header">
                <div className="ch-left">
                  <Terminal size={16} />
                  <span>Console</span>
                </div>
                <button
                  className={`run-btn ${isRunning ? 'running' : ''}`}
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  <Play size={16} fill="currentColor" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
              <div className={`console-output ${testResults || ''}`}>
                {testResults === 'pass' && <CheckCircle2 size={16} className="pass-icon" />}
                {testResults === 'fail' && <XCircle size={16} className="fail-icon" />}
                <pre>{output || 'Output will appear here after running code...'}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CodingExam;
