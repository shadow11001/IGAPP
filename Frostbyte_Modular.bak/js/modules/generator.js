const EMS_OPTS = ['Novar ESS32','Opus Architect','Opus Magnum','CPC UltraSite','Connect+','Danfoss AKA65','Danfoss Store View','Carel'];

const F = {
  name:   { id:'tech-name',  label:'Technician First and Last Name',  type:'text',      placeholder:'Full name',             req:true  },
  phone:  { id:'tech-phone', label:'Technician Cell Phone Number',     type:'text',      placeholder:'(555) 555-5555',        req:true  },
  email:  { id:'tech-email', label:'Technician Email Address',         type:'text',      placeholder:'tech@company.com',      req:true  },
  store:  { id:'store',      label:'Store Number',                     type:'text',      placeholder:'e.g. 1234',             req:true  },
  rack:   { id:'rack',       label:'Rack (LTA, MTB, etc.)',            type:'text',      placeholder:'e.g. LTA, MTB, DTC',    req:true  },
  ems:    { id:'ems',        label:'EMS System',                       type:'ems-select',                                     req:true  },
  wo:     { id:'wo',         label:'Work Order # (WO#)',               type:'text',      placeholder:'e.g. 345678910',        req:false },
  onsite: { id:'onsite',     label:'Is Tech Onsite?',                  type:'yesno',                                          req:true  },
  request:{ id:'request',    label:'What the Technician Has Requested and the Reason for the Request',
                                                                       type:'textarea',  placeholder:'Describe the request and reason in detail...', req:true, full:true },
};

const TYPES = [
  {
    id:'compressor', label:'Compressor & Condenser Staging Changes',
    fields:[F.name, F.phone, F.email, F.store, F.rack, F.ems, F.request, F.wo, F.onsite],
    reminders:['Description of controller behavior or error messages received. Paste screenshots of error messages into a Word document and attach it to the work order as you create it.']
  },
  {
    id:'rack-suction', label:'Changes to Rack Suction Settings',
    fields:[F.name, F.phone, F.email, F.store, F.rack, F.ems,
      { id:'rack-ref-type', label:'Refrigeration Type', type:'text', placeholder:'e.g. R-404A, R-448A, R-22', req:true },
      F.request, F.wo, F.onsite],
    reminders:['Description of controller behavior or error messages received. Paste screenshots of error messages into a Word document and attach it to the work order as you create it.']
  },
  {
    id:'chiller', label:'Changes to Chiller Settings',
    fields:[F.name, F.phone, F.email, F.store, F.rack, F.ems, F.request, F.wo, F.onsite],
    reminders:['Description of controller behavior or error messages received. Paste screenshots of error messages into a Word document and attach it to the work order as you create it.']
  },
  {
    id:'subcooler', label:'Changes to Subcooler Settings',
    fields:[F.name, F.phone, F.email, F.store, F.rack, F.ems,
      { id:'sub-ref-type', label:'Refrigeration Type', type:'text', placeholder:'e.g. R-404A, R-448A, R-22', req:true },
      F.request, F.wo, F.onsite],
    reminders:['Description of controller behavior or error messages received. Paste screenshots of error messages into a Word document and attach it to the work order as you create it.']
  },
  {
    id:'mac-address', label:'Setting MAC Addresses for Controller Replacements',
    fields:[
      F.name, F.phone, F.email, F.store, F.ems, F.rack,
      { id:'mac-new', label:'MAC Address of New Device (must be 12 characters)', type:'mac', placeholder:'e.g. A1B2C3D4E5F6', req:true },
      { id:'mac-old', label:'Old MAC Address', type:'text', placeholder:'e.g. F6E5D4C3B2A1', req:true },
      F.wo, F.onsite,
    ],
    reminders:[]
  },
  {
    id:'comm-loss', label:'Controller Comm Loss — Network Cabling (Post-Troubleshooting)',
    fields:[
      F.name, F.phone, F.email, F.store, F.ems,
      { id:'eth-plugged',  label:'Is the Ethernet Cable Plugged into the Device?', type:'yesno', req:true },
      { id:'ctrl-type',    label:'Controller Type', type:'text', placeholder:'e.g. Novar EP2, Emerson E2E, Danfoss AK255', req:true },
      { id:'ctrl-system',  label:'What System Does It Control?', type:'text', placeholder:'e.g. HVAC, Rack A, Rack B', req:true },
      { id:'power-cycled', label:'Has the Controller Been Power Cycled?', type:'yesno', req:true },
      { id:'functioning',  label:'Is the Controller Functioning Normally per the Technician?',
        type:'yesno-detail', req:true, full:true, detailPlaceholder:'Please provide details on what is not functioning normally...' },
      { id:'mac-comm',     label:'MAC Address (must be 12 characters)', type:'mac', placeholder:'e.g. A1B2C3D4E5F6', req:true },
      { id:'switch-port',  label:'Switch & Port Controller Goes To', type:'text', placeholder:'e.g. Switch 2, Port 14 (if tech can provide)', req:false },
      { id:'wo-corr',      label:'Work Order Correlated', type:'text', placeholder:'e.g. 345678910', req:false },
      F.onsite,
    ],
    reminders:[]
  },
  {
    id:'board-points', label:'Moving Board Points (Danfoss AKA65, StoreView, CPC UltraSite, Connect+)',
    fields:[
      F.name, F.phone, F.email, F.store, F.rack,
      { id:'bp-asset',    label:'Asset', type:'text', placeholder:'e.g. Comp1 Suc PSI', req:true },
      { id:'curr-module', label:'Current Module Address & Point Number', type:'text', placeholder:'e.g. Module 3, Point 12', req:true },
      { id:'new-module',  label:'New Module Address & Point Number',     type:'text', placeholder:'e.g. Module 5, Point 4',  req:true },
      F.wo, F.onsite,
    ],
    reminders:[]
  },
  {
    id:'carel', label:'Carel BOSS Series Controllers (excl. Cabling Support)',
    fields:[
      F.name, F.phone, F.email, F.store, F.rack,
      { id:'carel-desc', label:'Detailed Description of Technician Request — or Alarm Description if Alarm-Related',
        type:'textarea', placeholder:'Describe the request or alarm in detail...', req:true, full:true },
      F.wo, F.onsite,
    ],
    reminders:['If reporting an alarm: include a screenshot of the alarm in IoT. Paste screenshots into a Word document and attach it to the work order as you create it.']
  },
  {
    id:'novar-download', label:'Novar ESS32 Downloads — Failed After Two Attempts',
    fields:[
      F.name, F.phone, F.email, F.store,
      { id:'dl-type',     label:'Type of Download Needed', type:'text', placeholder:'e.g. version, main, comm, etc.', req:true },
      { id:'dl-system',   label:'What System Does It Control?', type:'text', placeholder:'e.g. HVAC, Rack A, Rack B', req:true },
      { id:'dl-behavior', label:'Description of Controller Behavior or Error Messages Received',
        type:'textarea', placeholder:'Describe what happens during the download attempt and any error messages shown...', req:true, full:true },
      F.wo, F.onsite,
    ],
    reminders:['Paste screenshots of error messages into a Word document and attach it to the work order as you create it.']
  },
  {
    id:'danfoss-download', label:'Downloads for Any Danfoss Controller',
    fields:[
      F.name, F.phone, F.email, F.store,
      { id:'dan-system', label:'What System Does It Control?', type:'text', placeholder:'e.g. HVAC, Rack A, Rack B', req:true },
      { id:'dan-reason', label:'Description of What Prompted the Download Request',
        type:'textarea', placeholder:'e.g. Controller change out, controller software failure, etc.', req:true, full:true },
      { id:'mac-dan',    label:'MAC Address (must be 12 characters)', type:'mac', placeholder:'e.g. A1B2C3D4E5F6', req:true },
      F.wo, F.onsite,
    ],
    reminders:[]
  },
  {
    id:'manager', label:'Manager Escalations',
    fields:[
      { id:'mgr-name',    label:'Name of Manager or Team Lead Authorizing the Escalation', type:'text', placeholder:'Full name', req:true, full:true },
      F.name, F.phone, F.email, F.store, F.rack, F.ems,
      { id:'mgr-issue',   label:'Detailed Description of the Issue', type:'textarea', placeholder:'Describe the issue in full detail...', req:true, full:true },
      { id:'mgr-actions', label:'What Actions Contact Center Agents Have Taken So Far', type:'textarea', placeholder:'List all actions taken by agents prior to this escalation...', req:true, full:true },
      F.wo, F.onsite,
    ],
    reminders:[]
  },
  {
    id:'pcr', label:'Program Change Requests (PCR)',
    fields:[F.name, F.phone, F.email, F.store, F.rack, F.ems, F.request, F.wo, F.onsite],
    reminders:['A screenshot of the module in the EMS system is required. Paste screenshots into a Word document and attach it to the work order as you create it.']
  },
  {
    id:'pdr', label:'Parameter Deviation Requests (PDR)',
    fields:[
      F.name, F.phone, F.email, F.store, F.rack, F.ems,
      { id:'pdr-case-model', label:'Asset', type:'text', placeholder:'as listed in the EMS e.g. NRG RL', req:true },
      { id:'pdr-desc',     label:'Detailed Description of Request', type:'textarea', placeholder:'Describe the parameter deviation request in detail...', req:true, full:true },
      { id:'pdr-current',  label:'Current Setting', type:'text', placeholder:'e.g. 35°F', req:true },
      { id:'pdr-requested', label:'Requested Change', type:'text', placeholder:'e.g. 38°F', req:true },
      F.wo, F.onsite,
    ],
    reminders:['Screenshots of the setpoint in the EMS system and of the parameters in Crystal are required. Paste screenshots into a Word document and attach it to the work order as you create it.']
  },
  {
    id:'rtu-fans', label:'Taking RTU Fans out of Continuous Mode',
    fields:[
      F.name, F.phone, F.email, F.store, F.ems,
      { id:'rtu-req', label:'Which RTU and the Reason for the Request',
        type:'textarea', placeholder:'e.g. RTU-1, RTU-2 — remodel has been completed', req:true, full:true },
      F.wo, F.onsite,
    ],
    reminders:[]
  },
  {
    id:'heat-check', label:'Heat Checks',
    fields:[F.name, F.phone, F.email, F.store, F.ems, F.request, F.wo, F.onsite],
    reminders:[]
  },
  {
    id:'iot-error', label:'IOT Error Reporting',
    fields:[
      F.name, F.phone, F.email, F.store, F.ems,
      { id:'iot-wo',    label:'Associated Work Order Number', type:'text', placeholder:'e.g. 345678910', req:false },
      { id:'iot-asset', label:'Asset Name', type:'text', placeholder:'e.g. Rack LTA, RTU-2, A1B', req:true },
      { id:'iot-desc',  label:'Description of Issue', type:'textarea', placeholder:'Describe the issue in detail...', req:true, full:true },
    ],
    reminders:[]
  },
  {
    id:'helpdesk', label:'Helpdesk',
    fields:[
      F.name, F.store, F.ems,
      { id:'hd-wo',   label:'Associated Work Order Number', type:'text', placeholder:'e.g. 345678910', req:false },
      { id:'hd-desc', label:'Description of Issue', type:'textarea', placeholder:'Describe the issue in detail...', req:true, full:true },
      { id:'hd-done', label:'What Have You Done', type:'textarea', placeholder:'Describe any troubleshooting steps already taken...', req:false, full:true },
      { id:'hd-wiki', label:'Wiki Links Used', type:'textarea', placeholder:'Paste any wiki links referenced during troubleshooting...', req:false, full:true },
    ],
    reminders:[]
  },
  {
    id:'point-change', label:'Point Change Request',
    fields:[
      F.store, F.ems, F.rack,
      F.name,
      { id:'pc-phone', label:'Tech Phone Number', type:'text', placeholder:'(555) 555-5555', req:true },
      { id:'pc-device',    label:'Name of Device Being Moved', type:'text', placeholder:'as listed in the EMS e.g. Comp1, Suct PSI', req:true },
      { id:'pc-board-addr',label:'Board Type and Address', type:'text', placeholder:'e.g. RIM 24, ROM 34, CIM 41', req:true },
      { id:'pc-bad-point', label:'Bad Point', type:'text', placeholder:'e.g. Point 4, Suction Pressure 3', req:true },
      { id:'pc-new-same',  label:'New or Same Board?', type:'yesno-same', req:true },
      { id:'pc-new-board', label:'New Board', type:'text', placeholder:'e.g. RIM 24, ROM 34, CIM 41', req:false, hideId:'new-board-wrap' },
      { id:'pc-new-point', label:'New Point', type:'text', placeholder:'e.g. Point 4, Suction Pressure 3', req:true },
    ],
    reminders:[]
  },
];

