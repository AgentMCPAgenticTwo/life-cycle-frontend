---
type: Reference
title: Querying the live codebase-memory-mcp graph
description: Ready-to-run MCP tool calls for re-deriving the facts in this bundle (hotspots, boundaries, clusters, routes) against the current graph.
resource: https://github.com/AgentMCPAgenticThree/life-cycle-frontend/tree/main/
tags: [frontend, reference, codebase-memory-mcp]
generated: { by: sage-maintenance/claude-code, at: 2026-10-13T06:17:20Z }
sources:
  - id: cbm-graph
    resource: codebase-memory-mcp project life-cycle-frontend @ 49e9748c4f7780464fab1d3fc10815d84e990e6f
    title: Codebase knowledge graph
status: stable
---

Project name: `life-cycle-frontend`. Prefer these over grepping source.

## Full architecture snapshot

```
get_architecture(project="life-cycle-frontend", aspects=["all"])
```

Returns node/edge counts, languages, packages, entry points, routes, hotspots,
boundaries, layers, clusters and the file tree in one call — this is how
[architecture.md](/architecture.md) and [overview.md](/overview.md) were built.

## Routes

```
query_graph(project="life-cycle-frontend",
  query="MATCH (r:Route) RETURN r.method AS method, r.name AS path, r.file_path AS file ORDER BY path")
```

Use `r.name` for the path, not `r.path` (Route nodes store the URL in `name`).

## Finding a symbol

```
search_graph(project="life-cycle-frontend", query="<keyword>")
get_code_snippet(project="life-cycle-frontend", qualified_name="<qn from search_graph>")
```

## Callers/callees of a hotspot

```
trace_path(project="life-cycle-frontend", function_name="setField", direction="inbound")
```

## One file's declarations

```
get_file_outline(project="life-cycle-frontend", file_path="src/App.jsx")
```

## Re-running the module/cluster cohesion numbers

`get_architecture(aspects=["clusters"])` returns `cohesion`, `top_nodes` and
`edge_types` per cluster id — this is the source for the "Feature clusters"
table in [architecture.md](/architecture.md). Re-run after any significant
refactor to check whether cluster membership shifted before editing this
bundle's module files.
