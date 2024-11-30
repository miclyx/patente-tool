// 全局变量
let categories = []; // 保存大分类、小分类和图片
let questions = [];  // 保存所有题目
let currentMainCategory = ""; // 当前选择的大分类
let currentSubCategory = ""; // 当前选择的类别

// 加载数据函数
async function loadData() {
    const categoriesResponse = await fetch("categories_and_images.csv");
    const categoriesText = await categoriesResponse.text();
    categories = parseCSV(categoriesText);

    const questionsResponse = await fetch("patente_questions_with_categories.csv");
    const questionsText = await questionsResponse.text();
    questions = parseCSV(questionsText);

    renderMainCategories();
}

// 解析 CSV 文件
function parseCSV(csv) {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : "";
        });
        return obj;
    }).filter(row => Object.keys(row).length > 1);
}

// 渲染大分类
function renderMainCategories() {
    const content = document.getElementById("main-content");
    content.innerHTML = "<h2>请选择大分类</h2>";
    const mainCategories = [...new Set(categories.map(cat => cat["大分类"]))];
    mainCategories.forEach(category => {
        const div = document.createElement("div");
        div.className = "category";
        div.innerText = category;
        div.onclick = () => {
            currentMainCategory = category;
            renderSubCategories();
        };
        content.appendChild(div);
    });
}

// 渲染类别
function renderSubCategories() {
    const content = document.getElementById("main-content");
    content.innerHTML = `<h2>${currentMainCategory}: 请选择类别</h2>`;
    addBackButton(() => renderMainCategories());
    const subCategories = categories.filter(cat => cat["大分类"] === currentMainCategory);
    subCategories.forEach(sub => {
        const div = document.createElement("div");
        div.className = "subcategory";
        div.innerText = sub["小分类"];
        div.onclick = () => {
            currentSubCategory = sub["小分类"];
            renderQuestions(sub["图片"]);
        };
        content.appendChild(div);
    });
}

// 渲染题目和图片
function renderQuestions(imageUrl) {
    const content = document.getElementById("main-content");
    content.innerHTML = `<h2>${currentSubCategory}: 题目列表</h2>`;
    addBackButton(() => renderSubCategories());
    if (imageUrl && imageUrl !== "无图片") {
        const imgContainer = document.createElement("div");
        imgContainer.className = "image-container";
        imgContainer.innerHTML = `<img src="${imageUrl}" alt="${currentSubCategory}">`;
        content.appendChild(imgContainer);
    }
    const subQuestions = questions.filter(q => q["类别"].trim() === currentSubCategory.trim());
    if (subQuestions.length === 0) {
        content.innerHTML += `<p>未找到该类别的题目。</p>`;
        return;
    }
    subQuestions.forEach(question => {
        const div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `
            <p><strong>题目:</strong> ${question["题目"]}</p>
            <p><strong>答案:</strong> ${question["答案"]}</p>
        `;
        content.appendChild(div);
    });
}

// 添加后退按钮
function addBackButton(callback) {
    const content = document.getElementById("main-content");
    const backButton = document.createElement("a");
    backButton.className = "back-button";
    backButton.innerText = "返回";
    backButton.href = "#";
    backButton.onclick = (e) => {
        e.preventDefault();
        callback();
    };
    content.appendChild(backButton);
}

// 初始化
window.onload = loadData;
