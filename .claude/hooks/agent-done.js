#!/usr/bin/env node
// PostToolUse hook — wyświetla potwierdzenie gdy agent kończy pracę

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const { tool_input } = JSON.parse(data);
    const name = (tool_input.subagent_type || 'general-purpose').toUpperCase();
    const timestamp = new Date().toLocaleTimeString('pl-PL');

    console.log(`\n  ✓ AGENT DONE: ${name}  [${timestamp}]\n`);
  } catch (e) {
    // cichy błąd
  }
});
