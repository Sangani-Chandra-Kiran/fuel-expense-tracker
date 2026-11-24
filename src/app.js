import {
  createBackup,
  restoreBackup
} from './storage/backup-manager.js';

import { getFuelStatistics } from './analytics/fuel-statistics.js';
import {
  loadEntries,
  saveEntries,
  loadBudgets,
  saveBudgets
} from './storage/storage-manager.js';

import {
  createFuelEntry,
  updateFuelEntry,
  deleteFuelEntry
} from './fuel/fuel-entry.js';

import {
  calculateSummary
} from './fuel/fuel-calculator.js';

import {
  setMonthlyBudget,
  getBudgetStatus
} from './budget/budget-manager.js';

import {
  generateMonthlyReport
} from './analytics/monthly-report.js';

import {
  downloadCSV
} from './export/csv-export.js';

const $ = id => document.getElementById(id);

let records = loadEntries();
let budgets = loadBudgets();

const money = value =>
  '₹' + Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

function today() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function currentMonth() {
  return today().slice(0, 7);
}

function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');

  setTimeout(() => {
    $('toast').classList.remove('show');
  }, 1800);
}

function persist() {
  saveEntries(records);
  render();
}

function resetForm() {
  $('fuelForm').reset();
  $('date').value = today();
  $('price').value = '—';
  $('editId').value = '';

  $('formTitle').textContent = 'Add fuel entry';
  $('submitBtn').textContent = 'Save entry';
  $('cancelEdit').style.display = 'none';
}

function updatePrice() {
  const amount = Number($('amount').value);
  const litres = Number($('litres').value);

  $('price').value =
    amount > 0 && litres > 0
      ? money(amount / litres)
      : '—';
}


function renderDashboard() {
  const summary = calculateSummary(records);
  const statistics = getFuelStatistics(records);

  $('totalSpend').textContent = money(summary.totalSpend);

  $('totalLitres').textContent =
    summary.totalLitres.toLocaleString('en-IN') + ' L';

  $('avgPrice').textContent = money(summary.averagePrice);

  $('totalTransactions').textContent =
    statistics.transactionCount;

  $('averageFillAmount').textContent =
    money(statistics.averageFillAmount);

  $('highestPrice').textContent =
    money(statistics.highestPrice);

  $('lowestPrice').textContent =
    money(statistics.lowestPrice);
}


function renderBudget() {
  const month = $('budgetMonth').value || currentMonth();
  const status = getBudgetStatus(records, budgets, month);

  $('budgetAmount').value = budgets[month] ?? '';

  $('budgetSpent').textContent = money(status.spent);
  $('budgetRemaining').textContent =
    money(status.remaining);

  $('budgetPercentage').textContent =
    `${status.percentageUsed.toFixed(1)}% used`;

  const progress = $('budgetProgress');
  const percentage = Math.min(status.percentageUsed, 100);

  progress.style.width = `${percentage}%`;

  progress.classList.toggle('over-budget', status.exceeded);

  $('budgetAlert').textContent = status.exceeded
    ? 'Monthly fuel budget exceeded!'
    : status.hasBudget
      ? 'You are within your monthly budget.'
      : 'Set a monthly budget to track spending.';
}

