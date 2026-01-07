import { 
    mainContentSpace, eventList, taskList, projectList, 
    taskForm, eventForm, projectForm, uiBackdrop, 
    calendarGrid, dayLabels, pendingStat, completedStat,
    barFill, statFooter
} from './domElements.js';

import { 
    createMainContentSpaceHeading, 
    createMainContentDaySection, 
    createEventListElement, 
    createTaskListElement, 
    createEventElement, 
    createTaskElement 
} from './domUtils.js';

import {Task, Event } from './classes.js';

function renderTodoList(todos, selectedProject, deleteTodo, deleteProject) {
    mainContentSpace.innerHTML = '';
    eventList.innerHTML = '';
    taskList.innerHTML = '';

    let currentTodosContainer = null;
    let lastDate = null;
    const heading = createMainContentSpaceHeading(selectedProject, deleteProject);
    mainContentSpace.appendChild(heading);

    console.log("Rendering for Project: ", selectedProject);
    console.log("Total Todos available: ", todos.length);

    const filteredTodos = todos.filter(todo => todo.project_name === selectedProject && todo.status !== 'completed');
    
    console.log("Filtered Todos: ", filteredTodos.length);

    filteredTodos.forEach(todo => {
        if(todo.date !== lastDate) {
            lastDate = todo.date;
    
            const dateObj = new Date(todo.date);
            const dayNum = String(dateObj.getDate()).padStart(2, '0');
            const dayName = dateObj.toLocaleDateString('en-US', {weekday: 'short'});
    
            const {section, todoContainer} = createMainContentDaySection(`day-${todo.date}`, dayNum, dayName);
            
            mainContentSpace.appendChild(section);
    
            currentTodosContainer = todoContainer;
        }
        
        if(todo instanceof Event) {
            eventList.appendChild(createEventListElement(todo));
            currentTodosContainer.appendChild(createEventElement(todo, deleteTodo));
        }
        if(todo instanceof Task) {
            if(todo.status === 'pending') {
                taskList.appendChild(createTaskListElement(todo));
                currentTodosContainer.appendChild(createTaskElement(todo, deleteTodo));
            }
        }
    });
}

function populateDropdown(projectDropdown, projects) {
    projectDropdown.innerHTML = '';
    projects.forEach(project => {
        const projectOption = document.createElement('option');
        projectOption.setAttribute('value', `${project.name}`);
        projectOption.textContent = project.name;
        projectDropdown.appendChild(projectOption);
    });
}

function renderSidebarProjects(projects, selectedProject, onProjectSelect) {
    projectList.innerHTML = '';
    projects.forEach(project => {
        const li = document.createElement('li');
        li.classList.add('project-card');
        if(project.name === selectedProject) li.classList.add('active');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = project.name;
        nameSpan.addEventListener('click', () => {
            onProjectSelect(project.name);
        });

        li.appendChild(nameSpan);
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

function renderCalendar(todos) {
    if (!calendarGrid) return;

    calendarGrid.innerHTML = '';
    dayLabels.forEach(label => calendarGrid.appendChild(label));

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'date p-month';
        calendarGrid.appendChild(placeholder);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'date';
        dateDiv.textContent = day;

        if (day === now.getDate()) dateDiv.classList.add('current-day');

        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dayTodos = todos.filter(t => t.date === dateString);
        const uniquePriorities = [...new Set(dayTodos.map(t => t.priority))];

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots-wrapper'; 

        if (uniquePriorities.includes('high')) {
            const dot = document.createElement('span');
            dot.className = 'dot red'; 
            dotsContainer.appendChild(dot);
        }
        if (uniquePriorities.includes('medium')) {
            const dot = document.createElement('span');
            dot.className = 'dot blue';
            dotsContainer.appendChild(dot);
        }
        if (uniquePriorities.includes('low')) {
            const dot = document.createElement('span');
            dot.className = 'dot green';
            dotsContainer.appendChild(dot);
        }
        dateDiv.appendChild(dotsContainer);
        calendarGrid.appendChild(dateDiv);
    }
}

function renderTaskStats(todos, selectedProject) {
    const filteredTodos = todos.filter(t => t.project_name === selectedProject);
    const total = filteredTodos.length;
    const pending = filteredTodos.filter(t => t.status === 'pending').length;
    const completed = filteredTodos.filter(t => t.status === 'completed').length;
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;


    if (pendingStat) pendingStat.textContent = pending;
    if (completedStat) completedStat.textContent = completed;
    
    if (barFill) {
        barFill.style.width = `${percentage}%`;
    }
    
    if (statFooter) {
        statFooter.textContent = `${percentage}% of monthly goal reached`;
    }
}
export{
    renderTodoList,
    populateDropdown,
    renderSidebarProjects,
    closeAllModals,
    renderCalendar,
    renderTaskStats,
}