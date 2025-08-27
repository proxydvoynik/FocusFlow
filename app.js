// Application Data
const appData = {
  currentSession: {
    type: "Deep Work",
    startTime: "09:30 AM",
    duration: 120,
    focusScore: 87,
    status: "active"
  },
  distractionPredictions: [
    {time: "10:45 AM", type: "Social Media", confidence: "High", likelihood: 78},
    {time: "11:30 AM", type: "Email Check", confidence: "Medium", likelihood: 65},
    {time: "12:15 PM", type: "Procrastination", confidence: "Low", likelihood: 42},
    {time: "1:00 PM", type: "Hunger Break", confidence: "High", likelihood: 89}
  ],
  sessionTypes: [
    {name: "Deep Work", description: "Focused coding/writing", settings: {notifications: "blocked", tools: ["VS Code", "Documentation"], theme: "dark"}},
    {name: "Creative", description: "Brainstorming and ideation", settings: {notifications: "filtered", tools: ["Figma", "Miro"], theme: "light"}},
    {name: "Collaborative", description: "Meetings and team work", settings: {notifications: "enabled", tools: ["Slack", "Zoom"], theme: "light"}},
    {name: "Learning", description: "Research and study", settings: {notifications: "minimal", tools: ["Browser", "Notes"], theme: "focus"}}
  ],
  analyticsData: {
    weeklyFocusScores: [82, 78, 85, 91, 76, 88, 84],
    distractionTypes: [
      {type: "Social Media", frequency: 34},
      {type: "Email", frequency: 28},
      {type: "Procrastination", frequency: 19},
      {type: "Phone", frequency: 12},
      {type: "Other", frequency: 7}
    ],
    bestProductiveHours: ["9:00-11:00 AM", "2:00-4:00 PM"],
    sessionSuccess: 73
  },
  tools: [
    {name: "VS Code", status: "ready", lastLaunched: "09:31 AM"},
    {name: "Slack", status: "paused", notifications: 5},
    {name: "Calendar", status: "active", nextEvent: "2:00 PM"},
    {name: "Spotify", status: "active", playlist: "Focus Mix"},
    {name: "Notes", status: "ready", documents: 3}
  ],
  recentSuggestions: [
    {time: "09:28 AM", suggestion: "Starting deep work mode - launching VS Code and blocking distractions", accepted: true},
    {time: "10:15 AM", suggestion: "Taking a 5-minute break to maintain focus", accepted: false},
    {time: "10:42 AM", suggestion: "Social media urge predicted - would you like extra blocking?", accepted: true}
  ]
};

// Application State
let currentTheme = 'light';
let sessionStartTime = new Date();
sessionStartTime.setHours(9, 30, 0, 0);
let isSessionActive = true;
let focusChart = null;
let distractionChart = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing FocusAI application...');
  initializeNavigation();
  initializeThemeToggle();
  initializeTimer();
  initializeInteractiveElements();
  initializeSessionTypeSelection();
  startAIIndicator();
  
  // Initialize charts after a short delay to ensure DOM is ready
  setTimeout(() => {
    initializeCharts();
  }, 500);
  
  // Show initial suggestions after a short delay
  setTimeout(showProactiveSuggestion, 3000);
  
  // Animate focus score
  setTimeout(animateFocusScore, 500);
});

// Navigation System - Fixed
function initializeNavigation() {
  console.log('Initializing navigation...');
  const navTabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.view');
  
  console.log('Found nav tabs:', navTabs.length);
  console.log('Found views:', views.length);
  
  navTabs.forEach((tab, index) => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const targetView = this.getAttribute('data-view');
      console.log('Clicked tab:', targetView);
      
      // Update active tab
      navTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Update active view
      views.forEach(view => {
        view.classList.remove('active');
        console.log('Removing active from:', view.id);
      });
      
      const targetElement = document.getElementById(targetView);
      if (targetElement) {
        targetElement.classList.add('active');
        console.log('Adding active to:', targetView);
        
        // Initialize charts when analytics view is shown
        if (targetView === 'analytics') {
          setTimeout(() => {
            initializeCharts();
          }, 100);
        }
      } else {
        console.error('Target view not found:', targetView);
      }
    });
  });
}