// ── STATE ───────────────────────────────────────────────────────
let selectedType = null;
let savedData = {};

// ── POPULATE DROPDOWN ───────────────────────────────────────────
const sel = document.getElementById('type-select');
TYPES.forEach(t => {
  const opt = document.createElement('option');
  opt.value = t.id;
  opt.textContent = t.label;
  sel.appendChild(opt);
});

// ── ON TYPE CHANGE ──────────────────────────────────────────────
function onTypeChange() {
  const id = sel.value;
  if (!id) {
    selectedType = null;
    document.getElementById('form-area').classList.remove('visible');
    document.getElementById('summary-wrap').classList.remove('visible');
    return;
  }
  if (selectedType) saveFormData();
  selectedType = TYPES.find(t => t.id === id);
  document.getElementById('form-label').textContent = selectedType.label;
  renderForm(selectedType);
  restoreFormData(selectedType);
  pushShared();
  document.getElementById('form-area').classList.add('visible');
  document.getElementById('summary-wrap').classList.remove('visible');
}

// ── SAVE / RESTORE ──────────────────────────────────────────────
function saveFormData() {
  if (!selectedType) return;
  selectedType.fields.forEach(f => {
    const el = document.getElementById('f-' + f.id);
    if (!el) return;
    savedData[f.id] = el.value;
    if (f.type === 'yesno-detail') {
      const detail = document.getElementById('f-' + f.id + '-detail');
      if (detail) savedData[f.id + '-detail'] = detail.value;
    }
  });
}

function restoreFormData(t) {
  t.fields.forEach(f => {
    if (!(f.id in savedData)) return;
    const el = document.getElementById('f-' + f.id);
    if (!el) return;
    el.value = savedData[f.id];
    if (f.type === 'yesno-detail') {
      const detail = document.getElementById('f-' + f.id + '-detail');
      const wrap = document.getElementById('detail-wrap-' + f.id);
      if (detail && (f.id + '-detail') in savedData) detail.value = savedData[f.id + '-detail'];
      if (wrap) wrap.style.display = el.value === 'No' ? '' : 'none';
    }
    if (f.type === 'yesno-same') {
      toggleNewBoard(el.value);
    }
  });
}

