const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/interview_room',
};

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

if (!process.env.DATABASE_URL) {
  Object.assign(poolConfig, {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'interview_room',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });
}

const pool = new Pool(poolConfig);

let useMock = false;

// In-Memory fallback database arrays
const mockDb = {
  users: [],
  interviews: [],
  evaluations: [],
  notes: [],
  submissions: [],
  questions: [],
  question_favorites: [],
  test_cases: [],
  chat_messages: [],
  code_execution_results: []
};

// PRE-SEED DATA
// 1. Pre-seed Questions (LeetCode Style Descriptions)
mockDb.questions = [
  {
    id: 1,
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

### Example 1:
**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].

### Example 2:
**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]

### Constraints:
* \`2 <= nums.length <= 10^4\`
* \`-10^9 <= nums[i] <= 10^9\`
* \`-10^9 <= target <= 10^9\`
* **Only one valid answer exists.**`,
    difficulty: 'Easy',
    category: 'Arrays',
    tags: ['array', 'hash-table', 'easy'],
    programming_language: 'javascript',
    input_format: 'First line contains nums array, second line target integer.',
    output_format: 'Array of two indices [index1, index2].',
    constraints: `2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9`,
    examples: JSON.stringify([
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
    ]),
    starter_code: JSON.stringify({
      javascript: 'function twoSum(nums, target) {\n  // Write code\n}',
      python: 'def two_sum(nums, target):\n    # Write code\n    pass',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write code\n        return new int[2];\n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write code\n        return {};\n    }\n};'
    }),
    hints: ['Try using a hash map to look up targets in O(1) time.', 'Compute target - nums[i] for each index.'],
    expected_time_complexity: 'O(n)',
    expected_space_complexity: 'O(n)',
    is_custom: false,
    created_by: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    title: 'Reverse Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

### Example 1:
**Input:** head = [1,2,3,4,5]
**Output:** [5,4,3,2,1]

### Example 2:
**Input:** head = [1,2]
**Output:** [2,1]

### Constraints:
* The number of nodes in the list is the range \`[0, 5000]\`.
* \`-5000 <= Node.val <= 5000\``,
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'medium'],
    programming_language: 'javascript',
    input_format: 'Pointer to head node.',
    output_format: 'Pointer to reversed head node.',
    constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
    examples: JSON.stringify([
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: '' }
    ]),
    starter_code: JSON.stringify({
      javascript: 'function reverseList(head) {\n  // Write code\n}',
      python: 'def reverseList(head):\n    # Write code\n    pass',
      java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write code\n        return null;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write code\n        return nullptr;\n    }\n};'
    }),
    hints: ['Iteratively keep pointers to prev, curr, and next.', 'Can you solve this recursively?'],
    expected_time_complexity: 'O(n)',
    expected_space_complexity: 'O(1)',
    is_custom: false,
    created_by: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    title: 'Fizz Buzz',
    description: `Given an integer \`n\`, return a string array \`answer\` (1-indexed) where:
* \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by 3 and 5.
* \`answer[i] == "Fizz"\` if \`i\` is divisible by 3.
* \`answer[i] == "Buzz"\` if \`i\` is divisible by 5.
* \`answer[i] == i\` (as a string) if none of the above conditions are true.

### Example 1:
**Input:** n = 3
**Output:** ["1","2","Fizz"]

### Example 2:
**Input:** n = 5
**Output:** ["1","2","Fizz","4","Buzz"]

### Constraints:
* \`1 <= n <= 10^4\``,
    difficulty: 'Easy',
    category: 'Arrays',
    tags: ['math', 'string', 'easy'],
    programming_language: 'javascript',
    input_format: 'An integer n.',
    output_format: 'List of strings answer.',
    constraints: '1 <= n <= 10^4',
    examples: JSON.stringify([
      { input: 'n = 3', output: '["1","2","Fizz"]', explanation: '' },
      { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]', explanation: '' }
    ]),
    starter_code: JSON.stringify({
      javascript: 'function fizzBuzz(n) {\n  // Write code\n}',
      python: 'def fizzBuzz(n):\n    # Write code\n    pass',
      java: 'class Solution {\n    public List<String> fizzBuzz(int n) {\n        // Write code\n        return null;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        // Write code\n        return {};\n    }\n};'
    }),
    hints: ['Loop from 1 to n.', 'Check modulus operators for 15, 3, and 5.'],
    expected_time_complexity: 'O(n)',
    expected_space_complexity: 'O(1)',
    is_custom: false,
    created_by: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    title: 'Palindrome Number',
    description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a **palindrome** when it reads the same backward as forward. For example, \`121\` is a palindrome while \`123\` is not.

### Example 1:
**Input:** x = 121
**Output:** true
**Explanation:** 121 reads as 121 from left to right and from right to left.

### Example 2:
**Input:** x = -121
**Output:** false
**Explanation:** From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

### Constraints:
* \`-2^31 <= x <= 2^31 - 1\``,
    difficulty: 'Easy',
    category: 'Math',
    tags: ['math', 'easy'],
    programming_language: 'javascript',
    input_format: 'An integer x.',
    output_format: 'boolean',
    constraints: '-2^31 <= x <= 2^31 - 1',
    examples: JSON.stringify([
      { input: 'x = 121', output: 'true', explanation: '' },
      { input: 'x = -121', output: 'false', explanation: '' }
    ]),
    starter_code: JSON.stringify({
      javascript: 'function isPalindrome(x) {\n  // Write code\n}',
      python: 'def isPalindrome(x):\n    # Write code\n    pass',
      java: 'class Solution {\n    public boolean isPalindrome(int x) {\n        // Write code\n        return false;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Write code\n        return false;\n    }\n};'
    }),
    hints: ['Try reversing the digits mathematically.', 'Negative numbers can never be palindromes.'],
    expected_time_complexity: 'O(log(x))',
    expected_space_complexity: 'O(1)',
    is_custom: false,
    created_by: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 5,
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Example 1:
**Input:** s = "()"
**Output:** true

