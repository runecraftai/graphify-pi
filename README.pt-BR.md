<div align="center">

<a href="README.md">🇺🇸 English</a>

</div>

<div align="center">

<svg viewBox="0 0 1200 280" width="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#58a6ff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#3fb950" stop-opacity="0.08"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="280" rx="16" fill="#0d1117"/>
  <rect width="1200" height="280" rx="16" fill="url(#glow)"/>
  <!-- graph nodes -->
  <circle cx="920" cy="80" r="6" fill="#58a6ff" opacity="0.7"/>
  <circle cx="960" cy="120" r="4" fill="#3fb950" opacity="0.6"/>
  <circle cx="1000" cy="70" r="5" fill="#58a6ff" opacity="0.5"/>
  <circle cx="1040" cy="130" r="7" fill="#3fb950" opacity="0.7"/>
  <circle cx="1080" cy="90" r="4" fill="#58a6ff" opacity="0.6"/>
  <circle cx="1100" cy="140" r="5" fill="#3fb950" opacity="0.5"/>
  <circle cx="950" cy="160" r="3" fill="#58a6ff" opacity="0.4"/>
  <circle cx="1060" cy="50" r="3" fill="#3fb950" opacity="0.4"/>
  <!-- graph edges -->
  <line x1="920" y1="80" x2="960" y2="120" stroke="#58a6ff" stroke-width="1" opacity="0.3"/>
  <line x1="960" y1="120" x2="1040" y2="130" stroke="#3fb950" stroke-width="1" opacity="0.3"/>
  <line x1="1000" y1="70" x2="1040" y2="130" stroke="#58a6ff" stroke-width="1" opacity="0.25"/>
  <line x1="1040" y1="130" x2="1080" y2="90" stroke="#3fb950" stroke-width="1" opacity="0.3"/>
  <line x1="1080" y1="90" x2="1100" y2="140" stroke="#58a6ff" stroke-width="1" opacity="0.25"/>
  <line x1="920" y1="80" x2="1000" y2="70" stroke="#58a6ff" stroke-width="1" opacity="0.2"/>
  <line x1="1060" y1="50" x2="1000" y2="70" stroke="#3fb950" stroke-width="1" opacity="0.2"/>
  <line x1="950" y1="160" x2="960" y2="120" stroke="#58a6ff" stroke-width="1" opacity="0.2"/>
  <!-- title -->
  <text x="60" y="105" fill="#e6edf3" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="56" font-weight="700">graphify-pi</text>
  <!-- subtitle -->
  <text x="60" y="150" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="22" font-weight="400">Extensão minimal de grafo de conhecimento para Pi</text>
  <!-- badges -->
  <rect x="60" y="175" width="90" height="28" rx="14" fill="#238636" opacity="0.9"/>
  <text x="105" y="194" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" font-weight="600" text-anchor="middle">MIT</text>
  <rect x="162" y="175" width="120" height="28" rx="14" fill="#1f6feb" opacity="0.9"/>
  <text x="222" y="194" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" font-weight="600" text-anchor="middle">pi-extension</text>
  <rect x="294" y="175" width="140" height="28" rx="14" fill="#30363d" opacity="0.9"/>
  <text x="364" y="194" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" font-weight="500" text-anchor="middle">modular</text>
  <!-- stat -->
  <rect x="60" y="220" width="260" height="36" rx="8" fill="#161b22" stroke="#30363d" stroke-width="1"/>
  <text x="76" y="244" fill="#3fb950" font-family="SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace" font-size="15" font-weight="600">83,2%</text>
  <text x="148" y="244" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14">redução mediana de tokens</text>
</svg>

</div>

<br>

> Consulte e mantenha o grafo de conhecimento do seu código dentro do Pi — seis ferramentas, zero configuração, 83% menos tokens.

---

## O que faz

