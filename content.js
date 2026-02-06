
(function () {
    console.log("Donate Roundup extension loaded");
    if (window.__donateRoundupInjected) return;
    window.__donateRoundupInjected = true;

  function tryGetAmount() {
    const text = document.body.innerText;

    const match = text.match(/₹\s?([0-9,]+(\.[0-9]{1,2})?)/);


    if (!match) return null;

    return parseFloat(match[1].replace(/,/g, ""));
  }

  function createPopup(amount) {
    const rounded = Math.ceil(amount / 10) * 10;
    const extra = (rounded - amount).toFixed(2);

    if (rounded === amount) return;

    const box = document.createElement("div");

    box.style.position = "fixed";
    box.style.bottom = "20px";
    box.style.right = "20px";
    box.style.zIndex = "999999";
    box.style.background = "#ffffff";
    box.style.border = "1px solid #ddd";
    box.style.borderRadius = "8px";
    box.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
    box.style.padding = "14px";
    box.style.fontFamily = "system-ui";
    box.style.width = "260px";

    box.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px;">
        Round-off & donate?
      </div>
      <div style="font-size:13px;margin-bottom:10px;">
        Round ₹${amount.toFixed(2)} to ₹${rounded}
        <br/>
        Donate extra ₹${extra}
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="donateNo" style="padding:6px 10px;">No</button>
        <button id="donateYes" style="padding:6px 10px;background:#16a34a;color:white;border:none;border-radius:4px;">
          Yes
        </button>
      </div>
    `;

    document.body.appendChild(box);

    box.querySelector("#donateNo").onclick = () => {
      box.remove();
    };

    box.querySelector("#donateYes").onclick = async () => {
  try {
    await fetch("http://localhost:4000/roundup-donation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Number(extra),
        source: window.location.hostname
      })
    });
  } catch (e) {
    console.error("Failed to send round-up donation", e);
  }

  box.remove();
};

  }

  function run() {
    const amount = tryGetAmount();

    if (!amount || isNaN(amount)) return;

    createPopup(amount);
  }

  let tries = 0;

const timer = setInterval(() => {
  tries++;

  const amount = tryGetAmount();

  console.log("Trying to detect amount...", amount);

  if (amount && !isNaN(amount)) {
    createPopup(amount);
    clearInterval(timer);
  }

  if (tries > 20) {
    console.log("Stopping search for amount");
    clearInterval(timer);
  }
}, 2000);

})();
