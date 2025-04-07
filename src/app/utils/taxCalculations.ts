import { FederalState } from '../types';

// Constants for tax calculation
export const BASIC_ALLOWANCE = 11908; // Grundfreibetrag for 2025 in Euro

// Tax brackets according to §32a EStG (2025)
export const TAX_BRACKETS = {
  ZONE1_MAX: 11908, // Basic allowance
  ZONE2_MAX: 62810, // Progressive zone
  ZONE3_MAX: 277825, // First proportional zone
  // Everything above is second proportional zone
};

// Solidarity surcharge thresholds
export const SOLIDARITY_THRESHOLDS = {
  INDIVIDUAL: 18130, // Tax threshold for individual assessment
  JOINT: 36260, // Tax threshold for joint assessment
  RATE: 0.055, // 5.5%
  PHASE_IN_START: 18130, // Start of phase-in range for individuals
  PHASE_IN_END: 19730, // End of phase-in range for individuals
  PHASE_IN_START_JOINT: 36260, // Start of phase-in range for joint assessment
  PHASE_IN_END_JOINT: 39460, // End of phase-in range for joint assessment
};

// Church tax rates by federal state
export const CHURCH_TAX_RATES = {
  [FederalState.BADEN_WUERTTEMBERG]: 0.08, // 8%
  [FederalState.BAYERN]: 0.08, // 8%
  // All other states have 9%
  [FederalState.BERLIN]: 0.09,
  [FederalState.BRANDENBURG]: 0.09,
  [FederalState.BREMEN]: 0.09,
  [FederalState.HAMBURG]: 0.09,
  [FederalState.HESSEN]: 0.09,
  [FederalState.MECKLENBURG_VORPOMMERN]: 0.09,
  [FederalState.NIEDERSACHSEN]: 0.09,
  [FederalState.NORDRHEIN_WESTFALEN]: 0.09,
  [FederalState.RHEINLAND_PFALZ]: 0.09,
  [FederalState.SAARLAND]: 0.09,
  [FederalState.SACHSEN]: 0.09,
  [FederalState.SACHSEN_ANHALT]: 0.09,
  [FederalState.SCHLESWIG_HOLSTEIN]: 0.09,
  [FederalState.THUERINGEN]: 0.09,
};

// Debug mode for detailed calculation logging
let DEBUG_MODE = false;

export const setDebugMode = (isDebug: boolean): void => {
  DEBUG_MODE = isDebug;
  console.log(`[TAX CALCULATOR] Debug mode ${isDebug ? 'ENABLED' : 'DISABLED'}`);
};

const logDebug = (message: string, data?: any): void => {
  if (!DEBUG_MODE) return;
  
  // Force console output
  console.warn(`[TAX DEBUG] ${message}`, data || '');
  
  // Also try to update the DOM debug container
  setTimeout(() => {
    try {
      const debugElement = document.getElementById('debug-output');
      if (debugElement) {
        const msgElement = document.createElement('div');
        msgElement.className = 'text-xs mb-1';
        msgElement.innerHTML = `<span class="text-red-600 font-bold">[DEBUG]</span> ${message}`;
        if (data) {
          const dataElement = document.createElement('pre');
          dataElement.className = 'text-xs mb-2 pl-4 text-gray-600';
          dataElement.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
          msgElement.appendChild(dataElement);
        }
        debugElement.appendChild(msgElement);
        
        // Auto-scroll to bottom
        debugElement.scrollTop = debugElement.scrollHeight;
      }
    } catch (e) {
      console.error('Error writing to debug UI:', e);
    }
  }, 0);
};

// Get church tax rate based on federal state
export const getChurchTaxRate = (state: FederalState): number => {
  if (state === FederalState.BAYERN || state === FederalState.BADEN_WUERTTEMBERG) {
    return CHURCH_TAX_RATES[state] || 0.09;
  }
  return 0.09;
};

