import type {User} from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';
export type FitnessEntry={id:string;kind:string;date:string;data:Record<string,any>;createdAt?:number};
export type RecordDraft=Pick<FitnessEntry,'kind'|'date'|'data'>;
export interface FitnessBackend{list():Promise<FitnessEntry[]>;save(draft:RecordDraft):Promise<void>;remove(id:string):Promise<void>}
export function firebaseBackend(db:Firestore,user:User):FitnessBackend{
 const uid=user.uid;
 async function collectionRef(){const {collection}=await import('firebase/firestore');return collection(db,'users',uid,'records')}
 return {
  async list(){const {getDocs,query,orderBy}=await import('firebase/firestore');const snapshot=await getDocs(query(await collectionRef(),orderBy('date','desc')));return snapshot.docs.map(doc=>{const row=doc.data();return {id:doc.id,kind:row.kind,date:row.date,data:row.data,createdAt:row.createdAt?.toMillis?.()||0}}).sort((a,b)=>b.date.localeCompare(a.date)||(b.createdAt-a.createdAt))},
  async save(draft){const {addDoc,serverTimestamp}=await import('firebase/firestore');const {RecordDraftSchema}=await import('./record-validation');const clean=RecordDraftSchema.parse(draft);await addDoc(await collectionRef(),{...clean,createdAt:serverTimestamp()})},
  async remove(id){if(!id||id.includes('/'))throw Error('Registro inválido.');const {deleteDoc,doc}=await import('firebase/firestore');await deleteDoc(doc(db,'users',uid,'records',id))}
 }
}
export const legacyBackend:FitnessBackend={
 async list(){const r=await fetch('/api/records',{cache:'no-store'});const d:any=await r.json();if(!r.ok)throw Error(d.error||'Não foi possível carregar os registros.');return d},
 async save(draft){const r=await fetch('/api/records',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});const d:any=await r.json();if(!r.ok)throw Error(d.error||'Não foi possível salvar.')},
 async remove(id){const r=await fetch('/api/records?id='+encodeURIComponent(id),{method:'DELETE'});if(!r.ok)throw Error('Não foi possível excluir.')}
};
export function friendlyError(error:any):string{
 const code=error?.code;
 const messages:Record<string,string>={
 'auth/invalid-credential':'E-mail ou senha incorretos.',
 'auth/user-not-found':'E-mail ou senha incorretos.',
 'auth/wrong-password':'E-mail ou senha incorretos.',
 'auth/email-already-in-use':'Não foi possível criar a conta com esse e-mail. Tente entrar ou recuperar a senha.',
 'auth/weak-password':'Use uma senha com pelo menos 8 caracteres.',
 'auth/invalid-email':'Informe um e-mail válido.',
 'auth/too-many-requests':'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
 'auth/network-request-failed':'Não foi possível conectar. Confira sua internet.',
 'auth/operation-not-allowed':'O acesso por e-mail ainda precisa ser habilitado pelo responsável do sistema.',
 'auth/unauthorized-domain':'Este endereço ainda precisa ser autorizado pelo responsável do sistema.',
 'auth/invalid-api-key':'O serviço de login está em configuração. Tente novamente mais tarde.',
 'permission-denied':'Não foi possível acessar seus registros. As permissões do banco precisam ser verificadas.',
 'unavailable':'Sem conexão com o banco. Tente novamente quando a internet voltar.'
 };
 if(error?.name==='ZodError')return 'Confira os valores preenchidos e tente novamente.';
 return messages[code]||error?.message||'Não foi possível concluir. Tente novamente.';
}
