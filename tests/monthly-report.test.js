
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateMonthlyReport
} from '../src/analytics/monthly-report.js';

describe('Monthly Reports', () => {
  const records = [
    {
      id: '1',
      date: '2026-11-05',
      amount: 2000,
      litres: 20
    },
    {
      id: '2',
      date: '2026-11-15',
      amount: 3000,
      litres: 30
    },
    {
      id: '3',
      date: '2026-10-10',
      amount: 1000,
      litres: 10
    }
  ];

  it('calculates monthly total spending', () => {
    const report = generateMonthlyReport(records, '2026-11');
    assert.equal(report.totalSpend, 5000);
  });

  it('calculates total litres', () => {
    const report = generateMonthlyReport(records, '2026-11');
    assert.equal(report.totalLitres, 50);
  });

  it('calculates average price per litre', () => {
    const report = generateMonthlyReport(records, '2026-11');
    assert.equal(report.averagePrice, 100);
  });

  it('counts monthly transactions', () => {
    const report = generateMonthlyReport(records, '2026-11');
    assert.equal(report.transactionCount, 2);
  });

  it('identifies the highest transaction', () => {
    const report = generateMonthlyReport(records, '2026-11');
    assert.equal(report.highestTransaction.id, '2');
  });

  it('returns zero totals for an empty month', () => {
    const report = generateMonthlyReport([], '2026-11');

    assert.equal(report.totalSpend, 0);
    assert.equal(report.totalLitres, 0);
    assert.equal(report.transactionCount, 0);
    assert.equal(report.highestTransaction, null);
  });

  it('rejects an invalid month', () => {
    assert.throws(
      () => generateMonthlyReport(records, 'November'),
      TypeError
    );
  });
});
