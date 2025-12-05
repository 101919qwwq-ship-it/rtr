const statusEl = document.getElementById('status');
function setStatus(t){ statusEl.textContent = t; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const API_BASE = '/api/droids';

async function fetchDroids(){
  setStatus('Ładowanie...');
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    renderTable(data);
    setStatus('Gotowe. Ostatnia aktualizacja: ' + new Date().toLocaleTimeString());
  } catch (e) {
    setStatus('Błąd ładowania: ' + e.message);
    document.getElementById('table').innerHTML = '<p style="color:red">Błąd ładowania danych</p>';
  }
}

function renderTable(rows){
  if (!rows || rows.length === 0){
    document.getElementById('table').innerHTML = '<p>Brak droidów</p>';
    return;
  }
  let html = '<table><tr><th>ID</th><th>Imię</th><th>Typ</th><th>Producent</th><th>Rok</th><th>Status</th><th>Akcje</th></tr>';
  rows.forEach(r => {
    html += `<tr>
      <td>${r.id}</td>
      <td><input id="name_${r.id}" value="${escapeHtml(r.name||'')}"></td>
      <td><input id="type_${r.id}" value="${escapeHtml(r.type||'')}"></td>
      <td><input id="man_${r.id}" value="${escapeHtml(r.manufacturer||'')}"></td>
      <td><input id="year_${r.id}" type="number" value="${r.year_production||''}"></td>
      <td><input id="status_${r.id}" value="${escapeHtml(r.status||'')}"></td>
      <td>
        <button onclick="updateDroid(${r.id})">Zapisz</button>
        <button onclick="deleteDroid(${r.id})">Usuń</button>
      </td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('table').innerHTML = html;
}

async function createDroid(){
  const name = document.getElementById('add_name').value.trim();
  const type = document.getElementById('add_type').value.trim();
  const manufacturer = document.getElementById('add_manufacturer').value.trim();
  const year = parseInt(document.getElementById('add_year').value) || null;
  const status = document.getElementById('add_status').value.trim();
  if (!name || !type) { alert('Podaj imię i typ'); return; }
  setStatus('Dodawanie...');
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, manufacturer, year_production: year, status })
    });
    if (res.status === 201) {
      document.getElementById('add_name').value=''; document.getElementById('add_type').value=''; document.getElementById('add_manufacturer').value=''; document.getElementById('add_year').value=''; document.getElementById('add_status').value='';
      fetchDroids();
    } else {
      const err = await res.json();
      alert('Błąd: ' + (err.error || res.status));
    }
  } catch (e) {
    alert('Błąd: ' + e.message);
  }
}

async function updateDroid(id){
  const name = document.getElementById('name_'+id).value.trim();
  const type = document.getElementById('type_'+id).value.trim();
  const manufacturer = document.getElementById('man_'+id).value.trim();
  const yearVal = document.getElementById('year_'+id).value;
  const year = yearVal === '' ? null : parseInt(yearVal);
  const status = document.getElementById('status_'+id).value.trim();
  if (!name || !type) { alert('Podaj imię i typ'); return; }
  setStatus('Aktualizacja...');
  try {
    const res = await fetch(API_BASE + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, manufacturer, year_production: year, status })
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Błąd: ' + (err.error || res.status));
    } else {
      setStatus('Zapisano');
      fetchDroids();
    }
  } catch (e) {
    alert('Błąd: ' + e.message);
  }
}

async function deleteDroid(id){
  if (!confirm('Na pewno usunąć droida o ID ' + id + '?')) return;
  setStatus('Usuwanie...');
  try {
    const res = await fetch(API_BASE + '/' + id, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      alert('Błąd: ' + (err.error || res.status));
    } else {
      fetchDroids();
    }
  } catch (e) {
    alert('Błąd: ' + e.message);
  }
}

document.getElementById('btnAdd').addEventListener('click', createDroid);
fetchDroids();
