import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ghjtiktynoidljnthqjc.supabase.co';  // 你的 Supabase 项目 URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoanRpa3R5bm9pZGxqbnRocWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzY4MjgsImV4cCI6MjA0ODg1MjgyOH0.pff0q4Zz7HxE1MvlXOblZRpV-javKLJdexVyl_wc0IE';     // 你的 Supabase anon 密钥
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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
function isQuestionMarked(questionText) {
    const markedQuestions = JSON.parse(localStorage.getItem('markedQuestions')) || [];
    return markedQuestions.includes(questionText);
}

// 切换标记状态
async function toggleMarkQuestion(questionText, button) {
    const userId = "demoUser";  // 这里需要每个用户的唯一 ID
    let { data, error } = await supabase
        .from('marked_questions')
        .select('questions')
        .eq('user_id', userId)
        .single();

    let markedQuestions = data ? data.questions : [];

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

    // 保存更新到 Supabase
    const { error: updateError } = await supabase
        .from('marked_questions')
        .upsert({ user_id: userId, questions: markedQuestions });

    if (updateError) {
        console.error('更新标记问题时出错：', updateError);
    }
}

async function loadMarkedQuestions() {
    const userId = "demoUser"; // 这里需要每个用户的唯一 ID
    let { data, error } = await supabase
        .from('marked_questions')
        .select('questions')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('加载标记问题时出错：', error);
        return;
    }

    const markedQuestions = data ? data.questions : [];

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
                    const questionElement = document.createElement('div');
                    questionElement.classList.add('question-item');

                    // 检查是否已经标记
                    const isMarked = isQuestionMarked(question['题目']);

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



    // Add word translation to text with hover effect
    function addWordTranslationToText(text) {
        let words = text.split(' ');  // 将句子拆分为单词数组
        let updatedWords = words.map(word => {
            // 去除标点符号
            let cleanWord = word.replace(/[.,?!;:()]/g, '');

            // 查找单词翻译
            let wordTranslation = wordsTranslation.find(item => item['原文'] === cleanWord);

            if (wordTranslation) {
                return `<span class="translatable" style="text-decoration: underline; cursor: pointer;" onmouseover="showTooltip(event, '${wordTranslation['翻译']}')" onmouseout="hideTooltip()">${word}</span>`;
            } else {
                return word;
            }
        });

        return updatedWords.join(' ');  // 将更新后的单词数组重新组合成句子
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

    // Determine which function to call based on the current page
    window.onload = function() {
        loadTranslations();  // 首先加载翻译数据
        if (document.getElementById('category-list')) {
            loadCategories();
        } else if (document.getElementById('subcategory-list')) {
            loadSubcategories();
        } else if (document.getElementById('questions-list')) {
            loadQuestions();
            loadMarkedQuestions();  // 加载标记状态
        }
    };


