let ws = null;
let currentSlug = null;
let projectCache = [];
let wsRetryDelay = 1;
let intervals = [];
let toastId = 0;

function connectWS() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${proto}//${location.host}/ws`);
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    handleWS(msg);
  };
  ws.onclose = () => {
    const delay = Math.min(wsRetryDelay, 30);
    setTimeout(connectWS, delay * 1000);
    wsRetryDelay = Math.min(wsRetryDelay * 2, 30);
  };
  ws.onerror = () => ws.close();
  ws.onopen = () => { wsRetryDelay = 1; };
}

function handleWS(msg) {
  if (msg.type === 'build_output') {
    const el = document.getElementById('build-output') || document.getElementById('build-log-output');
    if (el && el.style.display !== 'none') {
      const line = document.createElement('div');
      line.textContent = msg.line;
      el.appendChild(line);
      el.scrollTop = el.scrollHeight;
    }
  }
  if (msg.type === 'build_stopped') {
    document.getElementById('analyze-btn').disabled = false;
    document.getElementById('status-badge').className = 'status idle';
    document.getElementById('status-badge').textContent = 'Idle';
    updateWorkflowStep('idea');
    loadProjects();
    if (currentSlug) refreshCurrentView();
    showToast('Process complete', 'success');
  }
  if (msg.type === 'log' || msg.type === 'log_update') {
    if (currentSlug === msg.slug) {
      appendLog(msg.file, msg.content);
    }
  }
}

function showToast(text, type = 'info') {
  const toast = document.createElement('div');
  const colors = {
    info: '#1c2128;border-color:#58a6ff',
    error: '#2d1b1b;border-color:#f85149',
    warn: '#2d2a1b;border-color:#d29922',
    success: '#1b2d1b;border-color:#3fb950',
  };
  const borderColor = colors[type] || colors.info;
  toast.style.cssText = `position:fixed;bottom:${20 + (toastId % 5) * 50}px;right:20px;background:${borderColor.split(';')[0]};border:1px solid ${borderColor.split(':')[1] || '#30363d'};border-radius:6px;padding:8px 16px;font-size:13px;z-index:9999;animation:fadeIn .3s;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap`;
  toast.textContent = text;
  toast.id = 'toast-' + (++toastId);
  document.body.appendChild(toast);
  setTimeout(() => { const el = document.getElementById(toast.id); if (el) el.remove(); }, 4000);
}

// --- Tabs ---

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    document.getElementById('panel-' + tab.dataset.panel).classList.remove('hidden');
    if (tab.dataset.panel === 'plan') loadPlanDocs(currentSlug);
    if (tab.dataset.panel === 'score') loadJudgeScore(currentSlug);
  });
});

// --- Doc tabs ---

document.addEventListener('click', e => {
  const docTab = e.target.closest('.doc-tab');
  if (docTab) {
    document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'));
    docTab.classList.add('active');
    loadPlanDoc(currentSlug, docTab.dataset.doc);
  }
});

// --- Workflow Step ---

function updateWorkflowStep(step) {
  document.querySelectorAll('.step').forEach(s => {
    s.classList.toggle('active', s.dataset.step === step);
    const idx = Array.from(s.parentElement.children).indexOf(s) / 2;
    const stepIdx = ['idea','analysis','plan','build','validate','ready'].indexOf(step);
    if (idx <= stepIdx) s.classList.add('done');
    else s.classList.remove('done');
  });
}

function updateBuildStatus(step) {
  document.querySelectorAll('.build-step').forEach(s => {
    s.classList.toggle('active', s.dataset.bs === step);
    const idx = ['coach','builder','validation','judge','done'].indexOf(step);
    const bsIdx = ['coach','builder','validation','judge','done'].indexOf(s.dataset.bs);
    if (bsIdx <= idx) s.classList.add('done');
    else s.classList.remove('done');
  });
}

function updateWorkflowProgress(step) {
  document.querySelectorAll('.wf-step').forEach(s => {
    s.classList.toggle('active', s.dataset.wf === step);
    const idx = ['analysis','plan','build','code','validate','ready'].indexOf(step);
    const wfIdx = ['analysis','plan','build','code','validate','ready'].indexOf(s.dataset.wf);
    if (wfIdx <= idx) s.classList.add('done');
    else s.classList.remove('done');
  });
}

// --- Projects ---

