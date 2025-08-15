
// Initial array of quote objects.
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Hope" },
    { text: "The journey of a thousand miles begins with a single step.", category: "Life" }
];

// --- DOM Elements ---
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuote');
const exportQuotesBtn = document.getElementById('exportQuotes');
const importFile = document.getElementById('importFile');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const messageBox = document.getElementById('messageBox');

// --- Web Storage & JSON Functions ---

/**
 * saveQuotes() - Saves the current quotes array to local storage.
 * The quotes are converted to a JSON string before saving.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * loadQuotes() - Loads quotes from local storage and updates the global quotes array.
 * If no quotes are found, it initializes local storage with the default quotes.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        // Parse the JSON string back into a JavaScript object.
        quotes = JSON.parse(storedQuotes);
    } else {
        // If local storage is empty, save the initial quotes array.
        saveQuotes();
    }
}

/**
 * exportQuotesToJson() - Exports the quotes array as a downloadable JSON file.
 * It uses Blob and URL.createObjectURL to create a temporary download link.
 */
function exportQuotesToJson() {
    // Convert the quotes array to a JSON string with proper formatting.
    const jsonQuotes = JSON.stringify(quotes, null, 2);

    // Create a Blob from the JSON string with the correct MIME type.
    const blob = new Blob([jsonQuotes], { type: 'application/json' });

    // Create a temporary URL for the Blob.
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element for the download.
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json'; // The name of the downloaded file.
    document.body.appendChild(a);
    a.click();

    // Clean up the temporary elements and URL.
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Quotes exported successfully!', 'bg-blue-100 text-blue-800');
}

/**
 * importFromJsonFile(event) - Reads a JSON file and imports the quotes.
 * This function is triggered by the 'onchange' event of the file input.
 * @param {Event} event - The file change event.
 */
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            // Ensure the imported data is an array before proceeding.
            if (Array.isArray(importedQuotes)) {
                // Add the imported quotes to the existing quotes array.
                quotes.push(...importedQuotes);
                saveQuotes(); // Save the updated quotes to local storage.
                showMessage('Quotes imported successfully!', 'bg-yellow-100 text-yellow-800');
                showRandomQuote(); // Update the display with a new quote.
            } else {
                showMessage('Error: The file does not contain a valid JSON array of quotes.', 'bg-red-100 text-red-800');
            }
        } catch (error) {
            showMessage('Error parsing JSON file. Please ensure the file format is correct.', 'bg-red-100 text-red-800');
            console.error(error);
        }
    };
    // Read the content of the selected file as text.
    fileReader.readAsText(event.target.files[0]);
}

// --- Event Listeners ---
function createAddQuoteForm() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', () => {
        addQuote();
        saveQuotes(); // Save quotes after adding a new one.
    });
    exportQuotesBtn.addEventListener('click', exportQuotesToJson);
    importFile.addEventListener('change', importFromJsonFile);
}

// --- Core Functions (from previous task) ---

/**
 * showRandomQuote() - Displays a random quote from the 'quotes' array.
 */
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p class="text-xl font-medium text-gray-700">No quotes available. Add some to get started!</p>';
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    quoteDisplay.innerHTML = '';

    const quoteTextEl = document.createElement('p');
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteTextEl.className = "text-xl font-medium text-gray-700 leading-relaxed";

    const quoteCategoryEl = document.createElement('p');
    quoteCategoryEl.textContent = `- ${quote.category}`;
    quoteCategoryEl.className = "text-md font-normal text-gray-500 mt-4 italic";

    quoteDisplay.appendChild(quoteTextEl);
    quoteDisplay.appendChild(quoteCategoryEl);
    
    // Demonstrate session storage by saving the last viewed quote.
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

/**
 * addQuote() - Adds a new quote to the 'quotes' array and updates the UI.
 */
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text && category) {
        const newQuote = {
            text: text,
            category: category
        };
        quotes.push(newQuote);

        showMessage('Quote added successfully!', 'bg-blue-100 text-blue-800');
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        showRandomQuote();
    } else {
        showMessage('Please enter both a quote and a category.', 'bg-red-100 text-red-800');
    }
}

/**
 * showMessage() - Displays a temporary message to the user.
 */
function showMessage(message, classNames) {
    messageBox.textContent = message;
    messageBox.className = `mt-4 p-4 text-center text-sm font-medium rounded-lg ${classNames}`;
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

// --- Initial Call ---
// Load quotes from storage, create listeners, and display a quote on page load.
window.onload = () => {
    loadQuotes();
    createAddQuoteForm();
    showRandomQuote();
};