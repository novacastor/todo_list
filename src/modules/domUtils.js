function createGenericItem(todoItem, typeName, onDelete) {
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
        onDelete(todoItem.id);
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

function createTaskElement(todoItem, onDelete) {
    const {item, time, details} = createGenericItem(todoItem, 'task', onDelete);
    
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

function createEventElement(todoItem, onDelete) {
    const {item, time, details} = createGenericItem(todoItem, 'event', onDelete);

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

function createMainContentDaySection(sectionId, dayNumber, dayName) {
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

function createMainContentSpaceHeading(selectedProject, onDeleteProject) {
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
        deleteProjectBtn.style.display = 'none';
    } else {
        deleteProjectBtn.style.display = 'block';
    }

    deleteProjectBtn.addEventListener('click', () => onDeleteProject(selectedProject));

    headingContainer.appendChild(headingDateContainer);
    projectHeading.appendChild(h1);
    headingContainer.appendChild(projectHeading);
    
    deleteBtnWrapper.appendChild(deleteProjectBtn);
    headingContainer.appendChild(deleteBtnWrapper);

    return headingContainer;
}

function createTaskListElement(item) {
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

function createEventListElement(item) {
    const li = document.createElement('li');
    li.id = item.id;

    li.textContent = item.title;

    return li;
}

export { 
    createTaskElement, 
    createEventElement, 
    createTaskListElement, 
    createEventListElement, 
    createMainContentSpaceHeading,
    createMainContentDaySection, 
}