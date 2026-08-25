# Changelog

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
