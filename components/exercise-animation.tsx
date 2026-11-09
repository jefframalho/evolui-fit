'use client';
import {useEffect,useState} from 'react';
import {Pause,Play} from 'lucide-react';
import {figureAt,layout,progressAt,type ExerciseAnimation as AnimationData,type Joints} from '../lib/exercise-animations';
const {view,segments}=layout();
export default function ExerciseAnimation({animation}:{animation:AnimationData}){
 const [playing,setPlaying]=useState(()=>typeof window==='undefined'||!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
 const [time,setTime]=useState(0);
 useEffect(()=>{
  if(!playing)return;
  let frame=0,last=performance.now();
  const tick=(now:number)=>{setTime(value=>value+(now-last)/1000);last=now;frame=requestAnimationFrame(tick)};
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[playing]);
 const figure=figureAt(animation,progressAt(time));
 const line=(...keys:(keyof Joints)[])=>keys.map(key=>figure[key].join(',')).join(' ');
 const bench=figure.hip[0];
 return <div className="exercise-animation">
 <svg viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} role="img" aria-label={'Animação esquemática: '+animation.title} style={{width:'100%',maxWidth:420,background:'#172016',borderRadius:12,display:'block'}}>
 <line x1="0" x2={view.width} y1={view.floor} y2={view.floor} stroke="#58684f" strokeWidth="1.5"/>
 {animation.bench&&<g fill="#879382"><rect x={bench-52} y={figure.hip[1]+2} width="60" height="4" rx="2"/><rect x={bench-49} y={figure.hip[1]+6} width="3" height={view.floor-figure.hip[1]-6}/><rect x={bench+2} y={figure.hip[1]+6} width="3" height={view.floor-figure.hip[1]-6}/></g>}
 <g fill="none" strokeLinecap="round" strokeLinejoin="round">
 <polyline points={line('hip','knee','ankle','toe')} stroke="#fff" strokeWidth="3.4"/>
 <polyline points={line('hip','shoulder')} stroke="#fff" strokeWidth="4.2"/>
 <circle cx={figure.head[0]} cy={figure.head[1]} r={segments.head} stroke="#fff" strokeWidth="2.6"/>
 <polyline points={line('shoulder','elbow','wrist')} stroke="#d7e3cf" strokeWidth="3.2"/>
 </g>
 <circle cx={figure.prop[0]} cy={figure.prop[1]} r={animation.prop==='barbell'?6.5:4} fill="#ceeb58" opacity=".92"/>
 </svg>
 <div style={{display:'flex',alignItems:'center',gap:10,margin:'10px 0 4px'}}>
 <button type="button" className="secondary" aria-pressed={playing} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pausar':'Reproduzir'}</button>
 <b>{animation.title}</b><small>{animation.muscles}</small>
 </div>
 <ul>{animation.cues.map(cue=><li key={cue}>{cue}</li>)}</ul>
 <small>Animação esquemática. Ajuste a execução e a carga com seu instrutor.</small>
 </div>;
}