// Theme Toggle - Fixed
function initializeThemeToggle() {
  console.log('Initializing theme toggle...');
  const themeToggle = document.querySelector('.theme-toggle');
  
  if (!themeToggle) {
    console.error('Theme toggle button not found');
    return;
  }
  
  themeToggle.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Theme toggle clicked, current theme:', currentTheme);
    
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log('Switching to theme:', currentTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    
    // Update button icon
    this.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    
    // Update charts if they exist
    if (focusChart) {
      updateChartTheme(focusChart);
    }
    if (distractionChart) {
      updateChartTheme(distractionChart);
    }
    
    console.log('Theme switched to:', currentTheme);
  });
}

// Session Timer
function initializeTimer() {
  const timerDisplay = document.querySelector('.timer-display');
  if (!timerDisplay) return;
  
  function updateTimer() {
    if (!isSessionActive) return;
    
    const now = new Date();
    const sessionDuration = appData.currentSession.duration * 60 * 1000; // Convert to milliseconds
    const elapsed = now - sessionStartTime;
    const remaining = Math.max(0, sessionDuration - elapsed);
    
    if (remaining === 0) {
      timerDisplay.textContent = '0:00:00';
      showSessionCompleteNotification();
      isSessionActive = false;
      return;
    }
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.textContent = formattedTime;
  }
  
  // Update timer every second
  setInterval(updateTimer, 1000);
  updateTimer(); // Initial call
}

// Charts Initialization
function initializeCharts() {
  console.log('Initializing charts...');
  
  // Destroy existing charts if they exist
  if (focusChart) {
    focusChart.destroy();
    focusChart = null;
  }
  if (distractionChart) {
    distractionChart.destroy();
    distractionChart = null;
  }
  
  initializeFocusChart();
  initializeDistractionChart();
}

function initializeFocusChart() {
  const ctx = document.getElementById('focusChart');
  if (!ctx) {
    console.log('Focus chart canvas not found');
    return;
  }
  
  console.log('Creating focus chart...');
  
  focusChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Focus Score',
        data: appData.analyticsData.weeklyFocusScores,
        borderColor: '#1FB8CD',
        backgroundColor: 'rgba(31, 184, 205, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 70,
          max: 100,
          grid: {
            color: 'rgba(119, 124, 124, 0.1)'
          },
          ticks: {
            color: '#626c7c'
          }
        },
        x: {
          grid: {
            color: 'rgba(119, 124, 124, 0.1)'
          },
          ticks: {
            color: '#626c7c'
          }
        }
      }
    }
  });
  
  console.log('Focus chart created successfully');
}

function initializeDistractionChart() {
  const ctx = document.getElementById('distractionChart');
  if (!ctx) {
    console.log('Distraction chart canvas not found');
    return;
  }
  
  console.log('Creating distraction chart...');
  
  distractionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: appData.analyticsData.distractionTypes.map(d => d.type),
      datasets: [{
        data: appData.analyticsData.distractionTypes.map(d => d.frequency),
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            color: '#626c7c',
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
  
  console.log('Distraction chart created successfully');
}

function updateChartTheme(chart) {
  const textColor = currentTheme === 'dark' ? '#f5f5f5' : '#626c7c';
  const gridColor = currentTheme === 'dark' ? 'rgba(167, 169, 169, 0.1)' : 'rgba(119, 124, 124, 0.1)';
  
  if (chart.options.scales) {
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.grid.color = gridColor;
  }
  
  if (chart.options.plugins.legend) {
    chart.options.plugins.legend.labels.color = textColor;
  }
  
  chart.update();
}

// Interactive Elements
function initializeInteractiveElements() {
  initializeQuickActions();
  initializeSessionControls();
  initializeToolCards();
  initializePredictionFeedback();
  initializeSettingsToggles();
}

function initializeQuickActions() {
  const quickActionBtns = document.querySelectorAll('.quick-action-btn');
  
  quickActionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const actionLabel = this.querySelector('.action-label').textContent;
      handleQuickAction(actionLabel);
    });
  });
}

function handleQuickAction(action) {
  const aiIndicator = document.querySelector('.ai-indicator');
  const aiText = document.querySelector('.ai-text');
  
  // Simulate AI processing
  if (aiText) aiText.textContent = 'Processing...';
  
  setTimeout(() => {
    switch(action) {
      case 'Start Focus Mode':
        showNotification('Focus mode activated! Notifications blocked and workspace optimized.', 'success');
        break;
      case 'Take Break':
        showNotification('Break started. Timer paused for 15 minutes.', 'info');
        break;
      case 'Optimize Workspace':
        showNotification('Workspace optimized! Tools launched and distractions minimized.', 'success');
        break;
    }
    if (aiText) aiText.textContent = 'AI Learning...';
  }, 1500);
}

