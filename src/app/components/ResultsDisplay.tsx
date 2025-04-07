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
  // State for expanded partner details
  const [expandedPartners, setExpandedPartners] = useState<{ [key: string]: boolean }>({});
  
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
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
    setExpandedPartners(prev => ({
      ...prev,
      [partnerId]: !prev[partnerId]
    }));
  };

  // Calculate raw monthly reserve amount (without safety margin)
  const getRawReserveAmount = (reserveAmount: number) => {
    return reserveAmount / (1 + safetyMargin);
  };
  
  // Calculate safety margin amount
  const getSafetyMarginAmount = (reserveAmount: number) => {
    const rawAmount = getRawReserveAmount(reserveAmount);
    return reserveAmount - rawAmount;
  };

  // Calculate total values
  const totalRawReserveAmount = getRawReserveAmount(results.totalReserveAmount);
  const totalSafetyMarginAmount = getSafetyMarginAmount(results.totalReserveAmount);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">{translations.resultTitle}</h2>
      
      {/* Total Tax Reserve Box */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">{translations.totalReserveTitle}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{translations.percentageLabel}</p>
            <p className="text-lg font-semibold">{formatPercentage(results.totalReservePercentage)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{translations.monthlyAmountLabel}</p>
            <p className="text-lg font-semibold">{formatCurrency(totalRawReserveAmount)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{translations.safetyMarginAmountLabel}</p>
            <p className="text-lg font-semibold">{formatCurrency(totalSafetyMarginAmount)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{translations.annualTaxBurdenLabel}</p>
            <p className="text-lg font-semibold">{formatCurrency(results.annualTaxBurden)}</p>
          </div>
        </div>
      </div>
      
      {/* Export buttons */}
      <div className="mb-4 flex space-x-2">
        <div className="text-sm font-medium text-gray-700 mr-2 flex items-center">
          {translations.exportLabel}:
        </div>
        <button
          onClick={() => handleExport('csv')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
        >
          {translations.exportCSVLabel}
        </button>
        <button
          onClick={() => handleExport('json')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
        >
          {translations.exportJSONLabel}
        </button>
      </div>
      
      {/* Partner Reserves */}
      <h3 className="text-lg font-semibold mt-6 mb-2">{translations.partnerDetailsLabel}</h3>
      
      <div className="space-y-4">
        {results.partnerReserves.map(partner => {
          const isExpanded = expandedPartners[partner.partnerId] || false;
          const rawReserve = getRawReserveAmount(partner.reserveAmount);
          const safetyAmount = getSafetyMarginAmount(partner.reserveAmount);
          
          return (
            <div key={partner.partnerId} className="border rounded-lg overflow-hidden">
              {/* Partner Summary Row */}
              <div 
                className="bg-gray-50 p-4 cursor-pointer flex flex-wrap items-center"
                onClick={() => togglePartnerDetails(partner.partnerId)}
              >
                <div className="w-full sm:w-1/4 mb-2 sm:mb-0">
                  <h4 className="font-semibold">{partner.partnerName}</h4>
                </div>
                <div className="flex flex-wrap w-full sm:w-3/4 text-sm">
                  <div className="px-2 w-1/2 sm:w-1/4">
                    <div className="text-gray-600">{translations.shareLabel}</div>
                    <div className="font-semibold">{formatPercentage(partner.share / 100)}</div>
                  </div>
                  <div className="px-2 w-1/2 sm:w-1/4">
                    <div className="text-gray-600">{translations.effectiveTaxRateLabel}</div>
                    <div className="font-semibold">{formatPercentage(partner.effectiveTaxRate)}</div>
                  </div>
                  <div className="px-2 w-1/2 sm:w-1/4 mt-2 sm:mt-0">
                    <div className="text-gray-600">{translations.monthlyReserveLabel}</div>
                    <div className="font-semibold">{formatCurrency(rawReserve)}</div>
                  </div>
                  <div className="px-2 w-1/2 sm:w-1/4 mt-2 sm:mt-0">
                    <div className="text-gray-600">{translations.safetyMarginAmountLabel}</div>
                    <div className="font-semibold">{formatCurrency(safetyAmount)}</div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Partner Details */}
              {isExpanded && (
                <div className="p-4 bg-white border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">{translations.taxDetailsLabel}</h5>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 pr-4 text-gray-600">{translations.yearlyIncomeLabel}</td>
                            <td className="py-1 text-right font-medium">{formatCurrency(
                              partners.find(p => p.id === partner.partnerId)?.yearlyIncome || 0
                            )}</td>
                          </tr>
                          <tr>
                            <td className="py-1 pr-4 text-gray-600">{translations.annualProfitLabel}</td>
                            <td className="py-1 text-right font-medium">{formatCurrency(partner.annualProfit)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 pr-4 text-gray-600">{translations.effectiveTaxRateLabel}</td>
                            <td className="py-1 text-right font-medium">{formatPercentage(partner.effectiveTaxRate)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 pr-4 text-gray-600">{translations.annualTaxBurdenLabel}</td>
                            <td className="py-1 text-right font-medium">{formatCurrency(partner.reserveAmount * 12)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">{translations.monthlyReserveLabel}</h5>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 pr-4 text-gray-600">{translations.monthlyProfitLabel}</td>
                            <td className="py-1 text-right font-medium">{formatCurrency(partner.monthlyProfit)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 pr-4 text-gray-600">{translations.monthlyReserveLabel}</td>
                            <td className="py-1 text-right font-medium">{formatCurrency(rawReserve)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 pr-4 text-gray-600">{translations.safetyMarginAmountLabel}</td>
                            <td className="py-1 text-right font-medium">{formatCurrency(safetyAmount)}</td>
                          </tr>
                          <tr className="font-semibold">
                            <td className="py-1 pr-4">{translations.totalReserveTitle}</td>
                            <td className="py-1 text-right">{formatCurrency(partner.reserveAmount)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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