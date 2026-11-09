'use client';
import {useEffect,useState} from 'react';
import type {Firestore} from 'firebase/firestore';
import type {Student} from '../lib/instructor-data';
import {listWorkoutSessions,type WorkoutSession} from '../lib/workout-sessions';
import {addDays,fitnessToday,mondayOf} from '../lib/week-calendar';

export default function InstructorWorkoutSummary({db,uid,students,onAdjust}:{db:Firestore;uid:string;students:Student[];onAdjust:(studentId:string,planId:string)=>Promise<void>}){
 const [rows,setRows]=useState<{student:Student;sessions:WorkoutSession[]}[]>([]);
 const [report,setReport]=useState('');
 const [open,setOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{
   if(!open)return;
   let active=true;
   setLoading(true);setError(false);setRows([]);
   Promise.all(students.filter(student=>student.learnerUid).map(async student=>({
     student,sessions:await listWorkoutSessions(db,'instructors/'+uid+'/students/'+student.id+'/workoutSessions',60,student.learnerUid||undefined)
   }))).then(result=>{if(active)setRows(result)}).catch(()=>{if(active)setError(true)})
     .finally(()=>{if(active)setLoading(false)});
   return ()=>{active=false};
 },[db,uid,students,open]);

 const monday=mondayOf(fitnessToday()),sunday=addDays(monday,6);
 return <section className="panel settings">
   <h2>Acompanhamento dos alunos</h2>
   <p>Inclui as sessões que cada aluno decidiu compartilhar.</p>
   <button className="secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Fechar resumo':'Ver resumo da semana'}</button>
   {open&&(loading?<p>Carregando sessões…</p>:error?<p role="alert">Não foi possível carregar o resumo. Confira as regras do Firebase e tente novamente.</p>:<>
     {!rows.length&&<p>Nenhum aluno vinculado.</p>}
     {rows.map(({student,sessions})=>{
       const weekly=sessions.filter(session=>session.date>=monday&&session.date<=sunday);
       const peaks=new Map<string,{date:string;load:number}[]>();
       for(const session of sessions){
         const best=new Map<string,number>();
         for(const series of session.series)best.set(series.name,Math.max(best.get(series.name)||0,series.load));
         for(const [name,load] of best)peaks.set(name,[...(peaks.get(name)||[]),{date:session.date,load}]);
       }
       const gains=[...peaks].filter(([,history])=>history.length>1&&history[0].date>=monday&&history[0].load>history[1].load);
       return <article key={student.id}>
         <h3>{student.name} · {weekly.length} {weekly.length===1?'treino':'treinos'} na semana</h3>
         {sessions.flatMap(session=>(session.feedback||[]).map(item=><section key={session.id+':'+item.exercise}>
           <h4>{item.name} · {session.title}</h4><p>{item.note}</p>
           <p>{session.series.filter(row=>row.exercise===item.exercise&&row.name===item.name).map(row=>row.load+' kg × '+row.reps).join(' · ')||'Sem séries registradas para este exercício'}</p>
           {session.planId&&<button className="secondary" onClick={()=>void onAdjust(student.id,session.planId!)}>Ajustar ficha</button>}
         </section>))}
         <button className="secondary" onClick={()=>setReport([
           'Resumo semanal · '+student.name,weekly.length+' sessões compartilhadas',
           ...weekly.map(session=>session.date+' · '+session.title),
           ...gains.map(([name,history])=>name+' · '+history[1].load+' kg → '+history[0].load+' kg')
         ].join('\n'))}>Gerar resumo para o aluno</button>
         {weekly.map(session=><p key={session.id}>{session.date.split('-').reverse().join('/')} · {session.title}</p>)}
         {gains
           .map(([name,history])=><p key={name}>{name} · {history[1].load} kg → {history[0].load} kg</p>)}
       </article>;
     })}
   </>)}
   {open&&report&&<label>Resumo para revisar e copiar<textarea rows={6} value={report} onChange={event=>setReport(event.target.value)}/></label>}
 </section>;
}
