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
const oldReturn = 'return t===`localhost`||t===`::1`||t===`[::1]`||/^127\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/.test(t)';
const newReturn = 'return t===`localhost`||t===`::1`||t===`[::1]`||t===`openknowledge.deejpotter.com`||/^127\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/.test(t)';
if (content.includes(oldReturn)) {
  content = content.replace(oldReturn, newReturn);
  changes++;
  console.log('Patched isAllowedApiOrigin');
}

// 4. Patch hasValidLocalOpOrigin - accept our domain
const oldLocalOp = 'return e===`127.0.0.1`||e===`localhost`||e===`[::1]`||e===`::1`}catch{return!1}';
const newLocalOp = 'return e===`127.0.0.1`||e===`localhost`||e===`[::1]`||e===`::1`||e===`openknowledge.deejpotter.com`}catch{return!1}';
if (content.includes(oldLocalOp)) {
  content = content.replace(oldLocalOp, newLocalOp);
  changes++;
  console.log('Patched hasValidLocalOpOrigin');
}

if (changes > 0) {
  writeFileSync(DIST_FILE, content);
  console.log(`Successfully patched ${changes} functions`);
} else {
  console.log('No patterns matched');
}
