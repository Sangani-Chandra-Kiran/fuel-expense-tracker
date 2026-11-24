
import { calculateMonthlySpend } from '../fuel/fuel-calculator.js';

function isValidMonth(month) {
  return typeof month === 'string' &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function setMonthlyBudget(budgets, month, amount) {
  if (!budgets || typeof budgets !== 'object' ||
      Array.isArray(budgets)) {
    throw new TypeError('Budgets must be an object.');
  }

  if (!isValidMonth(month)) {
    throw new TypeError('Invalid month. Use YYYY-MM.');
  }

  const budget = Number(amount);

  if (!Number.isFinite(budget) || budget <= 0) {
    throw new RangeError('Budget must be greater than zero.');
  }

  return {
    ...budgets,
    [month]: budget
  };
}

export function getBudgetStatus(records, budgets, month) {
  if (!isValidMonth(month)) {
    throw new TypeError('Invalid month. Use YYYY-MM.');
  }

  const budget = Number(budgets?.[month] ?? 0);

  if (!Number.isFinite(budget) || budget < 0) {
    throw new RangeError('Invalid monthly budget.');
  }

  const spent = calculateMonthlySpend(records, month);
  const remaining = budget - spent;
  const percentageUsed = budget > 0
    ? (spent / budget) * 100
    : 0;

  return {
    month,
    budget,
    spent,
    remaining,
    percentageUsed,
    exceeded: budget > 0 && spent > budget,
    hasBudget: budget > 0
  };
}
