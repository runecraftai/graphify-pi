# Project agent memory

This file is the project's committed base for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

- Pi integration and lifecycle behavior: `extensions/graphify.ts`; upstream Graphify owns extraction, output formats, and Git hook implementation.
- User-facing setup, upstream `graphify pi install` relationship, and hook cleanup: `README.md` and `README.pt-BR.md`.
