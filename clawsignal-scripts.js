// ClawSignal AI — All-in demo (no external APIs)
// Features: scan animation, score reveal, token gate (demo), radar canvas animation, live feed auto-scroll + new items, copy report.

(function () {
  const $ = (sel) => document.querySelector(sel);

  const scanBtn = $("#scanBtn");
  const copyBtn = $("#copyBtn");
  const walletInput = $("#walletInput");
  const terminal = $("#terminal");
  const resultCard = $("#resultCard");

  const resultAddr = $("#resultAddr");
  const scoreValue = $("#scoreValue");
  const riskChip = $("#riskChip");
  const styleChip = $("#styleChip");
  const timingChip = $("#timingChip");
  const dnaText = $("#dnaText");
  const patternText = $("#patternText");

  const premiumBlock = $("#premiumBlock");
  const insiderConf = $("#insiderConf");
  const sniperProb = $("#sniperProb");
  const exitScore = $("#exitScore");
  const alphaTags = $("#alphaTags");

  const iHoldToken = $("#iHoldToken");
  const unlockBtn = $("#unlockBtn");
  const gateStatus = $("#gateStatus");

  const autoBtn = $("#autoBtn");
  const manualBtn = $("#manualBtn");

  // ------- Token gate (demo) -------
  const gateKey = "clawsignal_premium_unlocked";
  function setGate(on) {
    const unlocked = !!on;
    localStorage.setItem(gateKey, unlocked ? "1" : "0");
    gateStatus.textContent = unlocked ? "UNLOCKED" : "LOCKED";
    gateStatus.classList.toggle("is-on", unlocked);
    premiumBlock.hidden = !unlocked;
    // Radar will add extra nodes when unlocked
    window.__CLAW_PREMIUM__ = unlocked;
  }
  function getGate() {
    return localStorage.getItem(gateKey) === "1";
  }

  // ------- Mode toggle UI -------
  function setMode(isAuto) {
    autoBtn.classList.toggle("is-active", isAuto);
    manualBtn.classList.toggle("is-active", !isAuto);
  }

  // ------- Helpers -------
  function safeTrim(s) {
    return (s || "").trim();
  }
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function formatScore(n) {
    return String(Math.round(n));
  }

  // ------- Terminal animation -------
  const scanSteps = [
    "Initializing agent runtime…",
    "Reading on-chain history…",
    "Clustering counterparties…",
    "Detecting entry timing…",
    "Computing smart money score…",
    "Generating profile…",
  ];

  function setTerminalLines(lines) {
    terminal.innerHTML = "";
    lines.forEach((line) => {
      const div = document.createElement("div");
      div.className = "terminal-line";
      div.textContent = "$ " + line;
      terminal.appendChild(div);
    });
  }

  function addTerminalLine(line) {
    const div = document.createElement("div");
    div.className = "terminal-line";
    div.textContent = "$ " + line;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
  }

  // ------- Result generation (demo logic) -------
  function analyzeWallet(addr) {
    // Simple heuristics for fun:
    const lower = addr.toLowerCase();
    let style = "Holder";
    if (lower.includes("sniper") || lower.includes("snipe")) style = "Sniper";
    if (lower.includes("whale")) style = "Whale";
    if (lower.includes("insider") || lower.includes("alpha")) style = "Insider";

    const scoreBase = style === "Insider" ? rand(82, 95) :
                      style === "Sniper" ? rand(70, 90) :
                      style === "Whale"  ? rand(65, 88) : rand(45, 80);

    const risk = scoreBase >= 80 ? "LOW" : scoreBase >= 65 ? "MED" : "HIGH";
    const timing = scoreBase >= 78 ? "EARLY" : scoreBase >= 60 ? "MID" : "LATE";

    const dna = [
      "Fast swaps + high conviction entries",
      "Partial sells with disciplined exits",
      "Rotates across meme + majors",
      "Watches liquidity spikes before entry",
      "Uses small probing buys → then size in",
    ];

    const patterns = [
      "Repeated early entries on new pairs",
      "Cluster overlap with known smart wallets",
      "Funding trail suggests coordinated activity",
      "Avoids chasing tops; prefers rebounds",
      "Exits in tranches after volume fades",
    ];

    const premium = {
      insiderConf: Math.round(rand(55, 95)) + "%",
      sniperProb: Math.round(rand(40, 92)) + "%",
      exitScore: Math.round(rand(50, 95)) + "/100",
      alphaTags: ["early-entry", "cluster", "momentum", "liquidity-watch"].slice(0, Math.floor(rand(2,4))).join(", ")
    };

    return {
      style,
      score: Math.round(scoreBase),
      risk,
      timing,
      dna: pick(dna),
      patterns: pick(patterns),
      premium
    };
  }

  function buildReport(addr, data, isPremium) {
    let out = "";
    out += "ClawSignal AI — Wallet Profile\n";
    out += "--------------------------------\n";
    out += "Wallet: " + addr + "\n";
    out += "Smart Money Score: " + data.score + "/100\n";
    out += "Risk: " + data.risk + "\n";
    out += "Style: " + data.style + "\n";
    out += "Timing: " + data.timing + "\n\n";
    out += "Behavior DNA: " + data.dna + "\n";
    out += "Notable Pattern: " + data.patterns + "\n\n";
    if (isPremium) {
      out += "[Premium Signals]\n";
      out += "Insider Cluster Confidence: " + data.premium.insiderConf + "\n";
      out += "Sniper Probability: " + data.premium.sniperProb + "\n";
      out += "Exit Discipline: " + data.premium.exitScore + "\n";
      out += "Alpha Tags: " + data.premium.alphaTags + "\n";
    } else {
      out += "(Premium locked — hold $CLAW to reveal extra signals)\n";
    }
    return out;
  }

  // ------- Copy -------
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ------- Scan click -------
  async function runScan() {
    const addr = safeTrim(walletInput.value);
    if (!addr) {
      alert("Enter a wallet address first.");
      walletInput.focus();
      return;
    }

    const isPremium = getGate();

    scanBtn.disabled = true;
    copyBtn.disabled = true;
    resultCard.hidden = true;

    setTerminalLines(["Starting scan…"]);
    let stepIndex = 0;

    const interval = setInterval(() => {
      addTerminalLine(scanSteps[stepIndex]);
      stepIndex++;
      if (stepIndex >= scanSteps.length) {
        clearInterval(interval);
      }
    }, 420);

    // total scan time
    const scanMs = 2600 + Math.floor(rand(0, 650));
    await new Promise((r) => setTimeout(r, scanMs));

    const data = analyzeWallet(addr);

    // update UI
    resultAddr.textContent = addr;
    scoreValue.textContent = formatScore(data.score);

    riskChip.textContent = "Risk: " + data.risk;
    styleChip.textContent = "Style: " + data.style;
    timingChip.textContent = "Timing: " + data.timing;

    dnaText.textContent = data.dna;
    patternText.textContent = data.patterns;

    // premium section
    if (isPremium) {
      insiderConf.textContent = data.premium.insiderConf;
      sniperProb.textContent = data.premium.sniperProb;
      exitScore.textContent = data.premium.exitScore;
      alphaTags.textContent = data.premium.alphaTags;
    }
    premiumBlock.hidden = !isPremium;

    resultCard.hidden = false;
    scanBtn.disabled = false;

    // enable copy
    const report = buildReport(addr, data, isPremium);
    copyBtn.disabled = false;
    copyBtn.onclick = async () => {
      const ok = await copyText(report);
      copyBtn.textContent = ok ? "Copied!" : "Copy failed";
      setTimeout(() => (copyBtn.textContent = "Copy Report"), 1200);
    };

    // add terminal done line
    addTerminalLine("Scan complete. Profile generated.");
    // push to feed
    pushFeedEvent(`Profile generated for ${shortAddr(addr)} — score ${data.score}/100 (${data.style})`);
  }

  // ------- Live feed -------
  const feed = $("#feed");
  const feedInner = document.createElement("div");
  feedInner.className = "feed-inner";
  feed.appendChild(feedInner);

  const baseEvents = [
    () => `Wallet ${randWallet()} entered $PEPE at launch (early buy cluster)`,
    () => `Sniper wallet ${randWallet()} hit 2.8× on $BONK in 9m`,
    () => `Whale ${randWallet()} exited with discipline (3 partial sells)`,
    () => `Cluster detected: ${rand(3, 9).toFixed(0)} related wallets funding same deployer`,
    () => `Liquidity spike spotted → smart entries increased +${rand(12, 48).toFixed(0)}%`,
    () => `New meme pair created → early swap activity rising`,
    () => `Agent ping: elevated smart money inflow on SOL memes`,
  ];

  function nowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function pushFeedEvent(text, badge) {
    const item = document.createElement("div");
    item.className = "feed-item";

    const top = document.createElement("div");
    top.textContent = text;

    const meta = document.createElement("div");
    meta.className = "feed-meta";
    meta.innerHTML = `<span>${badge || "AI signal"}</span><span>${nowTime()}</span>`;

    item.appendChild(top);
    item.appendChild(meta);

    // prepend newest
    feedInner.insertBefore(item, feedInner.firstChild);

    // limit
    while (feedInner.children.length > 12) {
      feedInner.removeChild(feedInner.lastChild);
    }
  }

  function randWallet() {
    const hex = "abcdef0123456789";
    let out = "0x";
    for (let i = 0; i < 8; i++) out += hex[Math.floor(Math.random() * hex.length)];
    return out;
  }
  function shortAddr(a) {
    const s = String(a);
    if (s.length <= 14) return s;
    return s.slice(0, 6) + "…" + s.slice(-5);
  }

  // auto-add events
  setInterval(() => {
    const txt = pick(baseEvents)();
    pushFeedEvent(txt);
  }, 2200);

  // ------- Radar canvas -------
  const canvas = $("#radarCanvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvasForHiDPI() {
    const ratio = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.floor(cssW * ratio);
    canvas.height = Math.floor(cssH * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  let nodes = [];
  let links = [];

  function makeNodes(premium) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const core = [
      { type: "insider", x: w * 0.35, y: h * 0.38 },
      { type: "sniper", x: w * 0.58, y: h * 0.42 },
      { type: "whale", x: w * 0.48, y: h * 0.62 },
    ];

    const extra = [];
    const extraCount = premium ? 18 : 10;
    for (let i = 0; i < extraCount; i++) {
      const t = pick(["insider", "sniper", "whale"]);
      extra.push({
        type: t,
        x: rand(40, w - 40),
        y: rand(40, h - 40),
      });
    }

    const all = core.concat(extra).map((n, idx) => ({
      id: idx,
      type: n.type,
      x: n.x,
      y: n.y,
      vx: rand(-0.25, 0.25),
      vy: rand(-0.25, 0.25),
      r: idx < 3 ? 7 : rand(3.5, 5.5),
      pulse: rand(0, Math.PI * 2),
    }));

    // links
    const L = [];
    const maxLinks = premium ? 34 : 22;
    for (let i = 0; i < maxLinks; i++) {
      const a = Math.floor(rand(0, all.length));
      const b = Math.floor(rand(0, all.length));
      if (a !== b) L.push([a, b]);
    }

    nodes = all;
    links = L;

    // stats
    $("#clustersCount").textContent = premium ? "5" : "3";
    $("#linksCount").textContent = String(links.length);
    $("#signalsCount").textContent = premium ? "12" : "7";
  }

  function colorForType(t) {
    if (t === "insider") return "rgba(255,23,68,0.95)";
    if (t === "sniper") return "rgba(0,255,136,0.9)";
    return "rgba(90,120,255,0.9)";
  }
  function lineColor() {
    return "rgba(255,255,255,0.08)";
  }

  function drawRadar() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // background grid rings
    ctx.clearRect(0, 0, w, h);

    // soft glow center
    const grd = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, Math.max(w, h));
    grd.addColorStop(0, "rgba(255,23,68,0.06)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // rings
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    const rings = 5;
    for (let i = 1; i <= rings; i++) {
      const r = (Math.min(w, h) * 0.45) * (i / rings);
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.55, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // cross lines
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.1);
    ctx.lineTo(w * 0.5, h * 0.98);
    ctx.moveTo(w * 0.1, h * 0.55);
    ctx.lineTo(w * 0.98, h * 0.55);
    ctx.stroke();

    // links
    ctx.strokeStyle = lineColor();
    ctx.lineWidth = 1;
    links.forEach(([a, b]) => {
      const A = nodes[a], B = nodes[b];
      if (!A || !B) return;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    });

    // nodes
    nodes.forEach((n) => {
      n.pulse += 0.05;

      // outer pulse
      const pulseR = n.r + (Math.sin(n.pulse) + 1) * 0.9;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR + 6, 0, Math.PI * 2);
      ctx.fillStyle = colorForType(n.type).replace("0.9", "0.08").replace("0.95", "0.09");
      ctx.fill();

      // core dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = colorForType(n.type);
      ctx.fill();

      // glow
      ctx.shadowColor = colorForType(n.type);
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function tickPhysics() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;

      // bounds
      if (n.x < 24 || n.x > w - 24) n.vx *= -1;
      if (n.y < 24 || n.y > h - 24) n.vy *= -1;

      // mild drift
      n.vx += rand(-0.02, 0.02);
      n.vy += rand(-0.02, 0.02);
      n.vx = Math.max(-0.6, Math.min(0.6, n.vx));
      n.vy = Math.max(-0.6, Math.min(0.6, n.vy));
    });
  }

  function animate() {
    tickPhysics();
    drawRadar();
    requestAnimationFrame(animate);
  }

  // ------- Wire events -------
  document.addEventListener("DOMContentLoaded", () => {
    // hydrate gate
    setGate(getGate());
    iHoldToken.checked = getGate();

    unlockBtn.addEventListener("click", () => {
      if (!iHoldToken.checked) {
        alert("Demo: tick “I hold $CLAW” to unlock premium.");
        return;
      }
      setGate(true);
      pushFeedEvent("Premium unlocked — insider signals enabled", "token gate");
      makeNodes(true);
    });

    iHoldToken.addEventListener("change", () => {
      if (!iHoldToken.checked) setGate(false);
    });

    autoBtn.addEventListener("click", () => setMode(true));
    manualBtn.addEventListener("click", () => setMode(false));

    scanBtn.addEventListener("click", runScan);

    // initial feed items
    for (let i = 0; i < 6; i++) pushFeedEvent(pick(baseEvents)(), "AI signal");

    // canvas
    resizeCanvasForHiDPI();
    makeNodes(getGate());
    animate();
    window.addEventListener("resize", () => {
      resizeCanvasForHiDPI();
      makeNodes(getGate());
    });
  });

})();