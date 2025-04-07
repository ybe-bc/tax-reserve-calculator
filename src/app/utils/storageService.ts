import { 
  PaymentSchedule,
  TaxAssessment,
  TaxPayment
} from '../types/paymentManagement';

// localStorage keys
const STORAGE_KEYS = {
  PAYMENT_SCHEDULES: 'gbr-tax-manager-payment-schedules',
  TAX_ASSESSMENTS: 'gbr-tax-manager-tax-assessments',
};

// Helper to serialize dates before storing in localStorage
const serializeData = (data: any): string => {
  return JSON.stringify(data, (key, value) => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      return { __type: 'date', value: value.toISOString() };
    }
    return value;
  });
};

// Helper to deserialize dates when retrieving from localStorage
const deserializeData = <T>(jsonString: string | null): T | null => {
  if (!jsonString) return null;
  
  return JSON.parse(jsonString, (key, value) => {
    // Convert ISO strings back to Date objects
    if (value && typeof value === 'object' && value.__type === 'date') {
      return new Date(value.value);
    }
    return value;
  }) as T;
};

/**
 * Storage service for tax payment data
 */
export const storageService = {
  /**
   * Save payment schedules to localStorage
   */
  savePaymentSchedules(schedules: PaymentSchedule[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_SCHEDULES, serializeData(schedules));
  },

  /**
   * Get payment schedules from localStorage
   */
  getPaymentSchedules(): PaymentSchedule[] {
    const data = deserializeData<PaymentSchedule[]>(
      localStorage.getItem(STORAGE_KEYS.PAYMENT_SCHEDULES)
    );
    return data || [];
  },

  /**
   * Save tax assessments to localStorage
   */
  saveTaxAssessments(assessments: TaxAssessment[]): void {
    localStorage.setItem(STORAGE_KEYS.TAX_ASSESSMENTS, serializeData(assessments));
  },

  /**
   * Get tax assessments from localStorage
   */
  getTaxAssessments(): TaxAssessment[] {
    const data = deserializeData<TaxAssessment[]>(
      localStorage.getItem(STORAGE_KEYS.TAX_ASSESSMENTS)
    );
    return data || [];
  },

  /**
   * Get payment schedule by year
   */
  getPaymentScheduleByYear(year: number): PaymentSchedule | undefined {
    const schedules = this.getPaymentSchedules();
    return schedules.find(schedule => schedule.year === year);
  },

  /**
   * Save or update a payment schedule
   */
  savePaymentSchedule(schedule: PaymentSchedule): void {
    const schedules = this.getPaymentSchedules();
    const index = schedules.findIndex(s => s.id === schedule.id);
    
    if (index >= 0) {
      // Update existing schedule
      schedule.lastUpdated = new Date();
      schedules[index] = schedule;
    } else {
      // Add new schedule
      schedules.push(schedule);
    }
    
    this.savePaymentSchedules(schedules);
  },

  /**
   * Update a tax payment
   */
  updateTaxPayment(scheduleId: string, payment: TaxPayment): void {
    const schedules = this.getPaymentSchedules();
    const scheduleIndex = schedules.findIndex(s => s.id === scheduleId);
    
    if (scheduleIndex >= 0) {
      const schedule = schedules[scheduleIndex];
      const paymentIndex = schedule.payments.findIndex(p => p.id === payment.id);
      
      if (paymentIndex >= 0) {
        // Update the payment
        schedule.payments[paymentIndex] = payment;
        schedule.lastUpdated = new Date();
        this.savePaymentSchedules(schedules);
      }
    }
  },

  /**
   * Clear all stored payment data
   */
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PAYMENT_SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.TAX_ASSESSMENTS);
  }
}; 