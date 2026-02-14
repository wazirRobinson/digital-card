const copyMsgBtn = document.getElementById("copyMsgBtn");
const getLocBtn = document.getElementById("getLocBtn");
const statusMsg = document.getElementById("statusMsg");
const updatedAt = document.getElementById("updatedAt");
const form = document.getElementById("checkinForm");
const safeBtn = document.getElementById("safeBtn");

const latEl = document.getElementById("lat");
const lngEl = document.getElementById("lng");
const accEl = document.getElementById("acc");

// ✅ Hidden map_link input (already in your HTML)
const mapLinkEl = document.getElementById("map_link");

// ✅ Visible map preview link
const mapPreview = document.getElementById("mapPreview");

updatedAt.textContent = new Date().toLocaleDateString();

/** Map preview helpers (CSS-driven: uses .is-visible) */
function hideMapPreview() {
  if (!mapPreview) return;
  mapPreview.classList.remove("is-visible");
  mapPreview.setAttribute("href", "#");
  // Ensure hidden even if CSS isn't loaded yet
  mapPreview.style.display = "none";
}

function showMapPreview(url) {
  if (!mapPreview) return;
  mapPreview.setAttribute("href", url);
  mapPreview.classList.add("is-visible");

  // ✅ Fallback: force flex so it shows + centers even if CSS is missing/overridden
  mapPreview.style.display = "flex";
}

// Ensure it starts hidden on load
hideMapPreview();

// ✅ HARD-OPEN handler (mobile reliable)
if (!mapPreview) {
  console.warn("mapPreview link not found. Check id='mapPreview' in /emergency/index.html");
} else {
  mapPreview.addEventListener("click", (e) => {
    const url = (mapPreview.getAttribute("href") || "").trim();
    if (!url || url === "#") return;

    e.preventDefault();
    window.open(url, "_blank", "noopener");
  });
}

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
    if (mapLinkEl) mapLinkEl.value = "";
    hideMapPreview();
    return;
  }

  statusMsg.textContent = "Requesting location…";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;

      latEl.value = String(latitude);
      lngEl.value = String(longitude);
      accEl.value = String(Math.round(accuracy));

      // ✅ Universal link format
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      if (mapLinkEl) mapLinkEl.value = mapUrl;

      // ✅ Show visible map link
      showMapPreview(mapUrl);

      statusMsg.textContent = "📍 Location added.";
    },
    (err) => {
      const map = {
        1: "Location permission denied. Enable it in browser/site settings.",
        2: "Location unavailable. Try moving outdoors or turning on Location Services.",
        3: "Location timed out. Try again.",
      };
      statusMsg.textContent = `⚠️ ${map[err.code] || "Location permission denied or unavailable."}`;

      // Clear/hide map preview + stored map link on error
      if (mapLinkEl) mapLinkEl.value = "";
      hideMapPreview();
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
  const acc = accEl?.value || "";

  const mapLink =
    (mapLinkEl?.value || "").trim() ||
    ((latEl?.value && lngEl?.value)
      ? `https://www.google.com/maps?q=${latEl.value},${lngEl.value}`
      : "");

  // Improved fallback copy when location isn’t available
  const mapLine = mapLink
    ? `Map: ${mapLink}`
    : "Map: (NOT shared — GPS unavailable/denied). Reply and I’ll send my address or nearest intersection.";

  const lines = [
    "CHECK-IN",
    `Name: ${person}`,
    `Status: ${status}`,
    note ? `Note: ${note}` : "",
    mapLine,
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