// ── RENDER FORM ─────────────────────────────────────────────────
function renderForm(t) {
  const container = document.getElementById('form-fields');
  container.innerHTML = '';

  t.fields.forEach(f => {
    const wrap = document.createElement('div');
    wrap.className = 'field' + (f.full ? ' full' : '');

    const reqTag = f.req ? '<span class="req">*</span>' : '<span class="opt">(optional)</span>';
    const lbl = `<label>${f.label} ${reqTag}</label>`;

    if (f.type === 'ems-select') {
      const opts = EMS_OPTS.map(o => `<option value="${o}">${o}</option>`).join('');
      wrap.innerHTML = `${lbl}
        <select id="f-${f.id}"><option value="">— Select EMS System —</option>${opts}</select>
        <div class="err-msg" id="err-${f.id}">Required</div>`;

    } else if (f.type === 'yesno-same') {
      wrap.innerHTML = `${lbl}
        <select id="f-${f.id}" onchange="toggleNewBoard(this.value)"><option value="">— Select —</option><option value="Same Board">Same Board</option><option value="New Board">New Board</option></select>
        <div class="err-msg" id="err-${f.id}">Required</div>`;

    } else if (f.type === 'yesno') {
      wrap.innerHTML = `${lbl}
        <select id="f-${f.id}"><option value="">— Select —</option><option>Yes</option><option>No</option></select>
        <div class="err-msg" id="err-${f.id}">Required</div>`;

    } else if (f.type === 'yesno-detail') {
      wrap.className = 'field full';
      wrap.innerHTML = `${lbl}
        <select id="f-${f.id}" onchange="toggleDetail('${f.id}')">
          <option value="">— Select —</option><option>Yes</option><option>No</option>
        </select>
        <div class="err-msg" id="err-${f.id}">Required</div>
        <div class="yesno-detail-wrap" id="detail-wrap-${f.id}" style="display:none;">
          <textarea id="f-${f.id}-detail" placeholder="${f.detailPlaceholder || 'Please provide details...'}"></textarea>
          <div class="err-msg" id="err-${f.id}-detail">Details are required when the answer is No</div>
        </div>`;

    } else if (f.type === 'mac') {
      wrap.innerHTML = `${lbl}
        <input type="text" id="f-${f.id}" placeholder="${f.placeholder || ''}" maxlength="17"
          style="font-family:'IBM Plex Mono',monospace;letter-spacing:2px;"
          oninput="checkMac('${f.id}',${f.req})"/>
        <div class="err-msg" id="err-${f.id}">Must be exactly 12 characters (letters and numbers only)</div>`;

    } else if (f.type === 'textarea') {
      wrap.innerHTML = `${lbl}
        <textarea id="f-${f.id}" placeholder="${f.placeholder || ''}"></textarea>
        <div class="err-msg" id="err-${f.id}">Required</div>`;

    } else {
      const isName = f.id === 'tech-name';
      const hasCopy = ['tech-name','store','wo'].includes(f.id);
      const inputRow = hasCopy
        ? `<div style="display:flex;gap:5px;align-items:center;"><input type="text" id="f-${f.id}" placeholder="${f.placeholder || ''}" ${isName ? 'oninput="capitalizeName(this)" class="capitalize-name"' : ''} style="flex:1;min-width:0;"/><button type="button" class="copy-inline-btn" title="Copy" onclick="copyField('f-${f.id}',this)">⎘</button></div>`
        : `<input type="text" id="f-${f.id}" placeholder="${f.placeholder || ''}" ${isName ? 'oninput="capitalizeName(this)" class="capitalize-name"' : ''}/>`;
      wrap.innerHTML = `${lbl}${inputRow}<div class="err-msg" id="err-${f.id}">Required</div>`;
    }
    if (f.hideId) {
      const outer = document.createElement('div');
      outer.id = f.hideId;
      outer.className = f.full ? 'full' : '';
      outer.style.display = 'none';
      wrap.className = 'field';
      outer.appendChild(wrap);
      container.appendChild(outer);
    } else {
      container.appendChild(wrap);
    }
  });

  // Reminders
  const remWrap = document.getElementById('reminders-wrap');
  remWrap.innerHTML = '';
  if (t.reminders && t.reminders.length) {
    const box = document.createElement('div');
    box.className = 'reminder-box';
    box.innerHTML = `<div class="reminder-title">⚠ Reminder</div>` +
      t.reminders.map(r => `<div class="reminder-item">${r}</div>`).join('');
    remWrap.appendChild(box);
  }
}

function toggleNewBoard(val) {
  const wrap = document.getElementById('new-board-wrap');
  if (wrap) wrap.style.display = val === 'New Board' ? '' : 'none';
}

function toggleDetail(fid) {
  const s = document.getElementById('f-' + fid);
  const w = document.getElementById('detail-wrap-' + fid);
  const show = s.value === 'No';
  w.style.display = show ? '' : 'none';
  if (!show) {
    const ta = document.getElementById('f-' + fid + '-detail');
    if (ta) ta.value = '';
    const e = document.getElementById('err-' + fid + '-detail');
    if (e) e.classList.remove('visible');
  }
}

function checkMac(fid, required) {
  const el = document.getElementById('f-' + fid);
  const err = document.getElementById('err-' + fid);
  if (!el) return;
  const raw = el.value.replace(/[^a-fA-F0-9]/g, '');
  const bad = required ? raw.length !== 12 : (raw.length > 0 && raw.length !== 12);
  el.classList.toggle('invalid', bad && el.value.length > 0);
  if (err) err.classList.toggle('visible', bad && el.value.length > 0);
}

// ── VALIDATE ────────────────────────────────────────────────────
function validate() {
  let ok = true;
  selectedType.fields.forEach(f => {
    const el = document.getElementById('f-' + f.id);
    const err = document.getElementById('err-' + f.id);
    if (!el) return;

    if (f.type === 'mac') {
      const raw = el.value.replace(/[^a-fA-F0-9]/g, '');
      const bad = f.req ? raw.length !== 12 : (raw.length > 0 && raw.length !== 12);
      el.classList.toggle('invalid', bad);
      if (err) err.classList.toggle('visible', bad);
      if (bad) ok = false;

    } else if (f.type === 'yesno-detail') {
      const empty = !el.value.trim();
      el.classList.toggle('invalid', empty);
      if (err) err.classList.toggle('visible', empty);
      if (empty) { ok = false; return; }
      if (el.value === 'No') {
        const detail = document.getElementById('f-' + f.id + '-detail');
        const detErr = document.getElementById('err-' + f.id + '-detail');
        const dEmpty = !detail || !detail.value.trim();
        if (detail) detail.classList.toggle('invalid', dEmpty);
        if (detErr) detErr.classList.toggle('visible', dEmpty);
        if (dEmpty) ok = false;
      }

    } else if (!f.req) {
      // optional
    } else {
      const empty = !el.value.trim();
      el.classList.toggle('invalid', empty);
      if (err) err.classList.toggle('visible', empty);
      if (empty) ok = false;
    }
  });
  return ok;
}

// ── SUBMIT ──────────────────────────────────────────────────────
function submitForm() {
  if (!selectedType) return;
  if (!validate()) {
    const first = document.querySelector('.invalid');
    if (first) first.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }
  buildSummary();
  document.getElementById('summary-wrap').classList.add('visible');
  document.getElementById('summary-wrap').scrollIntoView({ behavior:'smooth', block:'start' });
}

// ── SUMMARY ─────────────────────────────────────────────────────
// Fields whose values are shown without a label in the summary
const NO_LABEL_IDS = new Set([]);

// Short label overrides for the summary display
const SUMMARY_LABEL_OVERRIDES = {
  'tech-name':  'Tech Name',
  'tech-phone': 'Phone',
  'tech-email': 'Email',
};

// Clean display label: strip parenthetical hints like (LTA, MTB, etc.) or (WO#)
function cleanLabel(label) {
  return label.replace(/\s*\([^)]*\)/g, '').trim();
}

