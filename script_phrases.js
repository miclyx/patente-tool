let phrasesTranslation = [];  // 全局变量存储短语翻译

// Load phrase translations from JSON file when the page loads
function loadPhrasesTranslations() {
    fetch('translated_phrases.json')
        .then(response => response.json())
        .then(data => {
            phrasesTranslation = data;
            console.log('Phrases Translation Loaded:', phrasesTranslation);  // 输出翻译数据以确认加载
        })
        .catch(error => console.error('Error loading phrase translations:', error));
}

// Load questions from JSON file with phrase translation
function loadQuestionsWithPhrases() {
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
                    const questionElement = document.createElement('div');
                    questionElement.classList.add('question-item');
                    questionElement.innerHTML = addPhraseTranslationToText(`
                        <p>${question['题目']}</p>
                        <button onclick="toggleAnswer(this)">显示答案</button>
                        <div class="answer" style="display: none;">${question['答案']}</div>
                    `);
                    questionsList.appendChild(questionElement);
                });
            }
        })
        .catch(error => console.error('Error loading questions:', error));
}

// Add phrase translation to text with hover effect
function addPhraseTranslationToText(text) {
    let updatedText = text;
    phrasesTranslation.forEach(phrase => {
        const phraseRegex = new RegExp(`\\b${phrase['原文']}\\b`, 'g');
        updatedText = updatedText.replace(phraseRegex, `<span class="translatable" style="text-decoration: underline; cursor: pointer;" onmouseover="showTooltip(event, '${phrase['翻译']}')" onmouseout="hideTooltip()">$&</span>`);
    });
    return updatedText;
}

// Show tooltip with translation
function showTooltip(event, translation) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerText = translation;
    document.body.appendChild(tooltip);
    
    const xOffset = 15;
    const yOffset = 15;
    tooltip.style.left = event.pageX + xOffset + 'px';
    tooltip.style.top = event.pageY + yOffset + 'px';
}

// Hide tooltip
function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
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

// Switch to word translation page
function switchToWordTranslation() {
    const urlParams = new URLSearchParams(window.location.search);
    const subcategory = urlParams.get('subcategory');
    if (subcategory) {
        window.location.href = `questions.html?subcategory=${encodeURIComponent(subcategory)}`;
    }
}

// Determine which function to call based on the current page
window.onload = function() {
    loadPhrasesTranslations();  // 首先加载短语翻译数据
    loadQuestionsWithPhrases();
};
