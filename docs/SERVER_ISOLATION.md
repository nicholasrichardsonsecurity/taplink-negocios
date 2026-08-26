# Isolamento do servidor de homologação

> O build Docker utiliza somente uma URL sintética e inacessível de PostgreSQL. Segredos reais entram apenas no runtime pelo `.env` local protegido e não devem integrar imagens, logs ou evidências de diagnóstico.

## Objetivo

Hospedar o TapLink Negócios no servidor Debian `190.89.151.9` sem compartilhar recursos lógicos nem alterar o LoopClub.

## Situação em 25/08/2026

- auditoria inicial somente leitura recebida e registrada em 25/08/2026;
- host confirmado como Debian 12 `bookworm`, kernel `6.1.0-49-amd64`, virtualização KVM e arquitetura x86-64;
- Docker Engine `29.6.1`, API `1.55`, Compose `v5.2.0` e Caddy `v2.11.4` confirmados ativos;
- disco raiz com 195 GB, 46 GB usados e 141 GB disponíveis; memória com 7,8 GiB totais e 6,3 GiB disponíveis no momento da coleta;
- portas públicas confirmadas: `22`, `80` e `443`; administração do Caddy restrita a `127.0.0.1:2019`;
- LoopClub confirmado em `127.0.0.1:3100`, `127.0.0.1:3200` e `127.0.0.1:3300`; seus bancos PostgreSQL não publicam porta no host;
- containers existentes consumiam aproximadamente 375 MiB de memória e CPU praticamente ociosa durante a coleta;
- porta `3400` selecionada para o TapLink, ligada exclusivamente a `127.0.0.1`;
- segunda coleta confirmou a porta `3400` livre, configuração válida do Caddy e proxies existentes limitados ao LoopClub;
- nenhuma regra UFW foi evidenciada e o `nftables` exibiu somente as cadeias geradas pelo Docker, sem política de entrada do host comprovada;
- backup automatizado existente pertence ao LoopClub (`loopclub-backup.timer`) e não cobre o TapLink;
- nenhum comando do TapLink executado no Debian;
- nenhum container, volume, diretório, usuário ou porta criado;
- LoopClub permanece intocado;
- Compose do TapLink validado estruturalmente;
- aplicação e migration validadas no GitHub Actions com PostgreSQL descartável;
- deploy público permanece bloqueado até definir firewall, implantar backup próprio e testar restauração e rollback;
- a estratégia de agentes não altera o servidor: nenhum skill, modelo ou serviço de IA será instalado no Debian nesta etapa.
- migrations `0001_lucky_masked_marvel.sql` e `0002_smart_garia.sql` criadas; ainda não aplicadas no Debian;
- migration `0003_fluffy_tarot.sql` criada para analytics; ainda não aplicada no Debian;
- migration `0004_supreme_beast.sql` criada para configurações e histórico de insights; ainda não aplicada no Debian;
- uploads do MVP usam volume local privado e exclusivo, sem serviço ou porta adicional; S3 permanece uma evolução opcional;
- a integração de IA é saída HTTPS opcional da aplicação, fica desligada na homologação inicial e não cria container, banco ou porta adicional;
- migration `0005_naive_sharon_carter.sql` criada para planos, assinaturas, cobranças e eventos; ainda não aplicada no Debian;
- migration `0006_revise_plan_entitlements.sql` criada para separar direitos do software da quantidade de placas; ainda não aplicada no Debian;
- migration `0007_security_controls.sql` criada para rate limiting e recuperação de senha; ainda não aplicada no Debian;
- a Missão 1.9A não acessou nem alterou o Debian; a primeira coleta da Missão 1.9B.2 foi concluída pelo operador;
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
| Rede de saída da aplicação | `taplink_homolog_edge` |
| Banco | `taplink` |
| Usuário do banco | `taplink_app` |
| Volume PostgreSQL | `taplink_homolog_postgres_data` |
| Volume de arquivos | `taplink_homolog_uploads` |
| Credenciais | Exclusivas e geradas aleatoriamente |
| Porta da aplicação | `127.0.0.1:3400` |

O PostgreSQL e qualquer cache não terão portas publicadas no host. O volume privado de uploads é montado somente no serviço web. Apenas o web participa da rede `taplink_homolog_edge`, necessária para saídas HTTPS como Asaas e Resend; o banco permanece exclusivamente na rede interna.

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

## Resultado e pendências da auditoria

O gate de capacidade, colisão de portas e validade do proxy foi aprovado. A coleta comprovou recursos suficientes para a homologação, confirmou que `3400` estava livre e validou o Caddy sem alterar sua configuração.

O firewall do host não pode ser considerado aprovado: não houve saída do UFW e o conjunto `nftables` apresentado contém apenas regras do Docker. Isso não expõe as portas loopback dos containers, mas deixa a proteção dependente dos serviços em escuta e da configuração do provedor da VM.

O backup também permanece reprovado para o TapLink: o timer encontrado protege o LoopClub, não o novo projeto.

Ainda faltam controles antes da publicação externa:

- política de firewall do host ou do provedor da VM permitindo somente `22`, `80` e `443` conforme origem e necessidade;
- timer e destino de backup exclusivos do TapLink;
- teste de restauração em ambiente descartável;
- rollback do aplicativo validado sem afetar o LoopClub;
- definição do domínio antes de login público, webhook ou cobrança real.

## Homologação privada autorizável

Antes do domínio, o TapLink poderá ser testado exclusivamente por túnel SSH, mantendo `3400` em loopback:

```bash
ssh -L 3400:127.0.0.1:3400 root@190.89.151.9
```

Com o túnel ativo, o operador acessará `http://127.0.0.1:3400` no próprio computador. Essa autorização não inclui dados reais, cobrança real, webhook público nem alteração do Caddy.

## Portas

A aplicação usará `127.0.0.1:3400`, sem exposição direta na interface pública. A publicação posterior será feita exclusivamente pelo Caddy. O IP público isolado não substitui HTTPS para login ou cobrança.

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

1. confirmar novamente espaço, memória e disponibilidade da porta `3400`;
2. registrar backup e rollback do Caddy e confirmar firewall;
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
- upload e recuperação de uma imagem de teste confirmados no volume privado, sem exposição direta dos arquivos;
- job `migrate` concluído com sucesso antes do serviço web e migrations `0000` a `0007` conferidas;
- logs sem segredos;
- reinício automático validado somente nos containers TapLink;
- backup e restauração documentados;
- consumo de recursos dentro do limite aprovado.
