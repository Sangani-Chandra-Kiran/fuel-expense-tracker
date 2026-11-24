
import { validateFuelEntry } from './fuel-validation.js';
import { calculatePricePerLitre } from './fuel-calculator.js';

function assertValidEntry(entry) {
  const result = validateFuelEntry(entry);

  if (!result.valid) {
    throw new Error(result.errors.join(' '));
  }
}

function defaultIdFactory() {
  return globalThis.crypto.randomUUID();
}

export function createFuelEntry(input, idFactory = defaultIdFactory) {
  assertValidEntry(input);

  const amount = Number(input.amount);
  const litres = Number(input.litres);

  return {
    id: idFactory(),
    date: input.date,
    amount,
    litres,
    price: calculatePricePerLitre(amount, litres)
  };
}

export function updateFuelEntry(records, id, input) {
  if (!Array.isArray(records)) {
    throw new TypeError('Records must be an array.');
  }

  const index = records.findIndex(record => record.id === id);

  if (index === -1) {
    throw new Error('Fuel entry not found.');
  }

  assertValidEntry(input);

  const updatedEntry = {
    id,
    date: input.date,
    amount: Number(input.amount),
    litres: Number(input.litres),
    price: calculatePricePerLitre(
      input.amount,
      input.litres
    )
  };

  return records.map((record, currentIndex) =>
    currentIndex === index ? updatedEntry : record
  );
}

export function deleteFuelEntry(records, id) {
  if (!Array.isArray(records)) {
    throw new TypeError('Records must be an array.');
  }

  if (!records.some(record => record.id === id)) {
    throw new Error('Fuel entry not found.');
  }

  return records.filter(record => record.id !== id);
}