### Example 2:
**Input:** s = "()[]{}"
**Output:** true

### Example 3:
**Input:** s = "(]"
**Output:** false

### Constraints:
* \`1 <= s.length <= 10^4\`
* \`s\` consists of parentheses characters only.`,
    difficulty: 'Easy',
    category: 'Strings',
    tags: ['stack', 'string', 'easy'],
    programming_language: 'javascript',
    input_format: 'A string s.',
    output_format: 'boolean',
    constraints: '1 <= s.length <= 10^4',
    examples: JSON.stringify([
      { input: 's = "()"', output: 'true', explanation: '' },
      { input: 's = "(]"', output: 'false', explanation: '' }
    ]),
    starter_code: JSON.stringify({
      javascript: 'function isValid(s) {\n  // Write code\n}',
      python: 'def isValid(s):\n    # Write code\n    pass',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        // Write code\n        return false;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        // Write code\n        return false;\n    }\n};'
    }),
    hints: ['Use a stack data structure.', 'Push opening brackets, pop on closing bracket and verify match.'],
    expected_time_complexity: 'O(n)',
    expected_space_complexity: 'O(n)',
    is_custom: false,
    created_by: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 6,
    title: 'Merge Two Sorted Lists',
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

### Example 1:
**Input:** list1 = [1,2,4], list2 = [1,3,4]
**Output:** [1,1,2,3,4,4]

### Example 2:
**Input:** list1 = [], list2 = []
**Output:** []

### Constraints:
* The number of nodes in both lists is in the range \`[0, 50]\`.
* \`-100 <= Node.val <= 100\`
* Both lists are sorted in non-decreasing order.`,
    difficulty: 'Easy',
    category: 'Linked Lists',
    tags: ['linked-list', 'recursion', 'easy'],
    programming_language: 'javascript',
    input_format: 'Heads of list1 and list2.',
    output_format: 'Head of merged linked list.',
    constraints: '0 <= list.length <= 50',
    examples: JSON.stringify([
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: '' }
    ]),
    starter_code: JSON.stringify({
      javascript: 'function mergeTwoLists(list1, list2) {\n  // Write code\n}',
      python: 'def mergeTwoLists(list1, list2):\n    # Write code\n    pass',
      java: 'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Write code\n        return null;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Write code\n        return nullptr;\n    }\n};'
    }),
    hints: ['Create a dummy node as starting pointer.', 'Compare elements iteratively and append lower value.'],
    expected_time_complexity: 'O(n + m)',
    expected_space_complexity: 'O(1)',
    is_custom: false,
    created_by: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 7,
    title: 'Maximum Subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.

### Example 1:
**Input:** nums = [-2,1,-3,4,-1,2,1,-5,4]
**Output:** 6
**Explanation:** The subarray [4,-1,2,1] has the largest sum = 6.

### Example 2:
**Input:** nums = [1]
**Output:** 1

