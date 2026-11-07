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

## Cronômetro de exercícios e intervalos

Abra **Treino ao vivo** ou **Meus treinos → Treinar agora**. Use Iniciar/Pausar para o exercício e Concluir série para começar o intervalo. O descanso pode ser escolhido entre os atalhos ou personalizado de 5 a 3.600 segundos. O tempo é calculado por timestamps, evitando atraso por contagem de ticks. Ao terminar o intervalo, a interface avisa, tenta emitir três sinais sonoros e vibrar quando houver suporte. Mantenha o aplicativo aberto para ouvir o aviso; não há notificações garantidas em segundo plano. Trocar de exercício zera o cronômetro após confirmação se houver uma contagem em andamento. Os tempos não são salvos automaticamente como registros de treino.

`pnpm run test:timer` verifica pausa, contagem regressiva, retorno após inatividade e formatação. A prévia `web/qa.html` usa somente dados sintéticos no servidor de desenvolvimento e não é incluída na compilação de produção.

## Aplicativo Android

O projeto em `android/` gera um APK de teste para Android 8+. Ele abre o sistema por HTTPS em um WebView com armazenamento de sessão e acesso online ao Firebase. Não utiliza dados de demonstração. O workflow **Gerar APK Android** compila, calcula SHA-256 e publica o arquivo na release **android-latest**. O botão Baixar APK, na entrada e no painel, só aparece como download quando o arquivo público existe.

O APK precisa de internet. A tela permanece ligada enquanto o app está aberto; o cronômetro não é um serviço em segundo plano. Esta é uma compilação de teste com assinatura de desenvolvimento, sem publicação na Play Store. A assinatura pode mudar entre compilações; pode ser necessário desinstalar a versão anterior para atualizar. Os registros online permanecem na conta Firebase. Para distribuição comercial com atualizações contínuas, configure uma assinatura de produção mantida fora do repositório.

## Limites

Sem fotos, modo offline ou área de personal nesta versão. A verificação de e-mail pode ser enviada, mas não bloqueia o uso. A publicação do código não comprova que as regras e os provedores estão configurados no Firebase real: valide com duas contas antes de divulgar.
