import * as pdfjsLib from "../vendor/pdfjs/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("../vendor/pdfjs/build/pdf.worker.mjs", import.meta.url).href;

const main = document.querySelector("#main-content");
const catalogUrl = new URL("./data/catalog.json", document.baseURI);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const courseHref = (id) => `#/course/${encodeURIComponent(id)}`;
let courses = [];
let routeKey = "";
let activeReader = null;

function icon(name) {
  const paths = {
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8"/>',
    folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2h7.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>',
    empty: '<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H10l2 2h6.5A1.5 1.5 0 0 1 20 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><path d="M8 13h8"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
}

function setPage(html, className = "") {
  if (activeReader) { activeReader.destroy(); activeReader = null; }
  main.className = `main-content ${className}`.trim();
  main.innerHTML = html;
  main.focus({ preventScroll: true });
}

function renderHome() {
  const total = courses.reduce((sum, course) => sum + course.decks.length, 0);
  const cards = courses.map((course) => `
    <a class="course-card" href="${courseHref(course.id)}">
      <span class="course-card-top"><span class="course-symbol">${icon("book")}</span><span class="course-arrow" aria-hidden="true">↗</span></span>
      <h3>${escapeHtml(course.name)}</h3>
      <span class="course-count"><i class="count-dot"></i>${course.decks.length} 份教材</span>
    </a>`).join("");
  setPage(`<section class="hero"><p class="eyebrow">YOUR STUDY LIBRARY</p><h1>課程簡報，<span>逐頁對照。</span></h1><p>整理你的課程教材，在原文與繁體中文之間自在切換。</p></section>
    <div class="section-heading"><div><h2>所有課程</h2><p>目前收錄 ${courses.length} 門課程 · ${total} 份教材</p></div></div>
    <section class="course-grid" aria-label="課程列表">${cards}</section>`, "home-page");
}

function renderCourse(course) {
  const rows = course.decks.map((deck) => `<li><a class="material-row" href="#/reader/${encodeURIComponent(course.id)}/${encodeURIComponent(deck.id)}"><span class="file-icon" aria-hidden="true"></span><span class="material-main"><span class="material-title">${escapeHtml(deck.title)}</span><span class="material-meta">原文 PDF · 繁體中文 PDF</span></span><span class="material-chevron" aria-hidden="true">›</span></a></li>`).join("");
  const content = course.decks.length ? `<ul class="material-list">${rows}</ul>` : `<div class="empty-state"><span class="empty-icon">${icon("empty")}</span><h3>目前沒有已發布教材</h3><p>教材完成審核並確認發布後，會出現在這份清單中。</p></div>`;
  setPage(`<section class="page-heading"><nav class="breadcrumb" aria-label="頁面導覽"><a href="#/">所有課程</a><span class="breadcrumb-separator">/</span><span class="breadcrumb-current">${escapeHtml(course.name)}</span></nav><h1>${escapeHtml(course.name)}</h1><p>本課程目前有 ${course.decks.length} 份教材</p></section><section class="materials-panel"><header class="materials-header"><h2>教材清單</h2><span>${course.decks.length} 份教材</span></header>${content}</section>`, "course-page");
}

function showError(title, description) {
  setPage(`<section class="materials-panel reader-unavailable"><div class="error-state"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><p><a class="button" href="#/">返回課程首頁</a></p></div></section>`);
}

function readerMarkup(course, deck) {
  const pane = (side, title, url) => `<section class="pdf-pane" data-side="${side}" data-pdf="${escapeHtml(url)}"><header class="pane-header"><div class="pane-title"><strong>${title}</strong><span>${escapeHtml(deck.title)}</span></div><div class="pane-tools"><label class="page-jump">頁碼 <input class="page-input" type="number" min="1" value="1" aria-label="${title}頁碼"><span>/</span><span class="page-total">…</span></label><div class="zoom-group"><button class="zoom-button" type="button" data-zoom="out" aria-label="縮小">−</button><span class="zoom-value">100%</span><button class="zoom-button" type="button" data-zoom="in" aria-label="放大">+</button></div></div></header><div class="pdf-viewport" tabindex="0" aria-label="${title}連續閱讀區"><div class="pdf-status" role="status">正在載入 PDF…</div><div class="pdf-pages"></div></div></section>`;
  return `<div class="reader-title-row"><div><nav class="breadcrumb" aria-label="頁面導覽"><a href="#/">所有課程</a><span class="breadcrumb-separator">/</span><a href="${courseHref(course.id)}">${escapeHtml(course.name)}</a><span class="breadcrumb-separator">/</span><span class="breadcrumb-current">${escapeHtml(deck.title)}</span></nav><h1>${escapeHtml(deck.title)}</h1><p class="reader-subtitle">原文與繁體中文逐頁對照閱讀</p></div><div class="reader-top-actions"><a class="button" href="${courseHref(course.id)}">返回教材清單</a><button class="button" type="button" data-fullscreen>全螢幕</button></div></div>
    <div class="reader-toolbar"><div class="sync-options" role="group" aria-label="捲動模式"><span class="sync-label">捲動模式</span><button class="sync-option" data-mode="separate" aria-pressed="false">分開捲動</button><button class="sync-option" data-mode="from-original" aria-pressed="true">同步捲動－以原文對齊</button><button class="sync-option" data-mode="from-translation" aria-pressed="false">同步捲動－以中文對齊</button></div><p class="sync-help">同步時依頁碼與頁內位置對齊</p></div>
    <div class="reader-grid">${pane("original", "原文版", deck.originalPdf)}${pane("translation", "繁體中文版", deck.translatedPdf)}</div><div class="reader-legend"><span></span><span>使用各欄工具列跳頁或調整縮放</span></div>`;
}

function pageAt(viewport, pages) {
  const top = viewport.getBoundingClientRect().top + 12;
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < pages.length; i += 1) {
    const rect = pages[i].element.getBoundingClientRect();
    const distance = rect.bottom < top ? top - rect.bottom : rect.top > top ? rect.top - top : 0;
    if (distance < bestDistance) { bestDistance = distance; best = i; }
  }
  const page = pages[best];
  if (!page) return { page: 1, ratio: 0 };
  const rect = page.element.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (top - rect.top) / Math.max(1, rect.height)));
  return { page: best + 1, ratio };
}

