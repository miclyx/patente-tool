<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>意大利驾照类别</title>
    <link rel="stylesheet" href="style.css">
    <script defer src="script.js"></script>
</head>
<body>
    <h1>选择一个主要类别</h1>
    <div id="category-list">
        <!-- Categories will be loaded here dynamically -->
    </div>
</body>
</html>

<!-- category.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>意大利驾照子类别</title>
    <link rel="stylesheet" href="style.css">
    <script defer src="script.js"></script>
</head>
<body>
    <h1>选择一个子类别</h1>
    <div id="subcategory-list">
        <!-- Subcategories will be loaded here dynamically -->
    </div>
    <button onclick="goBack()">返回</button>
</body>
</html>

<!-- questions.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>意大利驾照题目</title>
    <link rel="stylesheet" href="style.css">
    <script defer src="script.js"></script>
</head>
<body>
    <h1>题目</h1>
    <div id="questions-list">
        <!-- Questions will be loaded here dynamically -->
    </div>
    <button onclick="goBack()">返回</button>
</body>
</html>

<script>
    // Load questions from JSON file
    function loadQuestions() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryIndex = urlParams.get('category');
        const subcategoryIndex = urlParams.get('subcategory');

        fetch('questions.json')
            .then(response => response.json())
            .then(data => {
                const questionsList = document.getElementById('questions-list');
                if (questionsList) {
                    // Filter questions based on category and subcategory
                    const filteredQuestions = data.filter(question => question['类别'] === categoryIndex && question['小分类索引'] == subcategoryIndex);
                    filteredQuestions.forEach(question => {
                        const questionElement = document.createElement('div');
                        questionElement.classList.add('question-item');
                        questionElement.innerText = question['题目'];
                        questionsList.appendChild(questionElement);
                    });
                }
            })
            .catch(error => console.error('Error loading questions:', error));
    }

    // Call the loadQuestions function
    window.onload = function() {
        loadQuestions();
    };
</script>
