import {useSyncExternalStore} from 'react';
import type {Firestore} from 'firebase/firestore';
export type LibraryExercise={id:string;name:string;group:string;videoUrl:string};
export const normalizeExerciseName=(text:string)=>text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
let items:LibraryExercise[]=[];
let loadedKey='';
const listeners=new Set<()=>void>();
function publish(next:LibraryExercise[]){items=next;listeners.forEach(listener=>listener())}
function subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)}}
export function loadExerciseLibrary(db:Firestore,key:string){
 if(loadedKey===key)return;
 loadedKey=key;
 void (async()=>{
  try{
   const {collection,getDocs}=await import('firebase/firestore');
   const snapshot=await getDocs(collection(db,'exerciseLibrary'));
   if(loadedKey!==key)return;
   const rows=snapshot.docs.map(doc=>{const data=doc.data();return {id:doc.id,name:String(data.name||''),group:String(data.group||''),videoUrl:String(data.videoUrl||'')}}).filter(row=>row.name);
   if(rows.length){publish(rows);return}
   const {exerciseSeed}=await import('./exercise-seed');
   if(loadedKey===key)publish(exerciseSeed.map(row=>({id:row.id,name:row.name,group:row.group,videoUrl:''})));
  }catch{
   if(loadedKey===key)loadedKey='';
  }
 })();
}
export function useExerciseLibrary(){return useSyncExternalStore(subscribe,()=>items,()=>items)}
export function videoFor(library:LibraryExercise[],name:string){
 const wanted=normalizeExerciseName(name);
 if(!wanted)return '';
 return library.find(row=>row.videoUrl&&normalizeExerciseName(row.name)===wanted)?.videoUrl||'';
}