function scrollToPosition(pane, position) {
  const page = pane.pages[Math.min(pane.pages.length - 1, Math.max(0, position.page - 1))];
  if (!page) return pane.viewport.scrollTop;
  const viewportRect = pane.viewport.getBoundingClientRect();
  const pageRect = page.element.getBoundingClientRect();
  const nextTop = pane.viewport.scrollTop + pageRect.top - viewportRect.top + position.ratio * pageRect.height - 12;
  pane.viewport.scrollTop = nextTop;
  return nextTop;
}

async function openReader(course, deck) {
  setPage(readerMarkup(course, deck), "reader-page");
  const readerRoot = main;
  const panes = [...readerRoot.querySelectorAll(".pdf-pane")].map((element) => ({ element, side: element.dataset.side, url: element.dataset.pdf, viewport: element.querySelector(".pdf-viewport"), pages: [], pdf: null, loadingTask: null, zoom: 1, observer: null }));
  let mode = "from-original";
  let syncScheduled = false;
  let latestSyncSource = null;
  let programmaticScroll = null;
  const updateModeButtons = () => readerRoot.querySelectorAll("[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
  const syncFrom = (source) => {
    if (mode === "separate") return;
    latestSyncSource = source;
    if (syncScheduled) return;
    syncScheduled = true;
    requestAnimationFrame(() => {
      syncScheduled = false;
      const currentSource = latestSyncSource;
      const target = panes.find((pane) => pane !== currentSource);
      if (!currentSource?.pages.length || !target?.pages.length) return;
      const previousTop = target.viewport.scrollTop;
      const expectedTop = scrollToPosition(target, pageAt(currentSource.viewport, currentSource.pages));
      if (Math.abs(previousTop - expectedTop) > 0.5) programmaticScroll = { pane: target, top: expectedTop };
    });
  };
  const updateCurrentPage = (pane) => {
    if (!pane.pages.length) return;
    const position = pageAt(pane.viewport, pane.pages);
    pane.element.querySelector(".page-input").value = position.page;
  };
  const renderPage = async (pane, pageRecord) => {
    if (pageRecord.rendering || pageRecord.rendered || !pane.pdf) return;
    pageRecord.rendering = true;
    try {
      const page = await pane.pdf.getPage(pageRecord.number);
      const base = page.getViewport({ scale: 1 });
      const maxWidth = Math.max(250, pane.viewport.clientWidth - 34);
      const width = Math.max(180, Math.min(maxWidth, 1100) * pane.zoom);
      const viewport = page.getViewport({ scale: width / base.width });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      pageRecord.element.style.width = `${viewport.width}px`;
      pageRecord.element.style.height = `${viewport.height}px`;
      await page.render({ canvasContext: context, viewport, transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null }).promise;
      pageRecord.element.replaceChildren(canvas);
      pageRecord.rendered = true;
    } catch (error) {
      console.error("PDF page render failed", error);
    } finally { pageRecord.rendering = false; }
  };
  const panePromises = panes.map(async (pane) => {
    try {
      pane.loadingTask = pdfjsLib.getDocument({ url: pane.url, cMapUrl: new URL("../vendor/pdfjs/cmaps/", import.meta.url).href, cMapPacked: true, standardFontDataUrl: new URL("../vendor/pdfjs/standard_fonts/", import.meta.url).href, wasmUrl: new URL("../vendor/pdfjs/wasm/", import.meta.url).href });
      pane.pdf = await pane.loadingTask.promise;
      const total = pane.pdf.numPages;
      pane.element.querySelector(".page-total").textContent = total;
      const pagesHost = pane.element.querySelector(".pdf-pages");
      for (let i = 1; i <= total; i += 1) {
        const pdfPage = await pane.pdf.getPage(i);
        const base = pdfPage.getViewport({ scale: 1 });
        const width = Math.max(180, Math.min(pane.viewport.clientWidth - 34, 1100) * pane.zoom);
        const height = width * base.height / base.width;
        const element = document.createElement("div");
        element.className = "pdf-page";
        element.dataset.page = i;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.innerHTML = `<div class="pdf-page-placeholder" style="height:${height}px"></div>`;
        pagesHost.append(element);
        pane.pages.push({ number: i, element, ratio: base.height / base.width, rendered: false, rendering: false });
      }
      pane.element.querySelector(".pdf-status").remove();
      pane.observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const record = pane.pages[Number(entry.target.dataset.page) - 1];
        renderPage(pane, record);
        for (const near of [record?.number - 1, record?.number, record?.number + 1]) if (near > 0 && near <= pane.pages.length) renderPage(pane, pane.pages[near - 1]);
      }), { root: pane.viewport, rootMargin: "900px 0px" });
      pane.pages.forEach((record) => pane.observer.observe(record.element));
      updateCurrentPage(pane);
    } catch (error) {
      console.error("PDF load failed", error);
      pane.element.querySelector(".pdf-status").textContent = "PDF 載入失敗，請確認檔案路徑與格式。";
    }
  });
  panes.forEach((pane) => {
    pane.viewport.addEventListener("scroll", () => {
      updateCurrentPage(pane);
      if (programmaticScroll?.pane === pane && Math.abs(pane.viewport.scrollTop - programmaticScroll.top) < 1) {
        programmaticScroll = null;
        return;
      }
      syncFrom(pane);
    }, { passive: true });
    pane.element.querySelector(".page-input").addEventListener("change", (event) => {
      const page = Math.max(1, Math.min(pane.pages.length, Number(event.target.value) || 1));
      if (pane.pages.length) { pane.viewport.scrollTop += pane.pages[page - 1].element.getBoundingClientRect().top - pane.viewport.getBoundingClientRect().top; syncFrom(pane); }
      event.target.value = page;
    });
    pane.element.querySelectorAll("[data-zoom]").forEach((button) => button.addEventListener("click", () => {
      pane.zoom = Math.max(0.5, Math.min(2, +(pane.zoom + (button.dataset.zoom === "in" ? 0.1 : -0.1)).toFixed(1)));
      pane.element.querySelector(".zoom-value").textContent = `${Math.round(pane.zoom * 100)}%`;
      const position = pageAt(pane.viewport, pane.pages);
      pane.pages.forEach((record) => {
        record.rendered = false;
        const width = Math.max(180, Math.min(pane.viewport.clientWidth - 34, 1100) * pane.zoom);
        const height = width * record.ratio;
        record.element.style.width = `${width}px`;
        record.element.style.height = `${height}px`;
        const placeholder = Object.assign(document.createElement("div"), { className: "pdf-page-placeholder" });
        placeholder.style.height = `${height}px`;
        record.element.replaceChildren(placeholder);
      });
      pane.observer?.disconnect();
      pane.observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) renderPage(pane, pane.pages[Number(entry.target.dataset.page) - 1]); }), { root: pane.viewport, rootMargin: "900px 0px" });
      pane.pages.forEach((record) => pane.observer.observe(record.element));
      requestAnimationFrame(() => scrollToPosition(pane, position));
    }));
  });
  readerRoot.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => {
    mode = button.dataset.mode;
    if (mode === "from-original") syncFrom(panes[0]);
    if (mode === "from-translation") syncFrom(panes[1]);
    updateModeButtons();
  }));
  readerRoot.querySelector("[data-fullscreen]").addEventListener("click", async (event) => {
    if (!document.fullscreenElement) await readerRoot.querySelector(".reader-grid").requestFullscreen?.(); else await document.exitFullscreen?.();
    event.currentTarget.textContent = document.fullscreenElement ? "離開全螢幕" : "全螢幕";
  });
  activeReader = { destroy() { panes.forEach((pane) => { pane.observer?.disconnect(); pane.loadingTask?.destroy(); }); } };
  await Promise.all(panePromises);
  if (panes[0].pages.length && panes[1].pages.length) syncFrom(panes[0]);
}

