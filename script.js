// Load categories from JSON file
function loadCategories() {
    fetch('categories.json')
        .then(response => response.json())
        .then(data => {
            const categoryList = document.getElementById('category-list');
            if (categoryList) {
                // Use a Set to store unique categories
                const uniqueCategories = new Set();
                data.forEach((category) => {
                    uniqueCategories.add(category['大分类']);
                });
                
                // Display unique categories
                Array.from(uniqueCategories).forEach((category, index) => {
                    const categoryElement = document.createElement('div');
                    categoryElement.classList.add('category-item');
                    categoryElement.innerHTML = `<a href="category.html?category=${index}">${category}</a>`;
                    categoryList.appendChild(categoryElement);
                });
            }
        })
        .catch(error => console.error('Error loading categories:', error));
}

// Load subcategories from JSON file
function loadSubcategories() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryIndex = urlParams.get('category');

    fetch('categories.json')
        .then(response => response.json())
        .then(data => {
            const subcategoryList = document.getElementById('subcategory-list');
            if (subcategoryList && categoryIndex !== null) {
                // Get the selected category name
                const uniqueCategories = Array.from(new Set(data.map(category => category['大分类'])));
                const selectedCategory = uniqueCategories[categoryIndex];

                // Filter subcategories by selected category
                const filteredSubcategories = data.filter(category => category['大分类'] === selectedCategory);
                filteredSubcategories.forEach((subcategory, index) => {
                    const subcategoryElement = document.createElement('div');
                    subcategoryElement.classList.add('subcategory-item');
                    subcategoryElement.innerHTML = `<a href="questions.html?category=${categoryIndex}&subcategory=${index}">${subcategory['小分类']}</a>`;
                    subcategoryList.appendChild(subcategoryElement);
                });
            }
        })
        .catch(error => console.error('Error loading subcategories:', error));
}

// Load questions from JSON file
function loadQuestions() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryIndex = urlParams.get('category');
    const subcategoryIndex = urlParams.get('subcategory');

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            const questionsList = document.getElementById('questions-list');
            if (questionsList) {
                // Filter questions based on category and subcategory
                const filteredQuestions = data.filter(question => question['类别'] === subcategoryIndex);
                filteredQuestions.forEach(question => {
                    const questionElement = document.createElement('div');
                    questionElement.classList.add('question-item');
                    questionElement.innerText = question['题目'];
                    questionsList.appendChild(questionElement);
                });
            }
        })
        .catch(error => console.error('Error loading questions:', error));
}

// Go back to the previous page
function goBack() {
    window.history.back();
}

// Determine which function to call based on the current page
window.onload = function() {
    if (document.getElementById('category-list')) {
        loadCategories();
    } else if (document.getElementById('subcategory-list')) {
        loadSubcategories();
    } else if (document.getElementById('questions-list')) {
        loadQuestions();
    }
};
