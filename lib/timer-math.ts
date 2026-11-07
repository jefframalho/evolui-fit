export type TimerMode='exercise'|'rest';
export function timerValue(mode:TimerMode,baseMs:number,startedAt:number|null,now:number){const elapsed=startedAt===null?0:Math.max(0,now-startedAt);return mode==='rest'?Math.max(0,baseMs-elapsed):baseMs+elapsed}
export function formatTimer(ms:number,countdown=false){const seconds=Math.max(0,countdown?Math.ceil(ms/1000):Math.floor(ms/1000));return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
