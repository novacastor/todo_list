import './main.css';
import data from './data/temp.json'

console.log("Webpack is working");

class Event {
    constructor(item) {
        this.id = item.id;
        this.project_name = item.project_name;
        this.date = item.date;
        this.title = item.title;
        this.description = item.description;
        this.start_time = item.time.start;
        this.end_time = item.time.end;
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

let todos = [];
let projects = ["Project 1", "Project 2", "Project 3"];
const mainContentSpace = document.querySelector('.content');
const eventList = document.querySelector('.event-list');
const taskList = document.querySelector('.task-list');
const markCompletBtn = document.querySelector('.mark-complete');
const addEventBtn = document.querySelector('.event-section .section-add');
const addTaskBtn = document.querySelector('.task-section .section-add');
const eventProjectDropdown = document.querySelector("#event-project-dropdown");
const taskProjectDropdown = document.querySelector("#task-project-dropdown");
const taskForm = document.querySelector("#task-entry-form");
const eventForm = document.querySelector("#event-entry-form");
const uiBackdrop = document.querySelector("#ui-backdrop");

async function loadData() {
    data.forEach(item => {
        (item.type === 'task') ? todos.push(new Task(item)) : todos.push(new Event(item));
    });

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

    item.classList.add('todo-item', `type-${typeName}`);
    time.classList.add('todo-time');
    timeRange.classList.add('time-range');
    dashTime.classList.add('time-dash');
    details.classList.add('todo-details');
    title.classList.add('todo-title');
    
    timeRange.textContent = todoItem.start_time + " ";
    dashTime.textContent = `- ${todoItem.end_time}`;
    title.textContent = todoItem.title;
    
    timeRange.appendChild(dashTime);
    time.appendChild(timeRange);
    details.appendChild(title);
    
    item.appendChild(time);
    item.appendChild(details);
    item.id = todoItem.id;
    
    return {item, time, details};
}

function makeTaskElement(todoItem) {
    const {item, time, details} = createGenericItem(todoItem, 'task');
    
    const priority = document.createElement('div');
    priority.classList.add('todo-priority', todoItem.priority);
    priority.textContent = todoItem.priority.toUpperCase();
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
    const headingSpace = document.createElement('div');

    headingContainer.classList.add('content-heading-container');
    headingDateContainer.classList.add('heading-date-container');
    projectHeading.classList.add('project-heading');
    headingSpace.classList.add('heading-spacer');

    headingDateContainer.textContent = 'Dec 2025';
    h1.textContent = 'Test';

    headingContainer.appendChild(headingDateContainer);
    projectHeading.appendChild(h1);
    headingContainer.appendChild(projectHeading);
    headingContainer.appendChild(headingSpace);

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
    
    todos.forEach(todo => {
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
        const projectItem = document.createElement('option');
        projectItem.setAttribute('value', `${project}`);
        projectItem.textContent = project;
        projectDropdown.appendChild(projectItem);
    });
}

function closeAllModals() {
    taskForm.classList.add('hidden');
    eventForm.classList.add('hidden');
    uiBackdrop.classList.add('hidden');

    taskForm.reset();
    eventForm.reset();
}

async function renderApp() {
    await loadData();
    renderTodoList();
    
    console.log("App Rendered Successfully");
}

let selectedTodoIds = new Set();

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
    markCompletBtn.classList.add('hidden');
    renderTodoList();
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

    closeAllModals();
    renderTodoList();
    console.log("New Event Added:");
});
document.querySelectorAll('.cancel-trigger').forEach(btn => btn.addEventListener('click', closeAllModals));
renderApp();