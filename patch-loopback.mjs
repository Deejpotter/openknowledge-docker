import { readFileSync, writeFileSync } from 'fs';

const DIST_FILE = '/usr/local/lib/node_modules/@inkeep/open-knowledge/dist/dist-DU6kAT_L.mjs';

let content = readFileSync(DIST_FILE, 'utf8');
let changes = 0;

// 1. Patch isLoopbackAddress - accept Docker network ranges
const oldLoopback = 'function isLoopbackAddress(e){return e?!!(e===`::1`||e.startsWith(`::ffff:127.`)||e.startsWith(`127.`)):!1}';
const newLoopback = 'function isLoopbackAddress(e){return e?!!(e===`::1`||e.startsWith(`::ffff:127.`)||e.startsWith(`127.`)||e.startsWith(`172.`)||e.startsWith(`10.`)||e.startsWith(`192.168.`)):!1}';
if (content.includes(oldLoopback)) {
  content = content.replace(oldLoopback, newLoopback);
  changes++;
  console.log('Patched isLoopbackAddress');
}

// 2. Patch isLoopbackRequest - accept Docker network ranges
const oldLoopbackReq = 'function isLoopbackRequest(e){let t=e.socket.remoteAddress;return t===`127.0.0.1`||t===`::1`||t===`::ffff:127.0.0.1`}';
const newLoopbackReq = 'function isLoopbackRequest(e){let t=e.socket.remoteAddress;if(!t)return!1;if(t===`127.0.0.1`||t===`::1`||t===`::ffff:127.0.0.1`)return!0;if(t.startsWith(`172.`))return!0;if(t.startsWith(`10.`))return!0;if(t.startsWith(`192.168.`))return!0;return!1}';
if (content.includes(oldLoopbackReq)) {
  content = content.replace(oldLoopbackReq, newLoopbackReq);
  changes++;
  console.log('Patched isLoopbackRequest');
}

// 3. Patch isAllowedApiOrigin - accept our domain
// The function uses template literals and has a regex test at the end
const oldOrigin = 't===`localhost`||t===`::1`||t===`[::1]`';
const newOrigin = 't===`localhost`||t===`::1`||t===`[::1]`||t===`openknowledge.deejpotter.com`';
if (content.includes(oldOrigin)) {
  content = content.replace(oldOrigin, newOrigin);
  changes++;
  console.log('Patched isAllowedApiOrigin (hostname check)');
}

// Also try with the full regex pattern
const oldOriginRegex = '/^127\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/';
if (content.includes(oldOriginRegex)) {
  // Already has the regex, just need to add our domain
  content = content.replace(oldOriginRegex, '/^127\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/||t===`openknowledge.deejpotter.com`');
  changes++;
  console.log('Patched isAllowedApiOrigin (regex check)');
}

if (changes > 0) {
  writeFileSync(DIST_FILE, content);
  console.log(`Successfully patched ${changes} functions`);
} else {
  console.log('No patterns matched - checking what patterns exist...');
  // Debug: show what the patterns actually look like
  const idx = content.indexOf('isAllowedApiOrigin');
  if (idx !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(content.length, idx + 500);
    console.log('Context around isAllowedApiOrigin:', content.substring(start, end));
  }
}
