import ts from 'typescript';import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync('lib/timer-math.ts','utf8').replace(/export /g,'');const c={};vm.createContext(c);vm.runInContext(ts.transpile(source,{target:ts.ScriptTarget.ES2022}),c);
assert.equal(c.timerValue('exercise',1000,2000,7000),6000);
assert.equal(c.timerValue('exercise',6000,null,900000),6000);
assert.equal(c.timerValue('rest',60000,1000,91000),0);
assert.equal(c.timerValue('rest',60000,1000,31000),30000);
assert.equal(c.timerValue('exercise',0,1000,1000+180000),180000);
assert.equal(c.formatTimer(59999),'00:59');assert.equal(c.formatTimer(59999,true),'01:00');assert.equal(c.formatTimer(60000),'01:00');assert.equal(c.formatTimer(0,true),'00:00');
console.log('PASS: cronômetro, pausa, intervalo, retorno após inatividade e formatação.');