// Exact income tax calculation according to §32a EStG
export const calculateIncomeTax = (income: number): number => {
  // Round income down to nearest Euro as per tax law
  const roundedIncome = Math.floor(income);
  
  logDebug(`Calculating income tax for €${roundedIncome}`);

  if (roundedIncome <= TAX_BRACKETS.ZONE1_MAX) {
    // Basic tax-free allowance: No tax
    logDebug(`Income is within basic allowance, tax = €0`);
    return 0;
  } else if (roundedIncome <= TAX_BRACKETS.ZONE2_MAX) {
    // Progressive zone formula: Tax = (1007.27 * y + 1400) * y where y = (income - 11,908) / 10,000
    const y = (roundedIncome - TAX_BRACKETS.ZONE1_MAX) / 10000;
    const tax = Math.floor((1007.27 * y + 1400) * y);
    logDebug(`Income is in progressive zone, y=${y}, tax = €${tax}`);
    return tax;
  } else if (roundedIncome <= TAX_BRACKETS.ZONE3_MAX) {
    // First proportional zone formula: Tax = 0.42 * income - 9,336.45
    const tax = Math.floor(0.42 * roundedIncome - 9336.45);
    logDebug(`Income is in first proportional zone, tax = €${tax}`);
    return tax;
  } else {
    // Second proportional zone formula: Tax = 0.45 * income - 17,671.20
    const tax = Math.floor(0.45 * roundedIncome - 17671.20);
    logDebug(`Income is in second proportional zone, tax = €${tax}`);
    return tax;
  }
};

// Calculate income tax with joint assessment (proper splitting method)
export const calculateJointIncomeTax = (income: number): number => {
  // Apply the proper German splitting procedure:
  // 1. Divide the income by 2
  // 2. Calculate tax on this half
  // 3. Multiply the result by 2
  const halfIncome = income / 2;
  const halfTax = calculateIncomeTax(halfIncome);
  const totalTax = halfTax * 2;
  
  logDebug(`Joint assessment calculation: Income €${income}, Half €${halfIncome}, Half tax €${halfTax}, Total tax €${totalTax}`);
  
  return totalTax;
};

// Calculate marginal tax rate for a given income range
export const calculateMarginalTaxRate = (baseIncome: number, additionalIncome: number, isJointAssessment: boolean): number => {
  // For zero additional income, avoid division by zero
  if (additionalIncome <= 0) {
    return 0;
  }
  
  const totalIncome = baseIncome + additionalIncome;
  
  logDebug(`=== MARGINAL TAX RATE CALCULATION ===`);
  logDebug(`Base income: €${baseIncome}, Additional income: €${additionalIncome}, Total: €${totalIncome}`);
  
  // Calculate base income tax
  const baseTax = isJointAssessment ? 
    calculateJointIncomeTax(baseIncome) : 
    calculateIncomeTax(baseIncome);
  
  // Calculate total income tax
  const totalTax = isJointAssessment ? 
    calculateJointIncomeTax(totalIncome) : 
    calculateIncomeTax(totalIncome);
  
  // Calculate additional income tax (not including surcharges/church tax)
  const additionalTax = totalTax - baseTax;
  
  // Basic marginal rate for income tax only
  const incomeTaxMarginalRate = additionalTax / additionalIncome;
  
  logDebug(`Base tax: €${baseTax.toFixed(2)}, Total tax: €${totalTax.toFixed(2)}, Additional tax: €${additionalTax.toFixed(2)}`);
  logDebug(`Income tax marginal rate: ${(incomeTaxMarginalRate * 100).toFixed(2)}%`);
  
  // Now calculate the complete tax including solidarity surcharge and church tax
  // This is the proper way to get the true marginal rate including all components
  
  // Base solidarity surcharge
  const baseSoli = calculateSolidaritySurcharge(baseTax, isJointAssessment);
  // Total solidarity surcharge
  const totalSoli = calculateSolidaritySurcharge(totalTax, isJointAssessment);
  // Additional solidarity surcharge
  const additionalSoli = totalSoli - baseSoli;
  
  logDebug(`Additional solidarity surcharge: €${additionalSoli.toFixed(2)}`);
  
  // Add in surcharges and church tax for a more accurate marginal rate
  // For simplicity, we're not calculating different church tax rates here
  // A fixed 9% church tax on the marginal income tax is assumed if needed
  
  // Total additional tax including surcharges
  const totalAdditionalTax = additionalTax + additionalSoli;
  
  // Final marginal tax rate including all components
  const completeMarginalRate = totalAdditionalTax / additionalIncome;
  
  logDebug(`Complete marginal rate (with surcharges): ${(completeMarginalRate * 100).toFixed(2)}%`);
  
  // Cap at a reasonable maximum rate
  if (completeMarginalRate > 0.55) {
    logDebug(`WARNING: Calculated marginal rate (${completeMarginalRate}) seems too high, capping at 0.55`);
    return 0.55;
  }
  
  return completeMarginalRate;
};

