// 全局变量存储单词翻译
let wordsTranslation = [];

// Load translations from JSON file when the page loads
function loadTranslations() {
    fetch('translated_words.json')
        .then(response => response.json())
        .then(data => {
            wordsTranslation = data;
            console.log('Words Translation Loaded:', wordsTranslation);
        })
        .catch(error => console.error('Error loading translations:', error));
}

// 检查题目是否已被标记
async function isQuestionMarked(userId, questionId) {
    const { data, error } = await supabase
        .from('marked_questions')
        .select('*')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .single();

    if (error) {
        console.error('加载标记问题时出错：', error);
        return false;
    }

    return !!data; // 如果有数据，则表示已标记
}

// 切换标记状态
async function toggleMarkQuestion(questionId, button) {
    const userId = "demoUser";  // 这里需要每个用户的唯一 ID

    // 检查当前问题是否已被标记
    const isMarked = await isQuestionMarked(userId, questionId);

    if (isMarked) {
        // 如果已标记，则取消标记
        const { error } = await supabase
            .from('marked_questions')
            .delete()
            .eq('user_id', userId)
            .eq('question_id', questionId);

        if (error) {
            console.error('取消标记时出错：', error);
        } else {
            button.innerText = '标记';
            button.classList.remove('marked');
        }
    } else {
        // 如果未标记，则进行标记
        const { error } = await supabase
            .from('marked_questions')
            .insert([
                { user_id: userId, question_id: questionId }
            ]);

        if (error) {
            console.error('标记问题时出错：', error);
        } else {
            button.innerText = '取消标记';
            button.classList.add('marked');
        }
    }
}

// 加载所有标记状态并更新页面
async function loadMarkedQuestions() {
    const userId = "demoUser"; // 这里需要每个用户的唯一 ID
    const { data, error } = await supabase
        .from('marked_questions')
        .select('question_id')
        .eq('user_id', userId);

    if (error) {
        console.error('加载标记问题时出错：', error);
        return;
    }

    const markedQuestions = data ? data.map(q => q.question_id) : [];

    // 更新页面中标记的状态
    const questionsList = document.getElementById('questions-list');
    if (questionsList) {
        const questionItems = questionsList.querySelectorAll('.question-item');
        questionItems.forEach(item => {
            const questionText = item.querySelector('p').innerText;
            const markButton = item.querySelector('.mark-button');

            if (markedQuestions.includes(questionText)) {
                markButton.innerText = '取消标记';
                markButton.classList.add('marked');
            } else {
                markButton.innerText = '标记';
                markButton.classList.remove('marked');
            }
        });
    }
}

// 加载题目并更新标记状态
function loadQuestions() {
    // 你原来的 loadQuestions 函数逻辑

    // 加载完题目后，加载用户的标记状态
    loadMarkedQuestions();
}

// 页面加载时调用相关函数
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
