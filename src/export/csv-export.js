
const HEADERS = [
  'Date',
  'Amount (INR)',
  'Litres',
  'Price Per Litre (INR)'
];

function escapeCSV(value) {
  const text = String(value ?? '');

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function generateCSV(records) {
  if (!Array.isArray(records)) {
    throw new TypeError('Records must be an array.');
  }

  const rows = records.map(record => {
    const amount = Number(record.amount);
    const litres = Number(record.litres);
    const price = Number(record.price);

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(litres) ||
      !Number.isFinite(price)
    ) {
      throw new TypeError('Invalid transaction data.');
    }

    return [
      record.date,
      amount.toFixed(2),
      litres.toFixed(2),
      price.toFixed(2)
    ].map(escapeCSV).join(',');
  });

  return [
    HEADERS.join(','),
    ...rows
  ].join('\r\n');
}

export function downloadCSV(records) {
  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof Blob === 'undefined'
  ) {
    throw new Error('CSV download requires a browser.');
  }

  const csv = generateCSV(records);
  const blob = new Blob(
    ['\uFEFF', csv],
    { type: 'text/csv;charset=utf-8;' }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'fuel-expenses.csv';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
