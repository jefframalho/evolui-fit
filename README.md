# Evolui Fit

App web para acompanhar treinos, cargas, peso, medidas, hábitos e metas. Cadastro, login e recuperação de senha pelo Firebase Authentication. Registros individuais no Cloud Firestore.

## Publicar

1. Em **Settings → Pages → Source**, selecione **GitHub Actions**.
2. Em **Actions**, execute **Publicar Evolui Fit no GitHub Pages**.
3. Abra o endereço retornado pela publicação.
4. Em **Firebase → Authentication → Settings → Authorized domains**, adicione **jefframalho.github.io**.
5. Teste com duas contas: os registros da conta A devem permanecer invisíveis para a conta B.

Configuração pública em `public/firebase-config.json`, projeto **evoluir-a1037**. O proprietário informou que habilitou E-mail/senha e publicou as regras. A integração real ainda precisa ser verificada após a publicação. Nunca adicione senhas ou chaves de conta de serviço ao código. Analytics não é inicializado.

## Desenvolvimento

Use Node.js 22.13+, pnpm 11.25.0 e Java 21+ para o emulador Firestore.

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run test:validation
pnpm run test:rules
pnpm run dev
```

`pnpm run build` gera `web-dist/` com caminhos relativos para funcionar no subdiretório do GitHub Pages. O workflow verifica os tipos, a validação e as regras no emulador antes da publicação.

Firebase Hosting também está preparado: após autenticar a CLI, execute `pnpm run build` e `pnpm exec firebase deploy --only firestore:rules,hosting --project evoluir-a1037`.

## Dados

Cada usuário utiliza `users/{uid}/records/{id}`. As regras em `firestore.rules` limitam o acesso ao dono. Nesta versão, é possível criar, consultar e excluir registros. O painel exporta os dados pessoais em JSON.

Os registros do protótipo anterior com acesso pelo ChatGPT continuam no banco original. Não são apagados nem migrados automaticamente para contas Firebase; exporte-os antes da mudança caso existam.

## Limites

App web com atalho na tela inicial. Sem APK, fotos, modo offline ou área de personal nesta versão. A verificação de e-mail pode ser enviada, mas não bloqueia o uso. A publicação do código não comprova que as regras e os provedores estão configurados no Firebase real: valide com duas contas antes de divulgar.
