const vm = require('vm');

/**
 * Code Execution Provider Abstraction
 */
class CodeExecutionProvider {
  /**
   * Execute a candidate's code against a set of test cases
   * @param {string} language - programming language
   * @param {string} code - source code
   * @param {Array} testCases - list of test cases { input, expected_output, is_hidden }
   * @returns {Promise<Object>} execution results
   */
  async execute(language, code, testCases = []) {
    throw new Error('execute method must be implemented by subclass');
  }
}

/**
 * Mock Execution Provider with actual sandboxed JS running and simulated Python/Java/C++ outputs
 */
class MockExecutionProvider extends CodeExecutionProvider {
  async execute(language, code, testCases = []) {
    const results = [];
    let passedCount = 0;
    let totalCount = testCases.length;
    let totalTimeMs = 0;
    let memoryUsageMb = (Math.random() * 2 + 15).toFixed(2); // 15MB - 17MB simulation

    if (totalCount === 0) {
      return {
        status: 'Accepted',
        passedCount: 0,
        totalCount: 0,
        results: [],
        runtimeMs: 0,
        memoryMb: parseFloat(memoryUsageMb)
      };
    }

    // A. Sandboxed JS execution using Node's VM module
    if (language === 'javascript') {
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const logs = [];
        const start = Date.now();
        
        const sandbox = {
          console: {
            log: (...args) => logs.push(args.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join(' '))
          }
        };

        try {
          const context = vm.createContext(sandbox);
          // Standard LeetCode patterns wrapper (we inspect what function name candidate wrote)
          // We look for function name in code, default to twoSum, fizzBuzz, etc.
          let funcName = 'twoSum';
          if (code.includes('fizzBuzz')) funcName = 'fizzBuzz';
          else if (code.includes('reverseList')) funcName = 'reverseList';
          
          // Locate function by regex if possible
          const match = code.match(/function\s+(\w+)/);
          if (match && match[1]) {
            funcName = match[1];
          }

          // Build execution runner scripts
          // Parse multiline inputs
          const cleanInput = tc.input.trim().replace(/\n/g, ',');
          const runScript = `
            ${code}
            const res = ${funcName}(${cleanInput});
            JSON.stringify(res);
          `;

          const outputVal = vm.runInContext(runScript, context, { timeout: 1000 });
          const elapsed = Date.now() - start;
          totalTimeMs += elapsed;

          // Trim whitespaces/quotes to compare results safely
          const cleanOutput = (outputVal || '').toString().trim().replace(/[\s"']/g, '');
          const cleanExpected = tc.expected_output.trim().replace(/[\s"']/g, '');
          const passed = cleanOutput === cleanExpected;

          if (passed) passedCount++;

          results.push({
            id: tc.id,
            input: tc.input,
            expected: tc.expected_output,
            actual: outputVal || 'undefined',
            passed,
            is_hidden: tc.is_hidden,
            status: passed ? 'Passed' : 'Failed',
            stdout: logs.join('\n'),
            runtimeMs: elapsed
          });
        } catch (err) {
          results.push({
            id: tc.id,
            input: tc.input,
            expected: tc.expected_output,
            actual: null,
            passed: false,
            is_hidden: tc.is_hidden,
            status: err.message.includes('timeout') ? 'Time Limit Exceeded' : 'Runtime Error',
            stderr: err.message,
            runtimeMs: Date.now() - start
          });
        }
      }
    } 
    // B. Python, Java, C++ simulated evaluation against expected outputs
    else {
      // Evaluate by regex checking if the candidate has compiled something syntactically OK
      // And then match test cases dynamically
      const hasBoilerplate = code.includes('def') || code.includes('class') || code.includes('#include');
      const start = Date.now();

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const elapsed = Math.floor(Math.random() * 8) + 2;
        totalTimeMs += elapsed;

        if (!hasBoilerplate) {
          results.push({
            id: tc.id,
            input: tc.input,
            expected: tc.expected_output,
            actual: null,
            passed: false,
            is_hidden: tc.is_hidden,
            status: 'Compile Error',
            stderr: `Compiler Error: Missing standard classes or imports for ${language}.`,
            runtimeMs: elapsed
          });
          continue;
        }

        // Simulating 80% pass rate or correctness based on basic code lines
        const isSolutionValid = code.length > 50 && !code.includes('return false') && !code.includes('return {}');
        const passed = isSolutionValid;

        if (passed) passedCount++;

        results.push({
          id: tc.id,
          input: tc.input,
          expected: tc.expected_output,
          actual: passed ? tc.expected_output : 'null/broken',
          passed,
          is_hidden: tc.is_hidden,
          status: passed ? 'Passed' : 'Failed',
          runtimeMs: elapsed
        });
      }
    }

    const overallStatus = passedCount === totalCount ? 'Accepted' : 'Wrong Answer';

    return {
      status: overallStatus,
      passedCount,
      totalCount,
      results,
      runtimeMs: totalTimeMs,
      memoryMb: parseFloat(memoryUsageMb)
    };
  }
}

// Export singleton instance of MockExecutionProvider
const codeExecutionService = new MockExecutionProvider();

module.exports = codeExecutionService;
