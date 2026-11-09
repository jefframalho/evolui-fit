'use client';
import {useState} from 'react';
import {useExerciseLibrary,videoFor} from '../lib/exercise-library';
import {videoSource} from '../lib/video-embed';
export default function ExerciseDemo({name}:{name:string}){
 const [open,setOpen]=useState(false),[showVideo,setShowVideo]=useState(false);
 const library=useExerciseLibrary();
 const source=videoSource(videoFor(library,name));
 const exercise=name.toLowerCase();
 const squat=/^agachamento( livre)?$/.test(exercise);
 const bench=/^supino reto( com barra)?$/.test(exercise);
 const press=/^leg press( 45°?)?$/.test(exercise);
 const builtIn=squat||bench||press;
 if(!builtIn&&!source)return null;
 const inAndroidApp=typeof navigator!=='undefined'&&navigator.userAgent.includes('EvoluiFitAndroid');
 const external=source&&(source.kind==='link'||(source.kind==='embed'&&inAndroidApp));
 return <section className="panel settings">
 {source&&<div>
 {external?<a className="secondary" href={source.kind==='embed'?source.youtubeUrl:source.url} target="_blank" rel="noopener noreferrer">Assistir demonstração</a>
 :<button className="secondary" type="button" aria-expanded={showVideo} onClick={()=>setShowVideo(!showVideo)}>{showVideo?'Fechar vídeo':'Ver vídeo'}</button>}
 {showVideo&&source.kind==='embed'&&<iframe title={'Vídeo: '+name} src={source.url} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" style={{width:'100%',aspectRatio:'16 / 9',border:0,borderRadius:12,marginTop:10}}/>}
 {showVideo&&source.kind==='file'&&<video src={source.url} controls loop playsInline preload="metadata" aria-label={'Vídeo: '+name} style={{width:'100%',maxHeight:'70vh',borderRadius:12,marginTop:10,background:'#000'}}/>}
 </div>}
 {builtIn&&<div style={source?{marginTop:10}:undefined}>
 <button className="secondary" type="button" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Fechar demonstração':'Ver execução'}</button>
 {open&&(squat?<iframe title="Agachamento livre" src="./agachamento-3d.html" style={{width:'100%',minHeight:360,border:0}}/>:<>
 <p>{bench?'Supino reto com barra':'Leg press inclinado'} · Animação esquemática</p>
 <svg viewBox="0 0 260 180" role="img" aria-label="Trajetória do movimento" style={{width:'100%',maxWidth:350,background:'#172016'}}>
 <g fill="none" strokeWidth="7" strokeLinecap="round">
 <path d={bench?'M38 120H210M70 120V157M180 120V157':'M34 111L83 148H151M145 155L238 62'} stroke="#879382"/>
 <circle cx={bench?64:44} cy={bench?104:94} r="10" stroke="#fff"/>
 <path d={bench?'M86 106H164L193 129V153':'M57 107L95 135'} stroke="#fff"/>
 <path stroke="#fff"><animate attributeName="d" dur="3s" repeatCount="indefinite" values={bench?'M100 108L115 73L112 45;M100 108L133 103L112 85;M100 108L115 73L112 45':'M95 135L148 110L185 79;M95 135L119 86L155 109;M95 135L148 110L185 79'}/></path>
 <path d={bench?'M78 45H146':'M168 65L202 93'} stroke="#ceeb58"><animateTransform attributeName="transform" type="translate" dur="3s" repeatCount="indefinite" values={bench?'0 0;0 40;0 0':'0 0;-30 30;0 0'}/></path>
 </g></svg></>)}
 </div>}
 </section>;
}