### Constraints:
* \`1 <= nums.length <= 10^5\`
* \`-10^4 <= nums[i] <= 10^4\``,
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['array', 'dynamic-programming', 'medium'],
    programming_language: 'javascript',
    input_format: 'An array of numbers.',
    output_format: 'Max sum integer.',
    constraints: '1 <= nums.length <= 10^5',
    examples: JSON.stringify([
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] sum is 6.' }
    ]),
    starter_code: JSON.stringify({
      javascript: 'function maxSubArray(nums) {\n  // Write code\n}',
      python: 'def maxSubArray(nums):\n    # Write code\n    pass',
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write code\n        return 0;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write code\n        return 0;\n    }\n};'
    }),
    hints: ['Use Kadanes Algorithm.', 'Keep track of current max and global max.'],
    expected_time_complexity: 'O(n)',
    expected_space_complexity: 'O(1)',
    is_custom: false,
    created_by: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 8,
    title: 'Binary Search',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

### Example 1:
**Input:** nums = [-1,0,3,5,9,12], target = 9
**Output:** 4
**Explanation:** 9 exists in nums and its index is 4.

### Example 2:
**Input:** nums = [-1,0,3,5,9,12], target = 2
**Output:** -1
**Explanation:** 2 does not exist in nums so return -1.

### Constraints:
* \`1 <= nums.length <= 10^4\`
* \`-10^4 < nums[i], target < 10^4\`
* All the integers in \`nums\` are **unique**.
* \`nums\` is sorted in ascending order.`,
    difficulty: 'Easy',
    category: 'Arrays',
    tags: ['array', 'binary-search', 'easy'],
    programming_language: 'javascript',
    input_format: 'Sorted array nums and target integer.',
    output_format: 'Index integer or -1.',
    constraints: '1 <= nums.length <= 10^4',
    examples: JSON.stringify([
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '' }
    ]),
    starter_code: JSON.stringify({
      javascript: 'function search(nums, target) {\n  // Write code\n}',
      python: 'def search(nums, target):\n    # Write code\n    pass',
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        // Write code\n        return -1;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write code\n        return -1;\n    }\n};'
    }),
    hints: ['Pointers at low = 0 and high = length - 1.', 'Calculate mid and narrow down range.'],
    expected_time_complexity: 'O(log n)',
    expected_space_complexity: 'O(1)',
    is_custom: false,
    created_by: null,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// 2. Pre-seed Test Cases for Sandbox execution
mockDb.test_cases = [
  // For Two Sum (Question 1)
  { id: 1, question_id: 1, interview_id: null, input: '[2,7,11,15]\n9', expected_output: '[0,1]', is_hidden: false },
  { id: 2, question_id: 1, interview_id: null, input: '[3,2,4]\n6', expected_output: '[1,2]', is_hidden: false },
  { id: 3, question_id: 1, interview_id: null, input: '[3,3]\n6', expected_output: '[0,1]', is_hidden: true },
  
  // For Reverse Linked List (Question 2)
  { id: 4, question_id: 2, interview_id: null, input: '[1,2,3,4,5]', expected_output: '[5,4,3,2,1]', is_hidden: false },
  
  // For Fizz Buzz (Question 3)
  { id: 5, question_id: 3, interview_id: null, input: '3', expected_output: '["1","2","Fizz"]', is_hidden: false },
  { id: 6, question_id: 3, interview_id: null, input: '5', expected_output: '["1","2","Fizz","4","Buzz"]', is_hidden: false },
  
  // For Palindrome Number (Question 4)
  { id: 7, question_id: 4, interview_id: null, input: '121', expected_output: 'true', is_hidden: false },
  { id: 8, question_id: 4, interview_id: null, input: '-121', expected_output: 'false', is_hidden: false },
  
  // For Valid Parentheses (Question 5)
  { id: 9, question_id: 5, interview_id: null, input: '"()"', expected_output: 'true', is_hidden: false },
  { id: 10, question_id: 5, interview_id: null, input: '"()[]{}"', expected_output: 'true', is_hidden: false },
  { id: 11, question_id: 5, interview_id: null, input: '"(]"', expected_output: 'false', is_hidden: false },

  // For Merge Two Sorted Lists (Question 6)
  { id: 12, question_id: 6, interview_id: null, input: '[1,2,4]\n[1,3,4]', expected_output: '[1,1,2,3,4,4]', is_hidden: false },

  // For Maximum Subarray (Question 7)
  { id: 13, question_id: 7, interview_id: null, input: '[-2,1,-3,4,-1,2,1,-5,4]', expected_output: '6', is_hidden: false },

  // For Binary Search (Question 8)
  { id: 14, question_id: 8, interview_id: null, input: '[-1,0,3,5,9,12]\n9', expected_output: '4', is_hidden: false },
  { id: 15, question_id: 8, interview_id: null, input: '[-1,0,3,5,9,12]\n2', expected_output: '-1', is_hidden: false }
];

