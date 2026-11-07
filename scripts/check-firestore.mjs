import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,deleteDoc,collection,getDocs,serverTimestamp} from 'firebase/firestore';
import fs from 'node:fs';
const env=await initializeTestEnvironment({projectId:'demo-evolui-fit',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync('firestore.rules','utf8')}});
try{
const alice=env.authenticatedContext('alice').firestore(),bob=env.authenticatedContext('bob').firestore(),anon=env.unauthenticatedContext().firestore();
for(const [kind,data] of Object.entries({measure:{weight:100,waist:100},habit:{water:1.5,sleep:8,meals:'Registro de teste'},goal:{targetWeight:90,weekly:4},workout:{name:'QA',duration:30,exercises:[{name:'Supino',sets:3,reps:10,load:20}]}})){
 const ref=doc(alice,'users/alice/records/'+kind);const draft={kind,date:'2026-11-07',data,createdAt:serverTimestamp()};
 await assertSucceeds(setDoc(ref,draft));await assertSucceeds(getDoc(ref));
 await assertFails(getDoc(doc(bob,'users/alice/records/'+kind)));await assertFails(getDoc(doc(anon,'users/alice/records/'+kind)));
 await assertFails(setDoc(doc(bob,'users/alice/records/foreign'),draft));
 await assertFails(deleteDoc(doc(bob,'users/alice/records/'+kind)));
 await assertFails(setDoc(ref,{...draft,data:{...data,extra:'denied'}}));
}
await assertSucceeds(getDocs(collection(alice,'users/alice/records')));
await assertFails(getDocs(collection(bob,'users/alice/records')));
await assertFails(setDoc(doc(alice,'users/alice/records/negative'),{kind:'measure',date:'2026-11-07',data:{weight:-1},createdAt:serverTimestamp()}));
await assertFails(setDoc(doc(alice,'users/alice/records/role'),{kind:'goal',date:'2026-11-07',data:{weekly:4},createdAt:serverTimestamp(),role:'admin'}));
await assertFails(setDoc(doc(alice,'users/alice'),{role:'admin'}));
await assertSucceeds(deleteDoc(doc(alice,'users/alice/records/measure')));
console.log('PASS: regras do Firestore no emulador — quatro tipos de registro, isolamento, usuário anônimo, escrita e exclusão.');
}finally{await env.cleanup()}
