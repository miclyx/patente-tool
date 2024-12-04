// 使用 Supabase 实现跨设备保存标记状态
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

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
