
export const STORAGE_KEYS = {
  entries: 'fuel-tracker-entries-v1',
  budgets: 'fuel-tracker-budgets-v1'
};

function getStorage(storage) {
  const target = storage ?? globalThis.localStorage;

  if (!target) {
    throw new Error('Browser storage is unavailable.');
  }

  return target;
}

function readJSON(key, fallback, storage) {
  const target = getStorage(storage);
  const raw = target.getItem(key);

  if (raw === null) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    // Preserve corrupted data for manual recovery.
    try {
      target.setItem(`${key}.corrupt`, raw);
    } catch {
      // Recovery copy may fail if storage is full.
    }

    return fallback;
  }
}

export function loadEntries(storage) {
  const value = readJSON(
    STORAGE_KEYS.entries,
    [],
    storage
  );

  return Array.isArray(value) ? value : [];
}

export function saveEntries(records, storage) {
  if (!Array.isArray(records)) {
    throw new TypeError('Fuel records must be an array.');
  }

  getStorage(storage).setItem(
    STORAGE_KEYS.entries,
    JSON.stringify(records)
  );
}

export function loadBudgets(storage) {
  const value = readJSON(
    STORAGE_KEYS.budgets,
    {},
    storage
  );

  return value &&
    typeof value === 'object' &&
    !Array.isArray(value)
      ? value
      : {};
}

export function saveBudgets(budgets, storage) {
  if (
    !budgets ||
    typeof budgets !== 'object' ||
    Array.isArray(budgets)
  ) {
    throw new TypeError('Budgets must be an object.');
  }

  getStorage(storage).setItem(
    STORAGE_KEYS.budgets,
    JSON.stringify(budgets)
  );
}
