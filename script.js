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

// 检查题目是否已被标记（使用 Supabase 查询数据库）
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
                    const questionElement = document.createElement('div');
                    questionElement.classList.add('question-item');

                    // 创建题目内容
                    const questionTextElement = document.createElement('p');
                    questionTextElement.innerHTML = addWordTranslationToText(question['题目']);

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
                    markButton.innerText = '标记';
                    markButton.onclick = function() {
                        toggleMarkQuestion(question['题目'], markButton);
                    };

                    // 将所有元素添加到问题项中
                    questionElement.appendChild(questionTextElement);
                    questionElement.appendChild(answerButton);
                    questionElement.appendChild(answerDiv);
                    questionElement.appendChild(markButton);

                    questionsList.appendChild(questionElement);
                });

                // 加载并更新所有标记状态
                loadMarkedQuestions();
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
    loadTranslations();  // 首先加载翻译数据
    if (document.getElementById('category-list')) {
        loadCategories();
    } else if (document.getElementById('subcategory-list')) {
        loadSubcategories();
    } else if (document.getElementById('questions-list')) {
        loadQuestions();
    }
};