function buildSummary() {
  const t = selectedType;
  // ESCALATION TYPE shown as plain value (no key) for point-change and iot-error; with key for all others
  const rows = [{ key: '', val: t.label }];

  t.fields.forEach(f => {
    const el = document.getElementById('f-' + f.id);
    if (!el) return;
    const val = el.value.trim();
    if (!f.req && !val) return;

    const key = SUMMARY_LABEL_OVERRIDES[f.id] ?? cleanLabel(f.label);

    if (f.type === 'yesno-detail') {
      if (val === 'No') {
        const detail = document.getElementById('f-' + f.id + '-detail');
        rows.push({ key, val: 'No — ' + (detail ? detail.value.trim() : '') });
      } else { rows.push({ key, val }); }
    } else if (f.type === 'mac') {
      if (val) rows.push({ key, val: val.toUpperCase() });
    } else {
      if (val) {
        rows.push({ key, val });
      }
    }
  });

  const body = document.getElementById('sum-body');
  body.innerHTML = rows.map(function(r) {
    if (r.key) {
      return '<div class="sum-row"><div class="sum-key">' + r.key + '</div><div class="sum-val">' + r.val + '</div></div>';
    }
    return '<div class="sum-row"><div class="sum-val">' + r.val + '</div></div>';
  }).join('');
  document.getElementById('sum-title').textContent = t.label;
  body._plain = rows.map(function(r) {
    return r.key ? r.key + ': ' + r.val : r.val;
  }).join('\n');
}

function copySummary() {
  const body = document.getElementById('sum-body');
  const btn = document.getElementById('copy-btn');
  const plainText = body._plain;
  if (!plainText) return;

  navigator.clipboard.writeText(plainText).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<span>✓</span> Copied!';
  });

  // Save to log file if one is active
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
  const title = document.getElementById('sum-title').textContent || 'Escalation';
  const entry =
    timeStr + ' ' + dateStr + '\n' +
    'Escalation: ' + title + '\n\n' +
    plainText;

  saveNoteToFile(entry);
}

// ── RESET ───────────────────────────────────────────────────────
let escalationSnapshot = null;

function resetEscalation() {
  // Snapshot for undo
  if (selectedType) {
    escalationSnapshot = {
      typeId: selectedType.id,
      fields: {},
      summaryHtml: document.getElementById('sum-body').innerHTML,
      summaryPlain: document.getElementById('sum-body')._plain,
      summaryTitle: document.getElementById('sum-title').textContent,
      summaryVisible: document.getElementById('summary-wrap').classList.contains('visible'),
    };
    selectedType.fields.forEach(f => {
      const el = document.getElementById('f-' + f.id);
      if (el) escalationSnapshot.fields[f.id] = el.value;
      if (f.type === 'yesno-detail') {
        const detail = document.getElementById('f-' + f.id + '-detail');
        if (detail) escalationSnapshot.fields[f.id + '-detail'] = detail.value;
      }
    });
    document.getElementById('esc-undo-btn').style.display = '';
  }
  resetAll();
}

function undoEscalation() {
  if (!escalationSnapshot) return;
  const { typeId, fields, summaryHtml, summaryPlain, summaryTitle, summaryVisible } = escalationSnapshot;
  document.getElementById('type-select').value = typeId;
  onTypeChange();
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById('f-' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('change')); }
  });
  if (summaryVisible) {
    const body = document.getElementById('sum-body');
    body.innerHTML = summaryHtml;
    body._plain = summaryPlain;
    document.getElementById('sum-title').textContent = summaryTitle;
    document.getElementById('summary-wrap').classList.add('visible');
  }
  escalationSnapshot = null;
  document.getElementById('esc-undo-btn').style.display = 'none';
}

function resetAll() {
  selectedType = null;
  savedData = {};
  document.getElementById('type-select').value = '';
  document.getElementById('form-fields').innerHTML = '';
  document.getElementById('reminders-wrap').innerHTML = '';
  document.getElementById('form-area').classList.remove('visible');
  document.getElementById('summary-wrap').classList.remove('visible');
  resetCopyButtons();
  window.scrollTo({ top:0, behavior:'smooth' });
}

// ── QA CHECKLIST ────────────────────────────────────────────────
const QA_ITEMS = [
  "Thanks for calling Upstream Digital Assets, where we're always happy to help! My name is [NAME], can I please have your name, site, and work order number from which you are calling?",
  "Repeat site and work order back to the tech. If no work order is provided say \"you said site number is XXXX and no work order, correct?\"",
  "Fill dead air with small talk or talking yourself through the call.",
  "Did you put the store number in VCC?",
  "Did you tag HVAC, refrigeration, lighting, or comms in VCC?",
  "Did you tag the proper EMS in VCC?",
  "Did you notate service channel if a work order was provided?",
  "Thank you for calling Upstream Digital Assets, stay on the line for a brief survey.",
];

const qaContainer = document.getElementById('qa-items');
QA_ITEMS.forEach((text, i) => {
  const item = document.createElement('div');
  item.className = 'qa-item';
  item.id = 'qa-' + i;
  item.innerHTML = `<div class="qa-check"></div><div class="qa-text">${text}</div>`;
  item.onclick = () => {
    item.classList.toggle('checked');
  };
  qaContainer.appendChild(item);
});

function toggleSidebar() {
  document.getElementById('qa-sidebar').classList.toggle('collapsed');
}

function resetChecklist() {
  document.querySelectorAll('.qa-item').forEach(el => el.classList.remove('checked'));
}

// Auto-load general template on page load
document.addEventListener('DOMContentLoaded', () => {
  loadNoteFields();
});

// Capture shared values when typed/changed in escalation form or notes form
document.addEventListener('input', e => {
  if (e.target.closest('#form-fields')) {
    resetCopyButtons();
    captureShared(e.target);
    // Hide escalation undo once user starts typing
    const escUndo = document.getElementById('esc-undo-btn');
    if (escUndo) { escUndo.style.display = 'none'; escalationSnapshot = null; }
  }
  if (e.target.closest('#notes-fields')) {
    if (e.target.value.trim()) e.target.classList.remove('invalid');
    captureShared(e.target);
    // Hide notes undo once user starts typing
    const notesUndo = document.getElementById('undo-btn');
    if (notesUndo) { notesUndo.style.display = 'none'; noteFieldsSnapshot = null; }
  }
});
document.addEventListener('change', e => {
  if (e.target.closest('#form-fields')) {
    resetCopyButtons();
    captureShared(e.target);
    // Hide escalation undo once user makes a change
    const escUndo = document.getElementById('esc-undo-btn');
    if (escUndo) { escUndo.style.display = 'none'; escalationSnapshot = null; }
  }
  if (e.target.closest('#notes-fields')) {
    if (e.target.value.trim()) e.target.classList.remove('invalid');
    captureShared(e.target);
    // Hide notes undo once user makes a change
    const notesUndo = document.getElementById('undo-btn');
    if (notesUndo) { notesUndo.style.display = 'none'; noteFieldsSnapshot = null; }
  }
  if (e.target.id === 'f-onsite') syncOnsiteFromEscalation(e.target.value);
  if (e.target.id === 'note-Is_Technician_Onsite_') syncOnsiteFromNotes(e.target.value);
});

function captureShared(el) {
  if (!el || !el.id) return;
  const id = el.id;
  const val = el.value;
  // Escalation form shared fields
  if (id === 'f-tech-name') { shared.name = val; pushShared(); }
  else if (id === 'f-ems')  { shared.ems  = val; pushShared(); }
  else if (id === 'f-store'){ shared.store = val; pushShared(); }
  else if (id === 'f-wo')   { shared.wo   = val; pushShared(); }
  // Notes form shared fields
  else if (id === 'note-Tech_Name') { shared.name = val; pushShared(); }
  else if (id === 'note-EMS')       { shared.ems  = val; pushShared(); }
  else if (id === 'note-Store__')   { shared.store = val; pushShared(); }
  else if (id === 'note-Work_Order__') { shared.wo = val; pushShared(); }
}

