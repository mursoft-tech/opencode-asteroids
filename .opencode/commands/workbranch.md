---
description: Crea un git worktree en .worktrees/ a partir del argumento propocionado
---

Crea un worktree de Git basándote en el argumento: $ARGUMENTS

Reglas:
- Deriva el nombre normalizándolo a slug: minúsculas y espacios/caracteres inválidos
  reemplazados por guiones (ej. "Arreglar bug de colisiones" -> arreglar-bug-de-colisiones).
- Ejecuta EXACTAMENTE este comando, y nada más:
  git worktree add .worktrees/<nombre>
- No cambies de directorio, no ejecutes otros comandos, no hagas nada adicional.
- Si el argumento es muy largo, simplifícalo a un nombre significativo. 
