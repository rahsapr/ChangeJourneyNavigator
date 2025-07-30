document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const csvUploader = document.getElementById('csvUploader');
    const phaseList = document.getElementById('phaseList');
    const overallProgressBar = document.getElementById('overallProgressBar');
    const overallProgressText = document.getElementById('overallProgressText');
    const detailView = document.getElementById('detailView');
    const starmapView = document.getElementById('starmapView');
    const toggleButton = document.getElementById('toggleButton');
    const detailPlaceholder = document.querySelector('.detail-placeholder');
    const detailContent = document.getElementById('detailContent');

    let allMilestones = [];
    let isStarmapVisible = false;

    // --- EVENT LISTENERS ---
    csvUploader.addEventListener('change', handleFileUpload);
    toggleButton.addEventListener('click', toggleView);

    // --- FUNCTIONS ---
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true, dynamicTyping: true, skipEmptyLines: true,
            complete: (results) => {
                allMilestones = results.data;
                renderDashboard();
            }
        });
    }
    
    function renderDashboard() {
        const phases = groupMilestonesByPhase(allMilestones);
        renderPhaseList(phases);
        updateOverallProgress(allMilestones);
        renderStarmap(allMilestones); // Render the map in the background
    }

    function groupMilestonesByPhase(milestones) {
        return milestones.reduce((acc, milestone) => {
            const phaseName = milestone.Phase || 'Uncategorized';
            if (!acc[phaseName]) {
                acc[phaseName] = [];
            }
            acc[phaseName].push(milestone);
            return acc;
        }, {});
    }

    function renderPhaseList(phases) {
        phaseList.innerHTML = '';
        for (const phaseName in phases) {
            const phaseMilestones = phases[phaseName];
            const phaseItem = document.createElement('div');
            phaseItem.className = 'phase-item';

            const completedInPhase = phaseMilestones.filter(m => m.Status === 'Complete').length;
            const phaseProgress = (completedInPhase / phaseMilestones.length) * 100;

            phaseItem.innerHTML = `
                <div class="phase-header">
                    <span class="phase-title">${phaseName}</span>
                    <div class="phase-progress-bar-container" style="width: 100px; background-color: var(--bg-dark); border-radius: 3px;">
                        <div class="phase-progress-bar" style="width: ${phaseProgress}%;"></div>
                    </div>
                </div>
                <div class="milestone-list">
                    ${phaseMilestones.map(milestone => `
                        <div class="milestone-item" data-id="${milestone.ID}">
                            <span class="status-indicator ${milestone.Status.toLowerCase().replace(' ', '-')}"></span>
                            <span class="milestone-title-text">${milestone.Title}</span>
                            ${milestone.Risk !== 'None' ? `<div class="risk-indicator" title="Risk: ${milestone.Risk}">!</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            phaseList.appendChild(phaseItem);
        }
        addPhaseEventListeners();
    }

    function addPhaseEventListeners() {
        document.querySelectorAll('.phase-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('expanded');
            });
        });

        document.querySelectorAll('.milestone-item').forEach(item => {
            item.addEventListener('click', () => {
                // Handle active state
                document.querySelectorAll('.milestone-item.active').forEach(active => active.classList.remove('active'));
                item.classList.add('active');
                
                const milestoneId = parseInt(item.dataset.id);
                const milestone = allMilestones.find(m => m.ID === milestoneId);
                showMilestoneDetails(milestone);
            });
        });
    }

    function showMilestoneDetails(milestone) {
        detailPlaceholder.classList.add('hidden');
        detailContent.classList.remove('hidden');

        document.getElementById('detailTitle').textContent = milestone.Title;
        document.getElementById('detailPhase').textContent = milestone.Phase;
        document.getElementById('detailDescription').textContent = milestone.Description;

        const statusBadge = document.getElementById('detailStatus');
        statusBadge.textContent = milestone.Status;
        statusBadge.className = `status-badge ${milestone.Status.toLowerCase().replace(' ', '-')}`;
        
        const riskBadge = document.getElementById('detailRisk');
        riskBadge.textContent = milestone.Risk;
        riskBadge.className = `risk-badge ${milestone.Risk.toLowerCase()}`;
    }

    function updateOverallProgress(milestones) {
        const completedCount = milestones.filter(m => m.Status === 'Complete').length;
        const percentage = (completedCount / milestones.length) * 100;
        overallProgressBar.style.width = `${percentage}%`;
        overallProgressText.textContent = `${Math.round(percentage)}% of Mission Complete`;
    }

    function toggleView() {
        isStarmapVisible = !isStarmapVisible;
        detailView.classList.toggle('hidden', isStarmapVisible);
        starmapView.classList.toggle('hidden', !isStarmapVisible);
        toggleButton.textContent = isStarmapVisible ? 'Show Details' : 'Show Starmap';
    }

    // --- STARMAP RENDERING (Adapted from old version) ---
    function renderStarmap(milestones) {
        starmapView.innerHTML = ''; // Clear previous map
        drawConnectingLines(milestones, starmapView); // Draw lines first
        milestones.forEach(milestone => {
            const el = document.createElement('div');
            el.className = `milestone ${milestone.Status.toLowerCase().replace(' ', '-')}`;
            el.style.left = `${milestone.X_Coord}%`;
            el.style.top = `${milestone.Y_Coord}%`;
            el.title = milestone.Title; // Hover to see title
            el.addEventListener('click', () => showMilestoneDetails(milestone));
            starmapView.appendChild(el);
        });
    }

    function drawConnectingLines(milestones, container) {
        for (let i = 0; i < milestones.length - 1; i++) {
            const start = milestones[i];
            const end = milestones[i+1];
            const length = Math.sqrt(Math.pow((end.X_Coord - start.X_Coord), 2) + Math.pow((end.Y_Coord - start.Y_Coord), 2));
            const angle = Math.atan2(end.Y_Coord - start.Y_Coord, end.X_Coord - start.X_Coord) * 180 / Math.PI;
            
            const line = document.createElement('div');
            line.className = `line ${start.Status === 'Complete' ? 'complete' : 'not-complete'}`;
            line.style.width = `${length}%`;
            line.style.left = `${start.X_Coord}%`;
            line.style.top = `${start.Y_Coord}%`;
            line.style.transform = `rotate(${angle}deg)`;
            container.appendChild(line);
        }
    }
});