function syncOnsiteFromEscalation(val) {
  const nOnsite = document.getElementById('note-Is_Technician_Onsite_');
  if (nOnsite) { nOnsite.value = val; livePreviewIfActive(); }
}

function syncOnsiteFromNotes(val) {
  const fOnsite = document.getElementById('f-onsite');
  if (fOnsite) fOnsite.value = val;
}

// ── GLOBAL SESSION FIELDS ───────────────────────────────────────
// ── SHARED STATE ────────────────────────────────────────────────
// Carries tech name, ems, store, and WO across all forms
const shared = { name:'', ems:'', store:'', wo:'' };

// Field ID maps: escalation form IDs and notes field IDs
const SHARED_ESC_IDS = {
  name:  'f-tech-name',
  ems:   'f-ems',
  store: 'f-store',
  wo:    'f-wo',
};
// Notes field IDs vary by template — built from field name
const SHARED_NOTE_FIELDS = {
  name:  'Tech Name',
  ems:   'EMS',
  store: 'Store #',
  wo:    'Work Order #',
};
// Extra escalation WO fields
const EXTRA_WO_IDS = ['f-iot-wo', 'f-hd-wo'];

function pushShared() {
  // Push into escalation form
  Object.entries(SHARED_ESC_IDS).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el && !el._userEdited) el.value = shared[key];
  });
  EXTRA_WO_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._userEdited) el.value = shared.wo;
  });
  // Push into notes form (field IDs are built from field names)
  Object.entries(SHARED_NOTE_FIELDS).forEach(([key, field]) => {
    const id = 'note-' + field.replace(/[^a-zA-Z0-9]/g, '_');
    const el = document.getElementById(id);
    if (el && !el._userEdited) el.value = shared[key];
  });
  livePreviewIfActive();
  // Onsite cross-sync
  const fOnsite = document.getElementById('f-onsite');
  const nOnsite = document.getElementById('note-Is_Technician_Onsite_');
  if (fOnsite && nOnsite) {
    if (fOnsite.value && !nOnsite.value) nOnsite.value = fOnsite.value;
    else if (nOnsite.value && !fOnsite.value) fOnsite.value = nOnsite.value;
  }
}

function readSharedFrom(sourceId, key) {
  const el = document.getElementById(sourceId);
  if (!el) return;
  shared[key] = el.value;
  pushShared();
}

// Legacy alias used by old oninput handlers
function syncGlobals() { pushShared(); }
function clearGlobals() {
  shared.name = ''; shared.ems = ''; shared.store = ''; shared.wo = '';
  pushShared();
}

function livePreviewIfActive() {
  const key = document.getElementById('notes-template').value;
  if (key) livePreview();
}

function markUserEdited(el) {
  el._userEdited = true;
}

// EMS shortcode map — type 2 letters to auto-select
const EMS_SHORTCODES = {
  'NE': 'Novar ESS32',
  'NO': 'Novar ESS32',
  'OA': 'Opus Architect',
  'OM': 'Opus Magnum',
  'CP': 'CPC UltraSite',
  'CU': 'CPC UltraSite',
  'CO': 'Connect+',
  'DA': 'Danfoss AKA65',
  'DS': 'Danfoss Store View',
  'DV': 'Danfoss Store View',
  'CA': 'Carel',
  'CR': 'Carel',
};

// Buffer for shortcode typing
let emsBuffer = '';
let emsBufferTimer = null;

document.addEventListener('keydown', e => {
  // Only trigger when an EMS select is focused
  const active = document.activeElement;
  if (!active || active.tagName !== 'SELECT') return;
  const isEms = active.id === 'global-ems' ||
    active.id === 'f-ems' ||
    active.id === 'note-EMS';
  if (!isEms) return;

  const ch = e.key.toUpperCase();
  if (!/^[A-Z]$/.test(ch)) return;

  clearTimeout(emsBufferTimer);
  emsBuffer += ch;

  if (emsBuffer.length >= 2) {
    const match = EMS_SHORTCODES[emsBuffer.slice(-2)];
    if (match) {
      active.value = match;
      active.dispatchEvent(new Event('change'));
      emsBuffer = '';
      e.preventDefault();
      return;
    }
  }

  emsBufferTimer = setTimeout(() => { emsBuffer = ''; }, 1200);
});

function capitalizeName(el) {
  const pos = el.selectionStart;
  el.value = el.value.replace(/\b\w/g, c => c.toUpperCase());
  el.setSelectionRange(pos, pos);
}

