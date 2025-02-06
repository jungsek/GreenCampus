function initializeChatbot() {
    const openChatButton = document.getElementById('open-chat');
    const closeChatButton = document.getElementById('close-chat');
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('gc-typing-indicator');
  
    // Initialize Chart.js defaults
    Chart.defaults.color = '#666';
    Chart.defaults.font.family = 'Arial, sans-serif';
  
    /**
     * Toggles the loading state for the chat UI.
     * @param {boolean} isLoading 
     */
    function setLoadingState(isLoading) {
      typingIndicator.classList.toggle('gc-hidden', !isLoading);
      userInput.disabled = isLoading;
      sendButton.disabled = isLoading;
      if (isLoading) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  
    /**
     * Creates a new Chart.js chart.
     * @param {string} canvasId 
     * @param {object} data 
     * @param {string} type 
     */
    function createChart(canvasId, data, type = 'line') {
      const ctx = document.getElementById(canvasId).getContext('2d');
      return new Chart(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  
    /**
     * Helper to run a callback after the next repaint.
     * @param {Function} callback 
     */
    function runAfterDOMUpdate(callback) {
      requestAnimationFrame(callback);
    }
  
    /**
     * Converts markdown to HTML and inserts interactive elements or data.
     * @param {string} content 
     * @param {object} contextData 
     * @param {string} intent 
     * @returns {string} The final HTML to be placed in the chat
     */
    function formatBotMessage(content, contextData, intent) {
      // Convert markdown to HTML – consider sanitizing in production
      let htmlContent = marked.parse(content);
  
      // Add standardized styling wrapper
      htmlContent = `
        <div class="gc-message-content">
          ${htmlContent}
        </div>
      `;
  
      // Add CSS styles for standardized text
      const styleElement = document.createElement('style');
      if (!document.querySelector('#gc-message-styles')) {
        styleElement.id = 'gc-message-styles';
        styleElement.textContent = `
          .gc-message-content {
            font-size: 14px;
            line-height: 1.5;
          }
          .gc-message-content h1,
          .gc-message-content h2,
          .gc-message-content h3,
          .gc-message-content h4,
          .gc-message-content h5,
          .gc-message-content h6 {
            font-size: calc(1.275rem + .3vw);
            font-weight: bold;
            margin-bottom: 1rem;
            margin-top: 1rem;
          }
          .gc-message-content strong {
            font-weight: bold;
          }
          .gc-message-content p {
            font-size: 14px;
            margin-bottom: 0.75rem;
          }
          .gc-message-content ul, 
          .gc-message-content ol {
            font-size: 14px;
            padding-left: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .gc-message-content li {
            margin-bottom: 0.25rem;
          }
          .gc-data-section h4 {
            font-size: calc(1.275rem + .3vw);
            font-weight: bold;
          }
          .gc-data-section p {
            font-size: 14px;
          }
          .gc-campaign-card h4 {
            font-size: calc(1.275rem + .3vw);
            font-weight: bold;
          }
          .gc-campaign-card p {
            font-size: 14px;
          }
          .gc-welcome-message,
          .gc-menu-container {
            font-size: 14px;
          }
        `;
        document.head.appendChild(styleElement);
      }
  
      // ====== ENERGY & CARBON QUERIES ======
      if (intent === 'energy_query' || intent === 'carbon_query') {
        // ---- ENERGY USAGE ----
        if (content.includes('<chart-placeholder-energy>') && intent === 'energy_query') {
          // If there's already an "Analysis and Recommendations" block, we only add the chart container
          if (content.includes('Analysis and Recommendations') ||
              content.includes('🎯 Key Findings')) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'gc-chart-container';
            const canvas = document.createElement('canvas');
            canvas.id = 'energyChart-' + Date.now();
            chartContainer.appendChild(canvas);
  
            htmlContent = htmlContent.replace('<chart-placeholder-energy>', chartContainer.outerHTML);
  
            runAfterDOMUpdate(() => {
              createChart(canvas.id, contextData.energyData.chartData);
            });
          } else {
            // Build a full data card for Energy Usage
            const chartContainer = document.createElement('div');
            chartContainer.className = 'gc-chart-container';
            const canvas = document.createElement('canvas');
            canvas.id = 'energyChart-' + Date.now();
            chartContainer.appendChild(canvas);
  
            const energyDataset = contextData.energyData.chartData.datasets[0].data;
            const maxEnergy = Math.max(...energyDataset);
            const peakMonths = contextData.energyData.chartData.labels.filter(
              (label, index) => energyDataset[index] === maxEnergy
            ).join(', ');
  
            const dataCard = document.createElement('div');
            dataCard.className = 'gc-data-card';
  
            // Remove any net-zero snippet from Energy Usage to avoid duplication.
            // This data will now be handled in a separate "net_zero_query."
  
            // Current Status
            const currentStatusSection = document.createElement('div');
            currentStatusSection.className = 'gc-data-section';
            currentStatusSection.innerHTML = `
              <h4>Current Status</h4>
              <p>Our current energy usage is ${contextData.energyData.currentMonth.total}.</p>
            `;
  
            // Analysis & Recommendations
            const analysisSection = document.createElement('div');
            analysisSection.className = 'gc-data-section';
            analysisSection.innerHTML = `
              <h4>Analysis and Recommendations</h4>
              <p><strong>🎯 Key Findings</strong><br>
              We have achieved a reduction in our energy usage compared to the baseline.</p>
              <p><strong>📈 Peak Energy Usage</strong><br>
              Highest energy usage of ${maxEnergy} kWh was recorded in: ${peakMonths}</p>
              <p><strong>💡 Recommendations</strong><br>
              Reduce energy consumption during peak usage periods, promote energy-efficient practices, and explore renewable energy sources.</p>
            `;
  
            dataCard.appendChild(currentStatusSection);
            dataCard.appendChild(analysisSection);
  
            const spacer = document.createElement('div');
            spacer.className = 'gc-section-spacer';
  
            // Insert the chart as "Net Energy Usage Trend"
            htmlContent = htmlContent.replace(
              '<chart-placeholder-energy>',
              chartContainer.outerHTML + spacer.outerHTML + dataCard.outerHTML
            );
  
            runAfterDOMUpdate(() => {
              createChart(canvas.id, contextData.energyData.chartData);
            });
          }
        }
  
        // ---- CARBON FOOTPRINT ----
        if (content.includes('<chart-placeholder-carbon>') && intent === 'carbon_query') {
            // If the assistant's response already includes a full analysis, we just insert the chart.
            if (content.includes('Analysis and Recommendations') ||
                content.includes('🎯 Key Findings')) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'gc-chart-container';
            const canvas = document.createElement('canvas');
            canvas.id = 'carbonChart-' + Date.now();
            chartContainer.appendChild(canvas);
            htmlContent = htmlContent.replace('<chart-placeholder-carbon>', chartContainer.outerHTML);
        
            runAfterDOMUpdate(() => {
                const canvasElement = document.getElementById(canvas.id);
                if (canvasElement) {
                const ctx = canvasElement.getContext('2d');
                if (canvasElement.chart) canvasElement.chart.destroy();
                const monthlyValues = contextData.carbonData.main_chart.values;
                // Parse the carbon footprint from context; here it should be "25 tonnes CO₂"
                const totalCarbonMatch = contextData.energyData.carbonFootprint.match(/\d+/);
                const totalCarbon = totalCarbonMatch ? parseFloat(totalCarbonMatch[0]) : 0;
                canvasElement.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                    labels: contextData.carbonData.main_chart.labels.map(label => {
                        const date = new Date(label);
                        return date.toLocaleString('default', { month: 'short' });
                    }),
                    datasets: [{
                        label: 'Net Carbon Footprint CO₂ (tonnes)',
                        data: monthlyValues.map(v => (v * totalCarbon).toFixed(2)),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                    },
                    options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                        display: true,
                        text: 'Net Carbon Footprint CO₂',
                        font: { size: 16, weight: 'bold' }
                        },
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        y: {
                        beginAtZero: true,
                        title: { display: true, text: 'CO₂ (tonnes)' }
                        }
                    }
                    }
                });
                }
            });
            } else {
            // Otherwise, build a full data card for Carbon Footprint Analysis.
            const chartContainer = document.createElement('div');
            chartContainer.className = 'gc-chart-container';
            const canvas = document.createElement('canvas');
            canvas.id = 'carbonChart-' + Date.now();
            chartContainer.appendChild(canvas);
        
            const dataCard = document.createElement('div');
            dataCard.className = 'gc-data-card';
        
            // Parse the current carbon footprint (e.g., "25 tonnes CO₂" -> 25)
            const totalCarbonMatch = contextData.energyData.carbonFootprint.match(/\d+/);
            const totalCarbon = totalCarbonMatch ? parseFloat(totalCarbonMatch[0]) : 0;
            const monthlyValues = contextData.carbonData.main_chart.values;
            const maxMonthlyValue = Math.max(...monthlyValues);
            const peakMonths = contextData.carbonData.main_chart.labels
                .filter((label, index) => monthlyValues[index] === maxMonthlyValue)
                .map(label => new Date(label).toLocaleString('default', { month: 'long' }))
                .join(', ');
        
            // Build the analysis sections.
            const keyFindingsSection = document.createElement('div');
            keyFindingsSection.className = 'gc-data-section';
            keyFindingsSection.innerHTML = `
                <h4>🎯 Key Findings</h4>
                <p>Total carbon footprint is ${contextData.energyData.carbonFootprint}.</p>
                <p>Different factors contribute to the overall carbon footprint, with varying impacts.</p>
            `;
        
            const peakMonthsSection = document.createElement('div');
            peakMonthsSection.className = 'gc-data-section';
            peakMonthsSection.innerHTML = `
                <h4>📈 Peak Carbon Months</h4>
                <p>Highest carbon footprint of ${maxMonthlyValue} tonnes CO₂ was recorded in: ${peakMonths}.</p>
            `;
        
            const recommendationsSection = document.createElement('div');
            recommendationsSection.className = 'gc-data-section';
            recommendationsSection.innerHTML = `
                <h4>💡 Recommendations</h4>
                <p>Explore renewable energy sources.<br>Optimize energy usage during high-demand months.</p>
            `;
        
            dataCard.appendChild(keyFindingsSection);
            dataCard.appendChild(peakMonthsSection);
            dataCard.appendChild(recommendationsSection);
        
            const spacer = document.createElement('div');
            spacer.className = 'gc-section-spacer';
        
            htmlContent = htmlContent.replace(
                '<chart-placeholder-carbon>',
                chartContainer.outerHTML + spacer.outerHTML + dataCard.outerHTML
            );
        
            runAfterDOMUpdate(() => {
                const canvasElement = document.getElementById(canvas.id);
                if (canvasElement) {
                const ctx = canvasElement.getContext('2d');
                if (canvasElement.chart) canvasElement.chart.destroy();
                canvasElement.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                    labels: contextData.carbonData.main_chart.labels.map(label => {
                        const date = new Date(label);
                        return date.toLocaleString('default', { month: 'short' });
                    }),
                    datasets: [{
                        label: 'Net Carbon Footprint CO₂ (tonnes)',
                        data: monthlyValues.map(v => (v * totalCarbon).toFixed(2)),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                    },
                    options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                        display: true,
                        text: 'Net Carbon Footprint CO₂',
                        font: { size: 16, weight: 'bold' }
                        },
                        legend: { position: 'bottom' }
                    },
                    scales: {
                        y: {
                        beginAtZero: true,
                        title: { display: true, text: 'CO₂ (tonnes)' }
                        }
                    }
                    }
                });
                }
            });
            }
        }
  
  
        // Optional: Shared Pie Chart for <chart-placeholder-breakdown> (both queries)
        if (content.includes('<chart-placeholder-breakdown>')) {
          const breakdownContainer = document.createElement('div');
          breakdownContainer.className = 'gc-chart-container';
          const canvas = document.createElement('canvas');
          canvas.id = 'breakdownChart-' + Date.now();
          breakdownContainer.appendChild(canvas);
          htmlContent = htmlContent.replace('<chart-placeholder-breakdown>', breakdownContainer.outerHTML);
  
          runAfterDOMUpdate(() => {
            const breakdownData = {
              labels: Object.keys(contextData.energyData.currentMonth.breakdown),
              datasets: [{
                data: Object.values(contextData.energyData.currentMonth.breakdown).map(v => parseInt(v)),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
              }]
            };
            createChart(canvas.id, breakdownData, 'pie');
          });
        }
      }
  
      // ====== NET ZERO QUERY ======
      if (intent === 'net_zero_query') {
        // Provide a combined overview of carbon footprint, energy usage, and net zero progress.
        // We'll replace the entire message with a structured format if not already present.
  
        // If the assistant's response doesn't have it, let's build a fallback snippet:
        if (!htmlContent.includes('Net Zero Progress')) {
          const netZeroContainer = document.createElement('div');
          netZeroContainer.innerHTML = `
            <h3>Progress Toward Net Zero</h3>
            <div class="gc-data-section">
              <p><strong>Current Carbon Footprint:</strong> ${contextData.energyData.carbonFootprint}</p>
              <p><strong>Current Energy Usage:</strong> ${contextData.energyData.currentMonth.total}</p>
              <p><strong>Net Zero Progress:</strong> ${contextData.energyData.netZeroProgress}</p>
              <hr>
              <p><strong>Remaining to Reach Net Zero:</strong></p>
              <ul>
                <li>Carbon Footprint: ${contextData.energyData.carbonFootprint}</li>
                <li>Reduction Goal: 100%</li>
              </ul>
              <p><strong>Next Steps:</strong> Continued efforts in energy efficiency and sustainability practices to reach net zero emissions.</p>
            </div>
          `;
          // Overwrite the default HTML content in this fallback scenario
          htmlContent = netZeroContainer.outerHTML;
        }
      }
  
      // ====== CAMPAIGNS & OTHER INTENTS ======
      if (intent === 'active_campaigns' || intent === 'campaign_query') {
        const campaignsHtml = contextData.campaignInfo.currentCampaigns.map(campaign => `
          <div class="gc-campaign-card">
            <h4>${campaign.name}</h4>
            <p>${campaign.description}</p>
            <div class="gc-campaign-points">
              <i class='bx bx-star'></i>
              ${campaign.points} Points
            </div>
          </div>
        `).join('');
  
        if (intent === 'active_campaigns') {
          htmlContent = htmlContent.replace(
            /\[View All Campaigns\]\(campaign\.html\)/g,
            '<a href="campaign.html" class="gc-view-all-campaigns">View All Campaigns</a>'
          );
        }
        htmlContent += `
          <div class="gc-campaigns-container">
            ${campaignsHtml}
          </div>
        `;
      } else if (intent === 'campaign_ideas') {
        const campaigns = [];
        const lines = content.split('\n');
        let currentCampaign = null;
  
        lines.forEach(line => {
          if (line.startsWith('## ')) {
            if (currentCampaign) {
              campaigns.push(currentCampaign);
            }
            currentCampaign = { name: line.replace('## ', '').trim(), description: '', points: 0 };
          } else if (line.includes('**Points:**') && currentCampaign) {
            const pointsMatch = line.match(/\d+/);
            currentCampaign.points = pointsMatch ? parseInt(pointsMatch[0]) : 0;
          } else if (line && !line.startsWith('#') && currentCampaign) {
            currentCampaign.description += line.trim() + ' ';
          }
        });
        if (currentCampaign) {
          campaigns.push(currentCampaign);
        }
  
        const isOnCampaignPage = window.location.pathname.includes('campaign.html');
        htmlContent = `
          <h3>New Campaign Ideas</h3>
          <div class="gc-campaigns-container">
            ${campaigns.map(campaign => `
              <div class="gc-campaign-card">
                <h4>${campaign.name}</h4>
                <p>${campaign.description.trim()}</p>
                <div class="gc-campaign-points">
                  <i class='bx bx-star'></i>
                  ${campaign.points} Points
                </div>
              </div>
            `).join('')}
          </div>
          <div class="gc-campaign-actions">
            ${isOnCampaignPage ?
              `<button onclick="openCreateCampaignAndCloseChat()" class="gc-create-campaign-btn">
                Create New Campaign
              </button>` :
              '<a href="campaign.html" class="gc-view-all-campaigns">Go to Campaigns Page</a>'
            }
          </div>
          <p>Would you like to implement any of these campaigns?</p>
        `;
  
        if (isOnCampaignPage) {
          window.openCreateCampaignAndCloseChat = function() {
            chatContainer.classList.add('gc-hidden');
            openChatButton.classList.remove('gc-hidden');
  
            const event = new CustomEvent('openCreateCampaign');
            window.dispatchEvent(event);
  
            if (typeof window.openCreateCampaignPopup === 'function') {
              window.openCreateCampaignPopup();
            }
          };
        }
      }
  
      // ====== WELCOME INTENT ======
      if (intent === 'welcome') {
        htmlContent = `
          <div class="gc-welcome-message">
            ${htmlContent}
            <div class="gc-quick-actions">
              <button class="gc-quick-action-btn" data-question="Tell me about energy usage">
                Energy Usage
              </button>
              <button class="gc-quick-action-btn" data-question="What is our carbon footprint">
                Carbon Footprint
              </button>
              <button class="gc-quick-action-btn" data-question="What's our progress toward net zero?">
                Progress To Net Zero
              </button>
              <button class="gc-quick-action-btn" data-question="Show me active campaigns">
                Active Campaigns
              </button>
              <button class="gc-quick-action-btn" data-question="Show me the leaderboard">
                Leaderboard
              </button>
              <button class="gc-quick-action-btn" data-question="Tell me about reports">
                Reports
              </button>
              <button class="gc-quick-action-btn" data-question="Show me the events">
                Events
              </button>
              <button class="gc-quick-action-btn" data-question="Show me the FAQ">
                FAQ
              </button>
            </div>
          </div>
        `;
      }
  
      // ====== MENU INTENT ======
      if (intent === 'menu_query') {
        htmlContent = `
          <div class="gc-menu-container">
            ${htmlContent}
            <div class="gc-quick-actions">
              <button class="gc-quick-action-btn" data-question="Tell me about energy usage">
                Energy Usage
              </button>
              <button class="gc-quick-action-btn" data-question="What is our carbon footprint">
                Carbon Footprint
              </button>
              <button class="gc-quick-action-btn" data-question="What's our progress toward net zero?">
                Progress To Net Zero
              </button>
              <button class="gc-quick-action-btn" data-question="Show me active campaigns">
                Active Campaigns
              </button>
              <button class="gc-quick-action-btn" data-question="Show me the leaderboard">
                Leaderboard
              </button>
              <button class="gc-quick-action-btn" data-question="Tell me about reports">
                Reports
              </button>
              <button class="gc-quick-action-btn" data-question="Show me the events">
                Events
              </button>
              <button class="gc-quick-action-btn" data-question="Show me the FAQ">
                FAQ
              </button>
            </div>
          </div>
        `;
      }
  
      return htmlContent;
    }
  
    /**
     * Appends a message element to the chat UI.
     * @param {string} content 
     * @param {string} sender  'user' or 'bot'
     * @param {object|null} contextData 
     * @param {string|null} intent 
     */
    function appendMessage(content, sender, contextData = null, intent = null) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('gc-message', sender === 'user' ? 'gc-user-message' : 'gc-bot-message');
  
      if (sender === 'bot') {
        messageElement.innerHTML = formatBotMessage(content, contextData, intent);
  
        // Attach click handlers for interactive links and quick action buttons
        messageElement.querySelectorAll('.gc-interactive-link').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = link.getAttribute('href');
          });
        });
        messageElement.querySelectorAll('.gc-quick-action-btn').forEach(button => {
          button.addEventListener('click', () => {
            const question = button.getAttribute('data-question');
            if (question) {
              askQuestion(question);
            }
          });
        });
      } else {
        messageElement.textContent = content;
      }
  
      typingIndicator.parentNode.insertBefore(messageElement, typingIndicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  
    /**
     * Sends the user message to the backend and appends the bot reply.
     */
    async function sendMessage() {
      const message = userInput.value.trim();
      if (!message) return;
  
      userInput.value = '';
      appendMessage(message, 'user');
      setLoadingState(true);
  
      try {
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ message })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        setLoadingState(false);
  
        if (data.error) {
          throw new Error(data.error);
        }
  
        let formattedReply = data.reply;
        // Clean up any formatting artifacts
        formattedReply = formattedReply.replace(/```json\n|\n```/g, '');
        formattedReply = formattedReply.replace(/```javascript\n|\n```/g, '');
  
        appendMessage(formattedReply, 'bot', data.contextData, data.intent);
      } catch (error) {
        console.error('Error in sendMessage:', error);
        setLoadingState(false);
        appendMessage('Sorry, something went wrong. Please try again later.', 'bot');
      }
    }
  
    // Expose askQuestion so quick action buttons can call it
    function askQuestion(question) {
      userInput.value = question;
      sendMessage();
    }
    window.askQuestion = askQuestion;
  
    /**
     * Displays the welcome message when the chat is opened.
     */
    async function showWelcomeMessage() {
      const welcomeMessage = `**Welcome to GreenCampus Assistant!**
  I'm here to help you with environmental and energy data analysis.
  
  **Feel free to ask me questions like:**
  "What is our current energy usage?"
  "How can we reduce our carbon footprint?"
  "What campaigns are running currently?"
  "What's our progress toward net zero?"
  
  **How can I assist you today?**`;
  
      appendMessage(welcomeMessage, 'bot', null, 'welcome');
    }
  
    // --- Event Listeners ---
    openChatButton.addEventListener('click', () => {
      chatContainer.classList.remove('gc-hidden');
      openChatButton.classList.add('gc-hidden');
      if (chatMessages.children.length === 1) {
        showWelcomeMessage();
      }
    });
  
    closeChatButton.addEventListener('click', () => {
      chatContainer.classList.add('gc-hidden');
      openChatButton.classList.remove('gc-hidden');
    });
  
    sendButton.addEventListener('click', () => {
      if (!userInput.disabled) {
        sendMessage();
      }
    });
  
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !userInput.disabled) {
        sendMessage();
      }
    });
  
    // Initialize chat
    setLoadingState(false);
  }
  
  if (document.readyState === 'complete') {
    initializeChatbot();
  } else {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
  }
  