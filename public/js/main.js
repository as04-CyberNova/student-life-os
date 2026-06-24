// Student Life OS - Global client side script
console.log('Student Life OS frontend initiated.');

// Add dynamic interactions (like auto-closing alerts, fade-in transitions)
document.addEventListener('DOMContentLoaded', () => {
  // Auto dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });

  // Set progress bar widths dynamically with smooth load transition
  document.querySelectorAll('.progress-bar-fill').forEach(fill => {
    const pct = fill.dataset.pct;
    if (pct !== undefined) {
      setTimeout(() => {
        fill.style.width = pct + '%';
      }, 100);
    }
  });
});
