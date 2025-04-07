import { FederalState, PartnerData } from '../types';

// Re-export for easier access from components
export { FederalState };

// Constants for tax calculation
export const BASIC_ALLOWANCE = 11908; // Grundfreibetrag for 2025 in Euro

// Constants for tax year 2025
export const TAX_BRACKETS = {
  ZONE1_MAX: 12096, // Basic tax-free allowance
  ZONE2_MAX: 17443, // First progressive zone max
  ZONE3_MAX: 68480, // Second progressive zone max
  ZONE4_MAX: 277825, // First proportional zone max
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
export const CHURCH_TAX_RATES: Record<FederalState, number> = {
  [FederalState.BADEN_WUERTTEMBERG]: 0.08, // 8%
  [FederalState.BAYERN]: 0.08, // 8%
  [FederalState.BERLIN]: 0.09, // 9%
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
let DEBUG_DETAIL_LEVEL = 1; // 1=Normal, 2=Detailed, 3=Very Detailed

// Update debug mode settings
export const setDebugMode = (isDebug: boolean, detailLevel: number = 1): void => {
  DEBUG_MODE = isDebug;
  DEBUG_DETAIL_LEVEL = Math.min(Math.max(detailLevel, 1), 3); // Ensure between 1-3
  console.log(`[TAX CALCULATOR] Debug mode ${isDebug ? 'ENABLED' : 'DISABLED'} at detail level ${DEBUG_DETAIL_LEVEL}`);
  
  // Force a debug log to test if it's working
  if (isDebug) {
    console.warn(`[TAX DEBUG TEST] Debug mode is ON at level ${DEBUG_DETAIL_LEVEL}. Debug logs should now appear.`);
    
    // Try to update the DOM debug container
    setTimeout(() => {
      try {
        const debugElement = document.getElementById('debug-output');
        if (debugElement) {
          const testMsg = document.createElement('div');
          testMsg.className = 'text-xs mb-1 text-red-600 font-bold';
          testMsg.textContent = `[DEBUG TEST] Debug mode activated at level ${DEBUG_DETAIL_LEVEL}`;
          debugElement.appendChild(testMsg);
          
          // Auto-scroll to bottom
          debugElement.scrollTop = debugElement.scrollHeight;
        }
      } catch (e) {
        console.error('Error writing debug test to UI:', e);
      }
    }, 0);
  }
};

const logDebug = (message: string, data?: any, level: number = 1): void => {
  if (!DEBUG_MODE || level > DEBUG_DETAIL_LEVEL) return;
  
  // Format prefix based on detail level
  const prefix = level === 1 ? '[TAX DEBUG]' : 
                level === 2 ? '[TAX DEBUG DETAIL]' : 
                '[TAX DEBUG DETAIL+++]';
  
  // Format message with indentation based on level
  const indent = '  '.repeat(level - 1);
  const formattedMessage = `${indent}${message}`;
  
  // Force console output - use both console.warn and console.log for higher visibility
  console.warn(`${prefix} ${formattedMessage}`, data || '');
  console.log(`${prefix} ${formattedMessage}`, data || '');
  
  // Also try to update the DOM debug container
  setTimeout(() => {
    try {
      const debugElement = document.getElementById('debug-output');
      if (debugElement) {
        const msgElement = document.createElement('div');
        msgElement.className = `text-xs mb-1 ${level > 1 ? 'pl-' + (level - 1) * 2 : ''}`;
        
        // Color based on level
        const levelColor = level === 1 ? 'text-red-600' : 
                          level === 2 ? 'text-blue-600' : 
                          'text-green-600';
        
        msgElement.innerHTML = `<span class="${levelColor} font-bold">[DEBUG${level > 1 ? '-' + level : ''}]</span> ${message}`;
        if (data) {
          const dataElement = document.createElement('pre');
          dataElement.className = `text-xs mb-2 pl-${level * 2} text-gray-600`;
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

// Helper to log tax calculation steps
const logTaxStep = (step: string, detail: any, level: number = 1): void => {
  if (!DEBUG_MODE || level > DEBUG_DETAIL_LEVEL) return;
  
  logDebug(`STEP: ${step}`, detail, level);
};

// Format currency for debug logs
const formatDebugCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format percentage for debug logs
const formatDebugPercentage = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Helper for creating detailed logs with tax law references
const logTaxLawReference = (section: string, explanation: string): void => {
  if (!DEBUG_MODE || DEBUG_DETAIL_LEVEL < 3) return;
  
  logDebug(`TAX LAW REFERENCE: ${section}`, explanation, 3);
};

// Get church tax rate based on federal state
export const getChurchTaxRate = (state: FederalState): number => {
  if (state === FederalState.BAYERN || state === FederalState.BADEN_WUERTTEMBERG) {
    return CHURCH_TAX_RATES[state] || 0.09;
  }
  return 0.09;
};

// Exact income tax calculation according to §32a EStG 2025
export const calculateIncomeTax = (income: number): number => {
  // Round income down to nearest Euro as per tax law
  const roundedIncome = Math.floor(income);
  
  logDebug(`Calculating income tax for ${formatDebugCurrency(roundedIncome)}`);
  logTaxLawReference('§32a EStG', 'Income tax calculation according to German Income Tax Act §32a');

  if (roundedIncome <= TAX_BRACKETS.ZONE1_MAX) {
    // Basic tax-free allowance: No tax
    logDebug(`Income is within basic allowance (max: ${formatDebugCurrency(TAX_BRACKETS.ZONE1_MAX)}), tax = ${formatDebugCurrency(0)}`);
    logTaxLawReference('§32a (1) Nr. 1 EStG', 'Basic tax-free allowance, no tax on income up to this amount');
    return 0;
  } else if (roundedIncome <= TAX_BRACKETS.ZONE2_MAX) {
    // First progressive zone formula (2025): Tax = (932.30 * y + 1,400) * y 
    // where y = (income - 12,096) / 10,000
    const y = (roundedIncome - TAX_BRACKETS.ZONE1_MAX) / 10000;
    
    logTaxStep('First progressive zone calculation', { 
      income: formatDebugCurrency(roundedIncome),
      basicAllowance: formatDebugCurrency(TAX_BRACKETS.ZONE1_MAX),
      difference: formatDebugCurrency(roundedIncome - TAX_BRACKETS.ZONE1_MAX),
      y: y.toFixed(6),
      formula: '(932.30 * y + 1,400) * y'
    }, 2);
    
    const term1 = 932.30 * y;
    const term2 = term1 + 1400;
    const tax = Math.floor(term2 * y);
    
    logTaxStep('First progressive zone detailed steps', {
      term1: term1.toFixed(2),
      term2: term2.toFixed(2),
      result: formatDebugCurrency(tax)
    }, 3);
    
    logDebug(`Income is in first progressive zone (${formatDebugCurrency(TAX_BRACKETS.ZONE1_MAX)}-${formatDebugCurrency(TAX_BRACKETS.ZONE2_MAX)}), y=${y.toFixed(6)}, tax = ${formatDebugCurrency(tax)}`);
    logTaxLawReference('§32a (1) Nr. 2 EStG', 'First progressive zone formula: (932.30 * y + 1,400) * y');
    
    return tax;
  } else if (roundedIncome <= TAX_BRACKETS.ZONE3_MAX) {
    // Second progressive zone formula (2025): Tax = (176.64 * z + 2,397) * z + 1,015.13
    // where z = (income - 17,443) / 10,000
    const z = (roundedIncome - TAX_BRACKETS.ZONE2_MAX) / 10000;
    
    logTaxStep('Second progressive zone calculation', { 
      income: formatDebugCurrency(roundedIncome),
      zone2Max: formatDebugCurrency(TAX_BRACKETS.ZONE2_MAX),
      difference: formatDebugCurrency(roundedIncome - TAX_BRACKETS.ZONE2_MAX),
      z: z.toFixed(6),
      formula: '(176.64 * z + 2,397) * z + 1,015.13'
    }, 2);
    
    const term1 = 176.64 * z;
    const term2 = term1 + 2397;
    const term3 = term2 * z;
    const tax = Math.floor(term3 + 1015.13);
    
    logTaxStep('Second progressive zone detailed steps', {
      term1: term1.toFixed(2),
      term2: term2.toFixed(2),
      term3: term3.toFixed(2),
      result: formatDebugCurrency(tax)
    }, 3);
    
    logDebug(`Income is in second progressive zone (${formatDebugCurrency(TAX_BRACKETS.ZONE2_MAX)}-${formatDebugCurrency(TAX_BRACKETS.ZONE3_MAX)}), z=${z.toFixed(6)}, tax = ${formatDebugCurrency(tax)}`);
    logTaxLawReference('§32a (1) Nr. 3 EStG', 'Second progressive zone formula: (176.64 * z + 2,397) * z + 1,015.13');
    
    return tax;
  } else if (roundedIncome <= TAX_BRACKETS.ZONE4_MAX) {
    // First proportional zone formula (2025): Tax = 0.42 * income - 10,911.92
    logTaxStep('First proportional zone calculation', { 
      income: formatDebugCurrency(roundedIncome),
      rate: '42%',
      formula: '0.42 * income - 10,911.92'
    }, 2);
    
    const tax = Math.floor(0.42 * roundedIncome - 10911.92);
    
    logDebug(`Income is in first proportional zone (${formatDebugCurrency(TAX_BRACKETS.ZONE3_MAX)}-${formatDebugCurrency(TAX_BRACKETS.ZONE4_MAX)}), tax = ${formatDebugCurrency(tax)}`);
    logTaxLawReference('§32a (1) Nr. 4 EStG', 'First proportional zone with 42% tax rate');
    
    return tax;
  } else {
    // Second proportional zone formula (2025): Tax = 0.45 * income - 19,246.67
    logTaxStep('Second proportional zone calculation', { 
      income: formatDebugCurrency(roundedIncome),
      rate: '45%',
      formula: '0.45 * income - 19,246.67'
    }, 2);
    
    const tax = Math.floor(0.45 * roundedIncome - 19246.67);
    
    logDebug(`Income is in second proportional zone (above ${formatDebugCurrency(TAX_BRACKETS.ZONE4_MAX)}), tax = ${formatDebugCurrency(tax)}`);
    logTaxLawReference('§32a (1) Nr. 5 EStG', 'Second proportional zone with 45% tax rate');
    
    return tax;
  }
};

// Calculate income tax with joint assessment (proper splitting method)
export const calculateJointIncomeTax = (income: number): number => {
  logDebug(`Joint assessment calculation for total income: ${formatDebugCurrency(income)}`);
  logTaxLawReference('§32a (5) EStG', 'Income splitting method for joint assessment');
  
  // Apply the proper German splitting procedure:
  // 1. Divide the income by 2
  // 2. Calculate tax on this half
  // 3. Multiply the result by 2
  const halfIncome = income / 2;
  
  logTaxStep('Splitting step 1: Divide income by 2', {
    totalIncome: formatDebugCurrency(income),
    halfIncome: formatDebugCurrency(halfIncome)
  }, 2);
  
  const halfTax = calculateIncomeTax(halfIncome);
  
  logTaxStep('Splitting step 2: Calculate tax on half income', {
    halfIncome: formatDebugCurrency(halfIncome),
    halfTax: formatDebugCurrency(halfTax)
  }, 2);
  
  const totalTax = halfTax * 2;
  
  logTaxStep('Splitting step 3: Multiply the half-tax by 2', {
    halfTax: formatDebugCurrency(halfTax),
    totalTax: formatDebugCurrency(totalTax)
  }, 2);
  
  logDebug(`Joint assessment result: Income ${formatDebugCurrency(income)}, Half ${formatDebugCurrency(halfIncome)}, Half tax ${formatDebugCurrency(halfTax)}, Total tax ${formatDebugCurrency(totalTax)}`);
  
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
  
  logDebug(`Calculating solidarity surcharge for income tax ${formatDebugCurrency(incomeTax)}, joint assessment: ${isJointAssessment}`);
  logTaxLawReference('§4 SolZG', 'Solidarity surcharge calculation as per Solidarity Surcharge Act');
  
  if (incomeTax <= threshold) {
    logDebug(`  Income tax below threshold (${formatDebugCurrency(threshold)}), no solidarity surcharge`);
    return 0;
  }
  
  // Regular full rate
  const regularSoli = incomeTax * SOLIDARITY_THRESHOLDS.RATE;
  
  logTaxStep('Regular solidarity surcharge calculation', {
    incomeTax: formatDebugCurrency(incomeTax),
    rate: formatDebugPercentage(SOLIDARITY_THRESHOLDS.RATE),
    regularSoli: formatDebugCurrency(regularSoli)
  }, 2);
  
  // Check if in phase-in range for reduced rate
  if (incomeTax > phaseInStart && incomeTax <= phaseInEnd) {
    // Phase-in calculation: 20% of (income tax - exemption limit)
    const phaseInFactor = 0.2;
    const reducedSoli = phaseInFactor * (incomeTax - phaseInStart);
    
    logTaxStep('Phase-in range solidarity calculation', {
      incomeTax: formatDebugCurrency(incomeTax),
      phaseInStart: formatDebugCurrency(phaseInStart),
      phaseInEnd: formatDebugCurrency(phaseInEnd),
      difference: formatDebugCurrency(incomeTax - phaseInStart),
      phaseInFactor: formatDebugPercentage(phaseInFactor),
      reducedSoli: formatDebugCurrency(reducedSoli)
    }, 2);
    
    const finalSoli = Math.min(regularSoli, reducedSoli);
    logDebug(`  In phase-in range, regular: ${formatDebugCurrency(regularSoli)}, reduced: ${formatDebugCurrency(reducedSoli)}, final: ${formatDebugCurrency(finalSoli)}`);
    
    return Math.floor(finalSoli);
  }
  
  logDebug(`  Regular solidarity surcharge: ${formatDebugCurrency(regularSoli)}`);
  return Math.floor(regularSoli);
};

// Calculate church tax
export const calculateChurchTax = (incomeTax: number, isChurchMember: boolean, federalState: FederalState): number => {
  if (!isChurchMember) {
    logDebug(`Church tax: Person is not a church member, no church tax`);
    return 0;
  }
  
  // Get church tax rate for federal state (default to 9% if not found)
  const rate = CHURCH_TAX_RATES[federalState] || 0.09;
  
  logTaxStep('Church tax calculation', {
    incomeTax: formatDebugCurrency(incomeTax),
    federalState: federalState,
    rate: formatDebugPercentage(rate)
  }, 2);
  
  const churchTax = Math.floor(incomeTax * rate);
  logDebug(`Church tax for ${formatDebugCurrency(incomeTax)} in ${federalState}: ${formatDebugPercentage(rate)} = ${formatDebugCurrency(churchTax)}`);
  logTaxLawReference('KiStG', 'Church tax calculation based on federal state church tax laws');
  
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

// Helper function to test debugging output and create verification report
export const forceDebugTest = (): void => {
  console.warn("======== TAX ADVISOR VERIFICATION REPORT ========");
  console.warn("Generated:", new Date().toLocaleString());
  
  // Test DOM writing
  const debugElement = document.getElementById('debug-output');
  if (debugElement) {
    // Clear any existing content
    debugElement.innerHTML = '';
    
    // Add header for the tax report
    const reportHeader = document.createElement('div');
    reportHeader.className = 'p-3 bg-blue-50 border border-blue-300 mb-4';
    reportHeader.innerHTML = `
      <h3 class="text-lg font-bold text-blue-800 mb-2">Tax Calculation Verification Report</h3>
      <p class="text-sm mb-1">Generated: ${new Date().toLocaleString()}</p>
      <p class="text-sm mb-1">Tax Year: 2025</p>
      <p class="text-sm font-medium">This report contains detailed tax calculation data for verification by tax advisors.</p>
    `;
    debugElement.appendChild(reportHeader);
    
    // Add information about the tax calculation principles
    const principlesElement = document.createElement('div');
    principlesElement.className = 'p-3 bg-white border border-gray-300 mb-4';
    principlesElement.innerHTML = `
      <h4 class="font-bold mb-2">Calculation Principles</h4>
      <ul class="list-disc pl-5 space-y-1 text-sm">
        <li>Income tax calculation based on §32a EStG (2025 rates)</li>
        <li>Proper splitting method for joint assessment (§32a Abs. 5 EStG)</li>
        <li>Solidarity surcharge with correct phase-in range (§4 SolZG)</li>
        <li>Church tax rates according to federal state laws (8% or 9%)</li>
        <li>Progressive tax calculation with proper zone formulas</li>
        <li>GbR profit distribution based on partner shares</li>
        <li>Trade tax calculation for commercial GbR (if applicable)</li>
      </ul>
    `;
    debugElement.appendChild(principlesElement);
    
    // Add explanation about the two calculation approaches
    const methodsElement = document.createElement('div');
    methodsElement.className = 'p-3 bg-white border border-gray-300 mb-4';
    methodsElement.innerHTML = `
      <h4 class="font-bold mb-2">Tax Reserve Calculation Methods</h4>
      <div class="space-y-3 text-sm">
        <div>
          <h5 class="font-semibold text-blue-700">1. Individual Method (Default)</h5>
          <p>Each partner's tax is calculated based on their individual tax situation:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Base tax on individual income (without GbR)</li>
            <li>Total tax on combined income (with GbR share)</li>
            <li>Marginal tax rate applied to GbR income</li>
            <li>Partners may have different effective tax rates</li>
          </ul>
        </div>
        <div>
          <h5 class="font-semibold text-green-700">2. Equitable Method</h5>
          <p>All partners share the same effective tax rate on GbR income:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Total incremental tax burden calculated across all partners</li>
            <li>Collective effective tax rate applied equally to all partners</li>
            <li>Avoids the "tax paradox" where lower-income partners pay higher rates</li>
            <li>More equitable approach for partnership taxation</li>
          </ul>
        </div>
      </div>
    `;
    debugElement.appendChild(methodsElement);
    
    // Add test case data
    const testCaseElement = document.createElement('div');
    testCaseElement.className = 'p-3 bg-white border border-gray-300 mb-4';
    testCaseElement.innerHTML = `
      <h4 class="font-bold mb-2">Sample Test Case</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div class="border-r pr-4">
          <h5 class="font-semibold">Partner 1</h5>
          <table class="w-full">
            <tr><td class="py-1">Base Income:</td><td class="text-right font-medium">€40,000.00</td></tr>
            <tr><td class="py-1">Share:</td><td class="text-right font-medium">50%</td></tr>
            <tr><td class="py-1">Church Member:</td><td class="text-right font-medium">Yes</td></tr>
            <tr><td class="py-1">Joint Assessment:</td><td class="text-right font-medium">No</td></tr>
          </table>
        </div>
        <div>
          <h5 class="font-semibold">Partner 2</h5>
          <table class="w-full">
            <tr><td class="py-1">Base Income:</td><td class="text-right font-medium">€12,000.00</td></tr>
            <tr><td class="py-1">Share:</td><td class="text-right font-medium">50%</td></tr>
            <tr><td class="py-1">Church Member:</td><td class="text-right font-medium">Yes</td></tr>
            <tr><td class="py-1">Joint Assessment:</td><td class="text-right font-medium">No</td></tr>
          </table>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t">
        <h5 class="font-semibold">GbR Data</h5>
        <table class="w-full text-sm">
          <tr><td class="py-1">Monthly Profit:</td><td class="text-right font-medium">€5,000.00</td></tr>
          <tr><td class="py-1">Annual Profit:</td><td class="text-right font-medium">€60,000.00</td></tr>
          <tr><td class="py-1">Safety Margin:</td><td class="text-right font-medium">5%</td></tr>
          <tr><td class="py-1">GbR Type:</td><td class="text-right font-medium">Freelance</td></tr>
        </table>
      </div>
    `;
    debugElement.appendChild(testCaseElement);
  } else {
    console.warn("Debug element not found in DOM");
  }
  
  // Store current debug mode state
  const wasDebugMode = DEBUG_MODE;
  const previousDetailLevel = DEBUG_DETAIL_LEVEL;
  
  // Force highest detail level for the report
  DEBUG_MODE = true;
  DEBUG_DETAIL_LEVEL = 3;
  
  logDebug("========= TAX VERIFICATION REPORT =========");
  logDebug("Tax Year: 2025");
  logDebug("Report Date: " + new Date().toISOString());
  
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
  const gbrAnnualProfit = gbrMonthlyProfit * 12;
  const safetyMargin = 0.05;
  
  // Calculate annual GbR profit for each partner
  const partner1AnnualGbrProfit = gbrAnnualProfit * partner1Share;
  const partner2AnnualGbrProfit = gbrAnnualProfit * partner2Share;
  
  logDebug("======= INDIVIDUAL METHOD CALCULATION =======");
  
  logDebug("PARTNER 1 TAX CALCULATION", {
    baseIncome: formatDebugCurrency(partner1BaseIncome),
    gbrShare: partner1Share * 100 + "%",
    gbrProfit: formatDebugCurrency(partner1AnnualGbrProfit),
    totalIncome: formatDebugCurrency(partner1BaseIncome + partner1AnnualGbrProfit)
  });
  
  // Calculate tax for Partner 1
  const partner1Tax = calculateTaxReserve(
    partner1BaseIncome,
    partner1AnnualGbrProfit,
    partner1IsChurchMember,
    FederalState.NORDRHEIN_WESTFALEN,
    partner1IsJointAssessment,
    safetyMargin
  );
  
  logDebug("PARTNER 2 TAX CALCULATION", {
    baseIncome: formatDebugCurrency(partner2BaseIncome),
    gbrShare: partner2Share * 100 + "%",
    gbrProfit: formatDebugCurrency(partner2AnnualGbrProfit),
    totalIncome: formatDebugCurrency(partner2BaseIncome + partner2AnnualGbrProfit)
  });
  
  // Calculate tax for Partner 2
  const partner2Tax = calculateTaxReserve(
    partner2BaseIncome,
    partner2AnnualGbrProfit,
    partner2IsChurchMember,
    FederalState.NORDRHEIN_WESTFALEN,
    partner2IsJointAssessment,
    safetyMargin
  );
  
  // Show the tax paradox
  logDebug("======= TAX RATE PARADOX DEMONSTRATION =======");
  logDebug("This demonstrates why we need the equitable method:", {
    partner1: {
      baseIncome: formatDebugCurrency(partner1BaseIncome),
      effectiveTaxRate: formatDebugPercentage(partner1Tax.effectiveTaxRate),
      monthlyReserve: formatDebugCurrency(partner1Tax.effectiveTaxRate * partner1AnnualGbrProfit / 12)
    },
    partner2: {
      baseIncome: formatDebugCurrency(partner2BaseIncome),
      effectiveTaxRate: formatDebugPercentage(partner2Tax.effectiveTaxRate),
      monthlyReserve: formatDebugCurrency(partner2Tax.effectiveTaxRate * partner2AnnualGbrProfit / 12)
    },
    conclusion: "Income differences can lead to different effective rates when applying income tax progressively"
  });
  
  // Now calculate with the equitable method
  logDebug("======= EQUITABLE METHOD CALCULATION =======");
  
  // Convert to PartnerTaxData format
  const partnerTaxData: PartnerTaxData[] = [
    {
      id: "partner1",
      name: "Partner 1",
      yearlyIncome: partner1BaseIncome,
      share: partner1Share * 100,
      isChurchMember: partner1IsChurchMember,
      federalState: FederalState.NORDRHEIN_WESTFALEN,
      isJointAssessment: partner1IsJointAssessment
    },
    {
      id: "partner2",
      name: "Partner 2",
      yearlyIncome: partner2BaseIncome,
      share: partner2Share * 100,
      isChurchMember: partner2IsChurchMember,
      federalState: FederalState.NORDRHEIN_WESTFALEN,
      isJointAssessment: partner2IsJointAssessment
    }
  ];
  
  // Calculate with equitable method
  const equitableResults = calculateEquitableGbRTaxReserves(
    partnerTaxData,
    {
      gbrType: GbRType.FREELANCE,
      monthlyProfit: gbrMonthlyProfit,
      safetyMargin: safetyMargin
    }
  );
  
  // Summary for verification
  logDebug("======= VERIFICATION SUMMARY =======");
  logDebug("Individual Method Results:", {
    partner1: {
      effectiveTaxRate: formatDebugPercentage(partner1Tax.effectiveTaxRate),
      monthlyReserve: formatDebugCurrency(partner1Tax.effectiveTaxRate * partner1AnnualGbrProfit / 12)
    },
    partner2: {
      effectiveTaxRate: formatDebugPercentage(partner2Tax.effectiveTaxRate),
      monthlyReserve: formatDebugCurrency(partner2Tax.effectiveTaxRate * partner2AnnualGbrProfit / 12)
    },
    totalMonthlyReserve: formatDebugCurrency(
      (partner1Tax.effectiveTaxRate * partner1AnnualGbrProfit / 12) + 
      (partner2Tax.effectiveTaxRate * partner2AnnualGbrProfit / 12)
    )
  });
  
  logDebug("Equitable Method Results:", {
    collectiveEffectiveTaxRate: formatDebugPercentage(equitableResults.totalReservePercentage),
    partner1: {
      monthlyReserve: formatDebugCurrency(equitableResults.partnerReserves[0].reserveAmount + equitableResults.partnerReserves[0].safetyAmount)
    },
    partner2: {
      monthlyReserve: formatDebugCurrency(equitableResults.partnerReserves[1].reserveAmount + equitableResults.partnerReserves[1].safetyAmount)
    },
    totalMonthlyReserve: formatDebugCurrency(equitableResults.totalReserve)
  });
  
  // Add a verification table to the DOM report if possible
  if (debugElement) {
    const verificationTable = document.createElement('div');
    verificationTable.className = 'p-3 bg-green-50 border border-green-300 mb-4';
    verificationTable.innerHTML = `
      <h4 class="font-bold text-green-800 mb-2">Tax Calculation Verification Results</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="bg-green-100">
              <th class="py-2 px-3 text-left">Calculation Method</th>
              <th class="py-2 px-3 text-right">Partner 1 Rate</th>
              <th class="py-2 px-3 text-right">Partner 1 Reserve</th>
              <th class="py-2 px-3 text-right">Partner 2 Rate</th>
              <th class="py-2 px-3 text-right">Partner 2 Reserve</th>
              <th class="py-2 px-3 text-right">Total Monthly</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="py-2 px-3 font-medium">Individual Method</td>
              <td class="py-2 px-3 text-right">${formatDebugPercentage(partner1Tax.effectiveTaxRate)}</td>
              <td class="py-2 px-3 text-right">${formatDebugCurrency(partner1Tax.effectiveTaxRate * partner1AnnualGbrProfit / 12)}</td>
              <td class="py-2 px-3 text-right">${formatDebugPercentage(partner2Tax.effectiveTaxRate)}</td>
              <td class="py-2 px-3 text-right">${formatDebugCurrency(partner2Tax.effectiveTaxRate * partner2AnnualGbrProfit / 12)}</td>
              <td class="py-2 px-3 text-right font-medium">${formatDebugCurrency(
                (partner1Tax.effectiveTaxRate * partner1AnnualGbrProfit / 12) + 
                (partner2Tax.effectiveTaxRate * partner2AnnualGbrProfit / 12)
              )}</td>
            </tr>
            <tr>
              <td class="py-2 px-3 font-medium">Equitable Method</td>
              <td class="py-2 px-3 text-right">${formatDebugPercentage(equitableResults.totalReservePercentage)}</td>
              <td class="py-2 px-3 text-right">${formatDebugCurrency(equitableResults.partnerReserves[0].reserveAmount + equitableResults.partnerReserves[0].safetyAmount)}</td>
              <td class="py-2 px-3 text-right">${formatDebugPercentage(equitableResults.totalReservePercentage)}</td>
              <td class="py-2 px-3 text-right">${formatDebugCurrency(equitableResults.partnerReserves[1].reserveAmount + equitableResults.partnerReserves[1].safetyAmount)}</td>
              <td class="py-2 px-3 text-right font-medium">${formatDebugCurrency(equitableResults.totalReserve)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs italic text-gray-700">Note: With the equitable method, all partners share the same effective tax rate on GbR income regardless of their personal tax bracket.</p>
    `;
    debugElement.appendChild(verificationTable);
    
    // Add a disclaimer
    const disclaimer = document.createElement('div');
    disclaimer.className = 'p-3 bg-yellow-50 border border-yellow-300';
    disclaimer.innerHTML = `
      <h4 class="font-bold mb-2">Tax Advisor Verification Note</h4>
      <p class="text-sm">This report provides detailed calculation steps and results for verification by tax advisors.</p>
      <p class="text-sm mt-2">The calculated values are based on the 2025 income tax parameters according to §32a EStG.</p>
      <p class="text-sm mt-2">For a more detailed review of specific cases, please adjust the inputs and review the debug output with the highest detail level (3).</p>
      <p class="text-xs italic mt-3">This calculation is for informational purposes only and does not replace professional tax advice.</p>
    `;
    debugElement.appendChild(disclaimer);
  }
  
  // Reset debug mode to previous state
  DEBUG_MODE = wasDebugMode;
  DEBUG_DETAIL_LEVEL = previousDetailLevel;
};

// GbR Type enum for determining trade tax applicability
export enum GbRType {
  FREELANCE = 'freelance',  // Freiberufliche GbR (no trade tax)
  COMMERCIAL = 'commercial' // Gewerbliche GbR (with trade tax)
}

// Structure for GbR tax calculation parameters
export interface GbRTaxParameters {
  gbrType: GbRType;
  monthlyProfit: number;
  municipalityRate?: number; // Gewerbesteuer-Hebesatz
  safetyMargin: number;
  vatRegistered?: boolean;
  fiscalYearStart?: Date;
  fiscalYearEnd?: Date;
}

// Structure for extended partner data with tax-relevant information
export interface PartnerTaxData {
  id: string;
  name?: string;
  yearlyIncome: number;
  share: number;
  isChurchMember: boolean;
  federalState: FederalState;
  isJointAssessment: boolean;
  taxClass?: number; // 1-6 (Steuerklasse)
  additionalIncome?: number; // Other income beyond base income
  deductibleExpenses?: number; // Professional expenses
  isMarried?: boolean;
  hasSocialSecurityContributions?: boolean;
  socialSecurityAmount?: number;
  previousLosses?: number;
}

/**
 * Calculate tax reserves in an equitable way for GbR partners
 * This function treats GbR income equitably among partners rather than
 * calculating taxes individually for each partner.
 */
export const calculateEquitableGbRTaxReserves = (
  partners: PartnerTaxData[],
  gbrParams: GbRTaxParameters
): {
  totalReserve: number;
  totalReservePercentage: number;
  annualTaxBurden: number;
  partnerReserves: Array<{
    partnerId: string;
    partnerName: string;
    share: number;
    monthlyProfit: number;
    annualProfit: number;
    effectiveTaxRate: number;
    reserveAmount: number;
    safetyMargin: number;
    safetyAmount: number;
  }>;
} => {
  logDebug(`===== STARTING EQUITABLE GBR TAX CALCULATION =====`);
  logDebug(`GbR Type: ${gbrParams.gbrType}, Monthly Profit: €${gbrParams.monthlyProfit}`);
  logDebug(`Safety Margin: ${gbrParams.safetyMargin * 100}%`);
  
  // 1. Calculate annual GbR profit
  const annualGbRProfit = gbrParams.monthlyProfit * 12;
  
  // 2. Calculate trade tax if applicable (commercial GbR)
  let tradeTaxAmount = 0;
  if (gbrParams.gbrType === GbRType.COMMERCIAL && gbrParams.municipalityRate) {
    const tradeBaseRate = 0.035; // 3.5%
    const tradeTaxAllowance = 24500; // €24,500 allowance
    const tradeTaxBase = Math.max(0, annualGbRProfit - tradeTaxAllowance);
    tradeTaxAmount = tradeTaxBase * tradeBaseRate * (gbrParams.municipalityRate / 100);
    logDebug(`Trade Tax: Base: €${tradeTaxBase}, Rate: ${tradeBaseRate * gbrParams.municipalityRate / 100}, Amount: €${tradeTaxAmount}`);
  }
  
  // 3. Now we'll calculate the average tax rate on GbR income ACROSS ALL PARTNERS
  //    instead of individually for each partner
  
  // For each partner, calculate what their tax would be with and without GbR income
  let totalIncrementalTax = 0;
  let totalGbRIncome = 0;
  
  partners.forEach(partner => {
    // Partner's share of annual GbR profit
    const partnerAnnualGbRProfit = annualGbRProfit * (partner.share / 100);
    totalGbRIncome += partnerAnnualGbRProfit;
    
    // Calculate base income tax (without GbR income)
    const baseIncome = partner.yearlyIncome;
    const baseTax = partner.isJointAssessment
      ? calculateJointIncomeTax(baseIncome)
      : calculateIncomeTax(baseIncome);
    
    // Calculate base solidarity surcharge
    const baseSoli = calculateSolidaritySurcharge(baseTax, partner.isJointAssessment);
    
    // Calculate base church tax
    const baseChurchTax = calculateChurchTax(baseTax, partner.isChurchMember, partner.federalState);
    
    // Total base tax
    const totalBaseTax = baseTax + baseSoli + baseChurchTax;
    
    // Calculate total income tax (with GbR income)
    const totalIncome = baseIncome + partnerAnnualGbRProfit;
    const totalTax = partner.isJointAssessment
      ? calculateJointIncomeTax(totalIncome)
      : calculateIncomeTax(totalIncome);
    
    // Calculate total solidarity surcharge
    const totalSoli = calculateSolidaritySurcharge(totalTax, partner.isJointAssessment);
    
    // Calculate total church tax
    const totalChurchTax = calculateChurchTax(totalTax, partner.isChurchMember, partner.federalState);
    
    // Total tax with GbR income
    const totalTaxWithGbR = totalTax + totalSoli + totalChurchTax;
    
    // Incremental tax due to GbR income
    const incrementalTax = totalTaxWithGbR - totalBaseTax;
    totalIncrementalTax += incrementalTax;
    
    logDebug(`Partner ${partner.name || partner.id}: Base Income: €${baseIncome}, GbR Income: €${partnerAnnualGbRProfit}`);
    logDebug(`  Base Tax: €${totalBaseTax}, Total Tax: €${totalTaxWithGbR}, Incremental: €${incrementalTax}`);
  });
  
  // 4. Calculate the COLLECTIVE effective tax rate for GbR income
  const collectiveEffectiveTaxRate = totalGbRIncome > 0 
    ? totalIncrementalTax / totalGbRIncome 
    : 0;
  
  logDebug(`GbR Collective Tax: Total Income: €${totalGbRIncome}, Total Tax: €${totalIncrementalTax}`);
  logDebug(`Collective Effective Tax Rate: ${(collectiveEffectiveTaxRate * 100).toFixed(2)}%`);
  
  // 5. Add trade tax share to the total tax burden if applicable
  const totalTaxBurden = totalIncrementalTax + tradeTaxAmount;
  
  // 6. Calculate the final effective tax rate including trade tax
  const finalEffectiveTaxRate = totalGbRIncome > 0 
    ? totalTaxBurden / totalGbRIncome 
    : 0;
  
  logDebug(`Final Tax with Trade Tax: €${totalTaxBurden}`);
  logDebug(`Final Effective Tax Rate: ${(finalEffectiveTaxRate * 100).toFixed(2)}%`);
  
  // 7. Apply safety margin to the effective tax rate
  const effectiveTaxRateWithSafety = finalEffectiveTaxRate * (1 + gbrParams.safetyMargin);
  
  logDebug(`Tax Rate with Safety Margin (${gbrParams.safetyMargin * 100}%): ${(effectiveTaxRateWithSafety * 100).toFixed(2)}%`);
  
  // 8. Calculate reserves for each partner using the SAME EQUITABLE TAX RATE
  const partnerReserves = partners.map(partner => {
    // Partner's share of monthly and annual GbR profit
    const share = partner.share;
    const monthlyPartnerProfit = gbrParams.monthlyProfit * (share / 100);
    const annualPartnerProfit = monthlyPartnerProfit * 12;
    
    // Reserve amount using the collective effective tax rate (with safety margin)
    // This ensures all partners pay the same effective tax rate on their GbR income
    const rawReserveAmount = monthlyPartnerProfit * finalEffectiveTaxRate;
    const safetyAmount = rawReserveAmount * gbrParams.safetyMargin;
    const reserveAmount = rawReserveAmount + safetyAmount;
    
    logDebug(`Partner ${partner.name || partner.id}: Share: ${share}%, Monthly Profit: €${monthlyPartnerProfit}`);
    logDebug(`  Raw Reserve: €${rawReserveAmount}, Safety: €${safetyAmount}, Total: €${reserveAmount}`);
    
    return {
      partnerId: partner.id,
      partnerName: partner.name || `Partner ${partner.id.substring(0, 4)}`,
      share,
      monthlyProfit: monthlyPartnerProfit,
      annualProfit: annualPartnerProfit,
      effectiveTaxRate: finalEffectiveTaxRate,
      reserveAmount: rawReserveAmount,
      safetyMargin: gbrParams.safetyMargin,
      safetyAmount: safetyAmount
    };
  });
  
  // 9. Calculate total monthly reserve
  const totalMonthlyReserve = partnerReserves.reduce(
    (sum, reserve) => sum + reserve.reserveAmount + reserve.safetyAmount, 
    0
  );
  
  // 10. Calculate total reserve percentage
  const totalReservePercentage = gbrParams.monthlyProfit > 0 
    ? totalMonthlyReserve / gbrParams.monthlyProfit 
    : 0;
  
  // 11. Calculate annual tax burden
  const annualTaxBurden = totalMonthlyReserve * 12;
  
  logDebug(`Total Monthly Reserve: €${totalMonthlyReserve}`);
  logDebug(`Total Reserve Percentage: ${(totalReservePercentage * 100).toFixed(2)}%`);
  logDebug(`Annual Tax Burden: €${annualTaxBurden}`);
  
  return {
    totalReserve: totalMonthlyReserve,
    totalReservePercentage,
    annualTaxBurden,
    partnerReserves
  };
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
  console.warn("calculateTaxReserve called - DEBUG_MODE is:", DEBUG_MODE, "DETAIL_LEVEL:", DEBUG_DETAIL_LEVEL);
  
  logDebug(`===== STARTING TAX CALCULATION =====`);
  logDebug(`Tax calculation for individual with following parameters:`);
  logDebug(`Base income: ${formatDebugCurrency(baseIncome)}, GbR income: ${formatDebugCurrency(gbrIncome)}`);
  logDebug(`Church member: ${isChurchMember}, Federal state: ${federalState}`);
  logDebug(`Joint assessment: ${isJointAssessment}, Safety margin: ${formatDebugPercentage(safetyMargin)}`);
  
  // Add tax advisor verification section
  logDebug(`----- TAX ADVISOR VERIFICATION DATA -----`);
  logDebug(`Calculation Date: ${new Date().toISOString()}`);
  logDebug(`Tax Year: 2025`);
  logDebug(`Input Parameters: Base Income=${formatDebugCurrency(baseIncome)}, GbR Income=${formatDebugCurrency(gbrIncome)}, Total=${formatDebugCurrency(baseIncome + gbrIncome)}`);
  logDebug(`Assessment Type: ${isJointAssessment ? 'Joint (Splitting)' : 'Individual'}`);
  logDebug(`Church Tax: ${isChurchMember ? `Yes (${federalState}, ${formatDebugPercentage(CHURCH_TAX_RATES[federalState] || 0.09)})` : 'No'}`);
  
  // Detailed calculation steps start here
  // For joint assessment, use the proper splitting method
  if (isJointAssessment) {
    logDebug(`Using joint assessment (splitting method) according to §32a (5) EStG`);
    
    // Calculate income tax on base income (without GbR) - proper splitting method
    const baseTaxAmount = calculateJointIncomeTax(baseIncome);
    logDebug(`Base tax (joint assessment): ${formatDebugCurrency(baseTaxAmount)}`);
    
    // Calculate income tax on total income (with GbR) - proper splitting method
    const totalTaxAmount = calculateJointIncomeTax(baseIncome + gbrIncome);
    logDebug(`Total tax (joint assessment): ${formatDebugCurrency(totalTaxAmount)}`);
    
    // Calculate the additional tax due to GbR income
    const additionalTaxAmount = totalTaxAmount - baseTaxAmount;
    logDebug(`Additional income tax due to GbR income: ${formatDebugCurrency(additionalTaxAmount)}`);
    
    // Calculate base solidarity surcharge (without GbR)
    const baseSoli = calculateSolidaritySurcharge(baseTaxAmount, true);
    logDebug(`Base solidarity surcharge: ${formatDebugCurrency(baseSoli)}`);
    
    // Calculate total solidarity surcharge (with GbR)
    const totalSoli = calculateSolidaritySurcharge(totalTaxAmount, true);
    logDebug(`Total solidarity surcharge: ${formatDebugCurrency(totalSoli)}`);
    
    // Calculate the additional solidarity surcharge due to GbR income
    const solidaritySurcharge = totalSoli - baseSoli;
    logDebug(`Additional solidarity surcharge due to GbR income: ${formatDebugCurrency(solidaritySurcharge)}`);
    
    // Calculate base church tax (without GbR)
    const baseChurchTax = calculateChurchTax(baseTaxAmount, isChurchMember, federalState);
    logDebug(`Base church tax: ${formatDebugCurrency(baseChurchTax)}`);
    
    // Calculate total church tax (with GbR)
    const totalChurchTax = calculateChurchTax(totalTaxAmount, isChurchMember, federalState);
    logDebug(`Total church tax: ${formatDebugCurrency(totalChurchTax)}`);
    
    // Calculate the additional church tax due to GbR income
    const churchTax = totalChurchTax - baseChurchTax;
    logDebug(`Additional church tax due to GbR income: ${formatDebugCurrency(churchTax)}`);
    
    // Calculate total additional tax (income tax + solidarity surcharge + church tax)
    const totalTax = additionalTaxAmount + solidaritySurcharge + churchTax;
    logDebug(`Total additional tax due to GbR income: ${formatDebugCurrency(totalTax)}`);
    
    // Use improved marginal tax rate calculation - pass true for joint assessment
    const marginalTaxRate = calculateMarginalTaxRate(baseIncome, gbrIncome, true);
    logDebug(`Marginal tax rate: ${formatDebugPercentage(marginalTaxRate)}`);
    
    // Calculate raw tax amount (without safety margin)
    const rawTaxAmount = gbrIncome * marginalTaxRate;
    logDebug(`Raw tax amount (without safety margin): ${formatDebugCurrency(rawTaxAmount)}`);
    
    // Apply safety margin to the amount (not the rate)
    const reserveAmount = rawTaxAmount * (1 + safetyMargin);
    logDebug(`Reserve amount (with safety margin): ${formatDebugCurrency(reserveAmount)}`);
    
    // Calculate effective tax rate (for backward compatibility)
    const effectiveTaxRate = gbrIncome > 0 ? reserveAmount / gbrIncome : 0;
    logDebug(`Effective tax rate (with safety margin): ${formatDebugPercentage(effectiveTaxRate)}`);
    
    // Calculate monthly amounts for reference
    const monthlyGbrIncome = gbrIncome / 12;
    const monthlyReserve = reserveAmount / 12;
    logDebug(`Monthly GbR income: ${formatDebugCurrency(monthlyGbrIncome)}, Monthly reserve: ${formatDebugCurrency(monthlyReserve)}`);
    
    // Tax summary for verification
    logDebug(`----- TAX CALCULATION SUMMARY -----`);
    logDebug(`Base Income: ${formatDebugCurrency(baseIncome)}, GbR Income: ${formatDebugCurrency(gbrIncome)}, Total: ${formatDebugCurrency(baseIncome + gbrIncome)}`);
    logDebug(`Base Tax: ${formatDebugCurrency(baseTaxAmount)}, Total Tax: ${formatDebugCurrency(totalTaxAmount)}, Difference: ${formatDebugCurrency(additionalTaxAmount)}`);
    logDebug(`Additional Taxes due to GbR income:`);
    logDebug(`- Income Tax: ${formatDebugCurrency(additionalTaxAmount)}`);
    logDebug(`- Solidarity Surcharge: ${formatDebugCurrency(solidaritySurcharge)}`);
    logDebug(`- Church Tax: ${formatDebugCurrency(churchTax)}`);
    logDebug(`Total Additional Tax: ${formatDebugCurrency(totalTax)}`);
    logDebug(`Marginal Tax Rate: ${formatDebugPercentage(marginalTaxRate)}`);
    logDebug(`Effective Tax Rate with Safety Margin: ${formatDebugPercentage(effectiveTaxRate)}`);
    
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
    logDebug(`Using individual assessment according to §32a (1) EStG`);
    
    // Calculate income tax on base income (without GbR)
    const baseTaxAmount = calculateIncomeTax(baseIncome);
    logDebug(`Base tax (individual): ${formatDebugCurrency(baseTaxAmount)}`);
    
    // Calculate income tax on total income (with GbR)
    const totalTaxAmount = calculateIncomeTax(baseIncome + gbrIncome);
    logDebug(`Total tax (individual): ${formatDebugCurrency(totalTaxAmount)}`);
    
    // Calculate the additional tax due to GbR income
    const additionalTaxAmount = totalTaxAmount - baseTaxAmount;
    logDebug(`Additional income tax due to GbR income: ${formatDebugCurrency(additionalTaxAmount)}`);
    
    // Calculate base solidarity surcharge (without GbR)
    const baseSoli = calculateSolidaritySurcharge(baseTaxAmount, false);
    logDebug(`Base solidarity surcharge: ${formatDebugCurrency(baseSoli)}`);
    
    // Calculate total solidarity surcharge (with GbR)
    const totalSoli = calculateSolidaritySurcharge(totalTaxAmount, false);
    logDebug(`Total solidarity surcharge: ${formatDebugCurrency(totalSoli)}`);
    
    // Calculate the additional solidarity surcharge due to GbR income
    const solidaritySurcharge = totalSoli - baseSoli;
    logDebug(`Additional solidarity surcharge due to GbR income: ${formatDebugCurrency(solidaritySurcharge)}`);
    
    // Calculate base church tax (without GbR)
    const baseChurchTax = calculateChurchTax(baseTaxAmount, isChurchMember, federalState);
    logDebug(`Base church tax: ${formatDebugCurrency(baseChurchTax)}`);
    
    // Calculate total church tax (with GbR)
    const totalChurchTax = calculateChurchTax(totalTaxAmount, isChurchMember, federalState);
    logDebug(`Total church tax: ${formatDebugCurrency(totalChurchTax)}`);
    
    // Calculate the additional church tax due to GbR income
    const churchTax = totalChurchTax - baseChurchTax;
    logDebug(`Additional church tax due to GbR income: ${formatDebugCurrency(churchTax)}`);
    
    // Calculate total additional tax (income tax + solidarity surcharge + church tax)
    const totalTax = additionalTaxAmount + solidaritySurcharge + churchTax;
    logDebug(`Total additional tax due to GbR income: ${formatDebugCurrency(totalTax)}`);
    
    // Use improved marginal tax rate calculation
    const marginalTaxRate = calculateMarginalTaxRate(baseIncome, gbrIncome, false);
    logDebug(`Marginal tax rate: ${formatDebugPercentage(marginalTaxRate)}`);
    
    // Calculate raw tax amount (without safety margin)
    const rawTaxAmount = gbrIncome * marginalTaxRate;
    logDebug(`Raw tax amount (without safety margin): ${formatDebugCurrency(rawTaxAmount)}`);
    
    // Apply safety margin to the amount (not the rate)
    const reserveAmount = rawTaxAmount * (1 + safetyMargin);
    logDebug(`Reserve amount (with safety margin): ${formatDebugCurrency(reserveAmount)}`);
    
    // Calculate effective tax rate (for backward compatibility)
    const effectiveTaxRate = gbrIncome > 0 ? reserveAmount / gbrIncome : 0;
    logDebug(`Effective tax rate (with safety margin): ${formatDebugPercentage(effectiveTaxRate)}`);
    
    // Calculate monthly amounts for reference
    const monthlyGbrIncome = gbrIncome / 12;
    const monthlyReserve = reserveAmount / 12;
    logDebug(`Monthly GbR income: ${formatDebugCurrency(monthlyGbrIncome)}, Monthly reserve: ${formatDebugCurrency(monthlyReserve)}`);
    
    // Tax summary for verification
    logDebug(`----- TAX CALCULATION SUMMARY -----`);
    logDebug(`Base Income: ${formatDebugCurrency(baseIncome)}, GbR Income: ${formatDebugCurrency(gbrIncome)}, Total: ${formatDebugCurrency(baseIncome + gbrIncome)}`);
    logDebug(`Base Tax: ${formatDebugCurrency(baseTaxAmount)}, Total Tax: ${formatDebugCurrency(totalTaxAmount)}, Difference: ${formatDebugCurrency(additionalTaxAmount)}`);
    logDebug(`Additional Taxes due to GbR income:`);
    logDebug(`- Income Tax: ${formatDebugCurrency(additionalTaxAmount)}`);
    logDebug(`- Solidarity Surcharge: ${formatDebugCurrency(solidaritySurcharge)}`);
    logDebug(`- Church Tax: ${formatDebugCurrency(churchTax)}`);
    logDebug(`Total Additional Tax: ${formatDebugCurrency(totalTax)}`);
    logDebug(`Marginal Tax Rate: ${formatDebugPercentage(marginalTaxRate)}`);
    logDebug(`Effective Tax Rate with Safety Margin: ${formatDebugPercentage(effectiveTaxRate)}`);
    
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