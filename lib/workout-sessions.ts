import {z} from 'zod';
import type {Firestore} from 'firebase/firestore';
import type {FitnessEntry} from './fitness-backend';
import {instructorService,learnerCoachLinks,type CoachLink,type Plan} from './instructor-data';
import {fitnessToday} from './week-calendar';

export const workoutDays=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const normalize=(text:string)=>text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function hasWorkoutDay(days:string,day:string){
  return new RegExp('(?:^|[^a-z])'+normalize(day)+'(?:$|[^a-z])').test(normalize(days));
}
const seriesSchema=z.object({
  name:z.string().min(1).max(100),exercise:z.number().int().min(0).max(79),
  load:z.number().min(0).max(2000),reps:z.number().int().min(1).max(1000)
});
const sessionSchema=z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  finishedAt:z.number().int().positive(),title:z.string().min(1).max(100),series:z.array(seriesSchema).min(1).max(500)});
export type Series=z.infer<typeof seriesSchema>;
export type WorkoutSession={id:string;date:string;finishedAt:number;title:string;series:Series[]};

export function assignedWorkout(plan:Plan,link:CoachLink):FitnessEntry{
  return {id:link.id+'_'+plan.id,kind:'workout',date:fitnessToday(),
    data:{name:plan.title,exercises:plan.exercises,coach:link}};
}

export async function todayAssignments(db:Firestore,uid:string){
  const day=workoutDays[new Date(fitnessToday()+'T12:00:00Z').getUTCDay()];
  const links=await learnerCoachLinks(db,uid);
  const plans=await Promise.all(links.map(async link=>
    (await instructorService(db,link.instructorUid).plans(link.studentId))
      .filter(plan=>hasWorkoutDay(plan.days,day)).map(plan=>assignedWorkout(plan,link))));
  return plans.flat().sort((a,b)=>a.data.name.localeCompare(b.data.name,'pt-BR'));
}

export async function saveWorkoutSession(db:Firestore,uid:string,session:WorkoutSession,coach?:CoachLink){
  const {doc,writeBatch}=await import('firebase/firestore');
  const {id,...raw}=session;
  const data=sessionSchema.parse(raw);
  const batch=writeBatch(db);
  batch.set(doc(db,'users',uid,'workoutSessions',id),data);
  if(coach)batch.set(doc(db,'instructors',coach.instructorUid,'students',coach.studentId,'workoutSessions',id),{...data,learnerUid:uid});
  await batch.commit();
}

export async function listWorkoutSessions(db:Firestore,path:string,limitCount=60,learnerUid?:string){
  const {collection,getDocs,query,orderBy,limit}=await import('firebase/firestore');
  const ref=collection(db,path);
  const snapshot=await getDocs(query(ref,orderBy('finishedAt','desc'),limit(limitCount)));
  return snapshot.docs.flatMap(doc=>{
    const data=doc.data();
    if(learnerUid&&data.learnerUid!==learnerUid)return [];
    const result=sessionSchema.safeParse(data);
    return result.success?[{id:doc.id,...result.data}]:[];
  });
}

export function latestSeries(sessions:WorkoutSession[]){
  const latest=new Map<string,Series>();
  for(const session of sessions)for(const series of [...session.series].reverse()){
    const name=normalize(series.name.trim());
    if(!latest.has(name))latest.set(name,series);
  }
  return (name:string)=>latest.get(normalize(name.trim()));
}
