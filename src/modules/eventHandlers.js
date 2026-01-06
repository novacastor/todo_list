import * as UI from './uiController.js';
import * as DOM from './domElements.js';
import { Task, Event, Project } from './classes.js';
import { saveTodos, saveProjects, initializeProjectStorage} from './storage.js';
import { sortByDateAndTime } from './todoManager.js';
import demoProjectData from '../data/temp_projects.json';
import workData from '../data/work.json';
import gymData from '../data/gym.json';
import personalData from '../data/personal.json';
import sportsData from '../data/sports.json';

const projectContentMap = {
    "Work": workData,
    "Gym": gymData,
    "Sports": sportsData,
    "Personal": personalData
};

export function initEventListeners(context) {
    const { 
        todos, 
        projects, 
        selectedTodoIds, 
        getSelectedProject,
        onProjectSelect,
        renderApp,
    } = context;

    DOM.taskList.addEventListener('change', (e) => {
        if(e.target.classList.contains('task-checkbox')) {
            const listItem = e.target.closest('li');
            const todoId = listItem.id;
            if(e.target.checked) {
                selectedTodoIds.add(todoId);
            }else{
                selectedTodoIds.delete(todoId);
            }

            if(selectedTodoIds.size > 0) {
                DOM.markTodoCompletBtn.classList.remove('hidden');
            }else{
                DOM.markTodoCompletBtn.classList.add('hidden');
            }
        }
    });

    DOM.markTodoCompletBtn.addEventListener('click', (e) => {
        console.log("IDs to complete:", Array.from(selectedTodoIds));

        selectedTodoIds.forEach(id => {
            const todo = todos.find(t => String(t.id) === String(id));
            
            if(todo) {
                console.log("Found todo:", todo.title);
                todo.status = 'completed';  
            } else {
                console.error("Could not find todo with ID:", id);
            }
        });

        selectedTodoIds.clear();
        saveTodos(todos); 
        
        DOM.markTodoCompletBtn.classList.add('hidden');

        renderApp();
    });

    DOM.addEventBtn.addEventListener('click', (e) => {
        console.log("add event button is pressed");
        e.preventDefault();

        const selectedProject = getSelectedProject();
        // if(selectedProject === null) {
        //     if(confirm("You need to have a project first")) {
        //         DOM.projectForm.classList.remove('hidden');
        //         DOM.uiBackdrop.classList.remove('hidden');
        //     }else{
        //         return;
        //     }
        // }else{
        //     DOM.eventForm.classList.remove('hidden');
        //     DOM.uiBackdrop.classList.remove('hidden');
        //     UI.populateDropdown(DOM.eventProjectDropdown, projects);
    
        //     DOM.eventProjectDropdown.value = selectedProject;
        // }
        DOM.eventForm.classList.remove('hidden');
        DOM.uiBackdrop.classList.remove('hidden');
        UI.populateDropdown(DOM.eventProjectDropdown, projects);

        DOM.eventProjectDropdown.value = selectedProject;

    });

    DOM.addTaskBtn.addEventListener('click', (e) => {
        console.log("add task button is preseed");
        e.preventDefault();
        
        const selectedProject = getSelectedProject();
        // if(selectedProject === null) {
        //     if(confirm("You need to have a project first")) {
        //         DOM.projectForm.classList.remove('hidden');
        //         DOM.uiBackdrop.classList.remove('hidden');
        //     }else{
        //         return;
        //     }
        // }else{
        //     DOM.taskForm.classList.remove('hidden');
        //     DOM.uiBackdrop.classList.remove('hidden');
        //     UI.populateDropdown(DOM.eventProjectDropdown, projects);
    
        //     DOM.eventProjectDropdown.value = selectedProject;
        // }
        DOM.taskForm.classList.remove('hidden');
        DOM.uiBackdrop.classList.remove('hidden');
        UI.populateDropdown(DOM.eventProjectDropdown, projects);

        DOM.eventProjectDropdown.value = selectedProject;
    });

    DOM.addProjectBtn.addEventListener('click', (e) => {
       console.log('Add project Button Pressed');
        e.preventDefault();
        DOM.projectForm.classList.remove('hidden');
        DOM.uiBackdrop.classList.remove('hidden');
    });

    DOM.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(DOM.taskForm);
        const dataObj = Object.fromEntries(formData.entries());
    
        const newTask = new Task({
            ...dataObj,
            id: `task-${Date.now()}`
        });
        todos.push(newTask);
        todos.sort(sortByDateAndTime);
        saveTodos(todos);
    
        renderApp();
        console.log("Task Added Successfully");
    });

    DOM.eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const formData = new FormData(DOM.eventForm);
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
        saveTodos(todos);
    
        renderApp();
        console.log("New Event Added:");
    });

    DOM.projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const formData = new FormData(DOM.projectForm);
        const dataObj = Object.fromEntries(formData.entries());
    
        const newProject = new Project(dataObj);
        projects.push(newProject);
    
        saveProjects(projects);
        const fileContent = {project_id: newProject.id, items: []};
        initializeProjectStorage(newProject.data_path, fileContent);
    
        renderApp();
    
        console.log("Project Created:");
    });

    DOM.projectList.addEventListener('click', (e) => {
        const projectItem = e.target.closest('li');
        
        if (projectItem) {
            const projectName = projectItem.dataset.name || projectItem.textContent.trim();
            
            console.log(`Switching to project: ${projectName}`);
            
            onProjectSelect(projectName);
        }
    });

    DOM.cancelTriggerBtns.forEach(btn => {
        console.log("Cancel Buttton Pressed");
        btn.addEventListener('click', renderApp);
    });

    DOM.loadDemoDataBtn.addEventListener('click', () => {
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
        projects.length = 0; 
        projects.push(...newProjects);
        
        todos.length = 0;
        todos.push(...newTodos);

        todos.sort(sortByDateAndTime);

        saveProjects(projects);
        saveTodos(todos);

        todos.sort(sortByDateAndTime);
        onProjectSelect(projects[0].name)

        DOM.loadDemoDataBtn.classList.add('hidden');
        DOM.clearDemoDataBtn.classList.remove('hidden');

        console.log("Demo data loaded from imports.");
    });

    DOM.clearDemoDataBtn.addEventListener('click', () => {
        projects.length = 0;
        todos.length = 0;

        saveProjects(projects);
        saveTodos(todos);

        renderApp();
        onProjectSelect("work");
        DOM.clearDemoDataBtn.classList.add('hidden');
    });
}