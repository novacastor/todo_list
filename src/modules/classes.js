export class Event {
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

export class Task {
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

export class Project {
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