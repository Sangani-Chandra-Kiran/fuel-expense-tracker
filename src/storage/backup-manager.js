
function validateBackup(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid backup format');
  }

  if (!Array.isArray(data.records)) {
    throw new Error('Backup must contain a records array');
  }

  if (
    !data.budgets ||
    typeof data.budgets !== 'object' ||
    Array.isArray(data.budgets)
  ) {
    throw new Error('Backup must contain a budgets object');
  }

  for (const record of data.records) {
    if (
      !record ||
      typeof record !== 'object' ||
      typeof record.id !== 'string' ||
      typeof record.date !== 'string' ||
      !Number.isFinite(Number(record.amount)) ||
      !Number.isFinite(Number(record.litres)) ||
      Number(record.amount) <= 0 ||
      Number(record.litres) <= 0
    ) {
      throw new Error('Backup contains an invalid fuel record');
    }
  }

  for (const [month, amount] of Object.entries(data.budgets)) {
    if (
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      throw new Error('Backup contains an invalid budget');
    }
  }

  return true;
}

export function createBackup(records, budgets) {
  const backup = {
    version: 1,
    createdAt: new Date().toISOString(),
    records,
    budgets
  };

  validateBackup(backup);

  return JSON.stringify(backup, null, 2);
}

export function restoreBackup(json) {
  let data;

  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Backup file contains invalid JSON');
  }

  validateBackup(data);

  return {
    records: data.records,
    budgets: data.budgets
  };
}
