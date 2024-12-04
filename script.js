let wordsTranslation = [];  // 全局变量存储单词翻译

// Load translations from JSON file when the page loads
function loadTranslations() {
    fetch('translated_words.json')
        .then(response => response.json())
        .then(data => {
            wordsTranslation = data;
            console.log('Words Translation Loaded:', wordsTranslation);  // 输出翻译数据以确认加载
        })
        .catch(error => console.error('Error loading translations:', error));
}

// 检查题目是否已被标记
async function isQuestionMarked(questionText) {
    const { data, error } = await supabase
        .from('marked_questions')
        .select('*')
        .eq('question_text', questionText);

    if (error) {
        console.error('Error checking marked question:', error);
        return false;
    }
    return data.length > 0;
}

// 切换标记状态
async function toggleMarkQuestion(questionText, button) {
    const isMarked = await isQuestionMarked(questionText);

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
        button.innerText = '取消标记';
        button.classList.add('marked');
    }
}

// 加载问题并检查是否已标记
async function loadQuestions() {
    // 示例问题列表，可以替换为从实际数据源获取的问题
    const questions = [
        '问题1',
        '问题2',
        '问题3'
    ];

    const questionsList = document.getElementById('questions-list');
    if (questionsList) {
        questionsList.innerHTML = '';
        for (const questionText of questions) {
            const questionElement = document.createElement('div');
            questionElement.classList.add('question-item');
            questionElement.innerText = questionText;

            // 创建标记按钮
            const markButton = document.createElement('button');
            markButton.classList.add('mark-button');
            markButton.innerText = '标记';

            // 检查题目是否已标记，并更新按钮状态
            const isMarked = await isQuestionMarked(questionText);
            if (isMarked) {
                markButton.innerText = '取消标记';
                markButton.classList.add('marked');
            }

            markButton.onclick = function() {
                toggleMarkQuestion(questionText, markButton);
            };

            questionElement.appendChild(markButton);
            questionsList.appendChild(questionElement);
        }
    }
}

// 加载用户标记的题目列表
async function loadMarkedQuestions() {
    const { data, error } = await supabase
        .from('marked_questions')
        .select('question_text');

    if (error) {
        console.error('Error loading marked questions:', error);
        return;
    }

    const markedQuestionsList = document.getElementById('marked-questions-list');
    if (markedQuestionsList) {
        markedQuestionsList.innerHTML = '';
        data.forEach(question => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('marked-question-item');
            questionElement.innerText = question.question_text;
            markedQuestionsList.appendChild(questionElement);
        });
    }
}

// 在页面加载时调用相应函数
window.onload = function() {
    loadTranslations();  // 首先加载翻译数据
    if (document.getElementById('category-list')) {
        loadCategories();
    } else if (document.getElementById('subcategory-list')) {
        loadSubcategories();
    } else if (document.getElementById('questions-list')) {
        loadQuestions();
    } else if (document.getElementById('marked-questions-list')) {
        loadMarkedQuestions();
    }
};
