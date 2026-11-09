'use client';
import {useEffect,useRef,useState} from 'react';
import {Camera} from 'lucide-react';

const filters = [
  {name:'Natural', value:'none'},
  {name:'Luz de Academia', value:'brightness(1.12) contrast(1.04) saturate(1.08)'},
  {name:'Modo Atleta', value:'contrast(1.22) saturate(0.88) brightness(1.05)'},
  {name:'Golden Pump', value:'sepia(0.22) saturate(1.22) brightness(1.08)'},
  {name:'Ferro P&B', value:'grayscale(1) contrast(1.25) brightness(1.07)'},
  {name:'Selfie Suave', value:'brightness(1.14) contrast(0.91) saturate(1.08)'},
  {name:'Brilho Pós-Treino', value:'brightness(1.18) contrast(1.08) saturate(1.18)'},
  {name:'Luz de Estúdio', value:'brightness(1.10) contrast(1.14) saturate(0.94)'},
  {name:'Definição Pro', value:'contrast(1.36) brightness(1.03) saturate(0.82)'},
  {name:'Sombra de Ferro', value:'brightness(0.86) contrast(1.32) saturate(0.75)'},
  {name:'Aço Frio', value:'sepia(0.16) hue-rotate(165deg) saturate(0.75) contrast(1.16)'},
  {name:'Bronze', value:'sepia(0.32) saturate(1.25) contrast(1.08)'},
  {name:'Âmbar', value:'sepia(0.48) saturate(1.42) brightness(1.06)'},
  {name:'Rosé', value:'sepia(0.25) hue-rotate(320deg) saturate(1.25) brightness(1.08)'},
  {name:'Energia Neon', value:'saturate(1.55) contrast(1.16) brightness(1.08)'},
  {name:'Filme Vintage', value:'sepia(0.38) saturate(0.82) contrast(0.89) brightness(1.11)'},
  {name:'P&B Suave', value:'grayscale(1) contrast(0.87) brightness(1.19)'},
  {name:'P&B Noturno', value:'grayscale(1) contrast(1.48) brightness(0.83)'},
];

