const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
function load(lang){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/i18n/resources/'+lang+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});return exports.default;}
function flatten(obj,prefix=''){return Object.entries(obj).flatMap(([k,v])=>typeof v==='object'?flatten(v,prefix+k+'.'):[[prefix+k,v]]);}
test('English and Hindi resources have identical nonempty translation keys',()=>{const en=flatten(load('en')),hi=flatten(load('hi'));assert.deepEqual(en.map(x=>x[0]).sort(),hi.map(x=>x[0]).sort());for(const [k,v] of [...en,...hi])assert.ok(typeof v==='string'&&v.trim(),k);});
test('all visible navigation labels are translated',()=>{for(const lang of ['en','hi'])for(const key of ['home','wellness','aiCoach','progress','profile'])assert.ok(load(lang).common[key],lang+':'+key);});
