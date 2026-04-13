import { supabase } from '../supabase.js';
import { toast } from '../components/toast.js';

export async function initAuth() {
  const form = document.getElementById('loginForm');
  const btn = document.getElementById('loginBtn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Check if already logged in
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.location.href = 'admin/dashboard.html';
      return;
    }
  } catch (err) {
    console.error("Auth check failed", err);
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="margin-right: 8px;"></span> Signing In...';
    btn.disabled = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      toast.success('Login successful. Redirecting...');
      
      // Delay slightly for effect before redirecting
      setTimeout(() => {
        window.location.href = 'admin/dashboard.html';
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Invalid login credentials.');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}
