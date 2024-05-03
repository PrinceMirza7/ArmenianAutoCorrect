function showSuggestions(suggestions) {
    var suggestionBoxes = document.querySelectorAll('.suggestion-box');

    if (document.getElementById('searchInput').value.trim() === '') {
        // Hide all suggestion boxes if the search input is empty
        suggestionBoxes.forEach(function(box) {
            box.style.display = 'none';
        });
        return;
    }

    // Capitalize the first letter of each suggestion
    suggestions = suggestions.map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });

    if (suggestions.length === 1) {
        suggestionBoxes[0].textContent = suggestions[0];
        suggestionBoxes[1].textContent = document.getElementById('searchInput').value;
        suggestionBoxes[0].style.display = 'block';
        suggestionBoxes[1].style.display = 'block';
        suggestionBoxes[2].style.display = 'none';
    } else if (suggestions.length === 0) {
        suggestionBoxes[0].textContent = document.getElementById('searchInput').value;
        suggestionBoxes[0].style.display = 'block';
        suggestionBoxes[1].style.display = 'none';
        suggestionBoxes[2].style.display = 'none';
    } else if (suggestions.length === 2) {
        suggestionBoxes.forEach(function(box, index) {
            if (index === 0) {
                box.textContent = suggestions[0];
            } else if (index === 1) {
                box.textContent = document.getElementById('searchInput').value;
            } else if (index === 2) {
                box.textContent = suggestions[1];
            }
            box.style.display = 'block';
        });
    } else if (suggestions.length < 3) {
        suggestionBoxes.forEach(function(box, index) {
            if (index < suggestions.length) {
                box.textContent = suggestions[index];
                box.style.display = 'block';
            } else {
                box.textContent = document.getElementById('searchInput').value;
                box.style.display = 'block';
            }
        });
    } else {
        for (var i = 0; i < 3; i++) {
            suggestionBoxes[i].textContent = suggestions[i];
            suggestionBoxes[i].style.display = 'block';
        }
    }
}



