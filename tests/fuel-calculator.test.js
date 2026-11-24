
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculatePricePerLitre,
  calculateSummary,
  calculateMonthlySpend
} from '../src/fuel/fuel-calculator.js';

describe('Fuel Calculator', () => {
  it('calculates price per litre', () => {
    assert.equal(calculatePricePerLitre(1500, 15), 100);
  });

  it('rejects zero litres', () => {
    assert.throws(
      () => calculatePricePerLitre(1500, 0),
      RangeError
    );
  });

  it('calculates total spending and litres', () => {
    const records = [
      { amount: 1500, litres: 15 },
      { amount: 1000, litres: 10 }
    ];

    assert.deepEqual(calculateSummary(records), {
      totalSpend: 2500,
      totalLitres: 25,
      averagePrice: 100
    });
  });

  it('returns zero averages for empty records', () => {
    assert.deepEqual(calculateSummary([]), {
      totalSpend: 0,
      totalLitres: 0,
      averagePrice: 0
    });
  });

  it('rejects invalid fuel records', () => {
    assert.throws(
      () => calculateSummary([
        { amount: -100, litres: 10 }
      ]),
      RangeError
    );
  });

  it('calculates monthly spending', () => {
    const records = [
      { date: '2026-11-02', amount: 1500 },
      { date: '2026-11-12', amount: 1000 },
      { date: '2026-10-20', amount: 500 }
    ];

    assert.equal(
      calculateMonthlySpend(records, '2026-11'),
      2500
    );
  });

  it('returns zero when a month has no transactions', () => {
    assert.equal(
      calculateMonthlySpend([], '2026-11'),
      0
    );
  });

  it('rejects invalid month format', () => {
    assert.throws(
      () => calculateMonthlySpend([], 'November'),
      TypeError
    );
  });
});
