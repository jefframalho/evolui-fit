import ts from 'typescript';import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c={};vm.createContext(c);vm.runInContext(ts.transpile(fs.readFileSync('lib/exercise-animations.ts','utf8').replace(/export /g,''),{target:ts.ScriptTarget.ES2022}),c);
const {view,segments}=c.layout(),items=c.listAnimations();
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
assert.ok(items.length>=7,'esperava as animações cadastradas');
const ids=new Set();
for(const item of items){
  assert.ok(!ids.has(item.id),'id repetido '+item.id);ids.add(item.id);
  assert.ok(item.cues.length>=3&&item.names.length>=1&&item.title&&item.muscles,'dados incompletos em '+item.id);
  for(const name of item.names)assert.equal(c.animationFor(name).id,item.id,name);
  for(let step=0;step<=20;step++){
    const p=step/20,f=c.figureAt(item,p),label=item.id+' @'+p;
    for(const [key,point] of Object.entries(f)){
      assert.ok(point.every(Number.isFinite),label+' '+key+' não finito');
      assert.ok(point[0]>=view.x+2&&point[0]<=view.x+view.width-2,label+' '+key+' fora da tela (x)');
      assert.ok(point[1]>=view.y+2&&point[1]<=view.floor+1,label+' '+key+' fora da tela (y)');
    }
    assert.ok(Math.abs(dist(f.hip,f.knee)-segments.thigh)<1e-9,label+' coxa mudou de tamanho');
    assert.ok(Math.abs(dist(f.knee,f.ankle)-segments.shin)<1e-9,label+' perna mudou de tamanho');
    assert.ok(Math.abs(dist(f.hip,f.shoulder)-segments.torso)<1e-9,label+' tronco mudou de tamanho');
    assert.ok(Math.abs(dist(f.shoulder,f.elbow)-segments.upperArm)<1e-9,label+' braço mudou de tamanho');
    assert.ok(Math.abs(dist(f.elbow,f.wrist)-segments.forearm)<1e-9,label+' antebraço mudou de tamanho');
    assert.ok(Math.abs(f.ankle[1]-100)<1e-9,label+' pé fora do chão');
    assert.ok(f.toe[1]<=view.floor,label+' pé atravessa o chão');
    assert.ok(f.head[1]<f.hip[1]||item.bench,label+' cabeça abaixo do quadril');
  }
  const start=c.figureAt(item,0),end=c.figureAt(item,1);
  assert.ok(dist(start.wrist,end.wrist)>8,item.id+' a barra/halter quase não se move');
  if(item.bench){
    assert.ok(Math.abs(start.shoulder[1]-start.hip[1])<1e-9,'no supino o tronco deve ficar deitado');
    assert.ok(start.wrist[1]<start.shoulder[1]-20,'supino: braços estendidos no início');
    assert.ok(end.wrist[1]<end.shoulder[1]&&end.wrist[1]>end.shoulder[1]-16,'supino: barra na altura do peito embaixo');
    assert.ok(end.elbow[1]<=view.floor-24+2,'supino: cotovelo não pode atravessar o banco');
  }else{
    assert.ok(start.shoulder[1]<start.hip[1]&&start.hip[1]<start.knee[1],item.id+' começa em pé');
  }
}
assert.equal(c.animationFor('Supino reto barra').id,'supino');
assert.equal(c.animationFor('  REMADA   curvada ').id,'remada-curvada');
assert.equal(c.animationFor('Desenvolvimento Halteres').id,'desenvolvimento-halteres');
assert.equal(c.animationFor('Crucifixo'),null);assert.equal(c.animationFor(''),null);
assert.equal(c.progressAt(0),0);assert.equal(c.progressAt(0.4*3.6),1);assert.equal(c.progressAt(0.5*3.6-0.01),1);assert.equal(c.progressAt(0.95*3.6),0);
assert.ok(c.progressAt(0.2*3.6)>0.4&&c.progressAt(0.2*3.6)<0.6);assert.equal(c.progressAt(3.6*5),c.progressAt(0));
console.log('PASS: '+items.length+' animações com segmentos constantes, pés no chão, dentro da tela e movimento coerente.');
