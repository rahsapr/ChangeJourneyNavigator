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
                console.log("Parsed Data:", results.data);

                // In the next step, we will call functions to build the map here.
                // For now, we just log the data to confirm it works.
            },
            error: (error) => {
                // This function runs if there's an error parsing the file
                console.error("Error parsing CSV:", error);
                alert("There was an error parsing your CSV file. Please check the console for details.");
            }
        });
    });

});
