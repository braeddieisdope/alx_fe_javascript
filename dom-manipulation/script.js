
// Initial array of quote objects. This will be overwritten by localStorage if data exists.
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
const categoryFilter = document.getElementById('categoryFilter');

// --- Web Storage & JSON Functions ---

/**
 * saveQuotes() - Saves the current quotes array to local storage.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * loadQuotes() - Loads quotes from local storage and updates the global quotes array.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        saveQuotes(); // Save the initial quotes array if local storage is empty.
    }
}

/**
 * exportQuotesToJson() - Exports the quotes array as a downloadable JSON file.
 */
function exportQuotesToJson() {
    const jsonQuotes = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonQuotes], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Quotes exported successfully!', 'bg-blue-100 text-blue-800');
}

/**
 * importFromJsonFile(event) - Reads a JSON file and imports the quotes.
 */
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                showMessage('Quotes imported successfully!', 'bg-yellow-100 text-yellow-800');
                populateCategories(); // Update categories after import.
                filterQuotes(); // Re-apply the filter.
            } else {
                showMessage('Error: The file does not contain a valid JSON array of quotes.', 'bg-red-100 text-red-800');
            }
        } catch (error) {
            showMessage('Error parsing JSON file. Please ensure the file format is correct.', 'bg-red-100 text-red-800');
            console.error(error);
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// --- Filtering Functions ---

/**
 * populateCategories() - Dynamically populates the category filter dropdown.
 * This function extracts unique categories from the quotes array.
 */
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = ''; // Clear existing options.

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    // Restore the last selected category from local storage.
    const lastFilter = localStorage.getItem('lastFilter');
    if (lastFilter) {
        categoryFilter.value = lastFilter;
    }
}

/**
 * filterQuotes() - Filters the displayed quotes based on the selected category.
 * This function is called when the dropdown value changes.
 */
function filterQuotes() {
    const selectedCategory = categoryFilter.value;

    // Save the selected filter to local storage.
    localStorage.setItem('lastFilter', selectedCategory);
    
    // Filter the quotes array.
    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display a random quote from the filtered list.
    showRandomQuote(filteredQuotes);
}

// --- Event Listeners ---
function createAddQuoteForm() {
    newQuoteBtn.addEventListener('click', () => {
        filterQuotes(); // Show a new quote from the current filtered list.
    });
    addQuoteBtn.addEventListener('click', () => {
        addQuote();
        saveQuotes();
    });
    exportQuotesBtn.addEventListener('click', exportQuotesToJson);
    importFile.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', filterQuotes); // Listen for changes in the filter dropdown.
}

// --- Core Functions ---

/**
 * showRandomQuote(filteredQuotes = quotes) - Displays a random quote from a given array.
 * @param {Array} filteredQuotes - An array of quote objects to choose from. Defaults to the full quotes array.
 */
function showRandomQuote(filteredQuotes = quotes) {
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p class="text-xl font-medium text-gray-700">No quotes available for this category. Add some to get started!</p>';
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];

    quoteDisplay.innerHTML = '';

    const quoteTextEl = document.createElement('p');
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteTextEl.className = "text-xl font-medium text-gray-700 leading-relaxed";

    const quoteCategoryEl = document.createElement('p');
    quoteCategoryEl.textContent = `- ${quote.category}`;
    quoteCategoryEl.className = "text-md font-normal text-gray-500 mt-4 italic";

    quoteDisplay.appendChild(quoteTextEl);
    quoteDisplay.appendChild(quoteCategoryEl);
    
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

        // Update the categories and re-filter after adding a new quote.
        populateCategories();
        filterQuotes();
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
window.onload = () => {
    loadQuotes();
    createAddQuoteForm();
    populateCategories(); // Populate categories on load.
    filterQuotes(); // Apply the last saved filter or show all quotes.
};