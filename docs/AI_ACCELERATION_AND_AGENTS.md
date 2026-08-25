# Estratégia de IA, agentes e aceleração

## Objetivo

Usar agentes para aumentar a produtividade do desenvolvimento sem transformar o MVP em um laboratório de IA. O TapLink Negócios continuará funcional sem modelos generativos, APIs de IA ou agentes externos.

Fonte avaliada: [`Shubhamsaboo/awesome-llm-apps`](https://github.com/Shubhamsaboo/awesome-llm-apps), licença Apache-2.0. Revisão analisada: `11a4bc330e4b0b1509577db4581c5cfbcf6ea6a0`.

## Decisão executiva

### Aplicar durante o desenvolvimento

| Ferramenta | Uso | Momento | Rede |
|---|---|---|---|
| `scope-creep-detector` | comparar o diff com o objetivo da missão e indicar o que manter, separar ou justificar | antes de cada PR | não |
| `dependency-doctor` | identificar dependências sem versão, duplicadas ou manifestos problemáticos | quando dependências mudarem | não por padrão |
| `commit-archaeologist` | explicar por que um código existe antes de refatorações arriscadas | sob demanda | não |
| Codex | implementar, testar, documentar e revisar cada missão | fluxo principal | conforme ferramentas autorizadas |
| GitHub Actions | banco real descartável, migrations, testes, build e evidências | todo PR | sim, no GitHub |

Esses skills aconselham e analisam. Eles não substituem testes, revisão humana, `npm audit`, CI ou aprovação de Nicholas Richardson.

### Avaliar depois do núcleo de analytics

| Ideia | Aplicação comercial | Marco sugerido |
|---|---|---|
| AI Data Analysis Agent | perguntas em linguagem natural sobre acessos, cliques e conversões | 1.6 |
| AI Dashboard Canvas | painel configurável com KPIs e gráficos criados por conversa | 1.7+ |
| Multimodal UI/UX Feedback | revisão visual dos templates white-label e acessibilidade | ferramenta interna após 1.5 |
| Assistente TapLink | textos, promoções, atalhos e recomendações por segmento | 1.6 |
| Relatório inteligente | explicar variações e sugerir ações comerciais | 1.6 |
| Google Business Profile | ler métricas e auxiliar respostas de avaliações autorizadas | após integração oficial |
| RAG de suporte | responder dúvidas usando documentação do produto | pós-MVP |
| Agente de voz | atendimento baseado na documentação de cada empresa | produto futuro |

## Funcionalidades futuras aprovadas

O módulo opcional de IA poderá:

- sugerir textos, descrições e promoções por segmento;
- recomendar atalhos conforme os cliques;
- explicar gráficos sem exigir conhecimento técnico;
- criar resumo semanal por estabelecimento;
- sinalizar queda ou aumento relevante de conversão;
- sugerir campanhas para WhatsApp, cardápio e avaliações;
- auxiliar respostas a avaliações do Google quando houver autorização e API oficial;
- permitir perguntas como “qual placa trouxe mais clientes esta semana?”.

Planos comerciais possíveis:

- **Essencial:** página, NFC, QR e relatórios convencionais;
- **Profissional:** recomendações e resumos automáticos;
- **Premium:** assistente, relatórios interpretados e campanhas inteligentes.

Nenhuma resposta de IA será apresentada como fato sem dados verificáveis. Recomendações deverão indicar período, fonte e limitações.

## Agentes indicados para terminar o sistema

### 1. Codex — agente executor principal

Responsável por código, testes, migrations, documentação e PR. Deve trabalhar em uma missão delimitada por vez e respeitar `AGENTS.md`.

Exemplo de pedido:

```text
Execute a Missão 1.5 conforme docs/PRODUCT_MASTER.md. Antes de editar,
revise AGENTS.md e a documentação obrigatória. Implemente somente analytics
e eventos, rode toda a validação e abra um PR. Não faça deploy.
```

### 2. Scope Creep Detector — fiscal de escopo

Usar antes de cada PR ou quando uma missão tocar muitos arquivos.

```text
Use o scope-creep-detector para comparar esta branch com main.
Intenção: “implementar analytics e eventos da Missão 1.5”.
Classifique cada possível desvio como manter, separar ou justificar.
Não altere arquivos.
```

### 3. Dependency Doctor — fiscal de dependências

Usar quando `package.json`, `requirements.txt` ou `pyproject.toml` mudar.

```text
Use o dependency-doctor no package.json do TapLink.
Faça apenas a análise offline e não modifique dependências.
```

Ele não substitui `npm audit`; sua função é detectar problemas no manifesto.

### 4. Commit Archaeologist — historiador técnico

Usar antes de alterar autenticação, tenant, cobrança, migrations ou criptografia.

```text
Use o commit-archaeologist para explicar a história de lib/auth/session.ts,
os riscos de mudança e os arquivos que costumam mudar junto. Não edite código.
```

### 5. Agente de revisão visual — etapa posterior

O exemplo `multimodal_uiux_feedback_agent_team` usa Google ADK e Gemini. Pode apoiar auditoria visual, mas não deve entrar no runtime do TapLink agora. Exige Python, chave de API e revisão de custos e privacidade.

## Instalação rápida no Codex ou VS Code

### Pré-requisitos

- Node.js 20 ou superior;
- Git;
- Codex, Cursor ou Copilot configurado no VS Code;
- repositório do TapLink clonado;
- nenhuma chave de produção exposta no terminal, prompt ou repositório.

### Opção A — instalação pelo CLI

No PowerShell ou terminal:

```bash
npx skills add https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/scope-creep-detector
npx skills add https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/dependency-doctor
npx skills add https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/commit-archaeologist
```

O CLI detecta o agente instalado e usa o diretório correspondente. Reinicie o VS Code/Codex depois da instalação e confira a lista de skills.

### Opção B — instalação por projeto, recomendada para a equipe

Primeiro faça auditoria do código de terceiros:

```bash
git clone https://github.com/Shubhamsaboo/awesome-llm-apps.git
cd awesome-llm-apps
git checkout 11a4bc330e4b0b1509577db4581c5cfbcf6ea6a0
```

Leia integralmente `SKILL.md`, `scripts/` e `references/` dos skills escolhidos. Depois copie cada pasta completa para:

```text
taplink-negocios/.agents/skills/
```

Diretórios pessoais por agente:

| Agente | Diretório |
|---|---|
| Codex | `~/.codex/skills/` |
| Cursor | `~/.cursor/skills/` |
| GitHub Copilot/VS Code | `~/.copilot/skills/` |
| Claude Code | `~/.claude/skills/` |

A instalação no projeto deve ser versionada em PR próprio e acompanhada de atribuição em `THIRD_PARTY_NOTICES.md`. Não copiar o repositório inteiro.

## Validação da instalação

1. reiniciar o agente ou VS Code;
2. abrir o repositório `taplink-negocios`;
3. pedir explicitamente o skill pelo nome;
4. confirmar que ele opera somente no repositório indicado;
5. confirmar que nenhuma alteração foi feita durante uma análise somente leitura;
6. revisar o relatório antes de executar qualquer correção.

Teste recomendado:

```text
Use o scope-creep-detector nesta branch contra main com a intenção
“documentar estratégia de agentes”. Não modifique arquivos.
```

## Política de segurança para skills e agentes

- skills têm acesso potencial ao shell, arquivos e credenciais do agente;
- ler todos os scripts antes de instalar ou atualizar;
- não usar `curl | bash`;
- fixar uma revisão conhecida ao instalar manualmente;
- não conceder acesso ao servidor Debian para agentes de análise;
- não permitir leitura de `.env`, backups ou credenciais;
- não reutilizar segredos do LoopClub;
- começar com execução local e offline;
- não habilitar modo online sem finalidade e autorização explícitas;
- qualquer atualização do skill exige nova revisão;
- relatórios de agentes são evidências auxiliares, não aprovação automática.

## Fluxo operacional recomendado

1. Nicholas aprova uma missão e o critério de aceite.
2. Codex lê a documentação e implementa uma branch isolada.
3. Testes locais e build são executados.
4. Dependency Doctor é usado se dependências mudaram.
5. Scope Creep Detector revisa o diff contra `main`.
6. Codex corrige ou separa desvios aprovados.
7. GitHub Actions valida a PR com PostgreSQL real.
8. A PR é integrada somente com CI aprovado.
9. Deploy permanece uma operação separada, com auditoria e rollback.

## O que não fazer no MVP

- adicionar múltiplos frameworks de agentes ao runtime;
- criar banco vetorial antes de existir caso de uso aprovado;
- enviar analytics de clientes a modelos sem base legal e contrato;
- permitir que IA publique conteúdo ou responda avaliações sem aprovação;
- misturar Python/Streamlit ao monólito somente para demonstrar IA;
- trocar relatórios determinísticos por respostas probabilísticas.

## Critério para ativar IA no produto

Uma funcionalidade de IA só poderá entrar quando tiver objetivo comercial, consentimento e retenção definidos, orçamento por tenant, fallback sem IA, avaliação de qualidade, auditoria, proteção contra abuso e possibilidade de desativação por empresa.
