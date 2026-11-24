
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getFuelStatistics } from '../src/analytics/fuel-statistics.js';

describe('getFuelStatistics', () => {
  it('returns zero statistics for empty records', () => {
    assert.deepEqual(getFuelStatistics([]), {
      transactionCount: 0,
      totalSpend: 0,
      totalLitres: 0,
      averageFillAmount: 0,
      highestPrice: 0,
      lowestPrice: 0,
    });
  });

  it('calculates fuel statistics correctly', () => {
    const records = [
      { amount: 1500, litres: 12.5 },
      { amount: 1000, litres: 10 },
    ];

    const result = getFuelStatistics(records);

    assert.equal(result.transactionCount, 2);
    assert.equal(result.totalSpend, 2500);
    assert.equal(result.totalLitres, 22.5);
    assert.equal(result.averageFillAmount, 1250);
    assert.equal(result.highestPrice, 120);
    assert.equal(result.lowestPrice, 100);
  });

  it('ignores invalid records', () => {
    const records = [
      { amount: 1500, litres: 12.5 },
      { amount: -100, litres: 10 },
      { amount: 500, litres: 0 },
    ];

    assert.equal(getFuelStatistics(records).transactionCount, 1);
  });

  it('handles non-array input', () => {
    assert.equal(getFuelStatistics(null).transactionCount, 0);
  });
});
