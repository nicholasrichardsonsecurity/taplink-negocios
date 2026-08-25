# TapLink Negócios

Plataforma SaaS multiempresa e white-label integrada a placas NFC e QR Code para restaurantes, provedores, barbearias e outros negócios.

## Estado

Missão 1 — fundação do produto real.

O protótipo validou o editor e a página pública da Pizzaria Lisarojo. Este repositório será a implementação comercial, com autenticação, isolamento multiempresa, publicação, analytics, cobrança e operação em Docker.

## Titularidade

- Criador e titular: Nicholas Richardson;
- empresa vinculada: GigaNetPe Telecom;
- licença: proprietária e restritiva;
- distribuição pública: proibida.

Consulte [LICENSE.md](LICENSE.md) e [NOTICE.md](NOTICE.md).

## Aplicações previstas

- `apps/web`: página pública, painel do estabelecimento e painel interno;
- `apps/worker`: webhooks, processamento assíncrono e relatórios;
- `packages/database`: schema e migrations PostgreSQL;
- `packages/ui`: componentes e temas white-label;
- `packages/analytics`: eventos, métricas e agregações.

## Infraestrutura de homologação

- servidor: Debian em infraestrutura própria;
- publicação inicial: IP, sem domínio definitivo;
- Docker Compose separado do LoopClub;
- PostgreSQL, redes, volumes e credenciais exclusivos;
- serviços internos não expostos diretamente à internet.

Leia [docs/SERVER_ISOLATION.md](docs/SERVER_ISOLATION.md) antes de qualquer ação no servidor.

## Segurança

- nunca versionar `.env`, credenciais, backups ou dados reais;
- não reutilizar senhas, volumes ou redes do LoopClub;
- banco e Redis não podem publicar portas no host;
- primeiro acesso ao servidor deve ser somente leitura;
- deploy exige backup e plano de reversão.
