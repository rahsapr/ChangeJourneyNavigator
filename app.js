document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const csvUploader = document.getElementById('csvUploader');
    const phaseList = document.getElementById('phaseList');
    const overallProgressBar = document.getElementById('overallProgressBar');
    const overallProgressText = document.getElementById('overallProgressText');
    const starmapView = document.getElementById('starmapView');
    const detailView = document.getElementById('detailView');
    const closeDetailBtn = document.querySelector('.close-detail-view');
    const navItems = document.querySelectorAll('.nav-item');
    const mainContentView = document.querySelector('.main-content');
    const contextPanelView = document.querySelector('.context-panel');
    const dashboardView = document.getElementById('dashboardView');

    let allMilestones = [];

    // --- EVENT LISTENERS ---
    csvUploader.addEventListener('change', handleFileUpload);
    closeDetailBtn.addEventListener('click', showStarmap);
    navItems.forEach(item => item.addEventListener('click', handleNavClick));

    // --- MAIN FUNCTIONS ---
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true, dynamicTyping: true, skipEmptyLines: true,
            complete: (results) => {
                allMilestones = results.data;
                renderPlan();
            }
        });
    }
    
    function renderPlan() {
        const phases = groupMilestonesByPhase(allMilestones);
        renderPhaseList(phases);
        updateOverallProgress(allMilestones);
        renderStarmap(allMilestones);
        showStarmap(); // Show starmap by default after loading
    }
    
    function handleNavClick(event) {
        navItems.forEach(i => i.classList.remove('active'));
        const clickedItem = event.currentTarget;
        clickedItem.classList.add('active');
        const view = clickedItem.dataset.view;

        if (view === 'plan') {
            mainContentView.classList.remove('hidden');
            contextPanelView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        } else if (view === 'dashboard') {
            mainContentView.classList.add('hidden');
            contextPanelView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            // In the future, we would call a function here to render the dashboard
            console.log("Dashboard view selected. Feature to be implemented.");
        }
    }

    // --- UI RENDERING ---
    function groupMilestonesByPhase(milestones) {
        return milestones.reduce((acc, ms) => { (acc[ms.Phase] = acc[ms.Phase] || []).push(ms); return acc; }, {});
    }

    function renderPhaseList(phases) {
        phaseList.innerHTML = '';
        Object.keys(phases).forEach(phaseName => {
            const phaseMilestones = phases[phaseName];
            const phaseItem = document.createElement('div');
            phaseItem.className = 'phase-item';
            phaseItem.innerHTML = `
                <div class="phase-header">
                    <span class="phase-title">${phaseName}</span>
                    <i class="fa-solid fa-chevron-right chevron"></i>
                </div>
                <div class="milestone-list">
                    ${phaseMilestones.map(ms => `
                        <div class="milestone-item" data-id="${ms.ID}">
                            <span class="status-icon"><i class="${getIconForStatus(ms.Status)}"></i></span>
                            <span class="milestone-title-text">${ms.Title}</span>
                            ${ms.Risk !== 'None' ? `<span class="risk-icon" title="Risk: ${ms.Risk}"><i class="fa-solid fa-triangle-exclamation"></i></span>` : ''}
                        </div>
                    `).join('')}
                </div>`;
            phaseList.appendChild(phaseItem);
        });
        addInteractionListeners();
    }

    function addInteractionListeners() {
        document.querySelectorAll('.phase-header').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('expanded')));
        document.querySelectorAll('.milestone-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const alreadyActive = item.classList.contains('active');
                document.querySelectorAll('.milestone-item.active').forEach(i => i.classList.remove('active'));
                
                if (alreadyActive) {
                    showStarmap();
                } else {
                    item.classList.add('active');
                    const milestone = allMilestones.find(m => m.ID == item.dataset.id);
                    showMilestoneDetails(milestone);
                }
            });
        });
    }

    function showMilestoneDetails(milestone) {
        starmapView.classList.add('hidden');
        detailView.classList.remove('hidden');
        
        document.getElementById('detailTitle').textContent = milestone.Title;
        document.getElementById('detailPhase').textContent = milestone.Phase;
        document.getElementById('detailDescription').textContent = milestone.Description;

        const statusBadge = document.getElementById('detailStatus');
        statusBadge.textContent = milestone.Status;
        statusBadge.className = `badge ${milestone.Status.toLowerCase().replace(' ', '-')}`;
        
        const riskBadge = document.getElementById('detailRisk');
        riskBadge.textContent = milestone.Risk;
        riskBadge.className = `badge ${milestone.Risk.toLowerCase()}`;
    }

    function showStarmap() {
        starmapView.classList.remove('hidden');
        detailView.classList.add('hidden');
        document.querySelectorAll('.milestone-item.active').forEach(i => i.classList.remove('active'));
    }

    function updateOverallProgress(milestones) {
        const completed = milestones.filter(m => m.Status === 'Complete').length;
        const perc = (completed / milestones.length) * 100;
        overallProgressBar.style.width = `${perc}%`;
        overallProgressText.textContent = `${Math.round(perc)}% Complete (${completed}/${milestones.length})`;
    }

    function getIconForStatus(status) {
        if (status === 'Complete') return 'fa-solid fa-circle-check';
        if (status === 'In Progress') return 'fa-solid fa-circle-half-stroke';
        return 'fa-regular fa-circle';
    }

    // --- STARMAP LOGIC ---
    function renderStarmap(milestones) {
        starmapView.innerHTML = '';
        drawConnectingLines(milestones, starmapView);
        milestones.forEach(ms => {
            const el = document.createElement('div');
            el.className = `milestone ${ms.Status.toLowerCase().replace(' ', '-')}`;
            el.style.left = `${ms.X_Coord}%`;
            el.style.top = `${ms.Y_Coord}%`;
            el.title = ms.Title;
            el.addEventListener('click', () => {
                document.querySelector(`.milestone-item[data-id='${ms.ID}']`).click();
            });
            starmapView.appendChild(el);
        });
    }

    function drawConnectingLines(milestones, container) {
        for (let i = 0; i < milestones.length - 1; i++) {
            const s = milestones[i], e = milestones[i+1];
            const len = Math.sqrt(Math.pow((e.X_Coord-s.X_Coord),2)+Math.pow((e.Y_Coord-s.Y_Coord),2));
            const angle = Math.atan2(e.Y_Coord-s.Y_Coord, e.X_Coord-s.X_Coord) * 180 / Math.PI;
            const line = document.createElement('div');
            line.className = `line ${s.Status === 'Complete' ? 'complete' : 'not-complete'}`;
            line.style.cssText = `width:${len}%; left:${s.X_Coord}%; top:${s.Y_Coord}%; transform:rotate(${angle}deg);`;
            container.appendChild(line);
        }
    }
});
