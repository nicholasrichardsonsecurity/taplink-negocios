<div align="center">
  <img src="./public/brand/taplink-negocios-readme-banner.png" alt="TapLink Negócios" width="100%" />

  <br />

  **Tudo do seu negócio em um toque.**

  SaaS multiempresa e white-label integrado a placas NFC e QR Code.

  <br />

  ![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
  ![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=111111)
  ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

  <br />

  ![License](https://img.shields.io/badge/licen%C3%A7a-propriet%C3%A1ria-E43B90?style=flat-square)
  ![Repository](https://img.shields.io/badge/reposit%C3%B3rio-privado-6D42E8?style=flat-square)
  ![CI](https://img.shields.io/badge/CI-aprovado-2AB27B?style=flat-square)
  ![Security](https://img.shields.io/badge/vulnerabilidades_conhecidas-0-2AB27B?style=flat-square)
</div>

---

## Visão do produto

O TapLink Negócios transforma uma placa física com NFC e QR Code em uma página dinâmica do estabelecimento. O cliente aproxima o celular e encontra cardápio, Wi-Fi, WhatsApp, redes sociais, localização, promoções e avaliação no Google.

O estabelecimento altera tudo pelo painel sem reimprimir a placa ou regravar a tag NFC.

### Público inicial

- restaurantes, bares e cafeterias;
- provedores de internet;
- barbearias e salões;
- hotéis e pousadas;
- clínicas, lojas e espaços de atendimento.

## Estado atual

| Marco | Estado | Evidência |
|---|---|---|
| Missão 0 — conceito e protótipo | Concluída | Modelos Lisarojo, GigaNetPe e barbearia |
| Missão 1.1 — fundação | Concluída | Build, PostgreSQL, autenticação e Docker |
| Missão 1.2 — integração real | Concluída | CI com banco real, login e isolamento de tenants |
| Missão 1.3 — editor white-label | Concluída | Rascunho, publicação, Wi-Fi cifrado e página por slug |
| Missão 1.4 — arquivos e gestão | Concluída | Upload, QR Code e painel multiempresa |
| Missão 1.5 — analytics e eventos | Concluída | Eventos anônimos, gráficos, origens e CSV |
| Missão 1.6 — inteligência opcional | Concluída | Insights locais, IA opcional, orçamento e aprovação |
| Missão 1.7 — planos e cobrança | Concluída | Catálogo, trial, Asaas sandbox, webhook e financeiro |
| Deploy Debian | Bloqueado | Depende da auditoria somente leitura |

## Funcionalidades implementadas

- autenticação com senha protegida por `scrypt`;
- sessões opacas persistidas pelo hash do token;
- cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção;
- isolamento entre empresas e funções;
- dashboard autenticado;
- editor white-label responsivo;
- identidade, cores, textos, links e seções;
- atalhos inferiores configuráveis;
- rascunho separado da versão publicada;
- página pública dinâmica `/p/[slug]`;
- Wi-Fi cifrado com AES-256-GCM;
- senha do Wi-Fi ausente do HTML inicial;
- auditoria de salvamento e publicação;
- upload de logo com otimização e remoção de metadados;
- arquivos privados em S3/MinIO e entrega pública por ativo autorizado;
- QR Code Wi-Fi gerado localmente, sem API de terceiros;
- cadastro interno e troca segura de empresa ativa;
- analytics anônimo com visualizações, visitantes, ações e origens;
- deduplicação em janelas de 15 minutos e retenção configurável;
- períodos de 7, 30 e 90 dias e exportação CSV;
- resumo semanal e recomendações determinísticas baseadas em evidências;
- complemento generativo opcional, desligado por padrão e sem dados pessoais;
- limites mensais de requisições e tokens isolados por empresa;
- histórico auditável e aprovação ou rejeição humana;
- planos Essencial, Negócios e Premium com limites versionados;
- trial de 14 dias e assinatura mensal via Asaas sandbox;
- webhook financeiro autenticado, idempotente e isolado por empresa;
- histórico de cobranças e links de fatura validados;
- migrations PostgreSQL versionadas;
- CI com banco real e testes ponta a ponta.

## Arquitetura atual

```mermaid
flowchart TD
    V[Visitante NFC ou QR] --> P[Página pública]
    E[Estabelecimento] --> A[Painel autenticado]
    A --> T[Autorização multiempresa]
    P --> API[Aplicação Next.js]
    T --> API
    API --> DB[(PostgreSQL)]
    API --> AUD[Auditoria]
    API --> EXT[Asaas e APIs auxiliares]
```

O MVP permanece um monólito modular. Workers, filas e serviços independentes serão extraídos somente quando houver necessidade operacional real. Microsserviço prematuro é só boleto distribuído.

## Estrutura do repositório

```text
taplink-negocios/
├── app/                         # interface e rotas HTTP
│   ├── api/                     # autenticação, editor, saúde e Wi-Fi
│   ├── dashboard/               # painel e editor white-label
│   └── p/[slug]/                # página pública
├── lib/                         # autenticação, criptografia e validações
├── packages/database/           # schema, tenant e migrations
├── tests/                       # testes unitários e de integração
├── public/brand/                # identidade visual oficial
├── docs/                        # produto, servidor e titularidade
├── .github/workflows/           # CI com PostgreSQL
├── Dockerfile
└── docker-compose.homolog.yml
```

## Rotas principais

| Rota | Acesso | Função |
|---|---|---|
| `/` | Público | Apresentação do produto |
| `/login` | Público | Autenticação |
| `/dashboard` | Autenticado | Visão geral da empresa |
| `/dashboard/page-editor` | Autenticado | Editor white-label |
| `/dashboard/organizations` | Autenticado | Seleção da empresa ativa |
| `/dashboard/analytics` | Autenticado | Métricas e gráficos da empresa |
| `/dashboard/insights` | Autenticado | Resumo, recomendações e orçamento de IA |
| `/dashboard/billing` | Autenticado | Planos, assinatura e histórico financeiro |
| `/admin/companies` | Administrador da plataforma | Cadastro de empresas |
| `/p/[slug]` | Público | Página publicada |
| `/api/health` | Técnico | Saúde da aplicação e banco |
| `/api/page-settings` | Autenticado | Rascunho e publicação |
| `/api/public/[slug]/wifi` | Público | Wi-Fi publicado sob demanda |
| `/api/public/[slug]/wifi-qr` | Público | QR Wi-Fi gerado localmente |
| `/api/uploads/logo` | Editor autorizado | Upload seguro da logo |
| `/api/public/[slug]/events` | Público | Coleta anônima e deduplicada |
| `/api/analytics/export` | Autenticado | Exportação CSV por período |
| `/api/billing/plans` | Público | Catálogo comercial ativo |
| `/api/billing/subscribe` | Proprietário | Criação idempotente no Asaas sandbox |
| `/api/billing/webhooks/asaas` | Asaas | Eventos financeiros autenticados |

## Desenvolvimento local

### Pré-requisitos

- Node.js 24 ou superior;
- Docker e Docker Compose;
- Git.

### Instalação

```bash
git clone https://github.com/nicholasrichardsonsecurity/taplink-negocios.git
cd taplink-negocios
cp .env.example .env
npm ci
docker compose -f docker-compose.homolog.yml up -d postgres
npm run db:migrate
npm run dev
```

Acesse `http://localhost:3000`.

O primeiro proprietário é criado uma única vez por `POST /api/auth/bootstrap`, utilizando `BOOTSTRAP_TOKEN`. Depois da primeira criação, o endpoint recusa novas inicializações.

## Qualidade

```bash
npm run check:ownership
npm run typecheck
npm run test:unit
npm run build
npm audit --omit=dev
```

O GitHub Actions também executa:

- PostgreSQL 17 descartável;
- migrations desde banco vazio;
- bootstrap único;
- login, cookie e dashboard;
- isolamento entre duas empresas;
- editor, publicação e rascunho;
- verificação de que o Wi-Fi não está em texto puro;
- build de produção.

## Infraestrutura de homologação

- servidor Debian próprio;
- IP inicial: `190.89.151.9`;
- diretório previsto: `/opt/taplink/taplink-negocios`;
- Compose: `taplink-homolog`;
- rede, volumes, banco e credenciais exclusivos;
- aplicação ligada inicialmente apenas a `127.0.0.1`;
- PostgreSQL e armazenamento sem portas públicas;
- LoopClub completamente separado.

Nenhum deploy será realizado antes da auditoria definida em [`docs/SERVER_ISOLATION.md`](docs/SERVER_ISOLATION.md).

## APIs e integrações

### MVP

- Asaas — assinatura e cobrança;
- ViaCEP ou BrasilAPI — preenchimento de endereço;
- IBGE Localidades — estados e municípios;
- Google Avaliações — link direto configurado;
- WhatsApp `wa.me` — atendimento e pedidos.

### Planos do piloto

| Plano | Mensalidade | Limites iniciais |
|---|---:|---|
| Essencial | R$ 39,90 | 5 placas e 2 usuários |
| Negócios | R$ 69,90 | 20 placas, 5 usuários e analytics |
| Premium | R$ 99,90 | 50 placas, 10 usuários e IA opcional |

O trial é de 14 dias. A Missão 1.7 opera somente no sandbox do Asaas e aceita Pix ou boleto. A criação da assinatura não confirma pagamento: apenas eventos `PAYMENT_CONFIRMED` ou `PAYMENT_RECEIVED` ativam o estado financeiro. Eventos vencidos iniciam a régua de inadimplência sem excluir página ou dados.

### Futuras

- Google Business Profile;
- WhatsApp Cloud API;
- Instagram Graph API;
- OpenStreetMap;
- Open-Meteo para campanhas contextuais.

NFC, QR Code, Wi-Fi, editor, analytics e páginas não dependerão de API externa para funcionar.

### Inteligência opcional

O motor de regras produz o relatório mesmo sem conexão ou chave externa. Quando autorizado pelo proprietário, `AI_INSIGHTS_ENABLED=true` e `OPENAI_API_KEY` permitem um complemento pela Responses API. Somente contagens agregadas são enviadas; hashes de visitantes, IP, user-agent, senha de Wi-Fi e segredos ficam fora do payload. O resultado generativo entra como pendente e exige aprovação humana.

## Agentes e aceleração

O desenvolvimento poderá usar skills locais para revisar escopo, dependências e histórico Git. Recursos comerciais de IA serão opcionais e entrarão depois do analytics convencional.

Consulte o guia de agentes, instalação e roadmap em [`docs/AI_ACCELERATION_AND_AGENTS.md`](docs/AI_ACCELERATION_AND_AGENTS.md).

## Segurança

- dados reais ainda são proibidos;
- `.env`, credenciais e backups nunca são versionados;
- Wi-Fi é cifrado antes da persistência;
- perfil analista não pode publicar;
- banco e armazenamento permanecem internos;
- deploy exige CI, backup, healthcheck e rollback;
- pentest e revisão LGPD são obrigatórios antes de clientes reais.

Consulte [`SECURITY.md`](SECURITY.md).

## Próxima missão

### Missão 1.8 — administração operacional

- gestão interna de assinaturas e inadimplência;
- troca de plano e cancelamento seguro;
- limites de placas e usuários aplicados no backend;
- conciliação e reprocessamento de webhook;
- indicadores comerciais da plataforma.

## Titularidade

**Criador e titular:** Nicholas Richardson

**Empresa vinculada:** GigaNetPe Telecom

**Licença:** proprietária e restritiva
**Distribuição:** proibida sem autorização escrita

Este projeto não é open source. O acesso ao repositório não concede autorização de uso, cópia, modificação, hospedagem ou distribuição. Consulte [`LICENSE.md`](LICENSE.md) e [`NOTICE.md`](NOTICE.md).

---

<div align="center">
  <img src="./public/brand/taplink-negocios-logo-white-readme.png" alt="Símbolo TapLink Negócios" width="180" />

  **Copyright © 2026 Nicholas Richardson · GigaNetPe Telecom**
</div>
