import './styles/main.css';
import data from './data/projects.json';
import demoProjectData from './data/temp_projects.json';
import workData from './data/work.json';
import gymData from './data/gym.json';
import personalData from './data/personal.json';
import sportsData from './data/sports.json';

const projectContentMap = {
    "Work": workData,
    "Gym": gymData,
    "Sports": sportsData,
    "Personal": personalData
};

console.log("Webpack is working");

class Event {
    constructor(item) {
        this.id = item.id;
        this.project_name = item.project_name;
        this.date = item.date;
        this.title = item.title;
        this.description = item.description;
        this.start_time = item.time?.start || item.start_time;
        this.end_time = item.time?.end || item.end_time;
        this.location = item.location;
    }
}

class Task {
    constructor(item) {
        this.id = item.id;
        this.project_name = item.project_name;
        this.date = item.date;
        this.title = item.title;
        this.description = item.description;
        this.status = item.status;
        this.priority = item.priority;
        this.start_time = item.start_time;
        this.end_time = item.end_time;
        this.extra = item.extra;
    }
}

class Project {
    constructor(item) {
        const timestamp = Date.now();
        this.id = item.id || `project-${timestamp}`;
        this.name = item.name;
        this.description = item.description;
        this.data_path = item.data_path || `./data/${timestamp}.json`;
        this.todos = item.todos || [];
        this.total_tasks = item.total_tasks|| 0;
        this.total_events = item.total_events || 0;
        this.tasks_completed = item.tasks_completed || 0;
        this.event_completed = item.event_completed || 0;   
        this.createdAt = item.createdAt || new Date().toISOString();
    }
}

let todos = [];
let projects = [];
let selectedProject = "Work";
let selectedTodoIds = new Set();

const mainContentSpace = document.querySelector('.content');
const eventList = document.querySelector('.event-list');
const taskList = document.querySelector('.task-list');
const projectList = document.querySelector('.project-list ul');
const markCompletBtn = document.querySelector('.mark-complete');
const addEventBtn = document.querySelector('.event-section .section-add');
const addTaskBtn = document.querySelector('.task-section .section-add');
const eventProjectDropdown = document.querySelector("#event-project-dropdown");
const taskProjectDropdown = document.querySelector("#task-project-dropdown");
const taskForm = document.querySelector("#task-entry-form");
const eventForm = document.querySelector("#event-entry-form");
const projectForm = document.querySelector("#project-entry-form");
const uiBackdrop = document.querySelector("#ui-backdrop");
const addProjectBtn = document.querySelector('.add-project');
const loadDemoDataBtn = document.querySelector('#load-demo-data-btn');
const clearDemoDataBtn = document.querySelector('#clear-demo-data-btn');

loadDemoDataBtn.addEventListener('click', () => {
    const newProjects = demoProjectData.map(item => new Project(item));

    const newTodos = newProjects.flatMap(project => {
        const contentData = projectContentMap[project.name];
        
        if (!contentData) {
            console.warn(`No data found for project: ${project.name}`);
            return [];
        }

        return contentData.items.map(item => {
            const itemWithProject = { ...item, project_name: project.name };
            
            return item.status 
                ? new Task(itemWithProject) 
                : new Event(itemWithProject);
        });
    });
    projects = newProjects;
    todos = newTodos;

    todos.sort(sortByDateAndTime);
    selectedProject = projects[0].name;

    renderSidebarProjects();
    renderTodoList();
    renderCalendar();
    renderTaskStats();

    loadDemoDataBtn.classList.add('hidden');
    clearDemoDataBtn.classList.remove('hidden');

    console.log("Demo data loaded from imports.");
});

clearDemoDataBtn.addEventListener('click', () => {
    projects = [];
    todos = [];

    renderApp();
    clearDemoDataBtn.classList.add('hidden');
});

