# Changelog

## 0.7.0 — 25/08/2026

- planos Essencial, Negócios e Premium definidos em R$ 39,90, R$ 69,90 e R$ 99,90;
- limites iniciais de placas, usuários e IA persistidos no catálogo;
- trial de 14 dias e contratação por proprietário implementados;
- criação e reutilização de cliente e assinatura no Asaas sandbox adicionadas;
- Pix e boleto habilitados sem coleta de cartão no TapLink;
- webhook Asaas autenticado, idempotente e multiempresa criado;
- eventos financeiros traduzidos para estados internos auditáveis;
- painel de plano, contratação e histórico de cobranças criado;
- URLs de fatura restritas a HTTPS e domínio Asaas;
- migration `0005_naive_sharon_carter.sql` e testes de billing adicionados.

## 0.6.0 — 25/08/2026

- painel `/dashboard/insights` com resumo semanal e recomendações criado;
- motor determinístico independente de provedor externo implementado;
- comparação entre os últimos sete dias e o período anterior adicionada;
- complemento pela OpenAI Responses API criado e desligado por padrão;
- payload restrito a contagens agregadas, sem identificadores ou segredos;
- limites de requisições e tokens isolados por empresa adicionados;
- fallback automático para regras locais em falha, ausência de chave ou limite atingido;
- aprovação e rejeição humana com trilha de auditoria implementadas;
- migration `0004_supreme_beast.sql` e quatro testes de insights adicionados.

## 0.5.0 — 25/08/2026

- eventos públicos de visualização e ação adicionados;
- origens NFC, QR Code, direta e não identificada suportadas;
- visitante anonimizado com HMAC rotativo diário, sem persistir IP ou user-agent;
- deduplicação por evento em janelas de 15 minutos;
- dashboard de analytics com períodos de 7, 30 e 90 dias;
- métricas, gráfico diário, ranking de ações e origens implementados;
- exportação CSV autenticada adicionada;
- retenção configurável e comando `analytics:purge` criados;
- migration `0003_fluffy_tarot.sql` e testes de privacidade adicionados.

## Não lançado

- estratégia de uso de IA e agentes documentada;
- `scope-creep-detector`, `dependency-doctor` e `commit-archaeologist` aprovados como aceleradores opcionais de desenvolvimento;
- ideias de assistente, análise de dados, dashboard generativo, RAG e voz registradas para atualizações futuras;
- instalação no Codex, Cursor, Copilot/VS Code e Claude Code documentada;
- controles de segurança e critérios para IA comercial definidos.

## 0.4.0 — 25/08/2026

- identidade visual oficial e README renovado;
- upload de logo PNG, JPEG e WebP com limite de 5 MB;
- imagens convertidas para WebP, redimensionadas e sem metadados;
- armazenamento privado compatível com MinIO/S3;
- tabela `media_assets` e entrega pública somente de ativos autorizados;
- QR Code Wi-Fi gerado internamente, sem API externa;
- função administrativa de plataforma e cadastro de empresas;
- empresa ativa persistida na sessão e seletor multiempresa;
- migration `0002_smart_garia.sql` e testes de URI Wi-Fi adicionados.

## 0.3.0 — 25/08/2026

- editor white-label autenticado criado;
- identidade, cores, textos, links, Google, cardápio e localização configuráveis;
- Wi-Fi cifrado com AES-256-GCM antes da persistência;
- três atalhos inferiores configuráveis e sem repetição;
- rascunho separado da versão publicada;
- página dinâmica `/p/[slug]` implementada;
- senha do Wi-Fi removida do HTML inicial e entregue sob demanda;
- perfil analista impedido de editar;
- auditoria de salvamento e publicação incluída;
- migration `0001_lucky_masked_marvel.sql` gerada;
- sete testes unitários aprovados e fluxo E2E ampliado.

## 0.2.2 — 25/08/2026

- `README.md` sincronizado com a conclusão da Missão 1.2;
- `SECURITY.md` ampliado com controles atuais, pendências e critérios de deploy;
- `NOTICE.md` atualizado com estado da implementação e controle de contribuições;
- `docs/SERVER_ISOLATION.md` atualizado com bloqueios, proibições e aceite do primeiro deploy;
- revisão obrigatória desses documentos adicionada às regras permanentes do projeto.

## 0.2.1 — 25/08/2026

- testes unitários da autenticação adicionados;
- autorização explícita por usuário e empresa criada;
- teste de isolamento entre dois tenants implementado;
- teste ponta a ponta de bootstrap, login, cookie e dashboard criado;
- CI configurado com PostgreSQL real e migration automática;
- bloqueio de acesso anônimo e bootstrap único cobertos pela automação.

## 0.2.0 — 25/08/2026

- aplicação Next.js 16 e React 19 criada;
- schema PostgreSQL multiempresa implementado;
- autenticação própria com `scrypt`, sessões opacas e cookie seguro;
- inicialização única do primeiro proprietário;
- dashboard protegido e tenant carregado pela sessão;
- healthcheck de aplicação e banco;
- imagem Docker multi-stage e serviço web isolado;
- banco e armazenamento mantidos sem portas públicas.

## 0.1.0 — 25/08/2026

- fundação do repositório criada;
- licença proprietária adicionada;
- autoria e empresa vinculada documentadas;
- regras permanentes do Codex definidas;
- estratégia de isolamento do servidor registrada;
- Docker Compose inicial com PostgreSQL e armazenamento próprios;
- política de segurança e documentação-base adicionadas.
