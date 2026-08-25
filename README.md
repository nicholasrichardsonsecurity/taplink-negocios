# TapLink Negócios

Plataforma SaaS multiempresa e white-label integrada a placas NFC e QR Code para restaurantes, provedores, barbearias e outros negócios.

## Estado atual

**Missão 1.3 implementada e em validação no CI em 25/08/2026.**

O núcleo comercial já possui aplicação Next.js, PostgreSQL, migrations, autenticação, sessões persistentes, dashboard protegido e autorização multiempresa. O protótipo visual da Pizzaria Lisarojo será incorporado nos próximos marcos como editor e página pública dinâmica.

O editor white-label agora configura identidade, cores, links, Google Avaliações, cardápio, localização, Wi-Fi, atalhos e seções. Rascunho e versão publicada são armazenados separadamente; salvar não altera a página que já está pública.

Validação automatizada aprovada no GitHub Actions com PostgreSQL real:

- migration aplicada;
- bootstrap único do primeiro proprietário;
- hash e verificação de senha com `scrypt`;
- login e cookie de sessão;
- dashboard autenticado;
- redirecionamento de visitante anônimo;
- isolamento entre duas empresas;
- build de produção;
- auditoria com zero vulnerabilidades conhecidas no momento da execução.

## Titularidade

- Criador e titular: Nicholas Richardson;
- empresa vinculada: GigaNetPe Telecom;
- licença: proprietária e restritiva;
- distribuição pública: proibida.

Consulte [LICENSE.md](LICENSE.md) e [NOTICE.md](NOTICE.md).

## Estrutura atual

- `app`: interface, rotas públicas, dashboard e endpoints;
- `lib/auth`: senhas e sessões;
- `packages/database`: schema e migrations PostgreSQL;
- `tests`: testes unitários e de integração;
- `.github/workflows`: validação automatizada com PostgreSQL;
- `docs`: produto, propriedade, segurança operacional e servidor.

Workers, componentes compartilhados e analytics serão separados quando o volume justificar. O MVP permanece um monólito modular para reduzir custo e complexidade operacional.

## Infraestrutura de homologação

- servidor: Debian em infraestrutura própria;
- publicação inicial: IP, sem domínio definitivo;
- Docker Compose separado do LoopClub;
- PostgreSQL, redes, volumes e credenciais exclusivos;
- serviços internos não expostos diretamente à internet.
- aplicação ligada inicialmente apenas a `127.0.0.1` no host;
- nenhuma implantação realizada no Debian até a auditoria somente leitura.

Leia [docs/SERVER_ISOLATION.md](docs/SERVER_ISOLATION.md) antes de qualquer ação no servidor.

## Segurança

- nunca versionar `.env`, credenciais, backups ou dados reais;
- não reutilizar senhas, volumes ou redes do LoopClub;
- banco e Redis não podem publicar portas no host;
- primeiro acesso ao servidor deve ser somente leitura;
- deploy exige backup e plano de reversão.
- bootstrap exige token forte e funciona apenas antes da criação do primeiro usuário;
- toda autorização deve validar usuário, empresa e função.

## Desenvolvimento local

```bash
cp .env.example .env
npm install
npm run db:generate
docker compose -f docker-compose.homolog.yml up -d postgres
npm run db:migrate
npm run dev
```

Validação completa:

```bash
npm run check
```

O primeiro proprietário é criado uma única vez por `POST /api/auth/bootstrap`, usando `BOOTSTRAP_TOKEN`. Depois que existir um usuário, o endpoint recusa novas inicializações.

## Rotas iniciais

- `/`: apresentação;
- `/login`: autenticação;
- `/dashboard`: área protegida;
- `/dashboard/page-editor`: editor white-label autenticado;
- `/p/[slug]`: página pública publicada;
- `/api/health`: saúde da aplicação e banco;
- `/api/page-settings`: leitura, rascunho e publicação;
- `/api/public/[slug]/wifi`: entrega sob demanda da senha publicada;
- `/api/auth/bootstrap`: inicialização controlada;
- `/api/auth/login` e `/api/auth/logout`: sessão.

## Próximo marco

Missão 1.4: upload real de logo e imagens, QR Code de Wi-Fi, cadastro administrativo de empresas e seleção explícita de tenant para usuários com múltiplos negócios.

## Documentação obrigatória

Cada missão deve revisar e atualizar, quando aplicável:

- `README.md`;
- `SECURITY.md`;
- `NOTICE.md`;
- `docs/SERVER_ISOLATION.md`;
- `CHANGELOG.md`.
