'use client';

import { TranslationKeys } from '../utils/translations';
import { TAX_BRACKETS } from '../utils/taxCalculations';

interface TaxBracketVisualizationProps {
  income: number;
  totalIncome: number;
  translations: TranslationKeys;
}

export default function TaxBracketVisualization({
  income,
  totalIncome,
  translations
}: TaxBracketVisualizationProps) {
  // Constants for visualization
  const maxDisplayIncome = Math.max(totalIncome, TAX_BRACKETS.ZONE3_MAX) * 1.1; // Add 10% for display margins
  
  // Calculate positions for markers
  const getPosition = (value: number) => `${(value / maxDisplayIncome) * 100}%`;
  
  // Calculate which bracket the incomes fall into
  const getIncomeZone = (amount: number) => {
    if (amount <= TAX_BRACKETS.ZONE1_MAX) return 1;
    if (amount <= TAX_BRACKETS.ZONE2_MAX) return 2;
    if (amount <= TAX_BRACKETS.ZONE3_MAX) return 3;
    return 4;
  };
  
  const baseIncomeZone = getIncomeZone(income);
  const totalIncomeZone = getIncomeZone(totalIncome);
  
  // Format large numbers with thousand separators
  const formatNumber = (num: number) => {
    return num.toLocaleString('de-DE');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4 text-gray-900">
        {translations.taxBracketVisualizationTitle}
      </h3>
      
      <div className="relative h-20 mb-6">
        {/* Tax brackets */}
        <div className="absolute inset-x-0 bottom-0 h-6 flex">
          <div 
            className="bg-green-100 border-r border-gray-300 flex items-center justify-center text-xs text-gray-900"
            style={{ width: getPosition(TAX_BRACKETS.ZONE1_MAX) }}
          >
            <span className="truncate px-1">{translations.basicAllowanceLabel}</span>
          </div>
          <div 
            className="bg-yellow-100 border-r border-gray-300 flex items-center justify-center text-xs text-gray-900"
            style={{ width: `calc(${getPosition(TAX_BRACKETS.ZONE2_MAX)} - ${getPosition(TAX_BRACKETS.ZONE1_MAX)})` }}
          >
            <span className="truncate px-1">{translations.progressiveZoneLabel}</span>
          </div>
          <div 
            className="bg-orange-100 border-r border-gray-300 flex items-center justify-center text-xs text-gray-900"
            style={{ width: `calc(${getPosition(TAX_BRACKETS.ZONE3_MAX)} - ${getPosition(TAX_BRACKETS.ZONE2_MAX)})` }}
          >
            <span className="truncate px-1">{translations.proportionalZone1Label}</span>
          </div>
          <div 
            className="bg-red-100 flex items-center justify-center text-xs text-gray-900"
            style={{ width: `calc(100% - ${getPosition(TAX_BRACKETS.ZONE3_MAX)})` }}
          >
            <span className="truncate px-1">{translations.proportionalZone2Label}</span>
          </div>
        </div>
        
        {/* Bracket labels */}
        <div className="absolute inset-x-0 top-0 flex text-xs text-gray-900">
          <div style={{ width: getPosition(TAX_BRACKETS.ZONE1_MAX), position: 'relative' }}>
            <span className="absolute -translate-x-1/2 transform">0€</span>
            <span className="absolute right-0 -translate-x-1/2 transform">{formatNumber(TAX_BRACKETS.ZONE1_MAX)}€</span>
          </div>
          <div style={{ 
            width: `calc(${getPosition(TAX_BRACKETS.ZONE2_MAX)} - ${getPosition(TAX_BRACKETS.ZONE1_MAX)})`,
            position: 'relative'
          }}>
            <span className="absolute right-0 -translate-x-1/2 transform">{formatNumber(TAX_BRACKETS.ZONE2_MAX)}€</span>
          </div>
          <div style={{ 
            width: `calc(${getPosition(TAX_BRACKETS.ZONE3_MAX)} - ${getPosition(TAX_BRACKETS.ZONE2_MAX)})`,
            position: 'relative'
          }}>
            <span className="absolute right-0 -translate-x-1/2 transform">{formatNumber(TAX_BRACKETS.ZONE3_MAX)}€</span>
          </div>
        </div>
        
        {/* Income markers */}
        {income > 0 && (
          <div 
            className="absolute bottom-7 h-12 border-l-2 border-blue-700"
            style={{ left: getPosition(income) }}
          >
            <div className="absolute top-0 -translate-x-1/2 transform bg-blue-100 text-blue-800 px-2 py-0.5 rounded whitespace-nowrap text-xs">
              {formatNumber(income)}€
            </div>
          </div>
        )}
        
        {totalIncome > income && (
          <div 
            className="absolute bottom-7 h-12 border-l-2 border-purple-700"
            style={{ left: getPosition(totalIncome) }}
          >
            <div className="absolute top-0 -translate-x-1/2 transform bg-purple-100 text-purple-800 px-2 py-0.5 rounded whitespace-nowrap text-xs">
              {formatNumber(totalIncome)}€
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-900">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-700 mr-1"></div>
            <span>Basiseinkommen</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-100 border border-purple-700 mr-1"></div>
            <span>Einkommen mit GbR</span>
          </div>
        </div>
      </div>
    </div>
  );
} 