async function loadProjects() {
  const resp = await fetch('/api/projects');
  projectCache = await resp.json();
  const list = document.getElementById('project-list');
  list.innerHTML = projectCache.map(p => {
    const phaseIcons = { 'new': '🆕', 'planned': '📋', 'built': '🔧', 'validated': '✅', 'done': '🏆' };
    const progressHtml = p.progress_pct > 0
      ? `<div class="progress-bar-mini"><div class="progress-fill-mini" style="width:${p.progress_pct}%"></div></div>`
      : '';
    return `<div class="project" onclick="selectProject('${p.slug}')">
      <div class="name">${phaseIcons[p.phase] || '📁'} ${p.name}</div>
      <div class="meta">
        ${p.has_tasks ? '<span class="badge tasks">tasks</span>' : ''}
        ${p.has_frontend ? '<span class="badge fe">FE</span>' : ''}
        ${p.has_backend ? '<span class="badge be">BE</span>' : ''}
        ${p.has_judge ? '<span class="badge judge">scored</span>' : ''}
      </div>
      ${progressHtml}
    </div>`;
  }).join('');
}

async function selectProject(slug) {
  currentSlug = slug;
  refreshCurrentView();
}

function refreshCurrentView() {
  const activeTab = document.querySelector('.tab.active');
  const panel = activeTab ? activeTab.dataset.panel : 'coach';
  if (panel === 'coach') refreshCoach();
  else if (panel === 'plan') loadPlanDocs(currentSlug);
  else if (panel === 'score') loadJudgeScore(currentSlug);
  else if (panel === 'files') loadTree(currentSlug);
  else if (panel === 'logs') loadLogs(currentSlug);
  else if (panel === 'build') refreshBuild();
}

async function refreshCoach() {
  if (!currentSlug) return;
  const resp = await fetch(`/api/projects/${currentSlug}`);
  const p = await resp.json();
  const welcome = document.getElementById('coach-welcome');
  const output = document.getElementById('coach-output');

  if (p.phase === 'new') {
    welcome.style.display = '';
    output.style.display = 'none';
  } else {
    welcome.style.display = 'none';
    output.style.display = '';
    updateWorkflowProgress('analysis');

    if (p.has_plan) updateWorkflowProgress('plan');
    if (p.has_frontend || p.has_backend) updateWorkflowProgress('code');
    if (p.validation_passed) {
      updateWorkflowProgress('validate');
      updateWorkflowProgress('ready');
    }

    document.getElementById('plan-ready').style.display = p.has_plan ? '' : 'none';

    // Load progress
    loadProgressDisplay(currentSlug);
  }
}

async function loadProgressDisplay(slug) {
  const stateResp = await fetch(`/api/projects/${slug}/state`);
  const state = await stateResp.json();
  if (!state || !state.all_tasks) return;

  const progressEl = document.getElementById('progress-display');
  if (!progressEl) return;

  const pct = state.progress_pct || 0;
  const completed = state.completed || [];
  const remaining = state.remaining || [];

  progressEl.innerHTML = `
    <div class="progress-section">
      <div class="progress-header">
        <span>Progress</span>
        <span>${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="task-columns">
        <div class="task-col">
          <div class="task-col-title">Completed (${completed.length})</div>
          ${completed.map(t => `<div class="task-item done">✓ ${escapeHtml(t)}</div>`).join('')}
        </div>
        <div class="task-col">
          <div class="task-col-title">Remaining (${remaining.length})</div>
          ${remaining.map(t => `<div class="task-item">□ ${escapeHtml(t)}</div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

async function refreshBuild() {
  if (!currentSlug) return;
  const resp = await fetch(`/api/projects/${currentSlug}`);
  const p = await resp.json();
  if (p.phase === 'planned') {
    updateBuildStatus('coach');
  } else if (p.phase === 'built' || p.phase === 'validated') {
    updateBuildStatus('coach');
    updateBuildStatus('builder');
    updateBuildStatus('validation');
  } else if (p.phase === 'done') {
    updateBuildStatus('coach');
    updateBuildStatus('builder');
    updateBuildStatus('validation');
    updateBuildStatus('judge');
    updateBuildStatus('done');
    const vr = document.getElementById('validation-result');
    vr.style.display = '';
    vr.innerHTML = '<div class="success-banner">✓ Project ready for demo! Check the Judge Score tab.</div>';
  }
}

// --- Coach Flow ---

async function startAnalysis() {
  const task = document.getElementById('task-input').value;
  if (!task) { showToast('Enter a project idea first', 'error'); return; }

  document.getElementById('analyze-btn').disabled = true;
  document.getElementById('status-badge').className = 'status running';
  document.getElementById('status-badge').textContent = 'Analyzing...';
  updateWorkflowStep('analysis');

  const coachOutput = document.getElementById('coach-output');
  coachOutput.style.display = '';
  document.getElementById('build-output').innerHTML = '';
  updateWorkflowProgress('analysis');

  const resp = await fetch('/api/coach/start', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({task}),
  });
  const data = await resp.json();
  if (data.error) { showToast(data.error, 'error'); return; }
  showToast('Coach analyzing your idea...', 'info');

  const pollId = setInterval(async () => {
    const sr = await fetch('/api/coach/status');
    const status = await sr.json();
    if (!status.running) {
      clearInterval(pollId);
      document.getElementById('analyze-btn').disabled = false;
      document.getElementById('status-badge').className = 'status idle';
      document.getElementById('status-badge').textContent = 'Planned';
      updateWorkflowStep('plan');
      updateWorkflowProgress('plan');

      loadProjects();
      currentSlug = data.slug;
      const planResp = await fetch(`/api/projects/${data.slug}/plan`);
      const planData = await planResp.json();
      if (planData && Object.keys(planData).length > 0) {
        document.getElementById('plan-ready').style.display = '';
        loadProgressDisplay(data.slug);
        showToast('Coach complete! Review the plan and click Build MVP.', 'success');
      } else {
        showToast('Coach finished but plan files may be incomplete', 'warn');
      }
    }
  }, 2000);
}

