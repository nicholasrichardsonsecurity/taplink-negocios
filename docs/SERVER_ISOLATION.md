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
- MinIO passou a ser requisito da aplicação para uploads, sempre restrito à rede interna.

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
- migrations `0000`, `0001` e `0002` registradas na tabela de controle do Drizzle;
- upload e recuperação de uma imagem de teste confirmados sem expor a porta do MinIO;
- logs sem segredos;
- reinício automático validado somente nos containers TapLink;
- backup e restauração documentados;
- consumo de recursos dentro do limite aprovado.
