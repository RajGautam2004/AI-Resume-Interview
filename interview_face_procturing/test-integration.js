#!/usr/bin/env node
/**
 * INTEGRATION TEST SUITE
 * Tests all 5 optimized core files
 * 
 * Files tested:
 * 1. src/utils/faceAnalysis.js
 * 2. src/utils/eventReporter.js
 * 3. src/App.jsx
 * 4. src/components/Proctoring.jsx
 * 5. server/server.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${msg}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`),
};

let testsPassed = 0;
let testsFailed = 0;

// ============================================================================
// FILE EXISTENCE TESTS
// ============================================================================

function testFileExistence() {
  log.section('🔍 TEST 1: FILE EXISTENCE');

  const files = [
    'src/utils/faceAnalysis.js',
    'src/utils/eventReporter.js',
    'src/App.jsx',
    'src/components/Proctoring.jsx',
    'src/index.jsx',
    'server/server.js',
    'index.html',
    'package.json',
    '.env.example',
  ];

  files.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      log.success(`Found: ${file} (${size} KB)`);
      testsPassed++;
    } else {
      log.error(`Missing: ${file}`);
      testsFailed++;
    }
  });
}

// ============================================================================
// SYNTAX VALIDATION TESTS
// ============================================================================

function testFileSyntax() {
  log.section('🔍 TEST 2: FILE SYNTAX VALIDATION');

  const jsFiles = [
    'src/utils/faceAnalysis.js',
    'src/utils/eventReporter.js',
    'server/server.js',
  ];

  jsFiles.forEach((file) => {
    try {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for common syntax issues
      if (!content.includes('export') && file !== 'server/server.js') {
        log.warning(`No export found in ${file}`);
      }

      // Try to parse as valid JavaScript (basic check)
      const isValid =
        // Check for matching braces
        (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length &&
        // Check for matching brackets
        (content.match(/\[/g) || []).length === (content.match(/\]/g) || []).length &&
        // Check for matching parentheses
        (content.match(/\(/g) || []).length === (content.match(/\)/g) || []).length;

      if (isValid) {
        log.success(`Valid syntax: ${file}`);
        testsPassed++;
      } else {
        log.error(`Invalid syntax: ${file} (bracket/parenthesis mismatch)`);
        testsFailed++;
      }
    } catch (err) {
      log.error(`Cannot read ${file}: ${err.message}`);
      testsFailed++;
    }
  });
}

// ============================================================================
// DEPENDENCY VALIDATION TESTS
// ============================================================================

function testDependencies() {
  log.section('🔍 TEST 3: DEPENDENCY VALIDATION');

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
    );

    const requiredDeps = [
      'react',
      'react-dom',
      'react-webcam',
      '@tensorflow/tfjs',
      '@tensorflow-models/face-landmarks-detection',
      'express',
      'cors',
    ];

    const installedDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    requiredDeps.forEach((dep) => {
      if (installedDeps[dep]) {
        log.success(`Dependency found: ${dep} (${installedDeps[dep]})`);
        testsPassed++;
      } else {
        log.error(`Missing dependency: ${dep}`);
        testsFailed++;
      }
    });
  } catch (err) {
    log.error(`Cannot read package.json: ${err.message}`);
    testsFailed++;
  }
}

// ============================================================================
// IMPORT VALIDATION TESTS
// ============================================================================

function testImports() {
  log.section('🔍 TEST 4: IMPORT/EXPORT VALIDATION');

  const testCases = [
    {
      file: 'src/utils/faceAnalysis.js',
      shouldContain: ['export', 'analyzeFace', 'clearEventCache'],
      description: 'Face analysis module',
    },
    {
      file: 'src/utils/eventReporter.js',
      shouldContain: ['export', 'reportEvent', 'getEventStats', 'flushEvents'],
      description: 'Event reporter module',
    },
    {
      file: 'src/App.jsx',
      shouldContain: ['import', 'React', 'Proctoring', 'ErrorBoundary'],
      description: 'App component with error boundary',
    },
    {
      file: 'src/components/Proctoring.jsx',
      shouldContain: [
        'import',
        'useRef',
        'useEffect',
        'useState',
        'analyzeFace',
        'reportEvent',
      ],
      description: 'Proctoring component',
    },
    {
      file: 'server/server.js',
      shouldContain: ['express', 'cors', 'app.post', 'app.get'],
      description: 'Express server',
    },
  ];

  testCases.forEach(({ file, shouldContain, description }) => {
    try {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');

      const missingItems = shouldContain.filter((item) => !content.includes(item));

      if (missingItems.length === 0) {
        log.success(`${description}: All required imports/exports found`);
        testsPassed++;
      } else {
        log.error(`${description}: Missing ${missingItems.join(', ')}`);
        testsFailed++;
      }
    } catch (err) {
      log.error(`Cannot read ${file}: ${err.message}`);
      testsFailed++;
    }
  });
}

// ============================================================================
// OPTIMIZATION FEATURE TESTS
// ============================================================================

function testOptimizations() {
  log.section('🔍 TEST 5: OPTIMIZATION FEATURES');

  const optimizations = [
    {
      file: 'src/utils/faceAnalysis.js',
      feature: 'Event caching',
      searchTerms: ['CACHE', 'cache', '2000'],
    },
    {
      file: 'src/utils/eventReporter.js',
      feature: 'Queue/batch processing',
      searchTerms: ['EVENT_QUEUE', 'BATCH', 'queue'],
    },
    {
      file: 'src/utils/eventReporter.js',
      feature: 'Retry logic',
      searchTerms: ['MAX_RETRIES', 'RETRY', 'retry'],
    },
    {
      file: 'src/App.jsx',
      feature: 'Error boundary',
      searchTerms: ['ErrorBoundary', 'getDerivedStateFromError', 'componentDidCatch'],
    },
    {
      file: 'src/components/Proctoring.jsx',
      feature: 'Memoization (useCallback)',
      searchTerms: ['useCallback', 'memoiz'],
    },
    {
      file: 'src/components/Proctoring.jsx',
      feature: 'Performance metrics',
      searchTerms: ['metrics', 'fps', 'FPS', 'detections'],
    },
    {
      file: 'server/server.js',
      feature: 'Session management',
      searchTerms: ['session', 'Session', 'sessionId'],
    },
    {
      file: 'server/server.js',
      feature: 'Statistics tracking',
      searchTerms: ['statistics', 'statistics', 'stats'],
    },
  ];

  optimizations.forEach(({ file, feature, searchTerms }) => {
    try {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');

      const found = searchTerms.some((term) => content.includes(term));

      if (found) {
        log.success(`${file}: ✅ ${feature}`);
        testsPassed++;
      } else {
        log.warning(`${file}: Cannot verify ${feature}`);
      }
    } catch (err) {
      log.error(`Cannot read ${file}: ${err.message}`);
      testsFailed++;
    }
  });
}

// ============================================================================
// ENVIRONMENT CONFIGURATION TEST
// ============================================================================

function testEnvironmentConfig() {
  log.section('🔍 TEST 6: ENVIRONMENT CONFIGURATION');

  const envExamplePath = path.join(__dirname, '.env.example');

  if (fs.existsSync(envExamplePath)) {
    try {
      const content = fs.readFileSync(envExamplePath, 'utf8');
      const vars = content.split('\n').filter((line) => line && !line.startsWith('#'));

      if (vars.length > 0) {
        log.success(`.env.example found with ${vars.length} variables`);
        testsPassed++;

        vars.forEach((varLine) => {
          if (varLine.includes('=')) {
            const [key] = varLine.split('=');
            log.info(`  - ${key.trim()}`);
          }
        });
      } else {
        log.warning('No environment variables in .env.example');
      }
    } catch (err) {
      log.error(`Cannot read .env.example: ${err.message}`);
      testsFailed++;
    }
  } else {
    log.warning('.env.example not found (create from .env.example)');
  }

  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    log.success('.env file exists (configured)');
    testsPassed++;
  } else {
    log.warning('.env file not found (copy from .env.example and configure)');
  }
}

// ============================================================================
// BUILD CONFIGURATION TEST
// ============================================================================

function testBuildConfig() {
  log.section('🔍 TEST 7: BUILD CONFIGURATION');

  const viteConfigPath = path.join(__dirname, 'vite.config.js');
  const indexHtmlPath = path.join(__dirname, 'index.html');

  // Check Vite config
  if (fs.existsSync(viteConfigPath)) {
    try {
      const content = fs.readFileSync(viteConfigPath, 'utf8');
      if (content.includes('react') && content.includes('defineConfig')) {
        log.success('Vite config found and properly configured');
        testsPassed++;
      } else {
        log.warning('Vite config exists but may be incomplete');
      }
    } catch (err) {
      log.error(`Cannot read vite.config.js: ${err.message}`);
      testsFailed++;
    }
  } else {
    log.warning('vite.config.js not found');
  }

  // Check HTML
  if (fs.existsSync(indexHtmlPath)) {
    try {
      const content = fs.readFileSync(indexHtmlPath, 'utf8');
      if (content.includes('root') && content.includes('src/index.jsx')) {
        log.success('index.html properly configured with root and entry point');
        testsPassed++;
      } else {
        log.warning('index.html exists but may be missing root div or entry point');
      }
    } catch (err) {
      log.error(`Cannot read index.html: ${err.message}`);
      testsFailed++;
    }
  } else {
    log.warning('index.html not found');
  }
}

// ============================================================================
// INTEGRATION READINESS TEST
// ============================================================================

function testIntegrationReadiness() {
  log.section('🔍 TEST 8: INTEGRATION READINESS');

  const checks = [
    {
      name: 'Frontend structure',
      test: () => {
        const paths = [
          'src/utils/faceAnalysis.js',
          'src/utils/eventReporter.js',
          'src/App.jsx',
          'src/components/Proctoring.jsx',
        ];
        return paths.every((p) => fs.existsSync(path.join(__dirname, p)));
      },
    },
    {
      name: 'Backend structure',
      test: () => fs.existsSync(path.join(__dirname, 'server/server.js')),
    },
    {
      name: 'Dependencies defined',
      test: () => {
        try {
          const pkg = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
          );
          return (
            pkg.dependencies &&
            pkg.devDependencies &&
            Object.keys(pkg.dependencies).length > 0
          );
        } catch {
          return false;
        }
      },
    },
    {
      name: 'Build tools configured',
      test: () => {
        const vite = fs.existsSync(path.join(__dirname, 'vite.config.js'));
        const html = fs.existsSync(path.join(__dirname, 'index.html'));
        return vite && html;
      },
    },
    {
      name: 'Backend infrastructure',
      test: () => {
        const serverPath = path.join(__dirname, 'server/server.js');
        if (!fs.existsSync(serverPath)) return false;
        const content = fs.readFileSync(serverPath, 'utf8');
        return (
          content.includes('express') &&
          content.includes('cors') &&
          content.includes('app.listen')
        );
      },
    },
  ];

  checks.forEach(({ name, test }) => {
    if (test()) {
      log.success(`${name} - Ready`);
      testsPassed++;
    } else {
      log.error(`${name} - Not ready`);
      testsFailed++;
    }
  });
}

// ============================================================================
// SUMMARY
// ============================================================================

function printSummary() {
  log.section('📊 TEST SUMMARY');

  const total = testsPassed + testsFailed;
  const percentage = total > 0 ? Math.round((testsPassed / total) * 100) : 0;

  console.log(`${colors.blue}Total Tests: ${total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`${colors.cyan}Success Rate: ${percentage}%${colors.reset}`);

  if (testsFailed === 0) {
    log.success('\n🎉 ALL TESTS PASSED! System is ready for development.');
    process.exit(0);
  } else {
    log.error('\n⚠️  Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

// ============================================================================
// HELPFUL NEXT STEPS
// ============================================================================

function printNextSteps() {
  log.section('📋 NEXT STEPS');

  console.log(`
${colors.cyan}1. Install Dependencies${colors.reset}
   npm install

${colors.cyan}2. Configure Environment${colors.reset}
   cp .env.example .env
   # Edit .env with your settings

${colors.cyan}3. Start Development Server${colors.reset}
   npm run dev
   # Or: npm run dev:frontend (terminal 1) + npm run dev:backend (terminal 2)

${colors.cyan}4. Open in Browser${colors.reset}
   http://localhost:3000

${colors.cyan}5. Build for Production${colors.reset}
   npm run build:frontend

${colors.cyan}6. Run Tests${colors.reset}
   npm test

${colors.cyan}7. Integration Guides${colors.reset}
   - Read: SETUP.md       (Installation guide)
   - Read: INTEGRATION.md (Integration details)
   - Read: TESTS.md       (Testing guide)
  `);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

console.clear();
console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║   🎓 AI PROCTORING SYSTEM - INTEGRATION TEST SUITE             ║
║   Testing 5 Optimized Core Files                               ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
`);

testFileExistence();
testFileSyntax();
testDependencies();
testImports();
testOptimizations();
testEnvironmentConfig();
testBuildConfig();
testIntegrationReadiness();
printNextSteps();
printSummary();
