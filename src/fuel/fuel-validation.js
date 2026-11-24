
function isValidDate(date) {
  if (typeof date !== 'string') return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date;
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function validateFuelEntry(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return {
      valid: false,
      errors: ['Invalid fuel entry.']
    };
  }

  if (!isValidDate(entry.date)) {
    errors.push('Enter a valid date.');
  } else if (entry.date > getLocalDate()) {
    errors.push('Fuel entry date cannot be in the future.');
  }

  const amount = Number(entry.amount);
  const litres = Number(entry.litres);

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('Amount must be greater than zero.');
  }

  if (!Number.isFinite(litres) || litres <= 0) {
    errors.push('Litres must be greater than zero.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
