// Wait for the entire webpage to load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the HTML elements we'll need to interact with
    const csvUploader = document.getElementById('csvUploader');
    // --- NEW: Get references to our modal elements ---
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const closeButton = document.querySelector('.close-button');


    // --- Event Listener for the File Uploader ---
    csvUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                console.log("Parsing Complete!");
                renderMap(results.data); 
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                alert("There was an error parsing your CSV file. Please check the console for details.");
            }
        });
    });

    /**
     * Renders the milestones on the map and attaches click events.
     * @param {Array<Object>} milestones - An array of milestone objects from the CSV.
     */
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

            const titleElement = document.createElement('div');
            titleElement.className = 'milestone-title';
            titleElement.textContent = milestone.Title;
            
            milestoneElement.appendChild(titleElement);
            
            // --- NEW: Add the click event listener to each milestone ---
            milestoneElement.addEventListener('click', () => {
                // Populate the modal with the data from this specific milestone
                modalTitle.textContent = milestone.Title;
                modalDescription.textContent = milestone.Description;

                // Show the modal by removing the 'hidden' class
                modal.classList.remove('hidden');
            });

            mapContainer.appendChild(milestoneElement);
        });
    }

    // --- NEW: Functions to close the modal ---
    function closeModal() {
        modal.classList.add('hidden');
    }

    // Close the modal when the '×' button is clicked
    closeButton.addEventListener('click', closeModal);

    // Close the modal when the user clicks on the dark background area
    modal.addEventListener('click', (event) => {
        // We only close it if the click is on the modal background itself,
        // not on the content box inside it.
        if (event.target === modal) {
            closeModal();
        }
    });

});
