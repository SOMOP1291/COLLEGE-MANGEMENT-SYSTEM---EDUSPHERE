import { list, add, update, remove } from './db.js';
import { mountLayout, toast, esc } from './layout.js';

export async function initCrud(c) {
  const { main, actionBtn } = await mountLayout({ page: c.page, title: c.title, sub: c.sub, action: `<i class="fa-solid fa-plus"></i> Add ${c.singular}` });
  main.innerHTML = `<section class="stats" id="stats"></section>
  <div class="panel"><div class="toolbar"><input id="q" type="search" placeholder="Search ${c.title.toLowerCase()}…" aria-label="Search">
   <select id="f" aria-label="Filter"></select><button class="btn ghost" id="csv"><i class="fa-solid fa-file-csv"></i> Export CSV</button></div>
   <div class="table-wrap"><table><thead><tr>${c.columns.map(x => `<th>${x.label}</th>`).join('')}<th>Actions</th></tr></thead><tbody id="rows"></tbody></table></div>
   <p class="empty" id="empty" hidden>Nothing here yet. Use “Add ${c.singular}” to create the first record.</p></div>
  <dialog id="dlg"><form id="form" novalidate><h2 id="dt"></h2><div class="grid" id="fields"></div>
   <div class="actions"><button type="button" class="btn ghost" id="cancel">Cancel</button><button class="btn">Save</button></div></form></dialog>`;
  const $ = s => main.querySelector(s), dlg = $('#dlg'), form = $('#form');
  let data = [], edit = null, refs = {};
  if (c.filter) $('#f').innerHTML = `<option value="">All ${c.filter.label}</option>` + c.filter.options.map(o => `<option>${esc(o)}</option>`).join(''); else $('#f').hidden = true;

  const view = () => { const s = $('#q').value.toLowerCase(), f = $('#f').value;
    return data.filter(r => (!f || r[c.filter.key] === f) && (!s || c.search.some(k => String(r[k] ?? '').toLowerCase().includes(s)))); };
  function draw() {
    const v = view();
    $('#stats').innerHTML = c.stats(data).map(([l, val, ic]) => `<div class="stat"><i class="fa-solid ${ic}"></i><div><h3>${esc(val)}</h3><p>${l}</p></div></div>`).join('');
    $('#rows').innerHTML = v.map(r => `<tr>${c.columns.map(x => `<td>${x.render ? x.render(r) : esc(r[x.key])}</td>`).join('')}
      <td class="act"><button class="icon" data-e="${esc(r.id)}" aria-label="Edit"><i class="fa-solid fa-pen"></i></button>
      <button class="icon bad" data-d="${esc(r.id)}" aria-label="Delete"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('');
    $('#empty').hidden = !!v.length;
  }
  async function load() { data = (await list(c.collection)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); draw(); }

  async function open(r) {
    edit = r || null; $('#dt').textContent = (r ? 'Edit ' : 'Add ') + c.singular;
    for (const f of c.fields) if (f.ref) refs[f.key] = await list(f.ref);
    $('#fields').innerHTML = c.fields.map(f => {
      const v = r ? (f.ref ? r[f.key + 'Id'] : r[f.key]) : '', rq = f.req ? 'required' : '';
      const i = f.ref ? `<select name="${f.key}" required><option value="">Select…</option>${refs[f.key].map(o => `<option value="${esc(o.id)}" ${o.id === v ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select>`
        : f.type === 'select' ? `<select name="${f.key}" ${rq}><option value="">Select…</option>${f.options.map(o => `<option ${o == v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`
        : `<input name="${f.key}" type="${f.type || 'text'}" value="${esc(v)}" ${rq} ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''}>`;
      return `<label>${f.label}${i}</label>`;
    }).join('');
    c.fields.filter(f => f.fill).forEach(f => form.elements[f.key].onchange = e => {
      const rec = refs[f.key].find(o => o.id === e.target.value);
      if (rec) Object.entries(f.fill).forEach(([dst, src]) => form.elements[dst].value = rec[src] ?? '');
    });
    dlg.showModal();
  }
  form.onsubmit = async e => {
    e.preventDefault(); if (!form.reportValidity()) return;
    const d = {};
    for (const f of c.fields) {
      const v = form.elements[f.key].value.trim();
      if (f.ref) { d[f.key + 'Id'] = v; d[f.key] = refs[f.key].find(o => o.id === v)?.name || ''; } else d[f.key] = f.type === 'number' ? Number(v) : v;
    }
    Object.assign(d, c.compute?.(d) || {});
    try { edit ? await update(c.collection, edit.id, d) : await add(c.collection, d); dlg.close(); toast(`${c.singular} saved`); load(); }
    catch (err) { toast('Could not save: ' + err.message, 'bad'); }
  };
  $('#rows').onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.e) open(data.find(x => x.id === b.dataset.e));
    if (b.dataset.d && confirm(`Delete this ${c.singular.toLowerCase()}? This cannot be undone.`)) { await remove(c.collection, b.dataset.d); toast(`${c.singular} deleted`); load(); }
  };
  $('#csv').onclick = () => {
    const keys = [...new Set(data.flatMap(Object.keys))].filter(k => !/^(id|createdAt)$|Id$/.test(k)), q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [keys.join(','), ...view().map(r => keys.map(k => q(r[k])).join(','))].join('\n');
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: c.collection + '.csv' }).click();
  };
  actionBtn.onclick = () => open();
  $('#cancel').onclick = () => dlg.close();
  $('#q').oninput = $('#f').onchange = draw;
  load();
}
