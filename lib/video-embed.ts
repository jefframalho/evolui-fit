export type VideoSource={kind:'embed'|'file'|'link';url:string;youtubeUrl?:string};
export function videoSource(raw:string):VideoSource|null{
 let u:URL;
 try{u=new URL(String(raw||'').trim())}catch{return null}
 if(u.protocol!=='https:')return null;
 const host=u.hostname.toLowerCase().replace(/^www\./,'');
 let id='';
 if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
 else if(host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com'){
  if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
  else{const match=u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);id=match?.[1]||''}
 }
 if(/^[\w-]{11}$/.test(id))return {kind:'embed',url:'https://www.youtube-nocookie.com/embed/'+id+'?rel=0&modestbranding=1&playsinline=1',youtubeUrl:'https://www.youtube.com/watch?v='+id};
 if(/\.(mp4|webm|mov)$/i.test(u.pathname))return {kind:'file',url:u.toString()};
 return {kind:'link',url:u.toString()};
}
