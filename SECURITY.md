# Política de segurança

## Situação atual

- ambiente: desenvolvimento e integração contínua;
- dados reais: proibidos;
- deploy no Debian: ainda não realizado;
- PostgreSQL testado: instância descartável do GitHub Actions;
- autenticação: senha com `scrypt`, sessão opaca e cookie `HttpOnly`;
- isolamento: associação obrigatória entre usuário e empresa, coberta por teste automatizado;
- Wi-Fi: senha cifrada com AES-256-GCM e nonce único antes da persistência;
- publicação: rascunho e versão pública armazenados separadamente;
- uploads: apenas PNG, JPEG e WebP até 5 MB, decodificados, redimensionados e regravados em WebP sem metadados;
- armazenamento: bucket privado; a rota pública exige ativo registrado com visibilidade pública;
- administração: função `platform_admin` separada das funções de cada estabelecimento;
- tenant ativo: gravado na sessão somente após comprovar associação do usuário;
- QR Wi-Fi: gerado localmente e retornado com `no-store`;
- analytics: IP e user-agent usados apenas em memória para gerar HMAC diário e nunca persistidos;
- deduplicação: eventos iguais do mesmo visitante anônimo são consolidados por 15 minutos;
- retenção: `ANALYTICS_RETENTION_DAYS` entre 30 e 730 dias, padrão de 395;
- exportação: disponível somente para usuário autenticado na empresa ativa;
- insights: o motor local usa apenas agregados e permanece disponível sem IA externa;
- IA externa: desligada por padrão, autorizada pelo proprietário e limitada por empresa;
- minimização: payload do modelo exclui IP, user-agent, hash de visitante, Wi-Fi e segredos;
- supervisão: resultado generativo exige aprovação ou rejeição humana e gera auditoria;
- resiliência: erro, ausência de chave ou estouro de orçamento aciona fallback determinístico;
- auditoria de dependências: deve ser repetida no CI e antes de cada implantação.

O resultado de uma auditoria representa apenas o instante em que foi executada e não constitui garantia permanente de ausência de vulnerabilidades.

## Segredos

- `.env` nunca deve ser versionado;
- cada ambiente deve possuir segredos exclusivos;
- `BOOTSTRAP_TOKEN` deve ser aleatório, de uso inicial e removido ou rotacionado após a inicialização;
- credenciais do LoopClub não podem ser reutilizadas;
- tokens e senhas não devem aparecer em logs, issues, commits ou mensagens;
- `OPENAI_API_KEY` é segredo exclusivo do TapLink, nunca armazenado no banco nem exibido no painel;
- banco, cache e armazenamento não podem publicar portas diretamente na internet.

## Skills e agentes de desenvolvimento

- skills de terceiros devem ser tratados como software com acesso potencial ao shell e aos arquivos;
- `SKILL.md`, scripts e referências devem ser revisados antes da instalação ou atualização;
- agentes de análise não podem acessar `.env`, backups, credenciais ou o ambiente LoopClub;
- ferramentas offline são preferidas; acesso de rede exige finalidade e autorização explícitas;
- nenhum relatório produzido por agente substitui testes, CI, auditoria ou aprovação humana;
- componentes incorporados ao repositório exigem revisão de licença, versão fixada e atribuição.

## Autenticação e autorização

- mensagens de login não devem revelar se o e-mail existe;
- sessões são armazenadas no banco somente pelo hash do token;
- cookies devem usar `HttpOnly`, `SameSite=Lax` e `Secure` em produção;
- toda rota administrativa deve validar sessão, empresa ativa e função;
- perfil `analyst` possui somente leitura e não pode salvar ou publicar;
- um identificador recebido do navegador nunca é prova de acesso ao tenant;
- o bootstrap do primeiro proprietário deve permanecer protegido contra repetição e concorrência.

## Deploy

Nenhum deploy pode ocorrer sem:

1. CI aprovado;
2. auditoria somente leitura do servidor;
3. portas e recursos confirmados;
4. backup verificável;
5. segredos exclusivos;
6. healthcheck;
7. plano de rollback.

## Vulnerabilidades

Relatos de vulnerabilidade não devem ser publicados como issue aberta. Devem ser encaminhados diretamente ao titular do projeto por canal privado definido pela administração.

É proibido realizar testes em produção, acessar dados de terceiros ou explorar vulnerabilidades sem autorização escrita e escopo definido.

Credenciais comprometidas devem ser revogadas imediatamente e o incidente registrado na auditoria interna.

## Pendências antes de clientes reais

- rate limiting distribuído no login e APIs sensíveis;
- recuperação de senha;
- segundo fator para painel interno;
- proteção CSRF adicional para operações críticas;
- expiração e revogação administrativa de sessões;
- antivírus e quarentena para tipos de arquivo futuros além de imagens;
- limitação de requisições no endpoint público de Wi-Fi;
- rate limiting distribuído no endpoint público de eventos;
- rate limiting distribuído na geração de insights, além do orçamento persistido;
- reserva transacional de orçamento para alta concorrência antes da ativação comercial da IA;
- política de retenção e avaliação periódica dos relatórios generativos;
- agendamento e monitoramento operacional do expurgo de analytics;
- headers CSP definitivos;
- logs estruturados e alertas;
- pentest interno;
- revisão LGPD e jurídica.
