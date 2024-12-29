// script.js

/***************************************************
 *  IMPORT THE MASSIVE 600+ QUESTION BANK
 ***************************************************/
import questionBank from './questionbank.js';

/***************************************************
 * 1. DATA STRUCTURES AND GLOBALS
 ***************************************************/

/**
 * This array holds our high-level study guide text
 * for each category. We’ll merge it with the question bank
 * to build a comprehensive, all-inclusive study guide.
 */
const studyGuide = [
  {
    state: 'AZ',
    category: 'Mortgage Lending Basics',
    title: 'Mortgage Lending Basics',
    content: `
      <p>This section covers fundamental mortgage concepts, 
      including the primary vs. secondary mortgage markets, 
      promissory notes, amortization, and more.</p>
      <ul>
        <li><strong>Key Documents:</strong> Promissory Note, Mortgage/Deed of Trust</li>
        <li><strong>Underwriting Basics:</strong> Borrower credit, capacity, collateral</li>
        <li><strong>LTV &amp; DTI Ratios:</strong> Essential calculations for approval</li>
      </ul>
    `
  },
  {
    state: 'AZ',
    category: 'Federal Regulations',
    title: 'Key Federal Regulations',
    content: `
      <p>Federal laws shape how mortgages are advertised, 
      disclosed, and settled. Important regulations include:</p>
      <ul>
        <li><strong>RESPA (Reg X):</strong> Settlement cost disclosures, anti-kickback rules</li>
        <li><strong>TILA (Reg Z):</strong> Requires disclosure of APR and finance charges</li>
        <li><strong>ECOA (Reg B):</strong> Fairness in credit decisions (no discrimination)</li>
        <li><strong>HOEPA:</strong> Protects borrowers from high-cost or predatory loans</li>
        <li><strong>GLBA:</strong> Financial privacy protection</li>
      </ul>
    `
  },
  {
    state: 'AZ',
    category: 'State Regulations',
    title: 'Arizona State Regulations',
    content: `
      <p>Arizona imposes its own licensing requirements
      and regulations through the Arizona Department of Insurance 
      and Financial Institutions (DIFI). Topics include:</p>
      <ul>
        <li><strong>Licensing:</strong> Pre-licensing education & exam</li>
        <li><strong>License Renewal:</strong> Annual renewal requirements</li>
        <li><strong>Surety Bonds:</strong> Protect consumers from misconduct</li>
        <li><strong>Disciplinary Actions:</strong> DIFI enforcement power</li>
      </ul>
    `
  },
  {
    state: 'AZ',
    category: 'Loan Origination',
    title: 'Loan Origination & Underwriting',
    content: `
      <p>The loan origination process includes taking applications,
      gathering borrower documentation, and underwriting. Key points:</p>
      <ul>
        <li><strong>Loan Estimate (LE):</strong> Initial cost estimate</li>
        <li><strong>Closing Disclosure (CD):</strong> Final settlement & loan terms</li>
        <li><strong>NMLS Requirements:</strong> SAFE Act licensing standards</li>
        <li><strong>Underwriting:</strong> Evaluates credit, income, assets, property</li>
      </ul>
    `
  },
  {
    state: 'AZ',
    category: 'Ethics',
    title: 'Ethics & Professional Responsibilities',
    content: `
      <p>Ethical lending protects consumers and maintains 
      integrity in the mortgage industry:</p>
      <ul>
        <li><strong>Truthful Advertising:</strong> No deceptive rates or terms</li>
        <li><strong>Fair Dealing:</strong> No steering or predatory tactics</li>
        <li><strong>Fraud Prevention:</strong> Honest documentation & disclosures</li>
        <li><strong>SAFE Act:</strong> Uniform licensing & oversight</li>
      </ul>
    `
  },
  {
    state: 'AZ',
    category: 'Mortgage Products',
    title: 'Common Mortgage Products',
    content: `
      <p>A broad overview of popular mortgage products:</p>
      <ul>
        <li><strong>Conventional Loans:</strong> Conforming or Jumbo</li>
        <li><strong>FHA Loans:</strong> Insured by the Federal Housing Administration</li>
        <li><strong>VA Loans:</strong> Guaranteed by the Department of Veterans Affairs</li>
        <li><strong>USDA Loans:</strong> Rural & moderate-income targeted</li>
        <li><strong>ARMs:</strong> Rate adjusts based on index + margin</li>
        <li><strong>Balloon Mortgages:</strong> Large final payment at term end</li>
      </ul>
    `
  }
];

