export interface TranslationKeys {
  // General
  appTitle: string;
  calculatorTitle: string;
  taxYear: string;
  taxYearLabel: string;
  disclaimer: string;
  
  // Partner Section
  partnerSectionTitle: string;
  partnerDetailsLabel: string;
  addPartnerButton: string;
  removePartnerButton: string;
  removePartnerLabel: string;
  nameLabel: string;
  partnerNameLabel: string;
  partnerNamePlaceholder: string;
  yearlyIncomeLabel: string;
  yearlyIncomeHint: string;
  profitShareLabel: string;
  shareLabel: string;
  
  // GbR Section
  gbrSectionTitle: string;
  monthlyProfitLabel: string;
  
  // GbR Type Section
  gbrTypeLabel: string;
  freelanceGbRLabel: string;
  commercialGbRLabel: string;
  municipalityRateLabel: string;
  municipalityRateHint: string;
  
  // Equitable Calculation
  equitableCalculationOn: string;
  equitableCalculationOff: string;
  
  // Advanced Settings
  advancedSettingsToggle: string;
  advancedSettingsLabel: string;
  basicSettingsLabel: string;
  safetyMarginLabel: string;
  safetyMarginDescription: string;
  
  // Church & Tax Settings
  churchMemberLabel: string;
  federalStateLabel: string;
  federalStateHint: string;
  jointAssessmentLabel: string;
  jointAssessmentHint: string;
  
  // Results
  resultTitle: string;
  totalReserveTitle: string;
  calculateButton: string;
  resetButton: string;
  percentageLabel: string;
  monthlyAmountLabel: string;
  annualTaxBurdenLabel: string;
  effectiveTaxRateLabel: string;
  monthlyReserveLabel: string;
  profitLabel: string;
  safetyMarginAmountLabel: string;
  
  // Tax Details
  taxDetailsLabel: string;
  annualProfitLabel: string;
  baseTaxLabel: string;
  totalTaxLabel: string;
  additionalTaxLabel: string;
  incomeTaxLabel: string;
  solidaritySurchargeLabel: string;
  churchTaxLabel: string;
  
  // Export
  exportLabel: string;
  exportCSVLabel: string;
  exportJSONLabel: string;
  exportPDFLabel: string;
  
  // Debug
  debugModeLabel: string;
}

