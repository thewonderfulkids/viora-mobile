const {test}=require('node:test');
const assert=require('node:assert/strict');
const ts=require('typescript');
const fs=require('node:fs');
const vm=require('node:vm');
function fixture(subscription, switchAccount=false) {
 const auth={currentUser:{uid:'alice',emailVerified:false}};
 const exports={};
 const plans={FREE:{code:'FREE',features:[]},PLUS_MONTHLY:{code:'PLUS_MONTHLY',features:[]},PLUS_YEARLY:{code:'PLUS_YEARLY',features:[]}};
 const imports={'firebase/functions':{httpsCallable:()=>async()=>{}},'../../firebase/firebaseConfig':{auth},'../../repositories/paymentRepository':{getPaymentsByUser:async()=>[]},'../../repositories/subscriptionRepository':{getActiveSubscriptionByUser:async()=>{if(switchAccount)auth.currentUser={uid:'bob'};return subscription;},buildFreeSubscription:userId=>({userId,planCode:'FREE',status:'free'})},'./premiumPlans':{getPlanByCode:code=>plans[code],PREMIUM_PLANS:[],PROGRAM_ENTITLEMENTS:[]}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/services/premium/premiumService.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:id=>{assert.ok(Object.hasOwn(imports,id),id);return imports[id];}});
 return exports;
}
test('paid access requires a valid future expiry',()=>{
 const f=fixture(null), base={userId:'alice',planCode:'PLUS_MONTHLY',status:'active',entitlements:['ai_coach_unlimited']};
 for(const expiresAt of [null,undefined,'invalid','2000-01-01'])assert.equal(f.hasPremiumAccess({...base,expiresAt}),false);
 assert.equal(f.hasPremiumAccess({...base,expiresAt:'2099-01-01'},'ai_coach_unlimited'),true);
 assert.equal(f.hasPremiumAccess({...base,planCode:'FREE',expiresAt:'2099-01-01'},'ai_coach_unlimited'),false);
});
test('premium dashboard rejects foreign sessions and mid-request account switches',async()=>{
 await assert.rejects(fixture(null).getPremiumDashboard('bob'),/Login/);
 await assert.rejects(fixture(null,true).getPremiumDashboard('alice'),/Account changed/);
 const dashboard=await fixture({userId:'bob',planCode:'PLUS_MONTHLY',status:'active',expiresAt:'2099-01-01'}).getPremiumDashboard('alice');
 assert.equal(dashboard.currentPlan.code,'FREE');
});

test('unknown subscription plan codes never grant paid access',()=>{
 const f=fixture(null);
 for(const planCode of ['UNKNOWN','__proto__','constructor',null,undefined]){
  const sub={userId:'alice',planCode,status:'active',expiresAt:'2099-01-01',entitlements:['ai_coach_unlimited']};
  assert.equal(f.hasPremiumAccess(sub),false);
  assert.equal(f.hasPremiumAccess(sub,'ai_coach_unlimited'),false);
 }
});