/**
 * userStats: tracks overall performance, quiz history, etc.
 */
let userStats = {
  questionsAttempted: 0,
  correctAnswers: 0,
  categoryPerformance: {},
  quizHistory: []
};

/**
 * currentQuiz: tracks the user’s current quiz session
 */
let currentQuiz = {
  questions: [],
  userAnswers: [],
  currentIndex: 0,
  showAnswers: false,
  showExplanations: false,
  isActive: false
};


/***************************************************
 * 2. HELPER FUNCTIONS
 ***************************************************/

/**
 * Show/hide main sections by ID
 */
window.showSection = function(sectionId) {
  const sections = document.querySelectorAll('.main-section');
  sections.forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';

  // If user navigates to Stats, re-draw quiz history & chart
  if (sectionId === 'stats') {
    renderQuizHistory();
    drawHistoryChart();
  }
};

/**
 * Populate categories in the dropdown and update total questions text.
 * Also sets up an event listener so that when a user picks a category,
 * we update the maximum question count to that category’s available total.
 */
function initCategories() {
  const categorySelect = document.getElementById('categorySelect');

  // Unique categories from questionBank
  const categories = new Set(questionBank.map(q => q.category));

  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Show total questions in QBank
  const totalQuestionsText = document.getElementById('totalQuestionsText');
  totalQuestionsText.textContent = `There are ${questionBank.length} total questions in the QBank.`;

  // Update #questionCount max when category changes
  categorySelect.addEventListener('change', updateQuestionCountMax);

  // Initialize once at load
  updateQuestionCountMax();
}

/**
 * Update the "Number of Questions" input (max value) based on selected category
 */
function updateQuestionCountMax() {
  const category = document.getElementById('categorySelect').value;
  const questionCountInput = document.getElementById('questionCount');

  let filtered = questionBank;
  if (category !== 'all') {
    filtered = questionBank.filter(q => q.category === category);
  }
  const maxQ = filtered.length;

  // Update the max attribute for the #questionCount input
  questionCountInput.max = maxQ;

  // If the current value is higher than max, reset to max
  if (parseInt(questionCountInput.value, 10) > maxQ) {
    questionCountInput.value = maxQ;
  }
}

/**
 * Update the Stats UI
 */
function updateStatsUI() {
  const questionsAttemptedEl = document.getElementById('questionsAttempted');
  const correctAnswersEl = document.getElementById('correctAnswers');
  const accuracyEl = document.getElementById('accuracy');
  const weakAreasEl = document.getElementById('weakAreas');

  questionsAttemptedEl.textContent = userStats.questionsAttempted;
  correctAnswersEl.textContent = userStats.correctAnswers;

  const accuracy = userStats.questionsAttempted === 0
    ? 0
    : Math.round((userStats.correctAnswers / userStats.questionsAttempted) * 100);
  accuracyEl.textContent = accuracy + '%';

  // Identify weak areas: categories with <70% accuracy
  const weakAreas = [];
  for (let cat in userStats.categoryPerformance) {
    const perf = userStats.categoryPerformance[cat];
    const catAccuracy = perf.attempts === 0 ? 0 : (perf.correct / perf.attempts);
    if (catAccuracy < 0.7) {
      weakAreas.push(cat);
    }
  }
  weakAreasEl.textContent = weakAreas.length ? weakAreas.join(', ') : 'None';
}

/**
 * Record an individual answered question in userStats
 */
function recordAnswer(category, isCorrect) {
  userStats.questionsAttempted++;
  if (isCorrect) {
    userStats.correctAnswers++;
  }

  if (!userStats.categoryPerformance[category]) {
    userStats.categoryPerformance[category] = { attempts: 0, correct: 0 };
  }
  userStats.categoryPerformance[category].attempts++;
  if (isCorrect) {
    userStats.categoryPerformance[category].correct++;
  }

  updateStatsUI();
}


/***************************************************
 * 3. QUIZ LOGIC
 ***************************************************/

/**
 * Start a new quiz
 */
