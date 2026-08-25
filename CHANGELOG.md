# Changelog

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
