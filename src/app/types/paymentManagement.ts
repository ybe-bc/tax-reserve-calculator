import { v4 as uuidv4 } from 'uuid';

export enum TaxType {
  INCOME_TAX = 'incomeTax',
  TRADE_TAX = 'tradeTax'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  SCHEDULED = 'scheduled'
}

export enum TaxQuarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
}

/**
 * Represents a single tax payment
 */
export interface TaxPayment {
  id: string;
  taxType: TaxType;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  quarter: TaxQuarter;
  year: number;
  paymentDate?: Date;
  reference?: string;
  partnerId?: string; // Optional: If the payment is for a specific partner
}

/**
 * Creates a default tax payment object
 */
export const createDefaultTaxPayment = (
  taxType: TaxType, 
  quarter: TaxQuarter, 
  year: number
): TaxPayment => ({
  id: uuidv4(),
  taxType,
  amount: 0,
  dueDate: getTaxDueDate(taxType, quarter, year),
  status: PaymentStatus.SCHEDULED,
  quarter,
  year
});

/**
 * Helper function to get the due date for a tax payment based on its type and quarter
 */
export function getTaxDueDate(taxType: TaxType, quarter: TaxQuarter, year: number): Date {
  const date = new Date();
  date.setFullYear(year);
  
  switch (taxType) {
    case TaxType.INCOME_TAX:
      // Income tax due dates: March 10, June 10, September 10, December 10
      switch (quarter) {
        case TaxQuarter.Q1: date.setMonth(2, 10); break; // March 10
        case TaxQuarter.Q2: date.setMonth(5, 10); break; // June 10
        case TaxQuarter.Q3: date.setMonth(8, 10); break; // September 10
        case TaxQuarter.Q4: date.setMonth(11, 10); break; // December 10
      }
      break;
    case TaxType.TRADE_TAX:
      // Trade tax due dates: February 15, May 15, August 15, November 15
      switch (quarter) {
        case TaxQuarter.Q1: date.setMonth(1, 15); break; // February 15
        case TaxQuarter.Q2: date.setMonth(4, 15); break; // May 15
        case TaxQuarter.Q3: date.setMonth(7, 15); break; // August 15
        case TaxQuarter.Q4: date.setMonth(10, 15); break; // November 15
      }
      break;
  }
  
  return date;
}

/**
 * Represents a payment schedule for quarterly tax payments
 */
export interface PaymentSchedule {
  id: string;
  year: number;
  payments: TaxPayment[];
  generatedDate: Date;
  lastUpdated: Date;
}

/**
 * Creates a default payment schedule
 */
export const createDefaultPaymentSchedule = (year: number): PaymentSchedule => ({
  id: uuidv4(),
  year,
  payments: [],
  generatedDate: new Date(),
  lastUpdated: new Date()
});

/**
 * Generates a full payment schedule for a given year and estimated tax amounts
 */
export function generatePaymentSchedule(
  year: number, 
  estimatedIncomeTax: number, 
  estimatedTradeTax: number
): PaymentSchedule {
  const schedule = createDefaultPaymentSchedule(year);
  const quarters = [TaxQuarter.Q1, TaxQuarter.Q2, TaxQuarter.Q3, TaxQuarter.Q4];
  
  // Add income tax payments (quarterly)
  quarters.forEach(quarter => {
    const payment = createDefaultTaxPayment(TaxType.INCOME_TAX, quarter, year);
    payment.amount = Math.round(estimatedIncomeTax / 4); // Divide yearly amount by 4
    schedule.payments.push(payment);
  });
  
  // Add trade tax payments (quarterly)
  quarters.forEach(quarter => {
    const payment = createDefaultTaxPayment(TaxType.TRADE_TAX, quarter, year);
    payment.amount = Math.round(estimatedTradeTax / 4); // Divide yearly amount by 4
    schedule.payments.push(payment);
  });
  
  return schedule;
}

/**
 * Represents a tax assessment received from the tax office
 */
export interface TaxAssessment {
  id: string;
  taxType: TaxType;
  year: number;
  assessmentDate: Date;
  assessedAmount: number;
  prepaymentAmount: number; // New quarterly prepayment amount after assessment
  effectiveFrom: TaxQuarter; // From which quarter the new amount applies
  notes?: string;
  documentReference?: string;
}

/**
 * Creates a default tax assessment
 */
export const createDefaultTaxAssessment = (
  taxType: TaxType,
  year: number
): TaxAssessment => ({
  id: uuidv4(),
  taxType,
  year,
  assessmentDate: new Date(),
  assessedAmount: 0,
  prepaymentAmount: 0,
  effectiveFrom: TaxQuarter.Q1
}); 