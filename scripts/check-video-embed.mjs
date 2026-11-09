import ts from 'typescript';import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c={};vm.createContext(c);vm.runInContext(ts.transpile(fs.readFileSync('lib/video-embed.ts','utf8').replace(/export /g,''),{target:ts.ScriptTarget.ES2022}),c);
const id='dQw4w9WgXcQ',embed='https://www.youtube-nocookie.com/embed/'+id+'?rel=0&modestbranding=1&playsinline=1';
for(const url of ['https://www.youtube.com/watch?v='+id,'https://youtu.be/'+id,'https://m.youtube.com/watch?v='+id+'&t=3','https://www.youtube.com/shorts/'+id,'https://www.youtube.com/embed/'+id,'https://www.youtube-nocookie.com/embed/'+id]){
  const result=c.videoSource(url);assert.equal(result.kind,'embed',url);assert.equal(result.url,embed,url);assert.equal(result.youtubeUrl,'https://www.youtube.com/watch?v='+id,url);
}
assert.deepEqual(JSON.parse(JSON.stringify(c.videoSource('https://exemplo.com/agachamento.mp4'))),{kind:'file',url:'https://exemplo.com/agachamento.mp4'});
assert.equal(c.videoSource('https://exemplo.com/pagina').kind,'link');
assert.equal(c.videoSource('http://www.youtube.com/watch?v='+id),null);
assert.equal(c.videoSource('javascript:alert(1)'),null);
assert.equal(c.videoSource('https://www.youtube.com/watch?v=curto').kind,'link');
assert.equal(c.videoSource(''),null);assert.equal(c.videoSource('não é endereço'),null);
console.log('PASS: conversão de links de vídeo (YouTube, arquivo e link externo).');
