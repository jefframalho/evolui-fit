'use client';
import {useEffect,useRef,useState} from 'react';
import {Timer,Play,Pause,RotateCcw,Check,SkipForward,Volume2,VolumeX,ChevronLeft,ChevronRight,Dumbbell,Zap} from 'lucide-react';
import {formatTimer,timerValue,type TimerMode} from '../lib/timer-math';
import {friendlyError} from '../lib/fitness-backend';
import type {Series} from '../lib/workout-sessions';
import ExerciseDemo from './exercise-demo';
import type {FitnessEntry} from '../lib/fitness-backend';
type AudioWindow=Window&{webkitAudioContext?:typeof AudioContext};
type TimerSnapshot={index:number;series:Series[];mode:TimerMode;baseMs:number;startedAt:number|null;restSeconds:number;share:boolean};
export default function WorkoutTimer({workout,initialIndex=0,storageKey,previousSeries,onFinish}:{workout:FitnessEntry|null;initialIndex?:number;storageKey?:string;previousSeries?:(name:string)=>Series|undefined;onFinish?:(series:Series[],share:boolean)=>Promise<void>}){
 const [saved]=useState<TimerSnapshot|null>(()=>{
   try{return storageKey?JSON.parse(localStorage.getItem(storageKey)||'null'):null}catch{return null}
 });
 const [series,setSeries]=useState<Series[]>(saved?.series||[]);
 const [share,setShare]=useState(saved?.share||false);
 const [load,setLoad]=useState(''),[reps,setReps]=useState(''),[saving,setSaving]=useState(false),[saveError,setSaveError]=useState('');
 const [mode,setMode]=useState<TimerMode>(saved?.mode||'exercise'),[baseMs,setBaseMs]=useState(saved?.baseMs||0),[startedAt,setStartedAt]=useState<number|null>(saved?.startedAt??null),[now,setNow]=useState(Date.now()),[restSeconds,setRestSeconds]=useState(saved?.restSeconds||60),[sound,setSound]=useState(true),[notice,setNotice]=useState(''),[index,setIndex]=useState(saved?.index??initialIndex),[completed,setCompleted]=useState(0),[manualName,setManualName]=useState('Meu exercício');
 const audio=useRef<AudioContext|null>(null),announced=useRef(false);
 const exercises=workout?.data.exercises||[],exercise=exercises[index],name=exercise?.name||manualName,remaining=timerValue(mode,baseMs,startedAt,now),running=startedAt!==null;
 const previousStart=useRef({id:workout?.id,index:initialIndex});
 useEffect(()=>{if(previousStart.current.id===workout?.id&&previousStart.current.index===initialIndex)return;previousStart.current={id:workout?.id,index:initialIndex};setIndex(initialIndex);setMode('exercise');setBaseMs(0);setStartedAt(null);setCompleted(0);setNotice('');announced.current=false},[workout?.id,initialIndex]);
 useEffect(()=>{if(exercise?.rest&&saved?.index!==index)setRestSeconds(Number(exercise.rest));setLoad(String(exercise?.load??''));setReps(String(exercise?.reps??'').match(/^\d+/)?.[0]||'');},[workout?.id,index]);
 useEffect(()=>{if(!running)return;const tick=()=>setNow(Date.now());const interval=setInterval(tick,150);document.addEventListener('visibilitychange',tick);return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',tick)}},[running]);
 useEffect(()=>{if(mode==='rest'&&running&&remaining<=0&&!announced.current){announced.current=true;setStartedAt(null);setBaseMs(0);setNotice('Intervalo concluído. Pronto para a próxima série!');notify()}},[remaining,mode,running]);
 useEffect(()=>()=>{audio.current?.close().catch(()=>{})},[]);
 function unlockAudio(){if(!sound)return;try{const A=window.AudioContext||(window as AudioWindow).webkitAudioContext;if(A){audio.current??=new A();audio.current.resume().catch(()=>{})}}catch{}}
 function notify(){if(!sound)return;try{const context=audio.current;if(context&&context.state==='running'){[0,.2,.4].forEach(delay=>{const oscillator=context.createOscillator(),gain=context.createGain();oscillator.connect(gain);gain.connect(context.destination);oscillator.frequency.value=880;gain.gain.setValueAtTime(.12,context.currentTime+delay);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+delay+.15);oscillator.start(context.currentTime+delay);oscillator.stop(context.currentTime+delay+.16)})}navigator.vibrate?.([150,80,150])}catch{}}
 function setTimer(nextMode:TimerMode,ms:number,start=false){setMode(nextMode);setBaseMs(ms);setStartedAt(start?Date.now():null);setNow(Date.now());announced.current=false;setNotice('')}
 function toggle(){unlockAudio();if(mode==='rest'&&remaining===0){setTimer('exercise',0,true);return}if(running){setBaseMs(timerValue(mode,baseMs,startedAt,Date.now()));setStartedAt(null)}else{setStartedAt(Date.now());setNow(Date.now());announced.current=false}setNotice('')}
 useEffect(()=>{
   if(!storageKey)return;
   try{localStorage.setItem(storageKey,JSON.stringify({index,series,mode,baseMs,startedAt,restSeconds,share}))}catch{}
 },[storageKey,index,series,mode,baseMs,startedAt,restSeconds,share]);
 async function finishWorkout(){
   if(!onFinish||!series.length||saving)return;
   setSaving(true);setSaveError('');
   try{await onFinish(series,share)}catch(error){setSaveError(friendlyError(error))}finally{setSaving(false)}
 }
 function finishSet(){
   if(saving)return;
   if(onFinish&&exercise){
     const kg=Number(load),count=Number(reps);
     if(series.length>=500){setSaveError('Finalize o treino antes de registrar mais séries.');return}
     if(!load.trim()||!Number.isFinite(kg)||kg<0||kg>2000||!Number.isInteger(count)||count<1||count>1000){
       setSaveError('Informe uma carga de 0 a 2000 kg e de 1 a 1000 repetições.');return;
     }
     setSeries(rows=>[...rows,{name:exercise.name,exercise:index,load:kg,reps:count}]);
     setSaveError('');
   }
   unlockAudio();setCompleted(c=>c+1);setTimer('rest',restSeconds*1000,true);setNotice('Série concluída. Respire e recupere sua energia.')}
 function changeExercise(i:number){if(running&&!confirm('Trocar de exercício e zerar o cronômetro atual?'))return;setIndex(i);setCompleted(0);setTimer('exercise',0)}
 const last=exercise ? previousSeries?.(exercise.name) : undefined;
 const ring=mode==='rest'?Math.min(1,remaining/(restSeconds*1000)):((remaining/1000)%60)/60;
 return <section className="live-workout"><div className="timer-layout"><div className={'timer-card '+(mode==='rest'?'resting':'')}><div className="timer-top"><span className="live-pill"><span/>{mode==='rest'?'RECUPERAÇÃO':'FOCO NO MOVIMENTO'}</span><button className="icon-button sound-button" type="button" aria-label={sound?'Desativar aviso sonoro':'Ativar aviso sonoro'} aria-pressed={sound} onClick={()=>{setSound(!sound);if(!sound)unlockAudio()}}>{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button></div><div className="timer-exercise"><p>{workout?.data.name||'SEU ESPAÇO DE TREINO'}</p><h2>{name}</h2><span>{exercise?`${exercise.sets} séries · ${exercise.reps} repetições · ${exercise.load} kg`:'No seu ritmo. Uma série de cada vez.'}</span></div><div className="clock-ring"><svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="109" className="ring-track"/><circle cx="120" cy="120" r="109" className="ring-fill" strokeDasharray={685} strokeDashoffset={685*(1-ring)}/></svg><div className="clock-inner"><span>{mode==='rest'?'INTERVALO':'TEMPO DO EXERCÍCIO'}</span><output aria-label={mode==='rest'?'Tempo restante do intervalo':'Tempo do exercício'}>{formatTimer(remaining,mode==='rest')}</output><small><span className={running?'pulse-dot':''}/>{running?'Em andamento':mode==='rest'&&remaining===0?'Intervalo concluído':'Aguardando você'}</small></div></div>{exercise&&onFinish&&<div className="timer-settings">
   {last&&<p>Última sessão · {last.load} kg × {last.reps}</p>}
   <label>Carga usada (kg)<input type="number" min="0" max="2000" step="any" value={load} onChange={e=>setLoad(e.target.value)}/></label>
   <label>Repetições feitas<input type="number" min="1" max="1000" value={reps} onChange={e=>setReps(e.target.value)}/></label>
 </div>}<div className="timer-controls"><button className="timer-reset" onClick={()=>setTimer(mode,mode==='rest'?restSeconds*1000:0)} aria-label="Zerar cronômetro"><RotateCcw size={19}/></button><button className="timer-start" onClick={toggle}>{running?<Pause size={21}/>:<Play size={21}/>} {running?'Pausar':mode==='rest'&&remaining===0?'Iniciar série':remaining>0&&mode==='exercise'?'Continuar':'Iniciar'}</button><button className="timer-reset" onClick={()=>mode==='exercise'?finishSet():setTimer('exercise',0)} aria-label={mode==='exercise'?'Concluir série e iniciar intervalo':'Pular intervalo'}>{mode==='exercise'?<Check size={21}/>:<SkipForward size={21}/>}</button></div><button className="finish-set" onClick={()=>mode==='exercise'?finishSet():setTimer('exercise',0)}>{mode==='exercise'?'Concluir série e descansar':'Pular intervalo e voltar ao exercício'} <ChevronRight size={15}/></button><p className="timer-notice" role="status">{notice||'Concentre-se na execução. Deixe o tempo com a gente.'}</p></div><div className="timer-settings"><section className="panel settings"><div className="section-icon"><Timer size={21}/></div><h2>Seu intervalo, seu ritmo</h2><p>Escolha o tempo de descanso entre as séries.</p><div className="rest-presets">{[30,45,60,90,120].map(s=><button key={s} className={restSeconds===s?'active':''} onClick={()=>{setRestSeconds(s);if(mode==='rest'&&!running)setBaseMs(s*1000)}} disabled={mode==='rest'&&running}>{s<60?`${s}s`:s%60===0?`${s/60}min`:'1min30'}</button>)}</div><label className="custom-rest">Personalizar (segundos)<input aria-label="Intervalo em segundos" type="number" min="5" max="3600" value={restSeconds} disabled={mode==='rest'&&running} onChange={e=>{const s=Number(e.target.value);if(s>=5&&s<=3600){setRestSeconds(s);if(mode==='rest')setBaseMs(s*1000)}}}/></label><div className="timer-summary"><span><Check size={16}/> Séries concluídas</span><b>{exercise&&onFinish?series.filter(row=>row.exercise===index).length:completed}{exercise?` / ${exercise.sets}`:''}</b></div><p className="timer-help">Mantenha o aplicativo aberto para ouvir o aviso. O tempo é recalculado ao voltar para a tela.</p></section><section className="panel settings"><div className="section-icon"><Dumbbell size={21}/></div><h2>{exercises.length?'Exercícios do treino':'Qual exercício é agora?'}</h2>{exercises.length?<><div className="exercise-list">{exercises.map((x:any,i:number)=><button key={i} onClick={()=>changeExercise(i)} className={index===i?'active':''}><span>{String(i+1).padStart(2,'0')}</span><div><b>{x.name}</b><small>{x.sets} × {x.reps} · {x.load} kg</small></div>{index===i?<Zap size={17}/>:<ChevronRight size={17}/>}</button>)}</div><div className="exercise-switch"><button className="secondary" disabled={index===0} onClick={()=>changeExercise(index-1)}><ChevronLeft size={16}/> Anterior</button><button className="secondary" disabled={index===exercises.length-1} onClick={()=>changeExercise(index+1)}>Próximo <ChevronRight size={16}/></button></div></>:<><p>Dê um nome ao seu exercício e inicie o cronômetro.</p><label>Nome do exercício<input maxLength={100} value={manualName} onChange={e=>setManualName(e.target.value)} placeholder="Ex.: Supino reto"/></label><p className="timer-help">Para usar uma ficha salva, abra Meus treinos e toque em Treinar agora.</p></>}</section>{exercise&&<ExerciseDemo key={exercise.name} name={exercise.name}/>}
 {onFinish&&<section className="panel settings">
   <h2>Concluir treino</h2>
   {workout?.data.coach&&<label><input type="checkbox" checked={share} disabled={saving} onChange={e=>setShare(e.target.checked)}/> Compartilhar esta sessão e suas séries com o instrutor da ficha</label>}
   {saveError&&<p role="alert">{saveError}</p>}
   <button className="primary" disabled={saving||!series.length} onClick={finishWorkout}>{saving?'Salvando…':'Salvar treino concluído'}</button>
 </section>}</div></div></section>
}
