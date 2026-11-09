'use client';
import {useEffect,useRef,useState} from 'react';
import {Camera} from 'lucide-react';

const filters = [
  {name:'Natural', value:'none'},
  {name:'Luz de Academia', value:'brightness(1.12) contrast(1.04) saturate(1.08)'},
  {name:'Modo Atleta', value:'contrast(1.22) saturate(0.88) brightness(1.05)'},
  {name:'Golden Pump', value:'sepia(0.22) saturate(1.22) brightness(1.08)'},
  {name:'Ferro P&B', value:'grayscale(1) contrast(1.25) brightness(1.07)'},
];

export default function WorkoutStory({workoutName}:{workoutName?:string}){
  const [open,setOpen]=useState(false);
  const [photo,setPhoto]=useState<File|null>(null);
  const [caption,setCaption]=useState('');
  const [filter,setFilter]=useState(0);
  const [story,setStory]=useState<File|null>(null);
  const [message,setMessage]=useState('');
  const canvas=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    if(!open||!photo)return;
    let current=true;
    const url=URL.createObjectURL(photo);
    const image=new Image();
    image.onload=()=>{
      if(!current)return;
      const target=canvas.current;
      const context=target?.getContext('2d');
      if(!target||!context)return;
      const {width,height}=target;
      const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
      const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
      context.filter=filters[filter].value;
      context.drawImage(image,(width-w)/2,(height-h)/2,w,h);
      context.filter='none';

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
    image.src=url;
    return ()=>{current=false;URL.revokeObjectURL(url)};
  },[open,photo,filter,caption]);

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

  if(!open)return <button className="secondary" onClick={()=>{
    setCaption(workoutName ? 'Treino concluído · '+workoutName.slice(0,100)+' 💪' : 'Treino concluído 💪');
    setOpen(true);
  }}><Camera size={16}/> Tirar foto para o Story</button>;

  return <section className="panel settings">
    <h2>Foto do treino</h2>
    <label>Tirar foto<input type="file" accept="image/*" capture="user" onChange={event=>{
      const file=event.target.files?.[0];
      if(file){setPhoto(file);setStory(null);setMessage('')}
    }}/></label>
    <label>Escolher da galeria<input type="file" accept="image/*" onChange={event=>{
      const file=event.target.files?.[0];
      if(file){setPhoto(file);setStory(null);setMessage('')}
    }}/></label>
    {photo&&<>
      <label>Filtro<select value={filter} onChange={event=>{setFilter(Number(event.target.value));setStory(null)}}>
        {filters.map((option,index)=><option key={option.name} value={index}>{option.name}</option>)}
      </select></label>
      <label>Legenda<input value={caption} maxLength={120} onChange={event=>{setCaption(event.target.value);setStory(null)}}/></label>
      <canvas ref={canvas} width={1080} height={1920} aria-label="Prévia do Story" style={{display:'block',width:'100%',maxWidth:270,height:'auto',borderRadius:16}}/>
      <button className="primary" disabled={!story} onClick={share}>Compartilhar foto</button>
      <button className="secondary" disabled={!story} onClick={download}>Baixar imagem</button>
    </>}
    {message&&<p role="status">{message}</p>}
    <button className="secondary" onClick={()=>{setOpen(false);setPhoto(null);setStory(null);setFilter(0);setMessage('')}}>Fechar</button>
  </section>;
}
