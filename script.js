    let wordsTranslation = [];
    let phrasesTranslation = [];

    // Load translations from JSON files
    function loadTranslations() {
        fetch('translated_words.json')
            .then(response => response.json())
            .then(data => {
                wordsTranslation = Array.isArray(data) ? data : [];
            })
            .catch(error => {
                console.error('Error loading words translation:', error);
                wordsTranslation = [];
            });

        fetch('translated_phrases.json')
            .then(response => response.json())
            .then(data => {
                phrasesTranslation = Array.isArray(data) ? data : [];
            })
            .catch(error => {
                console.error('Error loading phrases translation:', error);
                phrasesTranslation = [];
            });
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

    // Add translation functionality to text
    function addTranslationToText(text) {
        let updatedText = text;

        // Replace phrases with clickable translations
        phrasesTranslation.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase['短语']}\\b`, 'g');
            updatedText = updatedText.replace(regex, `<span class="translatable" onclick="showTranslation('${phrase['短语']}', '${phrase['翻译']}')">${phrase['短语']}</span>`);
        });

        // Replace words with clickable translations
        wordsTranslation.forEach(word => {
            const regex = new RegExp(`\\b${word['单词']}\\b`, 'g');
            updatedText = updatedText.replace(regex, `<span class="translatable" onclick="showTranslation('${word['单词']}', '${word['翻译']}')">${word['单词']}</span>`);
        });

        return updatedText;
    }

    // Show translation
    function showTranslation(original, translation) {
        alert(`${original} 的翻译是: ${translation}`);
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
