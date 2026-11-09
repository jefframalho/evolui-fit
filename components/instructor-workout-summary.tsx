'use client';
import {useEffect,useState} from 'react';
import type {Firestore} from 'firebase/firestore';
import type {Student} from '../lib/instructor-data';
import {listWorkoutSessions,type WorkoutSession} from '../lib/workout-sessions';
import {addDays,fitnessToday,mondayOf} from '../lib/week-calendar';

export default function InstructorWorkoutSummary({db,uid,students}:{db:Firestore;uid:string;students:Student[]}){
 const [rows,setRows]=useState<{student:Student;sessions:WorkoutSession[]}[]>([]);
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
   <h2>Resumo de treinos da semana</h2>
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
       return <article key={student.id}>
         <h3>{student.name} · {weekly.length} {weekly.length===1?'treino':'treinos'} na semana</h3>
         {weekly.map(session=><p key={session.id}>{session.date.split('-').reverse().join('/')} · {session.title}</p>)}
         {[...peaks].filter(([,history])=>history.length>1&&history[0].date>=monday&&history[0].load>history[1].load)
           .map(([name,history])=><p key={name}>{name} · {history[1].load} kg → {history[0].load} kg</p>)}
       </article>;
     })}
   </>)}
 </section>;
}
