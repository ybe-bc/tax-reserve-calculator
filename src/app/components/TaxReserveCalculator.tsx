'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PartnerData, GbRData, TaxReserveResult, CalculatorState, createDefaultPartner, FederalState } from '../types';
import { 
  calculateTaxReserve, 
  setDebugMode, 
  forceDebugTest, 
  calculateEquitableGbRTaxReserves,
  GbRType,
  PartnerTaxData
} from '../utils/taxCalculations';
import { translations } from '../utils/translations';
import PartnerInput from './PartnerInput';
import GbRInput from './GbRInput';
import ResultsDisplay from './ResultsDisplay';

export default function TaxReserveCalculator() {
  const currentYear = 2025; // For tax year 2025 calculation
  
  // State management
  const [partners, setPartners] = useState<PartnerData[]>([createDefaultPartner()]);
  const [gbr, setGbr] = useState<GbRData>({ monthlyProfit: 0 });
  const [results, setResults] = useState<TaxReserveResult | null>(null);
  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [safetyMargin, setSafetyMargin] = useState<number>(0.05); // Default 5% safety margin
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugDetailLevel, setDebugDetailLevel] = useState<number>(1); // 1=Normal, 2=Detailed, 3=Very Detailed
  const [useEquitableCalculation, setUseEquitableCalculation] = useState<boolean>(true); // Default to equitable calculation
  const [gbrType, setGbrType] = useState<GbRType>(GbRType.FREELANCE); // Default to freelance GbR
  const [municipalityRate, setMunicipalityRate] = useState<number>(400); // Default to 400%
  
  // Enable/disable debug mode
  useEffect(() => {
    console.log("Setting debug mode to:", debugMode, "with detail level:", debugDetailLevel);
    setDebugMode(debugMode, debugDetailLevel);
    
    // Force recalculation with new debug setting
    if (partners.length > 0 && gbr.monthlyProfit > 0) {
      calculateResults(partners, gbr, safetyMargin);
    }
  }, [debugMode, debugDetailLevel]);
  
  // Force debug mode in development
  useEffect(() => {
    // Check if we're in development mode and should auto-enable debugging
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      console.log("Auto-enabling debug mode from URL parameter");
      setDebugMode(true);
      setAdvancedMode(true);
      
      // Check for detail level in URL
      const detailLevel = parseInt(urlParams.get('detail') || '1', 10);
      if (detailLevel >= 1 && detailLevel <= 3) {
        setDebugDetailLevel(detailLevel);
      }
    }
  }, []);
  
  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('taxCalculatorState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState) as CalculatorState;
        setPartners(state.partners);
        setGbr(state.gbr);
        setLanguage(state.language);
        setAdvancedMode(state.advancedMode);
        setSafetyMargin(state.safetyMargin);
        
        // Also calculate results based on loaded state
        if (state.partners.length > 0 && state.gbr.monthlyProfit > 0) {
          calculateResults(state.partners, state.gbr, state.safetyMargin);
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    const state: CalculatorState = {
      partners,
      gbr,
      results,
      language,
      advancedMode,
      safetyMargin
    };
    
    localStorage.setItem('taxCalculatorState', JSON.stringify(state));
  }, [partners, gbr, results, language, advancedMode, safetyMargin]);
  
  // Calculate results whenever inputs change
  useEffect(() => {
    if (partners.length > 0 && gbr.monthlyProfit > 0) {
      calculateResults(partners, gbr, safetyMargin);
    }
  }, [partners, gbr, safetyMargin]);
  
  // Handle partner data changes
  const handlePartnerChange = (updatedPartner: PartnerData) => {
    setPartners(prevPartners => 
      prevPartners.map(partner => 
        partner.id === updatedPartner.id ? updatedPartner : partner
      )
    );
  };
  
  // Handle GbR data changes
  const handleGbRChange = (updatedGbR: GbRData) => {
    setGbr(updatedGbR);
  };
  
  // Handle safety margin changes
  const handleSafetyMarginChange = (margin: number) => {
    setSafetyMargin(margin);
  };
  
  // Add a new partner
  const addPartner = () => {
    // Calculate equal share percentages for all partners
    const newPartnerCount = partners.length + 1;
    const equalShare = Math.floor(100 / newPartnerCount);
    const remainder = 100 - (equalShare * newPartnerCount);
    
    // Update existing partners' shares
    const updatedPartners = partners.map(partner => ({
      ...partner,
      share: equalShare
    }));
    
    // Add the new partner
    const newPartner = createDefaultPartner();
    newPartner.share = equalShare + remainder; // Add any remainder to the new partner
    
    setPartners([...updatedPartners, newPartner]);
  };
  
  // Remove a partner
  const removePartner = (id: string) => {
    if (partners.length <= 1) return; // Keep at least one partner
    
    // Calculate equal share percentages for remaining partners
    const remainingPartners = partners.filter(partner => partner.id !== id);
    const equalShare = Math.floor(100 / remainingPartners.length);
    const remainder = 100 - (equalShare * remainingPartners.length);
    
    // Update remaining partners' shares
    const updatedPartners = remainingPartners.map((partner, index) => ({
      ...partner,
      share: index === 0 ? equalShare + remainder : equalShare // Add remainder to first partner
    }));
    
    setPartners(updatedPartners);
  };
  
  // Reset calculator
  const resetCalculator = () => {
    setPartners([createDefaultPartner()]);
    setGbr({ monthlyProfit: 0 });
    setResults(null);
  };
  
  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'de' ? 'en' : 'de');
  };
  
  // Toggle advanced mode
  const toggleAdvancedMode = () => {
    setAdvancedMode(prev => !prev);
  };
  
  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };
  
  // Set debug detail level
  const handleDebugDetailLevelChange = (level: number) => {
    setDebugDetailLevel(Math.min(Math.max(level, 1), 3)); // Ensure between 1-3
  };
  
  // Toggle calculation method
  const toggleCalculationMethod = () => {
    setUseEquitableCalculation(prev => !prev);
  };
  
  // Handle municipality rate change
  const handleMunicipalityRateChange = (rate: number) => {
    setMunicipalityRate(rate);
  };
  
  // Handle GbR type change
  const handleGbRTypeChange = (type: GbRType) => {
    setGbrType(type);
  };
  
  // Calculate tax reserves
  const calculateResults = (
    partnerList: PartnerData[], 
    gbrData: GbRData, 
    margin: number
  ) => {
    // Validate the total share is 100%
    const totalShare = partnerList.reduce((sum, partner) => sum + partner.share, 0);
    if (Math.abs(totalShare - 100) > 0.01) {
      // Adjust shares to equal 100%
      const ratio = 100 / totalShare;
      partnerList = partnerList.map(partner => ({
        ...partner,
        share: partner.share * ratio
      }));
    }
    
    if (useEquitableCalculation) {
      // Use the equitable calculation method that applies the same tax rate to all partners
      
      // Convert PartnerData to PartnerTaxData (which has additional fields)
      const partnerTaxData: PartnerTaxData[] = partnerList.map(partner => ({
        id: partner.id,
        name: partner.name,
        yearlyIncome: partner.yearlyIncome,
        share: partner.share,
        isChurchMember: partner.isChurchMember,
        federalState: partner.federalState,
        isJointAssessment: partner.isJointAssessment,
      }));
      
      // Set up GbR parameters
      const gbrParams = {
        gbrType,
        monthlyProfit: gbrData.monthlyProfit,
        municipalityRate: gbrType === GbRType.COMMERCIAL ? municipalityRate : undefined,
        safetyMargin: margin
      };
      
      // Calculate equitable tax reserves
      const equitableResults = calculateEquitableGbRTaxReserves(partnerTaxData, gbrParams);
      
      // Convert to standard TaxReserveResult format
      const partnerReserves = equitableResults.partnerReserves.map(reserve => {
        return {
          partnerId: reserve.partnerId,
          partnerName: reserve.partnerName,
          share: reserve.share,
          monthlyProfit: reserve.monthlyProfit,
          annualProfit: reserve.annualProfit,
          baseTaxAmount: 0, // Not used in equitable calculation
          totalTaxAmount: 0, // Not used in equitable calculation
          additionalTaxAmount: 0, // Not used in equitable calculation
          effectiveTaxRate: reserve.effectiveTaxRate,
          reserveAmount: reserve.reserveAmount + reserve.safetyAmount, // Total with safety margin
          taxDetails: {
            incomeTax: 0, // Not broken down in equitable calculation
            solidaritySurcharge: 0,
            churchTax: 0,
            totalTax: reserve.reserveAmount + reserve.safetyAmount // Include safety margin here too
          }
        };
      });
      
      // Set results
      setResults({
        totalReserveAmount: equitableResults.totalReserve,
        totalReservePercentage: equitableResults.totalReservePercentage,
        weightedAverageTaxRate: equitableResults.totalReservePercentage / (1 + margin),
        annualTaxBurden: equitableResults.annualTaxBurden,
        partnerReserves
      });
      
    } else {
      // Use the original calculation method (calculates tax individually for each partner)
      // ... existing calculation code ...
      
      // Calculate monthly GbR profit
      const monthlyProfit = gbrData.monthlyProfit;
      
      // Calculate reserves for each partner
      const partnerReserves = partnerList.map(partner => {
        // Calculate partner's share of the monthly profit
        const share = partner.share;
        const monthlyPartnerProfit = monthlyProfit * (share / 100);
        const annualPartnerProfit = monthlyPartnerProfit * 12;
        
        // Calculate tax reserve using the detailed tax calculation
        const taxResult = calculateTaxReserve(
          partner.yearlyIncome,
          annualPartnerProfit,
          partner.isChurchMember,
          partner.federalState,
          partner.isJointAssessment,
          margin
        );
        
        // Calculate monthly reserve amount (already includes safety margin)
        const reserveAmount = monthlyPartnerProfit * taxResult.effectiveTaxRate;
        
        return {
          partnerId: partner.id,
          partnerName: partner.name || `Partner ${partner.id.substring(0, 4)}`,
          share,
          monthlyProfit: monthlyPartnerProfit,
          annualProfit: annualPartnerProfit,
          baseTaxAmount: taxResult.baseTaxAmount,
          totalTaxAmount: taxResult.totalTaxAmount,
          additionalTaxAmount: taxResult.additionalTaxAmount,
          effectiveTaxRate: taxResult.effectiveTaxRate,
          reserveAmount,
          taxDetails: {
            incomeTax: taxResult.incomeTax,
            solidaritySurcharge: taxResult.solidaritySurcharge,
            churchTax: taxResult.churchTax,
            totalTax: taxResult.totalTax
          }
        };
      });
      
      // Calculate total reserves
      const totalReserveAmount = partnerReserves.reduce((sum, reserve) => sum + reserve.reserveAmount, 0);
      const totalReservePercentage = totalReserveAmount / monthlyProfit;
      
      // Calculate weighted average tax rate
      const totalTaxBurden = partnerReserves.reduce((sum, reserve) => sum + reserve.taxDetails.totalTax, 0);
      const totalAnnualProfit = partnerReserves.reduce((sum, reserve) => sum + reserve.annualProfit, 0);
      const weightedAverageTaxRate = totalAnnualProfit > 0 ? totalTaxBurden / totalAnnualProfit : 0;
      
      // Calculate annual tax burden
      const annualTaxBurden = totalReserveAmount * 12;
      
      // Set results
      setResults({
        totalReserveAmount,
        totalReservePercentage,
        weightedAverageTaxRate,
        annualTaxBurden,
        partnerReserves
      });
    }
  };
  
  // Get translations for current language
  const t = translations[language];
  
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{t.calculatorTitle}</h1>
        <div className="flex justify-center space-x-4 flex-wrap">
          <button 
            onClick={toggleLanguage}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm"
          >
            {language === 'de' ? 'English' : 'Deutsch'}
          </button>
          <button 
            onClick={toggleAdvancedMode}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
          >
            {advancedMode ? t.basicSettingsLabel : t.advancedSettingsToggle}
          </button>
          <button 
            onClick={toggleCalculationMethod}
            className={`px-3 py-1 rounded text-sm ${useEquitableCalculation ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            {useEquitableCalculation ? t.equitableCalculationOn : t.equitableCalculationOff}
          </button>
          {advancedMode && (
            <button 
              onClick={toggleDebugMode}
              className={`px-3 py-1 rounded text-sm ${debugMode ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Debug: {debugMode ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </header>
      
      {/* Debug Detail Level Controls - Only visible when debug mode is on */}
      {debugMode && (
        <div className="mb-6 p-3 border-2 border-red-500 rounded-lg bg-red-50">
          <h3 className="font-bold text-red-700 mb-2">Tax Advisor Verification Settings</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-sm font-medium mr-2">Debug Detail Level:</label>
              <div className="flex">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleDebugDetailLevelChange(level)}
                    className={`px-3 py-1 text-sm border ${
                      debugDetailLevel === level 
                        ? 'bg-blue-600 text-white border-blue-700' 
                        : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {level === 1 ? 'Basic' : level === 2 ? 'Detailed' : 'Very Detailed'}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-700">
              <p>Current level: {debugDetailLevel === 1 ? 'Basic (summaries only)' : 
                                 debugDetailLevel === 2 ? 'Detailed (calculation steps)' : 
                                 'Very Detailed (all steps with tax law references)'}
              </p>
              <p className="italic">Higher detail levels provide more information for tax advisor verification</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t.gbrSectionTitle}</h2>
          
          {advancedMode && (
            <div className="mb-4 p-4 border rounded-lg bg-blue-50">
              <h3 className="font-medium mb-2">{t.gbrTypeLabel}</h3>
              <div className="flex space-x-4 mb-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gbrType"
                    checked={gbrType === GbRType.FREELANCE}
                    onChange={() => handleGbRTypeChange(GbRType.FREELANCE)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{t.freelanceGbRLabel}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gbrType"
                    checked={gbrType === GbRType.COMMERCIAL}
                    onChange={() => handleGbRTypeChange(GbRType.COMMERCIAL)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">{t.commercialGbRLabel}</span>
                </label>
              </div>
              
              {gbrType === GbRType.COMMERCIAL && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t.municipalityRateLabel}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={municipalityRate}
                      onChange={(e) => handleMunicipalityRateChange(parseInt(e.target.value) || 0)}
                      className="w-24 p-2 border border-gray-300 rounded-md text-sm"
                      min="200"
                      max="900"
                    />
                    <span>%</span>
                    <span className="text-xs text-gray-500">({t.municipalityRateHint})</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <GbRInput 
            data={gbr}
            onDataChange={handleGbRChange}
            translations={t}
            advancedMode={advancedMode}
            safetyMargin={safetyMargin}
            onSafetyMarginChange={handleSafetyMarginChange}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t.partnerSectionTitle}</h2>
            <button 
              onClick={addPartner}
              className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm"
            >
              {t.addPartnerButton}
            </button>
          </div>
          
          {partners.map((partner, index) => (
            <div key={partner.id} className="mb-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">
                  {partner.name || `${t.partnerNameLabel} ${index + 1}`}
                </h3>
                {partners.length > 1 && (
                  <button 
                    onClick={() => removePartner(partner.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    {t.removePartnerButton}
                  </button>
                )}
              </div>
              <PartnerInput 
                partner={partner}
                onPartnerChange={(updatedPartner) => handlePartnerChange(updatedPartner)}
                translations={t}
                advancedMode={advancedMode}
                onRemove={() => removePartner(partner.id)}
                canRemove={partners.length > 1}
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => calculateResults(partners, gbr, safetyMargin)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            {t.calculateButton}
          </button>
          <button 
            onClick={resetCalculator}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
          >
            {t.resetButton}
          </button>
        </div>
      </div>
      
      {results && (
        <ResultsDisplay 
          results={results}
          partners={partners}
          gbrData={gbr}
          translations={t}
          language={language}
          safetyMargin={safetyMargin}
          taxYear={currentYear}
        />
      )}
      
      {/* Debug output container - only visible when debug mode is on */}
      {debugMode && (
        <div className="mt-8 p-4 border-2 border-red-500 rounded bg-red-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-red-700">Tax Advisor Verification Data</h3>
            <div className="space-x-2">
              <button 
                onClick={() => {
                  const debugElement = document.getElementById('debug-output');
                  if (debugElement) debugElement.innerHTML = '';
                }}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
              >
                Clear Debug
              </button>
              <button 
                onClick={() => console.clear()}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
              >
                Clear Console
              </button>
              <button 
                onClick={() => {
                  // Force recalculation with current data
                  calculateResults(partners, gbr, safetyMargin);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Recalculate
              </button>
              <button 
                onClick={() => {
                  // Run the debug test to verify it works
                  forceDebugTest();
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
              >
                Test Debug
              </button>
              <button
                onClick={() => {
                  // Function to print debug data in a format suitable for tax advisors
                  if (partners.length > 0 && gbr.monthlyProfit > 0) {
                    // Set to highest detail level temporarily
                    const prevLevel = debugDetailLevel;
                    setDebugDetailLevel(3);
                    setTimeout(() => {
                      calculateResults(partners, gbr, safetyMargin);
                      // Reset to previous level after calculation
                      setTimeout(() => setDebugDetailLevel(prevLevel), 500);
                    }, 100);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Generate Tax Report
              </button>
            </div>
          </div>
          <div id="debug-output" className="font-mono text-xs overflow-auto max-h-96 bg-white p-3 border">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
              <h4 className="font-bold mb-2">Tax Advisor Verification Mode</h4>
              <p>This debug panel displays detailed tax calculation information for verification purposes.</p>
              <p className="mt-2">Detail Level: {debugDetailLevel === 1 ? 'Basic' : debugDetailLevel === 2 ? 'Detailed' : 'Very Detailed'}</p>
              <p className="mt-1">For complete tax advisor report with all calculation steps and legal references, click "Generate Tax Report" button.</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Try the URL parameter ?debug=1&detail=3 to auto-enable debug mode with highest detail level
          </p>
        </div>
      )}
    </div>
  );
} 