function autoExpand(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function openStoreUrl(id) {
  const el = document.getElementById(id);
  const storeNum = el ? el.value.trim() : '';
  if (!storeNum) { el && el.focus(); return; }
  const url = 'https://em.walmart.com/us?query=US%7C' + storeNum + '#';
  window.open(url, '_blank', 'noopener');
}

function openWOUrl(id) {
  const el = document.getElementById(id);
  const woNum = el ? el.value.trim() : '';
  if (!woNum) { el && el.focus(); return; }
  window.open('https://www.servicechannel.com/sc/wo/Workorders/index?id=' + encodeURIComponent(woNum), 'servicechannel_wo');
}

function copyField(id, btn) {
  const el = document.getElementById(id);
  if (!el || !el.value.trim()) return;
  navigator.clipboard.writeText(el.value.trim()).then(() => {
    btn.textContent = '✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '⎘'; btn.classList.remove('copied'); }, 2000);
  });
}


const NOTE_EMS = ['Novar ESS32','Opus Architect','Opus Magnum','CPC UltraSite','Connect+','Danfoss AKA65','Danfoss Store View','Carel'];

const noteTemplates = {
  defrost:    { fields:['Tech Name','Store #','Work Order #','EMS','Case #','Technician Request','Additional Relevant Notes'], dropdowns:{'Technician Request':['Placing Defrost','Terminating Defrost']} },
  dae:        { fields:['Tech Name','Store #','Work Order #','EMS','Type Of DAE','Is Technician Onsite?','New W.O. Created','Additional Relevant Notes'], dropdowns:{'Type Of DAE':['Compressor & Condenser Staging Changes','Changes to Rack Suction Settings','Changes to Chiller Settings','Changes to Subcooler Settings','Setting MAC Addresses for Controller Replacements','Controller Comm Loss — Network Cabling (Post-Troubleshooting)','Moving Board Points (Danfoss AKA65, StoreView, CPC UltraSite, Connect+)','Carel BOSS Series Controllers (excl. Cabling Support)','Novar ESS32 Downloads — Failed After Two Attempts','Downloads for Any Danfoss Controller','Manager Escalations','Program Change Requests (PCR)','Parameter Deviation Requests (PDR)','Taking RTU Fans out of Continuous Mode','Heat Checks'],'Is Technician Onsite?':['Yes','No']} },
  hvac:       { fields:['Tech Name','Store #','Work Order #','EMS','Unit Name','Original Cooling SP','New Cooling SP','Original Heating SP','New Heating SP','Additional Relevant Notes'], template:'[Tech Name] | [EMS] | [Store #] - Technician [Tech Name] requested a modification to the setpoints for unit [Unit Name]. After verifying the current setpoints and following standard operating procedures, the cooling setpoint was adjusted from [Original Cooling SP] to [New Cooling SP], and the heating setpoint from [Original Heating SP] to [New Heating SP]. All changes were successfully applied. [Additional Relevant Notes]' },
  module:     { fields:['Tech Name','Store #','Work Order #','EMS','Module Name','Was The Issue Resolved?','Reason (If Not Resolved)','Next Steps (If Not Resolved)','Additional Relevant Notes'], dropdowns:{'Was The Issue Resolved?':['Yes','No']} },
  lighting:   { fields:['Tech Name','Store #','Work Order #','EMS','Lighting Section','Amount Of Time','Additional Relevant Notes'], template:'[Tech Name] | [EMS] | [Store #] - Technician [Tech Name] requested an override of the [Lighting Section] lights for a duration of [Amount Of Time]. After confirming proper system operation, the technician confirmed the lights turned on. [Additional Relevant Notes]' },
  status:     { fields:['Tech Name','Store #','Work Order #','EMS','Status Verified','Case Name/RTU Name','Additional Relevant Notes'], template:'[Tech Name] | [EMS] | [Store #] - Technician [Tech Name] requested verification of [Status Verified]. Located [Case Name/RTU Name] and confirmed operational status. [Additional Relevant Notes]' },
  controller: { fields:['Tech Name','Store #','Work Order #','EMS','Controller Name','Final Outcome or Resolution','Additional Relevant Notes'], template:'[Tech Name] | [EMS] | [Store #] - Technician [Tech Name] reported a communication loss with controller [Controller Name]. All troubleshooting steps from the Wiki were followed. Conclusion: [Final Outcome or Resolution]. [Additional Relevant Notes]' },
  winter:     { fields:['Tech Name','Store #','Work Order #','EMS','Docfit Rep Info','Additional Relevant Notes'], template:'[Tech Name] | [EMS] | [Store #] - Technician [Tech Name] called in regarding a Win The Winter WO. Directed technician to reach out to their DocFit Rep. for assistance in making the necessary changes to the store. [Docfit Rep Info] [Additional Relevant Notes]' },
  transfer:   { fields:['Tech Name','Store #','Work Order #','EMS','External Team Name','Reason for Call','Approved By Name','Approved By Position','Additional Relevant Notes'], dropdowns:{'Approved By Position':['A1','TL','Supervisor']}, template:'[Tech Name] | [EMS] | [Store #] - Technician [Tech Name] called in for assistance with [Reason for Call]. After running through all troubleshooting, we found that transferring tech to [External Team Name] would be the best option to assist with the issue. Transfer approved by [Approved By Name] ([Approved By Position]). [Additional Relevant Notes]' },
  remodel:    { fields:['Tech Name','Store #','Work Order #','EMS','Additional Relevant Notes'], template:'[Tech Name] | [EMS] | [Store #] - Technician [Tech Name] reported updates/changes for store [Store #]. Referred technician to rmsupport@walmart.com for further assistance. [Additional Relevant Notes]' },
  general:    { fields:['Tech Name','Store #','Work Order #','EMS','Contact Method','Reason For Calling','Actions Taken','Additional Relevant Notes'], dropdowns:{'Contact Method':['Called','Emailed']}, template:'[Tech Name] | [EMS] | [Store #] - Technician [Contact Method] in for [Reason For Calling]. [Actions Taken]. [Additional Relevant Notes]', capitalizeFields:['Actions Taken'] },
};

const NOTE_LABELS = {
  'Tech Name': 'Technician Name',
  'Store #': 'Store Number',
  'EMS': 'EMS System',
};

const NOTE_OPTIONAL = ['Additional Relevant Notes', 'Reason (If Not Resolved)', 'Next Steps (If Not Resolved)', 'Docfit Rep Info', 'What Was Found', 'Original Cooling SP', 'New Cooling SP', 'Original Heating SP', 'New Heating SP', 'Work Order #'];

function loadNoteFields() {
  const key = document.getElementById('notes-template').value;
  const container = document.getElementById('notes-fields');
  container.innerHTML = '';
  document.getElementById('notes-output').textContent = '';
  document.getElementById('notes-out-title').textContent = '—';
  if (!key) { document.getElementById('notes-columns').style.display = 'none'; return; }

  const t = noteTemplates[key];
  let fields = key === 'dae'
    ? ['Is Technician Onsite?'].concat(t.fields.filter(f => f !== 'Is Technician Onsite?'))
    : t.fields;

  const templateNames = {defrost:'Defrost Procedure',dae:'DAE Completion',hvac:'HVAC Setpoint Adjustment',module:'Module Communication Loss',lighting:'Lighting Override',status:'Status Verification',controller:'Controller Communication Loss',winter:'Win the Winter WO',transfer:'Transfers / Referrals',remodel:'Remodel Support',general:'General Template'};
  document.getElementById('notes-out-title').textContent = templateNames[key] || key;
  document.getElementById('notes-helpdesk-btn').style.display = key === 'general' ? '' : 'none';

  fields.forEach(field => {
    const wrap = document.createElement('div');
    const isLong = field.toLowerCase().includes('notes') || field.toLowerCase().includes('comments') || field.toLowerCase().includes('reason') || field.toLowerCase().includes('actions') || field.toLowerCase().includes('found') || field.toLowerCase().includes('resolution') || field.toLowerCase().includes('steps');
    wrap.className = 'field' + (isLong ? ' full' : '');

    const displayLabel = NOTE_LABELS[field] || field;
    const isOptional = NOTE_OPTIONAL.includes(field);
    const lbl = `<label>${displayLabel} ${isOptional ? '<span class="opt">(optional)</span>' : '<span class="req">*</span>'}</label>`;
    const id = 'note-' + field.replace(/[^a-zA-Z0-9]/g, '_');

    if (field === 'EMS') {
      const opts = NOTE_EMS.map(o => `<option value="${o}">${o}</option>`).join('');
      wrap.innerHTML = `${lbl}<select id="${id}" onchange="markUserEdited(this);livePreview()"><option value="">— Select EMS —</option>${opts}</select>`;
    } else if (t.dropdowns && t.dropdowns[field]) {
      const opts = t.dropdowns[field].map((o, i) => {
        const isDefault = (field === 'Technician Request' && o === 'Placing Defrost') || (field === 'Contact Method' && o === 'Called');
        return `<option value="${o}"${isDefault ? ' selected' : ''}>${o}</option>`;
      }).join('');
      const hasDefault = t.dropdowns[field].some((o, i) => (field === 'Technician Request' && o === 'Placing Defrost') || (field === 'Contact Method' && o === 'Called'));
      wrap.innerHTML = `${lbl}<select id="${id}" onchange="markUserEdited(this);livePreview()">${hasDefault ? '' : '<option value="">— Select —</option>'}${opts}</select>`;
    } else if (isLong) {
      const isAdditionalNotes = field === 'Additional Relevant Notes';
      const isReason = field === 'Reason For Calling';
      const isActions = field === 'Actions Taken';
      const minH = isAdditionalNotes ? '2em' : (isReason || isActions) ? '3.2em' : '70px';
      const rows = isAdditionalNotes ? 1 : 2;
      wrap.innerHTML = `${lbl}<textarea id="${id}" placeholder="${displayLabel}..." rows="${rows}" style="min-height:${minH};overflow:hidden;resize:none;" oninput="autoExpand(this);markUserEdited(this);livePreview()"></textarea>`;
    } else {
      const isName = field === 'Tech Name';
      const hasCopy = ['Tech Name','Store #','Work Order #'].includes(field);
      const isWOField = field === 'Work Order #';
      const inputHtml = hasCopy
        ? `<div style="display:flex;gap:5px;align-items:center;"><input type="text" id="${id}" placeholder="${displayLabel}" ${isName ? 'oninput="capitalizeName(this);markUserEdited(this);livePreview()" class="capitalize-name"' : 'oninput="markUserEdited(this);livePreview()"'} style="flex:1;min-width:0;"/><button type="button" class="copy-inline-btn" tabindex="-1" title="Copy" onclick="copyField('${id}',this)">⎘</button>${isWOField ? `<button type="button" class="copy-inline-btn" tabindex="-1" title="Open work order in Service Channel" onclick="openWOUrl('${id}')" style="font-family:'Rajdhani',sans-serif;font-weight:700;letter-spacing:1px;font-size:11px;">GO</button>` : ''}</div>`
        : `<input type="text" id="${id}" placeholder="${displayLabel}" ${isName ? 'oninput="capitalizeName(this);markUserEdited(this);livePreview()" class="capitalize-name"' : 'oninput="markUserEdited(this);livePreview()"'}/>`;
      wrap.innerHTML = `${lbl}${inputHtml}`;
    }
    container.appendChild(wrap);
  });

  document.getElementById('notes-columns').style.display = 'flex';
  pushShared();
  livePreview();
}

function resetCopyButtons() {
  const noteBtn = document.getElementById('notes-copy-btn');
  if (noteBtn) { noteBtn.classList.remove('copied'); noteBtn.innerHTML = '<span>⎘</span> Copy'; }
  const escBtn = document.getElementById('copy-btn');
  if (escBtn) { escBtn.classList.remove('copied'); escBtn.innerHTML = '<span>⎘</span> Copy to Clipboard'; }
}

function validateNoteFields() {
  const key = document.getElementById('notes-template').value;
  if (!key) return false;
  const t = noteTemplates[key];
  return t.fields.every(f => {
    if (NOTE_OPTIONAL.includes(f)) return true;
    const id = 'note-' + f.replace(/[^a-zA-Z0-9]/g, '_');
    const el = document.getElementById(id);
    return el && el.value.trim() !== '';
  });
}

function livePreview() {
  const text = cleanNote(buildNoteText());
  const out = document.getElementById('notes-output');
  out.textContent = text;
  out._plain = text;
  resetCopyButtons();
}

function nv(field) {
  const id = 'note-' + field.replace(/[^a-zA-Z0-9]/g, '_');
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function buildNoteText() {
  const key = document.getElementById('notes-template').value;
  if (!key) return '';
  const t = noteTemplates[key];

  if (key === 'defrost') {
    const tech = nv('Tech Name'), ems = nv('EMS'), store = nv('Store #'), caseNum = nv('Case #');
    const request = nv('Technician Request'), notes = nv('Additional Relevant Notes');
    const notesText = notes ? ` Additional Relevant Notes: ${notes}` : '';
    return request === 'Placing Defrost'
      ? `${tech} | ${ems} | ${store} - Case ${caseNum} was successfully placed into defrost mode as requested by technician ${tech}. The technician confirmed the defrost onsite. No further action is required at this time.${notesText}`
      : `${tech} | ${ems} | ${store} - Successfully terminated defrost on Case ${caseNum} as requested by technician ${tech}. The technician confirmed the termination. No further action is required at this time.${notesText}`;

  } else if (key === 'module') {
    const tech = nv('Tech Name'), ems = nv('EMS'), store = nv('Store #'), module = nv('Module Name');
    const resolved = nv('Was The Issue Resolved?'), reason = nv('Reason (If Not Resolved)');
    const next = nv('Next Steps (If Not Resolved)'), notes = nv('Additional Relevant Notes');
    const notesText = notes ? ` Additional Relevant Notes: ${notes}` : '';
    return resolved === 'Yes'
      ? `${tech} | ${ems} | ${store} - Technician ${tech} reported a communication loss with module ${module}. Communication was successfully re-established.${notesText}`
      : `${tech} | ${ems} | ${store} - Technician ${tech} reported a communication loss with module ${module}. Communication could not be restored due to ${reason}. Technician was advised to ${next} and to call back after installation for verification.${notesText}`;

  } else if (key === 'dae') {
    const tech = nv('Tech Name'), ems = nv('EMS'), store = nv('Store #');
    const typeOfDAE = nv('Type Of DAE'), onsite = nv('Is Technician Onsite?');
    const newWO = nv('New W.O. Created'), notes = nv('Additional Relevant Notes');
    const onsiteSentence = onsite === 'Yes'
      ? `Technician ${tech} is currently onsite.`
      : onsite === 'No' ? `Technician ${tech} is not currently onsite.` : '';
    let text = `${onsiteSentence}${onsiteSentence ? ' ' : ''}${tech} | ${ems} | ${store} - DAE was completed for ${typeOfDAE}. A new Work Order has been generated: ${newWO}. Technician was advised to remain on site until contacted by the Level 3 Team with a resolution.`;
    if (notes) text += ` Additional Relevant Notes: ${notes}`;
    return text;

  } else if (key === 'hvac') {
    const tech = nv('Tech Name'), ems = nv('EMS'), store = nv('Store #'), unit = nv('Unit Name');
    const origCool = nv('Original Cooling SP'), newCool = nv('New Cooling SP');
    const origHeat = nv('Original Heating SP'), newHeat = nv('New Heating SP');
    const notes = nv('Additional Relevant Notes');
    const hasCooling = origCool || newCool;
    const hasHeating = origHeat || newHeat;
    let changes = [];
    if (hasCooling) changes.push(`the cooling setpoint was adjusted from ${origCool || '—'} to ${newCool || '—'}`);
    if (hasHeating) changes.push(`the heating setpoint from ${origHeat || '—'} to ${newHeat || '—'}`);
    const changeSentence = changes.length
      ? `After verifying the current setpoints and following standard operating procedures, ${changes.join(', and ')}. All changes were successfully applied.`
      : '';
    let text = `${tech} | ${ems} | ${store} - Technician ${tech} requested a modification to the setpoints for unit ${unit}. ${changeSentence}`;
    if (notes) text += ` Additional Relevant Notes: ${notes}`;
    return text.replace(/\s{2,}/g, ' ').trim();

  } else {
    let text = t.template;
    t.fields.forEach(f => {
      let val = nv(f);
      if (t.capitalizeFields && t.capitalizeFields.includes(f) && val) {
        val = val.charAt(0).toUpperCase() + val.slice(1);
      }
      if (NOTE_OPTIONAL.includes(f) && !val) {
        // For Work Order #, also strip the "| WO: " prefix if empty
        if (f === 'Work Order #') {
          text = text.replace(/ \| WO: \[Work Order #\]/, '');
        } else {
          text = text.replace(`[${f}]`, '');
        }
      } else {
        text = text.replaceAll(`[${f}]`, val);
      }
    });
    return text.replace(/\s{2,}/g, ' ').trim();
  }
}

function cleanNote(text) {
  return text
    .replace(/\.\.+/g, '.')        // remove double periods
    .replace(/\s{2,}/g, ' ')       // collapse extra spaces
    .trim();
}

function generateNotes() {
  livePreview();
  document.getElementById('notes-output').scrollIntoView({ behavior:'smooth', block:'start' });
}

function copyNote() {
  const key = document.getElementById('notes-template').value;
  if (!key) return;
  const t = noteTemplates[key];
  let valid = true;

  // Highlight missing required fields
  t.fields.forEach(f => {
    if (NOTE_OPTIONAL.includes(f)) return;
    const id = 'note-' + f.replace(/[^a-zA-Z0-9]/g, '_');
    const el = document.getElementById(id);
    if (!el) return;
    const empty = !el.value.trim();
    el.classList.toggle('invalid', empty);
    const err = document.getElementById('err-' + id.replace('note-', 'note-'));
    if (empty) valid = false;
  });

  if (!valid) {
    const first = document.querySelector('#notes-fields .invalid');
    if (first) first.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  }

  const el = document.getElementById('notes-output');
  const btn = document.getElementById('notes-copy-btn');
  const text = el._plain || el.textContent;
  if (!text.trim()) return;

  // Build this entry
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
  const techName = nv('Tech Name') || '';
  const store    = nv('Store #')   || '';
  const wo       = nv('Work Order #') || '';

  const entry =
    `${timeStr} ${dateStr}\n` +
    `Tech Name: ${techName}\n` +
    `Store: ${store}\n` +
    `WO: ${wo}\n\n` +
    text;

  // Copy plain note to clipboard
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<span>✓</span> Copied!';
  });

  // Write entry to the day's file via File System Access API
  saveNoteToFile(entry);
}

// File handle — set via the "Start Day's Log" button
let _qaFileHandle = null;
let _qaFileDate   = null;

async function createDayLog() {
  const now = new Date();
  const dateStr = now.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
  const safeDate = dateStr.replace(/\//g, '-');

  const choice = await showLogFilePrompt();
  if (!choice) return;

  try {
    if (choice === 'open') {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'Text File', accept: { 'text/plain': ['.txt'] } }],
        multiple: false,
      });
      _qaFileHandle = handle;
    } else {
      _qaFileHandle = await window.showSaveFilePicker({
        suggestedName: `QA_Notes_${safeDate}.txt`,
        types: [{ description: 'Text File', accept: { 'text/plain': ['.txt'] } }],
      });
    }
    _qaFileDate = dateStr;
    const status = document.getElementById('log-status');
    const btn = document.getElementById('create-log-btn');
    const file = await _qaFileHandle.getFile();
    status.textContent = '✓ ' + file.name;
    status.style.color = 'var(--success)';
    btn.textContent = '📁 Change Log File';
  } catch (err) {
    if (err.name !== 'AbortError') console.error('File picker error:', err);
  }
}

