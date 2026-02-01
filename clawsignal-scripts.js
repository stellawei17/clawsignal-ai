// ClawSignal AI UI Interactions

document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.querySelector(".control-panel .toggles button");
  const terminal = document.querySelector(".terminal");
  const walletInput = document.querySelector(".control-panel input");

  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      if (!walletInput.value.trim()) {
        alert("Enter a wallet address first.");
        return;
      }

      scanBtn.textContent = "Scanning...";
      terminal.innerHTML = `
        <p>> Initializing AI wallet scan...</p>
        <p>> Reading on-chain activity...</p>
        <p>> Detecting trading patterns...</p>
      `;

      setTimeout(() => {
        terminal.innerHTML += `<p>> Smart Money Score: <strong>87 / 100</strong></p>`;
      }, 1500);

      setTimeout(() => {
        terminal.innerHTML += `<p>> Status: <span style="color:#00ff88">High-quality wallet detected</span></p>`;
        scanBtn.textContent = "Scan Complete";
      }, 3000);
    });
  }

  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      btn.style.boxShadow = "0 0 15px #ff1744";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.boxShadow = "none";
    });
  });

  const metrics = document.querySelectorAll(".live-card p");
  metrics.forEach(metric => {
    metric.style.opacity = 0;
    setTimeout(() => {
      metric.style.transition = "opacity 1s ease";
      metric.style.opacity = 1;
    }, 500);
  });
});