async function startBuild() {
  if (!currentSlug) return;

  document.getElementById('plan-ready').style.display = 'none';
  document.getElementById('status-badge').className = 'status running';
  document.getElementById('status-badge').textContent = 'Building...';
  updateWorkflowStep('build');
  updateWorkflowProgress('code');

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-panel="build"]').classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('panel-build').classList.remove('hidden');

  const buildOutput = document.getElementById('build-log-output');
  buildOutput.innerHTML = '';
  document.getElementById('validation-result').style.display = 'none';
  updateBuildStatus('builder');

  const resp = await fetch('/api/build/start', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({slug: currentSlug}),
  });
  const data = await resp.json();
  if (data.error) { showToast(data.error, 'error'); return; }

  const pollId = setInterval(async () => {
    const sr = await fetch('/api/build/status');
    const status = await sr.json();
    if (!status.running) {
      clearInterval(pollId);
      document.getElementById('status-badge').className = 'status idle';
      document.getElementById('status-badge').textContent = status.exit_code === 0 ? 'Ready!' : 'Failed';

      if (status.exit_code === 0) {
        updateBuildStatus('judge');
        updateBuildStatus('done');
        updateWorkflowStep('ready');
        updateWorkflowProgress('ready');
        document.getElementById('validation-result').innerHTML = '<div class="success-banner">✓ Project ready for demo! Check the Judge Score tab.</div>';
        document.getElementById('validation-result').style.display = '';
        showToast('Project is ready! Check the Judge Score tab.', 'success');
      } else {
        updateBuildStatus('validation');
        document.getElementById('validation-result').innerHTML = '<div class="error-banner">✗ Build encountered issues. Check the logs for details.</div>';
        document.getElementById('validation-result').style.display = '';
        showToast('Build had issues. Check the build output.', 'error');
      }

      loadProjects();
      refreshCurrentView();
    }
  }, 2000);
}

// --- Plan Docs ---

async function loadPlanDocs(slug) {
  if (!slug) { document.getElementById('plan-view').textContent = 'Select a project to view the plan'; return; }
  const resp = await fetch(`/api/projects/${slug}/plan`);
  const docs = await resp.json();
  if (!docs || Object.keys(docs).length === 0) {
    document.getElementById('plan-view').innerHTML = '<div style="color:#8b949e;font-size:13px">No plan documents yet. Run the Coach first.</div>';
    return;
  }
  const activeDoc = document.querySelector('.doc-tab.active');
  const docName = activeDoc ? activeDoc.dataset.doc : 'PLAN.md';
  loadPlanDoc(slug, docName);
}

async function loadPlanDoc(slug, docName) {
  if (!slug) return;
  const resp = await fetch(`/api/projects/${slug}/doc/${docName}`);
  const data = await resp.json();
  const view = document.getElementById('plan-view');
  if (data.error) { view.textContent = 'Document not found'; return; }
  view.innerHTML = `<div class="doc-header">${docName}</div><div class="doc-content">${escapeHtml(data.content)}</div>`;
}

// --- Judge Score ---

async function loadJudgeScore(slug) {
  const el = document.getElementById('judge-view');
  if (!slug) { el.innerHTML = '<div style="color:#8b949e;font-size:13px">Select a project to view judge score</div>'; return; }
  const resp = await fetch(`/api/projects/${slug}/doc/JUDGE_SCORE.md`);
  const data = await resp.json();
  if (data.error) {
    el.innerHTML = '<div style="color:#8b949e;font-size:13px">No judge score yet. Build the project first.</div>';
    return;
  }
  el.innerHTML = `<div class="doc-header">Judge Score</div><div class="doc-content">${escapeHtml(data.content)}</div>`;
}

