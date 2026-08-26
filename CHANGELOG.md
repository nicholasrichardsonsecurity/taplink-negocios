# Changelog

## Não lançado — Missão 1.9B.2

- landing page institucional reconstruída com narrativa comercial completa, demonstração visual, recursos, segmentos, etapas, indicadores, plano, CTA e rodapé;
- login modernizado com tipografia sem serifa, hierarquia responsiva, feedback de conexão e identidade consistente;
- nenhuma regra de autenticação, banco, cobrança ou isolamento alterada pela revisão visual;
- build Docker corrigido para não depender de credencial real durante a coleta de rotas do Next.js;
- CI ampliado para construir as imagens finais de migration e web, fechando a diferença entre build Node e build Docker;
- rastreamento dinâmico do armazenamento local delimitado para o empacotamento standalone;
- job idempotente de migrations adicionado ao Compose antes da inicialização do web;
- estágio Docker exclusivo de migration criado com código, dependências e arquivos do Drizzle;
- armazenamento do MVP simplificado para volume privado exclusivo, mantendo S3 como opção futura;
- limites iniciais de CPU e memória definidos por serviço;
- validação estrutural do Compose adicionada ao GitHub Actions;
- primeira auditoria somente leitura do Debian registrada;
- capacidade de disco e memória aprovada para homologação;
- portas do LoopClub confirmadas em loopback e PostgreSQL sem publicação no host;
- porta padrão do TapLink alterada de `3300` para `3400` para eliminar colisão;
- rede de saída do serviço web separada da rede interna exclusiva do PostgreSQL;
- Caddy validado e porta `3400` confirmada livre em segunda coleta somente leitura;
- ausência de firewall de host comprovado e de backup próprio do TapLink registrada como bloqueio para publicação;
- procedimento exclusivo de backup, restauração e rollback documentado;
- homologação privada por túnel SSH definida sem alterar o Caddy;
- deploy público mantido bloqueado até implantar firewall, backup e testar restauração/rollback.

## 0.9.1 — 25/08/2026

- CSP, COOP e CORP aplicados às respostas da aplicação;
- rate limiting persistente adicionado aos eventos públicos, Wi-Fi, QR Wi-Fi e upload de logo;
- painel de conciliação consultiva do Asaas sandbox criado;
- comparação registra estados, valores e divergências de cobranças sem mutação;
- E2E ampliado para headers e acesso ao painel de conciliação;
- auditoria somente leitura do Debian mantida como gate pendente.

## 0.9.0 — 25/08/2026

- rate limiting persistente no PostgreSQL adicionado ao login e à recuperação de senha;
- identificadores dos limites protegidos por HMAC e sem persistência de IP ou e-mail em texto;
- CSRF vinculado à sessão aplicado à cobrança, operação financeira e logout;
- fluxo de recuperação com resposta uniforme contra enumeração criado;
- token opaco de uso único, hash no banco e expiração de 30 minutos implementados;
- redefinição de senha com revogação transacional de todas as sessões adicionada;
- painel administrativo de sessões e revogação auditável criado;
- entrega opcional por Resend com chave de idempotência e sem log do token;
- secret scan proprietário integrado ao GitHub Actions;
- migration `0007_security_controls.sql` e testes integrados adicionados;
- auditoria Debian explicitamente mantida como pendência da Missão 1.9B.

## 0.8.0 — 25/08/2026

- painel `/admin/operations` com indicadores de empresas, receita histórica e webhooks criado;
- carteira administrativa com assinatura, plano, usuários e situação consolidada;
- mudança de plano, suspensão, reativação e cancelamento protegidos por confirmação nominal;
- motivo obrigatório e auditoria para toda ação financeira interna;
- atualização externa do Asaas sandbox realizada antes da alteração local;
- planos desvinculados da quantidade de placas e reposicionados por unidades, usuários e software;
- limites de histórico de analytics, exportação CSV e IA aplicados no backend;
- migration `0006_revise_plan_entitlements.sql` adicionada;
- placas, NFC, impressão UV, embalagem, frete e instalação documentados como itens separados.

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
