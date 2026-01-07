import './styles/main.css';
import {
    Project
} from './modules/classes.js';

import {
    loadData,
    removeTodoFromData,
    removeProjectFromData,
} from './modules/todoManager.js'

import * as UI from './modules/uiController.js';

import{
    saveTodos,
    saveProjects,
    getProjects,
} from "./modules/storage.js"

import {
    initEventListeners,
} from './modules/eventHandlers.js';


console.log("Webpack is working");


let todos = [];
let projects = [];
let selectedProject = null;
let selectedTodoIds = new Set();

async function initApp() {
    const savedProjects = getProjects();

    if(savedProjects) {
        projects = savedProjects.map(p => new Project(p));
    }else{
        projects = data.map(p => new Project(p));
    }
    todos = await loadData();
    renderApp(projects, todos);
}
function renderApp(projects, todos) {
    UI.closeAllModals();
    UI.renderSidebarProjects(projects, selectedProject, onProjectSelect);
    UI.renderTodoList(todos, selectedProject, handleDeleteTodo, handleDeleteProject);
    UI.renderCalendar(todos);
    UI.renderTaskStats(todos, selectedProject);
    
    console.log("App Rendered Successfully");
}
function onProjectSelect(projectName) {
    selectedProject = projectName;
    // if(selectedProject) renderApp();
}

function handleDeleteTodo(id) {
    const filteredList = removeTodoFromData(todos, id);
    todos.length = 0; 
    todos.push(...filteredList);

    saveTodos(todos);
    renderApp(projects, todos);
    
    console.log(`Todo ${id} deleted and UI updated`);
}

function handleDeleteProject() {
    if(selectedProject === "Work") {
        return alert("Can't delete work");
    }

    if(confirm(`Delete "${selectedProject}" and all its tasks?`)) {
        const {updatedProjects, updatedTodos} = removeProjectFromData(projects, todos, selectedProject);

        projects.length = 0;
        projects.push(...updatedProjects);
        todos.length = 0;
        todos.push(...updatedTodos);

        saveTodos(todos);
        saveProjects(projects);

        selectedProject = "Work";
        renderApp(projects, todos);
    }
}
const context = {
    todos,
    projects,
    selectedTodoIds,

    // 2. State Management for the "selectedProject" string
    // We use functions because strings are passed by value and wouldn't update otherwise
    getSelectedProject: () => selectedProject,

    onProjectSelect,
    renderApp, 
};
initEventListeners(context);

initApp();