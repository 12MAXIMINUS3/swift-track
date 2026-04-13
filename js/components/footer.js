export function renderFooter() {
  const footerHtml = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col" data-animate="slide-up">
            <a href="index.html" class="logo" style="color: white; margin-bottom: 1.5rem; display: inline-flex;">
              <i data-lucide="package" style="color: var(--color-accent); width: 28px; height: 28px;"></i>
              SwiftTrack
            </a>
            <p>Delivering trust and reliability across the globe. Your packages are safe with our advanced tracking and logistic solutions.</p>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <a href="#" style="color: white;"><i data-lucide="facebook"></i></a>
              <a href="#" style="color: white;"><i data-lucide="twitter"></i></a>
              <a href="#" style="color: white;"><i data-lucide="instagram"></i></a>
              <a href="#" style="color: white;"><i data-lucide="linkedin"></i></a>
            </div>
          </div>
          
          <div class="footer-col" data-animate="slide-up" class="delay-100">
            <h4>Quick Links</h4>
            <div class="footer-links">
              <a href="index.html">Home</a>
              <a href="about.html">About Us</a>
              <a href="services.html">Services</a>
              <a href="contact.html">Contact</a>
            </div>
          </div>

          <div class="footer-col" data-animate="slide-up" class="delay-200">
            <h4>Services</h4>
            <div class="footer-links">
              <a href="#">Express Delivery</a>
              <a href="#">Standard Shipping</a>
              <a href="#">Freight & Cargo</a>
              <a href="#">International</a>
            </div>
          </div>

          <div class="footer-col" data-animate="slide-up" class="delay-300">
            <h4>Contact Info</h4>
            <div class="footer-links">
              <span style="display: flex; gap: 0.5rem;"><i data-lucide="map-pin" style="width: 18px;"></i> 123 Logistics Way, NY 10001</span>
              <span style="display: flex; gap: 0.5rem;"><i data-lucide="phone" style="width: 18px;"></i> +1 (555) 123-4567</span>
              <span style="display: flex; gap: 0.5rem;"><i data-lucide="mail" style="width: 18px;"></i> support@swifttrack.com</span>
            </div>
            <div style="margin-top: 1rem;">
              <a href="admin-login.html" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Staff Login</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} SwiftTrack Logistics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;

  document.getElementById('footer-placeholder').innerHTML = footerHtml;

  // Initialize icons inside footer
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
