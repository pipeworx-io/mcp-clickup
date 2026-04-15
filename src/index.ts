interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * ClickUp MCP — wraps the ClickUp REST API v2 (BYO API key)
 *
 * Tools:
 * - clickup_list_tasks: list tasks in a list
 * - clickup_get_task: get a single task by ID
 * - clickup_create_task: create a new task in a list
 * - clickup_list_spaces: list spaces in a team/workspace
 * - clickup_list_folders: list folders in a space
 */


const BASE = 'https://api.clickup.com/api/v2';

// ── Tool definitions ──────────────────────────────────────────────────

const tools: McpToolExport['tools'] = [
  {
    name: 'clickup_list_tasks',
    description:
      'List tasks in a ClickUp list. Returns task ID, name, status, priority, assignees, due date, and URL.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'ClickUp API token' },
        list_id: { type: 'string', description: 'List ID to fetch tasks from' },
        page: { type: 'number', description: 'Page number (0-indexed, default 0)' },
      },
      required: ['_apiKey', 'list_id'],
    },
  },
  {
    name: 'clickup_get_task',
    description:
      'Get a single ClickUp task by ID. Returns full task details including name, description, status, priority, assignees, tags, and time tracking.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'ClickUp API token' },
        task_id: { type: 'string', description: 'Task ID' },
      },
      required: ['_apiKey', 'task_id'],
    },
  },
  {
    name: 'clickup_create_task',
    description:
      'Create a new task in a ClickUp list. Returns the created task ID, name, status, and URL.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'ClickUp API token' },
        list_id: { type: 'string', description: 'List ID to create the task in' },
        name: { type: 'string', description: 'Task name' },
        description: { type: 'string', description: 'Task description (markdown supported)' },
        priority: {
          type: 'number',
          description: 'Priority: 1 (urgent), 2 (high), 3 (normal), 4 (low)',
        },
        due_date: {
          type: 'number',
          description: 'Due date as Unix timestamp in milliseconds',
        },
      },
      required: ['_apiKey', 'list_id', 'name'],
    },
  },
  {
    name: 'clickup_list_spaces',
    description:
      'List spaces in a ClickUp team/workspace. Returns space ID, name, and status info.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'ClickUp API token' },
        team_id: { type: 'string', description: 'Team/workspace ID' },
      },
      required: ['_apiKey', 'team_id'],
    },
  },
  {
    name: 'clickup_list_folders',
    description:
      'List folders in a ClickUp space. Returns folder ID, name, and list count.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'ClickUp API token' },
        space_id: { type: 'string', description: 'Space ID' },
      },
      required: ['_apiKey', 'space_id'],
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

function extractKey(args: Record<string, unknown>): string {
  const key = args._apiKey as string;
  if (!key) throw new Error('ClickUp API key required. Pass _apiKey parameter.');
  return key;
}

async function clickupGet(apiKey: string, path: string, params?: Record<string, string>): Promise<unknown> {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  const res = await fetch(`${BASE}${path}${qs}`, {
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickUp API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function clickupPost(apiKey: string, path: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ClickUp API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Tool implementations ─────────────────────────────────────────────

async function listTasks(apiKey: string, listId: string, page?: number) {
  const params: Record<string, string> = { page: String(page ?? 0) };
  const data = (await clickupGet(apiKey, `/list/${listId}/task`, params)) as { tasks: unknown[] };
  return { tasks: data.tasks };
}

async function getTask(apiKey: string, taskId: string) {
  return clickupGet(apiKey, `/task/${taskId}`);
}

async function createTask(
  apiKey: string,
  listId: string,
  name: string,
  description?: string,
  priority?: number,
  dueDate?: number,
) {
  const body: Record<string, unknown> = { name };
  if (description) body.description = description;
  if (priority !== undefined) body.priority = priority;
  if (dueDate !== undefined) body.due_date = dueDate;

  return clickupPost(apiKey, `/list/${listId}/task`, body);
}

async function listSpaces(apiKey: string, teamId: string) {
  const data = (await clickupGet(apiKey, `/team/${teamId}/space`)) as { spaces: unknown[] };
  return { spaces: data.spaces };
}

async function listFolders(apiKey: string, spaceId: string) {
  const data = (await clickupGet(apiKey, `/space/${spaceId}/folder`)) as { folders: unknown[] };
  return { folders: data.folders };
}

// ── callTool dispatcher ──────────────────────────────────────────────

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = extractKey(args);

  switch (name) {
    case 'clickup_list_tasks':
      return listTasks(apiKey, args.list_id as string, args.page as number | undefined);
    case 'clickup_get_task':
      return getTask(apiKey, args.task_id as string);
    case 'clickup_create_task':
      return createTask(
        apiKey,
        args.list_id as string,
        args.name as string,
        args.description as string | undefined,
        args.priority as number | undefined,
        args.due_date as number | undefined,
      );
    case 'clickup_list_spaces':
      return listSpaces(apiKey, args.team_id as string);
    case 'clickup_list_folders':
      return listFolders(apiKey, args.space_id as string);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 10 } } satisfies McpToolExport;
