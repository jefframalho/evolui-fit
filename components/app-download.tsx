'use client';
import {useEffect,useState} from 'react';
import {Download,Smartphone,LoaderCircle,RefreshCw,Check} from 'lucide-react';
type Release={url:string;size:number}|null;
let cached:Promise<Release>|null=null;
function release(){return cached??=fetch('https://api.github.com/repos/jefframalho/evolui-fit/releases/tags/android-latest',{headers:{Accept:'application/vnd.github+json'}}).then(async r=>{if(r.status===404)return null;if(!r.ok)throw Error('Falha ao verificar o APK');const d=await r.json();const a=d.assets?.find((x:any)=>x.name==='evolui-fit.apk'&&x.state==='uploaded');if(!a||!String(a.browser_download_url).startsWith('https://github.com/jefframalho/evolui-fit/releases/download/'))return null;return {url:a.browser_download_url,size:a.size}})}
export default function AppDownload({compact=false}:{compact?:boolean}){
 const [apk,setApk]=useState<Release>(null),[loading,setLoading]=useState(true),[error,setError]=useState(false),[installed,setInstalled]=useState(false);
 async function load(){setLoading(true);setError(false);try{setApk(await release())}catch{setError(true)}finally{setLoading(false)}}
 useEffect(()=>{setInstalled(navigator.userAgent.includes('EvoluiFitAndroid'));load()},[]);
 if(installed)return compact?<span className="installed-badge"><Check size={15}/> App Android</span>:null;
 return <div className={'app-download '+(compact?'compact-download':'')}>
 {!compact&&<div className="download-copy"><span className="phone-icon"><Smartphone size={27}/></span><div><div className="eyebrow">EVOLUI FIT NO SEU CELULAR</div><h3>Sua evolução vai com você.</h3><p>Baixe o app Android e tenha seu treino a um toque.</p></div></div>}
 <div className="download-action">{apk?<a className="apk-link" href={apk.url} download="evolui-fit.apk"><Download size={17}/><span>Baixar APK{!compact&&' Android'}</span></a>:<button className="apk-link pending" type="button" disabled={loading} onClick={()=>{cached=null;load()}}>{loading?<LoaderCircle size={16} className="spin"/>:<RefreshCw size={16}/>}<span>{loading?'Verificando APK…':error?'Verificar download':'Verificar APK'}</span></button>}{!compact&&<small>{apk?`Versão de teste · ${(apk.size/1048576).toFixed(1)} MB · Android 8+`:'O download será liberado quando a versão Android estiver pronta.'}</small>}</div>
 </div>
}
