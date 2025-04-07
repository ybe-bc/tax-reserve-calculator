import { ExportData, PartnerReserveData } from '../types';

// Helper function to convert data to CSV format
export const exportToCSV = (data: ExportData): void => {
  const { date, gbrData, partners, results, taxYear } = data;
  
  // Create header row
  let csvContent = 'Date,Tax Year,Monthly Profit,Partner Name,Share (%),Yearly Income,Effective Tax Rate (%),Monthly Profit,Monthly Reserve,Annual Profit,Income Tax,Solidarity Surcharge,Church Tax,Total Tax\n';
  
  // Add data rows
  if (results) {
    results.partnerReserves.forEach((partnerReserve: PartnerReserveData) => {
      // Find the partner
      const partner = partners.find(p => p.id === partnerReserve.partnerId);
      if (!partner) return;
      
      csvContent += [
        date,
        taxYear,
        gbrData.monthlyProfit,
        partner.name,
        partnerReserve.share.toFixed(1),
        partner.yearlyIncome,
        (partnerReserve.effectiveTaxRate * 100).toFixed(1),
        partnerReserve.monthlyProfit.toFixed(2),
        partnerReserve.reserveAmount.toFixed(2),
        partnerReserve.annualProfit.toFixed(2),
        partnerReserve.taxDetails.incomeTax.toFixed(2),
        partnerReserve.taxDetails.solidaritySurcharge.toFixed(2),
        partnerReserve.taxDetails.churchTax.toFixed(2),
        partnerReserve.taxDetails.totalTax.toFixed(2)
      ].join(',') + '\n';
    });
    
    // Add total row
    csvContent += [
      date,
      taxYear,
      gbrData.monthlyProfit,
      'TOTAL',
      '100.0',
      '',
      (results.weightedAverageTaxRate * 100).toFixed(1),
      gbrData.monthlyProfit.toFixed(2),
      results.totalReserveAmount.toFixed(2),
      gbrData.monthlyProfit * 12,
      '',
      '',
      '',
      results.annualTaxBurden.toFixed(2)
    ].join(',') + '\n';
  }
  
  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tax-reserve-calculation-${date}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to export data as JSON
export const exportToJSON = (data: ExportData): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tax-reserve-calculation-${data.date}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to generate a simple PDF
export const exportToPDF = async (data: ExportData): Promise<void> => {
  try {
    // Dynamically import jspdf and jspdf-autotable
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    const { date, gbrData, partners, results, taxYear } = data;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Tax Reserve Calculation', 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${date}`, 14, 30);
    doc.text(`Tax Year: ${taxYear}`, 14, 35);
    doc.text(`Monthly Profit: €${gbrData.monthlyProfit.toFixed(2)}`, 14, 40);
    doc.text(`Total Reserve Rate: ${(results ? results.totalReservePercentage * 100 : 0).toFixed(1)}%`, 14, 45);
    doc.text(`Monthly Reserve Amount: €${(results ? results.totalReserveAmount : 0).toFixed(2)}`, 14, 50);
    
    // Add partner data
    if (results) {
      // Summary table
      const summaryData = results.partnerReserves.map(pr => {
        const partner = partners.find(p => p.id === pr.partnerId);
        return [
          partner?.name || '',
          `${pr.share.toFixed(1)}%`,
          `€${partner?.yearlyIncome.toFixed(2) || '0.00'}`,
          `${(pr.effectiveTaxRate * 100).toFixed(1)}%`,
          `€${pr.monthlyProfit.toFixed(2)}`,
          `€${pr.reserveAmount.toFixed(2)}`
        ];
      });
      
      // Add total row
      summaryData.push([
        'TOTAL',
        '100.0%',
        '',
        `${(results.weightedAverageTaxRate * 100).toFixed(1)}%`,
        `€${gbrData.monthlyProfit.toFixed(2)}`,
        `€${results.totalReserveAmount.toFixed(2)}`
      ]);
      
      // Create summary table
      autoTable(doc, {
        startY: 60,
        head: [['Partner', 'Share', 'Yearly Income', 'Tax Rate', 'Monthly Profit', 'Monthly Reserve']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Detailed tax table (new page)
      const detailY = doc.lastAutoTable?.finalY + 15 || 130;
      if (detailY > 180) {
        doc.addPage();
        doc.text('Detailed Tax Information', 14, 20);
        doc.setFontSize(8);
        autoTable(doc, {
          startY: 30,
          head: [['Partner', 'Annual Profit', 'Income Tax', 'Solidarity', 'Church Tax', 'Total Tax']],
          body: results.partnerReserves.map(pr => [
            pr.partnerName,
            `€${pr.annualProfit.toFixed(2)}`,
            `€${pr.taxDetails.incomeTax.toFixed(2)}`,
            `€${pr.taxDetails.solidaritySurcharge.toFixed(2)}`,
            `€${pr.taxDetails.churchTax.toFixed(2)}`,
            `€${pr.taxDetails.totalTax.toFixed(2)}`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [66, 66, 66] }
        });
      } else {
        doc.text('Detailed Tax Information', 14, detailY);
        doc.setFontSize(8);
        autoTable(doc, {
          startY: detailY + 10,
          head: [['Partner', 'Annual Profit', 'Income Tax', 'Solidarity', 'Church Tax', 'Total Tax']],
          body: results.partnerReserves.map(pr => [
            pr.partnerName,
            `€${pr.annualProfit.toFixed(2)}`,
            `€${pr.taxDetails.incomeTax.toFixed(2)}`,
            `€${pr.taxDetails.solidaritySurcharge.toFixed(2)}`,
            `€${pr.taxDetails.churchTax.toFixed(2)}`,
            `€${pr.taxDetails.totalTax.toFixed(2)}`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [66, 66, 66] }
        });
      }
      
      // Add disclaimer
      const lastY = doc.lastAutoTable?.finalY + 15 || 200;
      if (lastY > doc.internal.pageSize.height - 30) {
        doc.addPage();
        doc.setFontSize(8);
        doc.text('This calculation is based on the current German income tax law and serves as a guideline.', 14, 20);
        doc.text('For precise tax advice, please consult a tax advisor.', 14, 25);
      } else {
        doc.setFontSize(8);
        doc.text('This calculation is based on the current German income tax law and serves as a guideline.', 14, lastY);
        doc.text('For precise tax advice, please consult a tax advisor.', 14, lastY + 5);
      }
    }
    
    // Save the PDF
    doc.save(`tax-reserve-calculation-${date}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Failed to generate PDF. Please make sure you have a stable internet connection and try again.');
  }
}; 