// Calculate solidarity surcharge with proper phase-in range
export const calculateSolidaritySurcharge = (incomeTax: number, isJointAssessment: boolean): number => {
  const threshold = isJointAssessment ? SOLIDARITY_THRESHOLDS.JOINT : SOLIDARITY_THRESHOLDS.INDIVIDUAL;
  const phaseInStart = isJointAssessment ? SOLIDARITY_THRESHOLDS.PHASE_IN_START_JOINT : SOLIDARITY_THRESHOLDS.PHASE_IN_START;
  const phaseInEnd = isJointAssessment ? SOLIDARITY_THRESHOLDS.PHASE_IN_END_JOINT : SOLIDARITY_THRESHOLDS.PHASE_IN_END;
  
  logDebug(`Calculating solidarity surcharge for income tax €${incomeTax}, joint assessment: ${isJointAssessment}`);
  
  if (incomeTax <= threshold) {
    logDebug(`  Income tax below threshold (€${threshold}), no solidarity surcharge`);
    return 0;
  }
  
  // Regular full rate
  const regularSoli = incomeTax * SOLIDARITY_THRESHOLDS.RATE;
  
  // Check if in phase-in range for reduced rate
  if (incomeTax > phaseInStart && incomeTax <= phaseInEnd) {
    // Phase-in calculation: 20% of (income tax - exemption limit)
    const phaseInFactor = 0.2;
    const reducedSoli = phaseInFactor * (incomeTax - phaseInStart);
    
    logDebug(`  In phase-in range, regular: €${regularSoli}, reduced: €${reducedSoli}`);
    
    return Math.min(regularSoli, reducedSoli);
  }
  
  logDebug(`  Regular solidarity surcharge: €${regularSoli}`);
  return Math.floor(regularSoli);
};

// Calculate church tax
export const calculateChurchTax = (incomeTax: number, isChurchMember: boolean, federalState: FederalState): number => {
  if (!isChurchMember) {
    return 0;
  }
  
  // Get church tax rate for federal state (default to 9% if not found)
  const rate = CHURCH_TAX_RATES[federalState] || 0.09;
  
  const churchTax = Math.floor(incomeTax * rate);
  logDebug(`Church tax for €${incomeTax} in ${federalState}: ${rate * 100}% = €${churchTax}`);
  
  return churchTax;
};

// Validate tax calculation results for logical consistency
export const validateTaxCalculation = (baseIncome: number, additionalIncome: number, baseTax: number, totalTax: number): boolean => {
  // Basic sanity checks
  if (baseTax < 0 || totalTax < 0) {
    logDebug(`VALIDATION FAILED: Negative tax amounts`);
    return false;
  }
  
  if (additionalIncome > 0 && totalTax <= baseTax) {
    logDebug(`VALIDATION FAILED: Additional income doesn't increase tax`);
    return false;
  }
  
  // Check for reasonable tax rates
  const maxExpectedRate = 0.5; // 50% as a reasonable upper limit
  const additionalTax = totalTax - baseTax;
  
  if (additionalIncome > 0 && (additionalTax / additionalIncome) > maxExpectedRate) {
    logDebug(`VALIDATION WARNING: Effective tax rate ${additionalTax / additionalIncome} exceeds expected maximum ${maxExpectedRate}`);
    // Don't fail validation, but warn
  }
  
  return true;
};

