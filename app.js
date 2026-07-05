// Indian Salary & Tax Predictor Calculations (FY 2026-27 / AY 2027-28)

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputCtc = document.getElementById('input-ctc');
    const sliderCtc = document.getElementById('slider-ctc');
    const selectPf = document.getElementById('select-pf');
    const selectRegime = document.getElementById('select-regime');
    const inputBasicPct = document.getElementById('input-basic-pct');
    const inputDeductionsOld = document.getElementById('input-deductions-old');
    const checkGratuity = document.getElementById('check-gratuity');
    
    const ctcValText = document.getElementById('ctc-val-text');
    const monthlyInhandValue = document.getElementById('monthly-inhand-value');
    const recommendedRegimeBadge = document.getElementById('recommended-regime-badge');
    const inhandPctDisplay = document.getElementById('inhand-pct-display');
    const inhandProgressRing = document.getElementById('inhand-progress-ring');
    
    // Breakdown display elements
    const breakdownCtc = document.getElementById('breakdown-ctc');
    const breakdownEpf = document.getElementById('breakdown-epf');
    const breakdownGratuity = document.getElementById('breakdown-gratuity');
    const breakdownPt = document.getElementById('breakdown-pt');
    const breakdownPf = document.getElementById('breakdown-pf');
    const breakdownTax = document.getElementById('breakdown-tax');
    const breakdownInhand = document.getElementById('breakdown-inhand');
    
    // Comparison display elements
    const comparisonTaxNew = document.getElementById('comparison-tax-new');
    const comparisonInhandNew = document.getElementById('comparison-inhand-new');
    const comparisonTaxOld = document.getElementById('comparison-tax-old');
    const comparisonInhandOld = document.getElementById('comparison-inhand-old');
    const badgeBestNew = document.getElementById('badge-best-new');
    const badgeBestOld = document.getElementById('badge-best-old');
    const regimeComparisonAdvice = document.getElementById('regime-comparison-advice');
    
    // UI controls
    const btnShowMonthly = document.getElementById('btn-show-monthly');
    const btnShowAnnually = document.getElementById('btn-show-annually');
    const advSettingsTrigger = document.getElementById('adv-settings-trigger');
    const advSettingsContent = document.getElementById('adv-settings-content');
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    const themeIcon = document.getElementById('theme-icon');
    const presets = document.querySelectorAll('.btn-preset');
    
    // App State Variables
    let displayMode = 'monthly'; // 'monthly' or 'annually'
    let myChart = null;
    
    // Calculation state for Chatbot references
    let currentCalcState = {
        ctc: 0,
        basicSalary: 0,
        annualEmployerPf: 0,
        annualEmployeePf: 0,
        annualGratuity: 0,
        annualPT: 0,
        newTax: 0,
        oldTax: 0,
        newInHand: 0,
        oldInHand: 0,
        recommendedRegime: 'New Regime'
    };

    // Advanced settings toggle
    advSettingsTrigger.addEventListener('click', () => {
        const item = advSettingsTrigger.parentElement;
        item.classList.toggle('active');
    });

    // Theme Toggle
    btnToggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeIcon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
        lucide.createIcons();
        updateChartTheme();
    });

    // Handle Monthly vs Annually Toggle
    btnShowMonthly.addEventListener('click', () => {
        displayMode = 'monthly';
        btnShowMonthly.classList.add('active');
        btnShowAnnually.classList.remove('active');
        calculateAndDisplay();
    });

    btnShowAnnually.addEventListener('click', () => {
        displayMode = 'annually';
        btnShowAnnually.classList.add('active');
        btnShowMonthly.classList.remove('active');
        calculateAndDisplay();
    });

    // Link Inputs (Slider vs Number Input)
    inputCtc.addEventListener('input', (e) => {
        let val = parseInt(e.target.value) || 0;
        if (val > 100000000) val = 100000000;
        sliderCtc.value = val;
        calculateAndDisplay();
    });

    sliderCtc.addEventListener('input', (e) => {
        inputCtc.value = e.target.value;
        calculateAndDisplay();
    });

    // Preset buttons
    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');
            inputCtc.value = val;
            sliderCtc.value = val;
            calculateAndDisplay();
        });
    });

    // Standard event handlers for input changes
    [selectPf, selectRegime, inputBasicPct, inputDeductionsOld, checkGratuity].forEach(element => {
        element.addEventListener('change', calculateAndDisplay);
        element.addEventListener('input', calculateAndDisplay);
    });

    // Format currency to Indian Style (Lakhs / Crores)
    function formatINR(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Tax Engine: Slabs for New Tax Regime (FY 2026-27)
    function calculateNewRegimeTax(taxableIncome) {
        if (taxableIncome <= 0) return 0;
        
        let tax = 0;
        
        // Slabs
        // Up to 4L: 0%
        // 4L - 8L: 5%
        // 8L - 12L: 10%
        // 12L - 16L: 15%
        // 16L - 24L: 20%
        // Above 24L: 30%
        
        if (taxableIncome <= 400000) {
            tax = 0;
        } else if (taxableIncome <= 800000) {
            tax = (taxableIncome - 400000) * 0.05;
        } else if (taxableIncome <= 1200000) {
            tax = (400000 * 0.05) + (taxableIncome - 800000) * 0.10;
        } else if (taxableIncome <= 1600000) {
            tax = (400000 * 0.05) + (400000 * 0.10) + (taxableIncome - 1200000) * 0.15;
        } else if (taxableIncome <= 2400000) {
            tax = (400000 * 0.05) + (400000 * 0.10) + (400000 * 0.15) + (taxableIncome - 1600000) * 0.20;
        } else {
            tax = (400000 * 0.05) + (400000 * 0.10) + (400000 * 0.15) + (800000 * 0.20) + (taxableIncome - 2400000) * 0.30;
        }
        
        // Rebate under Section 87A: Income up to 12 Lakhs (post deductions) has tax rebate
        if (taxableIncome <= 1200000) {
            tax = 0;
        }
        
        // Health & Education Cess: 4% of Income Tax
        if (tax > 0) {
            tax += tax * 0.04;
        }
        
        return tax;
    }

    // Tax Engine: Slabs for Old Tax Regime
    function calculateOldRegimeTax(taxableIncome) {
        if (taxableIncome <= 0) return 0;
        
        let tax = 0;
        
        // Slabs
        // Up to 2.5L: Nil
        // 2.5L - 5L: 5%
        // 5L - 10L: 20%
        // Above 10L: 30%
        
        if (taxableIncome <= 250000) {
            tax = 0;
        } else if (taxableIncome <= 500000) {
            tax = (taxableIncome - 250000) * 0.05;
        } else if (taxableIncome <= 1000000) {
            tax = (250000 * 0.05) + (taxableIncome - 500000) * 0.20;
        } else {
            tax = (250000 * 0.05) + (500000 * 0.20) + (taxableIncome - 1000000) * 0.30;
        }
        
        // Rebate under Section 87A: Income up to 5 Lakhs (post deductions) has rebate up to ₹12,500
        if (taxableIncome <= 500000) {
            tax = 0;
        }
        
        // Health & Education Cess: 4%
        if (tax > 0) {
            tax += tax * 0.04;
        }
        
        return tax;
    }

    // Core Calculation Logic
    function calculateAndDisplay() {
        const ctc = parseFloat(inputCtc.value) || 0;
        ctcValText.innerText = ctc.toLocaleString('en-IN');
        
        const basicPct = (parseFloat(inputBasicPct.value) || 50) / 100;
        const basicSalary = ctc * basicPct;
        
        // 1. Gratuity deduction (Standard: 4.81% of Basic Salary)
        const hasGratuity = checkGratuity.checked;
        const annualGratuity = hasGratuity ? (basicSalary * 0.0481) : 0;
        
        // 2. PF Calculation
        const pfMode = selectPf.value;
        let annualEmployerPf = 0;
        let annualEmployeePf = 0;
        
        if (pfMode === '12basic') {
            annualEmployerPf = basicSalary * 0.12;
            annualEmployeePf = basicSalary * 0.12;
        } else if (pfMode === 'capped') {
            // Capped at 1,800/month (i.e. 21,600/year)
            annualEmployerPf = Math.min(21600, basicSalary * 0.12);
            annualEmployeePf = Math.min(21600, basicSalary * 0.12);
        }
        
        // 3. Professional Tax (PT) (Usually ₹2,500 per year)
        const annualPT = ctc > 150000 ? 2500 : 0;
        
        // Gross taxable income definitions
        // Employer PF & Gratuity are part of CTC but subtracted to get Gross Salary
        const annualGrossSalary = ctc - annualEmployerPf - annualGratuity;
        
        // Old regime calculations
        const oldDeductions = (parseFloat(inputDeductionsOld.value) || 0) + 50000; // Deductions + 50k Standard deduction
        // For old regime, employee PF is also tax deductible under 80C (if they didn't already exhaust 1.5L)
        // But we assume the custom field is the overall total.
        const oldTaxableIncome = Math.max(0, annualGrossSalary - oldDeductions);
        const oldTax = calculateOldRegimeTax(oldTaxableIncome);
        const oldInHand = annualGrossSalary - annualEmployeePf - annualPT - oldTax;
        
        // New regime calculations
        const newDeductions = 75000; // Standard deduction
        const newTaxableIncome = Math.max(0, annualGrossSalary - newDeductions);
        const newTax = calculateNewRegimeTax(newTaxableIncome);
        const newInHand = annualGrossSalary - annualEmployeePf - annualPT - newTax;
        
        // Determine recommended regime
        const selectedMode = selectRegime.value;
        let recommendedRegime = 'New Regime';
        let finalTax = newTax;
        let finalInHand = newInHand;
        
        if (selectedMode === 'compare') {
            if (newInHand >= oldInHand) {
                recommendedRegime = 'New Regime';
                finalTax = newTax;
                finalInHand = newInHand;
            } else {
                recommendedRegime = 'Old Regime';
                finalTax = oldTax;
                finalInHand = oldInHand;
            }
        } else if (selectedMode === 'new') {
            recommendedRegime = 'New Regime';
            finalTax = newTax;
            finalInHand = newInHand;
        } else if (selectedMode === 'old') {
            recommendedRegime = 'Old Regime';
            finalTax = oldTax;
            finalInHand = oldInHand;
        }
        
        // Save current calculation state for query assistant
        currentCalcState = {
            ctc,
            basicSalary,
            annualEmployerPf,
            annualEmployeePf,
            annualGratuity,
            annualPT,
            newTax,
            oldTax,
            newInHand,
            oldInHand,
            recommendedRegime
        };
        
        // Apply Display Mode Multipliers
        const mult = displayMode === 'monthly' ? (1/12) : 1;
        
        // Update main KPI
        monthlyInhandValue.innerText = formatINR(finalInHand / 12);
        recommendedRegimeBadge.innerText = recommendedRegime;
        recommendedRegimeBadge.className = `regime-badge ${recommendedRegime === 'New Regime' ? 'text-success' : 'text-success'}`;
        
        // Circular Progress Ring Update
        const pctInHand = Math.round((finalInHand / ctc) * 100) || 0;
        inhandPctDisplay.innerText = pctInHand;
        
        // SVG DashOffset adjustment (radius 42, circumference 263.89)
        const radius = 42;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (pctInHand / 100) * circumference;
        inhandProgressRing.style.strokeDashoffset = offset;
        
        // Update Table Values
        breakdownCtc.innerText = formatINR(ctc * mult);
        breakdownEpf.innerText = `- ` + formatINR(annualEmployerPf * mult);
        breakdownGratuity.innerText = `- ` + formatINR(annualGratuity * mult);
        breakdownPt.innerText = `- ` + formatINR(annualPT * mult);
        breakdownPf.innerText = `- ` + formatINR(annualEmployeePf * mult);
        breakdownTax.innerText = `- ` + formatINR(finalTax * mult);
        breakdownInhand.innerText = formatINR(finalInHand * mult);
        
        // Update Comparison Widget
        comparisonTaxNew.innerText = formatINR(newTax);
        comparisonInhandNew.innerText = formatINR(newInHand / 12) + '/mo';
        comparisonTaxOld.innerText = formatINR(oldTax);
        comparisonInhandOld.innerText = formatINR(oldInHand / 12) + '/mo';
        
        if (newInHand >= oldInHand) {
            badgeBestNew.style.display = 'inline-block';
            badgeBestOld.style.display = 'none';
            const diff = newInHand - oldInHand;
            regimeComparisonAdvice.innerText = diff > 0 
                ? `Saving ${formatINR(diff)} annually by choosing the New Tax Regime.` 
                : `Both regimes offer identical take-home pay.`;
        } else {
            badgeBestNew.style.display = 'none';
            badgeBestOld.style.display = 'inline-block';
            const diff = oldInHand - newInHand;
            regimeComparisonAdvice.innerText = `Saving ${formatINR(diff)} annually by choosing the Old Tax Regime.`;
        }
        
        // Render Chart
        renderChart(finalInHand, finalTax, annualEmployeePf + annualEmployerPf, annualGratuity, annualPT);
    }

    // Chart.js initialization and updates
    function renderChart(inhand, tax, pf, gratuity, pt) {
        const isLight = document.body.classList.contains('light-theme');
        const gridColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
        const labelColor = isLight ? '#333' : '#eee';
        
        const dataVals = [inhand, tax, pf, gratuity, pt];
        const labels = ['In-Hand Salary', 'Income Tax (TDS)', 'Provident Fund (PF)', 'Gratuity Deduction', 'Professional Tax'];
        
        // Filter out zero values to clean up the legend and pie segments
        const activeIndexes = dataVals.map((val, idx) => val > 0 ? idx : -1).filter(idx => idx !== -1);
        const filteredData = activeIndexes.map(idx => dataVals[idx]);
        const filteredLabels = activeIndexes.map(idx => labels[idx]);
        
        // Colors palette matching UI CSS
        const baseColors = [
            '#3b82f6', // primary blue
            '#ef4444', // danger red
            '#a855f7', // violet
            '#f59e0b', // amber yellow
            '#6b7280'  // grey
        ];
        const filteredColors = activeIndexes.map(idx => baseColors[idx]);

        if (myChart) {
            myChart.data.labels = filteredLabels;
            myChart.data.datasets[0].data = filteredData;
            myChart.data.datasets[0].backgroundColor = filteredColors;
            myChart.options.plugins.legend.labels.color = labelColor;
            myChart.update();
        } else {
            const ctx = document.getElementById('ctc-pie-chart').getContext('2d');
            myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: filteredLabels,
                    datasets: [{
                        data: filteredData,
                        backgroundColor: filteredColors,
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            display: false // We use detailed table breakdown to avoid screen clutter
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += formatINR(context.raw);
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    function updateChartTheme() {
        if (myChart) {
            const isLight = document.body.classList.contains('light-theme');
            const labelColor = isLight ? '#333' : '#eee';
            myChart.options.plugins.legend.labels.color = labelColor;
            myChart.update();
        }
    }

    // Perform initial calculations
    calculateAndDisplay();

    // Instant Assistant Chatbot Logic
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const btnChatSend = document.getElementById('btn-chat-send');
    const chatChips = document.getElementById('chat-chips');
    const btnToggleAiSettings = document.getElementById('btn-toggle-ai-settings');
    const aiSettingsDrawer = document.getElementById('ai-settings-drawer');
    const inputGeminiKey = document.getElementById('input-gemini-key');
    const btnSaveKey = document.getElementById('btn-save-key');
    const aiStatusBadge = document.getElementById('ai-status-badge');

    // Load key from local storage on init
    let geminiApiKey = localStorage.getItem('gemini_api_key') || '';
    if (geminiApiKey) {
        inputGeminiKey.value = geminiApiKey;
        aiStatusBadge.innerText = 'AI Active';
        aiStatusBadge.style.background = 'var(--primary-glow)';
        aiStatusBadge.style.color = 'var(--primary)';
    }

    // Toggle settings drawer
    btnToggleAiSettings.addEventListener('click', () => {
        const isHidden = aiSettingsDrawer.style.display === 'none';
        aiSettingsDrawer.style.display = isHidden ? 'flex' : 'none';
    });

    // Save key handler
    btnSaveKey.addEventListener('click', () => {
        geminiApiKey = inputGeminiKey.value.trim();
        if (geminiApiKey) {
            localStorage.setItem('gemini_api_key', geminiApiKey);
            aiStatusBadge.innerText = 'AI Active';
            aiStatusBadge.style.background = 'var(--primary-glow)';
            aiStatusBadge.style.color = 'var(--primary)';
            appendMessage('Gemini AI Key saved! I can now answer all custom questions.', 'system');
        } else {
            localStorage.removeItem('gemini_api_key');
            aiStatusBadge.innerText = 'Standard';
            aiStatusBadge.style.background = 'var(--success-bg)';
            aiStatusBadge.style.color = 'var(--success)';
            appendMessage('Gemini AI Key removed. Reverting to standard FAQ answers.', 'system');
        }
        aiSettingsDrawer.style.display = 'none';
    });

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function processQuery(query) {
        appendMessage(query, 'user');

        // Clean up the key string
        geminiApiKey = (geminiApiKey || '').trim();
        if (geminiApiKey === 'undefined' || geminiApiKey === 'null') {
            geminiApiKey = '';
        }

        if (geminiApiKey) {
            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-msg system typing';
            typingDiv.innerHTML = '<p>Thinking...</p>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            askGeminiAI(query, typingDiv);
        } else {
            // Local rule fallback
            setTimeout(() => {
                const reply = generateAnswer(query);
                appendMessage(reply, 'system');
            }, 200);
        }
    }

    async function askGeminiAI(query, typingDiv) {
        const state = currentCalcState;
        const systemPrompt = `You are a helpful, professional, and friendly Indian Tax & Salary Advisor chatbot embedded directly inside a CTC Calculator.
The user is calculating their salary breakdown. Here is the current financial state of the calculator:
- Annual Cost to Company (CTC): ₹${state.ctc.toLocaleString('en-IN')}
- Basic Salary: ₹${state.basicSalary.toLocaleString('en-IN')}
- Employer Provident Fund (EPF) portion: ₹${state.annualEmployerPf.toLocaleString('en-IN')}/year
- Employee Provident Fund (PF) deduction: ₹${state.annualEmployeePf.toLocaleString('en-IN')}/year
- Gratuity allocation: ₹${state.annualGratuity.toLocaleString('en-IN')}/year
- Professional Tax (PT): ₹${state.annualPT.toLocaleString('en-IN')}/year
- Estimated Tax under New Regime: ₹${state.newTax.toLocaleString('en-IN')}/year
- Estimated Tax under Old Regime: ₹${state.oldTax.toLocaleString('en-IN')}/year
- Annual In-hand under New Regime: ₹${state.newInHand.toLocaleString('en-IN')}/year
- Annual In-hand under Old Regime: ₹${state.oldInHand.toLocaleString('en-IN')}/year
- Recommended Tax Regime choice: ${state.recommendedRegime}

Provide a direct, concise, and accurate answer to the user's question. Reference their current numbers where appropriate to give them customized details. Use clean HTML tags for formatting if needed (e.g. <strong>, <br>, <ul>, <li>). Do not output markdown code blocks like \`\`\`html. Don't mention system details. Make sure your advice follows the latest Indian Income Tax rules (FY 2026-27).`;

        try {
            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt + `\n\nUser Question: ${query}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            typingDiv.remove();

            if (!response.ok) {
                const errMsg = data.error ? data.error.message : 'HTTP Error ' + response.status;
                throw new Error(errMsg);
            }

            if (data.candidates && data.candidates[0].content.parts[0].text) {
                let text = data.candidates[0].content.parts[0].text;
                // Simple markdown-to-html line conversion for lists/bold
                text = text.replace(/\*\*(.*?)\*\"/g, '<strong>$1</strong>');
                text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
                text = text.replace(/\n/g, '<br>');
                appendMessage(text, 'system');
            } else {
                throw new Error('Invalid response structure from Gemini API');
            }
        } catch (err) {
            console.error('Gemini API Error:', err);
            typingDiv.remove();
            appendMessage(`Could not connect to Gemini AI (${err.message}). Reverting to backup standard reply:<br><br>` + generateAnswer(query), 'system');
        }
    }

    function generateAnswer(query) {
        const q = query.toLowerCase();
        const state = currentCalcState;
        
        if (q.includes('why') && q.includes('tax') && q.includes('zero')) {
            const activeTax = state.recommendedRegime === 'New Regime' ? state.newTax : state.oldTax;
            if (activeTax === 0) {
                if (state.recommendedRegime === 'New Regime') {
                    const gross = state.ctc - state.annualEmployerPf - state.annualGratuity;
                    return `Your tax is <strong>zero</strong> because your Gross Salary (after subtracting PF and Gratuity) is <strong>${formatINR(gross)}</strong>. Under the New Tax Regime, any taxable income up to <strong>₹12,00,000</strong> (after a standard deduction of ₹75,000) qualifies for a full tax rebate under Section 87A.`;
                } else {
                    return `Your tax is <strong>zero</strong> because your taxable income after exemptions (80C, HRA, etc.) falls under <strong>₹5,00,000</strong>, qualifying for a full rebate under Section 87A of the Old Regime.`;
                }
            } else {
                return `Your current estimated tax is <strong>${formatINR(activeTax)}/year</strong>. This is because your taxable income exceeds the rebate limits (₹12 Lakhs for New Regime, or ₹5 Lakhs for Old Regime). You can try reducing your taxable income by switching regimes or adjusting advanced parameters.`;
            }
        }
        
        if (q.includes('gratuity')) {
            return `Gratuity is a statutory payout given to employees when they complete 5+ continuous years of service. It is calculated as <strong>4.81% of your Basic Salary</strong> (which is ₹${(state.basicSalary).toLocaleString('en-IN')}/year based on your current settings). Currently, your annual Gratuity deduction is <strong>${formatINR(state.annualGratuity)}</strong> (${formatINR(state.annualGratuity/12)}/month).`;
        }
        
        if (q.includes('pf') || q.includes('provident')) {
            const pfType = selectPf.value === '12basic' ? '12% of Basic Salary' : selectPf.value === 'capped' ? 'capped at ₹1,800/month' : 'disabled';
            return `Provident Fund (PF) is calculated based on your Basic Salary. Under your current settings (${pfType}):<br>
            • Employer PF contribution is <strong>${formatINR(state.annualEmployerPf)}/year</strong> (${formatINR(state.annualEmployerPf/12)}/month).<br>
            • Employee PF deduction is <strong>${formatINR(state.annualEmployeePf)}/year</strong> (${formatINR(state.annualEmployeePf/12)}/month).<br>
            Both components are deducted from your overall CTC.`;
        }
        
        if (q.includes('old vs new') || q.includes('regime') || q.includes('comparison') || q.includes('compare') || q.includes('difference')) {
            const saving = Math.abs(state.newInHand - state.oldInHand);
            const betterRegime = state.newInHand >= state.oldInHand ? 'New Regime' : 'Old Regime';
            const oldDedVal = parseFloat(inputDeductionsOld.value) || 0;
            return `<strong>Tax Regime Comparison for your CTC (${formatINR(state.ctc)}):</strong><br>
            • New Regime Tax: <strong>${formatINR(state.newTax)}</strong> (Standard Deduction: ₹75,000)<br>
            • Old Regime Tax: <strong>${formatINR(state.oldTax)}</strong> (Deductions: ${formatINR(oldDedVal)} + ₹50,000 Standard Deduction)<br>
            <br>
            The <strong>${betterRegime}</strong> gives you an extra <strong>${formatINR(saving/12)}/month</strong> in-hand. We recommend using the ${betterRegime}.`;
        }

        if (q.includes('standard deduction')) {
            return `The standard deduction is a flat amount subtracted from your salary before tax computation:<br>
            • <strong>New Regime</strong>: ₹75,000 standard deduction (recently raised).<br>
            • <strong>Old Regime</strong>: ₹50,000 standard deduction.<br>
            This deduction is applied automatically in our calculations.`;
        }

        if (q.includes('in-hand') || q.includes('take-home') || q.includes('cash')) {
            const inhandMonthly = state.newInHand >= state.oldInHand ? state.newInHand / 12 : state.oldInHand / 12;
            const activeTax = state.newInHand >= state.oldInHand ? state.newTax : state.oldTax;
            const pct = Math.round((inhandMonthly * 12 / state.ctc) * 100);
            return `Based on your recommended regime, your monthly cash-in-hand is <strong>${formatINR(inhandMonthly)}</strong>. This means you take home roughly <strong>${pct}%</strong> of your CTC as monthly cash. The remaining goes to Tax (${formatINR(activeTax/12)}/mo) and PF/Gratuity/PT retirement savings.`;
        }

        return `Based on your current CTC of <strong>${formatINR(state.ctc)}</strong>:<br>
        • Net Monthly In-hand: <strong>${formatINR((state.newInHand >= state.oldInHand ? state.newInHand : state.oldInHand)/12)}</strong><br>
        • Active Tax Regime: <strong>${state.recommendedRegime}</strong><br>
        • Annual TDS (Income Tax): <strong>${formatINR(state.recommendedRegime === 'New Regime' ? state.newTax : state.oldTax)}</strong><br>
        <br>
        Try asking: <em>'Why is my tax zero?'</em>, <em>'How is PF calculated?'</em>, or <em>'Compare Old vs New'</em> for detailed explanations.`;
    }

    // Input event handlers
    btnChatSend.addEventListener('click', () => {
        const txt = chatInput.value.trim();
        if (txt) {
            processQuery(txt);
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const txt = chatInput.value.trim();
            if (txt) {
                processQuery(txt);
                chatInput.value = '';
            }
        }
    });

    chatChips.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip-btn');
        if (btn) {
            const query = btn.getAttribute('data-query');
            processQuery(query);
        }
    });
});