window.startQuiz = function() {
  const questionCount = parseInt(document.getElementById('questionCount').value, 10);
  const category = document.getElementById('categorySelect').value;
  currentQuiz.showAnswers = document.getElementById('showAnswers').checked;
  currentQuiz.showExplanations = document.getElementById('showExplanations').checked;

  // Filter questions by category (if not "all")
  let filtered = questionBank;
  if (category !== 'all') {
    filtered = questionBank.filter(q => q.category === category);
  }

  // Shuffle and slice
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, questionCount);

  // Initialize current quiz
  currentQuiz.questions = selected;
  currentQuiz.userAnswers = new Array(selected.length).fill(null);
  currentQuiz.currentIndex = 0;
  currentQuiz.isActive = true;

  document.getElementById('singleQuestionView').style.display = 'block';
  renderCurrentQuestion();
};

/**
 * Render the currently selected question
 */
function renderCurrentQuestion() {
  if (!currentQuiz.isActive) {
    document.getElementById('singleQuestionView').style.display = 'none';
    return;
  }

  const qObj = currentQuiz.questions[currentQuiz.currentIndex];
  const questionText = document.getElementById('questionText');
  const choicesContainer = document.getElementById('choicesContainer');
  const answerResult = document.getElementById('answerResult');
  const explanationText = document.getElementById('explanationText');

  questionText.textContent = `Question ${currentQuiz.currentIndex + 1}/${currentQuiz.questions.length}: ${qObj.question}`;

  // Reset
  choicesContainer.innerHTML = '';
  answerResult.textContent = '';
  answerResult.style.color = 'initial';
  explanationText.style.display = 'none';
  explanationText.textContent = '';

  // Render choices
  qObj.choices.forEach((choice, i) => {
    const label = document.createElement('label');
    label.style.display = 'block';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'currentQuestion';
    input.value = i;
    if (currentQuiz.userAnswers[currentQuiz.currentIndex] === i) {
      input.checked = true;
    }

    label.appendChild(input);
    label.appendChild(document.createTextNode(choice));
    choicesContainer.appendChild(label);
  });

  // Navigation button states
  document.getElementById('prevQuestionBtn').disabled = currentQuiz.currentIndex === 0;
  document.getElementById('nextQuestionBtn').disabled = currentQuiz.currentIndex === (currentQuiz.questions.length - 1);

  // Build question navigation dropdown
  const questionNav = document.getElementById('questionNav');
  questionNav.innerHTML = ''; // Clear existing

  const select = document.createElement('select');
  for (let i = 0; i < currentQuiz.questions.length; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Question ${i + 1}`;
    if (i === currentQuiz.currentIndex) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  // Jump to selected question
  select.addEventListener('change', (e) => {
    currentQuiz.currentIndex = parseInt(e.target.value, 10);
    renderCurrentQuestion();
  });

  questionNav.appendChild(select);
}

/**
 * Submit the current question’s answer
 */
window.submitCurrentAnswer = function() {
  if (!currentQuiz.isActive) return;

  const qObj = currentQuiz.questions[currentQuiz.currentIndex];
  const answerResult = document.getElementById('answerResult');
  const explanationText = document.getElementById('explanationText');

  const selectedRadio = document.querySelector('input[name="currentQuestion"]:checked');
  if (!selectedRadio) {
    alert('Please select an answer.');
    return;
  }

  const selectedValue = parseInt(selectedRadio.value, 10);
  currentQuiz.userAnswers[currentQuiz.currentIndex] = selectedValue;

  const isCorrect = (selectedValue === qObj.correctAnswerIndex);

  if (isCorrect) {
    answerResult.textContent = 'Correct!';
    answerResult.style.color = 'green';
  } else {
    answerResult.textContent = `Incorrect! The correct answer is: ${qObj.choices[qObj.correctAnswerIndex]}`;
    answerResult.style.color = 'red';
  }

  // If "show answers" is enabled or user was wrong, highlight correct answer
  if (currentQuiz.showAnswers || !isCorrect) {
    const labels = document.querySelectorAll('#choicesContainer label');
    labels.forEach((lbl, idx) => {
      if (idx === qObj.correctAnswerIndex) {
        lbl.style.color = 'green';
        lbl.style.fontWeight = 'bold';
      } else {
        lbl.style.color = 'initial';
        lbl.style.fontWeight = 'normal';
      }
    });
  }

  // Show explanation if requested
  if (currentQuiz.showExplanations) {
    explanationText.style.display = 'block';
    explanationText.textContent = `Explanation: ${qObj.explanation}`;
  }
};

/**
 * Navigation: previous/next question
 */
window.goToPreviousQuestion = function() {
  if (currentQuiz.currentIndex > 0) {
    currentQuiz.currentIndex--;
    renderCurrentQuestion();
  }
};

window.goToNextQuestion = function() {
  if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
    currentQuiz.currentIndex++;
    renderCurrentQuestion();
  }
};

/**
 * Submit the entire exam
 */
window.submitExam = function() {
  if (!currentQuiz.isActive) return;

  let totalCorrect = 0;
  let categoryTally = {};

  // Tally results
  currentQuiz.questions.forEach((q, i) => {
    const userAns = currentQuiz.userAnswers[i];
    if (userAns === q.correctAnswerIndex) {
      totalCorrect++;
    }
    if (!categoryTally[q.category]) {
      categoryTally[q.category] = { attempts: 0, correct: 0 };
    }
    categoryTally[q.category].attempts++;
    if (userAns === q.correctAnswerIndex) {
      categoryTally[q.category].correct++;
    }
  });

  // Update userStats
  currentQuiz.questions.forEach((q, i) => {
    const userAns = currentQuiz.userAnswers[i];
    recordAnswer(q.category, userAns === q.correctAnswerIndex);
  });

  const totalQuestions = currentQuiz.questions.length;
  const percentCorrect = Math.round((totalCorrect / totalQuestions) * 100);
  const dateStr = new Date().toLocaleString();

  // Category breakdown string
  let catPerfStr = '';
  Object.keys(categoryTally).forEach(cat => {
    const catData = categoryTally[cat];
    const catAccuracy = Math.round((catData.correct / catData.attempts) * 100);
    catPerfStr += `${cat}: ${catAccuracy}% | `;
  });

  userStats.quizHistory.push({
    date: dateStr,
    totalQuestions,
    correctAnswers: totalCorrect,
    percent: percentCorrect,
    categoryBreakdown: categoryTally
  });

  alert(`You got ${totalCorrect} out of ${totalQuestions} correct (${percentCorrect}%).\n\nBy Category:\n${catPerfStr}`);

  currentQuiz.isActive = false;
  document.getElementById('singleQuestionView').style.display = 'none';
  showSection('stats');
};


/***************************************************
 * 4. COMPREHENSIVE STUDY GUIDE (ALL 600+ QUESTIONS)
 ***************************************************/

/**
 * Renders a comprehensive, all-inclusive study guide that merges
 * the 'studyGuide' high-level info with the actual QBank (600+ questions).
 * This lets the user read & review everything on one page.
 */
function renderStudyGuide() {
  const guideContainer = document.getElementById('studyGuideContent');
  guideContainer.innerHTML = '';

  // Group questions by category
  const questionsByCategory = questionBank.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = [];
    }
    acc[q.category].push(q);
    return acc;
  }, {});

  // Convert 'studyGuide' array to a map for easy lookups
  const studyGuideMap = {};
  studyGuide.forEach(section => {
    studyGuideMap[section.category] = section;
  });

  // We'll fix the order of categories for clarity:
  const categoryOrder = [
    'Mortgage Lending Basics',
    'Federal Regulations',
    'State Regulations',
    'Loan Origination',
    'Ethics',
    'Mortgage Products'
  ];

  // Build a combined study guide
  categoryOrder.forEach(cat => {
    // Container for this category
    const catDiv = document.createElement('div');
    catDiv.classList.add('guide-section');

    // Title from the studyGuide if present
    const title = document.createElement('h3');
    if (studyGuideMap[cat]) {
      title.textContent = studyGuideMap[cat].title;
    } else {
      // fallback if not in array
      title.textContent = cat;
    }
    catDiv.appendChild(title);

    // Original study guide text if present
    if (studyGuideMap[cat]) {
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = studyGuideMap[cat].content;
      catDiv.appendChild(contentDiv);
    }

    // Now add ALL Q&A from questionBank for this category
    if (questionsByCategory[cat] && questionsByCategory[cat].length > 0) {
      const qListDiv = document.createElement('div');
      qListDiv.innerHTML = `<h4>Detailed Q&A - ${questionsByCategory[cat].length} Questions</h4>`;
      questionsByCategory[cat].forEach((qObj, index) => {
        const questionPara = document.createElement('p');
        questionPara.innerHTML = `
          <strong>Q${index + 1}:</strong> ${qObj.question}<br/>
          <em>Correct Answer:</em> ${qObj.choices[qObj.correctAnswerIndex]}<br/>
          <span style="font-style:italic;">Explanation: ${qObj.explanation}</span>
        `;
        qListDiv.appendChild(questionPara);
      });
      catDiv.appendChild(qListDiv);
    } else {
      // In case no questions found
      const noQuestions = document.createElement('p');
      noQuestions.textContent = 'No questions found for this category.';
      catDiv.appendChild(noQuestions);
    }

    // Append the category section
    guideContainer.appendChild(catDiv);
  });
}


/***************************************************
 * 5. IMPORT / EXPORT STATS
 ***************************************************/
window.exportData = function() {
  const dataStr = JSON.stringify(userStats, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'az_mortgage_broker_stats.json';
  link.click();

  URL.revokeObjectURL(url);
};

window.importData = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedStats = JSON.parse(e.target.result);
      if (
        typeof importedStats.questionsAttempted === 'number' &&
        typeof importedStats.correctAnswers === 'number' &&
        typeof importedStats.categoryPerformance === 'object' &&
        Array.isArray(importedStats.quizHistory)
      ) {
        userStats = importedStats;
        updateStatsUI();
        alert('Stats imported successfully!');
      } else {
        alert('Invalid stats file format.');
      }
    } catch (error) {
      alert('Error parsing JSON file.');
    }
  };
  reader.readAsText(file);
};


/***************************************************
 * 6. RENDER QUIZ HISTORY & DRAW LINE CHART
 ***************************************************/
function renderQuizHistory() {
  const quizHistoryBody = document.getElementById('quizHistoryBody');
  quizHistoryBody.innerHTML = '';

  userStats.quizHistory.forEach(hist => {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = hist.date;
    row.appendChild(dateCell);

    const totalCell = document.createElement('td');
    totalCell.textContent = hist.totalQuestions;
    row.appendChild(totalCell);

    const correctCell = document.createElement('td');
    correctCell.textContent = hist.correctAnswers;
    row.appendChild(correctCell);

    const pctCell = document.createElement('td');
    pctCell.textContent = hist.percent + '%';
    row.appendChild(pctCell);

    quizHistoryBody.appendChild(row);
  });
}

function drawHistoryChart() {
  const canvas = document.getElementById('historyChart');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userStats.quizHistory.length === 0) {
    ctx.fillStyle = '#666';
    ctx.fillText('No quiz history yet', 10, 20);
    return;
  }

  const dataPoints = userStats.quizHistory.map((hist, index) => ({
    x: index,
    y: hist.percent
  }));

  const padding = 30;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const maxPercent = 100;
  const minPercent = 0;

  // Draw line
  ctx.strokeStyle = '#007ACC';
  ctx.lineWidth = 2;
  ctx.beginPath();
  dataPoints.forEach((point, i) => {
    const xPos = padding + (point.x / (dataPoints.length - 1)) * chartWidth;
    const yPos = padding + (1 - (point.y - minPercent) / (maxPercent - minPercent)) * chartHeight;
    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  });
  ctx.stroke();

  // Draw points
  ctx.fillStyle = '#007ACC';
  dataPoints.forEach(point => {
    const xPos = padding + (point.x / (dataPoints.length - 1)) * chartWidth;
    const yPos = padding + (1 - (point.y - minPercent) / (maxPercent - minPercent)) * chartHeight;
    ctx.beginPath();
    ctx.arc(xPos, yPos, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Y-axis
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.stroke();

  // X-axis
  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Y-axis labels (0% to 100% in steps of 20)
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  for (let yLabel = 0; yLabel <= 100; yLabel += 20) {
    const yPos = padding + (1 - (yLabel - minPercent) / (maxPercent - minPercent)) * chartHeight;
    ctx.fillText(`${yLabel}%`, 5, yPos + 4);

    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(padding, yPos);
    ctx.lineTo(canvas.width - padding, yPos);
    ctx.stroke();
  }
}


/***************************************************
 * 7. ON LOAD
 ***************************************************/
window.addEventListener('load', function() {
  initCategories();
  renderStudyGuide(); // Build the all-inclusive study guide
  updateStatsUI();
});
