import { v4 as uuidv4 } from 'uuid';

// German federal states
export enum FederalState {
  BADEN_WUERTTEMBERG = 'Baden-Württemberg',
  BAYERN = 'Bayern',
  BERLIN = 'Berlin',
  BRANDENBURG = 'Brandenburg',
  BREMEN = 'Bremen',
  HAMBURG = 'Hamburg',
  HESSEN = 'Hessen',
  MECKLENBURG_VORPOMMERN = 'Mecklenburg-Vorpommern',
  NIEDERSACHSEN = 'Niedersachsen',
  NORDRHEIN_WESTFALEN = 'Nordrhein-Westfalen',
  RHEINLAND_PFALZ = 'Rheinland-Pfalz',
  SAARLAND = 'Saarland',
  SACHSEN = 'Sachsen',
  SACHSEN_ANHALT = 'Sachsen-Anhalt',
  SCHLESWIG_HOLSTEIN = 'Schleswig-Holstein',
  THUERINGEN = 'Thüringen'
}

// Partner data
export interface PartnerData {
  id: string;
  name: string;
  yearlyIncome: number;
  share: number;
  isChurchMember: boolean;
  federalState: FederalState;
  isJointAssessment: boolean;
}

// Create a default partner
export const createDefaultPartner = (): PartnerData => ({
  id: uuidv4(),
  name: '',
  yearlyIncome: 0,
  share: 50,
  isChurchMember: false,
  federalState: FederalState.NORDRHEIN_WESTFALEN,
  isJointAssessment: false,
});

// GbR data
export interface GbRData {
  monthlyProfit: number;
}

// Individual tax details
export interface TaxDetails {
  incomeTax: number;
  solidaritySurcharge: number;
  churchTax: number;
  totalTax: number;
}

// Individual partner tax reserve calculation
export interface PartnerReserveData {
  partnerId: string;
  partnerName: string;
  share: number;
  monthlyProfit: number;
  annualProfit: number;
  baseTaxAmount: number;
  totalTaxAmount: number;
  additionalTaxAmount: number;
  reserveAmount: number;
  effectiveTaxRate: number;
  taxDetails: TaxDetails;
}

// Complete tax reserve calculation result
export interface TaxReserveResult {
  totalReserveAmount: number;
  totalReservePercentage: number;
  weightedAverageTaxRate: number;
  annualTaxBurden: number;
  partnerReserves: PartnerReserveData[];
}

// Export data for saving/sharing
export interface ExportData {
  date: string;
  taxYear: number;
  gbrData: GbRData;
  partners: PartnerData[];
  results: TaxReserveResult;
}

// State for calculator
export interface CalculatorState {
  partners: PartnerData[];
  gbr: GbRData;
  results: TaxReserveResult | null;
  language: 'de' | 'en';
  advancedMode: boolean;
  safetyMargin: number;
}

// Export all payment management types
export * from './paymentManagement'; 