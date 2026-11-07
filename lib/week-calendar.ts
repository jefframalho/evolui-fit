export function fitnessToday(){return new Date().toLocaleDateString('en-CA',{timeZone:'America/Fortaleza'})}
export function addDays(date:string,days:number){const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10)}
export function mondayOf(date:string){const value=new Date(date+'T12:00:00Z');return addDays(date,-((value.getUTCDay()+6)%7))}
export function weekDays(date:string){const start=mondayOf(date);return Array.from({length:7},(_,i)=>addDays(start,i))}
export function weekLabel(start:string){const format=(s:string)=>new Date(s+'T12:00:00Z').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',timeZone:'UTC'});return `${format(start)} — ${format(addDays(start,6))}`}
export function dayLabel(date:string){return new Date(date+'T12:00:00Z').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'})}
