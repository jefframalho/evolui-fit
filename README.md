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

## Agenda semanal

A agenda abre pelo menu ou pelo atalho no painel. Permite agendar, editar, concluir/reabrir e excluir compromissos, navegar de segunda a domingo, definir horário e duração e vincular uma ficha de treino ao cronômetro. Não envia notificações nem repete os eventos automaticamente. No celular, Evolução, Hábitos, Histórico e Metas ficam em **Mais**.

**Ativação necessária:** publique a versão atual de `firestore.rules` no console Firebase. A agenda acrescenta o tipo `schedule` e permite editar apenas esses registros, mantendo o acesso restrito ao próprio usuário. As regras antigas recusam novos agendamentos; o sistema mostra o erro sem apagar os outros dados. A publicação pelo GitHub Pages não atualiza as regras do Firebase.

## Portal do instrutor e vínculo do aluno

O portal profissional fica em **#instrutor**, com entrada e cadastro separados visualmente. Usa o Firebase Authentication da mesma aplicação. Cada conta pode criar seu próprio espaço profissional, isolado pelo UID; entrar como instrutor não concede acesso global nem aos registros pessoais dos alunos.

No portal, cadastre o aluno com nome e e-mail, monte fichas completas (exercícios, séries, repetições, carga, descanso, cadência e orientações) e registre uma avaliação mensal (peso, medidas, percentual de gordura e observações). Uma avaliação é mantida por mês, com opção de edição. A variação exibida compara medidas efetivamente registradas.

Para o aluno acessar a prescrição no próprio login, gere um código de convite e compartilhe-o por sua conta. O aluno cria sua própria senha, verifica o e-mail do mesmo endereço cadastrado e aceita o convite em **Meu instrutor**. O código expira após 7 dias; é necessário um vínculo explícito. O aluno pode revogar o vínculo. O aplicativo não envia convites por mensagem automaticamente.

As novas regras de `firestore.rules` devem ser publicadas no Firebase para ativar tanto o portal profissional quanto a agenda. Os testes do emulador verificam isolamento entre instrutores, bloqueio de e-mail não verificado, vínculo por convite, leitura das fichas e avaliações, bloqueio de acesso aos registros pessoais e revogação.

## Mensalidade profissional — R$ 100

A gestão de alunos, fichas, convites e avaliações passa a exigir assinatura profissional de R$100 por mês, sem período gratuito e sem carência. O portal pessoal dos alunos não recebe essa cobrança. A validade é verificada tanto na interface quanto nas regras do Firestore com `request.time`; não depende de um cron job ou do relógio do aparelho. No vencimento ou bloqueio administrativo, as operações profissionais são recusadas e os dados são preservados. As fichas do acompanhamento do instrutor também exigem que a assinatura dele esteja ativa.

O modelo é **Pix com confirmação manual**, como o utilizado no Clinix. Não há cobrança no cartão, débito automático, consulta bancária automática ou webhook de confirmação. O profissional paga no banco e envia um aviso. Somente o administrador confere o extrato e confirma o recebimento; o aviso sozinho nunca libera a assinatura. O pagamento registrado acrescenta um mês de calendário a partir de agora ou do vencimento futuro, preservando dias já pagos. O identificador bancário gera uma chave de idempotência para evitar registrar o mesmo pagamento mais de uma vez. O histórico de aprovações é imutável pelo aplicativo.

### Ativação pelo proprietário

1. Publique a versão atual de `firestore.rules` no projeto `evoluir-a1037`. A publicação no GitHub Pages não atualiza as regras. Sem essa publicação, o bloqueio no banco e as novas coleções de cobrança ainda não estarão ativos.
2. Entre em **#admin** com a conta **jeffersonramalhopb@gmail.com** e verifique o e-mail. A autorização administrativa exige o e-mail verificado nas regras, e não um campo de perfil editável.
3. Em **Configurar Pix**, preencha e salve a chave de recebimento, nome, cidade e suporte opcional. Nenhuma chave Pix do Clinix foi copiada para este repositório. A chave cadastrada será apresentada aos profissionais no pagamento. Use CPF/CNPJ sem pontuação e telefone no formato internacional com +55.
4. Os profissionais aparecem no painel quando abrirem a área profissional. Para liberar, confira o crédito de R$100 no extrato e registre o identificador único da transação.
5. Teste com uma conta profissional distinta da administradora, que é isenta da mensalidade. Confira bloqueio antes do pagamento, liberação após sua confirmação e bloqueio no vencimento. Os testes automáticos utilizam somente dados fictícios no emulador.

O painel administrativo não concede acesso aos prontuários/medidas dos alunos de outros profissionais; ele controla os dados de assinatura e cobrança. A confirmação no banco e a instalação do APK não foram automatizadas.
