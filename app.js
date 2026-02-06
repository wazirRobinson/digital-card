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
