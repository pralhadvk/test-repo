const BASE_URL = "https://top3-search.vercel.app";
const RECENT_KEY = "3cs_ext_recent";
const MAX_RECENT = 5;

let selectedCategory = "";

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderRecent();

  // Category buttons
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.cat || "";
    });
  });

  document.getElementById("searchBtn").addEventListener("click", doSearch);
  document.getElementById("query").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  // Check if page has selected text and prefill
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.scripting && chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => window.getSelection()?.toString().trim() || "",
    }).then(([result]) => {
      if (result?.result) {
        document.getElementById("query").value = result.result.slice(0, 100);
      }
    }).catch(() => {});
  });
});

// ── Search ─────────────────────────────────────────────────────────────────
async function doSearch() {
  const query = document.getElementById("query").value.trim();
  if (!query) return;

  const btn = document.getElementById("searchBtn");
  const statusEl = document.getElementById("status");
  const resultsEl = document.getElementById("results");
  const recentSection = document.getElementById("recentSection");

  btn.disabled = true;
  btn.textContent = "…";
  statusEl.textContent = "Searching…";
  resultsEl.innerHTML = "";
  recentSection.style.display = "none";

  try {
    const res = await fetch(`${BASE_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, category: selectedCategory || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Search failed");

    statusEl.textContent = "";
    renderResults(data.results || [], query, data.slug);
    saveRecent(query);
  } catch (err) {
    statusEl.textContent = "";
    resultsEl.innerHTML = `<div class="error">${err.message}</div>`;
    recentSection.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.textContent = "Go";
  }
}

// ── Render ─────────────────────────────────────────────────────────────────
function renderResults(results, query, slug) {
  const el = document.getElementById("results");
  if (!results.length) {
    el.innerHTML = `<div class="error">No results found.</div>`;
    return;
  }

  const html = results.map(r => {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(r.name)}`;
    return `
      <div class="result-card">
        <div class="rank-badge rank-${r.rank}">${r.rank}</div>
        <div class="result-body">
          <div class="result-name">${escHtml(r.name)}</div>
          <div class="result-desc">${escHtml(r.description)}</div>
        </div>
        <a class="result-link" href="${googleUrl}" target="_blank" title="Google it">↗</a>
      </div>`;
  }).join("");

  const shareUrl = slug ? `${BASE_URL}/s/${slug}` : null;
  const shareBar = shareUrl ? `
    <div class="share-bar">
      <a class="share-btn" href="${BASE_URL}/?q=${encodeURIComponent(query)}" target="_blank">Open full →</a>
      <a class="share-btn" href="${shareUrl}" target="_blank">Share link →</a>
    </div>` : `<div class="share-bar"><a class="share-btn" href="${BASE_URL}/?q=${encodeURIComponent(query)}" target="_blank">Open full →</a></div>`;

  el.innerHTML = html + shareBar;
}

function renderRecent() {
  const recent = getRecent();
  const el = document.getElementById("recent");
  const section = document.getElementById("recentSection");

  if (!recent.length) { section.style.display = "none"; return; }
  section.style.display = "block";

  el.innerHTML = recent.map(q => `
    <div class="recent-item" data-q="${escHtml(q)}">
      <span style="color:#334155">⟳</span> ${escHtml(q)}
    </div>`).join("");

  el.querySelectorAll(".recent-item").forEach(item => {
    item.addEventListener("click", () => {
      document.getElementById("query").value = item.dataset.q;
      doSearch();
    });
  });
}

// ── Storage ────────────────────────────────────────────────────────────────
function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}

function saveRecent(query) {
  const list = [query, ...getRecent().filter(q => q !== query)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