// --- Files ---

async function loadTree(slug) {
  if (!slug) { document.getElementById('tree-view').textContent = 'Select a project to browse files'; return; }
  const resp = await fetch(`/api/projects/${slug}/tree`);
  const tree = await resp.json();
  document.getElementById('tree-view').innerHTML = renderTree(tree);
}

function renderTree(items, depth = 0) {
  if (!items || items.length === 0) return '<div style="color:#8b949e;font-size:13px">(empty)</div>';
  return items.map(item => {
    const indent = depth * 20;
    if (item.type === 'dir') {
      return `<div class="tree-item" style="padding-left:${indent}px" onclick="toggleDir(this)">
        <span class="icon">📁</span>${item.name}
      </div><div class="tree-children" style="display:none">${renderTree(item.children, depth + 1)}</div>`;
    } else {
      return `<div class="tree-item" style="padding-left:${indent}px" onclick="viewFile('${item.path}')">
        <span class="icon">📄</span>${item.name} <span style="color:#484f58;font-size:11px">(${item.size}b)</span>
      </div>`;
    }
  }).join('');
}

function toggleDir(el) {
  const children = el.nextElementSibling;
  if (children) children.style.display = children.style.display === 'none' ? '' : 'none';
}

async function viewFile(path) {
  const resp = await fetch(`/api/projects/${currentSlug}/file?path=${encodeURIComponent(path)}`);
  const data = await resp.json();
  if (data.error) { alert(data.error); return; }
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  const frame = document.createElement('div');
  frame.style.cssText = 'background:#0d1117;border:1px solid #30363d;border-radius:8px;width:80%;max-width:900px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column';
  frame.innerHTML = `<div style="padding:10px 16px;background:#161b22;border-bottom:1px solid #30363d;display:flex;justify-content:space-between;align-items:center">
    <span style="font-weight:600">${escapeHtml(data.path)}</span>
    <span onclick="this.closest('div[style]').parentElement.parentElement.remove()" style="cursor:pointer;font-size:18px">&times;</span>
  </div><div class="file-view" style="flex:1">${escapeHtml(data.content)}</div>`;
  overlay.appendChild(frame);
  document.body.appendChild(overlay);
}

// --- Logs ---

async function loadLogs(slug) {
  if (!slug) { document.getElementById('log-view').textContent = 'Select a project to view logs'; return; }
  const resp = await fetch(`/api/projects/${slug}/runs`);
  const files = await resp.json();
  const el = document.getElementById('log-view');
  el.innerHTML = '<div style="margin-bottom:8px;font-weight:600">Run Logs</div>';
  if (files.length === 0) { el.innerHTML += '<div style="color:#8b949e;font-size:13px">No logs yet</div>'; return; }
  const blocks = await Promise.all(files.map(async f => {
    const r = await fetch(`/api/projects/${slug}/runs/${f.name}`);
    const data = await r.json();
    const block = document.createElement('div');
    block.style.marginBottom = '16px';
    block.innerHTML = `<div style="font-weight:600;color:#58a6ff;margin-bottom:4px">${f.name} (${f.size} bytes)</div>`;
    const pre = document.createElement('div');
    pre.style.cssText = 'background:#161b22;border:1px solid #30363d;border-radius:4px;padding:8px;font-family:monospace;font-size:12px;white-space:pre-wrap';
    pre.textContent = data.content || '(empty)';
    block.appendChild(pre);
    return block;
  }));
  blocks.forEach(b => el.appendChild(b));
}

function appendLog(file, content) {
  const el = document.getElementById('log-view');
  if (!el || el.children.length === 0) return;
  const existing = el.querySelector(`[data-file="${file}"]`);
  if (existing) {
    existing.querySelector('.log-content').textContent = content;
  } else {
    const block = document.createElement('div');
    block.dataset.file = file;
    block.style.marginBottom = '12px';
    block.innerHTML = `<div style="font-weight:600;color:#58a6ff">${file}</div><div class="log-content" style="background:#161b22;border:1px solid #30363d;border-radius:4px;padding:8px;font-family:monospace;font-size:12px;white-space:pre-wrap">${content}</div>`;
    el.prepend(block);
  }
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function cleanup() {
  intervals.forEach(id => clearInterval(id));
  intervals = [];
}

connectWS();
loadProjects();
const pi = setInterval(loadProjects, 10000);
intervals.push(pi);
