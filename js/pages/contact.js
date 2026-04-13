import { toast } from '../components/toast.js';

export function initContactForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // UI Loading state
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="margin-right: 8px;"></span> Sending...';
    btn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      form.reset();
      
      toast.success('Your message has been sent! We will contact you soon.');
    }, 1500);
  });
}
