
import { calculateSummary } from '../fuel/fuel-calculator.js';

export function generateMonthlyReport(records, month) {
  if (!Array.isArray(records)) {
    throw new TypeError('Records must be an array.');
  }

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new TypeError('Month must use YYYY-MM format.');
  }

  const monthlyRecords = records.filter(record =>
    typeof record.date === 'string' &&
    record.date.startsWith(`${month}-`)
  );

  const summary = calculateSummary(monthlyRecords);

  const highestTransaction = monthlyRecords.reduce(
    (highest, record) =>
      !highest || Number(record.amount) > Number(highest.amount)
        ? record
        : highest,
    null
  );

  return {
    month,
    totalSpend: summary.totalSpend,
    totalLitres: summary.totalLitres,
    averagePrice: summary.averagePrice,
    transactionCount: monthlyRecords.length,
    highestTransaction
  };
}
