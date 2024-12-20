// 使用 Supabase 实现跨设备保存标记状态
// Supabase URL 和 Key 在 HTML 中已经配置，确保只加载一次 Supabase 客户端

let phrasesTranslation = [];  // 全局变量存储短语翻译
let markedQuestions = [];  // 全局变量存储标记的题目

// Load phrase translations from JSON file when the page loads
async function loadPhrasesTranslations() {
    try {
        const response = await fetch('translated_phrases.json');
        phrasesTranslation = await response.json();
        console.log('Phrases Translation Loaded:', phrasesTranslation);  // 输出翻译数据以确认加载
    } catch (error) {
        console.error('Error loading phrase translations:', error);
    }
}

// 加载标记的题目
async function loadMarkedQuestionsFromDatabase() {
    if (!window.supabase) {
        console.error('Supabase client not initialized');
        return;
    }
    const { data, error } = await supabase
        .from('marked_questions')
        .select('question_text');

    if (error) {
        console.error('Error loading marked questions:', error);
        return;
    }

    markedQuestions = data.map(item => item.question_text);
}

// 检查题目是否已被标记
function isQuestionMarked(questionText) {
    return markedQuestions.includes(questionText);
}

// 切换标记状态
async function toggleMarkQuestion(questionText, button) {
    if (!window.supabase) {
        console.error('Supabase client not initialized');
        return;
    }
    const isMarked = isQuestionMarked(questionText);

    if (isMarked) {
        // 如果已标记，则取消标记
        const { error } = await supabase
            .from('marked_questions')
            .delete()
            .eq('question_text', questionText);

        if (error) {
            console.error('Error unmarking question:', error);
            return;
        }
        // 更新本地标记状态
        markedQuestions = markedQuestions.filter(q => q !== questionText);
        button.innerText = '标记';
        button.classList.remove('marked');
    } else {
        // 如果未标记，则进行标记
        const { error } = await supabase
            .from('marked_questions')
            .insert([{ question_text: questionText }]);

        if (error) {
            console.error('Error marking question:', error);
            return;
        }
        // 更新本地标记状态
        markedQuestions.push(questionText);
        button.innerText = '取消标记';
        button.classList.add('marked');
    }
}

// 加载问题并检查是否已标记
async function loadQuestionsWithPhrases() {
    const urlParams = new URLSearchParams(window.location.search);
    const subcategory = urlParams.get('subcategory');

    try {
        const categoriesResponse = await fetch('categories.json');
        const categoriesData = await categoriesResponse.json();

        // 加载相关的图片
        const subcategoryData = categoriesData.find(item => item['小分类'] === subcategory);
        const imageContainer = document.getElementById('image-container');
        if (subcategoryData && subcategoryData['图片'] && subcategoryData['图片'] !== '无图片') {
            imageContainer.innerHTML = ''; // 清空容器内容
            const imgPath = `images/${subcategoryData['图片']}`;
            console.log('Image source:', imgPath);  // 调试信息
            const imgElement = document.createElement('img');
            imgElement.src = imgPath;
            imgElement.alt = subcategory;
            imgElement.onload = function() {
                console.log('Image loaded successfully:', imgPath);
            };
            imgElement.onerror = function() {
                console.error('Error loading image:', imgPath);
                imageContainer.innerHTML = '<p>图片加载失败，请检查路径或文件是否存在。</p>';
            };
            imageContainer.appendChild(imgElement);
        }

        const questionsResponse = await fetch('questions.json');
        const questionsData = await questionsResponse.json();
        const questionsList = document.getElementById('questions-list');
        if (questionsList) {
            questionsList.innerHTML = '';
            // 筛选问题
            const filteredQuestions = questionsData.filter(question => question['类别'] === subcategory);
            filteredQuestions.forEach(question => {
                const questionElement = document.createElement('div');
                questionElement.classList.add('question-item');

                // 检查是否已标记
                const isMarked = isQuestionMarked(question['题目']);

                // 创建问题文本元素
                const questionTextElement = document.createElement('p');
                questionTextElement.innerHTML = addPhraseTranslationToText(question['题目']);
                questionElement.appendChild(questionTextElement);

                // 创建显示答案按钮
                const answerButton = document.createElement('button');
                answerButton.innerText = '显示答案';
                answerButton.onclick = function() {
                    toggleAnswer(answerButton, question['答案']);
                };
                questionElement.appendChild(answerButton);

                
                // 创建答案内容元素
                const answerDiv = document.createElement('div');
                answerDiv.classList.add('answer');
                answerDiv.style.display = 'none';
                answerDiv.innerText = question['答案'];
                questionElement.appendChild(answerDiv);


                // 创建标记按钮
                const markButton = document.createElement('button');
                markButton.classList.add('mark-button');

                // 检查题目是否已标记，并更新按钮状态
                if (isMarked) {
                    markButton.innerText = '取消标记';
                    markButton.classList.add('marked');
                } else {
                    markButton.innerText = '标记';
                }

                markButton.onclick = function() {
                    toggleMarkQuestion(question['题目'], markButton);
                };

                questionElement.appendChild(markButton);
                questionsList.appendChild(questionElement);
            });
        }
    } catch (error) {
        console.error('Error loading questions or categories:', error);
    }
}

// 添加短语翻译并支持悬停显示
function addPhraseTranslationToText(text) {
    let updatedText = text;
    phrasesTranslation.forEach(phrase => {
        const phraseRegex = new RegExp(`\\b${phrase['原文']}\\b`, 'gi');
        updatedText = updatedText.replace(phraseRegex, `<span class="translatable" style="text-decoration: underline; cursor: pointer; " onmouseover="showTooltip(event, '${phrase['翻译']}')" onmouseout="hideTooltip()">$&</span>`);
    });
    return updatedText;
}

// 显示翻译的工具提示
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

// 隐藏工具提示
function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// 切换答案的可见性
function toggleAnswer(button, answerText) {
    let answerDiv = button.nextElementSibling;
    if (!answerDiv) {
        answerDiv = document.createElement('div');
        answerDiv.classList.add('answer');
        answerDiv.innerText = answerText;
        button.parentNode.insertBefore(answerDiv, button.nextSibling);
    }

    if (answerDiv.style.display === 'none' || !answerDiv.style.display) {
        answerDiv.style.display = 'block';
        button.innerText = '隐藏答案';
    } else {
        answerDiv.style.display = 'none';
        button.innerText = '显示答案';
    }
}

// 切换到单词翻译页面
function switchToWordTranslation() {
    const urlParams = new URLSearchParams(window.location.search);
    const subcategory = urlParams.get('subcategory');
    if (subcategory) {
        window.location.href = `questions.html?subcategory=${encodeURIComponent(subcategory)}`;
    }
}

    // Go back to the previous page
    function goBack() {
        window.history.back();
    }

// 在页面加载时调用相应函数
window.onload = async function() {
    await loadPhrasesTranslations();  // 加载短语翻译数据
    await loadMarkedQuestionsFromDatabase();  // 加载标记的题目
    await loadQuestionsWithPhrases();  // 加载带短语翻译的问题
};
