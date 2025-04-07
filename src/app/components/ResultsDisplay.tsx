'use client';

import { useState } from 'react';
import { TaxReserveResult, PartnerData, GbRData, ExportData } from '../types';
import { TranslationKeys } from '../utils/translations';
import { exportToCSV, exportToJSON, exportToPDF } from '../utils/exportUtils';
import TaxBracketVisualization from './TaxBracketVisualization';

interface ResultsDisplayProps {
  results: TaxReserveResult | null;
  partners: PartnerData[];
  gbrData: GbRData;
  translations: TranslationKeys;
  language: 'de' | 'en';
  taxYear: number;
  safetyMargin: number;
}

export default function ResultsDisplay({ 
  results, 
  partners,
  gbrData,
  translations,
  language,
  taxYear,
  safetyMargin
}: ResultsDisplayProps) {
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);
  
  if (!results) {
    return null;
  }

  // Helper to get color based on tax rate
  const getTaxRateColor = (rate: number) => {
    if (rate < 0.2) return 'text-green-700';
    if (rate < 0.3) return 'text-yellow-700';
    return 'text-red-700';
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    const today = new Date().toISOString().split('T')[0];
    
    const exportData: ExportData = {
      date: today,
      gbrData,
      partners,
      results,
      taxYear
    };
    
    switch (format) {
      case 'csv':
        exportToCSV(exportData);
        break;
      case 'json':
        exportToJSON(exportData);
        break;
      case 'pdf':
        exportToPDF(exportData);
        break;
    }
  };

  const togglePartnerDetails = (partnerId: string) => {
    if (expandedPartnerId === partnerId) {
      setExpandedPartnerId(null);
    } else {
      setExpandedPartnerId(partnerId);
    }
  };

  // Calculate the raw tax rate (without safety margin)
  const getRawTaxRate = (effectiveTaxRate: number) => {
    return effectiveTaxRate / (1 + safetyMargin);
  };
  
  // Calculate the raw reserve amount (without safety margin)
  const getRawReserveAmount = (reserveAmount: number) => {
    return reserveAmount / (1 + safetyMargin);
  };
  
  // Calculate the safety margin amount
  const getSafetyMarginAmount = (reserveAmount: number) => {
    const rawAmount = getRawReserveAmount(reserveAmount);
    return reserveAmount - rawAmount;
  };

  // Calculate total values
  const totalRawReserveAmount = getRawReserveAmount(results.totalReserveAmount);
  const totalSafetyMarginAmount = getSafetyMarginAmount(results.totalReserveAmount);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {translations.resultTitle}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleExport('csv')}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-900"
          >
            {translations.exportCSV}
          </button>
          <button 
            onClick={() => handleExport('json')}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-900"
          >
            {translations.exportJSON}
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-900"
          >
            {translations.exportPDF}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-semibold text-lg mb-2 text-gray-900">{translations.totalReserveTitle}</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-800">{translations.percentageLabel}</span>
            <span className={`font-bold ${getTaxRateColor(getRawTaxRate(results.totalReservePercentage))}`}>
              {formatPercentage(getRawTaxRate(results.totalReservePercentage))}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-800">{translations.monthlyAmountLabel}</span>
            <span className="font-bold">
              {formatCurrency(totalRawReserveAmount)}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-800">{translations.safetyMarginLabel}</span>
            <span className="font-bold">
              {formatCurrency(totalSafetyMarginAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-800">{translations.annualTaxBurdenLabel}</span>
            <span className="font-bold">
              {formatCurrency(results.annualTaxBurden)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {results.partnerReserves.map((reserve) => {
            const partner = partners.find(p => p.id === reserve.partnerId);
            const isExpanded = expandedPartnerId === reserve.partnerId;
            // Calculate raw values
            const rawTaxRate = getRawTaxRate(reserve.effectiveTaxRate);
            const rawReserveAmount = getRawReserveAmount(reserve.reserveAmount);
            const safetyMarginAmount = getSafetyMarginAmount(reserve.reserveAmount);
            
            return (
              <div key={reserve.partnerId} className="bg-gray-50 p-3 rounded-md">
                <div 
                  className="flex justify-between items-center cursor-pointer" 
                  onClick={() => togglePartnerDetails(reserve.partnerId)}
                >
                  <h3 className="font-semibold text-base">{reserve.partnerName}</h3>
                  <svg 
                    className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                  <span className="text-gray-800">{translations.shareLabel}</span>
                  <span className="font-medium text-right">{formatPercentage(reserve.share / 100)}</span>
                  
                  <span className="text-gray-800">{translations.effectiveTaxRateLabel}</span>
                  <span className={`font-medium text-right ${getTaxRateColor(rawTaxRate)}`}>
                    {formatPercentage(rawTaxRate)}
                  </span>
                  
                  <span className="text-gray-800">{translations.monthlyReserveLabel}</span>
                  <span className="font-medium text-right">
                    {formatCurrency(rawReserveAmount)}
                  </span>
                  
                  <span className="text-gray-800">{translations.safetyMarginLabel}</span>
                  <span className="font-medium text-right">
                    {formatCurrency(safetyMarginAmount)}
                  </span>
                </div>
                
                {isExpanded && partner && (
                  <div className="mt-4 border-t pt-3">
                    <div className="mb-4">
                      <TaxBracketVisualization 
                        income={partner.yearlyIncome}
                        totalIncome={partner.yearlyIncome + reserve.annualProfit}
                        translations={translations}
                      />
                    </div>
                    
                    <h4 className="font-medium text-sm mb-2">{translations.taxDetailsLabel}</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-gray-800">{translations.annualProfitLabel}</span>
                      <span className="text-right">{formatCurrency(reserve.annualProfit)}</span>
                      
                      <span className="text-gray-800">{translations.baseTaxLabel}</span>
                      <span className="text-right">{formatCurrency(reserve.baseTaxAmount)}</span>
                      
                      <span className="text-gray-800">{translations.totalTaxLabel}</span>
                      <span className="text-right">{formatCurrency(reserve.totalTaxAmount)}</span>
                      
                      <span className="text-gray-800">{translations.additionalTaxLabel}</span>
                      <span className="text-right">{formatCurrency(reserve.additionalTaxAmount)}</span>
                      
                      <div className="col-span-2 my-2 border-t"></div>
                      
                      <span className="text-gray-800">{translations.incomeTaxLabel}</span>
                      <span className="text-right">{formatCurrency(reserve.taxDetails.incomeTax)}</span>
                      
                      <span className="text-gray-800">{translations.solidaritySurchargeLabel}</span>
                      <span className="text-right">{formatCurrency(reserve.taxDetails.solidaritySurcharge)}</span>
                      
                      <span className="text-gray-800">{translations.churchTaxLabel}</span>
                      <span className="text-right">{formatCurrency(reserve.taxDetails.churchTax)}</span>
                      
                      <span className="text-gray-800 font-medium">{translations.totalTaxLabel}</span>
                      <span className="text-right font-medium">{formatCurrency(reserve.taxDetails.totalTax)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-700 flex items-center justify-between">
        <p>{translations.disclaimer}</p>
        <div className="text-xs font-medium">
          {translations.taxYearLabel}: {taxYear}
        </div>
      </div>
    </div>
  );
} 