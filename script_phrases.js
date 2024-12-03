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

// 检查题目是否已被标记
function isQuestionMarked(questionText) {
    const markedQuestions = JSON.parse(localStorage.getItem('markedQuestions')) || [];
    return markedQuestions.includes(questionText);
}

// 切换标记状态
function toggleMarkQuestion(questionText, button) {
    let markedQuestions = JSON.parse(localStorage.getItem('markedQuestions')) || [];
    
    if (markedQuestions.includes(questionText)) {
        // 如果已标记，则取消标记
        markedQuestions = markedQuestions.filter(q => q !== questionText);
        button.innerText = '标记';
        button.classList.remove('marked');
    } else {
        // 如果未标记，则进行标记
        markedQuestions.push(questionText);
        button.innerText = '取消标记';
        button.classList.add('marked');
    }

    // 保存更新到 localStorage
    localStorage.setItem('markedQuestions', JSON.stringify(markedQuestions));
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

                    // 检查是否已经标记
                    const isMarked = isQuestionMarked(question['题目']);

                    // 创建题目内容
                    const questionTextElement = document.createElement('p');
                    questionTextElement.innerHTML = addPhraseTranslationToText(question['题目']);

                    // 创建显示答案按钮
                    const answerButton = document.createElement('button');
                    answerButton.innerText = '显示答案';
                    answerButton.onclick = function() {
                        toggleAnswer(answerButton);
                    };

                    // 创建答案内容元素
                    const answerDiv = document.createElement('div');
                    answerDiv.classList.add('answer');
                    answerDiv.style.display = 'none';
                    answerDiv.innerText = question['答案'];

                    // 创建标记按钮
                    const markButton = document.createElement('button');
                    markButton.classList.add('mark-button');
                    markButton.innerText = isMarked ? '取消标记' : '标记';
                    markButton.onclick = function() {
                        toggleMarkQuestion(question['题目'], markButton);
                    };

                    // 如果已标记，更新按钮的样式
                    if (isMarked) {
                        markButton.classList.add('marked');
                    }

                    // 将所有元素添加到问题项中
                    questionElement.appendChild(questionTextElement);
                    questionElement.appendChild(answerButton);
                    questionElement.appendChild(answerDiv);
                    questionElement.appendChild(markButton);

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
