export type TranslationKeys = {
  // General
  appTitle: string;
  calculatorTitle: string;
  taxYear: string;
  
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
  
  // Tax Details
  taxDetailsLabel: string;
  annualProfitLabel: string;
  baseTaxLabel: string;
  totalTaxLabel: string;
  additionalTaxLabel: string;
  incomeTaxLabel: string;
  solidaritySurchargeLabel: string;
  churchTaxLabel: string;
  
  // Tax Bracket Visualization
  taxBracketVisualizationTitle: string;
  basicAllowanceLabel: string;
  progressiveZoneLabel: string;
  proportionalZone1Label: string;
  proportionalZone2Label: string;
  
  // Export
  exportCSV: string;
  exportJSON: string;
  exportPDF: string;
  
  // Settings
  settingsLabel: string;
  languageLabel: string;
  taxYearLabel: string;
  
  // Disclaimer
  disclaimer: string;
};

export const translations: { de: TranslationKeys; en: TranslationKeys } = {
  de: {
    // General
    appTitle: 'Steuerrücklagenberechner für GbR',
    calculatorTitle: 'Steuerrücklagenberechner',
    taxYear: '2025',
    
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
    yearlyIncomeHint: 'Voraussichtliches Jahreseinkommen ohne GbR-Anteil',
    profitShareLabel: 'Gewinnanteil',
    shareLabel: 'Anteil',
    
    // GbR Section
    gbrSectionTitle: 'GbR Daten',
    monthlyProfitLabel: 'Monatlicher Gewinn',
    
    // Advanced Settings
    advancedSettingsToggle: 'Erweiterte Einstellungen',
    advancedSettingsLabel: 'Erweiterte Einstellungen',
    basicSettingsLabel: 'Grundeinstellungen',
    safetyMarginLabel: 'Sicherheitspuffer',
    safetyMarginDescription: 'Zusätzlicher Puffer für Steuerrücklagen',
    
    // Church & Tax Settings
    churchMemberLabel: 'Kirchenmitglied',
    federalStateLabel: 'Bundesland',
    federalStateHint: 'Für die korrekte Kirchensteuer',
    jointAssessmentLabel: 'Zusammenveranlagung',
    jointAssessmentHint: 'Für verheiratete Paare mit Zusammenveranlagung (Splitting-Tarif)',
    
    // Results
    resultTitle: 'Steuerrücklagen',
    totalReserveTitle: 'Gesamte Steuerrücklage',
    calculateButton: 'Berechnen',
    resetButton: 'Zurücksetzen',
    percentageLabel: 'Prozentsatz',
    monthlyAmountLabel: 'Monatlicher Betrag',
    annualTaxBurdenLabel: 'Jährliche Steuerlast',
    effectiveTaxRateLabel: 'Effektiver Steuersatz',
    monthlyReserveLabel: 'Monatliche Rücklage',
    profitLabel: 'Gewinn',
    
    // Tax Details
    taxDetailsLabel: 'Steuerdetails',
    annualProfitLabel: 'Jahresgewinn GbR',
    baseTaxLabel: 'Grundsteuer (ohne GbR)',
    totalTaxLabel: 'Gesamtsteuer',
    additionalTaxLabel: 'Zusätzliche Steuer',
    incomeTaxLabel: 'Einkommensteuer',
    solidaritySurchargeLabel: 'Solidaritätszuschlag',
    churchTaxLabel: 'Kirchensteuer',
    
    // Tax Bracket Visualization
    taxBracketVisualizationTitle: 'Steuerklassen-Visualisierung',
    basicAllowanceLabel: 'Grundfreibetrag',
    progressiveZoneLabel: 'Progressive Zone',
    proportionalZone1Label: '42% Zone',
    proportionalZone2Label: '45% Zone',
    
    // Export
    exportCSV: 'Als CSV exportieren',
    exportJSON: 'Als JSON exportieren',
    exportPDF: 'Als PDF exportieren',
    
    // Settings
    settingsLabel: 'Einstellungen',
    languageLabel: 'Sprache',
    taxYearLabel: 'Steuerjahr',
    
    // Disclaimer
    disclaimer: 'Diese Berechnung dient nur als Richtwert. Bitte konsultieren Sie einen Steuerberater für verbindliche Auskünfte.'
  },
  en: {
    // General
    appTitle: 'Tax Reserve Calculator for GbR',
    calculatorTitle: 'Tax Reserve Calculator',
    taxYear: '2025',
    
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
    
    // Tax Details
    taxDetailsLabel: 'Tax Details',
    annualProfitLabel: 'Annual GbR Profit',
    baseTaxLabel: 'Base Tax (without GbR)',
    totalTaxLabel: 'Total Tax',
    additionalTaxLabel: 'Additional Tax',
    incomeTaxLabel: 'Income Tax',
    solidaritySurchargeLabel: 'Solidarity Surcharge',
    churchTaxLabel: 'Church Tax',
    
    // Tax Bracket Visualization
    taxBracketVisualizationTitle: 'Tax Bracket Visualization',
    basicAllowanceLabel: 'Basic Allowance',
    progressiveZoneLabel: 'Progressive Zone',
    proportionalZone1Label: '42% Zone',
    proportionalZone2Label: '45% Zone',
    
    // Export
    exportCSV: 'Export as CSV',
    exportJSON: 'Export as JSON',
    exportPDF: 'Export as PDF',
    
    // Settings
    settingsLabel: 'Settings',
    languageLabel: 'Language',
    taxYearLabel: 'Tax Year',
    
    // Disclaimer
    disclaimer: 'This calculation serves as an estimate only. Please consult a tax advisor for binding information.'
  }
}; 