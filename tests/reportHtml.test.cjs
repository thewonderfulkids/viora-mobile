const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/services/reports/reportService.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:exportsObject,require:()=>({})});
function render(values){
 return exportsObject.buildReportHtml({range:'weekly',score:75,title:'<script>bad</script>',subtitle:'test',startDate:'2026-11-22',endDate:'2026-11-28',generatedAt:'2026-11-28',aiSummary:'test',highlights:[],risks:[],sections:[{title:'Nutrition',score:75,summary:'test',metrics:[{label:'Calories',value:'450',helper:'test',tone:'" onclick="bad()'}],trend:values.map(value=>({label:'Meal',helper:'test',value}))}]});
}
test('large trend values retain their labels and proportional widths',()=>{
 const html=render([150,300,450,600]);
 assert.deepEqual([...html.matchAll(/trend-fill" style="width:(\d+)%"/g)].map(x=>Number(x[1])),[25,50,75,100]);
 assert.match(html,/class="trend-value">450</);
});
test('invalid trend inputs and untrusted HTML are safe',()=>{
 const html=render([NaN,Infinity,-10,50]);
 assert.deepEqual([...html.matchAll(/trend-fill" style="width:(\d+)%"/g)].map(x=>Number(x[1])),[0,0,0,50]);
 assert.match(html,/&lt;script&gt;bad&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script>|onclick="bad/);
 assert.match(html,/Content-Security-Policy/);
});
