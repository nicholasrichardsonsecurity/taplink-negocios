# Backup, restauração e rollback

## Escopo

Este procedimento pertence exclusivamente ao projeto Compose `taplink-homolog`. Ele não usa diretórios, containers, volumes, redes ou credenciais do LoopClub.

## Conteúdo mínimo do backup

- dump lógico do PostgreSQL em formato customizado;
- cópia do volume `taplink_homolog_uploads`;
- SHA do commit implantado;
- checksum SHA-256 dos artefatos;
- manifesto com data UTC e versões das imagens;
- arquivo `.env` fora do repositório, protegido separadamente e nunca incluído no pacote compartilhável.

Destino sugerido no host: `/opt/taplink/backups`. Uma segunda cópia deve sair da VM; backup no mesmo disco é apenas uma cópia com autoestima.

## Backup antes de cada implantação

No diretório `/opt/taplink/taplink-negocios`:

```bash
set -euo pipefail
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_dir="/opt/taplink/backups/${stamp}"
install -d -m 0700 "$backup_dir"

docker compose -p taplink-homolog -f docker-compose.homolog.yml \
  exec -T postgres sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  > "$backup_dir/database.dump"

upload_mount="$(docker volume inspect taplink_homolog_uploads --format '{{ .Mountpoint }}')"
tar -C "$upload_mount" -czf "$backup_dir/uploads.tar.gz" .

git rev-parse HEAD > "$backup_dir/commit.sha"
docker compose -p taplink-homolog -f docker-compose.homolog.yml images \
  > "$backup_dir/images.txt"
sha256sum "$backup_dir/database.dump" "$backup_dir/uploads.tar.gz" \
  > "$backup_dir/SHA256SUMS"
chmod -R go-rwx "$backup_dir"
```

O backup só é aceito quando `database.dump`, `uploads.tar.gz`, `commit.sha`, `images.txt` e `SHA256SUMS` existem, não estão vazios e passam em `sha256sum -c`.

## Teste de restauração

A restauração deve ser testada primeiro em projeto Compose descartável, com porta, rede e volumes diferentes. Nunca testar sobre o ambiente ativo nem apontar para volumes do LoopClub.

Critérios mínimos:

- banco restaurado sem erro;
- migrations reconhecidas pelo Drizzle;
- `/api/health` saudável;
- login de homologação funcionando;
- mídia de teste recuperada;
- checksums válidos;
- nenhum container do LoopClub reiniciado.

## Rollback do aplicativo

O rollback normal deve trocar somente a versão do código/imagem do serviço `web`. Migration destrutiva ou incompatível exige restauração testada do banco; não se deve tentar “desmigrar” manualmente em produção.

Fluxo controlado:

1. registrar o SHA atual e o SHA anterior aprovado;
2. confirmar backup válido;
3. reconstruir apenas o serviço `web` no SHA anterior;
4. executar `docker compose up -d --no-deps web` somente no projeto `taplink-homolog`;
5. validar `/api/health`, login e logs;
6. confirmar que todos os containers `loopclub_*` mantiveram ID e horário de inicialização;
7. registrar motivo, executor, horário e resultado.

## Proibições

- não usar `docker compose down` como rotina de rollback;
- não executar `docker system prune`;
- não reutilizar o timer ou diretório de backup do LoopClub;
- não guardar `.env` no Git ou dentro de pacote enviado a terceiros;
- não restaurar sem conferir projeto Compose, volume alvo, checksum e backup anterior;
- não automatizar exclusão por retenção antes de existir segunda cópia verificada.