async function loadData() {
    todos = [];
    const saveTodos = localStorage.getItem('todos_json');

    if(saveTodos) {
        const parsed = JSON.parse(saveTodos);

        parsed.forEach(item => {
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
}

function sortByDateAndTime(a, b) {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if(dateA - dateB !== 0) {
        return dateA - dateB;
    }
    return a.start_time.localeCompare(b.start_time);
}

function createGenericItem(todoItem, typeName) {
    const item = document.createElement('div');
    const time = document.createElement('div');
    const timeRange = document.createElement('div');
    const dashTime = document.createElement('span');
    const details = document.createElement('div');
    const title = document.createElement('div');
    const deleteBtn = document.createElement('button');
    
    
    item.classList.add('todo-item', `type-${typeName}`);
    time.classList.add('todo-time');
    timeRange.classList.add('time-range');
    dashTime.classList.add('time-dash');
    details.classList.add('todo-details');
    title.classList.add('todo-title');
    deleteBtn.classList.add('item-delete-btn');
    
    timeRange.textContent = todoItem.start_time + " ";
    dashTime.textContent = `- ${todoItem.end_time}`;
    title.textContent = todoItem.title;
    deleteBtn.innerHTML = '&times';
    
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTodo(todoItem.id);
    });

    timeRange.appendChild(dashTime);
    time.appendChild(timeRange);
    details.appendChild(title);
    
    item.appendChild(time);
    item.appendChild(details);
    item.appendChild(deleteBtn);
    item.id = todoItem.id;
    
    return {item, time, details};
}

function makeTaskElement(todoItem) {
    const {item, time, details} = createGenericItem(todoItem, 'task');
    
    const priority = document.createElement('div');
    const priorityClass = todoItem.priority ? todoItem.priority.toLowerCase() : 'low';
    priority.classList.add('todo-priority', priorityClass);
    priority.textContent = priorityClass.toUpperCase();
    time.appendChild(priority);

    const description = document.createElement('div');
    description.classList.add('todo-description');
    description.textContent = todoItem.description;
    details.appendChild(description);

    const typeLabel = document.createElement('div');
    typeLabel.classList.add('todo-type');
    typeLabel.textContent = 'Task';
    details.appendChild(typeLabel);
    
    return item;
}

function makeEventElement(todoItem) {
    const {item, time, details} = createGenericItem(todoItem, 'event');

    const priority = document.createElement('div');
    priority.classList.add('todo-priority', todoItem.priority || 'low');
    priority.textContent = (todoItem.priority || 'low').toUpperCase();
    time.appendChild(priority);

    const location = document.createElement('div');
    location.classList.add('event-location');
    location.textContent = `📍 ${todoItem.location}`;
    details.appendChild(location);

    const typeLabel = document.createElement('div');
    typeLabel.classList.add('todo-type');
    typeLabel.textContent = 'Event';
    details.appendChild(typeLabel);

    return item;
}

function createDaySection(sectionId, dayNumber, dayName) {
    const section = document.createElement('section');
    const container = document.createElement('div');
    const dayLeft = document.createElement('div');
    const dayNumDiv = document.createElement('div');
    const dayNameDiv = document.createElement('div');
    const todoContainer = document.createElement('div');

    section.id = sectionId;
    section.classList.add('day-section');
    container.classList.add('day-container');
    dayLeft.classList.add('day-left');
    dayNumDiv.classList.add('day-number');
    dayNameDiv.classList.add('day-name');
    todoContainer.classList.add('day-todos');

    dayNumDiv.textContent = dayNumber;
    dayNameDiv.textContent = dayName;

    dayLeft.appendChild(dayNumDiv);
    dayLeft.appendChild(dayNameDiv);
    
    container.appendChild(dayLeft);
    container.appendChild(todoContainer);
    
    section.appendChild(container);

    return { section, todoContainer};
}

function createMainContentSpaceHeading() {
    const headingContainer = document.createElement('div');
    const headingDateContainer = document.createElement('div');
    const h1 = document.createElement('h1');
    const projectHeading = document.createElement('div');
    const deleteBtnWrapper = document.createElement('div'); 
    const deleteProjectBtn = document.createElement('button');

    headingContainer.classList.add('content-heading-container');
    headingDateContainer.classList.add('heading-date-container');
    projectHeading.classList.add('project-heading');
    
    deleteBtnWrapper.classList.add('delete-project-wrapper'); 
    deleteProjectBtn.classList.add('delete-project-btn');

    headingDateContainer.textContent = 'Dec 2025';
    h1.textContent = selectedProject;
    deleteProjectBtn.textContent = 'Delete Project';

    if (selectedProject === "Work") {
        deleteProjectBtn.style.display = 'none'; // Use display:none instead of visibility:hidden
    } else {
        deleteProjectBtn.style.display = 'block'; // Ensure it's visible for other projects
    }

    deleteProjectBtn.addEventListener('click', () => deleteProject(selectedProject));

    headingContainer.appendChild(headingDateContainer);
    projectHeading.appendChild(h1);
    headingContainer.appendChild(projectHeading);
    
    deleteBtnWrapper.appendChild(deleteProjectBtn);
    headingContainer.appendChild(deleteBtnWrapper);

    mainContentSpace.appendChild(headingContainer);
}

function makeTaskListElement(item) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');

    input.classList.add('task-checkbox');
    input.type = 'checkbox';

    span.textContent = item.title;

    label.appendChild(input);
    label.appendChild(span);

    li.id = item.id;
    li.appendChild(label);

    return li;
}

function makeEventListElement(item) {
    const li = document.createElement('li');
    li.id = item.id;

    li.textContent = item.title;

    return li;
}