function initializeSessionControls() {
  const pauseBtn = document.querySelector('.session-controls .btn--outline');
  const extendBtn = document.querySelector('.session-controls .btn--primary');
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function() {
      isSessionActive = !isSessionActive;
      this.textContent = isSessionActive ? 'Pause' : 'Resume';
      showNotification(isSessionActive ? 'Session resumed' : 'Session paused', 'info');
    });
  }
  
  if (extendBtn) {
    extendBtn.addEventListener('click', function() {
      appData.currentSession.duration += 30;
      showNotification('Session extended by 30 minutes', 'success');
    });
  }
}

function initializeToolCards() {
  const toolCards = document.querySelectorAll('.tool-card');
  
  toolCards.forEach(card => {
    card.addEventListener('click', function() {
      const toolName = this.querySelector('.tool-name').textContent;
      showNotification(`${toolName} interaction simulated`, 'info');
    });
  });
}

function initializePredictionFeedback() {
  const feedbackBtns = document.querySelectorAll('.timeline-feedback');
  
  feedbackBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      showFeedbackModal(this);
    });
  });
}

function showFeedbackModal(btn) {
  const predictionType = btn.closest('.timeline-content').querySelector('.prediction-type').textContent;
  
  // Simple feedback simulation
  const feedback = confirm(`Was the prediction for "${predictionType}" accurate?`);
  
  if (feedback !== null) {
    showNotification(
      `Thank you for your feedback on "${predictionType}". This helps improve our AI accuracy.`,
      'success'
    );
    
    // Update button to show feedback was provided
    btn.textContent = 'Feedback Provided';
    btn.disabled = true;
    btn.classList.add('status--success');
  }
}

function initializeSettingsToggles() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const selects = document.querySelectorAll('select');
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const label = this.parentElement.textContent.trim();
      showNotification(`${label} ${this.checked ? 'enabled' : 'disabled'}`, 'info');
    });
  });
  
  selects.forEach(select => {
    select.addEventListener('change', function() {
      const label = this.previousElementSibling?.textContent || 'Setting';
      showNotification(`${label} updated to ${this.value}`, 'info');
    });
  });
}

// Session Type Selection
function initializeSessionTypeSelection() {
  const sessionCards = document.querySelectorAll('.session-type-card');
  
  sessionCards.forEach(card => {
    card.addEventListener('click', function() {
      // Remove active class from all cards
      sessionCards.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked card
      this.classList.add('active');
      
      const sessionName = this.querySelector('h4').textContent;
      showNotification(`Switched to ${sessionName} session mode`, 'success');
      
      // Update current session display
      updateCurrentSessionDisplay(sessionName);
    });
  });
}

function updateCurrentSessionDisplay(sessionName) {
  const currentSessionTitle = document.querySelector('.current-session-display h3');
  const sessionBadge = document.querySelector('.session-badge');
  
  if (currentSessionTitle) {
    currentSessionTitle.textContent = `Current Session: ${sessionName}`;
  }
  
  if (sessionBadge) {
    sessionBadge.textContent = sessionName;
  }
  
  // Find session settings and update display
  const sessionData = appData.sessionTypes.find(s => s.name === sessionName);
  if (sessionData) {
    updateSessionSettings(sessionData.settings);
  }
}

function updateSessionSettings(settings) {
  const settingsContainer = document.querySelector('.session-settings');
  if (!settingsContainer) return;
  
  // Update notifications setting
  const notificationValue = settingsContainer.querySelector('.setting-item:first-child .setting-value');
  if (notificationValue) {
    notificationValue.textContent = settings.notifications.charAt(0).toUpperCase() + settings.notifications.slice(1);
    notificationValue.className = `setting-value ${settings.notifications === 'blocked' ? 'blocked' : ''}`;
  }
  
  // Update tools setting
  const toolsValue = settingsContainer.querySelector('.setting-item:nth-child(2) .setting-value');
  if (toolsValue) {
    toolsValue.textContent = settings.tools.join(', ');
  }
  
  // Update theme setting
  const themeValue = settingsContainer.querySelector('.setting-item:nth-child(3) .setting-value');
  if (themeValue) {
    themeValue.textContent = settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1);
  }
}

// AI Indicator
function startAIIndicator() {
  const aiIndicator = document.querySelector('.ai-indicator');
  const aiText = document.querySelector('.ai-text');
  
  if (!aiText) return;
  
  const messages = [
    'AI Learning...',
    'Analyzing patterns...',
    'Optimizing workspace...',
    'Predicting distractions...',
    'Processing behavior data...'
  ];
  
  let messageIndex = 0;
  
  setInterval(() => {
    aiText.textContent = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length;
  }, 4000);
}

