// Libreria para directorios
const path = require('path')

// Libreria para leer y escribir archivos
const fs = require('fs')

// Menu de ayuda
const helpMenu = `
    ----------------
    Task Manager CLI
    ----------------

    Use: node <file> <command> <params>

    Commands:
        - help
        - add "<task>"
        - update <taskId> "<task>"
        - delete <taskId>
        - mark-in-progress <taskId>
        - mark-done <taskId>
        - list
        - list <done|todo|in-progress>
`

// Ruta del archivo JSON donde se guardan las tareas
const jsonFilePath = path.join(__dirname, 'tasksDB.json')

// Comandos disponibles
const commands = [
    'help',
    'add',
    'update',
    'delete',
    'mark-in-progress',
    'mark-done',
    'list',
]

// Función para generar un ID único para cada tarea
function generateId() {
    const dataStr = fs.readFileSync(jsonFilePath, 'utf-8').toString()
    const tasks = JSON.parse(dataStr)

    if (tasks.length === 0) {
        return 1
    }

    const lastTask = tasks[tasks.length - 1]
    return lastTask.id + 1
}

// Función para agregar una tarea
function addTask(params) {
    const [taskDescription] = params

    let dataStr = fs.readFileSync(jsonFilePath, 'utf-8').toString()

    const tasks = JSON.parse(dataStr)

    if (tasks.length > 0) {
        const taskExists = tasks.find(
            (task) => task.description === taskDescription,
        )

        if (taskExists) {
            console.error('Task already exists, please add a different task')
            process.exit(1)
        }
    }

    const task = {
        id: generateId(),
        description: taskDescription,
        status: 'todo',
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
    }

    tasks.push(task)

    dataStr = JSON.stringify(tasks, null, 4)

    fs.writeFileSync(jsonFilePath, dataStr)

    console.log(`Task added successfully (ID: ${task.id})`)
}

// Función para actualizar una tarea
function updateTask(params) {
    const [task_id, taskDescription] = params

    const taskId = parseInt(task_id)

    if (isNaN(taskId)) {
        console.error(`Identifier <taskId> must be a number: ${task_id}`)
        process.exit(1)
    }

    let dataStr = fs.readFileSync(jsonFilePath, 'utf-8').toString()

    const tasks = JSON.parse(dataStr)

    const task = tasks.find((task) => task.id === taskId)

    if (!task) {
        console.error(`Task not found (ID: ${taskId})`)
        process.exit(1)
    }

    const taskDescriptionExists = tasks.find(
        (_task) => _task.description === taskDescription && _task.id !== taskId,
    )

    if (taskDescriptionExists) {
        console.error('Task already exists, please add a different task')
        process.exit(1)
    }

    task.description = taskDescription
    task.updatedAt = new Date().toLocaleString()

    dataStr = JSON.stringify(tasks, null, 4)

    fs.writeFileSync(jsonFilePath, dataStr)

    console.log(`Task updated successfully (ID: ${task.id})`)
}

// Función para eliminar una tarea
function deleteTask(params) {
    const [task_id] = params

    const taskId = parseInt(task_id)

    if (isNaN(taskId)) {
        console.error(`Identifier <taskId> must be a number: ${task_id}`)
        process.exit(1)
    }

    let dataStr = fs.readFileSync(jsonFilePath, 'utf-8').toString()

    const tasks = JSON.parse(dataStr)

    const taskIndex = tasks.findIndex((task) => task.id === taskId)

    if (taskIndex === -1) {
        console.error(`Task not found (ID: ${taskId})`)
        process.exit(1)
    }

    tasks.splice(taskIndex, 1)

    dataStr = JSON.stringify(tasks, null, 4)

    fs.writeFileSync(jsonFilePath, dataStr)

    console.log(`Task deleted successfully (ID: ${taskId})`)
}

// Función para marcar una tarea como en progreso o completada
function markTask(params, status) {
    const [task_id] = params

    const taskId = parseInt(task_id)

    if (isNaN(taskId)) {
        console.error(`Identifier <taskId> must be a number: ${task_id}`)
        process.exit(1)
    }

    let dataStr = fs.readFileSync(jsonFilePath, 'utf-8').toString()

    const tasks = JSON.parse(dataStr)

    const task = tasks.find((task) => task.id === taskId)

    if (!task) {
        console.error(`Task not found (ID: ${taskId})`)
        process.exit(1)
    }

    task.status = status
    task.updatedAt = new Date().toLocaleString()

    dataStr = JSON.stringify(tasks, null, 4)

    fs.writeFileSync(jsonFilePath, dataStr)

    console.log(`Task marked as ${status} (ID: ${task.id})`)
}

// Función para listar tareas
function listTasks(params) {
    const [status] = params

    let dataStr = fs.readFileSync(jsonFilePath, 'utf-8').toString()

    const tasks = JSON.parse(dataStr)

    if (!status) {
        console.table(tasks)
        process.exit(0)
    }

    const filteredTasks = tasks.filter((task) => task.status === status)

    if (filteredTasks.length === 0) {
        console.log(`No tasks found with status: ${status}`)
        process.exit(1)
    }

    console.table(filteredTasks)
    process.exit(0)
}

// Objeto que contiene las funciones CRUD
const crud = {
    add: addTask,
    update: updateTask,
    delete: deleteTask,
    'mark-in-progress': (params) => markTask(params, 'in-progress'),
    'mark-done': (params) => markTask(params, 'done'),
    list: listTasks,
}

// Función principal que se ejecuta al iniciar el script
function main() {
    if (!fs.existsSync(jsonFilePath)) {
        fs.writeFileSync(jsonFilePath, JSON.stringify([]))
    }

    const args = process.argv.slice(2)

    if (args.length === 0) {
        console.error('No commands provided, showing help\n', helpMenu)
        process.exit(1)
    }

    const [command, ...params] = args

    if (!commands.includes(command)) {
        console.error(`Unknown command: ${command}\n`, helpMenu)
        process.exit(1)
    }

    if (command.includes('help')) {
        console.log(helpMenu)
        process.exit(0)
    }

    if (!command.includes('list') && params.length === 0) {
        console.error(
            `No parameters provided for command: ${command}\n`,
            helpMenu,
        )
        process.exit(1)
    }

    crud[command](params)
}

main()
