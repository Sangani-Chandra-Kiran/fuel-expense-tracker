
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateFuelEntry
} from '../src/fuel/fuel-validation.js';

describe('Fuel Entry Validation', () => {
  const validEntry = {
    date: '2026-11-20',
    amount: 1500,
    litres: 15
  };

  it('accepts a valid fuel entry', () => {
    assert.equal(
      validateFuelEntry(validEntry).valid,
      true
    );
  });

  it('rejects zero amount', () => {
    const result = validateFuelEntry({
      ...validEntry,
      amount: 0
    });

    assert.equal(result.valid, false);
  });

  it('rejects negative litres', () => {
    const result = validateFuelEntry({
      ...validEntry,
      litres: -5
    });

    assert.equal(result.valid, false);
  });

  it('rejects invalid dates', () => {
    const result = validateFuelEntry({
      ...validEntry,
      date: '2026-02-30'
    });

    assert.equal(result.valid, false);
  });

  it('rejects future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const date = [
      futureDate.getFullYear(),
      String(futureDate.getMonth() + 1).padStart(2, '0'),
      String(futureDate.getDate()).padStart(2, '0')
    ].join('-');

    const result = validateFuelEntry({
      ...validEntry,
      date
    });

    assert.equal(result.valid, false);
  });

  it('rejects missing entries', () => {
    assert.equal(
      validateFuelEntry(null).valid,
      false
    );
  });

  it('rejects non-numeric amounts', () => {
    const result = validateFuelEntry({
      ...validEntry,
      amount: 'invalid'
    });

    assert.equal(result.valid, false);
  });
});
