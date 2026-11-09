export type Point=[number,number];
export type Pose={thigh:number;shin:number;torso:number;upperArm:number;forearm:number};
export type Joints={hip:Point;knee:Point;ankle:Point;toe:Point;shoulder:Point;elbow:Point;wrist:Point;head:Point;prop:Point};
export type ExerciseAnimation={id:string;title:string;muscles:string;anchor:'ankle'|'hip';at:Point;prop:'barbell'|'dumbbell';bench:boolean;from:Pose;to:Pose;cues:string[];names:string[]};
export const VIEW={x:0,y:-14,width:160,height:122,floor:104};
export const SEGMENTS={thigh:24,shin:22,torso:30,upperArm:14,forearm:13,neck:3,head:5.5,foot:8};
const STAND:Point=[70,100];
const LYING_HIP:Point=[80,78];
const standing={thigh:180,shin:180,torso:0};
const ANIMATIONS:ExerciseAnimation[]=[
 {id:'agachamento',title:'Agachamento livre',muscles:'Coxas e glúteos',anchor:'ankle',at:STAND,prop:'barbell',bench:false,
  from:{...standing,torso:3,upperArm:220,forearm:32},to:{thigh:102,shin:205,torso:42,upperArm:220,forearm:32},
  cues:['Pés na largura dos ombros, barra apoiada nas costas.','Desça com o tronco firme, sem arredondar a coluna.','Joelhos acompanham a direção dos pés.','Suba empurrando o chão com o pé inteiro.'],
  names:['agachamento livre','agachamento livre barra','agachamento com barra','agachamento']},
 {id:'supino',title:'Supino reto com barra',muscles:'Peito, ombros e tríceps',anchor:'hip',at:LYING_HIP,prop:'barbell',bench:true,
  from:{thigh:90,shin:180,torso:270,upperArm:0,forearm:0},to:{thigh:90,shin:180,torso:270,upperArm:100,forearm:0},
  cues:['Pés firmes no chão e costas apoiadas no banco.','Desça a barra de forma controlada até a altura do peito.','Antebraços na vertical durante todo o movimento.','Empurre a barra para cima sem tirar o quadril do banco.'],
  names:['supino reto barra','supino reto','supino reto com barra']},
 {id:'stiff',title:'Stiff',muscles:'Posterior da coxa e glúteos',anchor:'ankle',at:STAND,prop:'barbell',bench:false,
  from:{thigh:175,shin:185,torso:0,upperArm:180,forearm:180},to:{thigh:156,shin:184,torso:72,upperArm:212,forearm:212},
  cues:['Joelhos levemente flexionados e barra rente às pernas.','Leve o quadril para trás, como quem fecha uma porta com o glúteo.','Mantenha a coluna neutra; desça até sentir o alongamento atrás da coxa.','Suba empurrando o quadril para frente.'],
  names:['stiff','stiff com barra','levantamento terra romeno']},
 {id:'rosca-direta',title:'Rosca direta',muscles:'Bíceps',anchor:'ankle',at:STAND,prop:'barbell',bench:false,
  from:{...standing,upperArm:184,forearm:182},to:{...standing,upperArm:184,forearm:28},
  cues:['Cotovelos junto ao corpo, sem balançar o tronco.','Suba a barra até contrair o bíceps.','Desça devagar, até quase estender os braços.'],
  names:['rosca direta','rosca direta barra','rosca direta com barra']},
 {id:'desenvolvimento',title:'Desenvolvimento com barra',muscles:'Ombros e tríceps',anchor:'ankle',at:STAND,prop:'barbell',bench:false,
  from:{...standing,upperArm:160,forearm:0},to:{...standing,torso:-4,upperArm:4,forearm:2},
  cues:['Barra na altura dos ombros e abdômen contraído.','Empurre a barra para cima, passando rente ao rosto.','Estenda os braços sem arquear demais a lombar.','Desça de forma controlada até os ombros.'],
  names:['desenvolvimento barra','desenvolvimento com barra','desenvolvimento militar']},
 {id:'desenvolvimento-halteres',title:'Desenvolvimento com halteres',muscles:'Ombros e tríceps',anchor:'ankle',at:STAND,prop:'dumbbell',bench:false,
  from:{...standing,upperArm:160,forearm:0},to:{...standing,torso:-4,upperArm:4,forearm:2},
  cues:['Halteres na altura dos ombros e abdômen contraído.','Empurre os halteres para cima até estender os braços.','Desça de forma controlada até os ombros.'],
  names:['desenvolvimento halteres','desenvolvimento com halteres']},
 {id:'remada-curvada',title:'Remada curvada',muscles:'Costas e bíceps',anchor:'ankle',at:STAND,prop:'barbell',bench:false,
  from:{thigh:152,shin:186,torso:65,upperArm:195,forearm:195},to:{thigh:152,shin:186,torso:65,upperArm:262,forearm:188},
  cues:['Joelhos flexionados e tronco inclinado com a coluna reta.','Puxe a barra em direção ao abdômen, levando os cotovelos para trás.','Aperte as escápulas no final do movimento.','Desça devagar, sem levantar o tronco.'],
  names:['remada curvada','remada curvada barra','remada curvada com barra']}
];
const normalize=(text:string)=>String(text||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
export function layout(){return {view:VIEW,segments:SEGMENTS}}
export function listAnimations():ExerciseAnimation[]{return ANIMATIONS}
export function animationFor(name:string):ExerciseAnimation|null{
 const wanted=normalize(name);
 if(!wanted)return null;
 return ANIMATIONS.find(item=>item.names.includes(wanted))||null;
}
function direction(degrees:number,length:number):Point{const radians=degrees*Math.PI/180;return [Math.sin(radians)*length,-Math.cos(radians)*length]}
function add(a:Point,b:Point):Point{return [a[0]+b[0],a[1]+b[1]]}
export function figureAt(animation:ExerciseAnimation,progress:number):Joints{
 const p=Math.min(1,Math.max(0,progress));
 const angle=(key:keyof Pose)=>animation.from[key]+(animation.to[key]-animation.from[key])*p;
 const hip:Point=[0,0];
 const knee=add(hip,direction(angle('thigh'),SEGMENTS.thigh));
 const ankle=add(knee,direction(angle('shin'),SEGMENTS.shin));
 const shoulder=add(hip,direction(angle('torso'),SEGMENTS.torso));
 const elbow=add(shoulder,direction(angle('upperArm'),SEGMENTS.upperArm));
 const wrist=add(elbow,direction(angle('forearm'),SEGMENTS.forearm));
 const head=add(shoulder,direction(angle('torso'),SEGMENTS.neck+SEGMENTS.head));
 const toe=add(ankle,[SEGMENTS.foot,3.5]);
 const reference=animation.anchor==='ankle'?ankle:hip;
 const shift:Point=[animation.at[0]-reference[0],animation.at[1]-reference[1]];
 const move=(point:Point):Point=>add(point,shift);
 return {hip:move(hip),knee:move(knee),ankle:move(ankle),toe:move(toe),shoulder:move(shoulder),elbow:move(elbow),wrist:move(wrist),head:move(head),prop:move(wrist)};
}
const CYCLE_SECONDS=3.6;
export function progressAt(seconds:number):number{
 const u=((seconds%CYCLE_SECONDS)+CYCLE_SECONDS)%CYCLE_SECONDS/CYCLE_SECONDS;
 const ease=(x:number)=>(1-Math.cos(Math.PI*x))/2;
 if(u<0.4)return ease(u/0.4);
 if(u<0.5)return 1;
 if(u<0.9)return ease(1-(u-0.5)/0.4);
 return 0;
}