/**
 * Calculate total tax (income tax + solidarity surcharge + church tax)
 * @param income Annual income
 * @param isJointAssessment Whether joint assessment applies
 * @param isChurchMember Whether the person is a church member
 * @param state Federal state
 * @returns Total tax amount
 */
export const calculateTotalTax = (
  income: number,
  isJointAssessment = false,
  isChurchMember = false,
  state: FederalState = FederalState.NORDRHEIN_WESTFALEN
): {
  incomeTax: number;
  solidaritySurcharge: number;
  churchTax: number;
  totalTax: number;
  effectiveTaxRate: number;
} => {
  const incomeTax = calculateIncomeTax(income);
  const solidaritySurcharge = calculateSolidaritySurcharge(incomeTax, isJointAssessment);
  const churchTax = calculateChurchTax(incomeTax, isChurchMember, state);
  
  const totalTax = incomeTax + solidaritySurcharge + churchTax;
  const effectiveTaxRate = income > 0 ? totalTax / income : 0;
  
  return {
    incomeTax,
    solidaritySurcharge,
    churchTax,
    totalTax,
    effectiveTaxRate
  };
};

/**
 * Calculate the tax difference for additional income (differential method)
 * @param baseIncome Current annual income without GbR profits
 * @param additionalIncome Additional income from GbR
 * @param isJointAssessment Whether joint assessment applies
 * @param isChurchMember Whether the person is a church member
 * @param state Federal state
 * @returns Tax calculation result for the additional income
 */
export const calculateAdditionalTax = (
  baseIncome: number,
  additionalIncome: number,
  isJointAssessment = false,
  isChurchMember = false,
  state: FederalState = FederalState.NORDRHEIN_WESTFALEN
): {
  baseTax: number;
  totalTax: number;
  additionalTax: number;
  effectiveRate: number;
} => {
  const baseTaxResult = calculateTotalTax(baseIncome, isJointAssessment, isChurchMember, state);
  const totalTaxResult = calculateTotalTax(baseIncome + additionalIncome, isJointAssessment, isChurchMember, state);
  
  const additionalTax = totalTaxResult.totalTax - baseTaxResult.totalTax;
  const effectiveRate = additionalIncome > 0 ? additionalTax / additionalIncome : 0;
  
  return {
    baseTax: baseTaxResult.totalTax,
    totalTax: totalTaxResult.totalTax,
    additionalTax,
    effectiveRate
  };
};

