#!/usr/bin/env node
// PreToolUse hook — wyświetla baner gdy agent startuje

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const { tool_input } = JSON.parse(data);
    const name = (tool_input.subagent_type || 'general-purpose').toUpperCase();
    const desc = tool_input.description || '';
    const timestamp = new Date().toLocaleTimeString('pl-PL');

    console.log(`\n╔══════════════════════════════════════╗`);
    console.log(`║  🤖 AGENT START  [${timestamp}]`);
    console.log(`║  ${name}`);
    if (desc) console.log(`║  ${desc.substring(0, 60)}${desc.length > 60 ? '…' : ''}`);
    console.log(`╚══════════════════════════════════════╝`);
  } catch (e) {
    // cichy błąd — nie blokuj głównego procesu
  }
});
