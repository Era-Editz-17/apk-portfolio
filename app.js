const cryptoTipBtn = document.getElementById('cryptoTipBtn');
const cryptoModal = document.getElementById('cryptoModal');

if (cryptoTipBtn && cryptoModal) {
  cryptoTipBtn.addEventListener('click', () => {
    cryptoModal.classList.toggle('hidden');
  });
}

function copyAddress(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.innerText.trim();
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied ${id.replace('Address', '').toUpperCase()} address to clipboard!`);
  }).catch(() => {
    showToast('Failed to copy. Please copy manually.');
  });
}

document.querySelectorAll('.download-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const appName = btn.getAttribute('data-app') || 'APK';
    const href = btn.getAttribute('href');
    
    if (href === '#' || href === '') {
      e.preventDefault();
      showToast(`To enable direct download, link this button to your .apk file in index.html!`);
    } else {
      showToast(`Starting download: ${appName}...`);
    }
  });
});

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
