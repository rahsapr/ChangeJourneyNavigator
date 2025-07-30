// Wait for the entire webpage to load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the HTML elements we'll need to interact with
    const csvUploader = document.getElementById('csvUploader');

    // --- Event Listener for the File Uploader ---
    // This function will run whenever the user selects a file
    csvUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];

        // Check if a file was actually selected
        if (!file) {
            console.log("No file selected.");
            return; // Stop the function
        }

        console.log("File selected:", file.name);

        // Use Papa Parse to read the CSV file
        Papa.parse(file, {
            header: true, // This tells Papa Parse the first row of the CSV is the header
            dynamicTyping: true, // This automatically converts numbers and booleans
            skipEmptyLines: true, // Ignore any blank lines in the file
            complete: (results) => {
                // This function runs when parsing is finished
                console.log("Parsing Complete!");
                
                // We now call our new function to draw the map!
                renderMap(results.data); 
            },
            error: (error) => {
                // This function runs if there's an error parsing the file
                console.error("Error parsing CSV:", error);
                alert("There was an error parsing your CSV file. Please check the console for details.");
            }
        });
    });

    /**
     * Renders the milestones on the map based on the provided data.
     * @param {Array<Object>} milestones - An array of milestone objects from the CSV.
     */
    function renderMap(milestones) {
        const mapContainer = document.getElementById('mapContainer');
        // Clear any old milestones from the map before drawing new ones
        mapContainer.innerHTML = '';

        // Loop through each milestone object from our CSV data
        milestones.forEach(milestone => {
            // Create a new div element for the milestone marker
            const milestoneElement = document.createElement('div');
            
            // Add a general 'milestone' class for basic styling
            milestoneElement.className = 'milestone';

            // Add a specific class based on the 'Status' for color-coding
            // We'll convert "In Progress" to "in-progress" for a valid CSS class name
            const statusClass = milestone.Status.toLowerCase().replace(' ', '-');
            milestoneElement.classList.add(statusClass);

            // Position the milestone on the map using the X and Y coordinates
            milestoneElement.style.left = `${milestone.X_Coord}%`;
            milestoneElement.style.top = `${milestone.Y_Coord}%`;

            // Create an inner element for the title text
            const titleElement = document.createElement('div');
            titleElement.className = 'milestone-title';
            titleElement.textContent = milestone.Title;
            
            // Add the title to the milestone marker
            milestoneElement.appendChild(titleElement);

            // Add the completed milestone marker to the map
            mapContainer.appendChild(milestoneElement);
        });
    }

});
