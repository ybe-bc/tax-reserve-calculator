'use client';

import { PartnerData, FederalState } from '../types';
import { ChangeEvent, useState } from 'react';
import { TranslationKeys } from '../utils/translations';

interface PartnerInputProps {
  partner: PartnerData;
  onPartnerChange: (updatedPartner: PartnerData) => void;
  onRemove: () => void;
  canRemove: boolean;
  translations: TranslationKeys;
  advancedMode: boolean;
}

export default function PartnerInput({
  partner,
  onPartnerChange,
  onRemove,
  canRemove,
  translations,
  advancedMode
}: PartnerInputProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let updatedValue: string | number | boolean = value;
    
    // For checkboxes, use the checked property instead of value
    if (type === 'checkbox') {
      updatedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'yearlyIncome' || name === 'share') {
      // Convert numeric inputs to numbers
      updatedValue = parseFloat(value) || 0;
    }
    
    onPartnerChange({
      ...partner,
      [name]: updatedValue
    });
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{translations.partnerDetailsLabel}</h3>
        {canRemove && (
          <button 
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
            aria-label={translations.removePartnerLabel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor={`${partner.id}-name`} className="block text-sm font-medium mb-1">
            {translations.partnerNameLabel}
          </label>
          <input
            type="text"
            id={`${partner.id}-name`}
            name="name"
            value={partner.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder={translations.partnerNamePlaceholder}
          />
        </div>
        
        <div>
          <label htmlFor={`${partner.id}-income`} className="block text-sm font-medium mb-1">
            {translations.yearlyIncomeLabel}
          </label>
          <div className="flex relative">
            <input
              type="number"
              id={`${partner.id}-income`}
              name="yearlyIncome"
              value={partner.yearlyIncome || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="0"
              min="0"
              step="1000"
            />
            <span className="absolute right-3 top-2 text-gray-900">€</span>
          </div>
          <p className="text-xs text-gray-900 mt-1">{translations.yearlyIncomeHint}</p>
        </div>
        
        <div>
          <label htmlFor={`${partner.id}-share`} className="block text-sm font-medium mb-1">
            {translations.profitShareLabel}
          </label>
          <div className="flex relative">
            <input
              type="number"
              id={`${partner.id}-share`}
              name="share"
              value={partner.share || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="0"
              min="0"
              max="100"
              step="1"
            />
            <span className="absolute right-3 top-2 text-gray-900">%</span>
          </div>
        </div>
        
        {advancedMode && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2" 
              onClick={() => setExpanded(!expanded)}
            >
              <h4 className="font-medium text-gray-800">{translations.advancedSettingsLabel}</h4>
              <svg 
                className={`w-5 h-5 text-gray-900 transition-transform ${expanded ? 'transform rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {expanded && (
              <div className="space-y-3 mt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${partner.id}-church`}
                    name="isChurchMember"
                    checked={partner.isChurchMember}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${partner.id}-church`} className="ml-2 block text-sm text-gray-800">
                    {translations.churchMemberLabel}
                  </label>
                </div>
                
                {partner.isChurchMember && (
                  <div>
                    <label htmlFor={`${partner.id}-state`} className="block text-sm font-medium mb-1">
                      {translations.federalStateLabel}
                    </label>
                    <select
                      id={`${partner.id}-state`}
                      name="federalState"
                      value={partner.federalState}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      {Object.values(FederalState).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-900 mt-1">{translations.federalStateHint}</p>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${partner.id}-joint`}
                    name="isJointAssessment"
                    checked={partner.isJointAssessment}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${partner.id}-joint`} className="ml-2 block text-sm text-gray-800">
                    {translations.jointAssessmentLabel}
                  </label>
                </div>
                <p className="text-xs text-gray-900">{translations.jointAssessmentHint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 