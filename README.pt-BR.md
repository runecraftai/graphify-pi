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
  <text x="364" y="194" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" font-weight="500" text-anchor="middle">~230 linhas</text>
  <!-- stat -->
  <rect x="60" y="220" width="260" height="36" rx="8" fill="#161b22" stroke="#30363d" stroke-width="1"/>
  <text x="76" y="244" fill="#3fb950" font-family="SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace" font-size="15" font-weight="600">83,2%</text>
  <text x="148" y="244" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="14">redução mediana de tokens</text>
</svg>

</div>

<br>

> Consulte o grafo de conhecimento do seu código dentro do Pi — quatro ferramentas, zero configuração, 83% menos tokens.

---

## O que faz

`@runecraft/graphify-pi` encapsula a CLI do [graphify](https://github.com/graphify/graphify) como uma extensão do Pi. Registra quatro ferramentas que permitem ao agente consultar, percorrer e explicar um grafo de conhecimento do código em vez de buscar em arquivos brutos.

| Ferramenta | Função |
|-----------|--------|
| `graphify_query` | Subgrafo BFS ao redor de conceitos que correspondem a uma pergunta em linguagem natural |
| `graphify_path` | Caminho mais curto entre dois nós (correspondência aproximada) |
| `graphify_explain` | Explicação em linguagem natural de um nó e seus vizinhos |
| `graphify_update` | Re-extração incremental de arquivos modificados (somente AST, sem custo de LLM) |

## Por que minimal

Esta extensão é deliberadamente pequena (~230 linhas). Cada escolha de design reduz a pegada:

- **Registro preguiçoso** — as ferramentas só aparecem quando `graphify-out/graph.json` existe, mantendo o prompt do sistema limpo para repositórios sem grafo.
- **Obsolescência via Git** — `git rev-list --count HEAD --since=<graph-mtime>` verifica o desvio em ~8ms. Sem caminhadas de arquivos, sem arquivos de estado extras.
- **Execução limitada** — stdout+stderr limitados a 1 MiB (configurável) para evitar OOM em grafos grandes. Trunca em limites de linha para saída limpa.
- **Zero configuração** — apenas variáveis de ambiente. Sem arquivos de configuração, sem autenticação, sem inicialização de coordenador.

## Instalação

```bash
pi install npm:@runecraft/graphify-pi
```

## Requisitos

- CLI do **[graphify](https://github.com/graphify/graphify)** no `PATH` (ou defina `GRAPHIFY_BIN`)
- **Node.js** ≥ 20
- **Pi** com suporte a extensões

## Configuração

Toda configuração via variáveis de ambiente — sem arquivos de configuração:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `GRAPHIFY_BIN` | `graphify` | Caminho para o binário do graphify |
| `GRAPHIFY_BUDGET` | `2000` | Limite padrão de tokens para resultados de `graphify_query` |
| `GRAPHIFY_STALE_COMMITS` | `1` | Commits mais recentes que o grafo antes da notificação de obsolescência |
| `GRAPHIFY_MAX_OUTPUT` | `1048576` (1 MiB) | Máximo de bytes do stdout+stderr da CLI antes do truncamento |

## Como funciona

```
session_start
  ├─ graphify-out/graph.json existe?
  │   ├─ sim → registra 4 ferramentas + verifica obsolescência
  │   └─ não → operação silenciosa (pegada zero)
  └─ verificação de obsolescência: git rev-list --count HEAD --since=<mtime>
       └─ contagem > limite → notifica "grafo está N commits desatualizado"
```

As ferramentas chamam a CLI do `graphify` com timeout de 60s e captura de saída limitada. Nenhuma lógica de extração é reimplementada — cada chamada delega ao binário fixado.

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
