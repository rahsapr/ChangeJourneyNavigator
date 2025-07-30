class MonarchApp {
    constructor() {
        this.dataStore = [];
        this.activeView = 'list';
        this.boardGroupBy = 'Status'; // Default grouping for the board
        this.elements = {
            // ... (keep all existing selectors from the previous step)
            viewContainer: document.getElementById('viewContainer'),
            viewTitle: document.getElementById('viewTitle'),
            navItems: document.querySelectorAll('.nav-item'),
            csvUploader: document.getElementById('csvUploader'),
            taskListBody: document.getElementById('taskListBody'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            downloadCsvBtn: document.getElementById('downloadCsvBtn'),
            modal: document.getElementById('taskModal'),
            modalTitle: document.getElementById('modalTitle'),
            taskForm: document.getElementById('taskForm'),
            cancelBtn: document.getElementById('cancelBtn'),
            deleteTaskBtn: document.getElementById('deleteTaskBtn'),
            taskIdInput: document.getElementById('taskId'),
            // NEW Board elements
            boardGroupBy: document.getElementById('boardGroupBy'),
            groupBySelect: document.getElementById('groupBySelect'),
        };
        this.init();
    }

    init() {
        // ... (keep all existing event listeners)
        this.elements.csvUploader.addEventListener('change', this.handleFileUpload.bind(this));
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', () => this.setActiveView(item.dataset.view));
        });
        this.elements.addTaskBtn.addEventListener('click', () => this.openTaskModal());
        this.elements.downloadCsvBtn.addEventListener('click', this.downloadCsv.bind(this));
        this.elements.taskForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        this.elements.cancelBtn.addEventListener('click', () => this.closeTaskModal());
        this.elements.deleteTaskBtn.addEventListener('click', this.handleDeleteTask.bind(this));
        // NEW Board listener
        this.elements.groupBySelect.addEventListener('change', (e) => {
            this.boardGroupBy = e.target.value;
            this.renderBoardView();
        });
    }

    // --- DATA MANAGEMENT --- (No changes here)
    handleFileUpload(event) { /* ... same as before ... */
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
    downloadCsv() { /* ... same as before ... */
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
    updateTask(taskData) { /* ... same as before ... */
        const index = this.dataStore.findIndex(t => t.ID == taskData.ID);
        if (index > -1) {
            this.dataStore[index] = { ...this.dataStore[index], ...taskData };
        } else {
            this.dataStore.push({ ...taskData, ID: Date.now() });
        }
        this.render();
    }
    deleteTask(taskId) { /* ... same as before ... */
        this.dataStore = this.dataStore.filter(t => t.ID != taskId);
        this.render();
    }
    
    // --- NAVIGATION & RENDERING ---
    setActiveView(viewName) {
        this.activeView = viewName;
        // ... (same as before) ...
        this.elements.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}View`);
        });
        this.elements.viewTitle.textContent = document.querySelector(`.nav-item[data-view="${viewName}"]`).title;

        // NEW: Show/hide the GroupBy dropdown
        this.elements.boardGroupBy.classList.toggle('hidden', viewName !== 'board');
    }

    render() {
        // Now this renders all views
        this.renderListView();
        this.renderBoardView();
        // this.renderGanttView(); // Future
    }

    renderListView() { /* ... same as before ... */
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
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.closest('tr').dataset.taskId;
                this.openTaskModal(taskId);
            });
        });
    }

    // --- NEW: BOARD VIEW LOGIC ---
    renderBoardView() {
        const boardView = document.getElementById('boardView');
        if (this.dataStore.length === 0) {
            boardView.innerHTML = '<div class="placeholder-text">No data loaded.</div>';
            return;
        }

        const groupings = this.dataStore.reduce((acc, task) => {
            const key = task[this.boardGroupBy] || 'Uncategorized';
            if (!acc[key]) acc[key] = [];
            acc[key].push(task);
            return acc;
        }, {});

        boardView.innerHTML = Object.keys(groupings).map(groupName => `
            <div class="board-column" data-group-name="${groupName}">
                <div class="column-header">
                    ${groupName}
                    <span class="task-count">${groupings[groupName].length}</span>
                </div>
                <div class="column-cards">
                    ${groupings[groupName].map(task => this.createTaskCard(task)).join('')}
                </div>
            </div>
        `).join('');

        this.addBoardEventListeners();
    }

    createTaskCard(task) {
        return `
            <div class="task-card" draggable="true" data-task-id="${task.ID}">
                <div class="card-title">${task.Title}</div>
                <div class="card-footer">
                    <span class="card-owner-badge">${task.Owner || 'N/A'}</span>
                    <span class="risk-badge ${task.Risk || ''}" title="Risk: ${task.Risk}">
                        ${task.Risk === 'High' || task.Risk === 'Medium' ? `<i class="fa-solid fa-triangle-exclamation"></i>` : ''}
                    </span>
                </div>
            </div>
        `;
    }

    addBoardEventListeners() {
        const cards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.column-cards');

        cards.forEach(card => {
            card.addEventListener('dragstart', () => card.classList.add('dragging'));
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
            card.addEventListener('click', () => this.openDetailPanel(card.dataset.taskId));
        });

        columns.forEach(column => {
            column.addEventListener('dragover', e => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            column.addEventListener('dragleave', () => column.classList.remove('drag-over'));
            column.addEventListener('drop', e => {
                e.preventDefault();
                column.classList.remove('drag-over');
                const draggedCard = document.querySelector('.dragging');
                if (draggedCard) {
                    const taskId = draggedCard.dataset.taskId;
                    const newGroupValue = column.parentElement.dataset.groupName;
                    
                    // Update data store if grouping by Status
                    if (this.boardGroupBy === 'Status') {
                        const task = this.dataStore.find(t => t.ID == taskId);
                        if (task) {
                            task.Status = newGroupValue;
                            this.render(); // Re-render all views to sync
                        }
                    } else {
                        // For other groupings, just move the card visually without data change
                        column.appendChild(draggedCard);
                    }
                }
            });
        });
    }

    // --- NEW: DETAIL PANEL LOGIC ---
    openDetailPanel(taskId) {
        this.closeDetailPanel(); // Close any existing panel first

        const task = this.dataStore.find(t => t.ID == taskId);
        if (!task) return;

        const panel = document.createElement('div');
        panel.className = 'detail-panel';
        panel.id = 'activeDetailPanel';
        panel.innerHTML = `
            <div class="detail-panel-header">
                <h2>${task.Title}</h2>
                <button id="closeDetailPanelBtn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="detail-panel-content">
                <div class="detail-section">
                    <h3>Details</h3>
                    <div class="detail-grid">
                        <span class="label">Status</span> <span class="value">${task.Status}</span>
                        <span class="label">Owner</span> <span class="value">${task.Owner}</span>
                        <span class="label">Workstream</span> <span class="value">${task.Workstream}</span>
                        <span class="label">Phase</span> <span class="value">${task.Phase}</span>
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Dates</h3>
                    <div class="detail-grid">
                        <span class="label">Start Date</span> <span class="value">${task.StartDate || 'N/A'}</span>
                        <span class="label">End Date</span> <span class="value">${task.EndDate || 'N/A'}</span>
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Impact</h3>
                     <div class="detail-grid">
                        <span class="label">Risk</span> <span class="value">${task.Risk || 'None'}</span>
                        <span class="label">Impact Score</span> <span class="value">${task.ImpactScore || 'N/A'}</span>
                        <span class="label">Stakeholders</span> <span class="value">${task.StakeholderGroup || 'N/A'}</span>
                    </div>
                </div>
                <div class="detail-section">
                    <button class="control-btn edit-from-panel-btn"><i class="fa-solid fa-pen"></i> Edit Full Task</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Animate it into view
        setTimeout(() => panel.classList.add('visible'), 10);

        document.getElementById('closeDetailPanelBtn').addEventListener('click', () => this.closeDetailPanel());
        panel.querySelector('.edit-from-panel-btn').addEventListener('click', () => {
            this.closeDetailPanel();
            this.openTaskModal(taskId);
        });
    }

    closeDetailPanel() {
        const panel = document.getElementById('activeDetailPanel');
        if (panel) {
            panel.classList.remove('visible');
            setTimeout(() => panel.remove(), 300); // Remove from DOM after transition
        }
    }

    // --- MODAL & FORM LOGIC --- (No changes here)
    openTaskModal(taskId = null) { /* ... same as before ... */
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
            this.elements.taskIdInput.value = '';
            this.elements.deleteTaskBtn.classList.add('hidden');
        }
        this.elements.modal.classList.remove('hidden');
    }
    closeTaskModal() { /* ... same as before ... */
        this.elements.modal.classList.add('hidden');
    }
    handleFormSubmit(event) { /* ... same as before ... */
        event.preventDefault();
        const formData = new FormData(event.target);
        const taskData = Object.fromEntries(formData.entries());
        taskData.ID = this.elements.taskIdInput.value;
        this.updateTask(taskData);
        this.closeTaskModal();
    }
    handleDeleteTask() { /* ... same as before ... */
        const taskId = this.elements.taskIdInput.value;
        if (taskId && confirm('Are you sure you want to delete this task?')) {
            this.deleteTask(taskId);
            this.closeTaskModal();
        }
    }
    getStatusIcon(status) { /* ... same as before ... */
        switch (status) {
            case 'Done': return 'fa-solid fa-check-circle';
            case 'In Progress': return 'fa-solid fa-circle-half-stroke';
            default: return 'fa-regular fa-circle';
        }
    }
}

new MonarchApp();
