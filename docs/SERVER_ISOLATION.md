# Isolamento do servidor de homologação

## Objetivo

Hospedar o TapLink Negócios no servidor Debian `190.89.151.9` sem compartilhar recursos lógicos nem alterar o LoopClub.

## Situação em 25/08/2026

- servidor identificado, mas ainda não auditado pelo projeto;
- nenhum comando do TapLink executado no Debian;
- nenhum container, volume, diretório, usuário ou porta criado;
- LoopClub permanece intocado;
- Compose do TapLink validado estruturalmente;
- aplicação e migration validadas no GitHub Actions com PostgreSQL descartável;
- deploy bloqueado até concluir a auditoria somente leitura.
- a estratégia de agentes não altera o servidor: nenhum skill, modelo ou serviço de IA será instalado no Debian nesta etapa.
- migrations `0001_lucky_masked_marvel.sql` e `0002_smart_garia.sql` criadas; ainda não aplicadas no Debian;
- migration `0003_fluffy_tarot.sql` criada para analytics; ainda não aplicada no Debian;
- migration `0004_supreme_beast.sql` criada para configurações e histórico de insights; ainda não aplicada no Debian;
- MinIO passou a ser requisito da aplicação para uploads, sempre restrito à rede interna.
- a integração de IA é saída HTTPS opcional da aplicação, fica desligada na homologação inicial e não cria container, banco ou porta adicional;
- migration `0005_naive_sharon_carter.sql` criada para planos, assinaturas, cobranças e eventos; ainda não aplicada no Debian;
- migration `0006_revise_plan_entitlements.sql` criada para separar direitos do software da quantidade de placas; ainda não aplicada no Debian;
- migration `0007_security_controls.sql` criada para rate limiting e recuperação de senha; ainda não aplicada no Debian;
- a Missão 1.9A não acessou nem alterou o Debian; a auditoria real permanece pendente na Missão 1.9B.2;
- a Missão 1.9B.1 concluiu controles em código, mas não constitui evidência de auditoria ou deploy no host;
- Asaas permanece em sandbox e usa somente saída HTTPS; webhook não será exposto no IP sem domínio, TLS e auditoria;

## Regra de ouro

O primeiro acesso será exclusivamente diagnóstico e somente leitura. Nenhum container será parado, recriado ou reiniciado nessa etapa.

## Separação obrigatória

| Recurso | TapLink |
|---|---|
| Projeto Compose | `taplink-homolog` |
| Diretório sugerido | `/opt/taplink/taplink-negocios` |
| Rede interna | `taplink_homolog_internal` |
| Banco | `taplink` |
| Usuário do banco | `taplink_app` |
| Volume PostgreSQL | `taplink_homolog_postgres_data` |
| Volume de arquivos | `taplink_homolog_uploads` |
| Credenciais | Exclusivas e geradas aleatoriamente |
| Porta sugerida da aplicação | A definir após auditoria; ligada a `127.0.0.1` |

O PostgreSQL, o armazenamento e qualquer cache não terão portas publicadas no host.

## Auditoria inicial somente leitura

Executar e registrar, sem alterar estado:

```bash
hostnamectl
df -h
free -h
docker version
docker compose version
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
docker network ls
docker volume ls
ss -lntup
```

Não exibir conteúdo de arquivos `.env`, senhas, tokens ou chaves no chat.

Também registrar, sem revelar segredos:

- nomes e portas dos containers existentes;
- utilização de CPU, memória e disco;
- proxy reverso instalado;
- regras de firewall relevantes;
- política atual de backup;
- versão do Debian, Docker e Compose.

## Portas

Nenhuma porta será definida definitivamente antes da auditoria. A aplicação poderá iniciar ligada apenas a `127.0.0.1`, sendo publicada depois por proxy reverso. O IP público isolado não substitui HTTPS para login ou cobrança.

Até existir domínio e certificado HTTPS:

- não cadastrar clientes reais;
- não ativar cobrança;
- não armazenar credenciais de Wi-Fi de estabelecimentos reais;
- não expor login diretamente em HTTP público;
- utilizar o acesso apenas para homologação técnica controlada.

## Proibições operacionais

- não usar `docker compose down` fora do diretório TapLink;
- não executar comandos com nome de projeto genérico;
- não reutilizar rede, banco ou volume existente;
- não alterar Nginx ou firewall sem backup da configuração;
- não executar limpeza global de imagens, volumes ou redes;
- não usar credenciais do LoopClub;
- não reiniciar o servidor como parte de um deploy comum;
- não executar migrations no banco errado.

## Implantação

Antes do primeiro deploy:

1. confirmar espaço e memória;
2. mapear portas em uso;
3. criar usuário de sistema dedicado;
4. criar diretório próprio;
5. gerar segredos exclusivos;
6. validar Compose localmente;
7. realizar backup;
8. subir somente os serviços TapLink;
9. testar saúde e logs;
10. documentar rollback.

## Critérios de aceite do primeiro deploy

- todos os containers TapLink identificados pelo prefixo definido;
- nenhum serviço do LoopClub reiniciado ou recriado;
- banco acessível somente pela rede interna;
- aplicação acessível pelo proxy ou túnel autorizado;
- `/api/health` respondendo com banco conectado;
- migration aplicada exatamente uma vez;
- migrations `0000`, `0001`, `0002` e `0003` registradas na tabela de controle do Drizzle;
- migration `0004` registrada na tabela de controle do Drizzle;
- migration `0005` registrada e catálogo de planos conferido;
- migration `0006` registrada e direitos de analytics, CSV e IA conferidos;
- migration `0007` registrada e testes de rate limiting, token único e revogação aprovados;
- credenciais Asaas exclusivas do TapLink, com ambiente confirmado como sandbox;
- webhook Asaas publicado somente após HTTPS, token forte e teste de idempotência;
- IA externa mantida desligada até existir segredo exclusivo, orçamento aprovado e revisão dos logs de saída;
- expurgo de analytics executado por agendamento exclusivo do projeto e com logs sem dados pessoais;
- upload e recuperação de uma imagem de teste confirmados sem expor a porta do MinIO;
- logs sem segredos;
- reinício automático validado somente nos containers TapLink;
- backup e restauração documentados;
- consumo de recursos dentro do limite aprovado.