function renderTodoList() {
    mainContentSpace.innerHTML = '';
    eventList.innerHTML = '';
    taskList.innerHTML = '';

    let currentTodosContainer = null;
    let lastDate = null;
    createMainContentSpaceHeading();

    const filteredTodos = todos.filter(todo => todo.project_name === selectedProject && todo.status !== 'completed');
    
    filteredTodos.forEach(todo => {
        if(todo.date !== lastDate) {
            lastDate = todo.date;
    
            const dateObj = new Date(todo.date);
            const dayNum = String(dateObj.getDate()).padStart(2, '0');
            const dayName = dateObj.toLocaleDateString('en-US', {weekday: 'short'});
    
            const {section, todoContainer} = createDaySection(`day-${todo.date}`, dayNum, dayName);
            
            mainContentSpace.appendChild(section);
    
            currentTodosContainer = todoContainer;
        }
        
        if(todo instanceof Event) {
            eventList.appendChild(makeEventListElement(todo));
            currentTodosContainer.appendChild(makeEventElement(todo));
        }
        if(todo instanceof Task) {
            if(todo.status === 'pending') {
                taskList.appendChild(makeTaskListElement(todo));
                currentTodosContainer.appendChild(makeTaskElement(todo));
            }
        }
    });
}

function populateDropdown(projectDropdown) {
    projectDropdown.innerHTML = '';
    projects.forEach(project => {
        const projectOption = document.createElement('option');
        projectOption.setAttribute('value', `${project.name}`);
        projectOption.textContent = project.name;
        projectDropdown.appendChild(projectOption);
    });
}

function renderSidebarProjects() {
    projectList.innerHTML = '';
    projects.forEach(project => {
        const li = document.createElement('li');
        li.classList.add('project-card');
        if(project.name === selectedProject) li.classList.add('active');

        // Create name span
        const nameSpan = document.createElement('span');
        nameSpan.textContent = project.name;
        nameSpan.addEventListener('click', () => {
            selectedProject = project.name;
            renderSidebarProjects();
            renderTodoList();
        });

        li.appendChild(nameSpan);// Don't show delete on Work
        projectList.appendChild(li);
    });
}

function closeAllModals() {
    taskForm.classList.add('hidden');
    eventForm.classList.add('hidden');
    projectForm.classList.add('hidden');
    uiBackdrop.classList.add('hidden');

    taskForm.reset();
    eventForm.reset();
    projectForm.reset();
}

function renderCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    // 1. Keep the Day Labels (Sun-Sat), clear the dates
    const dayLabels = calendarGrid.querySelectorAll('.day-label');
    calendarGrid.innerHTML = '';
    dayLabels.forEach(label => calendarGrid.appendChild(label));

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // 2. Logic for days in the current month
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // 3. Render previous month placeholders (optional but keeps grid aligned)
    for (let i = 0; i < firstDayIndex; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'date p-month';
        calendarGrid.appendChild(placeholder);
    }

    // 4. Render the actual days
    for (let day = 1; day <= totalDays; day++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'date';
        dateDiv.textContent = day;

        if (day === now.getDate()) dateDiv.classList.add('current-day');

        // Match date string to your todo format (YYYY-MM-DD)
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 5. PRIORITY DOT LOGIC:
        // Filter tasks for this day and extract unique priorities
        const dayTodos = todos.filter(t => t.date === dateString);
        const uniquePriorities = [...new Set(dayTodos.map(t => t.priority))];

        // Create container for dots to manage positioning via CSS
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots-wrapper'; 
        // Note: You can also append dots directly to dateDiv as per your CSS

        // Map priorities to your CSS dot classes
        if (uniquePriorities.includes('high')) {
            const dot = document.createElement('span');
            dot.className = 'dot brown'; // High matches Brown in your CSS
            dateDiv.appendChild(dot);
        }
        if (uniquePriorities.includes('medium')) {
            const dot = document.createElement('span');
            dot.className = 'dot blue'; // Medium matches Blue in your CSS
            dateDiv.appendChild(dot);
        }
        if (uniquePriorities.includes('low')) {
            const dot = document.createElement('span');
            dot.className = 'dot green'; // Low matches Green in your CSS
            dateDiv.appendChild(dot);
        }

        calendarGrid.appendChild(dateDiv);
    }
}

function renderTaskStats() {
    const filteredTodos = todos.filter(t => t.project_name === selectedProject);
    const total = filteredTodos.length;
    const pending = filteredTodos.filter(t => t.status === 'pending').length;
    const completed = filteredTodos.filter(t => t.status === 'completed').length;
    
    // Calculate percentage (avoid division by zero)
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 2. Target the DOM elements in your sidebar
    const pendingEl = document.querySelector('.stat-item .stat-value:not(.completed)');
    const completedEl = document.querySelector('.stat-item .stat-value.completed');
    const barFillEl = document.querySelector('.stat-bar-fill');
    const footerEl = document.querySelector('.stat-footer');

    // 3. Update the UI
    if (pendingEl) pendingEl.textContent = pending;
    if (completedEl) completedEl.textContent = completed;
    
    if (barFillEl) {
        barFillEl.style.width = `${percentage}%`;
    }
    
    if (footerEl) {
        footerEl.textContent = `${percentage}% of monthly goal reached`;
    }
}