`@runecraft/graphify-pi` encapsula a CLI upstream do [Graphify-Labs graphify](https://github.com/Graphify-Labs/graphify) como uma extensão do Pi. Fornece ferramentas sempre disponíveis para consultar, construir, atualizar e diagnosticar um grafo de conhecimento do código em vez de buscar em arquivos brutos.

| Ferramenta | Função |
|-----------|--------|
| `graphify_build` | Executa o fluxo upstream `graphify .` (ou um caminho de projeto fornecido); `mode` standard\|deep e `backend` semântico opcionais, com estatísticas da compilação nos detalhes da ferramenta |
| `graphify_status` | Informa a presença do grafo, disponibilidade/versão da CLI e obsolescência via Git |
| `graphify_query` | Subgrafo ao redor de conceitos que correspondem a uma pergunta (BFS padrão, DFS para rastrear caminhos) com orientação de expansão de vocabulário |
| `graphify_path` | Caminho mais curto entre dois nós (correspondência aproximada) |
| `graphify_explain` | Explicação em linguagem natural de um nó e seus vizinhos |
| `graphify_update` | Re-extração incremental de arquivos modificados (somente AST, sem custo de LLM) |

### Integrações complementares no Pi

`graphify-pi` não é o instalador upstream e não modifica o comando Graphify-Labs `graphify pi install`. As duas integrações são complementares:

- **graphify-pi** é a extensão nativa do Pi: fornece estas ferramentas, orientação graph-first no ciclo de vida, diagnóstico de obsolescência e reconciliação da integração Git.
- **Upstream `graphify pi install`** (também documentado upstream como `graphify install --platform pi`) instala a skill completa do graphify e a integração de prompt do projeto. Escreve a skill global `~/.pi/agent/skills/graphify/SKILL.md` e seus arquivos em `references/`, o prompt do projeto `.pi/prompts/graphify.md` e uma seção do graphify em `AGENTS.md`.

Instale a integração upstream separadamente quando quiser a orientação completa do pipeline. `graphify-pi` continua sendo a superfície de instalação da extensão do Pi.

## Por que minimal

Esta extensão permanece deliberadamente pequena e delega o grafo e o Git ao upstream. Cada escolha de design reduz a pegada:

- **Registro consciente do grafo** — build e status ficam disponíveis para configuração e diagnóstico; query/path/explain/update só são registrados quando `graphify-out/graph.json` existe, mantendo a orientação graph-first fora de repositórios sem grafo.
- **Obsolescência via Git** — `git rev-list --count HEAD --since=<graph-mtime>` verifica o desvio em ~8ms. Sem caminhadas de arquivos, sem arquivos de estado extras.
- **Execução limitada** — stdout+stderr limitados a 1 MiB (configurável) para evitar OOM em grafos grandes. Trunca em limites de linha para saída limpa.
- **Zero configuração** — apenas variáveis de ambiente. Sem arquivos de configuração, sem autenticação, sem inicialização de coordenador.

## Instalação

```bash
pi install npm:@runecraft/graphify-pi
```

Isso instala somente a extensão do Pi. Não instala a CLI upstream do Graphify nem executa `graphify pi install`.

## Requisitos

- CLI do **[graphify](https://github.com/Graphify-Labs/graphify)** no `PATH` (ou defina `GRAPHIFY_BIN`). Instale com:
  ```bash
  uv tool install graphifyy
  ```
- **Node.js** ≥ 20
- **Pi** com suporte a extensões

Configuração inicial em um projeto:

```bash
graphify .             # ou chame graphify_build no Pi
graphify hook status   # opcional: inspecione a integração Git upstream
```

Quando existe um grafo, o graphify-pi reconcilia automaticamente essa integração Git upstream no início da sessão do Pi. Ele nunca instala a CLI sozinho.

## Configuração

Toda configuração via variáveis de ambiente — sem arquivos de configuração:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `GRAPHIFY_BIN` | `graphify` | Caminho para o binário do graphify |
| `GRAPHIFY_BUDGET` | `2000` | Limite padrão de tokens para resultados de `graphify_query` |
| `GRAPHIFY_STALE_COMMITS` | `1` | Commits mais recentes que o grafo antes da notificação de obsolescência |
| `GRAPHIFY_MAX_OUTPUT` | `1048576` (1 MiB) | Máximo de bytes do stdout+stderr da CLI antes do truncamento |
| `GRAPHIFY_BACKEND` | não definido | Backend semântico padrão para `graphify_build` (gemini\|kimi\|claude\|openai\|deepseek\|ollama) |

## Comportamento graph-first e ciclo de vida

Quando `graphify-out/graph.json` existe, a extensão adiciona orientação persistente ao prompt do Pi: para perguntas sobre código ou arquitetura, use `graphify_query`, `graphify_path` ou `graphify_explain` antes de `grep`, `find`, leituras brutas amplas ou outras buscas em arquivos. Use o grafo e `graphify-out/wiki/` antes de ler relatórios amplos como `GRAPH_REPORT.md`. Depois de editar código, execute `graphify_update` antes de confiar nas respostas do grafo. Se o grafo não responder a uma pergunta focada, leia os menores arquivos-fonte relevantes.

Quando qualquer arquivo está presente, o início da sessão também injeta um recorte limitado (≤ 3000 chars; até 2000 do relatório + até 1000 da wiki) de `graphify-out/GRAPH_REPORT.md` — incluindo a seção **Suggested Questions** quando o relatório tem uma — e `graphify-out/wiki/index.md` no prompt do sistema, para que o agente responda perguntas em linguagem natural sobre o código. A orientação da ferramenta `graphify_query` ensina o agente a expandir perguntas em linguagem natural para o vocabulário de tokens do próprio grafo (até 12 tokens retirados dos rótulos dos nós, nunca inventados) quando a correspondência lexical não encontra nós, e a recorrer ao `graphify_explain`/`graphify_path` com nomes em nível de símbolo.

Nenhuma orientação graph-first é injetada quando o grafo está ausente. `graphify_build` e `graphify_status` continuam disponíveis para criá-lo ou diagnosticá-lo. Quando a CLI está presente mas é anterior à `0.9.53` (faltam correções de consulta de truncamento, localização `at=` e tratamento de verbos), o início da sessão mostra um aviso de upgrade de uma linha.

```
session_start
  ├─ registra graphify_build + graphify_status
  ├─ graphify-out/graph.json existe?
  │   ├─ sim → registra query/path/explain/update + orientação + verifica obsolescência
  │   └─ não → sem orientação ou ferramentas do grafo
  ├─ before_agent_start → injeta recortes do GRAPH_REPORT.md + wiki (≤ 3000 chars)
  ├─ versão da CLI abaixo de 0.9.53? → aviso de upgrade de uma linha
  ├─ grafo + CLI disponível + repositório Git?
  │   ├─ graphify hook status
  │   └─ graphify hook install somente quando o status upstream indica integração incompleta
  └─ obsolescência: git rev-list --count HEAD --since=<mtime>
       └─ contagem > limite → notifica "grafo está N commits desatualizado"
```

### Integração Git upstream

A extensão é responsável pela reconciliação nas sessões do Pi, mas delega todo o comportamento Git à CLI upstream. Ela verifica `graphify hook status` e executa `graphify hook install` somente quando necessário. Isso é idempotente e não reimplementa scripts de hooks, sobrescreve conteúdo existente, instala a CLI ou ignora o tratamento upstream de `core.hooksPath` e worktrees vinculados.

O comando upstream instala os hooks `post-commit` e `post-checkout` de reconstrução do graphify e registra o merge driver de `graph.json`. Preserva o conteúdo existente dos hooks e grava nos locais de hooks/configuração Git escolhidos pelo upstream. Inspecione ou remova a integração upstream com:

```bash
graphify hook status
graphify hook uninstall
```

Como o graphify-pi reconcilia automaticamente, a remoção é intencional apenas até a próxima sessão do Pi com um grafo e uma CLI disponível. Se a configuração falhar, o Pi informa a falha; se a CLI estiver ausente, informa `graphify-pi requires graphify CLI. Install with: uv tool install graphifyy`.

A ferramenta `graphify_build` usa timeout de 5 minutos para as compilações, inclusive no modo standard; a extração semântica deep precisa desse limite maior. As ferramentas interativas (`query`/`path`/`explain`/`status`/`update`) usam 60s e captura de saída limitada. Nenhuma lógica de extração ou hooks Git é reimplementada — cada operação delega à CLI.

## Resultados do piloto

Medido no codebase do Squad (~25K nós):

| Métrica | Valor |
|---------|-------|
| Redução mediana de tokens | **83,2%** |
| Latência da verificação de obsolescência | **8,3 ms** |
| Precisão (3 tarefas de benchmark) | **3/3 em 2 de 3 tarefas** (100% em duas tarefas, parcial na terceira) |

## Licença

[MIT](LICENSE) — © 2026 Runecraft AI

---

<div align="center">

<a href="README.md">🇺🇸 Read in English</a>

</div>
