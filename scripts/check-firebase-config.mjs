import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('public/firebase-config.json','utf8'));
for(const key of ['apiKey','authDomain','projectId','appId'])if(typeof config[key]!=='string'||!config[key].trim())throw Error(`Preencha ${key} em public/firebase-config.json antes de publicar o sistema para outras pessoas.`);
console.log('Configuração pública do Firebase preenchida.');
