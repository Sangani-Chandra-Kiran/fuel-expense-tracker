
export function calculatePricePerLitre(amount, litres) {
  const cost = Number(amount);
  const quantity = Number(litres);

  if (
    !Number.isFinite(cost) ||
    !Number.isFinite(quantity) ||
    cost <= 0 ||
    quantity <= 0
  ) {
    throw new RangeError(
      'Amount and litres must be positive numbers.'
    );
  }

  return cost / quantity;
}

export function calculateSummary(records) {
  if (!Array.isArray(records)) {
    throw new TypeError('Records must be an array.');
  }

  const summary = records.reduce(
    (result, record) => {
      const amount = Number(record.amount);
      const litres = Number(record.litres);

      if (
        !Number.isFinite(amount) ||
        !Number.isFinite(litres) ||
        amount < 0 ||
        litres < 0
      ) {
        throw new RangeError('Invalid fuel record.');
      }

      result.totalSpend += amount;
      result.totalLitres += litres;

      return result;
    },
    {
      totalSpend: 0,
      totalLitres: 0
    }
  );

  return {
    totalSpend: summary.totalSpend,
    totalLitres: summary.totalLitres,
    averagePrice: summary.totalLitres > 0
      ? summary.totalSpend / summary.totalLitres
      : 0
  };
}

export function calculateMonthlySpend(records, month) {
  if (!Array.isArray(records)) {
    throw new TypeError('Records must be an array.');
  }

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new TypeError('Month must use YYYY-MM format.');
  }

  return records
    .filter(record =>
      typeof record.date === 'string' &&
      record.date.startsWith(`${month}-`)
    )
    .reduce((total, record) => {
      const amount = Number(record.amount);

      if (!Number.isFinite(amount) || amount < 0) {
        throw new RangeError('Invalid fuel amount.');
      }

      return total + amount;
    }, 0);
}
