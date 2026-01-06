
function saveTodos(todos) {
    localStorage.setItem('todos_json', JSON.stringify(todos));
}

function getTodos() {
    const saved = localStorage.getItem('todos_json');
    return saved ? JSON.parse(saved) : null;
}

function saveProjects(projects) {
    localStorage.setItem('projects_json', JSON.stringify(projects));
}

function getProjects() {
    const saved = localStorage.getItem('projects_json');
    return saved ? JSON.parse(saved) : null;
}
function initializeProjectStorage(dataPath, content) {
    localStorage.setItem(dataPath, JSON.stringify(content));
}
export {
    saveTodos,
    getTodos,
    saveProjects,
    getProjects,
    initializeProjectStorage,
};