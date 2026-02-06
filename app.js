// Copy link button
const copyBtn = document.getElementById("copyLinkBtn");
copyBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy Link"), 1200);
  } catch {
    alert("Could not copy. Long-press the address bar and copy the link.");
  }
});

// Quote modal controls
const modal = document.getElementById("quoteModal");
const openBtn = document.getElementById("openQuoteBtn");
const closeBtn = document.getElementById("closeQuoteBtn");
const closeBackdrop = document.getElementById("closeQuoteBackdrop");

function openModal() {
  modal?.classList.add("isOpen");
  modal?.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal?.classList.remove("isOpen");
  modal?.setAttribute("aria-hidden", "true");
}

openBtn?.addEventListener("click", openModal);
closeBtn?.addEventListener("click", closeModal);
closeBackdrop?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Form submit UX (works with Formspree)
const form = document.getElementById("quoteForm");
const statusEl = document.getElementById("quoteStatus");
const submitBtn = document.getElementById("submitQuoteBtn");

form?.addEventListener("submit", async (e) => {
  // If you haven't replaced the Formspree URL yet, fall back to email draft
  const action = form.getAttribute("action") || "";
  if (action.includes("REPLACE_ME")) {
    e.preventDefault();
    const fd = new FormData(form);
    const body =
      `Name: ${fd.get("name")}\n` +
      `Email: ${fd.get("email")}\n` +
      `Phone: ${fd.get("phone") || ""}\n` +
      `Project type: ${fd.get("project_type")}\n` +
      `Budget: ${fd.get("budget") || ""}\n` +
      `Timeline: ${fd.get("timeline") || ""}\n\n` +
      `${fd.get("details")}\n`;

    window.location.href =
      "mailto:wr@hubspiral.com" +
      "?subject=" + encodeURIComponent("Quote Request") +
      "&body=" + encodeURIComponent(body);
    return;
  }

  // Nice async submit (no page redirect)
  e.preventDefault();
  submitBtn.disabled = true;
  statusEl.textContent = "Sending…";

  try {
    const res = await fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      form.reset();
      statusEl.textContent = "✅ Sent. I’ll reply soon.";
      setTimeout(() => {
        statusEl.textContent = "";
        closeModal();
      }, 1200);
    } else {
      statusEl.textContent = "⚠️ Something went wrong. Try Email or Text.";
    }
  } catch {
    statusEl.textContent = "⚠️ Network issue. Try Email or Text.";
  } finally {
    submitBtn.disabled = false;
  }
});