function renderRoute() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw ? raw.split("/").map((part) => { try { return decodeURIComponent(part); } catch { return part; } }) : [];
  const key = location.hash;
  if (key === routeKey && main.dataset.ready === "true") return;
  routeKey = key;
  main.dataset.ready = "true";
  if (!parts.length) return renderHome();
  if (parts[0] === "course" && parts[1]) {
    const course = courses.find((item) => item.id === parts[1]);
    return course ? renderCourse(course) : showError("找不到這門課程", "請從課程首頁選擇教材。" );
  }
  if (parts[0] === "reader" && parts[1] && parts[2]) {
    const course = courses.find((item) => item.id === parts[1]);
    const deck = course?.decks.find((item) => item.id === parts[2]);
    return deck ? openReader(course, deck) : showError("找不到這份公開教材", "草稿與待審核教材不會出現在網站中。" );
  }
  renderHome();
}

try {
  const response = await fetch(catalogUrl);
  if (!response.ok) throw new Error(`catalog request returned ${response.status}`);
  const catalog = await response.json();
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.courses)) throw new Error("unsupported catalog schema");
  courses = catalog.courses;
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
} catch (error) {
  console.error("Could not load SlideNotes catalog", error);
  showError("課程資料載入失敗", "請使用專案提供的建置流程啟動網站預覽。" );
}
