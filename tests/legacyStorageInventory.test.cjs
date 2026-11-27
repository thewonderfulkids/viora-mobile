const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('H04 inventory of legacy storage references in application source', () => {
 const matches = [];
 function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
   const p=path.join(dir,entry.name);
   if(entry.isDirectory()) walk(p);
   else if (/\.[cm]?[jt]sx?$/.test(p)) {
    const lines=fs.readFileSync(p,'utf8').split(/\r?\n/);
    lines.forEach((line,i)=>{if(/@viora\/|AsyncStorage\.(setItem|multiSet|removeItem|multiRemove|clear)/.test(line)) matches.push(p+':'+(i+1)+': '+line.trim());});
   }
  }
 }
 walk('src'); walk('app');
 assert.ok(matches.length>0,'storage inventory must not be empty');
 console.log('H04 storage inventory\n'+matches.join('\n'));
});
