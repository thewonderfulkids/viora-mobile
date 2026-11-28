const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
function fixture(platform,available=true){
 const calls=[],exports={},anchor={click(){calls.push('click')},remove(){calls.push('remove')}};
 const imports={'react-native':{Platform:{OS:platform}},'expo-print':{printToFileAsync:async()=>{calls.push('print');return {uri:'file:///report.pdf'}}},'expo-sharing':{isAvailableAsync:async()=>available,shareAsync:async(uri,opts)=>{calls.push(['share',uri,opts.mimeType])}},'./reportService':{buildReportHtml:()=>'<html>report</html>'}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/services/reports/reportPdfService.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:id=>imports[id],Blob,URL:{createObjectURL:()=> 'blob:report',revokeObjectURL:()=>calls.push('revoke')},window:{setTimeout:fn=>{calls.push('schedule');fn()}},document:{createElement:()=>anchor,body:{appendChild:()=>calls.push('append')}}});
 return {api:exports,calls,anchor};
}
test('web snapshot returns actual HTML filename and releases URL after click',async()=>{
 const f=fixture('web');
 assert.equal(await f.api.createAndShareReportPdf({range:'weekly',endDate:'2026-11-28'}),'viora-weekly-report-2026-11-28.html');
 assert.equal(f.anchor.download,'viora-weekly-report-2026-11-28.html');
 assert.deepEqual(f.calls,['append','click','remove','schedule','revoke']);
});
test('native PDF shares actual file with PDF MIME type',async()=>{
 const f=fixture('android');
 assert.equal(await f.api.createAndShareReportPdf({range:'weekly',endDate:'2026-11-28'}),'file:///report.pdf');
 assert.deepEqual(f.calls,['print',['share','file:///report.pdf','application/pdf']]);
});
test('unavailable sharing does not generate orphan PDF',async()=>{
 const f=fixture('android',false);
 await assert.rejects(f.api.createAndShareReportPdf({range:'weekly',endDate:'2026-11-28'}),/Sharing is not available/);
 await assert.rejects(f.api.shareSavedReportExport({htmlSnapshot:'<html/>',fileName:'report.pdf'}),/Sharing is not available/);
 assert.deepEqual(f.calls,[]);
});
test('missing saved snapshot fails before printing',async()=>{
 const f=fixture('android');
 await assert.rejects(f.api.shareSavedReportExport({}),/printable snapshot/);
 assert.deepEqual(f.calls,[]);
});

function printFixture(mode){
 const api={},calls=[];
 let timer,afterPrint;
 const frame={style:{},setAttribute(k,v){calls.push([k,v])},remove(){calls.push('remove')},contentWindow:mode==='missing'?null:{addEventListener(name,fn){afterPrint=fn},focus(){calls.push('focus')},print(){calls.push('print');if(mode==='throw')throw Error('print failed');}}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/services/reports/reportPdfService.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:api,require:id=>id==='react-native'?{Platform:{OS:'web'}}:id==='./reportService'?{buildReportHtml:()=>'<html>report</html>'}:{},window:{setTimeout:fn=>{timer=fn;return 1},clearTimeout:()=>{}},document:{createElement:()=>frame,body:{appendChild:()=>{if(mode!=='timeout')frame.onload()}}}});
 return {api,calls,frame,timeout:()=>timer(),afterPrint:()=>afterPrint()};
}
test('web print opens sandboxed preview and removes it after printing',async()=>{
 const f=printFixture('success');
 assert.equal(await f.api.createAndShareReportPdf({range:'weekly',endDate:'2026-11-28'},true),'print-dialog');
 assert.equal(f.frame.srcdoc,'<html>report</html>');
 assert.deepEqual(f.calls,[['sandbox','allow-same-origin allow-modals'],'focus','print']);
 f.afterPrint();
 assert.equal(f.calls.at(-1),'remove');
});
test('web print rejects unavailable preview and print errors',async()=>{
 for(const mode of ['missing','throw']){
  const f=printFixture(mode);
  await assert.rejects(f.api.printReportOnWeb('<html/>'),/unavailable|print failed/);
  assert.equal(f.calls.at(-1),'remove');
 }
});
test('web print rejects stalled preview and removes frame',async()=>{
 const f=printFixture('timeout');
 const pending=f.api.printReportOnWeb('<html/>');
 f.timeout();
 await assert.rejects(pending,/timed out/);
 assert.equal(f.calls.at(-1),'remove');
});

test('saved web report opens the same sandboxed print flow',async()=>{
 const f=printFixture('success');
 await f.api.shareSavedReportExport({fileName:'report.pdf',htmlSnapshot:'<html>saved</html>'});
 assert.equal(f.frame.srcdoc,'<html>saved</html>');
 assert.equal(f.calls.at(-1),'print');
 f.afterPrint();
 assert.equal(f.calls.at(-1),'remove');
});