// Function to calculate Levenshtein distance between two strings
function levenshteinDistance(s1, s2) {
    var m = s1.length, n = s2.length;
    var dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

    for (var i = 0; i <= m; i++) {
        for (var j = 0; j <= n; j++) {
            if (i === 0) {
                dp[i][j] = j;
            } else if (j === 0) {
                dp[i][j] = i;
            } else if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

// Capitalize the first letter of the input field as the user types
document.getElementById('searchInput').addEventListener('input', function() {
    var inputValue = this.value;
    this.value = inputValue.charAt(0).toUpperCase() + inputValue.slice(1).toLowerCase();
    handleInput(); // Update suggestions based on the new input
});

// Call handleInput() function when the page is loaded to show initial suggestions
document.addEventListener("DOMContentLoaded", function() {
    handleInput();
});

// Call adjustSuggestionWidth() function when the page is loaded to set initial suggestion box widths
document.addEventListener("DOMContentLoaded", function() {
    adjustSuggestionWidth();
});

// Function to adjust suggestion box widths
function adjustSuggestionWidth() {
    console.log("adjustSuggestionWidth called");
    var searchInputWidth = document.getElementById('searchInput').offsetWidth;
    var suggestionBoxes = document.querySelectorAll('.suggestion-box');
    var totalMargin = 10 * (suggestionBoxes.length - 1); // Total margin between boxes
    var totalWidth = searchInputWidth - totalMargin;
    var boxWidth = totalWidth / suggestionBoxes.length;

    suggestionBoxes.forEach(function(box) {
        box.style.width = boxWidth + 'px';
    });
}

// Call adjustSuggestionWidth() function whenever window is resized to update suggestion box widths
window.addEventListener('resize', adjustSuggestionWidth);

// Event listener for input changes in the search input field
document.getElementById('searchInput').addEventListener('input', handleInput);

// Event listener for keypress to prevent typing of non-Armenian characters
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    var charCode = event.charCode;
    // Check if the pressed key is not an Armenian character
    if ((charCode < 1329 || charCode > 1424) && charCode !== 32) {
        event.preventDefault(); // Prevent the default action (typing)
    }
});

// Event listener for paste event to prevent pasting of non-Armenian characters
document.getElementById('searchInput').addEventListener('paste', function(event) {
    var clipboardData = event.clipboardData || window.clipboardData;
    var pastedText = clipboardData.getData('text');
    // Check if the pasted text contains non-Armenian characters
    if (!/^[Ա-Ֆա-ֆ\s]*$/.test(pastedText)) {
        event.preventDefault(); // Prevent the default action (pasting)
    }
});

// Prevent drag and drop into the search input field
document.getElementById('searchInput').addEventListener('dragover', function(event) {
    event.preventDefault(); // Prevent the default action (dragover)
});

document.getElementById('searchInput').addEventListener('drop', function(event) {
    event.preventDefault(); // Prevent the default action (drop)
});


// Import wordList from list.js
document.write('<script src="list.js" type="text/javascript"></script>');

function handleInput() {
    var inputElement = document.getElementById('searchInput');
    var query = inputElement.value.trim(); // Remove leading and trailing whitespace
    var suggestions = [];

    if (query.length > 0) {
        // Check for exact matches first
        suggestions = wordList.filter(function(word) {
            return word.startsWith(query.toLowerCase());
        });

        // If no exact matches, find similar words
        if (suggestions.length === 0) {
            suggestions = findSimilarWords(query.toLowerCase());
        }

        // Display only the top 3 suggestions
        suggestions = suggestions.slice(0, 3);
    }

    // Display the suggestions
    showSuggestions(suggestions);
}

function findSimilarWords(query) {
    // Calculate Levenshtein distance between query and each word in the word list
    var similarWords = wordList.filter(function(word) {
        var distance = levenshteinDistance(word, query);
        var similarityPercentage = 100 - (distance / Math.max(word.length, query.length)) * 100;
        return similarityPercentage >= 70 && word.length < query.length; // Words with at least 50% similarity and shorter length
    });

    return similarWords;
}

// Function to handle click on suggestion boxes
function handleSuggestionClick(event) {
    // Get the text content of the clicked suggestion box
    var suggestionText = event.target.textContent;
    
    // Replace the content of the search input with the suggestion text
    document.getElementById('searchInput').value = suggestionText;
    
    // Hide suggestion boxes
    var suggestionBoxes = document.querySelectorAll('.suggestion-box');
    suggestionBoxes.forEach(function(box) {
        box.style.display = 'none';
    });
}

// Add click event listeners to suggestion boxes
var suggestionBoxes = document.querySelectorAll('.suggestion-box');
suggestionBoxes.forEach(function(box) {
    box.addEventListener('click', handleSuggestionClick);
});

// Get the toggle mode button
var toggleModeButton = document.getElementById('toggleModeButton');

// Add click event listener to the button
toggleModeButton.addEventListener('click', function() {
    // Toggle a class on the body to switch between mobile and desktop mode
    document.body.classList.toggle('mobile-mode');
    
    // Adjust suggestion box widths when toggling modes
    adjustSuggestionWidth();
});

// Function to adjust suggestion box widths based on the current mode
function adjustSuggestionWidth() {
    var searchInputWidth = document.getElementById('searchInput').offsetWidth;
    var suggestionBoxes = document.querySelectorAll('.suggestion-box');
    var totalMargin = 10 * (suggestionBoxes.length - 1); // Total margin between boxes
    var totalWidth = searchInputWidth - totalMargin;
    var boxWidth;

    // Check if in mobile mode
    if (document.body.classList.contains('mobile-mode')) {
        // Set suggestion box width to 100% in mobile mode
        boxWidth = '100%';
    } else {
        // Calculate suggestion box width in desktop mode
        boxWidth = totalWidth / suggestionBoxes.length + 'px';
    }

    suggestionBoxes.forEach(function(box) {
        box.style.width = boxWidth;
    });
}
