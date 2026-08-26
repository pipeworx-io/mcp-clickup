# mcp-clickup

ClickUp MCP — wraps the ClickUp REST API v2 (BYO API key)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `clickup_list_tasks` | List all tasks in a ClickUp list. Returns task ID, name, status, priority, assignees, due date, and URL. Provide list ID (e.g., "123456"). |
| `clickup_get_task` | Fetch full task details including name, description, status, priority, assignees, tags, and time tracking. Provide task ID (e.g., "9hz6c"). |
| `clickup_create_task` | Create a new task in a ClickUp list. Provide list ID, task name, and optionally priority and assignee. Returns task ID, name, status, and URL. |
| `clickup_list_spaces` | List all spaces in your ClickUp workspace. Returns space ID, name, and status. |
| `clickup_list_folders` | List all folders in a ClickUp space. Provide space ID (e.g., "789"). Returns folder ID, name, and list count. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "clickup": {
      "url": "https://gateway.pipeworx.io/clickup/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/clickup/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Clickup data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
