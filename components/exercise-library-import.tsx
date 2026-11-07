'use client';
import {useState} from 'react';
import type {Firestore} from 'firebase/firestore';
import {doc,getDoc,setDoc} from 'firebase/firestore';
import catalog from '../data/exercicios-globais.json';

export default function ExerciseLibraryImport({db}:{db:Firestore}){
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState('');
 async function run(){
  if(!confirm('Importar até 120 exercícios para o Firestore? Documentos existentes não serão modificados.'))return;
  setBusy(true);setStatus('Iniciando importação...');
  let created=0,existing=0;
  try{
   for(const exercise of catalog){
    const ref=doc(db,'exerciseLibrary',exercise.id);
    const snapshot=await getDoc(ref);
    if(snapshot.exists()){existing++;continue;}
    await setDoc(ref,exercise);
    created++;
    setStatus(`Importando: ${created} novos, ${existing} já existentes...`);
   }
   setStatus(`Concluído: ${created} criados e ${existing} preservados. Total: ${catalog.length}.`);
  }catch(e){
   setStatus(`Importação interrompida após ${created} criações. ${e instanceof Error?e.message:String(e)}. Pode tentar novamente sem duplicar registros.`);
  }finally{setBusy(false);}
 }
 return <section className="panel"><h2>Biblioteca global de exercícios</h2><p>Importe {catalog.length} exercícios para o Firestore. Apenas o administrador verificado pode executar. Documentos existentes não são sobrescritos.</p><p>Vídeos ainda não estão cadastrados; instruções e equipamentos precisam de revisão profissional.</p><button type="button" className="primary" disabled={busy} onClick={run}>{busy?'Importando…':'Importar 120 exercícios'}</button>{status&&<p role="status">{status}</p>}</section>;
}
