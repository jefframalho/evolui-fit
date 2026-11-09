'use client';
import {useState} from 'react';
export default function ExerciseDemo({name}:{name:string}){
 const [open,setOpen]=useState(false);
 const exercise=name.toLowerCase();
 const squat=/^agachamento( livre)?$/.test(exercise);
 const bench=/^supino reto( com barra)?$/.test(exercise);
 const press=/^leg press( 45°?)?$/.test(exercise);
 if(!squat&&!bench&&!press)return null;
 return <section className="panel settings">
 <button className="secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Fechar demonstração':'Ver execução'}</button>
 {open&&(squat?<iframe title="Agachamento livre" src="./agachamento-3d.html" style={{width:'100%',minHeight:360,border:0}}/>:<>
 <p>{bench?'Supino reto com barra':'Leg press inclinado'} · Animação esquemática</p>
 <svg viewBox="0 0 260 180" role="img" aria-label="Trajetória do movimento" style={{width:'100%',maxWidth:350,background:'#172016'}}>
 <g fill="none" strokeWidth="7" strokeLinecap="round">
 <path d={bench?'M38 120H210M70 120V157M180 120V157':'M34 111L83 148H151M145 155L238 62'} stroke="#879382"/>
 <circle cx={bench?64:44} cy={bench?104:94} r="10" stroke="#fff"/>
 <path d={bench?'M86 106H164L193 129V153':'M57 107L95 135'} stroke="#fff"/>
 <path stroke="#fff"><animate attributeName="d" dur="3s" repeatCount="indefinite" values={bench?'M100 108L115 73L112 45;M100 108L133 103L112 85;M100 108L115 73L112 45':'M95 135L148 110L185 79;M95 135L119 86L155 109;M95 135L148 110L185 79'}/></path>
 <path d={bench?'M78 45H146':'M168 65L202 93'} stroke="#ceeb58"><animateTransform attributeName="transform" type="translate" dur="3s" repeatCount="indefinite" values={bench?'0 0;0 40;0 0':'0 0;-30 30;0 0'}/></path>
 </g></svg></>)}</section>;
}
