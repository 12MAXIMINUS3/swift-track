class ToastSystem {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
      ? '<i data-lucide="check-circle" style="color: var(--color-success)"></i>'
      : '<i data-lucide="alert-circle" style="color: var(--color-danger)"></i>';

    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
    `;

    this.container.appendChild(toast);
    
    // Initialize lucid icons for the new toast if available
    if (window.lucide) {
      window.lucide.createIcons({ root: toast });
    }

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  }

  success(message) {
    this.show(message, 'success');
  }

  error(message) {
    this.show(message, 'error');
  }
}

export const toast = new ToastSystem();
