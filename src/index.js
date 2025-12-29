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

function renderTodoList() {
    const mainContentSpace = document.querySelector('.content');
    
    if(!mainContentSpace) {
        console.error("could not find .content element");
        return;
    }
    
    let currentTodosContainer = null;
    let lastDate = null;
    
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
    
        const item = (todo instanceof Task) ? makeTaskElement(todo) : makeEventElement(todo);
        currentTodosContainer.appendChild(item);
    });
}

async function renderApp() {
    await loadData();
    renderTodoList();
    
    console.log("App Rendered Successfully");
}
renderApp();