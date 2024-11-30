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
    const questionsResponse = await fetch("patente_questions_with_categories_fixed.csv");
    const questionsText = await questionsResponse.text();
    questions = parseCSV(questionsText);

    // 调试：打印加载的数据
    console.log("加载的大分类和小分类:", categories);
    console.log("加载的题目:", questions);

    // 显示大分类
    renderMainCategories();
}

// 解析 CSV 文件
function parseCSV(csv) {
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g); // 更安全的字段匹配
        if (!values) return null;

        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index]
                ? values[index].trim().replace(/^"|"$/g, '') // 去掉开头和结尾的双引号
                : "";
        });
        return obj;
    }).filter(row => row !== null && Object.keys(row).length > 1);
}

// 渲染大分类
function renderMainCategories() {
    const content = document.getElementById("main-content");
    content.innerHTML = "<h2>请选择大分类</h2>";

    // 获取唯一的大分类
    const mainCategories = [...new Set(categories.map(cat => cat["大分类"].trim()))];

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
    content.innerHTML = `<h2>${currentMainCategory}: 请选择类别</h2>`;

    // 筛选属于当前大分类的所有小分类
    const subCategories = categories
        .filter(cat => cat["大分类"].trim() === currentMainCategory.trim())
        .map(cat => cat["小分类"].trim());

    // 去重
    const uniqueSubCategories = [...new Set(subCategories)];

    uniqueSubCategories.forEach(subCategory => {
        const div = document.createElement("div");
        div.className = "subcategory";
        div.innerText = subCategory;
        div.onclick = () => {
            currentSubCategory = subCategory;
            const subCategoryData = categories.find(cat => cat["小分类"].trim() === subCategory.trim());
            renderQuestions(subCategoryData ? subCategoryData["图片"] : null);
        };
        content.appendChild(div);
    });

    // 添加返回按钮
    const backButton = document.createElement("button");
    backButton.innerText = "返回";
    backButton.className = "back-button";
    backButton.onclick = renderMainCategories;
    content.appendChild(backButton);
}

// 渲染题目和图片
function renderQuestions(imageUrl) {
    const content = document.getElementById("main-content");
    content.innerHTML = `<h2>${currentSubCategory}: 题目列表</h2>`;

    if (imageUrl && imageUrl !== "无图片") {
        const imgContainer = document.createElement("div");
        imgContainer.className = "image-container";
        imgContainer.innerHTML = `<img src="${imageUrl}" alt="${currentSubCategory}">`;
        content.appendChild(imgContainer);
    }

    // 筛选属于当前类别的题目
    const subQuestions = questions.filter(q => q["类别"].trim() === currentSubCategory.trim());

    if (subQuestions.length === 0) {
        content.innerHTML += `<p>未找到该类别的题目。</p>`;
        return;
    }

    subQuestions.forEach(question => {
        const div = document.createElement("div");
        div.className = "question";
        div.innerHTML = `
            <p><strong>题目:</strong> ${question["题目"].replace(/^"|"$/g, '')}</p>
            <p><strong>答案:</strong> ${question["答案"].replace(/^"|"$/g, '')}</p>
        `;
        content.appendChild(div);
    });

    // 添加返回按钮
    const backButton = document.createElement("button");
    backButton.innerText = "返回";
    backButton.className = "back-button";
    backButton.onclick = renderSubCategories;
    content.appendChild(backButton);
}

// 初始化
window.onload = loadData;
