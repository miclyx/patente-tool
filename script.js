// 使用 Supabase 实现跨设备保存标记状态
// 由于在 HTML 中已设置了 Supabase 的 URL 和 Key，这里不需要再次设置

let wordsTranslation = [];  // 全局变量存储单词翻译
let markedQuestions = [];  // 全局变量存储标记的题目

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

// 加载标记的题目
async function loadMarkedQuestionsFromDatabase() {
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
async function loadQuestions() {
    // 加载标记的题目
    await loadMarkedQuestionsFromDatabase();

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

            // 检查题目是否已标记，并更新按钮状态
            if (isQuestionMarked(questionText)) {
                markButton.innerText = '取消标记';
                markButton.classList.add('marked');
            } else {
                markButton.innerText = '标记';
            }

            markButton.onclick = function() {
                toggleMarkQuestion(questionText, markButton);
            };

            questionElement.appendChild(markButton);
            questionsList.appendChild(questionElement);
        }
    }
}

// 在页面加载时调用相应函数
window.onload = async function() {
    loadTranslations();  // 首先加载翻译数据
    if (document.getElementById('category-list')) {
        loadCategories();
    } else if (document.getElementById('subcategory-list')) {
        loadSubcategories();
    } else if (document.getElementById('questions-list')) {
        await loadQuestions();
    } else if (document.getElementById('marked-questions-list')) {
        await loadMarkedQuestionsFromDatabase();
        const markedQuestionsList = document.getElementById('marked-questions-list');
        markedQuestionsList.innerHTML = '';
        markedQuestions.forEach(questionText => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('marked-question-item');
            questionElement.innerText = questionText;
            markedQuestionsList.appendChild(questionElement);
        });
    }
};