function renderHistory() {
  const months = [
    ...new Set(records.map(record => record.date.slice(0, 7)))
  ].sort().reverse();

  const selected = $('monthFilter').value;

  $('monthFilter').innerHTML =
    '<option value="all">All months</option>' +
    months.map(month => `
      <option value="${month}">
        ${new Date(month + '-02').toLocaleDateString(
          'en-IN',
          { month: 'long', year: 'numeric' }
        )}
      </option>
    `).join('');

  $('monthFilter').value =
    months.includes(selected) ? selected : 'all';

  const shown = records
    .filter(record =>
      $('monthFilter').value === 'all' ||
      record.date.startsWith($('monthFilter').value)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  $('entries').replaceChildren();

  shown.forEach(record => {
    const row = document.createElement('tr');

    const values = [
      new Date(record.date + 'T00:00:00')
        .toLocaleDateString('en-IN'),
      money(record.amount),
      `${record.litres} L`,
      money(record.price)
    ];

    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actions = document.createElement('td');
    const edit = document.createElement('button');
    const remove = document.createElement('button');

    edit.className = 'btn secondary';
    edit.textContent = 'Edit';
    edit.type = 'button';
    edit.addEventListener('click', () => editEntry(record.id));

    remove.className = 'btn danger';
    remove.textContent = 'Delete';
    remove.type = 'button';
    remove.addEventListener('click', () => removeEntry(record.id));

    actions.append(edit, remove);
    row.appendChild(actions);

    $('entries').appendChild(row);
  });

  $('empty').style.display = shown.length ? 'none' : 'block';
}

function render() {
  renderDashboard();
  renderHistory();
  renderBudget();
}

function editEntry(id) {
  const record = records.find(item => item.id === id);

  if (!record) return;

  $('editId').value = record.id;
  $('date').value = record.date;
  $('amount').value = record.amount;
  $('litres').value = record.litres;

  updatePrice();

  $('formTitle').textContent = 'Edit fuel entry';
  $('submitBtn').textContent = 'Update entry';
  $('cancelEdit').style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function removeEntry(id) {
  if (!confirm('Delete this fuel entry?')) return;

  try {
    records = deleteFuelEntry(records, id);
    persist();
    notify('Entry deleted');
  } catch (error) {
    notify(error.message);
  }
}

$('fuelForm').addEventListener('submit', event => {
  event.preventDefault();

  const input = {
    date: $('date').value,
    amount: $('amount').value,
    litres: $('litres').value
  };

  try {
    const id = $('editId').value;

    if (id) {
      records = updateFuelEntry(records, id, input);
      notify('Entry updated');
    } else {
      records = [...records, createFuelEntry(input)];
      notify('Fuel entry saved');
    }

    resetForm();
    persist();
  } catch (error) {
    notify(error.message);
  }
});

$('amount').addEventListener('input', updatePrice);
$('litres').addEventListener('input', updatePrice);

$('cancelEdit').addEventListener('click', resetForm);

$('monthFilter').addEventListener('change', renderHistory);

$('budgetForm').addEventListener('submit', event => {
  event.preventDefault();

  try {
    const month = $('budgetMonth').value;
    const amount = $('budgetAmount').value;

    budgets = setMonthlyBudget(budgets, month, amount);
    saveBudgets(budgets);

    renderBudget();
    notify('Monthly budget saved');
  } catch (error) {
    notify(error.message);
  }
});

$('budgetMonth').addEventListener('change', renderBudget);

$('exportBtn').addEventListener('click', () => {
  try {
    downloadCSV(records);
    notify('CSV export started');
  } catch (error) {
    notify(error.message);
  }
});

$('reportBtn').addEventListener('click', () => {
  const report = generateMonthlyReport(
    records,
    $('budgetMonth').value || currentMonth()
  );

  $('reportOutput').textContent =
    `Transactions: ${report.transactionCount} | ` +
    `Spending: ${money(report.totalSpend)} | ` +
    `Fuel: ${report.totalLitres.toFixed(2)} L`;
});


$('backupBtn').addEventListener('click', () => {
  try {
    const backup = createBackup(records, budgets);
    const blob = new Blob([backup], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `fuel-tracker-backup-${today()}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    notify('Backup downloaded successfully');
  } catch (error) {
    notify(error.message);
  }
});

$('restoreBtn').addEventListener('click', () => {
  $('restoreFile').click();
});

$('restoreFile').addEventListener('change', async event => {
  const file = event.target.files[0];

  if (!file) return;

  try {
    const json = await file.text();
    const restored = restoreBackup(json);

    if (!confirm('This will replace your current fuel records and budgets. Continue?')) {
      return;
    }

    saveEntries(restored.records);
    saveBudgets(restored.budgets);

    records = restored.records;
    budgets = restored.budgets;

    resetForm();
    render();

    notify('Backup restored successfully');
  } catch (error) {
    notify(error.message);
  } finally {
    event.target.value = '';
  }
});


$('date').value = today();
$('budgetMonth').value = currentMonth();

render();
