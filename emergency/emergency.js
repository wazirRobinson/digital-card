const copyMsgBtn = document.getElementById("copyMsgBtn");
const getLocBtn = document.getElementById("getLocBtn");
const statusMsg = document.getElementById("statusMsg");
const updatedAt = document.getElementById("updatedAt");
const form = document.getElementById("checkinForm");
const safeBtn = document.getElementById("safeBtn");

const latEl = document.getElementById("lat");
const lngEl = document.getElementById("lng");
const accEl = document.getElementById("acc");

// ✅ Make sure you also added this hidden input in index.html:
// <input type="hidden" name="map_link" id="map_link" />
const mapLinkEl = document.getElementById("map_link");

updatedAt.textContent = new Date().toLocaleDateString();

/** LOST & FOUND: Copy a helpful message template (optional) */
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

/** LOCATION: one-time snapshot (user must tap button + allow permission) */
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

      // Build a map link so family can tap it (no copy/paste needed)
      const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      if (mapLinkEl) mapLinkEl.value = mapUrl;

      statusMsg.textContent = "📍 Location added.";
    },
    (err) => {
      // More helpful error messaging
      const map = {
        1: "Location permission denied. Enable it in browser/site settings.",
        2: "Location unavailable. Try moving outdoors or turning on Location Services.",
        3: "Location timed out. Try again.",
      };
      statusMsg.textContent = `⚠️ ${map[err.code] || "Location permission denied or unavailable."}`;
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
});

/**
 * CHECK-IN via SMS Draft (Option A)
 * - Opens a pre-filled SMS so you can tap Send
 * - Works without email services
 */
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  // Recipient: Wife (change if needed)
  const to = "+15033813638";

  // Since this card is only for you:
  const person = "Wazir Robinson";
  const status = "I’m safe";

  // Optional note field (if present)
  const note = (form.querySelector('input[name="note"]')?.value || "").trim();

  // Location fields (only present if you tapped "Add Location")
  const lat = latEl?.value || "";
  const lng = lngEl?.value || "";
  const acc = accEl?.value || "";
  const mapLink =
    (mapLinkEl?.value || "").trim() ||
    (lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : "");

  const lines = [
    "CHECK-IN",
    `Name: ${person}`,
    `Status: ${status}`,
    note ? `Note: ${note}` : "",
    mapLink ? `Map: ${mapLink}` : "Map: (not shared)",
    acc ? `Accuracy: ±${acc}m` : "",
    `Time: ${new Date().toLocaleString()}`,
  ].filter(Boolean);

  const smsBody = encodeURIComponent(lines.join("\n"));

  // UX: show what’s happening
  if (safeBtn) safeBtn.disabled = true;
  statusMsg.textContent = "Opening text message…";

  // Launch SMS app with prefilled message
  window.location.href = `sms:${to}?&body=${smsBody}`;

  // Re-enable button shortly (user may come back)
  setTimeout(() => {
    if (safeBtn) safeBtn.disabled = false;
    statusMsg.textContent = "✅ Text draft opened. Tap Send.";
  }, 1200);
});
