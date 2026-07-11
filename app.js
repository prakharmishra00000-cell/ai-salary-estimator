// Indian Salary & Tax Predictor Calculations (FY 2026-27 / AY 2027-28)

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputCtc = document.getElementById('input-ctc');
    const sliderCtc = document.getElementById('slider-ctc');
    const selectPf = document.getElementById('select-pf');
    const selectRegime = document.getElementById('select-regime');
    const inputBasicPct = document.getElementById('input-basic-pct');
    const selectState = document.getElementById('select-state');
    const inputRent = document.getElementById('input-rent');
    const selectCityType = document.getElementById('select-city-type');
    const inputDed80c = document.getElementById('input-ded-80c');
    const inputDed80d = document.getElementById('input-ded-80d');
    const inputDedNps = document.getElementById('input-ded-nps');
    const inputDed24b = document.getElementById('input-ded-24b');
    
    // New parameters
    const inputCorpNps = document.getElementById('input-corp-nps');
    const inputAllowSodexo = document.getElementById('input-allow-sodexo');
    const inputAllowLta = document.getElementById('input-allow-lta');
    const inputAllowInternet = document.getElementById('input-allow-internet');
    const inputAllowFuel = document.getElementById('input-allow-fuel');
    const btnSaveScenario = document.getElementById('btn-save-scenario');
    const compareScenariosGrid = document.getElementById('compare-scenarios-grid');
    
    // Ultimate tier parameters
    const inputHraPct = document.getElementById('input-hra-pct');
    const inputVpfPct = document.getElementById('input-vpf-pct');
    const selectCarEngine = document.getElementById('select-car-engine');
    const checkDriver = document.getElementById('check-driver');
    const inputHouseRent = document.getElementById('input-house-rent');
    const inputHouseTaxes = document.getElementById('input-house-taxes');
    const optTipsContainer = document.getElementById('opt-tips-container');

    const btnExportPdf = document.getElementById('btn-export-pdf');
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
    [
        selectPf, selectRegime, inputBasicPct, selectState, inputRent, selectCityType, 
        inputDed80c, inputDed80d, inputDedNps, inputDed24b, checkGratuity,
        inputCorpNps, inputAllowSodexo, inputAllowLta, inputAllowInternet, inputAllowFuel,
        inputHraPct, inputVpfPct, selectCarEngine, checkDriver, inputHouseRent, inputHouseTaxes
    ].forEach(element => {
        if (element) {
            element.addEventListener('change', calculateAndDisplay);
            element.addEventListener('input', calculateAndDisplay);
        }
    });

    // Print PDF Export Handler
    if (btnExportPdf) {
        btnExportPdf.addEventListener('click', () => {
            window.print();
        });
    }

    // Format currency to Indian Style (Lakhs / Crores)
    function formatINR(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Tax Engine: Base calculations without Surcharge
    function calculateNewRegimeTaxWithoutSurcharge(taxableIncome) {
        if (taxableIncome <= 0) return 0;
        let tax = 0;
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
        if (taxableIncome <= 1200000) tax = 0;
        return tax;
    }

    function calculateOldRegimeTaxWithoutSurcharge(taxableIncome) {
        if (taxableIncome <= 0) return 0;
        let tax = 0;
        if (taxableIncome <= 250000) {
            tax = 0;
        } else if (taxableIncome <= 500000) {
            tax = (taxableIncome - 250000) * 0.05;
        } else if (taxableIncome <= 1000000) {
            tax = (250000 * 0.05) + (taxableIncome - 500000) * 0.20;
        } else {
            tax = (250000 * 0.05) + (500000 * 0.20) + (taxableIncome - 1000000) * 0.30;
        }
        if (taxableIncome <= 500000) tax = 0;
        return tax;
    }

    // Surcharge and Marginal Relief calculations
    function calculateSurchargeAndRelief(taxableIncome, baseTax, regime) {
        if (baseTax <= 0) return 0;
        
        let surchargeRate = 0;
        let threshold = 0;
        
        if (regime === 'new') {
            if (taxableIncome > 20000000) {
                surchargeRate = 0.25; // Capped at 25% under New Regime
                threshold = 20000000;
            } else if (taxableIncome > 10000000) {
                surchargeRate = 0.15;
                threshold = 10000000;
            } else if (taxableIncome > 5000000) {
                surchargeRate = 0.10;
                threshold = 5000000;
            }
        } else { // old
            if (taxableIncome > 50000000) {
                surchargeRate = 0.37;
                threshold = 50000000;
            } else if (taxableIncome > 20000000) {
                surchargeRate = 0.25;
                threshold = 20000000;
            } else if (taxableIncome > 10000000) {
                surchargeRate = 0.15;
                threshold = 10000000;
            } else if (taxableIncome > 5000000) {
                surchargeRate = 0.10;
                threshold = 5000000;
            }
        }
        
        if (surchargeRate === 0) return 0;
        
        const rawSurcharge = baseTax * surchargeRate;
        const totalTaxWithSurcharge = baseTax + rawSurcharge;
        
        // Marginal Relief base tax at threshold limit
        let baseTaxAtThreshold = 0;
        if (regime === 'new') {
            baseTaxAtThreshold = calculateNewRegimeTaxWithoutSurcharge(threshold);
        } else {
            baseTaxAtThreshold = calculateOldRegimeTaxWithoutSurcharge(threshold);
        }
        
        let surchargeRateAtThreshold = 0;
        if (threshold === 20000000) surchargeRateAtThreshold = 0.15;
        else if (threshold === 10000000) surchargeRateAtThreshold = 0.10;
        
        const surchargeAtThreshold = baseTaxAtThreshold * surchargeRateAtThreshold;
        const totalTaxAtThreshold = baseTaxAtThreshold + surchargeAtThreshold;
        
        const excessIncome = taxableIncome - threshold;
        const maxAllowedTax = totalTaxAtThreshold + excessIncome;
        
        if (totalTaxWithSurcharge > maxAllowedTax) {
            return Math.max(0, maxAllowedTax - baseTax);
        }
        
        return rawSurcharge;
    }

    // Tax Engine: Slabs for New Tax Regime (FY 2026-27)
    function calculateNewRegimeTax(taxableIncome) {
        if (taxableIncome <= 0) return 0;
        const baseTax = calculateNewRegimeTaxWithoutSurcharge(taxableIncome);
        const surcharge = calculateSurchargeAndRelief(taxableIncome, baseTax, 'new');
        let totalTax = baseTax + surcharge;
        if (totalTax > 0) {
            totalTax += totalTax * 0.04; // Cess
        }
        return totalTax;
    }

    // Tax Engine: Slabs for Old Tax Regime
    function calculateOldRegimeTax(taxableIncome) {
        if (taxableIncome <= 0) return 0;
        const baseTax = calculateOldRegimeTaxWithoutSurcharge(taxableIncome);
        const surcharge = calculateSurchargeAndRelief(taxableIncome, baseTax, 'old');
        let totalTax = baseTax + surcharge;
        if (totalTax > 0) {
            totalTax += totalTax * 0.04; // Cess
        }
        return totalTax;
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
        
        // Gross taxable income definitions
        // Employer PF & Gratuity are part of CTC but subtracted to get Gross Salary
        const annualGrossSalary = Math.max(0, ctc - annualEmployerPf - annualGratuity);

        // 3. State-wise Professional Tax (PT)
        const stateCode = selectState.value;
        const monthlyGrossLimit = annualGrossSalary / 12;
        let annualPT = 0;
        
        if (stateCode === 'kar') {
            annualPT = (monthlyGrossLimit > 25000) ? 2400 : 0;
        } else if (stateCode === 'mah') {
            if (monthlyGrossLimit > 10000) {
                annualPT = 2500;
            } else if (monthlyGrossLimit > 7500) {
                annualPT = 175 * 12;
            } else {
                annualPT = 0;
            }
        } else if (stateCode === 'tam') {
            const halfYearlyGross = monthlyGrossLimit * 6;
            let halfYearlyPT = 0;
            if (halfYearlyGross <= 21000) halfYearlyPT = 0;
            else if (halfYearlyGross <= 30000) halfYearlyPT = 135;
            else if (halfYearlyGross <= 45000) halfYearlyPT = 315;
            else if (halfYearlyGross <= 60000) halfYearlyPT = 690;
            else if (halfYearlyGross <= 75000) halfYearlyPT = 1025;
            else halfYearlyPT = 1250;
            annualPT = halfYearlyPT * 2;
        } else if (stateCode === 'tel') {
            if (monthlyGrossLimit > 20000) annualPT = 2400;
            else if (monthlyGrossLimit > 15000) annualPT = 1800;
            else annualPT = 0;
        } else if (stateCode === 'wbe') {
            if (monthlyGrossLimit > 40000) annualPT = 2400;
            else if (monthlyGrossLimit > 25000) annualPT = 1800;
            else if (monthlyGrossLimit > 15000) annualPT = 1560;
            else if (monthlyGrossLimit > 10000) annualPT = 1320;
            else annualPT = 0;
        } else if (stateCode === 'guj') {
            annualPT = (monthlyGrossLimit > 12000) ? 2400 : 0;
        } else {
            annualPT = (annualGrossSalary > 150000) ? 2500 : 0;
        }
        
        // Voluntary PF (VPF)
        const vpfPct = (parseFloat(inputVpfPct.value) || 0) / 100;
        const annualVPF = basicSalary * vpfPct;

        // HRA Exemption calculations based on custom HRA component
        const monthlyRent = parseFloat(inputRent.value) || 0;
        const annualRent = monthlyRent * 12;
        const cityType = selectCityType.value;
        const hraPct = (parseFloat(inputHraPct.value) || 40) / 100;
        const hraComponent = basicSalary * hraPct;
        
        let annualHraExemption = 0;
        if (annualRent > 0) {
            const rentMinusTenBasic = Math.max(0, annualRent - (basicSalary * 0.1));
            annualHraExemption = Math.min(hraComponent, rentMinusTenBasic, basicSalary * (cityType === 'metro' ? 0.5 : 0.4));
        }

        // Corporate NPS (80CCD(2)) - exempt under both regimes up to 10% of basic
        const corpNpsPct = (parseFloat(inputCorpNps.value) || 0) / 100;
        const annualCorpNpsDeduction = basicSalary * corpNpsPct;
        
        // Tax-free allowances (exempt under Old regime only)
        const sodexo = parseFloat(inputAllowSodexo.value) || 0;
        const lta = parseFloat(inputAllowLta.value) || 0;
        const internet = parseFloat(inputAllowInternet.value) || 0;
        const fuel = parseFloat(inputAllowFuel.value) || 0;
        const totalTaxFreePerks = sodexo + lta + internet + fuel;

        // Car Perquisites Section 17(2) - applicable to both regimes
        const carEngine = selectCarEngine.value;
        const hasDriver = checkDriver.checked;
        let annualCarPerq = 0;
        if (carEngine === 'small') {
            annualCarPerq += 1800 * 12;
        } else if (carEngine === 'large') {
            annualCarPerq += 2400 * 12;
        }
        if (carEngine !== 'none' && hasDriver) {
            annualCarPerq += 900 * 12;
        }

        // House Property Net Income/Loss Section 24
        const houseRent = parseFloat(inputHouseRent.value) || 0;
        const houseTaxes = parseFloat(inputHouseTaxes.value) || 0;
        const manual24b = parseFloat(inputDed24b.value) || 0;
        
        const netRentalIncome = Math.max(0, (houseRent - houseTaxes) * 0.70);
        
        // Offset rules: Old allows salary offset of loss up to 2L. New capped at 0.
        const oldHouseOffset = Math.max(-200000, netRentalIncome - manual24b);
        const newHouseOffset = Math.max(0, netRentalIncome - manual24b);

        // Old regime deductions (VPF added to 80C)
        const manual80C = parseFloat(inputDed80c.value) || 0;
        const manual80D = parseFloat(inputDed80d.value) || 0;
        const manualNps = parseFloat(inputDedNps.value) || 0;
        
        const total80C = Math.min(150000, manual80C + annualEmployeePf + annualVPF);
        const total80D = Math.min(75000, manual80D);
        const totalNps = Math.min(50000, manualNps);
        
        const oldDeductions = total80C + total80D + totalNps + annualHraExemption + 50000;
        const oldTaxableIncome = Math.max(0, annualGrossSalary - oldDeductions - annualCorpNpsDeduction - totalTaxFreePerks + annualCarPerq + oldHouseOffset);
        const oldTax = calculateOldRegimeTax(oldTaxableIncome);
        // Note: VPF reduces monthly take-home cash directly
        const oldInHand = Math.max(0, annualGrossSalary - annualEmployeePf - annualVPF - annualPT - oldTax);
        
        // New regime calculations
        const newDeductions = 75000; // Standard deduction
        const newTaxableIncome = Math.max(0, annualGrossSalary - newDeductions - annualCorpNpsDeduction + annualCarPerq + newHouseOffset);
        const newTax = calculateNewRegimeTax(newTaxableIncome);
        const newInHand = Math.max(0, annualGrossSalary - annualEmployeePf - annualVPF - annualPT - newTax);
        
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
            recommendedRegime,
            oldDeductions,
            annualHraExemption,
            annualCorpNpsDeduction,
            totalTaxFreePerks,
            annualVPF,
            annualCarPerq,
            oldHouseOffset,
            newHouseOffset
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
        breakdownPf.innerText = `- ` + formatINR((annualEmployeePf + annualVPF) * mult);
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
        renderChart(finalInHand, finalTax, annualEmployeePf + annualEmployerPf + annualVPF, annualGratuity, annualPT);

        // Update AI Optimization tips
        updateOptimizationTips(currentCalcState);
    }

    // Job Offer scenario evaluation array
    let savedScenarios = JSON.parse(localStorage.getItem('saved_salary_scenarios')) || [];

    // Trigger initial render of saved scenarios
    renderScenarios();

    // Event listener for saving scenario
    if (btnSaveScenario) {
        btnSaveScenario.addEventListener('click', () => {
            const state = currentCalcState;
            const scenarioName = prompt("Enter a label for this scenario (e.g. 'Company A Offer', 'Capped PF Offer'):");
            if (scenarioName) {
                const newScenario = {
                    id: Date.now(),
                    name: scenarioName,
                    ctc: state.ctc,
                    monthlyInhand: (state.recommendedRegime === 'New Regime' ? state.newInHand : state.oldInHand) / 12,
                    regime: state.recommendedRegime,
                    annualTax: state.recommendedRegime === 'New Regime' ? state.newTax : state.oldTax,
                    pf: state.annualEmployeePf + state.annualEmployerPf + state.annualVPF,
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                };
                savedScenarios.push(newScenario);
                localStorage.setItem('saved_salary_scenarios', JSON.stringify(savedScenarios));
                renderScenarios();
            }
        });
    }

    function renderScenarios() {
        if (!compareScenariosGrid) return;
        
        if (savedScenarios.length === 0) {
            compareScenariosGrid.innerHTML = `<p class="hint-text" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); margin: 1rem 0;">No saved offers yet. Set your numbers and click "Save Current Setup" to start comparing!</p>`;
            return;
        }
        
        compareScenariosGrid.innerHTML = '';
        
        // Use the first saved scenario as the base for comparative deltas
        const baseInhand = savedScenarios[0].monthlyInhand;
        
        savedScenarios.forEach((sc, index) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            
            const delta = sc.monthlyInhand - baseInhand;
            let deltaBadge = '';
            if (index > 0) {
                if (delta > 0) {
                    deltaBadge = `<span class="scenario-delta plus">+${formatINR(delta)}/mo vs base</span>`;
                } else if (delta < 0) {
                    deltaBadge = `<span class="scenario-delta minus">-${formatINR(Math.abs(delta))}/mo vs base</span>`;
                } else {
                    deltaBadge = `<span class="scenario-delta" style="background: var(--bg-card-border); color: var(--text-muted);">Flat</span>`;
                }
            } else {
                deltaBadge = `<span class="scenario-delta plus" style="background: var(--primary-glow); color: var(--primary); border-color: rgba(30,144,255,0.2);">Base Scenario</span>`;
            }
            
            card.innerHTML = `
                <div class="scenario-header">
                    <span class="scenario-title">${sc.name}</span>
                    <button class="btn-delete-scenario" data-id="${sc.id}" title="Delete Offer">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
                <div class="scenario-kpi">${formatINR(sc.monthlyInhand)}<span style="font-size: 0.75rem; font-weight: 500; color: var(--text-muted);">/mo</span></div>
                ${deltaBadge}
                <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;">
                    <div class="scenario-row">
                        <span class="scenario-label">CTC:</span>
                        <span class="scenario-val">${formatINR(sc.ctc)}</span>
                    </div>
                    <div class="scenario-row">
                        <span class="scenario-label">Regime:</span>
                        <span class="scenario-val">${sc.regime}</span>
                    </div>
                    <div class="scenario-row">
                        <span class="scenario-label">TDS (Tax):</span>
                        <span class="scenario-val">${formatINR(sc.annualTax)}/yr</span>
                    </div>
                    <div class="scenario-row">
                        <span class="scenario-label">Total PF:</span>
                        <span class="scenario-val">${formatINR(sc.pf)}/yr</span>
                    </div>
                </div>
            `;
            
            compareScenariosGrid.appendChild(card);
        });
        
        // Re-init lucide icons on dynamically created list
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Bind delete scenario buttons
        compareScenariosGrid.querySelectorAll('.btn-delete-scenario').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = parseInt(btn.getAttribute('data-id'));
                savedScenarios = savedScenarios.filter(sc => sc.id !== idToDelete);
                localStorage.setItem('saved_salary_scenarios', JSON.stringify(savedScenarios));
                renderScenarios();
            });
        });
    }

    // Dynamic Tax Optimization recommendations planner
    function updateOptimizationTips(state) {
        if (!optTipsContainer) return;
        
        optTipsContainer.innerHTML = '';
        const tips = [];
        
        const basicSalary = state.basicSalary;
        
        // 1. Check Section 80C
        const manual80C = parseFloat(inputDed80c.value) || 0;
        const total80C = Math.min(150000, manual80C + state.annualEmployeePf + state.annualVPF);
        const remaining80C = 150000 - total80C;
        if (remaining80C > 2000 && state.recommendedRegime === 'Old Regime' && state.oldTax > 0) {
            const taxBracketRate = state.oldTaxableIncome > 1000000 ? 0.30 : (state.oldTaxableIncome > 500000 ? 0.20 : 0.05);
            const potentialSavings = remaining80C * taxBracketRate * 1.04;
            if (potentialSavings > 0) {
                tips.push({
                    title: "Maximize Section 80C / VPF",
                    desc: `You have ₹${remaining80C.toLocaleString('en-IN')} remaining cap under Sec 80C. You can increase your VPF or invest in ELSS/PPF to save tax.`,
                    saving: `Save ${formatINR(potentialSavings)}`
                });
            }
        }
        
        // 2. Check Corporate NPS (Section 80CCD(2))
        const currentCorpNpsPct = (parseFloat(inputCorpNps.value) || 0) / 100;
        if (currentCorpNpsPct < 0.10) {
            const extraEligibleNpsPct = 0.10 - currentCorpNpsPct;
            const extraNpsAmt = basicSalary * extraEligibleNpsPct;
            const activeRegime = state.recommendedRegime;
            const taxableIncome = activeRegime === 'New Regime' ? state.newTaxableIncome : state.oldTaxableIncome;
            const taxBracketRate = taxableIncome > 2400000 ? 0.30 : (taxableIncome > 1500000 ? 0.20 : 0.10);
            
            const potentialSavings = extraNpsAmt * taxBracketRate * 1.04;
            const activeTax = activeRegime === 'New Regime' ? state.newTax : state.oldTax;
            
            if (potentialSavings > 2000 && activeTax > 0) {
                tips.push({
                    title: "Opt for Section 80CCD(2) Corporate NPS",
                    desc: `Ask your employer to contribute 10% of Basic to NPS. It is fully tax-exempt under both tax regimes!`,
                    saving: `Save ${formatINR(potentialSavings)}`
                });
            }
        }
        
        // 3. Check NPS Individual Contribution (Sec 80CCD(1B))
        const manualNps = parseFloat(inputDedNps.value) || 0;
        const remainingNps = 50000 - Math.min(50000, manualNps);
        if (remainingNps > 2000 && state.recommendedRegime === 'Old Regime' && state.oldTax > 0) {
            const taxBracketRate = state.oldTaxableIncome > 1000000 ? 0.30 : (state.oldTaxableIncome > 500000 ? 0.20 : 0.05);
            const potentialSavings = remainingNps * taxBracketRate * 1.04;
            if (potentialSavings > 0) {
                tips.push({
                    title: "Invest in Section 80CCD(1B) NPS",
                    desc: `Making a direct self-contribution of ₹${remainingNps.toLocaleString('en-IN')} to your NPS Tier-1 account saves tax.`,
                    saving: `Save ${formatINR(potentialSavings)}`
                });
            }
        }
        
        // 4. Check Section 80D (Health Insurance)
        const manual80D = parseFloat(inputDed80d.value) || 0;
        const remaining80D = 75000 - Math.min(75000, manual80D);
        if (remaining80D > 5000 && state.recommendedRegime === 'Old Regime' && state.oldTax > 0) {
            const taxBracketRate = state.oldTaxableIncome > 1000000 ? 0.30 : (state.oldTaxableIncome > 500000 ? 0.20 : 0.05);
            const potentialSavings = remaining80D * taxBracketRate * 1.04;
            if (potentialSavings > 0) {
                tips.push({
                    title: "Claim Health Insurance (Sec 80D)",
                    desc: `You can deduct health insurance premiums for self (up to ₹25k) and parents (up to ₹50k if seniors).`,
                    saving: `Save up to ${formatINR(potentialSavings)}`
                });
            }
        }
        
        // Fallback or general recommendation
        if (tips.length === 0) {
            tips.push({
                title: "Your Tax is Fully Optimized!",
                desc: "Great job! You have fully utilized your tax deductions or fall under a zero-tax slab bracket.",
                saving: "Maximized"
            });
        }
        
        tips.slice(0, 3).forEach(tip => {
            const div = document.createElement('div');
            div.className = 'opt-tip-card';
            div.innerHTML = `
                <div class="opt-tip-left">
                    <span class="opt-tip-title">${tip.title}</span>
                    <span class="opt-tip-desc">${tip.desc}</span>
                </div>
                <div class="opt-tip-saving">${tip.saving}</div>
            `;
            optTipsContainer.appendChild(div);
        });
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
    const selectAiModel = document.getElementById('select-ai-model');
    const btnSaveKey = document.getElementById('btn-save-key');
    const aiStatusBadge = document.getElementById('ai-status-badge');

    // Load key and model from local storage on init
    let geminiApiKey = localStorage.getItem('gemini_api_key') || '';
    let geminiApiModel = localStorage.getItem('gemini_api_model') || 'gemini-2.5-flash';
    selectAiModel.value = geminiApiModel;

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
        const selectedModel = selectAiModel.value;
        localStorage.setItem('gemini_api_model', selectedModel);
        geminiApiModel = selectedModel;

        if (geminiApiKey) {
            localStorage.setItem('gemini_api_key', geminiApiKey);
            aiStatusBadge.innerText = 'AI Active';
            aiStatusBadge.style.background = 'var(--primary-glow)';
            aiStatusBadge.style.color = 'var(--primary)';
            appendMessage(`Gemini AI Key saved using model <strong>${geminiApiModel}</strong>! I can now answer all custom questions.`, 'system');
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
        geminiApiKey = (geminiApiKey || '').replace(/['"]/g, '').trim();
        if (geminiApiKey === 'undefined' || geminiApiKey === 'null') {
            geminiApiKey = '';
        }
        
        console.log("Gemini API Key Loaded (Masked):", geminiApiKey ? geminiApiKey.substring(0, 6) + "..." + geminiApiKey.slice(-4) + " (Length: " + geminiApiKey.length + ")" : "Empty");

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
- Voluntary PF (VPF) deduction: ₹${(state.annualVPF || 0).toLocaleString('en-IN')}/year
- Gratuity allocation: ₹${state.annualGratuity.toLocaleString('en-IN')}/year
- Professional Tax (PT): ₹${state.annualPT.toLocaleString('en-IN')}/year
- Estimated Tax under New Regime: ₹${state.newTax.toLocaleString('en-IN')}/year
- Estimated Tax under Old Regime: ₹${state.oldTax.toLocaleString('en-IN')}/year
- Annual In-hand under New Regime: ₹${state.newInHand.toLocaleString('en-IN')}/year
- Annual In-hand under Old Regime: ₹${state.oldInHand.toLocaleString('en-IN')}/year
- Recommended Tax Regime choice: ${state.recommendedRegime}
- Old Regime Deductions declared: ₹${(state.oldDeductions - 50000).toLocaleString('en-IN')}/year (excluding ₹50,000 standard deduction)
- Live HRA Exemption calculated: ₹${state.annualHraExemption.toLocaleString('en-IN')}/year
- Company Car Perquisite under Sec 17(2): ₹${(state.annualCarPerq || 0).toLocaleString('en-IN')}/year
- House Property Net Offset (Old Regime): ₹${(state.oldHouseOffset || 0).toLocaleString('en-IN')}/year
- House Property Net Offset (New Regime): ₹${(state.newHouseOffset || 0).toLocaleString('en-IN')}/year

Provide a direct, concise, and accurate answer to the user's question. 
CRITICAL RULE 1: You must always output the exact numbers provided in this financial state. Do not calculate, estimate, round, or modify any financial figures on your own. If the user asks about their specific take-home pay, tax, or deductions, repeat the numbers in the state exactly. Do not increase, decrease, or alter them by any chance. 
CRITICAL RULE 2: If the user states a different figure in their query (e.g. they say "Why is my in-hand 45k?" when the state says in-hand is ₹53,297/month), DO NOT AGREE with them. Politely correct them and output the exact figure from the financial state (e.g. state "Actually, your net in-hand is ₹53,297/month according to the calculator...").
Use clean HTML tags for formatting if needed (e.g. <strong>, <br>, <ul>, <li>). Do not output markdown code blocks like \`\`\`html. Don't mention system details. Make sure your advice follows the latest Indian Income Tax rules (FY 2026-27).`;

        // Models to try in priority order
        const userPreferredModel = geminiApiModel || 'gemini-2.5-flash';
        const fallbackQueue = [
            userPreferredModel,
            'gemini-2.5-flash',
            'gemini-3.5-flash',
            'gemini-2.0-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash-lite'
        ];
        
        // Remove duplicates
        const uniqueQueue = [...new Set(fallbackQueue)];
        let lastError = null;

        for (const model of uniqueQueue) {
            try {
                console.log(`Auto-selecting model: Attempting ${model}...`);
                const isOpenRouter = geminiApiKey.startsWith('sk-or-') || model.includes('/');
                let url = '';
                let headers = {};
                let body = {};
                
                if (isOpenRouter) {
                    url = 'https://openrouter.ai/api/v1/chat/completions';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${geminiApiKey}`
                    };
                    body = {
                        model: model,
                        messages: [
                            { role: 'user', content: systemPrompt + `\n\nUser Question: ${query}` }
                        ]
                    };
                } else {
                    url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
                    headers = {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': geminiApiKey
                    };
                    body = {
                        contents: [{
                            parts: [{
                                text: systemPrompt + `\n\nUser Question: ${query}`
                            }]
                        }]
                    };
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(body)
                });

                const data = await response.json();

                if (!response.ok) {
                    const errMsg = data.error ? (data.error.message || data.error) : 'HTTP Error ' + response.status;
                    throw new Error(errMsg);
                }

                let text = '';
                if (isOpenRouter) {
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        text = data.choices[0].message.content;
                    } else {
                        throw new Error('Invalid response structure from OpenRouter API');
                    }
                } else {
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        text = data.candidates[0].content.parts[0].text;
                    } else {
                        throw new Error('Invalid response structure from Gemini API');
                    }
                }

                if (text) {
                    // Format response formatting
                    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
                    text = text.replace(/\n/g, '<br>');
                    
                    typingDiv.remove();
                    appendMessage(text, 'system');
                    
                    // Save the working model to skip fallback retry next time
                    if (geminiApiModel !== model) {
                        geminiApiModel = model;
                        localStorage.setItem('gemini_api_model', model);
                        const modelSelector = document.getElementById('select-ai-model');
                        if (modelSelector) {
                            modelSelector.value = model;
                        }
                    }
                    return; // Exit function on success
                } else {
                    throw new Error('Invalid response structure from Gemini API');
                }
            } catch (err) {
                console.warn(`Model ${model} failed to respond:`, err.message);
                lastError = err;
            }
        }

        // If all models in the queue failed
        typingDiv.remove();
        appendMessage(`Could not connect to Gemini AI (Tried all fallback models. Last error: ${lastError.message}). Reverting to backup standard reply:<br><br>` + generateAnswer(query), 'system');
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
            const oldDedVal = state.oldDeductions - 50000;
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
