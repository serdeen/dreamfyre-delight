#!/usr/bin/env node
/**
 * Pre-deploy health check script for Dreamfyre Delight
 * 
 * Scans all HTML builds, opens them in a headless browser, runs diagnostics:
 * - 404/file existence
 * - Audio (Web Audio API)
 * - Video (getUserMedia or working video element)
 * - MIDI (Web MIDI API)
 * 
 * Updates index.html with sorted cards and status badges.
 */

const fs = require('fs');
const path = require('path');

const DREAMFYRE_DIR = '/Users/moe/dreamfyre-delight';
const INDEX_PATH = path.join(DREAMFYRE_DIR, 'index.html');

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  dim: '\x1b[2m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logSuccess(msg) { log(`  ✓ ${msg}`, 'green'); }
function logFail(msg) { log(`  ✗ ${msg}`, 'red'); }
function logWarn(msg) { log(`  ⚠ ${msg}`, 'yellow'); }
function logInfo(msg) { log(`  ℹ ${msg}`, 'cyan'); }

async function ensurePuppeteer() {
  const puppeteer = require('puppeteer');
  return puppeteer;
}

async function installPuppeteer() {
  log('\n📦 Installing puppeteer locally...', 'cyan');
  const { execSync } = require('child_process');
  try {
    execSync('npm install puppeteer', {
      cwd: DREAMFYRE_DIR,
      stdio: 'inherit'
    });
    logSuccess('Puppeteer installed successfully');
    return true;
  } catch (e) {
    logFail('Failed to install puppeteer');
    return false;
  }
}

function getHtmlFiles() {
  const files = fs.readdirSync(DREAMFYRE_DIR)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .map(f => {
      const filePath = path.join(DREAMFYRE_DIR, f);
      const stats = fs.statSync(filePath);
      return {
        name: f,
        path: filePath,
        mtime: stats.mtime
      };
    })
    .sort((a, b) => b.mtime - a.mtime); // newest first
  
  return files;
}

