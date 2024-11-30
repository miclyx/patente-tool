// 全局变量
let categories = []; // 保存大分类、小分类和图片
let questions = [];  // 保存所有题目
let currentMainCategory = ""; // 当前选择的大分类
let currentSubCategory = ""; // 当前选择的小分类

// 加载数据函数
async function loadData() {
    // 加载大分类和小分类
    const categoriesResponse = await fetch("categories_and_images.csv");
    const categoriesText = await categoriesResponse.text();
    categories = parseCSV(categoriesText);

    // 加载题目
    const questionsResponse = await fetch("patente_questions_with_categories.csv");
    const questionsText = await questionsResponse.text();
    questions = parseCSV(questionsText);

    // 显示大分类
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

// 渲染小分类
function renderSubCategories() {
    const content = document.getElementById("main-content");
    content.innerHTML = `<h2>${currentMainCategory}: 请选择小分类</h2>`;
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
    if (imageUrl && imageUrl !== "无图片") {
        const img = document.createElement("img");
        img.src = imageUrl;
        content.appendChild(img);
    }
    const subQuestions = questions.filter(q => q["小分类"] === currentSubCategory);
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

// 初始化
window.onload = loadData;