function showLogFilePrompt() {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;';

    const box = document.createElement('div');
    box.style.cssText = 'background:var(--surface);border:1.5px solid var(--border);border-radius:8px;padding:20px 24px;display:flex;flex-direction:column;gap:12px;min-width:260px;max-width:320px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-family:"Rajdhani",sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--accent);';
    title.textContent = 'Notes Log';

    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:12px;color:var(--label);line-height:1.5;';
    subtitle.textContent = 'Open an existing log file or create a new one?';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:4px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-ghost';
    cancelBtn.style.cssText = 'font-size:10px;padding:5px 12px;';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => { document.body.removeChild(overlay); resolve(null); };

    const openBtn = document.createElement('button');
    openBtn.className = 'btn btn-ghost';
    openBtn.style.cssText = 'font-size:10px;padding:5px 12px;border-color:var(--accent);color:var(--accent);';
    openBtn.textContent = '\u{1F4C2} Open Existing';
    openBtn.onclick = () => { document.body.removeChild(overlay); resolve('open'); };

    const newBtn = document.createElement('button');
    newBtn.className = 'btn btn-primary';
    newBtn.style.cssText = 'font-size:10px;padding:5px 12px;';
    newBtn.textContent = '+ New File';
    newBtn.onclick = () => { document.body.removeChild(overlay); resolve('new'); };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(openBtn);
    btnRow.appendChild(newBtn);
    box.appendChild(title);
    box.appendChild(subtitle);
    box.appendChild(btnRow);
    overlay.appendChild(box);

    overlay.onclick = e => { if (e.target === overlay) { document.body.removeChild(overlay); resolve(null); } };

    document.body.appendChild(overlay);
  });
}