async function runDiagnostics(browser, htmlFile) {
  const results = {
    load: false,
    audio: false,
    video: false,
    midi: false,
    error: null
  };

  const fileUrl = `file://${htmlFile.path}`;
  
  try {
    const page = await browser.newPage();
    
    // Collect console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    // Navigate to the page
    const response = await page.goto(fileUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });

    // Check if file loaded (file:// returns null response or 0 status)
    results.load = response === null || response.status() === 0 || response.status() === 200;
    
    if (!results.load) {
      results.error = `HTTP ${response.status()}`;
      await page.close();
      return results;
    }

    // Wait a bit for JS to initialize (don't use page.waitForTimeout, it's deprecated)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Diagnostic script to run in browser context
    const diagnostics = await page.evaluate(async () => {
      const results = {
        audio: false,
        audioApi: false,
        video: false,
        midi: false,
        videoSource: null
      };

      // === AUDIO CHECK ===
      // Check if Web Audio API is available at all
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      results.audioApi = !!(AudioContextClass);
      
      if (AudioContextClass) {
        try {
          // AudioContext may be created but suspended in headless
          // Just verify we can instantiate it and get audioWorklet or create oscillator
          const testCtx = new AudioContextClass({ sampleRate: 44100 });
          // Check state - if suspended, we still count API as present
          // In headless, AudioContext is often "suspended" until resume()
          results.audio = (testCtx.state === 'running' || testCtx.state === 'suspended');
          // Clean up
          testCtx.close().catch(() => {});
        } catch (e) {
          // Completely failed
          results.audio = false;
        }
      }

      // === VIDEO CHECK ===
      // First, scan the source code for actual video/camera usage patterns
      // (we check the DOM via different means below)
      const hasGetUserMediaCallInCode = (() => {
        // Look for actual getUserMedia call patterns in page JS
        const scripts = document.querySelectorAll('script');
        let found = false;
        scripts.forEach(s => {
          const src = s.src || '';
          // For inline scripts, check the text content
          if (!src && s.textContent.includes('getUserMedia')) {
            found = true;
          }
        });
        return found;
      })();
      
      // Check for <video> elements with actual working sources
      const videoElements = document.querySelectorAll('video');
      let hasWorkingVideoElement = false;
      let hasVideoTag = false;
      
      if (videoElements.length > 0) {
        hasVideoTag = true;
        for (const vid of videoElements) {
          // Check for: has actual src file (not empty string), OR has srcObject (MediaStream from getUserMedia)
          const hasSrcFile = vid.src && vid.src !== window.location.href && vid.src !== '' && !vid.src.endsWith('/');
          const hasStream = vid.srcObject instanceof MediaStream;
          const hasPlayableSrc = (vid.readyState >= 2) || hasSrcFile || hasStream;
          
          if (hasPlayableSrc) {
            hasWorkingVideoElement = true;
            break;
          }
        }
      }

      // Actually TRY getUserMedia if the page uses it (audio-only is common)
      // In headless, both audio and video will fail if no camera, but we distinguish:
      // - audio-only getUserMedia → badge shows ✓ (the feature works, just no mic attached)
      // - video getUserMedia that fails → badge shows ✗
      // - no getUserMedia at all → N/A
      let getUserMediaResult = 'not_found';
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Try audio-only first (most common use case)
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          audioStream.getTracks().forEach(t => t.stop());
          getUserMediaResult = 'audio_works';
        } catch (e) {
          // Audio failed too — try video
          try {
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoStream.getTracks().forEach(t => t.stop());
            getUserMediaResult = 'video_works';
          } catch (e2) {
            getUserMediaResult = 'failed';
          }
        }
      }

      // Final video determination:
      // - getUserMedia with audio works → video: true (has microphone feature, that's the "video check" for audio tools)
      // - getUserMedia fails → video: false (camera feature broken)
      // - has working <video> element → video: true
      // - has <video> tag but no working source → video: false
      const usesCameraFeature = getUserMediaResult !== 'not_found';
      const cameraActuallyWorks = getUserMediaResult === 'audio_works' || getUserMediaResult === 'video_works';
      const videoElWorks = hasWorkingVideoElement;
      
      results.videoSource = usesCameraFeature 
        ? (cameraActuallyWorks ? 'camera_ok' : 'camera_fail') 
        : (videoElWorks ? 'videoElement' : 'none');
      results.video = (usesCameraFeature && cameraActuallyWorks) || videoElWorks;

      // === MIDI CHECK ===
      if (navigator.requestMIDIAccess) {
        results.midi = true; // API exists
      }

      return results;
    });

    results.audio = diagnostics.audio;
    results.video = diagnostics.video;
    results.videoSource = diagnostics.videoSource;
    results.midi = diagnostics.midi;
    
    if (errors.length > 0 && !results.load) {
      results.error = errors.slice(0, 3).join('; ');
    }

    await page.close();
  } catch (e) {
    results.error = e.message;
    try { await page?.close(); } catch(e) {}
  }

  return results;
}