export default function WorkoutStory({workoutName,exerciseCount}:{workoutName?:string;exerciseCount?:number}){
  const [card,setCard]=useState(false);
  const [open,setOpen]=useState(false);
  const [photo,setPhoto]=useState<File|null>(null);
  const [caption,setCaption]=useState('');
  const [filter,setFilter]=useState(0);
  const [story,setStory]=useState<File|null>(null);
  const [message,setMessage]=useState('');
  const [cameraOpen,setCameraOpen]=useState(false);
  const [cameraReady,setCameraReady]=useState(false);
  const [facing,setFacing]=useState<'user'|'environment'>('user');
  const video=useRef<HTMLVideoElement>(null);
  const canvas=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    if(!cameraOpen)return;
    let active=true;
    let stream:MediaStream|undefined;
    async function startCamera(){
      try{
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing}},audio:false});
        if(!active){stream.getTracks().forEach(track=>track.stop());return}
        const preview=video.current;
        if(!preview)return;
        preview.srcObject=stream;
        await preview.play();
      }catch(error){
        if(!active)return;
        setCameraOpen(false);
        setMessage(error instanceof DOMException&&error.name==='NotAllowedError'
          ? 'Permita o acesso à câmera nas configurações do aplicativo ou do site e tente novamente.'
          : 'Não foi possível abrir a câmera. Você também pode escolher uma foto da galeria.');
      }
    }
    void startCamera();
    return ()=>{active=false;stream?.getTracks().forEach(track=>track.stop())};
  },[cameraOpen,facing]);

  function capturePhoto(){
    const preview=video.current;
    if(!preview?.videoWidth||!preview.videoHeight)return;
    const frame=document.createElement('canvas');
    frame.width=preview.videoWidth;
    frame.height=preview.videoHeight;
    const context=frame.getContext('2d');
    if(!context)return;
    context.drawImage(preview,0,0);
    frame.toBlob(blob=>{
      if(!blob)return;
      setPhoto(new File([blob],'treino.jpg',{type:'image/jpeg'}));
      setStory(null);
      setCameraReady(false);
      setCameraOpen(false);
    },'image/jpeg',0.93);
  }

  useEffect(()=>{
    if(!open||(!photo&&!card))return;
    let current=true;
    const url=photo&&!card?URL.createObjectURL(photo):null;
    const image=new Image();
    const render=()=>{
      if(!current)return;
      const target=canvas.current;
      const context=target?.getContext('2d');
      if(!target||!context)return;
      const {width,height}=target;
      if(url){
      const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
      const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
      context.filter=filters[filter].value;
      context.drawImage(image,(width-w)/2,(height-h)/2,w,h);
      context.filter='none';
      }else{
        context.fillStyle='#172016';
        context.fillRect(0,0,width,height);
        context.fillStyle='#ceeb58';
        context.textAlign='center';
        context.font='bold 55px system-ui';
        context.fillText('TREINO CONCLUÍDO',width/2,730);
        context.fillStyle='#fff';
        context.font='bold 78px system-ui';
        context.fillText(workoutName||'Meu treino',width/2,900,900);
        context.font='42px system-ui';
        context.fillText(exerciseCount+' '+(exerciseCount===1?'exercício concluído':'exercícios concluídos'),width/2,1040);
      }

      const shade=context.createLinearGradient(0,1160,0,height);
      shade.addColorStop(0,'transparent');
      shade.addColorStop(1,'#11170a');
      context.fillStyle=shade;
      context.fillRect(0,1160,width,height-1160);
      context.textAlign='center';
      context.font='bold 48px system-ui';
      context.fillStyle='#fff';
      const lines:string[]=[];
      let line='';
      for(const word of caption.trim().split(/\s+/)){
        const next=line ? line+' '+word : word;
        if(line&&context.measureText(next).width>900){lines.push(line);line=word}
        else line=next;
      }
      if(line)lines.push(line);
      lines.forEach((text,index)=>context.fillText(text,width/2,1640-(lines.length-index-1)*60,900));
      context.font='bold 28px system-ui';
      context.fillStyle='#ceeb58';
      context.fillText('EVOLUI FIT',width/2,1710);
      target.toBlob(blob=>{
        if(!current)return;
        if(blob)setStory(new File([blob],'evolui-fit-story.jpg',{type:'image/jpeg'}));
        else setMessage('Não foi possível gerar a imagem.');
      },'image/jpeg',0.93);
    };
    image.onerror=()=>{if(current)setMessage('Não foi possível abrir a foto. Experimente uma imagem JPG ou PNG.')};
    if(url){image.onload=render;image.src=url}else render();
    return ()=>{current=false;if(url)URL.revokeObjectURL(url)};
  },[open,photo,filter,caption,card,workoutName,exerciseCount]);

  async function share(){
    if(!story)return;
    if(!navigator.canShare?.({files:[story]})){
      setMessage('Baixe a imagem e selecione-a na galeria ao criar seu Story.');
      return;
    }
    try{await navigator.share({files:[story]})}
    catch(error){if(!(error instanceof DOMException&&error.name==='AbortError'))setMessage('Use Baixar imagem para publicar pela galeria.')}
  }

  function download(){
    if(!story)return;
    const url=URL.createObjectURL(story);
    const link=document.createElement('a');
    link.href=url;
    link.download=story.name;
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }

  if(!open)return <><button className="secondary" onClick={()=>{
    setCaption(workoutName ? 'Treino concluído · '+workoutName.slice(0,100)+' 💪' : 'Treino concluído 💪');
    setOpen(true);
  }}><Camera size={16}/> Tirar foto para o Story</button>{exerciseCount!==undefined&&<button className="secondary" onClick={()=>{setCard(true);setCaption('');setOpen(true)}}>Criar cartão sem foto</button>}</>;

  return <section className="panel settings">
    <h2>Foto do treino</h2>
    {!card&&(cameraOpen?<div>
      <video ref={video} autoPlay muted playsInline onPlaying={()=>setCameraReady(true)}
        style={{display:'block',width:'100%',maxWidth:420,borderRadius:16}} aria-label="Prévia da câmera"/>
      <button className="primary" disabled={!cameraReady} onClick={capturePhoto}><Camera size={16}/> Capturar foto</button>
      <button className="secondary" onClick={()=>{setCameraReady(false);setFacing(facing==='user'?'environment':'user')}}>Trocar câmera</button>
      <button className="secondary" onClick={()=>{setCameraReady(false);setCameraOpen(false)}}>Cancelar câmera</button>
    </div>:<button className="primary" onClick={()=>{setMessage('');setCameraReady(false);setCameraOpen(true)}}><Camera size={16}/> Abrir câmera</button>)}
    {!card&&!cameraOpen&&<label>Câmera do celular
      <input type="file" accept="image/*" capture="environment" onChange={event=>{
        const file=event.target.files?.[0];
        if(file){setPhoto(file);setStory(null);setMessage('')}
        event.target.value='';
      }}/>
    </label>}
    {!card&&<label>Escolher da galeria<input type="file" accept="image/*" onChange={event=>{
      const file=event.target.files?.[0];
      if(file){setPhoto(file);setStory(null);setMessage('')}
    }}/></label>}
    {(photo||card)&&<>
      {!card&&<label>Filtro da foto · {filters.length} opções<select value={filter} onChange={event=>{setFilter(Number(event.target.value));setStory(null)}}>
        {filters.map((option,index)=><option key={option.name} value={index}>{option.name}</option>)}
      </select></label>}
      <label>Legenda<input value={caption} maxLength={120} onChange={event=>{setCaption(event.target.value);setStory(null)}}/></label>
      <canvas ref={canvas} width={1080} height={1920} aria-label="Prévia do Story" style={{display:'block',width:'100%',maxWidth:270,height:'auto',borderRadius:16}}/>
      <button className="primary" disabled={!story} onClick={share}>Compartilhar foto</button>
      <button className="secondary" disabled={!story} onClick={download}>Baixar imagem</button>
    </>}
    {message&&<p role="status">{message}</p>}
    <button className="secondary" onClick={()=>{setOpen(false);setCard(false);setCameraOpen(false);setCameraReady(false);setPhoto(null);setStory(null);setFilter(0);setMessage('')}}>Fechar</button>
  </section>;
}
