    let wordsTranslation = [];
    let phrasesTranslation = [];

    // Load translations from JSON files
    function loadTranslations() {
        fetch('translated_words.json')
            .then(response => response.json())
            .then(data => {
                wordsTranslation = data;
                console.log('Words Translation Loaded:', wordsTranslation);
            })
            .catch(error => console.error('Error loading words translation:', error));

        fetch('translated_phrases.json')
            .then(response => response.json())
            .then(data => {
                phrasesTranslation = data;
                console.log('Phrases Translation Loaded:', phrasesTranslation);
            })
            .catch(error => console.error('Error loading phrases translation:', error));
    }

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
                        categoryElement.innerHTML = `<a href="category.html?category=${encodeURIComponent(category)}">${category}</a>`;
                        categoryList.appendChild(categoryElement);
                    });
                }
            })
            .catch(error => console.error('Error loading categories:', error));
    }

    // Load subcategories from JSON file
    function loadSubcategories() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');

        fetch('categories.json')
            .then(response => response.json())
            .then(data => {
                const subcategoryList = document.getElementById('subcategory-list');
                if (subcategoryList && category !== null) {
                    // Filter subcategories by selected category
                    const filteredSubcategories = data.filter(item => item['大分类'] === category);
                    filteredSubcategories.forEach((subcategory, index) => {
                        const subcategoryElement = document.createElement('div');
                        subcategoryElement.classList.add('subcategory-item');
                        subcategoryElement.innerHTML = `<a href="questions.html?subcategory=${encodeURIComponent(subcategory['小分类'])}">${subcategory['小分类']}</a>`;
                        subcategoryList.appendChild(subcategoryElement);
                    });
                }
            })
            .catch(error => console.error('Error loading subcategories:', error));
    }

    // Load questions from JSON file
    function loadQuestions() {
        const urlParams = new URLSearchParams(window.location.search);
        const subcategory = urlParams.get('subcategory');

        fetch('categories.json')
            .then(response => response.json())
            .then(data => {
                // Load the related image based on the selected subcategory
                const subcategoryData = data.find(item => item['小分类'] === subcategory);
                if (subcategoryData && subcategoryData['图片'] !== '无图片') {
                    const imageContainer = document.getElementById('image-container');
                    const imgElement = document.createElement('img');
                    imgElement.src = `images/${subcategoryData['图片']}`;
                    imgElement.alt = subcategory;
                    imageContainer.appendChild(imgElement);
                }
            })
            .catch(error => console.error('Error loading categories for image:', error));

        fetch('questions.json')
            .then(response => response.json())
            .then(data => {
                const questionsList = document.getElementById('questions-list');
                if (questionsList) {
                    // Filter questions based on selected subcategory
                    const filteredQuestions = data.filter(question => question['类别'] === subcategory);
                    filteredQuestions.forEach(question => {
                        const questionTextWithTranslation = addTranslationToText(question['题目']);
                        const questionElement = document.createElement('div');
                        questionElement.classList.add('question-item');
                        questionElement.innerHTML = `
                            <p>${questionTextWithTranslation}</p>
                            <button onclick="toggleAnswer(this)">显示答案</button>
                            <div class="answer" style="display: none;">${question['答案']}</div>
                        `;
                        questionsList.appendChild(questionElement);
                    });
                }
            })
            .catch(error => console.error('Error loading questions:', error));
    }

    // Add translation functionality with hover effect
    function addTranslationToText(text) {
    let words = text.split(' ');  // 将句子拆分为单词数组
    let updatedWords = words.map(word => {
        // 去除标点符号
        let cleanWord = word.replace(/[.,?!;:()]/g, '');
        
        // 查找翻译（短语优先）
        let phraseTranslation = phrasesTranslation.find(phrase => phrase['原文'] === cleanWord);
        let wordTranslation = wordsTranslation.find(item => item['原文'] === cleanWord);

        if (phraseTranslation) {
            return `<span class="translatable" onmouseover="showTooltip(event, '${phraseTranslation['翻译']}')" onmouseout="hideTooltip()">${word}</span>`;
        } else if (wordTranslation) {
            return `<span class="translatable" onmouseover="showTooltip(event, '${wordTranslation['翻译']}')" onmouseout="hideTooltip()">${word}</span>`;
        } else {
            return word;
        }
    });

    return updatedWords.join(' ');  // 将更新后的单词数组重新组合成句子
}


    // Show tooltip for translation
    function showTooltip(event, translation) {
        const tooltip = document.getElementById('tooltip');
        tooltip.innerText = translation;
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY + 10 + 'px';
        tooltip.style.display = 'block';
    }

    // Hide tooltip for translation
    function hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'none';
    }

    // Toggle answer visibility
    function toggleAnswer(button) {
        const answerDiv = button.nextElementSibling;
        if (answerDiv.style.display === 'none') {
            answerDiv.style.display = 'block';
            button.innerText = '隐藏答案';
        } else {
            answerDiv.style.display = 'none';
            button.innerText = '显示答案';
        }
    }

    // Go back to the previous page
    function goBack() {
        window.history.back();
    }

    // Determine which function to call based on the current page
    window.onload = function() {
        loadTranslations();
        if (document.getElementById('category-list')) {
            loadCategories();
        } else if (document.getElementById('subcategory-list')) {
            loadSubcategories();
        } else if (document.getElementById('questions-list')) {
            loadQuestions();
        }
    };
