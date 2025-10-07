document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    // Función para obtener y mostrar las tareas
    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error('No se pudieron obtener las tareas.');
            }
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error(error);
        }
    };

    // Función para renderizar las tareas en la lista
    const renderTasks = (tasks) => {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            if (task.completed) {
                li.classList.add('completed');
            }

            const span = document.createElement('span');
            span.textContent = task.text;
            span.addEventListener('click', () => toggleComplete(task.id, !task.completed));

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    };

    // Crear una nueva tarea
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text === '') return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });
            if (!response.ok) {
                throw new Error('No se pudo crear la tarea.');
            }
            taskInput.value = '';
            fetchTasks(); // Recargar la lista
        } catch (error) {
            console.error(error);
        }
    });

    // Marcar una tarea como completada/incompleta
    const toggleComplete = async (id, completed) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed }),
            });
            if (!response.ok) {
                throw new Error('No se pudo actualizar la tarea.');
            }
            fetchTasks(); // Recargar la lista
        } catch (error) {
            console.error(error);
        }
    };

    // Eliminar una tarea
    const deleteTask = async (id) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('No se pudo eliminar la tarea.');
            }
            fetchTasks(); // Recargar la lista
        } catch (error) {
            console.error(error);
        }
    };

    // Cargar las tareas al iniciar
    fetchTasks();
});
