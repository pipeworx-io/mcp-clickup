# mcp-clickup

ClickUp MCP — wraps the ClickUp REST API v2 (BYO API key)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Clickup data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