export const translations: { de: TranslationKeys; en: TranslationKeys } = {
  de: {
    // General
    appTitle: 'Steuerrücklagenrechner für GbR',
    calculatorTitle: 'Steuerrücklagenrechner',
    taxYear: '2025',
    taxYearLabel: 'Steuerjahr',
    disclaimer: 'Hinweis: Diese Berechnung dient nur zu Informationszwecken und ersetzt keine steuerliche Beratung.',
    
    // Partner Section
    partnerSectionTitle: 'Partner',
    partnerDetailsLabel: 'Partner Details',
    addPartnerButton: 'Partner hinzufügen',
    removePartnerButton: 'Entfernen',
    removePartnerLabel: 'Partner entfernen',
    nameLabel: 'Name',
    partnerNameLabel: 'Name',
    partnerNamePlaceholder: 'Partnername eingeben',
    yearlyIncomeLabel: 'Jahreseinkommen',
    yearlyIncomeHint: 'Erwartetes Jahreseinkommen ohne GbR-Anteil',
    profitShareLabel: 'Gewinnanteil',
    shareLabel: 'Anteil',
    
    // GbR Section
    gbrSectionTitle: 'GbR-Daten',
    monthlyProfitLabel: 'Monatlicher Gewinn',
    
    // GbR Type Section
    gbrTypeLabel: 'GbR-Typ',
    freelanceGbRLabel: 'Freiberufliche GbR',
    commercialGbRLabel: 'Gewerbliche GbR',
    municipalityRateLabel: 'Gewerbesteuer-Hebesatz',
    municipalityRateHint: 'Typischerweise zwischen 300% und 600%',
    
    // Equitable Calculation
    equitableCalculationOn: 'Gerechte Berechnung: EIN',
    equitableCalculationOff: 'Gerechte Berechnung: AUS',
    
    // Advanced Settings
    advancedSettingsToggle: 'Erweiterte Einstellungen',
    advancedSettingsLabel: 'Erweiterte Einstellungen',
    basicSettingsLabel: 'Basis-Einstellungen',
    safetyMarginLabel: 'Sicherheitspuffer',
    safetyMarginDescription: 'Zusätzlicher Puffer für Steuerrücklagen',
    
    // Church & Tax Settings
    churchMemberLabel: 'Kirchenmitglied',
    federalStateLabel: 'Bundesland',
    federalStateHint: 'Für korrekte Kirchensteuerberechnung',
    jointAssessmentLabel: 'Zusammenveranlagung',
    jointAssessmentHint: 'Für Ehepaare mit gemeinsamer Steuererklärung (Splittingtarif)',
    
    // Results
    resultTitle: 'Steuerrücklagen',
    totalReserveTitle: 'Gesamt-Steuerrücklage',
    calculateButton: 'Berechnen',
    resetButton: 'Zurücksetzen',
    percentageLabel: 'Prozentsatz',
    monthlyAmountLabel: 'Monatlicher Betrag',
    annualTaxBurdenLabel: 'Jährliche Steuerlast',
    effectiveTaxRateLabel: 'Effektiver Steuersatz',
    monthlyReserveLabel: 'Monatliche Rücklage',
    profitLabel: 'Gewinn',
    safetyMarginAmountLabel: 'Sicherheitspuffer',
    
    // Tax Details
    taxDetailsLabel: 'Steuerdetails',
    annualProfitLabel: 'Jährlicher GbR-Gewinn',
    baseTaxLabel: 'Grundsteuer (ohne GbR)',
    totalTaxLabel: 'Gesamtsteuer',
    additionalTaxLabel: 'Zusätzliche Steuer',
    incomeTaxLabel: 'Einkommensteuer',
    solidaritySurchargeLabel: 'Solidaritätszuschlag',
    churchTaxLabel: 'Kirchensteuer',
    
    // Export
    exportLabel: 'Exportieren',
    exportCSVLabel: 'Als CSV exportieren',
    exportJSONLabel: 'Als JSON exportieren',
    exportPDFLabel: 'Als PDF exportieren',
    
    // Debug
    debugModeLabel: 'Debug-Modus'
  },
  
  en: {
    // General
    appTitle: 'Tax Reserve Calculator for GbR',
    calculatorTitle: 'Tax Reserve Calculator',
    taxYear: '2025',
    taxYearLabel: 'Tax Year',
    disclaimer: 'Note: This calculation is for informational purposes only and does not replace tax advice.',
    
    // Partner Section
    partnerSectionTitle: 'Partner',
    partnerDetailsLabel: 'Partner Details',
    addPartnerButton: 'Add Partner',
    removePartnerButton: 'Remove',
    removePartnerLabel: 'Remove Partner',
    nameLabel: 'Name',
    partnerNameLabel: 'Name',
    partnerNamePlaceholder: 'Enter partner name',
    yearlyIncomeLabel: 'Yearly Income',
    yearlyIncomeHint: 'Expected yearly income without GbR share',
    profitShareLabel: 'Profit Share',
    shareLabel: 'Share',
    
    // GbR Section
    gbrSectionTitle: 'GbR Data',
    monthlyProfitLabel: 'Monthly Profit',
    
    // GbR Type Section
    gbrTypeLabel: 'GbR Type',
    freelanceGbRLabel: 'Freelance GbR',
    commercialGbRLabel: 'Commercial GbR',
    municipalityRateLabel: 'Trade Tax Rate',
    municipalityRateHint: 'Typically between 300% and 600%',
    
    // Equitable Calculation
    equitableCalculationOn: 'Equitable Calculation: ON',
    equitableCalculationOff: 'Equitable Calculation: OFF',
    
    // Advanced Settings
    advancedSettingsToggle: 'Advanced Settings',
    advancedSettingsLabel: 'Advanced Settings',
    basicSettingsLabel: 'Basic Settings',
    safetyMarginLabel: 'Safety Margin',
    safetyMarginDescription: 'Additional buffer for tax reserves',
    
    // Church & Tax Settings
    churchMemberLabel: 'Church Member',
    federalStateLabel: 'Federal State',
    federalStateHint: 'For correct church tax calculation',
    jointAssessmentLabel: 'Joint Assessment',
    jointAssessmentHint: 'For married couples filing jointly (splitting tariff)',
    
    // Results
    resultTitle: 'Tax Reserves',
    totalReserveTitle: 'Total Tax Reserve',
    calculateButton: 'Calculate',
    resetButton: 'Reset',
    percentageLabel: 'Percentage',
    monthlyAmountLabel: 'Monthly Amount',
    annualTaxBurdenLabel: 'Annual Tax Burden',
    effectiveTaxRateLabel: 'Effective Tax Rate',
    monthlyReserveLabel: 'Monthly Reserve',
    profitLabel: 'Profit',
    safetyMarginAmountLabel: 'Safety Margin',
    
    // Tax Details
    taxDetailsLabel: 'Tax Details',
    annualProfitLabel: 'Annual GbR Profit',
    baseTaxLabel: 'Base Tax (without GbR)',
    totalTaxLabel: 'Total Tax',
    additionalTaxLabel: 'Additional Tax',
    incomeTaxLabel: 'Income Tax',
    solidaritySurchargeLabel: 'Solidarity Surcharge',
    churchTaxLabel: 'Church Tax',
    
    // Export
    exportLabel: 'Export',
    exportCSVLabel: 'Export as CSV',
    exportJSONLabel: 'Export as JSON',
    exportPDFLabel: 'Export as PDF',
    
    // Debug
    debugModeLabel: 'Debug Mode'
  }
}; 