
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createFuelEntry,
  updateFuelEntry,
  deleteFuelEntry
} from '../src/fuel/fuel-entry.js';

describe('Fuel Entry Management', () => {
  const validInput = {
    date: '2026-11-20',
    amount: 1500,
    litres: 15
  };

  const existingRecords = [
    {
      id: '101',
      date: '2026-11-10',
      amount: 1000,
      litres: 10,
      price: 100
    }
  ];

  it('creates a new fuel entry', () => {
    const entry = createFuelEntry(
      validInput,
      () => '102'
    );

    assert.equal(entry.id, '102');
    assert.equal(entry.amount, 1500);
    assert.equal(entry.litres, 15);
    assert.equal(entry.price, 100);
  });

  it('rejects invalid fuel entries', () => {
    assert.throws(
      () => createFuelEntry({
        ...validInput,
        amount: -100
      }),
      Error
    );
  });

  it('updates an existing entry', () => {
    const updated = updateFuelEntry(
      existingRecords,
      '101',
      {
        date: '2026-11-20',
        amount: 2000,
        litres: 20
      }
    );

    assert.equal(updated[0].amount, 2000);
    assert.equal(updated[0].price, 100);
  });

  it('does not modify the original records', () => {
    const original = [...existingRecords];

    updateFuelEntry(
      existingRecords,
      '101',
      validInput
    );

    assert.deepEqual(existingRecords, original);
  });

  it('rejects updates for missing entries', () => {
    assert.throws(
      () => updateFuelEntry(
        existingRecords,
        '999',
        validInput
      ),
      /not found/
    );
  });

  it('deletes an existing entry', () => {
    const remaining = deleteFuelEntry(
      existingRecords,
      '101'
    );

    assert.equal(remaining.length, 0);
  });

  it('does not modify the original array when deleting', () => {
    const original = [...existingRecords];

    deleteFuelEntry(existingRecords, '101');

    assert.deepEqual(existingRecords, original);
  });

  it('rejects deletion of missing entries', () => {
    assert.throws(
      () => deleteFuelEntry(existingRecords, '999'),
      /not found/
    );
  });
});