// Focus Score Animation
function animateFocusScore() {
  const scoreNumber = document.querySelector('.score-number');
  if (!scoreNumber) return;
  
  let currentScore = 0;
  const targetScore = appData.currentSession.focusScore;
  const increment = targetScore / 50; // Animate over 50 steps
  
  const animation = setInterval(() => {
    currentScore += increment;
    if (currentScore >= targetScore) {
      currentScore = targetScore;
      clearInterval(animation);
    }
    scoreNumber.textContent = Math.round(currentScore);
  }, 20);
}

// Proactive Suggestions
function showProactiveSuggestion() {
  const suggestions = [
    "Your focus typically drops around 11:00 AM. Would you like me to schedule a short break?",
    "Based on your patterns, you might want to check email soon. Shall I prepare your inbox?",
    "Your productivity is highest right now. Consider tackling that challenging task you've been postponing.",
    "I notice you often get distracted by social media around this time. Want me to block those sites?",
    "Your calendar shows a meeting in 30 minutes. Should I prepare the meeting materials now?"
  ];
  
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  showNotification(randomSuggestion, 'info', true);
  
  // Schedule next suggestion
  setTimeout(showProactiveSuggestion, Math.random() * 300000 + 180000); // 3-8 minutes
}

// Session Complete Notification
function showSessionCompleteNotification() {
  showNotification(
    'Deep Work session complete! Great job maintaining focus. Would you like to start a break?',
    'success',
    true
  );
}

// Notification System
function showNotification(message, type = 'info', persistent = false) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Add notification styles
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-16)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: '9999',
    maxWidth: '400px',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out'
  });
  
  // Add type-specific styling
  switch(type) {
    case 'success':
      notification.style.borderLeftColor = 'var(--color-success)';
      notification.style.borderLeftWidth = '4px';
      break;
    case 'error':
      notification.style.borderLeftColor = 'var(--color-error)';
      notification.style.borderLeftWidth = '4px';
      break;
    case 'warning':
      notification.style.borderLeftColor = 'var(--color-warning)';
      notification.style.borderLeftWidth = '4px';
      break;
    default:
      notification.style.borderLeftColor = 'var(--color-info)';
      notification.style.borderLeftWidth = '4px';
  }
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Close functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    removeNotification(notification);
  });
  
  // Auto-remove after delay (unless persistent)
  if (!persistent) {
    setTimeout(() => {
      if (document.body.contains(notification)) {
        removeNotification(notification);
      }
    }, 5000);
  }
}

function removeNotification(notification) {
  notification.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 300);
}

// Productivity Insights Updates
function updateProductivityInsights() {
  // Simulate dynamic insights based on current time and patterns
  const currentHour = new Date().getHours();
  const insights = document.querySelectorAll('.insight-value');
  
  if (insights.length >= 3) {
    // Update session success rate based on current performance
    const successRate = Math.min(100, Math.max(0, appData.analyticsData.sessionSuccess + Math.floor(Math.random() * 10 - 5)));
    insights[1].textContent = `${successRate}%`;
    
    // Highlight productive hours if we're in one
    if ((currentHour >= 9 && currentHour <= 11) || (currentHour >= 14 && currentHour <= 16)) {
      insights[0].style.color = 'var(--color-success)';
      insights[0].style.fontWeight = 'var(--font-weight-bold)';
    }
  }
}

// Update insights every 5 minutes
setInterval(updateProductivityInsights, 300000);

// Export functions for debugging
window.appDebug = {
  showNotification,
  updateFocusScore: (score) => {
    appData.currentSession.focusScore = score;
    animateFocusScore();
  },
  triggerSuggestion: showProactiveSuggestion,
  toggleTheme: () => document.querySelector('.theme-toggle').click(),
  getCurrentTheme: () => currentTheme,
  testNavigation: () => {
    console.log('Testing navigation...');
    const tabs = document.querySelectorAll('.nav-tab');
    const views = document.querySelectorAll('.view');
    console.log('Tabs found:', tabs.length);
    console.log('Views found:', views.length);
    tabs.forEach((tab, i) => {
      console.log(`Tab ${i}:`, tab.getAttribute('data-view'));
    });
    views.forEach((view, i) => {
      console.log(`View ${i}:`, view.id, view.classList.contains('active'));
    });
  }
};