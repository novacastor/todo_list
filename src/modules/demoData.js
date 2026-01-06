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

    renderApp();

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
