import {z} from 'zod';
const number=(max:number,min=0,integer=false)=>z.preprocess(v=>v===''||v===undefined?undefined:typeof v==='string'?Number(v):v,integer?z.number().finite().min(min).max(max).int():z.number().finite().min(min).max(max));
const base={notes:z.string().max(2000).optional()};
const schemas={
 schedule:z.object({...base,title:z.string().trim().min(1).max(100),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),duration:number(1440,5,true),type:z.enum(['Treino','Cardio','Descanso','Outro']),status:z.enum(['planned','done']),workoutId:z.string().max(128).optional()}),
 workout:z.object({...base,name:z.string().trim().min(1).max(100),duration:number(1440,1,true),exercises:z.array(z.object({name:z.string().trim().min(1).max(100),sets:number(2000,1,true),reps:number(2000,1,true),load:number(2000)})).min(1).max(50)}),
 measure:z.object({...base,weight:number(1000,.1).optional(),waist:number(1000,.1).optional(),chest:number(1000,.1).optional(),arm:number(1000,.1).optional(),thigh:number(1000,.1).optional(),hip:number(1000,.1).optional()}).refine(d=>Object.keys(d).some(k=>k!=='notes')),
 habit:z.object({...base,water:number(20).optional(),sleep:number(24,.1).optional(),mood:z.enum(['Com energia','Bem','Cansado','Desanimado']).optional(),meals:z.string().max(3000).optional()}).refine(d=>Object.values(d).some(v=>v!==''&&v!==undefined)),
 goal:z.object({...base,targetWeight:number(1000,.1).optional(),weekly:number(14,1,true).optional()}).refine(d=>d.targetWeight!==undefined||d.weekly!==undefined)
};
export const RecordDraftSchema=z.object({kind:z.enum(['workout','measure','habit','goal','schedule']),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s),data:z.record(z.unknown())}).transform((draft,ctx)=>{const raw={...draft.data};for(const key of Object.keys(raw))if(raw[key]===''||raw[key]===undefined)delete raw[key];const parsed=schemas[draft.kind].safeParse(raw);if(!parsed.success){ctx.addIssue({code:'custom',message:'Dados do registro inválidos'});return z.NEVER}return {...draft,data:parsed.data}});
