// Frontend app (no framework): calls /api/scan (Vercel serverless function)
// Also runs radar animation + live feed + OpenClaw agent log.

(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const agentLog = $("#agentLog");
  const terminalBody = $("#terminalBody");
  const result = $("#result");

  const scanBtn = $("#scanBtn");
  const copyBtn = $("#copyBtn");
  const exportJsonBtn = $("#exportJsonBtn");
  const exampleBtn = $("#exampleBtn");

  const walletInput = $("#walletInput");

  const rAddr = $("#rAddr");
  const rScore = $("#rScore");
  const rConf = $("#rConf");

  const bStyle = $("#bStyle");
  const bRisk = $("#bRisk");
  const bTempo = $("#bTempo");
  const bPremium = $("#bPremium");

  const mTx = $("#mTx");
  const mTok = $("#mTok");
  const mLast = $("#mLast");
  const mEarly = $("#mEarly");

  const dna = $("#dna");
  const pat = $("#pat");

  const premium = $("#premium");
  const pInsider = $("#pInsider");
  const pSniper = $("#pSniper");
  const pExit = $("#pExit");
  const pTags = $("#pTags");

  const tokenGrid = $("#tokenGrid");

  const guideModal = $("#guideModal");
  const openGuideBtn = $("#openGuideBtn");
  const closeGuideBtn = $("#closeGuideBtn");

  const modeAuto = $("#modeAuto");
  const modeManual = $("#modeManual");

  const gateCheck = $("#gateCheck");
  const gateUnlockBtn = $("#gateUnlockBtn");
  const gateResetBtn = $("#gateResetBtn");
  const gateState = $("#gateState");

  const copyLinkBtn = $("#copyLinkBtn");

  const feedInner = $("#feedInner");

  let lastScanJson = null;

  // ---------------- Gate (demo) ----------------
  const gateKey = "claw_premium";
  const getGate = () => localStorage.getItem(gateKey) === "1";
  function setGate(on) {
    localStorage.setItem(gateKey, on ? "1" : "0");
    gateState.textContent = on ? "UNLOCKED" : "LOCKED";
    gateState.classList.toggle("is-on", on);
    bPremium.hidden = !on;
  }

  // ---------------- Utilities ----------------
  const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  function shortAddr(a) {
    a = String(a || "");
    if (a.length <= 14) return a;
    return a.slice(0, 6) + "…" + a.slice(-5);
  }

  function logAgent(line) {
    const div = document.createElement("div");
    div.className = "log__line";
    div.textContent = "$ " + line;
    agentLog.appendChild(div);
    agentLog.scrollTop = agentLog.scrollHeight;
  }

  function tline(line, dim) {
    const div = document.createElement("div");
    div.className = "tline" + (dim ? " dim" : "");
    div.textContent = "$ " + line;
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function addFeed(text, badge) {
    const item = document.createElement("div");
    item.className = "feedItem";
    item.innerHTML = `
      <div>${text}</div>
      <div class="feedMeta"><span>${badge || "AI signal"}</span><span>${nowTime()}</span></div>
    `;
    feedInner.insertBefore(item, feedInner.firstChild);
    while (feedInner.children.length > 14) feedInner.removeChild(feedInner.lastChild);
  }

  // ---------------- Live feed loop ----------------
  const feedEvents = [
    () => `Smart wallet cluster touched a fresh SOL meme pair (early volume)`,
    () => `Sniper-like wallet exited with discipline (partial sells)`,
    () => `Liquidity spike detected — watchlist candidates updated`,
    () => `OpenClaw agents recalibrated scoring weights`,
    () => `Radar signals: elevated inflow from tracked wallets`,
  ];
  setInterval(() => addFeed(feedEvents[Math.floor(Math.random() * feedEvents.length)](), "system"), 2500);
  for (let i = 0; i < 6; i++) addFeed(feedEvents[Math.floor(Math.random() * feedEvents.length)](), "system");

  // ---------------- Modes ----------------
  function setMode(isAuto) {
    modeAuto.classList.toggle("chip--on", isAuto);
    modeManual.classList.toggle("chip--on", !isAuto);
  }

  // ---------------- Scan ----------------
  const scanSteps = [
    "scout_agent: fetching wallet transactions",
    "scout_agent: extracting token interactions",
    "pattern_agent: computing behavior metrics",
    "score_agent: generating smart money score",
    "narrator_agent: generating summary",
  ];

  async function runScan() {
    const wallet = (walletInput.value || "").trim();
    if (!wallet) {
      alert("Paste a Solana wallet address first.");
      walletInput.focus();
      return;
    }

    scanBtn.disabled = true;
    copyBtn.disabled = true;
    exportJsonBtn.disabled = true;
    result.hidden = true;
    premium.hidden = true;
    tokenGrid.innerHTML = "";
    terminalBody.innerHTML = "";
    tline("starting scan…");
    logAgent(`job accepted → wallet=${shortAddr(wallet)}`);

    let i = 0;
    const stepTimer = setInterval(() => {
      if (i < scanSteps.length) {
        tline(scanSteps[i]);
        i++;
      } else {
        clearInterval(stepTimer);
      }
    }, 420);

    const isPremium = getGate();

    try {
      const res = await fetch(`/api/scan?wallet=${encodeURIComponent(wallet)}&premium=${isPremium ? "1" : "0"}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Scan failed");
      }

      lastScanJson = data;
      exportJsonBtn.disabled = false;

      // Fill profile
      rAddr.textContent = wallet;
      rScore.textContent = String(data.score);
      rConf.textContent = `Confidence ${data.confidence}%`;

      bStyle.textContent = `Style: ${data.style}`;
      bRisk.textContent = `Risk: ${data.risk}`;
      bTempo.textContent = `Tempo: ${data.tempo}`;

      mTx.textContent = String(data.tx_scanned);
      mTok.textContent = String(data.active_tokens);
      mLast.textContent = data.last_activity || "—";
      mEarly.textContent = typeof data.early_entry_pct === "number" ? `${data.early_entry_pct}%` : "—";

      dna.textContent = data.dna || "—";
      pat.textContent = data.patterns || "—";

      if (isPremium && data.premium) {
        bPremium.hidden = false;
        premium.hidden = false;
        pInsider.textContent = data.premium.insider_cluster_confidence || "—";
        pSniper.textContent = data.premium.sniper_probability || "—";
        pExit.textContent = data.premium.exit_discipline || "—";
        pTags.textContent = data.premium.alpha_tags || "—";
      } else {
        bPremium.hidden = true;
        premium.hidden = true;
      }

      // Tokens
      if (Array.isArray(data.tokens)) {
        data.tokens.slice(0, 9).forEach(t => {
          const div = document.createElement("div");
          div.className = "tok";
          const sym = t.symbol || "TOKEN";
          div.innerHTML = `
            <div class="tok__top">
              <div>
                <div class="tok__sym">${sym}</div>
                <div class="tok__mint">${t.mint || ""}</div>
              </div>
              <div class="tag tag--neutral">${t.dex || "solana"}</div>
            </div>

            <div class="tok__meta">
              <div class="kv"><div class="k">Liquidity</div><div class="v">${t.liquidity_usd ?? "—"}</div></div>
              <div class="kv"><div class="k">FDV</div><div class="v">${t.fdv_usd ?? "—"}</div></div>
              <div class="kv"><div class="k">24h vol</div><div class="v">${t.volume24h_usd ?? "—"}</div></div>
              <div class="kv"><div class="k">Change</div><div class="v">${t.price_change_24h ?? "—"}</div></div>
            </div>
          `;
          tokenGrid.appendChild(div);
        });
      }

      // Copy report
      const report = buildReport(data, wallet, isPremium);
      copyBtn.disabled = false;
      copyBtn.onclick = async () => {
        const ok = await copyText(report);
        copyBtn.textContent = ok ? "Copied!" : "Copy failed";
        setTimeout(() => (copyBtn.textContent = "Copy Report"), 1100);
      };

      addFeed(`Profile generated for ${shortAddr(wallet)} — score ${data.score}/100 (${data.style})`, "scan");
      logAgent(`job complete → score=${data.score} conf=${data.confidence}%`);
      tline("scan complete. profile generated.");

      result.hidden = false;
    } catch (e) {
      console.error(e);
      addFeed(`Scan failed: ${(e && e.message) ? e.message : "unknown error"}`, "error");
      logAgent(`error → ${e && e.message ? e.message : "unknown"}`);
      tline("error: " + (e && e.message ? e.message : "scan failed"));
      alert("Scan failed.\n\nMost common reason: HELIUS_API_KEY not set in Vercel.\nOpen 'Open Setup Guide' button for steps.");
    } finally {
      scanBtn.disabled = false;
    }
  }

  function buildReport(data, wallet, premium) {
    const lines = [];
    lines.push("ClawSignal AI — Wallet Profile");
    lines.push("--------------------------------");
    lines.push("Wallet: " + wallet);
    lines.push("Smart Money Score: " + data.score + "/100 (conf " + data.confidence + "%)");
    lines.push("Style: " + data.style);
    lines.push("Risk: " + data.risk);
    lines.push("Tempo: " + data.tempo);
    lines.push("Tx scanned: " + data.tx_scanned);
    lines.push("Active tokens: " + data.active_tokens);
    lines.push("Last activity: " + (data.last_activity || "—"));
    lines.push("Early-entry %: " + (typeof data.early_entry_pct === "number" ? (data.early_entry_pct + "%") : "—"));
    lines.push("");
    lines.push("Behavior DNA: " + (data.dna || "—"));
    lines.push("Notable patterns: " + (data.patterns || "—"));
    lines.push("");
    if (premium && data.premium) {
      lines.push("[Premium]");
      lines.push("Insider cluster confidence: " + (data.premium.insider_cluster_confidence || "—"));
      lines.push("Sniper probability: " + (data.premium.sniper_probability || "—"));
      lines.push("Exit discipline: " + (data.premium.exit_discipline || "—"));
      lines.push("Alpha tags: " + (data.premium.alpha_tags || "—"));
    } else {
      lines.push("(Premium locked — enable $CLAW demo gate to reveal extra signals)");
    }
    return lines.join("\n");
  }

  // ---------------- Export JSON ----------------
  exportJsonBtn.addEventListener("click", async () => {
    if (!lastScanJson) return;
    const blob = new Blob([JSON.stringify(lastScanJson, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "clawsignal-scan.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // ---------------- Share link ----------------
  copyLinkBtn.addEventListener("click", async () => {
    const url = new URL(window.location.href);
    const w = (walletInput.value || "").trim();
    if (w) url.searchParams.set("wallet", w);
    const ok = await copyText(url.toString());
    copyLinkBtn.textContent = ok ? "Copied!" : "Copy failed";
    setTimeout(() => (copyLinkBtn.textContent = "Copy Share Link"), 1100);
  });

  // ---------------- Example wallet ----------------
  exampleBtn.addEventListener("click", () => {
    // Example address placeholder (user should replace with a real wallet)
    walletInput.value = "7YwYvCjT8fL5J2yRrj7Xgk7b1Q2WgQk3xq3R7qf3S8yA";
    addFeed("Loaded example wallet (replace with a real one).", "ui");
  });

  // ---------------- Setup modal ----------------
  openGuideBtn.addEventListener("click", () => guideModal.showModal());
  closeGuideBtn.addEventListener("click", () => guideModal.close());

  // ---------------- Gate buttons ----------------
  gateUnlockBtn.addEventListener("click", () => {
    if (!gateCheck.checked) {
      alert("Demo: tick “I hold $CLAW” first.");
      return;
    }
    setGate(true);
    addFeed("Premium unlocked (demo).", "token");
    logAgent("premium: unlocked (demo)");
  });
  gateResetBtn.addEventListener("click", () => {
    gateCheck.checked = false;
    setGate(false);
    addFeed("Premium reset.", "token");
    logAgent("premium: reset");
  });

  // hydrate gate
  setGate(getGate());
  gateCheck.checked = getGate();

  // modes
  setMode(true);
  modeAuto.addEventListener("click", () => setMode(true));
  modeManual.addEventListener("click", () => setMode(false));

  // scan
  scanBtn.addEventListener("click", runScan);

  // deep link: ?wallet=...
  const url = new URL(window.location.href);
  const deep = url.searchParams.get("wallet");
  if (deep) {
    walletInput.value = deep;
    addFeed("Loaded wallet from share link.", "ui");
  }

  // ---------------- Radar canvas ----------------
  const canvas = $("#radar");
  const ctx = canvas.getContext("2d");

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  function color(type){
    if (type === "insider") return "rgba(255,23,68,0.95)";
    if (type === "sniper") return "rgba(0,255,136,0.92)";
    if (type === "whale") return "rgba(108,99,255,0.92)";
    return "rgba(255,255,255,0.75)";
  }

  let nodes = [];
  let links = [];

  function makeGraph(premiumOn){
    const w = canvas.width;
    const h = canvas.height;

    const core = [
      { type:"insider", x:w*0.35, y:h*0.40, r:8 },
      { type:"sniper", x:w*0.58, y:h*0.45, r:8 },
      { type:"whale",  x:w*0.50, y:h*0.65, r:8 }
    ];

    const extraCount = premiumOn ? 26 : 16;
    const extras = [];
    for (let i=0;i<extraCount;i++){
      extras.push({
        type: pick(["insider","sniper","whale","neutral"]),
        x: rand(44, w-44),
        y: rand(44, h-44),
        r: rand(3.5, 5.8)
      });
    }

    nodes = core.concat(extras).map((n, i) => ({
      id:i, type:n.type, x:n.x, y:n.y, r:n.r,
      vx: rand(-0.6, 0.6), vy: rand(-0.6, 0.6),
      pulse: rand(0, Math.PI*2)
    }));

    const maxLinks = premiumOn ? 36 : 24;
    links = [];
    for (let i=0;i<maxLinks;i++){
      const a = Math.floor(rand(0, nodes.length));
      const b = Math.floor(rand(0, nodes.length));
      if (a !== b) links.push([a,b]);
    }

    $("#rsClusters").textContent = premiumOn ? "5" : "3";
    $("#rsLinks").textContent = String(links.length);
    $("#rsSignals").textContent = premiumOn ? "12" : "7";
  }

  function step(){
    const w = canvas.width;
    const h = canvas.height;

    // update
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 26 || n.x > w-26) n.vx *= -1;
      if (n.y < 26 || n.y > h-26) n.vy *= -1;
      n.vx += rand(-0.03, 0.03);
      n.vy += rand(-0.03, 0.03);
      n.vx = Math.max(-0.85, Math.min(0.85, n.vx));
      n.vy = Math.max(-0.85, Math.min(0.85, n.vy));
      n.pulse += 0.06;
    });

    // draw
    ctx.clearRect(0,0,w,h);

    // rings
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    const rings = 5;
    for (let i=1;i<=rings;i++){
      const r = (Math.min(w,h)*0.44) * (i/rings);
      ctx.beginPath();
      ctx.arc(w*0.5, h*0.54, r, 0, Math.PI*2);
      ctx.stroke();
    }
    // cross
    ctx.beginPath();
    ctx.moveTo(w*0.5, h*0.10); ctx.lineTo(w*0.5, h*0.96);
    ctx.moveTo(w*0.10, h*0.54); ctx.lineTo(w*0.96, h*0.54);
    ctx.stroke();

    // links
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    links.forEach(([a,b]) => {
      const A = nodes[a], B = nodes[b];
      if (!A || !B) return;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    });

    // nodes
    nodes.forEach(n => {
      const glow = color(n.type);
      const pulseR = n.r + (Math.sin(n.pulse)+1)*0.9;

      // pulse halo
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR+8, 0, Math.PI*2);
      ctx.fillStyle = glow.replace("0.92", "0.08").replace("0.95", "0.09").replace("0.75", "0.06");
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = glow;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(step);
  }

  makeGraph(getGate());
  step();

  // refresh graph when gate toggles
  const gateObserver = setInterval(() => {
    // cheap sync — if changed, rebuild
    const on = getGate();
    if (window.__lastGate !== on){
      window.__lastGate = on;
      makeGraph(on);
    }
  }, 500);

})();