async function saveNoteToFile(entry) {
  if (!_qaFileHandle) return; // No file set — clipboard only

  try {
    const existing = await _qaFileHandle.getFile().then(f => f.text());
    const combined = existing.trim()
      ? existing.trimEnd() + '\n\n' + '─'.repeat(40) + '\n\n' + entry
      : entry;

    const writable = await _qaFileHandle.createWritable();
    await writable.write(combined);
    await writable.close();
  } catch (err) {
    console.error('File save error:', err);
  }
}

let noteFieldsSnapshot = null;

function clearNoteFields() {
  // Snapshot current state for undo
  const key = document.getElementById('notes-template').value;
  noteFieldsSnapshot = { key, fields: {} };
  if (key) {
    noteTemplates[key].fields.forEach(f => {
      const el = document.getElementById('note-' + f.replace(/[^a-zA-Z0-9]/g, '_'));
      if (el) noteFieldsSnapshot.fields[f] = el.value;
    });
    noteFieldsSnapshot.output = document.getElementById('notes-output').textContent;
    noteFieldsSnapshot.plain = document.getElementById('notes-output')._plain;
  }
  document.getElementById('undo-btn').style.display = '';

  // Clear notes fields
  if (key) {
    noteTemplates[key].fields.forEach(f => {
      const el = document.getElementById('note-' + f.replace(/[^a-zA-Z0-9]/g, '_'));
      if (el) { el.value = ''; if (el.tagName === 'TEXTAREA') { el.style.height = 'auto'; } }
    });
    document.getElementById('notes-output').textContent = '';
    document.getElementById('notes-output')._plain = '';
    document.querySelectorAll('#notes-fields .invalid').forEach(el => el.classList.remove('invalid'));
  }
  // Reset to general template
  document.getElementById('notes-template').value = 'general';
  loadNoteFields();
  // Clear escalation form
  selectedType = null;
  savedData = {};
  clearGlobals();
  document.getElementById('type-select').value = '';
  document.getElementById('form-fields').innerHTML = '';
  document.getElementById('reminders-wrap').innerHTML = '';
  document.getElementById('form-area').classList.remove('visible');
  document.getElementById('summary-wrap').classList.remove('visible');
  resetCopyButtons();
}

function undoNoteFields() {
  if (!noteFieldsSnapshot) return;
  const { key, fields, output, plain } = noteFieldsSnapshot;
  document.getElementById('notes-template').value = key;
  loadNoteFields();
  Object.entries(fields).forEach(([f, val]) => {
    const el = document.getElementById('note-' + f.replace(/[^a-zA-Z0-9]/g, '_'));
    if (el) {
      el.value = val;
      if (el.tagName === 'TEXTAREA') autoExpand(el);
    }
  });
  const out = document.getElementById('notes-output');
  out.textContent = output || '';
  out._plain = plain || '';
  noteFieldsSnapshot = null;
  document.getElementById('undo-btn').style.display = 'none';
}

function copyNoteAsHelpdesk() {
  const btn = document.getElementById('notes-helpdesk-btn');
  const fieldMap = [
    { key: 'Technician First and Last Name', field: 'Tech Name' },
    { key: 'Store Number',            field: 'Store #' },
    { key: 'EMS System',              field: 'EMS' },
    { key: 'Associated Work Order Number', field: 'Work Order #' },
    { key: 'Description of Issue',    field: 'Reason For Calling' },
    { key: 'What Have You Done',      field: 'Actions Taken' },
    { key: 'Wiki Links Used',         field: 'Additional Relevant Notes' },
  ];

  const lines = [];
  fieldMap.forEach(({ key, field, static: staticVal }) => {
    if (staticVal) { lines.push(`${key}: ${staticVal}`); return; }
    const id = 'note-' + field.replace(/[^a-zA-Z0-9]/g, '_');
    const el = document.getElementById(id);
    const val = el ? el.value.trim() : '';
    if (val) lines.push(`${key}: ${val}`);
  });

  const text = lines.join('\n');
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<span>✓</span> Copied!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<span>⎘</span> Helpdesk'; }, 2000);
  });
}