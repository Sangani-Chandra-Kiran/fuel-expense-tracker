
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateCSV
} from '../src/export/csv-export.js';

describe('CSV Export', () => {
  it('generates CSV headers', () => {
    const csv = generateCSV([]);

    assert.equal(
      csv,
      'Date,Amount (INR),Litres,Price Per Litre (INR)'
    );
  });

  it('exports fuel transactions', () => {
    const records = [
      {
        date: '2026-11-20',
        amount: 1500,
        litres: 15,
        price: 100
      }
    ];

    const csv = generateCSV(records);

    assert.ok(csv.includes('2026-11-20,1500.00,15.00,100.00'));
  });

  it('exports multiple transactions', () => {
    const records = [
      {
        date: '2026-11-20',
        amount: 1500,
        litres: 15,
        price: 100
      },
      {
        date: '2026-11-21',
        amount: 2000,
        litres: 20,
        price: 100
      }
    ];

    assert.equal(generateCSV(records).split('\r\n').length, 3);
  });

  it('escapes commas and quotation marks', () => {
    const csv = generateCSV([
      {
        date: 'Test, "Date"',
        amount: 100,
        litres: 1,
        price: 100
      }
    ]);

    assert.ok(csv.includes('"Test, ""Date"""'));
  });

  it('rejects invalid transaction data', () => {
    assert.throws(
      () => generateCSV([
        {
          date: '2026-11-20',
          amount: 'invalid',
          litres: 10,
          price: 100
        }
      ]),
      TypeError
    );
  });

  it('rejects non-array input', () => {
    assert.throws(
      () => generateCSV({}),
      TypeError
    );
  });
});
