class MonarchApp {
    constructor() {
        this.dataStore = [];
        this.activeView = 'list';
        this.elements = {
            viewContainer: document.getElementById('viewContainer'),
            viewTitle: document.getElementById('viewTitle'),
            navItems: document.querySelectorAll('.nav-item'),
            csvUploader: document.getElementById('csvUploader'),
            taskListBody: document.getElementById('taskListBody'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            downloadCsvBtn: document.getElementById('downloadCsvBtn'),
            // Modal elements
            modal: document.getElementById('taskModal'),
            modalTitle: document.getElementById('modalTitle'),
            taskForm: document.getElementById('taskForm'),
            cancelBtn: document.getElementById('cancelBtn'),
            deleteTaskBtn: document.getElementById('deleteTaskBtn'),
            taskIdInput: document.getElementById('taskId'),
        };
        this.init();
    }

    init() {
        this.elements.csvUploader.addEventListener('change', this.handleFileUpload.bind(this));
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', () => this.setActiveView(item.dataset.view));
        });
        this.elements.addTaskBtn.addEventListener('click', () => this.openTaskModal());
        this.elements.downloadCsvBtn.addEventListener('click', this.downloadCsv.bind(this));
        this.elements.taskForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        this.elements.cancelBtn.addEventListener('click', () => this.closeTaskModal());
        this.elements.deleteTaskBtn.addEventListener('click', this.handleDeleteTask.bind(this));
    }

    // --- DATA MANAGEMENT ---
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true, dynamicTyping: true, skipEmptyLines: true,
            complete: (results) => {
                this.dataStore = results.data.map(d => ({...d, ID: d.ID || Date.now() + Math.random()}));
                this.render();
            }
        });
    }

    downloadCsv() {
        const csv = Papa.unparse(this.dataStore);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "monarch_plan_updated.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    updateTask(taskData) {
        const index = this.dataStore.findIndex(t => t.ID == taskData.ID);
        if (index > -1) {
            this.dataStore[index] = { ...this.dataStore[index], ...taskData };
        } else {
            // It's a new task
            this.dataStore.push({ ...taskData, ID: Date.now() });
        }
        this.render();
    }

    deleteTask(taskId) {
        this.dataStore = this.dataStore.filter(t => t.ID != taskId);
        this.render();
    }
    
    // --- NAVIGATION & RENDERING ---
    setActiveView(viewName) {
        this.activeView = viewName;
        this.elements.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}View`);
        });
        this.elements.viewTitle.textContent = document.querySelector(`.nav-item[data-view="${viewName}"]`).title;
    }

    render() {
        // This is the central render function. It will eventually render all views.
        this.renderListView();
        // Future render functions will go here (renderBoardView(), renderGanttView())
    }

    renderListView() {
        this.elements.taskListBody.innerHTML = '';
        if (this.dataStore.length === 0) {
            this.elements.taskListBody.innerHTML = '<tr><td colspan="7" class="placeholder-text">No data loaded. Upload a CSV to get started.</td></tr>';
            return;
        }

        this.dataStore.forEach(task => {
            const row = document.createElement('tr');
            row.dataset.taskId = task.ID;
            row.innerHTML = `
                <td>
                    <span class="status-badge ${task.Status.toLowerCase().replace(' ', '-')}">
                        <i class="${this.getStatusIcon(task.Status)}"></i>
                        ${task.Status}
                    </span>
                </td>
                <td>${task.Title}</td>
                <td>${task.Workstream || 'N/A'}</td>
                <td>${task.Owner || 'N/A'}</td>
                <td>${task.StartDate || 'N/A'}</td>
                <td>${task.EndDate || 'N/A'}</td>
                <td class="action-buttons">
                    <button class="edit-btn" title="Edit Task"><i class="fa-solid fa-pen"></i></button>
                </td>
            `;
            this.elements.taskListBody.appendChild(row);
        });
        
        // Add event listeners to the new edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.closest('tr').dataset.taskId;
                this.openTaskModal(taskId);
            });
        });
    }

    // --- MODAL & FORM LOGIC ---
    openTaskModal(taskId = null) {
        this.elements.taskForm.reset();
        if (taskId) {
            const task = this.dataStore.find(t => t.ID == taskId);
            if (task) {
                this.elements.modalTitle.textContent = 'Edit Task';
                this.elements.taskIdInput.value = task.ID;
                document.getElementById('title').value = task.Title || '';
                document.getElementById('status').value = task.Status || 'To Do';
                document.getElementById('workstream').value = task.Workstream || '';
                document.getElementById('owner').value = task.Owner || '';
                document.getElementById('startDate').value = task.StartDate || '';
                document.getElementById('endDate').value = task.EndDate || '';
                this.elements.deleteTaskBtn.classList.remove('hidden');
            }
        } else {
            this.elements.modalTitle.textContent = 'Add New Task';
            this.elements.taskIdInput.value = ''; // Clear ID for new task
            this.elements.deleteTaskBtn.classList.add('hidden');
        }
        this.elements.modal.classList.remove('hidden');
    }
    
    closeTaskModal() {
        this.elements.modal.classList.add('hidden');
    }

    handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const taskData = Object.fromEntries(formData.entries());
        taskData.ID = this.elements.taskIdInput.value; // Get the ID from hidden input
        this.updateTask(taskData);
        this.closeTaskModal();
    }
    
    handleDeleteTask() {
        const taskId = this.elements.taskIdInput.value;
        if (taskId && confirm('Are you sure you want to delete this task?')) {
            this.deleteTask(taskId);
            this.closeTaskModal();
        }
    }

    // --- UTILITY ---
    getStatusIcon(status) {
        switch (status) {
            case 'Done': return 'fa-solid fa-check-circle';
            case 'In Progress': return 'fa-solid fa-circle-half-stroke';
            default: return 'fa-regular fa-circle';
        }
    }
}

new MonarchApp();
