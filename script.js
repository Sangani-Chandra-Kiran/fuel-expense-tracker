
const KEY = 'fuel-tracker-entries-v1';

let records = JSON.parse(
  localStorage.getItem(KEY) || '[]'
);

const $ = id => document.getElementById(id);

const money = n =>
  '₹' + Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const today = () =>
  new Date().toISOString().slice(0, 10);

$('date').value = today();

// Save data in browser storage
function persist() {
  localStorage.setItem(KEY, JSON.stringify(records));
  render();
}

// Display notification
function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');

  setTimeout(() => {
    $('toast').classList.remove('show');
  }, 1800);
}

// Calculate fuel price
function updatePrice() {
  const amount = Number($('amount').value);
  const litres = Number($('litres').value);

  $('price').value =
    amount > 0 && litres > 0
      ? money(amount / litres)
      : '—';
}

$('amount').addEventListener('input', updatePrice);
$('litres').addEventListener('input', updatePrice);

// Add or update entry
$('fuelForm').addEventListener('submit', e => {
  e.preventDefault();

  const amount = Number($('amount').value);
  const litres = Number($('litres').value);

  if (!(amount > 0 && litres > 0)) {
    notify('Enter valid amount and litres.');
    return;
  }

  const item = {
    id: $('editId').value || String(Date.now()),
    date: $('date').value,
    amount,
    litres,
    price: amount / litres
  };

  const index = records.findIndex(
    x => x.id === item.id
  );

  if (index >= 0) {
    records[index] = item;
    notify('Entry updated');
  } else {
    records.push(item);
    notify('Fuel entry saved');
  }

  resetForm();
  persist();
});

// Reset form
function resetForm() {
  $('fuelForm').reset();
  $('date').value = today();
  $('price').value = '—';
  $('editId').value = '';

  $('formTitle').textContent = 'Add fuel entry';
  $('submitBtn').textContent = 'Save entry';
  $('cancelEdit').style.display = 'none';
}

// Cancel editing
$('cancelEdit').onclick = resetForm;

// Edit existing entry
function editEntry(id) {
  const item = records.find(x => x.id === id);

  if (!item) return;

  $('editId').value = item.id;
  $('date').value = item.date;
  $('amount').value = item.amount;
  $('litres').value = item.litres;

  updatePrice();

  $('formTitle').textContent = 'Edit fuel entry';
  $('submitBtn').textContent = 'Update entry';
  $('cancelEdit').style.display = 'block';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Delete entry
function deleteEntry(id) {
  if (!confirm('Delete this fuel entry?')) return;

  records = records.filter(x => x.id !== id);

  persist();
  notify('Entry deleted');
}

// Dashboard and transaction history
function render() {
  const total = records.reduce(
    (sum, x) => sum + x.amount, 0
  );

  const litres = records.reduce(
    (sum, x) => sum + x.litres, 0
  );

  $('totalSpend').textContent = money(total);

  $('totalLitres').textContent =
    litres.toLocaleString('en-IN', {
      maximumFractionDigits: 2
    }) + ' L';

  $('avgPrice').textContent =
    litres ? money(total / litres) : '₹0.00';

  // Get available months
  const months = [
    ...new Set(records.map(x => x.date.slice(0, 7)))
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

  // Filter transactions
  const shown = records
    .filter(x =>
      $('monthFilter').value === 'all' ||
      x.date.startsWith($('monthFilter').value)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  // Display transactions
  $('entries').innerHTML = shown.map(x => `
    <tr>
      <td>${new Date(x.date + 'T00:00:00')
        .toLocaleDateString('en-IN')}</td>

      <td class="amount">${money(x.amount)}</td>

      <td>${x.litres} L</td>

      <td>${money(x.price)}</td>

      <td>
        <div class="actions">
          <button class="btn secondary"
            onclick="editEntry('${x.id}')">
            Edit
          </button>

          <button class="btn danger"
            onclick="deleteEntry('${x.id}')">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  $('empty').style.display =
    shown.length ? 'none' : 'block';
}

// Month filter
$('monthFilter').addEventListener('change', render);

// Initial dashboard load
render();
