
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createBackup,
  restoreBackup
} from '../src/storage/backup-manager.js';

const records = [
  {
    id: 'fuel-1',
    date: '2026-11-20',
    amount: 1500,
    litres: 12.5,
    price: 120
  }
];

const budgets = {
  '2026-11': 5000
};

describe('Backup Manager', () => {
  it('creates a valid JSON backup', () => {
    const backup = JSON.parse(createBackup(records, budgets));

    assert.equal(backup.version, 1);
    assert.deepEqual(backup.records, records);
    assert.deepEqual(backup.budgets, budgets);
    assert.ok(backup.createdAt);
  });

  it('restores valid backup data', () => {
    const json = createBackup(records, budgets);
    const restored = restoreBackup(json);

    assert.deepEqual(restored.records, records);
    assert.deepEqual(restored.budgets, budgets);
  });

  it('rejects invalid JSON', () => {
    assert.throws(
      () => restoreBackup('{invalid json'),
      /invalid JSON/
    );
  });

  it('rejects missing records', () => {
    assert.throws(
      () => restoreBackup(JSON.stringify({ budgets })),
      /records array/
    );
  });

  it('rejects invalid fuel records', () => {
    const backup = JSON.stringify({
      records: [{ id: 'fuel-1', amount: -10, litres: 5, date: '2026-11-20' }],
      budgets
    });

    assert.throws(
      () => restoreBackup(backup),
      /invalid fuel record/
    );
  });

  it('rejects invalid budgets', () => {
    const backup = JSON.stringify({
      records,
      budgets: { '2026-13': 5000 }
    });

    assert.throws(
      () => restoreBackup(backup),
      /invalid budget/
    );
  });

  it('supports an empty backup', () => {
    const restored = restoreBackup(
      createBackup([], {})
    );

    assert.deepEqual(restored, {
      records: [],
      budgets: {}
    });
  });
});
