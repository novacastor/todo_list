import { getTodos } from './storage.js';
import { Task, Event } from './classes.js';
import data from '../data/projects.json';

async function loadData() {
    const todos = [];
    const savedTodos = getTodos();

    if(savedTodos) {
        savedTodos.forEach(item => {
            if(item.status) {
                todos.push(new Task(item));
            }else{
                todos.push(new Event(item));
            }
        });
    }else{
        data.forEach(item => {
            (item.type === 'task') ? todos.push(new Task(item)) : todos.push(new Event(item));
        });
    }

    todos.sort(sortByDateAndTime);
    console.log("Data Loaded");
    return todos;
}
function sortByDateAndTime(a, b) {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if(dateA - dateB !== 0) {
        return dateA - dateB;
    }
    return a.start_time.localeCompare(b.start_time);
}
function removeTodoFromData(todos, id) {
    if(confirm('Are you sure you want to delete this?')) {
        return todos.filter(t => t.id !== id);
    }
    return todos;
}
function removeProjectFromData(projects, todos, projectName) {
    const updatedProjects = projects.filter(p => p.name !== projectName);
    const updatedTodos = todos.filter(t => t.project_name !== projectName);
    
    return { updatedProjects, updatedTodos };
}
export{
    loadData,
    sortByDateAndTime,
    removeTodoFromData,
    removeProjectFromData,
};