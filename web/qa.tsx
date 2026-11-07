/// <reference types="vite/client" />
import React from 'react';import {createRoot} from 'react-dom/client';import Dashboard from '../components/fitness-dashboard';import '../app/globals.css';
if(!import.meta.env.DEV)throw Error('Prévia disponível somente no desenvolvimento.');
const rows=[{id:'qa-treino',kind:'workout',date:new Date().toLocaleDateString('en-CA'),data:{name:'Treino A — Demonstração',duration:45,exercises:[{name:'Supino reto',sets:3,reps:12,load:20},{name:'Remada baixa',sets:3,reps:12,load:25}]}},{id:'qa-peso',kind:'measure',date:'2026-11-07',data:{weight:80}},{id:'qa-inicio',kind:'measure',date:'2026-10-07',data:{weight:82}}];
const backend={list:async()=>[...rows],save:async(draft:any)=>{rows.push({...draft,id:'qa-'+Date.now()+'-'+Math.random().toString(36).slice(2)})},remove:async(id:string)=>{const i=rows.findIndex(e=>e.id===id);if(i>=0)rows.splice(i,1)},updateSchedule:async(id:string,draft:any)=>{const i=rows.findIndex(e=>e.id===id);if(i>=0)rows[i]={...draft,id}}};
createRoot(document.getElementById('root')!).render(<Dashboard backend={backend} viewer={{name:'Visitante de teste',email:'qa@example.invalid',verified:true}}/>);
