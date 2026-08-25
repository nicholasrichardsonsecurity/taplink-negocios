# Regras permanentes para desenvolvimento

1. Ler `README.md`, `LICENSE.md`, `docs/PRODUCT_MASTER.md` e `docs/SERVER_ISOLATION.md` antes de alterações estruturais.
2. Preservar a autoria de Nicholas Richardson e o vínculo com a GigaNetPe Telecom.
3. Não converter o projeto para licença open source.
4. Não acessar ou modificar o LoopClub durante atividades do TapLink.
5. Não executar deploy sem inspeção, backup, validação e plano de rollback.
6. Não publicar PostgreSQL, Redis ou armazenamento diretamente na internet.
7. Toda entidade de negócio deve conter isolamento por empresa quando aplicável.
8. Toda rota administrativa deve aplicar autenticação, autorização e auditoria.
9. Segredos devem existir apenas em variáveis de ambiente ou cofre apropriado.
10. Atualizar a documentação e o changelog a cada marco concluído.
11. Em toda missão, revisar obrigatoriamente `README.md`, `SECURITY.md`, `NOTICE.md`, `docs/SERVER_ISOLATION.md` e `CHANGELOG.md`, mesmo quando a conclusão for registrar que não houve impacto.
12. Não declarar deploy, teste com banco real, segurança ou isolamento sem evidência verificável correspondente.
13. Antes de cada PR, revisar o diff contra a intenção da missão; usar `scope-creep-detector` quando estiver instalado.
14. Quando um manifesto de dependências mudar, executar a validação do projeto e revisar com `dependency-doctor` quando disponível.
15. Antes de refatorações sensíveis, consultar o histórico Git e usar `commit-archaeologist` quando necessário.
16. Skills de terceiros exigem leitura dos scripts, revisão de licença, versão fixada e registro de atribuição antes de serem adicionados ao projeto.
17. Agentes de análise não podem ler `.env`, credenciais, backups ou recursos do LoopClub.
