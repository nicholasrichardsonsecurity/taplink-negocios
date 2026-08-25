# TapLink Negócios — Base do produto

## Visão

SaaS multiempresa e white-label que conecta placas físicas NFC e QR Code a páginas móveis configuráveis para estabelecimentos.

## Piloto

Pizzaria Lisarojo. Instalação da placa sob vidro de 3 a 5 mm, sujeita a teste físico antes da produção do lote.

## Página pública padrão

- header com marca e menu;
- hero e chamada principal;
- ações rápidas;
- promoção opcional;
- cardápio ou serviços;
- avaliação no Google;
- sobre;
- localização e horários;
- rodapé;
- navegação inferior com `Início` fixo e três ações configuráveis.

Padrão inicial Lisarojo: `Início`, `Cardápio`, `Avaliar`, `Wi-Fi`.

## Painel do estabelecimento

- identidade, logo, cores e conteúdo;
- links e WhatsApp;
- rede e senha de Wi-Fi;
- configuração dos atalhos;
- seções da página;
- placas, NFC e QR Code;
- analytics;
- plano e cobrança.

## Painel interno

- empresas e unidades;
- usuários e permissões;
- temas e templates;
- placas e ativações;
- planos, cobranças e inadimplência;
- auditoria, suporte e indicadores.

## Requisitos transversais

- autenticação segura;
- autorização por função;
- isolamento multiempresa;
- auditoria;
- LGPD;
- backups;
- observabilidade;
- publicação sem regravar tag NFC;
- cobrança recorrente via Asaas;
- bloqueio administrativo proporcional, sem apagar a página ou os dados do cliente.

## Estratégia de IA e agentes

- agentes locais poderão acelerar revisão de escopo, dependências e histórico do código;
- analytics da Missão 1.5 será determinístico e independente de IA;
- assistente de conteúdo, relatórios interpretados e recomendações entram somente após o núcleo de analytics;
- toda IA comercial deverá possuir fallback, limites de custo, auditoria, consentimento e isolamento por empresa;
- a estratégia completa e o guia de instalação estão em `docs/AI_ACCELERATION_AND_AGENTS.md`.

## Marcos

### Missão 0 — concluída

Conceito, modelos white-label, página Lisarojo e protótipo visual do editor validados.

### Missão 1 — em andamento

Repositório, propriedade intelectual, arquitetura, Docker, banco, autenticação e isolamento multiempresa.

### Próximos marcos

1. Missões 1.1 a 1.4: concluídas;
2. Missão 1.5: analytics e relatórios determinísticos;
3. Missão 1.6: assistente e relatórios inteligentes opcionais;
4. Asaas e planos;
5. painel interno completo;
6. segurança, homologação e piloto físico.
