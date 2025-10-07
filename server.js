const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

let tasks = [
    { id: 1, text: 'Aprender Node.js', completed: false },
    { id: 2, text: 'Crear una API REST', completed: true },
];
let nextId = 3;

// Obtener todas las tareas
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// Crear una nueva tarea
app.post('/api/tasks', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'El texto de la tarea es requerido' });
    }
    const newTask = {
        id: nextId++,
        text,
        completed: false
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Actualizar una tarea
app.put('/api/tasks/:id', (req, res) => {
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

// Eliminar una tarea
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id === parseInt(id));

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    tasks.splice(taskIndex, 1);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
