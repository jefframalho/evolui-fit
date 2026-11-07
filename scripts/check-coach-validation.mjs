import ts from 'typescript';import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {z} from 'zod';
const source=fs.readFileSync('lib/instructor-data.ts','utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'')+'\nglobalThis.schemas={StudentSchema,PlanSchema,EvaluationSchema};';
const c={z};vm.createContext(c);vm.runInContext(ts.transpile(source,{target:ts.ScriptTarget.ES2022}),c);const {StudentSchema,PlanSchema,EvaluationSchema}=c.schemas;
assert.equal(StudentSchema.safeParse({name:'Aluno teste',email:'aluno@example.com'}).success,true);assert.equal(StudentSchema.safeParse({name:'',email:'inválido'}).success,false);
assert.equal(PlanSchema.safeParse({title:'Ficha A',days:'Segunda',notes:'',exercises:[{name:'Supino',sets:'3',reps:'10–12',load:'0',rest:'60',tempo:'2–1–2',notes:''}]}).success,true);
assert.equal(PlanSchema.safeParse({title:'Ficha A',days:'',notes:'',exercises:[]}).success,false);
assert.equal(EvaluationSchema.safeParse({month:'2026-11',weight:80,notes:''}).success,true);assert.equal(EvaluationSchema.safeParse({month:'2026-13',weight:80,notes:''}).success,false);assert.equal(EvaluationSchema.safeParse({month:'2026-11',notes:''}).success,false);assert.equal(EvaluationSchema.safeParse({month:'2026-11',bodyFat:110,notes:''}).success,false);
console.log('PASS: cadastro de aluno, ficha completa e avaliação mensal.');
