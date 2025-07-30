// Wait for the entire webpage to load before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the HTML elements we'll need
    const csvUploader = document.getElementById('csvUploader');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const closeButton = document.querySelector('.close-button');
    // --- NEW: Get references to progress bar elements ---
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    // --- Event Listener for the File Uploader ---
    csvUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true, dynamicTyping: true, skipEmptyLines: true,
            complete: (results) => {
                console.log("Parsing Complete!");
                const milestones = results.data;
                
                // --- UPDATE: Now we call all our rendering functions ---
                renderMap(milestones);
                updateProgressBar(milestones);
                drawConnectingLines(milestones);
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                alert("There was an error parsing your CSV file.");
            }
        });
    });

    /** Renders the milestones on the map and attaches click events. */
    function renderMap(milestones) {
        const mapContainer = document.getElementById('mapContainer');
        mapContainer.innerHTML = '';

        milestones.forEach(milestone => {
            const milestoneElement = document.createElement('div');
            milestoneElement.className = 'milestone';
            
            const statusClass = milestone.Status.toLowerCase().replace(' ', '-');
            milestoneElement.classList.add(statusClass);

            milestoneElement.style.left = `${milestone.X_Coord}%`;
            milestoneElement.style.top = `${milestone.Y_Coord}%`;
            
            // Store data directly on the element for later use
            milestoneElement.dataset.title = milestone.Title;
            milestoneElement.dataset.description = milestone.Description;

            milestoneElement.addEventListener('click', () => {
                modalTitle.textContent = milestoneElement.dataset.title;
                modalDescription.textContent = milestoneElement.dataset.description;
                modal.classList.remove('hidden');
            });

            const titleElement = document.createElement('div');
            titleElement.className = 'milestone-title';
            titleElement.textContent = milestone.Title;
            milestoneElement.appendChild(titleElement);

            mapContainer.appendChild(milestoneElement);
        });
    }

    // --- NEW: Function to update the progress bar ---
    /** Calculates and displays the project completion percentage. */
    function updateProgressBar(milestones) {
        const completedCount = milestones.filter(m => m.Status === 'Complete').length;
        const totalCount = milestones.length;
        const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}% Complete`;
    }

    // --- NEW: Function to draw lines between milestones ---
    /** Draws lines connecting the milestones in order. */
    function drawConnectingLines(milestones) {
        const mapContainer = document.getElementById('mapContainer');

        for (let i = 0; i < milestones.length - 1; i++) {
            const startNode = milestones[i];
            const endNode = milestones[i + 1];

            // Get coordinates
            const x1 = startNode.X_Coord;
            const y1 = startNode.Y_Coord;
            const x2 = endNode.X_Coord;
            const y2 = endNode.Y_Coord;

            // Calculate distance and angle for the line
            // We use percentages, so the math is relative to the container
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            // Create the line element
            const line = document.createElement('div');
            line.className = 'line';
            
            // Style the line based on the STARTING node's status
            if (startNode.Status === 'Complete') {
                line.classList.add('complete');
            } else {
                line.classList.add('not-complete');
            }

            // Apply calculated styles
            line.style.width = `${length}%`;
            line.style.left = `${x1}%`;
            line.style.top = `${y1}%`;
            line.style.transform = `rotate(${angle}deg)`;
            
            mapContainer.appendChild(line);
        }
    }

    // --- Modal Closing Logic ---
    function closeModal() {
        modal.classList.add('hidden');
    }
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
});