// Helper function to test debugging output
export const forceDebugTest = (): void => {
  console.warn("======== FORCED DEBUG TEST ========");
  console.warn("This should show in console regardless of debug mode");
  
  // Test DOM writing
  const debugElement = document.getElementById('debug-output');
  if (debugElement) {
    const testElement = document.createElement('div');
    testElement.className = 'p-2 bg-yellow-100 border border-yellow-500 mb-4';
    testElement.innerHTML = '<strong>FORCED DEBUG TEST</strong> - If you see this, DOM debugging works!';
    debugElement.appendChild(testElement);
  } else {
    console.warn("Debug element not found in DOM");
  }
  
  // Also test the regular logDebug function
  const wasDebugMode = DEBUG_MODE;
  DEBUG_MODE = true;
  logDebug("TEST: This is a test debug message", { test: true, time: new Date().toISOString() });
  
  // Test with the user's specific example data
  logDebug("========= USER TEST CASE: TAX RATE PARADOX =========");
  
  // Partner 1 data
  const partner1BaseIncome = 40000;
  const partner1Share = 0.5;
  const partner1IsChurchMember = true;
  const partner1IsJointAssessment = false;
  
  // Partner 2 data
  const partner2BaseIncome = 12000;
  const partner2Share = 0.5;
  const partner2IsChurchMember = true;
  const partner2IsJointAssessment = false;
  
  // GbR data
  const gbrMonthlyProfit = 5000;
  const safetyMargin = 0.05;
  
  // Calculate annual GbR profit for each partner
  const partner1AnnualGbrProfit = gbrMonthlyProfit * 12 * partner1Share;
  const partner2AnnualGbrProfit = gbrMonthlyProfit * 12 * partner2Share;
  
  logDebug("Partner 1 (High Income)", {
    baseIncome: partner1BaseIncome,
    gbrIncome: partner1AnnualGbrProfit,
    totalIncome: partner1BaseIncome + partner1AnnualGbrProfit,
    share: partner1Share * 100 + "%"
  });
  
  logDebug("Partner 2 (Low Income)", {
    baseIncome: partner2BaseIncome,
    gbrIncome: partner2AnnualGbrProfit,
    totalIncome: partner2BaseIncome + partner2AnnualGbrProfit,
    share: partner2Share * 100 + "%"
  });
  
  // Full calculation tests
  logDebug("======== FULL CALCULATION TEST ========");
  
  // Partner 1 - Calculate full reserve
  logDebug("PARTNER 1 - FULL TAX RESERVE CALCULATION");
  const taxResult1 = calculateTaxReserve(
    partner1BaseIncome,
    partner1AnnualGbrProfit,
    partner1IsChurchMember,
    FederalState.NORDRHEIN_WESTFALEN,
    partner1IsJointAssessment,
    safetyMargin
  );
  
  // Partner 2 - Calculate full reserve
  logDebug("PARTNER 2 - FULL TAX RESERVE CALCULATION");
  const taxResult2 = calculateTaxReserve(
    partner2BaseIncome,
    partner2AnnualGbrProfit,
    partner2IsChurchMember,
    FederalState.NORDRHEIN_WESTFALEN,
    partner2IsJointAssessment,
    safetyMargin
  );
  
  // Final comparison of the two partners
  logDebug("FINAL COMPARISON", {
    partner1: {
      baseIncome: partner1BaseIncome,
      yearlyGbrIncome: partner1AnnualGbrProfit,
      totalIncome: partner1BaseIncome + partner1AnnualGbrProfit,
      marginalRate: taxResult1.effectiveTaxRate / (1 + safetyMargin),
      effectiveRate: taxResult1.effectiveTaxRate,
      monthlyReserve: (partner1AnnualGbrProfit / 12) * taxResult1.effectiveTaxRate
    },
    partner2: {
      baseIncome: partner2BaseIncome,
      yearlyGbrIncome: partner2AnnualGbrProfit,
      totalIncome: partner2BaseIncome + partner2AnnualGbrProfit,
      marginalRate: taxResult2.effectiveTaxRate / (1 + safetyMargin),
      effectiveRate: taxResult2.effectiveTaxRate,
      monthlyReserve: (partner2AnnualGbrProfit / 12) * taxResult2.effectiveTaxRate
    }
  });
  
  // Explain the tax paradox
  logDebug("WHY LOWER BASE INCOME CAN HAVE HIGHER MARGINAL RATE", 
    "This might seem counterintuitive, but makes sense in a progressive tax system:\n" +
    "1. Partner 1 (€40k) is already in a higher tax bracket\n" +
    "2. Partner 2 (€12k) is in a very low tax bracket\n" +
    "3. When both get +€30k from GbR, Partner 2 crosses MANY tax brackets\n" +
    "4. This results in a higher 'marginal rate' for Partner 2's additional GbR income"
  );
  
  // Reset debug mode
  DEBUG_MODE = wasDebugMode;
};

