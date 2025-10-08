const { McpServer, StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/mcp.js');
const express = require('express');
const cors = require('cors');
const { z } = require('zod');

// --- Main App and Server Setup ---
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static('public'));

// --- To-Do List In-Memory Database ---
let tasks = [
    { id: 1, text: 'Aprender Node.js', completed: false },
    { id: 2, text: 'Crear una API REST', completed: true },
];
let nextId = 3;

// --- Internal Business Logic ---
const addTask = (text) => {
    const newTask = {
        id: nextId++,
        text,
        completed: false
    };
    tasks.push(newTask);
    return newTask;
};

// --- To-Do List API ---
const apiRouter = express.Router();
apiRouter.get('/tasks', (req, res) => res.json(tasks));
apiRouter.post('/tasks', (req, res) => {
    if (!req.body.text) return res.status(400).json({ error: 'El texto de la tarea es requerido' });
    res.status(201).json(addTask(req.body.text));
});
app.use('/api', apiRouter);

// --- MCP Server for MCP Inspector ---
const mcpServer = new McpServer({ name: 'all-in-one-server', version: '1.0.0' });
mcpServer.registerTool('createTask', {
    title: 'Create Task Tool',
    description: 'Creates a new task in the to-do list',
    inputSchema: { text: z.string() },
    outputSchema: z.object({ id: z.number(), text: z.string(), completed: z.boolean() })
}, async ({ text }) => {
    const newTask = addTask(text);
    return { content: [{ type: 'text', text: JSON.stringify(newTask) }], structuredContent: newTask };
});

app.get('/mcp', (req, res) => res.json({ message: 'MCP endpoint is active. Use POST.' }));
app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
    res.on('close', () => transport.close());
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

// --- OpenAPI Proxy for OpenWebUI ---
const openApiSpec = {
    openapi: '3.0.0',
    info: { title: 'To-Do App Tools', version: '1.0.0' },
    paths: {
        '/createTask': {
            post: {
                summary: 'Create a new task',
                operationId: 'createTask',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', properties: { text: { type: 'string' } } } } }
                },
                responses: { '200': { description: 'Task created' } }
            }
        }
    }
};

app.get('/openapi.json', (req, res) => res.json(openApiSpec));
app.post('/createTask', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'The "text" field is required.' });
    const newTask = addTask(text);
    res.status(201).json(newTask);
});

// --- Start the All-in-One Server ---
const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`All-in-One Server listening on port ${port}`);
    console.log(`- To-Do App UI: http://localhost:${port}`);
    console.log(`- MCP Endpoint: http://localhost:${port}/mcp`);
    console.log(`- OpenAPI Spec: http://localhost:${port}/openapi.json`);
}).on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});
