import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';

// --- Express App Setup ---
const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- To-Do List In-Memory Database and API Logic ---
let tasks = [
    { id: 1, text: 'Aprender Node.js', completed: false },
    { id: 2, text: 'Crear una API REST', completed: true },
];
let nextId = 3;

const apiRouter = express.Router();

// GET /api/tasks - Get all tasks
apiRouter.get('/tasks', (req, res) => {
    res.json(tasks);
});

// Function to add a task (will be used by API and MCP)
const addTask = (text) => {
    const newTask = {
        id: nextId++,
        text,
        completed: false
    };
    tasks.push(newTask);
    return newTask;
};

// POST /api/tasks - Create a new task
apiRouter.post('/tasks', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'El texto de la tarea es requerido' });
    }
    const newTask = addTask(text);
    res.status(201).json(newTask);
});

// PUT /api/tasks/:id - Update a task
apiRouter.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;
    const task = tasks.find(t => t.id === parseInt(id));

    if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (text !== undefined) {
        task.text = text;
    }
    if (completed !== undefined) {
        task.completed = completed;
    }
    res.json(task);
});

// DELETE /api/tasks/:id - Delete a task
apiRouter.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id === parseInt(id));

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    tasks.splice(taskIndex, 1);
    res.status(204).send();
});

app.use('/api', apiRouter);


// --- MCP Server Logic ---
const mcpServer = new McpServer({
    name: 'unified-todo-server',
    version: '1.0.0'
});

// Register a tool to create a task
mcpServer.registerTool(
    'createTask',
    {
        title: 'Create Task Tool',
        description: 'Creates a new task in the to-do list',
        inputSchema: { text: z.string().describe('The content of the task') },
        outputSchema: z.object({
            id: z.number(),
            text: z.string(),
            completed: z.boolean()
        })
    },
    async ({ text }) => {
        // Directly call the internal function instead of using axios
        const newTask = addTask(text);
        return {
            content: [{ type: 'text', text: `Tarea creada: ${JSON.stringify(newTask)}` }],
            structuredContent: newTask
        };
    }
);

// MCP endpoint
app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });
    res.on('close', () => transport.close());
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
});


// --- Start Server ---
const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`Unified Server listening on http://localhost:${port}`);
    console.log(`- To-Do App available at http://localhost:${port}`);
    console.log(`- MCP endpoint available at http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});