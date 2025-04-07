'use client';

import { GbRData } from '../types';
import { TranslationKeys } from '../utils/translations';

interface GbRInputProps {
  data: GbRData;
  onDataChange: (data: GbRData) => void;
  translations: TranslationKeys;
  advancedMode: boolean;
  safetyMargin: number;
  onSafetyMarginChange: (margin: number) => void;
}

export default function GbRInput({ 
  data, 
  onDataChange, 
  translations,
  advancedMode,
  safetyMargin,
  onSafetyMarginChange
}: GbRInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name === 'monthlyProfit') {
      onDataChange({
        ...data,
        [name]: isNaN(numValue) ? 0 : numValue
      });
    }
  };
  
  const handleSafetyMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onSafetyMarginChange(isNaN(value) ? 0 : value);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-4">{translations.gbrSectionTitle}</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="monthlyProfit" className="block text-sm font-medium mb-1">
            {translations.monthlyProfitLabel}
          </label>
          <div className="flex relative">
            <input
              type="number"
              id="monthlyProfit"
              name="monthlyProfit"
              value={data.monthlyProfit || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="0"
              min="0"
              step="100"
            />
            <span className="absolute right-3 top-2 text-gray-900">€</span>
          </div>
        </div>
        
        {advancedMode && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">{translations.advancedSettingsLabel}</h4>
            
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="safetyMargin" className="block text-sm font-medium text-gray-900">
                  {translations.safetyMarginLabel}
                </label>
                <span className="text-sm font-medium text-gray-900">{(safetyMargin * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                id="safetyMargin"
                name="safetyMargin"
                min="0"
                max="0.2"
                step="0.01"
                value={safetyMargin}
                onChange={handleSafetyMarginChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer text-gray-900"
              />
              <p className="text-xs text-gray-900 mt-1">
                {translations.safetyMarginDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 