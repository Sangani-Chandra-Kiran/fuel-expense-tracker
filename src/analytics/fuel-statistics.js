
export function getFuelStatistics(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      transactionCount: 0,
      totalSpend: 0,
      totalLitres: 0,
      averageFillAmount: 0,
      highestPrice: 0,
      lowestPrice: 0,
    };
  }

  const validRecords = records.filter(
    (record) =>
      Number.isFinite(Number(record.amount)) &&
      Number.isFinite(Number(record.litres)) &&
      Number(record.amount) > 0 &&
      Number(record.litres) > 0
  );

  if (validRecords.length === 0) {
    return getFuelStatistics([]);
  }

  const prices = validRecords.map(
    (record) => Number(record.amount) / Number(record.litres)
  );

  const totalSpend = validRecords.reduce(
    (sum, record) => sum + Number(record.amount),
    0
  );

  const totalLitres = validRecords.reduce(
    (sum, record) => sum + Number(record.litres),
    0
  );

  return {
    transactionCount: validRecords.length,
    totalSpend,
    totalLitres,
    averageFillAmount: totalSpend / validRecords.length,
    highestPrice: Math.max(...prices),
    lowestPrice: Math.min(...prices),
  };
}
