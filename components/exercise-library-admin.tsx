'use client';
import {useEffect,useMemo,useState} from 'react';
import type {Firestore} from 'firebase/firestore';
import type {User} from 'firebase/auth';
import {collection,doc,getDocs,writeBatch,serverTimestamp,updateDoc} from 'firebase/firestore';
import {exerciseSeed} from '../lib/exercise-seed';
import {verifiedBillingAdmin} from '../lib/billing-math';
type Exercise={id:string;name:string;group:string;videoUrl?:string;instructions?:string};
export default function ExerciseLibraryAdmin({db,user}:{db:Firestore;user:User}){
 const [items,setItems]=useState<Exercise[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[search,setSearch]=useState(''),[editing,setEditing]=useState<string|null>(null),[video,setVideo]=useState('');
 const allowed=verifiedBillingAdmin(user);
 async function reload(){try{const snap=await getDocs(collection(db,'exerciseLibrary'));setItems(snap.docs.map(d=>({id:d.id,...d.data()} as Exercise)));setError('')}catch(e){setError('Não foi possível carregar a biblioteca. Confira as regras do Firestore.')}} 
 useEffect(()=>{if(allowed)void reload()},[allowed,db]);
 async function importAll(){if(!allowed||busy)return;setBusy(true);setError('');setMessage('');try{
  const existing=new Set((await getDocs(collection(db,'exerciseLibrary'))).docs.map(d=>d.id));
  const missing=exerciseSeed.filter(x=>!existing.has(x.id));
  for(let i=0;i<missing.length;i+=400){const batch=writeBatch(db);for(const x of missing.slice(i,i+400)){batch.set(doc(db,'exerciseLibrary',x.id),{name:x.name,group:x.group,videoUrl:x.videoUrl,instructions:x.instructions,createdAt:serverTimestamp()})}await batch.commit()}
  setMessage(missing.length+' exercícios importados. '+(exerciseSeed.length-missing.length)+' já existentes preservados.');await reload()
 }catch(e){setError('Falha na importação. Verifique a permissão administrativa e publique as regras atualizadas.')}finally{setBusy(false)}}
 async function saveVideo(id:string){if(!allowed)return;try{if(video.trim()&&!/^https:\/\//i.test(video.trim()))throw Error('Use um endereço HTTPS.');await updateDoc(doc(db,'exerciseLibrary',id),{videoUrl:video.trim()});setEditing(null);setMessage('Vídeo atualizado.');await reload()}catch(e){setError('Não foi possível salvar. Informe uma URL HTTPS válida.')}}
 const filtered=useMemo(()=>items.filter(x=>(x.name+' '+x.group).toLowerCase().includes(search.toLowerCase())),[items,search]);
 if(!allowed)return <p>Acesso restrito à conta administradora com e-mail verificado.</p>;
 return <section style={{padding:'20px 0',color:'#e9f5e1'}}>
 <h2>Biblioteca de exercícios</h2><p>Exercícios compartilhados para consulta. Vídeos podem ser adicionados individualmente.</p>
 <button type="button" disabled={busy} onClick={importAll} style={{padding:14,background:'#c2fa66',color:'#15200b',border:0,borderRadius:12,fontWeight:700}}>{busy?'Importando...':'Importar 120 exercícios'}</button>
 <button type="button" onClick={()=>void reload()} style={{marginLeft:10,padding:14,borderRadius:12}}>Atualizar</button>
 {message&&<p role="status">{message}</p>}{error&&<p role="alert" style={{color:'#ffaaaa'}}>{error}</p>}
 <p>{items.length} exercícios cadastrados</p><input aria-label="Pesquisar exercícios" placeholder="Pesquisar por nome ou grupo muscular" value={search} onChange={e=>setSearch(e.target.value)} style={{padding:12,width:'100%',maxWidth:520,borderRadius:10}}/>
 <div style={{display:'grid',gap:10,marginTop:20}}>{filtered.map(x=><article key={x.id} style={{padding:15,border:'1px solid #43513b',borderRadius:12,background:'#172218'}}>
 <strong>{x.name}</strong><p>{x.group}</p>{x.videoUrl?<a href={x.videoUrl} target="_blank" rel="noopener noreferrer">Assistir demonstração</a>:<small>Vídeo ainda não cadastrado</small>}
 <div><button type="button" onClick={()=>{setEditing(x.id);setVideo(x.videoUrl||'')}}>Editar vídeo</button></div>
 {editing===x.id&&<div style={{marginTop:10}}><input aria-label="URL do vídeo" value={video} onChange={e=>setVideo(e.target.value)} placeholder="https://..." style={{padding:10,maxWidth:'100%'}}/><button type="button" onClick={()=>void saveVideo(x.id)}>Salvar</button><button type="button" onClick={()=>setEditing(null)}>Cancelar</button></div>}
 </article>)}</div></section>
}
