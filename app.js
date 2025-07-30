class CatalystApp {
    constructor() {
        this.data = [];
        this.activeView = 'board';
        this.elements = {
            viewContainer: document.getElementById('viewContainer'),
            viewTitle: document.getElementById('viewTitle'),
            navItems: document.querySelectorAll('.nav-item'),
            csvUploader: document.getElementById('csvUploader'),
        };
        this.init();
    }

    init() {
        this.elements.csvUploader.addEventListener('change', this.handleFileUpload.bind(this));
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', () => this.setActiveView(item.dataset.view));
        });
        this.renderPlaceholder();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true, dynamicTyping: true, skipEmptyLines: true,
            complete: (results) => {
                this.data = results.data;
                this.render();
            }
        });
    }

    setActiveView(viewName) {
        if (!this.elements.viewContainer.querySelector(`#${viewName}View`)) return;

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
        if (this.data.length === 0) {
            this.renderPlaceholder();
            return;
        }
        this.renderBoardView();
        this.renderHeatmapView();
        this.renderCommsView();
        this.setActiveView('board'); // Default to board view after load
    }
    
    renderPlaceholder() {
        this.elements.viewContainer.innerHTML = `<div class="view active" style="display: flex; justify-content: center; align-items: center; color: var(--text-secondary);">Load a Catalyst Plan CSV to begin.</div>`;
    }

    renderBoardView() {
        let boardView = document.getElementById('boardView');
        if (!boardView) {
            boardView = document.createElement('div');
            boardView.id = 'boardView';
            boardView.className = 'view';
            this.elements.viewContainer.appendChild(boardView);
        }

        const columns = this.data.reduce((acc, task) => {
            const status = task.Status || 'Backlog';
            if (!acc[status]) acc[status] = [];
            acc[status].push(task);
            return acc;
        }, {});

        const columnOrder = ['Complete', 'In Progress', 'Not Started', 'Backlog'];

        boardView.innerHTML = `
            <div class="board-columns">
                ${columnOrder.map(colName => {
                    const tasks = columns[colName] || [];
                    return `
                        <div class="board-column">
                            <div class="column-header">${colName} (${tasks.length})</div>
                            <div class="column-cards">
                                ${tasks.map(task => this.createTaskCard(task)).join('')}
                            </div>
                        </div>
                    `
                }).join('')}
            </div>
        `;
    }

    createTaskCard(task) {
        const impactClass = task.ImpactScore >= 8 ? 'high-impact' : task.ImpactScore >= 5 ? 'medium-impact' : '';
        const riskClass = task.Risk === 'High' ? 'high-risk' : '';
        const cardScale = 1 + (task.ImpactScore / 10) * 0.1; // Subtle size increase

        return `
            <div class="task-card ${impactClass} ${riskClass}" style="transform: scale(${cardScale});">
                <div class="card-title">${task.Title}</div>
                <div class="card-footer">
                    <span class="card-owner">${task.Owner}</span>
                    <span class="sentiment-weather" title="Sentiment: ${task.Sentiment}">
                        ${this.getSentimentIcon(task.Sentiment)}
                    </span>
                </div>
            </div>
        `;
    }

    getSentimentIcon(sentiment) {
        switch (sentiment) {
            case 'Positive': return '☀️';
            case 'Negative': return '⛈️';
            default: return '☁️';
        }
    }

    renderHeatmapView() {
        let heatmapView = document.getElementById('heatmapView');
        if (!heatmapView) {
            heatmapView = document.createElement('div');
            heatmapView.id = 'heatmapView';
            heatmapView.className = 'view';
            this.elements.viewContainer.appendChild(heatmapView);
        }
        // Placeholder - a real implementation would use a charting library
        heatmapView.innerHTML = `<h2>Stakeholder Heatmap (Coming Soon)</h2><p>This view will show the cumulative impact on each stakeholder group over time.</p>`;
    }

    renderCommsView() {
        let commsView = document.getElementById('commsView');
        if (!commsView) {
            commsView = document.createElement('div');
            commsView.id = 'commsView';
            commsView.className = 'view';
            this.elements.viewContainer.appendChild(commsView);
        }
        const commsTasks = this.data.filter(t => t.CommsNeeded === 'TRUE');
        commsView.innerHTML = `
            <h2>Comms Hub (${commsTasks.length} items require communication)</h2>
            <ul>
                ${commsTasks.map(task => `<li><strong>${task.Title}</strong>: impacts the <strong>${task.StakeholderGroup}</strong> team.</li>`).join('')}
            </ul>
        `;
    }
}

new CatalystApp();
