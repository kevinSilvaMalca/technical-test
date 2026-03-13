# Claude Orchestrator

## Idioma
Responde siempre en español, aunque los archivos estén en inglés.

## Regla principal
Antes de escribir cualquier línea de código, leer y respetar todo lo definido en AGENT.md.
Nunca romper los límites arquitectónicos. Nunca mezclar capas.

## Human loop
- Completar una fase completa y esperar aprobación antes de pasar a la siguiente.
- Si hay dudas sobre un requerimiento, preguntar antes de asumir.
- Resumir siempre los archivos creados o modificados al terminar cada fase.

---

## Contrato arquitectónico
@AGENT.md

## Roadmap de fases
@AI_TASKS.md

## Prompts por fase
@MASTER_PROMPTS.md

## Sub-agentes por módulo
@agents/auth.md
@agents/products.md
@agents/orders.md
@agents/infra.md
