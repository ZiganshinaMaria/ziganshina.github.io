const questions = [
  {
    question: "Что означает аббревиатура HTML?",
    answers: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language"
    ],
    correct: 0
  },
  {
    question: "Какой тег используется для создания заголовка первого уровня?",
    answers: ["<head>", "<h1>", "<title>", "<header>"],
    correct: 1
  },
  {
    question: "Какой тег создаёт абзац текста?",
    answers: ["<text>", "<paragraph>", "<p>", "<div>"],
    correct: 2
  },
  {
    question: "Какой тег используется для создания ссылки?",
    answers: ["<a>", "<link>", "<href>", "<url>"],
    correct: 0
  },
  {
    question: "Какой атрибут задаёт адрес ссылки?",
    answers: ["src", "link", "href", "url"],
    correct: 2
  },
  {
    question: "Какой тег используется для вставки изображения?",
    answers: ["<image>", "<img>", "<picture>", "<src>"],
    correct: 1
  },
  {
    question: "Какой атрибут указывает путь к изображению?",
    answers: ["href", "path", "alt", "src"],
    correct: 3
  },
  {
    question: "Какой тег создаёт нумерованный список?",
    answers: ["<ul>", "<li>", "<ol>", "<list>"],
    correct: 2
  },
  {
    question: "Какие теги используются для создания списков?",
    answers: ["<ul>", "<ol>", "<li>", "<table>"],
    correct: [0, 1, 2]
  },
  {
    question: "Какой тег содержит основное содержимое веб-страницы?",
    answers: ["<body>", "<main>", "<content>", "<section>"],
    correct: 0
  }
];

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const checkBtn = document.getElementById("check-btn");
const restartBtn = document.getElementById("restart-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const themeBtn = document.getElementById("theme-toggle");

const bestScoreEl = document.getElementById("best-score");
const finalBestScoreEl = document.getElementById("final-best-score");
const questionCountEl = document.getElementById("question-count");
const scoreEl = document.getElementById("score");
const questionEl = document.getElementById("question");
const questionHintEl = document.getElementById("question-hint");
const answersEl = document.getElementById("answers");
const resultText = document.getElementById("result-text");
const progressBar = document.getElementById("progress-bar");

let currentQuestion = 0;
let score = 0;
let answered = false;
let selectedAnswers = [];
let quizQuestions = [];

const bestScore = Number(localStorage.getItem("bestQuizScore")) || 0;
bestScoreEl.textContent = bestScore;

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
checkBtn.addEventListener("click", checkMultipleAnswer);
restartBtn.addEventListener("click", startQuiz);
clearHistoryBtn?.addEventListener("click", clearHistory);
themeBtn.addEventListener("click", toggleTheme);

loadTheme();
renderResults();

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  answered = false;
  selectedAnswers = [];

  quizQuestions = shuffleArray([...questions]);

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  showQuestion();
}

function showQuestion() {
  answered = false;
  selectedAnswers = [];
  nextBtn.classList.add("hidden");
  checkBtn.classList.add("hidden");
  answersEl.innerHTML = "";

  const item = quizQuestions[currentQuestion];
  const isMultiple = Array.isArray(item.correct);

  questionCountEl.textContent = `Вопрос ${currentQuestion + 1} из ${quizQuestions.length}`;
  scoreEl.textContent = score;
  questionEl.textContent = item.question;
  questionHintEl.textContent = isMultiple
    ? "Выберите несколько правильных варианов."
    : "Выберите один правильный вариант.";

  progressBar.style.width = `${(currentQuestion / quizQuestions.length) * 100}%`;

  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.textContent = answer;

    if (isMultiple) {
      button.addEventListener("click", () => toggleAnswer(button, index));
    } else {
      button.addEventListener("click", () => selectSingleAnswer(button, index));
    }

    answersEl.appendChild(button);
  });

  if (isMultiple) {
    checkBtn.classList.remove("hidden");
    checkBtn.disabled = true;
  }
}