// Initial database connection check
pool.connect((err, client, release) => {
  if (err) {
    console.warn('⚠️ WARNING: PostgreSQL offline. Switching to interactive In-Memory Database Fallback...');
    console.log('👉 Feel free to test the app! Registrations, dashboards, rooms, and submissions will work perfectly in-memory.');
    useMock = true;
  } else {
    console.log('✅ PostgreSQL connected successfully. Using database schemas.');
    release();
  }
});

/**
 * Advanced query dispatcher that emulates standard PostgreSQL SQL queries
 * in-memory when the database engine is offline.
 */
const mockQuery = (text, params = []) => {
  const queryClean = text.replace(/\s+/g, ' ').trim();

  // --- CORE AUTH ---
  if (queryClean.startsWith('INSERT INTO users')) {
    const [name, email, passwordHash, role] = params;
    const newUser = {
      id: mockDb.users.length + 1,
      name,
      email,
      password_hash: passwordHash,
      role,
      created_at: new Date()
    };
    mockDb.users.push(newUser);
    return { rows: [newUser] };
  }

  if (queryClean.startsWith('SELECT * FROM users WHERE email =')) {
    const email = params[0];
    const user = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { rows: user ? [user] : [] };
  }

  if (queryClean.startsWith('SELECT id, name, email, role, created_at FROM users WHERE id =')) {
    const id = parseInt(params[0]);
    const user = mockDb.users.find(u => u.id === id);
    return { rows: user ? [user] : [] };
  }

  // --- INTERVIEWS ---
  if (queryClean.startsWith('INSERT INTO interviews')) {
    const [
      room_id, title, interviewer_id, candidate_id,
      question_title, question_description, difficulty,
      programming_language, scheduled_at, duration_minutes
    ] = params;

    const newInterview = {
      id: mockDb.interviews.length + 1,
      room_id,
      title,
      interviewer_id: parseInt(interviewer_id),
      candidate_id: parseInt(candidate_id),
      question_title,
      question_description,
      difficulty,
      programming_language,
      scheduled_at: new Date(scheduled_at),
      duration_minutes: parseInt(duration_minutes),
      status: 'scheduled',
      invite_token: Math.random().toString(36).substring(2, 10).toUpperCase(),
      invite_expires_at: new Date(new Date(scheduled_at).getTime() + 7 * 24 * 60 * 60 * 1000),
      candidate_joined_at: null,
      interviewer_joined_at: null,
      current_round: 1,
      round1_score: null,
      round2_score: null,
      round3_score: null,
      round4_score: null,
      round5_score: null,
      round6_score: null,
      round7_score: null,
      round4_code: '',
      round5_code: '',
      round6_code: '',
      round7_code: '',
      round_started_at: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockDb.interviews.push(newInterview);
    return { rows: [newInterview] };
  }

  const joinInterviewData = (interview) => {
    if (!interview) return null;
    const interviewer = mockDb.users.find(u => u.id === interview.interviewer_id);
    const candidate = mockDb.users.find(u => u.id === interview.candidate_id);
    return {
      ...interview,
      interviewer_name: interviewer ? interviewer.name : 'Unknown Recruiter',
      interviewer_email: interviewer ? interviewer.email : '',
      candidate_name: candidate ? candidate.name : 'Unknown Candidate',
      candidate_email: candidate ? candidate.email : ''
    };
  };

  if (queryClean.includes('WHERE i.room_id =')) {
    const roomId = params[0];
    const interview = mockDb.interviews.find(i => i.room_id === roomId);
    return { rows: interview ? [joinInterviewData(interview)] : [] };
  }

  if (queryClean.includes('WHERE i.id =')) {
    const id = parseInt(params[0]);
    const interview = mockDb.interviews.find(i => i.id === id);
    return { rows: interview ? [joinInterviewData(interview)] : [] };
  }

  if (queryClean.startsWith('UPDATE interviews')) {
    const id = parseInt(params[params.length - 1]);
    const idx = mockDb.interviews.findIndex(i => i.id === id);
    if (idx !== -1) {
      const setPart = queryClean.split('SET')[1].split('WHERE')[0];
      const fieldAssigns = setPart.split(',').map(s => s.trim());
      
      fieldAssigns.forEach((assign, pIdx) => {
        const fieldName = assign.split('=')[0].trim();
        mockDb.interviews[idx][fieldName] = params[pIdx];
      });
      mockDb.interviews[idx].updated_at = new Date();
      return { rows: [mockDb.interviews[idx]] };
    }
    return { rows: [] };
  }

  // --- STATS & HISTORY LISTS ---
  if (queryClean.includes('candidate_id =') || queryClean.includes('interviewer_id =')) {
    // If it's a count query or lists
    const userId = parseInt(params[0]);
    const isCandidate = queryClean.includes('WHERE i.candidate_id =') || queryClean.includes('WHERE candidate_id =');
    const isHistory = queryClean.includes('status = \'completed\'') || queryClean.includes('status = $');

    let list = mockDb.interviews.filter(i => {
      const matchUser = isCandidate ? i.candidate_id === userId : i.interviewer_id === userId;
      if (!matchUser) return false;
      
      if (isHistory) {
        return i.status === 'completed';
      } else {
        return i.status !== 'completed';
      }
    });

    if (queryClean.startsWith('SELECT COUNT(*)')) {
      let count = list.length;
      if (queryClean.includes('evaluations')) {
        count = mockDb.interviews.filter(i => 
          i.interviewer_id === userId && 
          mockDb.evaluations.some(e => e.interview_id === i.id && e.result === 'selected')
        ).length;
      }
      return { rows: [{ count }] };
    }

    list.sort((a, b) => isHistory ? b.scheduled_at - a.scheduled_at : a.scheduled_at - b.scheduled_at);

    const rows = list.map(i => {
      const joined = joinInterviewData(i);
      const evalData = mockDb.evaluations.find(e => e.interview_id === i.id);
      return {
        ...joined,
        result: evalData ? evalData.result : null,
        overall_rating: evalData ? evalData.overall_rating : null
      };
    });
    return { rows };
  }

  // --- QUESTION BANK UPGRADES ---
  if (queryClean.startsWith('SELECT q.*') || queryClean.includes('FROM questions')) {
    // Fetching questions bank
    // SELECT q.*, (f.id IS NOT NULL) AS is_favorite FROM questions...
    const userId = params[0] ? parseInt(params[0]) : null;
    let resultQuestions = mockDb.questions.map(q => {
      const isFav = userId ? mockDb.question_favorites.some(f => f.user_id === userId && f.question_id === q.id) : false;
      return {
        ...q,
        is_favorite: isFav
      };
    });

    // Check filters (e.g. search keywords, category, difficulty)
    // Basic search filtering
    if (queryClean.includes('ILIKE')) {
      // Find matching parameter index for ILIKE keyword
      const searchParamIdx = queryClean.includes('q.category =') ? 2 : 1;
      const searchStr = params[searchParamIdx] ? params[searchParamIdx].replace(/%/g, '') : '';
      if (searchStr) {
        resultQuestions = resultQuestions.filter(q => 
          q.title.toLowerCase().includes(searchStr.toLowerCase()) ||
          q.description.toLowerCase().includes(searchStr.toLowerCase())
        );
      }
    }

    // Category filter
    if (queryClean.includes('category =')) {
      const catVal = params[1]; // typically second parameter if user_id is first
      if (catVal && catVal !== 'all') {
        resultQuestions = resultQuestions.filter(q => q.category.toLowerCase() === catVal.toLowerCase());
      }
    }

    // Difficulty filter
    if (queryClean.includes('difficulty =')) {
      const diffVal = params[params.length - 1];
      if (diffVal && diffVal !== 'all') {
        resultQuestions = resultQuestions.filter(q => q.difficulty.toLowerCase() === diffVal.toLowerCase());
      }
    }

    return { rows: resultQuestions };
  }

  if (queryClean.startsWith('INSERT INTO questions')) {
    const [
      title, description, difficulty, category, tags,
      programming_language, input_format, output_format, constraints,
      examples, starter_code, hints, expected_time_complexity,
      expected_space_complexity, is_custom, created_by
    ] = params;

    const newQuestion = {
      id: mockDb.questions.length + 1,
      title,
      description,
      difficulty,
      category,
      tags: tags || [],
      programming_language: programming_language || 'javascript',
      input_format,
      output_format,
      constraints,
      examples: typeof examples === 'string' ? examples : JSON.stringify(examples || []),
      starter_code: typeof starter_code === 'string' ? starter_code : JSON.stringify(starter_code || {}),
      hints: hints || [],
      expected_time_complexity,
      expected_space_complexity,
      is_custom: is_custom === true,
      created_by: created_by ? parseInt(created_by) : null,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockDb.questions.push(newQuestion);
    return { rows: [newQuestion] };
  }

  if (queryClean.startsWith('UPDATE questions')) {
    const id = parseInt(params[params.length - 1]);
    const idx = mockDb.questions.findIndex(q => q.id === id);
    if (idx !== -1) {
      // Simple parse updates
      mockDb.questions[idx].title = params[0];
      mockDb.questions[idx].description = params[1];
      mockDb.questions[idx].difficulty = params[2];
      mockDb.questions[idx].category = params[3];
      mockDb.questions[idx].input_format = params[4];
      mockDb.questions[idx].output_format = params[5];
      mockDb.questions[idx].constraints = params[6];
      mockDb.questions[idx].examples = params[7];
      mockDb.questions[idx].starter_code = params[8];
      mockDb.questions[idx].updated_at = new Date();
      return { rows: [mockDb.questions[idx]] };
    }
    return { rows: [] };
  }

  if (queryClean.startsWith('DELETE FROM interviews')) {
    const id = parseInt(params[0]);
    const idx = mockDb.interviews.findIndex(i => i.id === id);
    if (idx !== -1) {
      const deleted = mockDb.interviews.splice(idx, 1)[0];
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  if (queryClean.startsWith('DELETE FROM questions')) {
    const id = parseInt(params[0]);
    const idx = mockDb.questions.findIndex(q => q.id === id);
    if (idx !== -1) {
      const deleted = mockDb.questions.splice(idx, 1)[0];
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  // Favorites toggle
  if (queryClean.startsWith('INSERT INTO question_favorites')) {
    const [userId, questionId] = params;
    const newFav = {
      id: mockDb.question_favorites.length + 1,
      user_id: parseInt(userId),
      question_id: parseInt(questionId),
      created_at: new Date()
    };
    // Ensure uniqueness
    const exists = mockDb.question_favorites.some(f => f.user_id === newFav.user_id && f.question_id === newFav.question_id);
    if (!exists) {
      mockDb.question_favorites.push(newFav);
    }
    return { rows: [newFav] };
  }

  if (queryClean.startsWith('DELETE FROM question_favorites')) {
    const [userId, questionId] = params;
    const idx = mockDb.question_favorites.findIndex(f => f.user_id === parseInt(userId) && f.question_id === parseInt(questionId));
    if (idx !== -1) {
      const deleted = mockDb.question_favorites.splice(idx, 1)[0];
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  // --- TEST CASES ---
  if (queryClean.startsWith('SELECT * FROM test_cases')) {
    const filterId = parseInt(params[0]); // question_id or interview_id
    const isQuestionField = queryClean.includes('question_id =');
    const cases = mockDb.test_cases.filter(tc => {
      return isQuestionField ? tc.question_id === filterId : tc.interview_id === filterId;
    });
    return { rows: cases };
  }

  if (queryClean.startsWith('INSERT INTO test_cases')) {
    const [question_id, interview_id, input, expected_output, is_hidden] = params;
    const newCase = {
      id: mockDb.test_cases.length + 1,
      question_id: question_id ? parseInt(question_id) : null,
      interview_id: interview_id ? parseInt(interview_id) : null,
      input,
      expected_output,
      is_hidden: is_hidden === true || is_hidden === 'true',
      created_at: new Date()
    };
    mockDb.test_cases.push(newCase);
    return { rows: [newCase] };
  }

  if (queryClean.startsWith('DELETE FROM test_cases')) {
    const qId = parseInt(params[0]);
    mockDb.test_cases = mockDb.test_cases.filter(tc => tc.question_id !== qId);
    return { rows: [] };
  }

  // --- CHAT MESSAGES ---
  if (queryClean.startsWith('SELECT cm.*') || queryClean.includes('FROM chat_messages')) {
    const interviewId = parseInt(params[0]);
    const msgs = mockDb.chat_messages.filter(m => m.interview_id === interviewId);
    const rows = msgs.map(m => {
      const sender = mockDb.users.find(u => u.id === m.sender_id);
      return {
        ...m,
        sender_name: sender ? sender.name : 'Unknown User',
        sender_role: sender ? sender.role : 'candidate'
      };
    });
    return { rows };
  }

  if (queryClean.startsWith('INSERT INTO chat_messages')) {
    const [interview_id, sender_id, message] = params;
    const newMsg = {
      id: mockDb.chat_messages.length + 1,
      interview_id: parseInt(interview_id),
      sender_id: parseInt(sender_id),
      message,
      created_at: new Date()
    };
    mockDb.chat_messages.push(newMsg);
    return { rows: [newMsg] };
  }

  // --- CODE TRIAL EVALUATION LOGS ---
  if (queryClean.startsWith('INSERT INTO code_execution_results')) {
    const [interview_id, passed_count, total_count, runtime_ms, memory_mb, results] = params;
    const newResult = {
      id: mockDb.code_execution_results.length + 1,
      interview_id: parseInt(interview_id),
      passed_count: parseInt(passed_count),
      total_count: parseInt(total_count),
      runtime_ms: parseInt(runtime_ms),
      memory_mb: parseFloat(memory_mb),
      results: typeof results === 'string' ? JSON.parse(results) : results,
      created_at: new Date()
    };
    mockDb.code_execution_results.push(newResult);
    return { rows: [newResult] };
  }

  if (queryClean.includes('FROM code_execution_results')) {
    const interviewId = parseInt(params[0]);
    const resList = mockDb.code_execution_results.filter(r => r.interview_id === interviewId);
    resList.sort((a, b) => b.created_at - a.created_at);
    return { rows: resList.length > 0 ? [resList[0]] : [] };
  }

  // --- ANALYTICS UPGRADES ---
  if (queryClean.includes('GROUP BY programming_language')) {
    const interviewerId = parseInt(params[0]);
    const interviews = mockDb.interviews.filter(i => i.interviewer_id === interviewerId);
    const distribution = {};
    interviews.forEach(i => {
      const lang = i.programming_language || 'javascript';
      distribution[lang] = (distribution[lang] || 0) + 1;
    });
    const rows = Object.entries(distribution).map(([lang, count]) => ({
      programming_language: lang,
      count
    }));
    return { rows };
  }

  if (queryClean.includes('GROUP BY difficulty')) {
    const interviewerId = parseInt(params[0]);
    const interviews = mockDb.interviews.filter(i => i.interviewer_id === interviewerId);
    const distribution = {};
    interviews.forEach(i => {
      const diff = i.difficulty || 'Medium';
      distribution[diff] = (distribution[diff] || 0) + 1;
    });
    const rows = Object.entries(distribution).map(([diff, count]) => ({
      difficulty: diff,
      count
    }));
    return { rows };
  }

  if (queryClean.includes('TO_CHAR(scheduled_at, \'YYYY-MM\')')) {
    const interviewerId = parseInt(params[0]);
    const completed = mockDb.interviews.filter(i => i.interviewer_id === interviewerId && i.status === 'completed');
    const distribution = {};
    completed.forEach(i => {
      const month = i.scheduled_at.toISOString().slice(0, 7); // YYYY-MM
      distribution[month] = (distribution[month] || 0) + 1;
    });
    const rows = Object.entries(distribution).map(([month, count]) => ({
      month,
      count
    })).sort((a, b) => a.month.localeCompare(b.month));
    return { rows };
  }

  if (queryClean.includes('AVG(overall_rating)')) {
    const idVal = parseInt(params[0]);
    const isCandidateSearch = queryClean.includes('candidate_id =');
    
    // Join evaluations of interviews associated with user
    const evals = mockDb.evaluations.filter(e => {
      const interview = mockDb.interviews.find(i => i.id === e.interview_id);
      if (!interview) return false;
      return isCandidateSearch ? interview.candidate_id === idVal : interview.interviewer_id === idVal;
    });

    if (queryClean.includes('communication_rating')) {
      // Candidate average details query
      if (evals.length === 0) {
        return { rows: [{ communication: 0, problem_solving: 0, coding: 0, technical: 0, overall: 0 }] };
      }
      const sum = evals.reduce((acc, curr) => {
        acc.comm += curr.communication_rating;
        acc.prob += curr.problem_solving_rating;
        acc.code += curr.coding_rating;
        acc.tech += curr.technical_rating;
        acc.over += curr.overall_rating;
        return acc;
      }, { comm: 0, prob: 0, code: 0, tech: 0, over: 0 });

      const n = evals.length;
      return {
        rows: [{
          communication: (sum.comm / n).toFixed(2),
          problem_solving: (sum.prob / n).toFixed(2),
          coding: (sum.code / n).toFixed(2),
          technical: (sum.tech / n).toFixed(2),
          overall: (sum.over / n).toFixed(2)
        }]
      };
    } else {
      // Recruiter average score query
      if (evals.length === 0) return { rows: [{ avg: 0 }] };
      const sum = evals.reduce((acc, curr) => acc + curr.overall_rating, 0);
      return { rows: [{ avg: (sum / evals.length).toFixed(2) }] };
    }
  }

  if (queryClean.includes('overall_rating') && queryClean.includes('candidate_id =') && queryClean.includes('ORDER BY i.scheduled_at')) {
    // Candidate scores history list
    const candidateId = parseInt(params[0]);
    const evals = mockDb.evaluations.filter(e => {
      const interview = mockDb.interviews.find(i => i.id === e.interview_id);
      return interview && interview.candidate_id === candidateId;
    });
    
    const rows = evals.map(e => {
      const interview = mockDb.interviews.find(i => i.id === e.interview_id);
      return {
        title: interview.title,
        overall_rating: e.overall_rating,
        scheduled_at: interview.scheduled_at
      };
    }).sort((a, b) => a.scheduled_at - b.scheduled_at);

    return { rows };
  }

  // --- CORE RESILIENT FALLBACKS ---
  if (queryClean.startsWith('INSERT INTO evaluations')) {
    const [
      interview_id, communication_rating, problem_solving_rating,
      coding_rating, technical_rating, overall_rating, feedback, result
    ] = params;

    const existingIdx = mockDb.evaluations.findIndex(e => e.interview_id === parseInt(interview_id));
    const newEval = {
      id: existingIdx !== -1 ? mockDb.evaluations[existingIdx].id : mockDb.evaluations.length + 1,
      interview_id: parseInt(interview_id),
      communication_rating: parseInt(communication_rating),
      problem_solving_rating: parseInt(problem_solving_rating),
      coding_rating: parseInt(coding_rating),
      technical_rating: parseInt(technical_rating),
      overall_rating: parseInt(overall_rating),
      feedback,
      result,
      created_at: new Date()
    };

    if (existingIdx !== -1) {
      mockDb.evaluations[existingIdx] = newEval;
    } else {
      mockDb.evaluations.push(newEval);
    }
    return { rows: [newEval] };
  }

  if (queryClean.startsWith('SELECT * FROM evaluations WHERE interview_id =')) {
    const interviewId = parseInt(params[0]);
    const evaluation = mockDb.evaluations.find(e => e.interview_id === interviewId);
    return { rows: evaluation ? [evaluation] : [] };
  }

  if (queryClean.startsWith('INSERT INTO interviewer_notes')) {
    const [interview_id, interviewer_id, notes] = params;
    const existingIdx = mockDb.notes.findIndex(n => n.interview_id === parseInt(interview_id));
    const newNote = {
      id: existingIdx !== -1 ? mockDb.notes[existingIdx].id : mockDb.notes.length + 1,
      interview_id: parseInt(interview_id),
      interviewer_id: parseInt(interviewer_id),
      notes,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (existingIdx !== -1) {
      mockDb.notes[existingIdx] = newNote;
    } else {
      mockDb.notes.push(newNote);
    }
    return { rows: [newNote] };
  }

  if (queryClean.startsWith('SELECT * FROM interviewer_notes WHERE interview_id =')) {
    const interviewId = parseInt(params[0]);
    const note = mockDb.notes.find(n => n.interview_id === interviewId);
    return { rows: note ? [note] : [] };
  }

  if (queryClean.startsWith('INSERT INTO code_submissions')) {
    const [interview_id, candidate_id, language, code] = params;
    const newSubmission = {
      id: mockDb.submissions.length + 1,
      interview_id: parseInt(interview_id),
      candidate_id: parseInt(candidate_id),
      language,
      code,
      submitted_at: new Date()
    };
    mockDb.submissions.push(newSubmission);
    return { rows: [newSubmission] };
  }

  if (queryClean.includes('FROM code_submissions')) {
    const interviewId = parseInt(params[0]);
    const submission = mockDb.submissions.find(s => s.interview_id === interviewId);
    if (submission) {
      const candidate = mockDb.users.find(u => u.id === submission.candidate_id);
      return {
        rows: [{
          ...submission,
          candidate_name: candidate ? candidate.name : 'Unknown Candidate'
        }]
      };
    }
    return { rows: [] };
  }

  if (queryClean.startsWith('DELETE FROM interviews')) {
    const id = parseInt(params[0]);
    const idx = mockDb.interviews.findIndex(i => i.id === id);
    if (idx !== -1) {
      const deleted = mockDb.interviews.splice(idx, 1)[0];
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  console.warn('⚠️ MOCK DB: Unhandled Query Statement:', queryClean);
  return { rows: [] };
};

module.exports = {
  query: (text, params) => {
    if (useMock) {
      return Promise.resolve(mockQuery(text, params));
    }
    return pool.query(text, params);
  },
  pool,
  mockDb,
};
