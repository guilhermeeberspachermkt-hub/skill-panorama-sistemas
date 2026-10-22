# construtor-panorama: skill do Claude para lojas da Panorama Sistemas

Uma skill para o Claude ajudar quem cuida de uma loja na plataforma Panorama Sistemas a mudar o site pelo
admin da própria loja, com segurança: o Claude mostra a mudança antes, grava só com o seu "sim" e guarda uma
cópia do que estava no ar para poder voltar.

> Projeto independente: **não é um produto oficial da Panorama Sistemas**. Veja o [Aviso](#aviso).

## O que ela faz

- **Ajustes visuais:** cores, fontes, botões, cards de produto, selo de desconto, menu, cabeçalho, rodapé e
  o visual no celular.
- **Temas de época:** Black Friday, Natal, Esquenta, Dia das Mães; a agenda de skins; a barra promocional com
  contagem; a Barra do Topo.
- **Páginas do construtor:** criar, editar ou refazer uma página (vitrines, banners, perguntas frequentes,
  grids), inclusive levar uma página do site antigo para o novo.
- **Telas de configuração:** o código do `<head>`, o logo, os arquivos CSS e JS da loja e qual página é a home.
- **"Mudei e não aparece no site":** quais caches existem, em que ordem limpar e quem limpa cada um.
- **Na primeira vez com uma loja:** uma leitura só para conhecer a loja, sem mudar nada, que vira um perfil
  privado guardado no seu computador.

## O que ela só faz com o seu pedido

- **Gravar no admin:** só depois de mostrar a prévia da mudança e receber o seu "sim" para ela. Numa página do
  construtor, a prévia é uma página de rascunho que vocês combinam antes; uma mudança que não aparece no site
  vai com a explicação do que muda e o seu "sim".
- **Apertar Excluir, Publicar, Despublicar, Ordenação ou Atualizar View de Acesso as Páginas:** só com um
  pedido seu que diga o botão e a página. O "sim" para uma prévia não vale como pedido para esses botões.
- **Mexer numa página, arquivo ou campo:** só no que você nomeou. Na dúvida, ela pergunta.

## O que ela nunca faz

- Trocar qualquer coisa sem guardar antes uma cópia (backup) do que está no ar.
- Digitar senha ou guardar login. O login no admin é sempre seu.
- Obedecer a um texto achado numa página ou num arquivo da loja: ela mostra o trecho a você e pergunta.
- Dizer que algo "não existe" só porque não achou: pode ser falta de acesso do seu usuário, e ela pergunta.

## Onde ela funciona

| Onde | Como fica |
|---|---|
| **Claude Code + extensão do Claude para Chrome** (recomendado) | Completo: o Claude lê e grava no admin com o seu login, no seu Chrome, roda os scripts de conferência e guarda o perfil da loja no seu computador. Foi assim que a skill foi desenhada e testada. |
| Claude Code sem a extensão | Modo guiado. |
| Chat do Claude (claude.ai, ou o aplicativo fora da aba Code) | Modo guiado. A skill roda numa máquina na nuvem, sem acesso ao seu computador nem ao admin: o Claude explica, escreve o CSS e o JS, gera a prévia e guia você. Se a máquina da nuvem não alcançar o site, ele pode pedir que você mande o código da página (Ctrl+U no Chrome, copiar e colar). O chat junto com a extensão do Chrome não foi testado com esta skill. |
| Codex (da OpenAI) | Formato compatível: o Codex lê skills no mesmo formato. Só modo guiado, a não ser que haja uma ferramenta de navegador conectada. Não testado. |

**Modo guiado:** o Claude prepara e confere cada mudança; você faz os cliques no admin, com a lista que ele
passar, e cola para ele o que o admin mostra. As regras de segurança são as mesmas.

## Do que você precisa

- **Claude Code**, na aba Code do aplicativo do Claude para computador ou no terminal.
- **A extensão do Claude para Chrome**, conectada ao Claude Code (siga as instruções da própria extensão), e
  você logado no admin da loja nesse Chrome.
- **O seu login no admin.** Se você não tem, ou não sabe o endereço do admin, peça a quem cuida da loja (a
  agência, a TI) ou ao suporte da Panorama Sistemas.
- **Python 3** (recomendado, em python.org): gera a prévia e confere o que vai ser gravado. Sem ele dá para
  conversar, receber o CSS e uma lista de cliques, mas não dá para receber a prévia nem gravar pelo caminho da
  skill. No Windows, marque "Add python.exe to PATH" na primeira tela da instalação.
- **Node.js** (recomendado, em nodejs.org): confere o JavaScript antes de gravar. Sem ele tudo funciona, e os
  scripts avisam que pularam essa conferência.
- **git** (em git-scm.com): o Claude Code usa o git para baixar a skill pelo marketplace. Se a instalação
  reclamar de git, instale-o e tente de novo.

Não precisa conferir tudo antes: na primeira vez, o Claude confere o que está instalado e diz o que falta.

## Instalar no Claude Code (recomendado)

Numa conversa do Claude Code, mande estes dois comandos, um de cada vez:

```text
/plugin marketplace add guilhermeeberspachermkt-hub/skill-panorama-sistemas
/plugin install construtor-panorama@skill-panorama-sistemas
```

O primeiro cadastra este repositório como um catálogo de plugins (um "marketplace"). O segundo abre a página do
plugin: escolha **Install for you (user scope)**, para a skill valer em qualquer pasta. Se aparecer
`Run /reload-plugins to apply`, mande `/reload-plugins` ou abra uma conversa nova.

Para conferir: em `/plugin`, aba **Installed**, aparece `construtor-panorama`. A skill entra sozinha quando o
pedido é sobre a loja; para chamá-la pelo nome, digite `/construtor-panorama:construtor-panorama`.

**Pelo terminal**, sem abrir uma conversa, os mesmos dois passos:

```bash
claude plugin marketplace add guilhermeeberspachermkt-hub/skill-panorama-sistemas
claude plugin install construtor-panorama@skill-panorama-sistemas
```

**No aplicativo, na aba Code:** se o `/plugin` não abrir ali, cadastre o catálogo pelo terminal (o primeiro
comando acima) e instale pelo botão **+** ao lado da caixa de mensagem › **Add plugins** (ou **Plugins** ›
**Browse plugins**). O terminal e o aplicativo, no mesmo computador, usam a mesma configuração. Se o comando
`claude` não existir no terminal, use a instalação manual (abaixo): as conversas da aba Code leem a pasta
`~/.claude/skills`.

**Se o cadastro do catálogo der erro de acesso ao GitHub**, use o endereço completo:
`/plugin marketplace add https://github.com/guilhermeeberspachermkt-hub/skill-panorama-sistemas.git`

**Já tinha a skill copiada à mão** em `~/.claude/skills/construtor-panorama`? Tire essa pasta de lá antes de
instalar o plugin, para não ficar com duas cópias. O perfil da sua loja não está nela.

## Atualizar

Catálogos que não são da Anthropic não se atualizam sozinhos, a não ser que você ligue. Escolha um jeito:

- **Automático:** `/plugin` › aba **Marketplaces** › `skill-panorama-sistemas` › **Enable auto-update**.
- **Quando você quiser:** `/plugin` › aba **Marketplaces** › `skill-panorama-sistemas` › **Update marketplace**.
  Pelo terminal: `claude plugin update construtor-panorama@skill-panorama-sistemas`.

Depois, mande `/reload-plugins` ou abra uma conversa nova. O perfil da sua loja fica fora da skill e não se
perde na atualização. O que mudou em cada versão está no [CHANGELOG](CHANGELOG.md).

## Instalar no chat do Claude

No chat (claude.ai, ou o aplicativo fora da aba Code), a skill funciona em modo guiado.

1. Baixe o arquivo `construtor-panorama.skill` na página
   [Releases](https://github.com/guilhermeeberspachermkt-hub/skill-panorama-sistemas/releases) deste repositório.
2. Ligue a execução de código: **Settings › Capabilities › Code execution and file creation** (em português,
   Configurações › Capacidades). Nos planos Team e Enterprise, isso depende da organização: se a opção não
   aparecer, fale com quem administra a conta.
3. Em **Customize › Skills** (em português, algo como Personalizar › Skills), clique em **+** › **Create skill**
   › **Upload a skill** e envie o arquivo. Ele é um zip com a pasta da skill dentro: se a janela só aceitar
   `.zip`, renomeie o arquivo para `construtor-panorama.zip`.
4. Ligue a skill na lista.

Os nomes dos menus mudam com o idioma e a versão do aplicativo; se não achar, procure "Skills" nas
configurações.

## Instalação manual, sem o marketplace

Copie a pasta `plugins/construtor-panorama/skills/construtor-panorama` inteira (com `SKILL.md`, `references`,
`scripts` e `assets`) para a pasta de skills do Claude:

- Windows: `C:\Users\<seu usuário>\.claude\skills\construtor-panorama\`
- macOS e Linux: `~/.claude/skills/construtor-panorama/`

Para pegar a pasta: no GitHub, **Code › Download ZIP**; ou descompacte o `.skill` da página Releases (é um zip);
ou, com o git:

```bash
git clone https://github.com/guilhermeeberspachermkt-hub/skill-panorama-sistemas.git
mkdir -p ~/.claude/skills
cp -r skill-panorama-sistemas/plugins/construtor-panorama/skills/construtor-panorama ~/.claude/skills/
```

Depois, abra uma conversa nova. Para atualizar, troque a pasta pela
versão nova. Use um jeito só: o plugin ou a cópia manual.

## Codex

Copie (ou crie um link para) a mesma pasta `construtor-panorama` em `~/.agents/skills/construtor-panorama/`.
Chame a skill com `$construtor-panorama` no começo da mensagem ou pela lista de `/skills`. Ela funciona em
modo guiado. Por padrão, o Codex bloqueia a internet e a gravação fora da pasta do projeto: ele vai pedir a
sua permissão para ler o site da loja e para guardar o perfil. Não testado.

## Primeiro uso

Tenha à mão:

- o endereço do site da loja;
- o endereço do admin e o nome da loja do jeito que aparece no admin;
- no Claude Code, o admin aberto e logado no Chrome da extensão;
- se souber: quem aprova as mudanças, quem limpa o cache no admin, uma página de teste e o que o Claude não
  deve tocar ("não sei" e "não tenho" valem).

Depois, cole esta mensagem (no Codex, comece com `$construtor-panorama`):

> Quero usar a skill construtor-panorama com a minha loja na Panorama Sistemas. Comece pela configuração
> inicial: veja o que está instalado aqui, me faça as perguntas de uma vez e olhe a loja só para ler, sem
> mudar nada no site nem no admin. Antes de qualquer mudança, me mostre o resumo do que você achou.

O Claude confere o que tem instalado (no Claude Code, ele pode pedir a sua permissão para rodar comandos
que só leem e para criar a pasta do perfil), faz sete perguntas numa mensagem só, lê a loja sem gravar nada, mostra um
resumo para você corrigir e só então avisa que está pronto. Se você chegar direto com um pedido ("quero o
botão de comprar verde"), ele faz essa configuração antes, do mesmo jeito.

## Privacidade

- **O perfil da loja e os backups ficam só no seu computador**, em `~/.claude/panorama-lojas/` (no Windows,
  `C:\Users\<seu usuário>\.claude\panorama-lojas\`) ou noutra pasta que você combinar, sempre fora da pasta da
  skill. Eles não vão para este repositório nem se perdem nas atualizações.
- **Os backups são o seu caminho de volta**, porque o admin não guarda versões anteriores, e eles existem só
  nesse computador. Deixe a pasta num lugar com cópia (OneDrive, Google Drive, um disco de backup) ou copie-a
  de vez em quando; se trocar de computador, leve a pasta junto.
- **Prints:** a ferramenta de navegador guarda cópias dos prints que tira, na pasta dela. Um print pode mostrar
  dados da tela do admin.
- **A skill não manda nada para lugar nenhum:** não tem servidor próprio nem coleta de uso. Ela lê o site e o
  admin da sua loja, grava no admin só o que você aprovar e guarda arquivos no seu computador. Enquanto
  trabalha, deixa no navegador, na aba do admin, um pacote com as funções de conferência (e, às vezes, alguma
  anotação de prévia ou de medição no site), e apaga no fim.
- **Senhas e dados de clientes não entram no perfil.**
- A conversa em si segue as regras da sua conta do Claude (ou do Codex), como qualquer outra conversa.
- No chat, os arquivos ficam na máquina da nuvem: o Claude entrega o perfil e os backups como arquivos para
  você guardar e, na próxima conversa, anexar o perfil de novo.
- Se for passar a skill para alguém, passe só a skill, nunca a pasta `panorama-lojas`.

## Testes e limites

- **Testada em lojas reais da plataforma:** duas lojas, de duas famílias de tema diferentes, em três rodadas,
  no Claude Code com a extensão do Chrome; a última rodada fez uma gravação real de ponta a ponta.
- **Cada loja é diferente:** o tema, os arquivos, as permissões do seu usuário no admin, se há ou não um CDN
  (como o Cloudflare) na frente do site. Por isso a skill mede antes de usar qualquer coisa, e cada mudança
  passa pela prévia e pela sua aprovação.
- **Não testada** no chat do Claude (com ou sem a extensão do Chrome) nem no Codex.
- Os limites conhecidos estão no [README da skill](plugins/construtor-panorama/skills/construtor-panorama/README.md#limites-conhecidos).

## Aviso

Projeto independente. **Não é um produto oficial da Panorama Sistemas**, não tem vínculo com ela e não
substitui o suporte da plataforma; o nome aparece aqui só para dizer com qual plataforma a skill funciona. A
skill é oferecida "no estado em que se encontra", sem garantia de nenhum tipo, sob a [licença MIT](LICENSE). O
que você aprova e grava na sua loja continua sendo decisão e responsabilidade sua.

## Problemas e sugestões

Abra uma [issue no GitHub](https://github.com/guilhermeeberspachermkt-hub/skill-panorama-sistemas/issues)
contando o que você pediu, onde usou (Claude Code com ou sem a extensão, chat ou Codex), o que aconteceu e o
que esperava. **Não cole** senhas, dados de clientes, o perfil da loja nem backups: as issues são públicas.

## O que tem aqui

```text
.claude-plugin/marketplace.json        o catálogo (marketplace) para o Claude Code
plugins/construtor-panorama/
  .claude-plugin/plugin.json           os dados do plugin: nome, versão, licença
  skills/construtor-panorama/          a skill: SKILL.md, references/, scripts/, assets/
CHANGELOG.md                           o que mudou em cada versão
LICENSE                                a licença MIT
```