function selectSingleAnswer(button, index) {
  if (answered) return;

  answered = true;

  const correctIndex = quizQuestions[currentQuestion].correct;
  const answerButtons = document.querySelectorAll(".answer");

  if (index === correctIndex) {
    score++;
    button.classList.add("correct");
  } else {
    button.classList.add("wrong");
    answerButtons[correctIndex].classList.add("correct");
  }

  answerButtons.forEach(item => item.disabled = true);
  scoreEl.textContent = score;
  nextBtn.classList.remove("hidden");
}

function toggleAnswer(button, index) {
  if (answered) return;

  button.classList.toggle("selected");

  if (selectedAnswers.includes(index)) {
    selectedAnswers = selectedAnswers.filter(item => item !== index);
  } else {
    selectedAnswers.push(index);
  }

  checkBtn.disabled = selectedAnswers.length === 0;
}

function checkMultipleAnswer() {
  if (answered) return;

  answered = true;
  checkBtn.classList.add("hidden");

  const correctAnswers = quizQuestions[currentQuestion].correct;
  const answerButtons = document.querySelectorAll(".answer");

  const isCorrect =
    selectedAnswers.length === correctAnswers.length &&
    selectedAnswers.every(index => correctAnswers.includes(index));

  if (isCorrect) {
    score++;
  }

  answerButtons.forEach((button, index) => {
    button.disabled = true;

    if (correctAnswers.includes(index)) {
      button.classList.add("correct");
    } else if (selectedAnswers.includes(index)) {
      button.classList.add("wrong");
    }
  });

  scoreEl.textContent = score;
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestion++;

  if (currentQuestion < quizQuestions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  progressBar.style.width = "100%";

  const percent = Math.round((score / quizQuestions.length) * 100);
  const level = getResultLevel(score, quizQuestions.length);
  let results = JSON.parse(localStorage.getItem("quizResults")) || [];

  results.push({
    score: score,
    percent: percent,
    level: level.text,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("quizResults", JSON.stringify(results));

  const bestScore = Math.max(...results.map(item => item.score));
  localStorage.setItem("bestQuizScore", bestScore);

  resultText.innerHTML = `
    Вы набрали <strong>${score}</strong> из <strong>${quizQuestions.length}</strong> баллов (${percent}%).
    <br>
    <span class="result-level">${level.text}</span>
  `;

  finalBestScoreEl.textContent = bestScore;
  bestScoreEl.textContent = bestScore;

  renderResults();
}

function renderResults() {
  const list = document.getElementById("results-list");
  if (!list) return;

  list.innerHTML = "";

  const results = JSON.parse(localStorage.getItem("quizResults")) || [];

  results
    .sort((a, b) => b.score - a.score)
    .forEach(item => {
      const li = document.createElement("li");
      const percent = item.percent ?? Math.round((item.score / questions.length) * 100);
      const level = item.level ? ` — ${item.level}` : "";
      li.textContent = `${item.date} — ${item.score} баллов (${percent}%)${level}`;
      list.appendChild(li);
    });
}

function getResultLevel(score, total) {
  const percent = (score / total) * 100;

  if (percent <= 50) {
    return { text: "Новичок"};
  }

  if (percent <= 80) {
    return { text: "Продвинутый"};
  }

  return { text: "Эксперт HTML"};
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeButton(isDark);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark";

  document.body.classList.toggle("dark", isDark);
  updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
  themeBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i> Светлая тема'
    : '<i class="fa-solid fa-moon"></i> Тёмная тема';
}


function clearHistory() {
  if (!confirm("Очистить историю прохождений?")) return;

  localStorage.removeItem("quizResults");
  localStorage.removeItem("bestQuizScore");

  document.getElementById("results-list").innerHTML = "";
  document.getElementById("best-score").textContent = "0";
  document.getElementById("final-best-score").textContent = "0";

  alert("История очищена");
}