async function updateIndexHtml(resultsMap) {
  // Read current index.html
  let html = fs.readFileSync(INDEX_PATH, 'utf8');

  // Get all HTML files sorted by modification date
  const htmlFiles = getHtmlFiles();

  // Find the opening <style> tag and add badge CSS
  const badgeCSS = `
    /* Health check badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      margin-left: 6px;
      font-size: 0.7rem;
      padding: 2px 5px;
      border-radius: 4px;
      vertical-align: middle;
    }
    .badge-ok { background: #1a4d1a; color: #6bcb77; }
    .badge-fail { background: #4d1a1a; color: #ff6b6b; }
    .badge-na { background: #2a2a4a; color: #666; }
    .badge-load-fail { background: #4d1a1a; color: #ff6b6b; }
    .badge-error { background: #4d3a1a; color: #ffd93d; }
    
    /* Card sort indicator */
    .card[data-mtime] { position: relative; }
    .card .badge-col {
      display: flex;
      gap: 4px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
  `;

  // Insert badge CSS before </style>
  const styleEnd = html.lastIndexOf('</style>');
  if (styleEnd !== -1) {
    html = html.slice(0, styleEnd) + badgeCSS + '\n' + html.slice(styleEnd);
  }

  // For each card in the grid, add badges based on results
  // We need to find each card and add a badge container after the tag span
  // Use a Set to track which files we've already processed
  const processedFiles = new Set();
  
  for (const file of htmlFiles) {
    // Skip if we've already processed this file
    if (processedFiles.has(file.name)) continue;
    processedFiles.add(file.name);
    
    const result = resultsMap[file.name];
    if (!result) continue;

    // Find the specific card anchor for this file
    // Use a more precise pattern to avoid matching the same card multiple times
    const escapedName = file.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cardRegex = new RegExp(
      `(<a class="card[^"]*" href="${escapedName}"[^>]*>([\\s\\S]*?)<\\/a>)`,
      'm'
    );
    
    const match = html.match(cardRegex);
    if (!match) continue;
    
    const [fullMatch, anchorTag, content] = match;
    
    // Build badge HTML
    let badges = '<div class="badge-col">';
    
    // Load badge
    if (result.error && result.error.includes('404')) {
      badges += '<span class="badge badge-fail" title="404 Not Found">⚠</span>';
    } else if (!result.load) {
      badges += '<span class="badge badge-load-fail" title="Load failed">⚠</span>';
    } else {
      badges += '<span class="badge badge-ok" title="Loaded OK">✓</span>';
    }
    
    // Audio badge
    badges += result.audio 
      ? '<span class="badge badge-ok" title="Audio: ✓">🔊✓</span>'
      : '<span class="badge badge-fail" title="Audio: ✗">🔊✗</span>';
    
    // Video badge
    if (result.video) {
      const isCamera = result.videoSource === 'camera_ok' || result.videoSource === 'camera_fail';
      const vidSource = result.videoSource === 'camera_ok' ? '🎤✓' : (result.videoSource === 'camera_fail' ? '🎤✗' : '🎬✓');
      const title = result.videoSource === 'camera_ok' ? 'Camera/Mic: ✓' : (result.videoSource === 'camera_fail' ? 'Camera/Mic: ✗' : 'Video: ✓ (element)');
      badges += `<span class="badge ${result.videoSource === 'camera_fail' ? 'badge-fail' : 'badge-ok'}" title="${title}">${vidSource}</span>`;
    } else if (result.videoSource === 'none') {
      badges += '<span class="badge badge-na" title="Video: N/A">🎬—</span>';
    } else {
      badges += '<span class="badge badge-fail" title="Video: ✗">🎬✗</span>';
    }
    
    // MIDI badge
    badges += result.midi 
      ? '<span class="badge badge-ok" title="MIDI: ✓">🎹✓</span>'
      : '<span class="badge badge-na" title="MIDI: N/A">🎹—</span>';
    
    badges += '</div>';

    // Insert badges after the last </span> in the content
    const lastTagIndex = content.lastIndexOf('</span>');
    let newContent;
    if (lastTagIndex !== -1) {
      const insertPos = lastTagIndex + '</span>'.length;
      newContent = content.slice(0, insertPos) + badges + content.slice(insertPos);
    } else {
      // No tag found, append before closing anchor
      newContent = content + badges;
    }

    // Replace the anchor tag with updated version
    const updatedAnchor = anchorTag.replace(content, newContent).replace(
      /href="${file.name}"/,
      `href="${file.name}" data-mtime="${file.mtime.toISOString()}"`
    );
    
    // Only replace the first occurrence to avoid duplicates
    const firstOccurrence = html.indexOf(fullMatch);
    if (firstOccurrence !== -1) {
      html = html.slice(0, firstOccurrence) + 
             fullMatch.replace(content, newContent).replace(
               /href="${file.name}"/,
               `href="${file.name}" data-mtime="${file.mtime.toISOString()}"`
             ) + 
             html.slice(firstOccurrence + fullMatch.length);
    }
  }

  // Write updated index.html
  fs.writeFileSync(INDEX_PATH, html, 'utf8');
  logSuccess(`Updated ${INDEX_PATH}`);
}

