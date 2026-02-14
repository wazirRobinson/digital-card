const copyMsgBtn = document.getElementById("copyMsgBtn");
const getLocBtn = document.getElementById("getLocBtn");
const statusMsg = document.getElementById("statusMsg");
const updatedAt = document.getElementById("updatedAt");
const form = document.getElementById("checkinForm");
const safeBtn = document.getElementById("safeBtn");

const latEl = document.getElementById("lat");
const lngEl = document.getElementById("lng");
const accEl = document.getElementById("acc");

updatedAt.textContent = new Date().toLocaleDateString();

copyMsgBtn?.addEventListener("click", async () => {
  const msg = "I found your item near ____. My name is ____. Call me at ____.";
  try {
    await navigator.clipboard.writeText(msg);
    copyMsgBtn.textContent = "Copied!";
    setTimeout(() => (copyMsgBtn.textContent = "Copy Text Template"), 1200);
  } catch {
    alert(msg);
  }
});

getLocBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    statusMsg.textContent = "Location not supported on this device.";
    return;
  }

  statusMsg.textContent = "Requesting location…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      latEl.value = String(latitude);
      lngEl.value = String(longitude);
      accEl.value = String(Math.round(accuracy));
      statusMsg.textContent = `Location added (±${Math.round(accuracy)}m).`;
    },
    () => {
      statusMsg.textContent = "Location permission denied or unavailable.";
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );
});

// Optional: AJAX submit for a nicer UX. Also provides a fallback if you haven't set Formspree yet.
form?.addEventListener("submit", async (e) => {
  const action = form.getAttribute("action") || "";
  if (action.includes("REPLACE_ME")) {
    e.preventDefault();
    statusMsg.textContent = "Form endpoint not set yet. Create Formspree and paste the URL.";
    return;
  }

  e.preventDefault();
  safeBtn.disabled = true;
  statusMsg.textContent = "Sending check-in…";

  try {
    const res = await fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      form.reset();
      latEl.value = "";
      lngEl.value = "";
      accEl.value = "";
      statusMsg.textContent = "✅ Check-in sent.";
    } else {
      statusMsg.textContent = "⚠️ Could not send. Try again or use a text/call option.";
    }
  } catch {
    statusMsg.textContent = "⚠️ Network issue. Try again when online.";
  } finally {
    safeBtn.disabled = false;
  }
});
