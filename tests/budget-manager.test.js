
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  setMonthlyBudget,
  getBudgetStatus
} from '../src/budget/budget-manager.js';

describe('Budget Manager', () => {
  const records = [
    { date: '2026-11-05', amount: 2000, litres: 20 },
    { date: '2026-11-15', amount: 3000, litres: 30 },
    { date: '2026-10-10', amount: 1000, litres: 10 }
  ];

  it('sets a monthly budget', () => {
    assert.deepEqual(
      setMonthlyBudget({}, '2026-11', 8000),
      { '2026-11': 8000 }
    );
  });

  it('updates an existing monthly budget', () => {
    const result = setMonthlyBudget(
      { '2026-11': 5000 },
      '2026-11',
      9000
    );

    assert.equal(result['2026-11'], 9000);
  });

  it('rejects invalid budget amounts', () => {
    assert.throws(
      () => setMonthlyBudget({}, '2026-11', -100),
      RangeError
    );
  });

  it('rejects invalid months', () => {
    assert.throws(
      () => setMonthlyBudget({}, '2026-13', 8000),
      TypeError
    );
  });

  it('calculates monthly spending', () => {
    const status = getBudgetStatus(
      records,
      { '2026-11': 8000 },
      '2026-11'
    );

    assert.equal(status.spent, 5000);
  });

  it('calculates remaining budget', () => {
    const status = getBudgetStatus(
      records,
      { '2026-11': 8000 },
      '2026-11'
    );

    assert.equal(status.remaining, 3000);
  });

  it('calculates percentage used', () => {
    const status = getBudgetStatus(
      records,
      { '2026-11': 8000 },
      '2026-11'
    );

    assert.equal(status.percentageUsed, 62.5);
  });

  it('detects budget exceeded', () => {
    const status = getBudgetStatus(
      records,
      { '2026-11': 4000 },
      '2026-11'
    );

    assert.equal(status.exceeded, true);
  });

  it('handles months without a configured budget', () => {
    const status = getBudgetStatus(
      records,
      {},
      '2026-11'
    );

    assert.equal(status.hasBudget, false);
    assert.equal(status.spent, 5000);
  });
});
