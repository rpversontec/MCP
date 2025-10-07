import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';
import axios from 'axios';

// Create an MCP server
const server = new McpServer({
    name: 'todo-mcp-server',
    version: '1.0.0'
});

// Define the URL for the existing to-do list API
const TODO_API_URL = 'http://localhost:3000/api/tasks';

// Register a tool to create a task
server.registerTool(
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
        try {
            // Call the to-do list API to create the task
            const response = await axios.post(TODO_API_URL, { text });
            const newTask = response.data;

            // Return the newly created task as structured content
            return {
                content: [{ type: 'text', text: `Tarea creada: ${JSON.stringify(newTask)}` }],
                structuredContent: newTask
            };
        } catch (error) {
            console.error('Error calling to-do API:', error.message);
            // Forward the error in a structured way if possible
            const errorMessage = error.response?.data?.error || error.message;
            throw new Error(`Failed to create task: ${errorMessage}`);
        }
    }
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
    // Create a new transport for each request
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || '4000');
app.listen(port, () => {
    console.log(`MCP Server for To-Do App running on http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});