async function renderApp() {
    const savedProjects = localStorage.getItem('projects_json');

    if(savedProjects) {
        const parsed = JSON.parse(savedProjects);
        projects = parsed.map(p => new Project(p));
    }else{
        projects = data.map(p => new Project(p));
    }
    renderSidebarProjects();
    await loadData();
    renderTodoList();
    renderCalendar();
    renderTaskStats();
    
    console.log("App Rendered Successfully");
}


function saveTodos() {
    localStorage.setItem('todos_json', JSON.stringify(todos));
}

function deleteTodo() {
    if(confirm('Are you sure you want to delete this?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodoList();
    }
}

function deleteProject() {
    if(selectedProject === "Work") {
        return alert("Can't delete work");
    }

    if(confirm(`Delete "${selectedProject}" and all its tasks?`)) {
        todos = todos.filter(t => t.project_name !== selectedProject);
        projects = projects.filter(p => p.name !== selectedProject);

        saveTodos();
        localStorage.setItem('projects_json', JSON.stringify(projects));

        selectedProject = "Work";
        renderSidebarProjects();
        renderTodoList();
    }
}

taskList.addEventListener('change', (e) => {
    if(e.target.classList.contains('task-checkbox')) {
        const listItem = e.target.closest('li');
        const todoId = listItem.id;
        if(e.target.checked) {
            selectedTodoIds.add(todoId);
        }else{
            selectedTodoIds.delete(todoId);
        }

        if(selectedTodoIds.size > 0) {
            markCompletBtn.classList.remove('hidden');
        }else{
            markCompletBtn.classList.add('hidden');
        }
    }
});


markCompletBtn.addEventListener('click', (e) => {
    selectedTodoIds.forEach(id => {
        const todo = todos.find(t => t.id === id);
        if(todo) {
            todo.status = 'completed';  
        }
    });
    selectedTodoIds.clear();
    saveTodos();
    markCompletBtn.classList.add('hidden');
    renderTodoList();
    renderCalendar();
    renderTaskStats();
});

addEventBtn.addEventListener('click', (e) => {
    console.log("add event button is pressed");
    e.preventDefault();
    eventForm.classList.remove('hidden');
    uiBackdrop.classList.remove('hidden');
    populateDropdown(eventProjectDropdown);
});

addTaskBtn.addEventListener('click', (e) => {
    console.log("add task button is preseed");
    e.preventDefault();
    taskForm.classList.remove('hidden');
    uiBackdrop.classList.remove('hidden');
    populateDropdown(taskProjectDropdown);

    taskProjectDropdown.value = selectedProject;
});

addProjectBtn.addEventListener('click', (e) => {
    console.log('Add project Button Pressed');
    e.preventDefault();
    projectForm.classList.remove('hidden');
    uiBackdrop.classList.remove('hidden');
});

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(taskForm);
    const dataObj = Object.fromEntries(formData.entries());

    const newTask = new Task({
        ...dataObj,
        id: `task-${Date.now()}`
    });
    todos.push(newTask);
    todos.sort(sortByDateAndTime);
    saveTodos();

    closeAllModals();
    renderTodoList();
    console.log("Task Added Successfully");
});

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(eventForm);
    const dataObj = Object.fromEntries(formData.entries());

    const newEvent = new Event({
        id: `event-${Date.now()}`,
        project_name: dataObj.project_name,
        date: dataObj.date,
        title: dataObj.title,
        description: dataObj.description,
        location: dataObj.location,
        time: {
            start: dataObj.start_time,
            end: dataObj.end_time
        }
    });

    todos.push(newEvent);
    todos.sort(sortByDateAndTime);
    saveTodos();

    closeAllModals();
    renderTodoList();
    console.log("New Event Added:");
});

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(projectForm);
    const dataObj = Object.fromEntries(formData.entries());

    const newProject = new Project(dataObj);
    projects.push(newProject);

    localStorage.setItem('projects_json', JSON.stringify(projects));
    const fileContent = {project_id: newProject.id, items: []};
    localStorage.setItem(newProject.data_path, JSON.stringify(fileContent));

    closeAllModals();
    renderSidebarProjects();

    console.log("Project Created:");
});

document.querySelectorAll('.cancel-trigger').forEach(btn => btn.addEventListener('click', closeAllModals));
renderApp();