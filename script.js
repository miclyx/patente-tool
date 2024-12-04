// 使用 Supabase 实现跨设备保存标记状态
// Supabase URL 和 Key 在 HTML 中已经配置，确保只加载一次 Supabase 客户端

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

// 加载分类数据
function loadCategories() {
    fetch('categories.json')
        .then(response => response.json())
        .then(data => {
            const categoryList = document.getElementById('category-list');
            if (categoryList) {
                // 使用 Set 存储唯一的分类
                const uniqueCategories = new Set();
                data.forEach(category => {
                    uniqueCategories.add(category['大分类']);
                });

                // 显示唯一的分类
                Array.from(uniqueCategories).forEach(category => {
                    const categoryElement = document.createElement('div');
                    categoryElement.classList.add('category-item');
                    categoryElement.innerHTML = `<a href="category.html?category=${encodeURIComponent(category)}">${category}</a>`;
                    categoryList.appendChild(categoryElement);
                });
            }
        })
        .catch(error => console.error('Error loading categories:', error));
}

// 加载子分类数据
function loadSubcategories() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    fetch('categories.json')
        .then(response => response.json())
        .then(data => {
            const subcategoryList = document.getElementById('subcategory-list');
            if (subcategoryList && category !== null) {
                // 筛选子分类
                const filteredSubcategories = data.filter(item => item['大分类'] === category);
                filteredSubcategories.forEach(subcategory => {
                    const subcategoryElement = document.createElement('div');
                    subcategoryElement.classList.add('subcategory-item');
                    subcategoryElement.innerHTML = `<a href="questions.html?subcategory=${encodeURIComponent(subcategory['小分类'])}">${subcategory['小分类']}</a>`;
                    subcategoryList.appendChild(subcategoryElement);
                });
            }
        })
        .catch(error => console.error('Error loading subcategories:', error));
}

// 加载问题并检查是否已标记
async function loadQuestions() {
    // 加载标记的题目
    await loadMarkedQuestionsFromDatabase();

    const urlParams = new URLSearchParams(window.location.search);
    const subcategory = urlParams.get('subcategory');

    fetch('categories.json')
        .then(response => response.json())
        .then(data => {
            // 加载相关的图片
            const subcategoryData = data.find(item => item['小分类'] === subcategory);
            if (subcategoryData && subcategoryData['图片'] && subcategoryData['图片'] !== '无图片') {
                const imageContainer = document.getElementById('image-container');
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
            } else {
                console.log('No valid image found for subcategory:', subcategory);
                const imageContainer = document.getElementById('image-container');
                imageContainer.innerHTML = '<p>未找到对应的图片。</p>';
            }
        })
        .catch(error => console.error('Error loading categories for image:', error));

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            const questionsList = document.getElementById('questions-list');
            if (questionsList) {
                questionsList.innerHTML = '';
                // 筛选问题
                const filteredQuestions = data.filter(question => question['类别'] === subcategory);
                filteredQuestions.forEach(question => {
                    const questionElement = document.createElement('div');
                    questionElement.classList.add('question-item');

                    // 创建问题文本元素
                    const questionTextElement = document.createElement('p');
                    questionTextElement.innerText = question['题目'];
                    questionElement.appendChild(questionTextElement);

                    // 创建标记按钮
                    const markButton = document.createElement('button');
                    markButton.classList.add('mark-button');

                    // 检查题目是否已标记，并更新按钮状态
                    if (isQuestionMarked(question['题目'])) {
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
        })
        .catch(error => console.error('Error loading questions:', error));
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
