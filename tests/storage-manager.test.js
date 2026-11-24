
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  STORAGE_KEYS,
  loadEntries,
  saveEntries,
  loadBudgets,
  saveBudgets
} from '../src/storage/storage-manager.js';

function createStorage(initial = {}) {
  const data = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    }
  };
}

describe('Storage Manager', () => {
  it('returns an empty array when no entries exist', () => {
    const storage = createStorage();

    assert.deepEqual(loadEntries(storage), []);
  });

  it('saves and loads fuel entries', () => {
    const storage = createStorage();

    const records = [
      {
        id: '101',
        date: '2026-11-24',
        amount: 1500,
        litres: 15,
        price: 100
      }
    ];

    saveEntries(records, storage);

    assert.deepEqual(loadEntries(storage), records);
  });

  it('handles corrupted JSON without crashing', () => {
    const storage = createStorage({
      [STORAGE_KEYS.entries]: '{invalid json'
    });

    assert.deepEqual(loadEntries(storage), []);

    assert.equal(
      storage.getItem(`${STORAGE_KEYS.entries}.corrupt`),
      '{invalid json'
    );
  });

  it('rejects non-array fuel records', () => {
    const storage = createStorage();

    assert.throws(
      () => saveEntries({}, storage),
      TypeError
    );
  });

  it('saves and loads monthly budgets', () => {
    const storage = createStorage();

    const budgets = {
      '2026-11': 8000,
      '2026-12': 9000
    };

    saveBudgets(budgets, storage);

    assert.deepEqual(loadBudgets(storage), budgets);
  });

  it('returns empty budgets when stored JSON is invalid', () => {
    const storage = createStorage({
      [STORAGE_KEYS.budgets]: 'invalid'
    });

    assert.deepEqual(loadBudgets(storage), {});
  });

  it('rejects invalid budget data', () => {
    const storage = createStorage();

    assert.throws(
      () => saveBudgets([], storage),
      TypeError
    );
  });
});
