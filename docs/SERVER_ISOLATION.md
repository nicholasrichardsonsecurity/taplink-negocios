# Isolamento do servidor de homologação

## Objetivo

Hospedar o TapLink Negócios no servidor Debian `190.89.151.9` sem compartilhar recursos lógicos nem alterar o LoopClub.

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

## Portas

Nenhuma porta será definida definitivamente antes da auditoria. A aplicação poderá iniciar ligada apenas a `127.0.0.1`, sendo publicada depois por proxy reverso. O IP público isolado não substitui HTTPS para login ou cobrança.

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