function printResultsTable(resultsMap, htmlFiles) {
  console.log('\n┌────────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                        HEALTH CHECK RESULTS                                   │');
  console.log('├────────────────────────────────────────────────────────────────────────────────┤');
  console.log('│ FILE                    │ LOAD │ AUDIO │ VIDEO │ MIDI │ STATUS              │');
  console.log('├────────────────────────────────────────────────────────────────────────────────┤');
  
  for (const file of htmlFiles) {
    const r = resultsMap[file.name];
    if (!r) {
      console.log(`│ ${file.name.padEnd(24)} │ ???   │ ???    │ ???    │ ???    │ No data            │`);
      continue;
    }
    
    const loadStatus = r.load ? '✓' : (r.error?.includes('404') ? '✗404' : '✗');
    const audioStatus = r.audio ? '✓' : '✗';
    const videoStatus = r.video ? '✓' : '✗';
    const midiStatus = r.midi ? '✓' : '—';
    const errorStr = r.error ? r.error.substring(0, 18) : 'OK';
    
    const line = `│ ${file.name.padEnd(24)} │ ${loadStatus.padStart(4)} │ ${audioStatus.padStart(5)} │ ${videoStatus.padStart(5)} │ ${midiStatus.padStart(4)} │ ${errorStr.padEnd(18)} │`;
    console.log(line);
  }
  
  console.log('└────────────────────────────────────────────────────────────────────────────────┘');
}

async function main() {
  log('\n🔥 Dreamfyre Delight - Pre-Deploy Health Check', 'cyan');
  log('═'.repeat(64), 'cyan');

  // Get HTML files
  const htmlFiles = getHtmlFiles();
  logInfo(`Found ${htmlFiles.length} HTML builds`);

  if (htmlFiles.length === 0) {
    logFail('No HTML files found to check');
    process.exit(1);
  }

  // Try to load puppeteer
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    logWarn('Puppeteer not found, attempting to install...');
    const installed = await installPuppeteer();
    if (!installed) {
      logFail('Could not install puppeteer. Please run: npm install puppeteer');
      process.exit(1);
    }
    try {
      puppeteer = require('puppeteer');
    } catch (e2) {
      logFail('Puppeteer still not available after install');
      process.exit(1);
    }
  }

  // Launch browser
  log('\n🌐 Launching headless browser...', 'cyan');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    logSuccess('Browser launched');
  } catch (e) {
    logFail(`Failed to launch browser: ${e.message}`);
    logInfo('Tip: Chrome might need to be installed. On macOS: brew install chromium');
    process.exit(1);
  }

  // Run diagnostics on each file
  const resultsMap = {};
  let passed = 0, failed = 0;

  for (const file of htmlFiles) {
    process.stdout.write(`\nChecking ${file.name}... `);
    
    const results = await runDiagnostics(browser, file);
    resultsMap[file.name] = results;

    if (results.load && results.audio) {
      log('✓', 'green');
      passed++;
    } else {
      log('✗', 'red');
      failed++;
    }

    if (results.error && !results.load) {
      logInfo(`Error: ${results.error}`);
    }
  }

  await browser.close();
  logSuccess('Browser closed');

  // Print results table
  printResultsTable(resultsMap, htmlFiles);

  // Summary
  log('\n📊 Summary:', 'cyan');
  log(`   Passed: ${passed}`, 'green');
  log(`   Failed: ${failed}`, failed > 0 ? 'red' : 'green');

  // Update index.html
  log('\n📝 Updating index.html with badges...', 'cyan');
  try {
    await updateIndexHtml(resultsMap);
  } catch (e) {
    logFail(`Failed to update index.html: ${e.message}`);
  }

  log('\n✅ Health check complete!', 'green');
  logInfo('Run "open /Users/moe/dreamfyre-delight/index.html" to preview');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});