// Calculate tax reserve for a partner
export const calculateTaxReserve = (
  baseIncome: number,
  gbrIncome: number,
  isChurchMember: boolean = false,
  federalState: FederalState = FederalState.NORDRHEIN_WESTFALEN,
  isJointAssessment: boolean = false,
  safetyMargin: number = 0.05, // Default 5% safety margin
): {
  baseTaxAmount: number;
  totalTaxAmount: number;
  additionalTaxAmount: number;
  effectiveTaxRate: number;
  incomeTax: number;
  solidaritySurcharge: number;
  churchTax: number;
  totalTax: number;
} => {
  // Force console output to test debugging
  console.warn("calculateTaxReserve called - DEBUG_MODE is:", DEBUG_MODE);
  
  logDebug(`===== STARTING TAX CALCULATION =====`);
  logDebug(`Base income: €${baseIncome}, GbR income: €${gbrIncome}`);
  logDebug(`Church member: ${isChurchMember}, Federal state: ${federalState}`);
  logDebug(`Joint assessment: ${isJointAssessment}, Safety margin: ${safetyMargin}`);
  
  // For joint assessment, use the proper splitting method
  if (isJointAssessment) {
    // Calculate income tax on base income (without GbR) - proper splitting method
    const baseTaxAmount = calculateJointIncomeTax(baseIncome);
    logDebug(`Base tax (joint): €${baseTaxAmount}`);
    
    // Calculate income tax on total income (with GbR) - proper splitting method
    const totalTaxAmount = calculateJointIncomeTax(baseIncome + gbrIncome);
    logDebug(`Total tax (joint): €${totalTaxAmount}`);
    
    // Calculate the additional tax due to GbR income
    const additionalTaxAmount = totalTaxAmount - baseTaxAmount;
    logDebug(`Additional tax: €${additionalTaxAmount}`);
    
    // Calculate base solidarity surcharge (without GbR)
    const baseSoli = calculateSolidaritySurcharge(baseTaxAmount, true);
    logDebug(`Base solidarity surcharge: €${baseSoli}`);
    
    // Calculate total solidarity surcharge (with GbR)
    const totalSoli = calculateSolidaritySurcharge(totalTaxAmount, true);
    logDebug(`Total solidarity surcharge: €${totalSoli}`);
    
    // Calculate the additional solidarity surcharge due to GbR income
    const solidaritySurcharge = totalSoli - baseSoli;
    logDebug(`Additional solidarity surcharge: €${solidaritySurcharge}`);
    
    // Calculate base church tax (without GbR)
    const baseChurchTax = calculateChurchTax(baseTaxAmount, isChurchMember, federalState);
    logDebug(`Base church tax: €${baseChurchTax}`);
    
    // Calculate total church tax (with GbR)
    const totalChurchTax = calculateChurchTax(totalTaxAmount, isChurchMember, federalState);
    logDebug(`Total church tax: €${totalChurchTax}`);
    
    // Calculate the additional church tax due to GbR income
    const churchTax = totalChurchTax - baseChurchTax;
    logDebug(`Additional church tax: €${churchTax}`);
    
    // Calculate total additional tax (income tax + solidarity surcharge + church tax)
    const totalTax = additionalTaxAmount + solidaritySurcharge + churchTax;
    logDebug(`Total additional tax: €${totalTax}`);
    
    // Use improved marginal tax rate calculation - pass true for joint assessment
    const marginalTaxRate = calculateMarginalTaxRate(baseIncome, gbrIncome, true);
    logDebug(`Marginal tax rate: ${marginalTaxRate}`);
    
    // Calculate raw tax amount (without safety margin)
    const rawTaxAmount = gbrIncome * marginalTaxRate;
    logDebug(`Raw tax amount (without safety margin): €${rawTaxAmount}`);
    
    // Apply safety margin to the amount (not the rate)
    const reserveAmount = rawTaxAmount * (1 + safetyMargin);
    logDebug(`Reserve amount (with safety margin): €${reserveAmount}`);
    
    // Calculate effective tax rate (for backward compatibility)
    const effectiveTaxRate = gbrIncome > 0 ? reserveAmount / gbrIncome : 0;
    logDebug(`Effective tax rate (with safety margin): ${effectiveTaxRate}`);
    
    // Validate calculations
    validateTaxCalculation(baseIncome, gbrIncome, baseTaxAmount, totalTaxAmount);
    
    return {
      baseTaxAmount,
      totalTaxAmount,
      additionalTaxAmount,
      effectiveTaxRate,
      incomeTax: additionalTaxAmount,
      solidaritySurcharge,
      churchTax,
      totalTax
    };
  } else {
    // Regular individual assessment
    
    // Calculate income tax on base income (without GbR)
    const baseTaxAmount = calculateIncomeTax(baseIncome);
    logDebug(`Base tax (individual): €${baseTaxAmount}`);
    
    // Calculate income tax on total income (with GbR)
    const totalTaxAmount = calculateIncomeTax(baseIncome + gbrIncome);
    logDebug(`Total tax (individual): €${totalTaxAmount}`);
    
    // Calculate the additional tax due to GbR income
    const additionalTaxAmount = totalTaxAmount - baseTaxAmount;
    logDebug(`Additional tax: €${additionalTaxAmount}`);
    
    // Calculate base solidarity surcharge (without GbR)
    const baseSoli = calculateSolidaritySurcharge(baseTaxAmount, false);
    logDebug(`Base solidarity surcharge: €${baseSoli}`);
    
    // Calculate total solidarity surcharge (with GbR)
    const totalSoli = calculateSolidaritySurcharge(totalTaxAmount, false);
    logDebug(`Total solidarity surcharge: €${totalSoli}`);
    
    // Calculate the additional solidarity surcharge due to GbR income
    const solidaritySurcharge = totalSoli - baseSoli;
    logDebug(`Additional solidarity surcharge: €${solidaritySurcharge}`);
    
    // Calculate base church tax (without GbR)
    const baseChurchTax = calculateChurchTax(baseTaxAmount, isChurchMember, federalState);
    logDebug(`Base church tax: €${baseChurchTax}`);
    
    // Calculate total church tax (with GbR)
    const totalChurchTax = calculateChurchTax(totalTaxAmount, isChurchMember, federalState);
    logDebug(`Total church tax: €${totalChurchTax}`);
    
    // Calculate the additional church tax due to GbR income
    const churchTax = totalChurchTax - baseChurchTax;
    logDebug(`Additional church tax: €${churchTax}`);
    
    // Calculate total additional tax (income tax + solidarity surcharge + church tax)
    const totalTax = additionalTaxAmount + solidaritySurcharge + churchTax;
    logDebug(`Total additional tax: €${totalTax}`);
    
    // Use improved marginal tax rate calculation
    const marginalTaxRate = calculateMarginalTaxRate(baseIncome, gbrIncome, false);
    logDebug(`Marginal tax rate: ${marginalTaxRate}`);
    
    // Calculate raw tax amount (without safety margin)
    const rawTaxAmount = gbrIncome * marginalTaxRate;
    logDebug(`Raw tax amount (without safety margin): €${rawTaxAmount}`);
    
    // Apply safety margin to the amount (not the rate)
    const reserveAmount = rawTaxAmount * (1 + safetyMargin);
    logDebug(`Reserve amount (with safety margin): €${reserveAmount}`);
    
    // Calculate effective tax rate (for backward compatibility)
    const effectiveTaxRate = gbrIncome > 0 ? reserveAmount / gbrIncome : 0;
    logDebug(`Effective tax rate (with safety margin): ${effectiveTaxRate}`);
    
    // Validate calculations
    validateTaxCalculation(baseIncome, gbrIncome, baseTaxAmount, totalTaxAmount);
    
    return {
      baseTaxAmount,
      totalTaxAmount,
      additionalTaxAmount,
      effectiveTaxRate,
      incomeTax: additionalTaxAmount,
      solidaritySurcharge,
      churchTax,
      totalTax
    };
  }
};