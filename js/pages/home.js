import { initScrollAnimations } from '../utils/animations.js';
import { supabase } from '../supabase.js';
import { getStatusBadge } from '../utils/helpers.js';
import { toast } from '../components/toast.js';

const reviewsData = [
  {
    name: "Sarah Mitchell",
    title: "Online Retailer",
    text: "SwiftTrack delivered my package across the country in just 2 days! Their integration is flawless.",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Mitchell&background=0A1628&color=fff"
  },
  {
    name: "James Rodriguez",
    title: "E-commerce Manager",
    text: "The real-time tracking feature is incredibly accurate. I always know where my packages are.",
    avatar: "https://ui-avatars.com/api/?name=James+Rodriguez&background=10B981&color=fff"
  },
  {
    name: "Emily Chen",
    title: "Supply Chain Director",
    text: "Best shipping partner we've worked with. Professional and reliable every time.",
    avatar: "https://ui-avatars.com/api/?name=Emily+Chen&background=2563EB&color=fff"
  },
  {
    name: "Michael Thompson",
    title: "Startup Founder",
    text: "Their express delivery saved our product launch. Outstanding service!",
    avatar: "https://ui-avatars.com/api/?name=Michael+Thompson&background=F59E0B&color=fff"
  },
  {
    name: "Aisha Patel",
    title: "Small Business Owner",
    text: "Customer support is responsive and helpful. They resolved my issue within minutes.",
    avatar: "https://ui-avatars.com/api/?name=Aisha+Patel&background=EF4444&color=fff"
  },
  {
    name: "David Okonkwo",
    title: "Operations Manager",
    text: "We switched to SwiftTrack last year and our shipping complaints dropped by 80%.",
    avatar: "https://ui-avatars.com/api/?name=David+Okonkwo&background=64748B&color=fff"
  },
  {
    name: "Laura Simmons",
    title: "Logistics Coordinator",
    text: "The admin dashboard makes managing hundreds of shipments effortless.",
    avatar: "https://ui-avatars.com/api/?name=Laura+Simmons&background=020617&color=fff"
  },
  {
    name: "Robert Kim",
    title: "Wholesale Distributor",
    text: "Affordable rates without compromising speed or reliability. Highly recommended!",
    avatar: "https://ui-avatars.com/api/?name=Robert+Kim&background=1E3A5F&color=fff"
  }
];

function renderReviews() {
  const container = document.querySelector('.reviews-grid');
  if (!container) return;

  reviewsData.forEach((review, index) => {
    // Generate star SVGs
    const stars = Array(5).fill('<i data-lucide="star"></i>').join('');
    
    // Calculate animation delay for a staggered effect
    const delayClass = `delay-${(index % 4) * 100}`;

    const card = document.createElement('div');
    card.className = `review-card card-hover ${delayClass}`;
    card.setAttribute('data-animate', 'fade-in');

    card.innerHTML = `
      <div class="review-stars">
        ${stars}
      </div>
      <p class="review-text">"${review.text}"</p>
      <div class="review-author">
        <img src="${review.avatar}" alt="${review.name}" class="author-avatar">
        <div class="author-info">
          <h5>${review.name}</h5>
          <span>${review.title}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const animate = (counter) => {
    const target = +counter.getAttribute('data-target');
    const suffix = counter.getAttribute('data-suffix') || '';
    const speed = 200; // lower is slower
    
    const count = +counter.innerText.replace(/\D/g, '');
    const inc = target / speed;

    if (count < target) {
      counter.innerText = Math.ceil(count + inc) + suffix;
      setTimeout(() => animate(counter), 20);
    } else {
      counter.innerText = target + suffix;
    }
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider .slide');
  let currentSlide = 0;
  
  if (!slides.length) return;

  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 5000); // Change image every 5 seconds
}

export function initHome() {
  initScrollAnimations();
  initHeroSlider();
  renderReviews();
  animateCounters();
  initHomeTracking();
}

function initHomeTracking() {
  const form = document.getElementById('heroTrackForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('heroTrackingCode').value.trim();
    if (!code) return;

    const btn = document.getElementById('heroTrackBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="margin-right:8px; width:14px; height:14px;"></span>...';
    btn.disabled = true;

    try {
      const { data: shipment, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_code', code)
        .single();
        
      if (error || !shipment) {
        toast.error('Shipment not found!');
        throw new Error('Not found');
      }

      // Update Card
      document.getElementById('homeOrigin').textContent = shipment.origin || 'N/A';
      document.getElementById('homeDest').textContent = shipment.destination || 'N/A';
      document.getElementById('homeBadgeContainer').innerHTML = getStatusBadge(shipment.status);
      
      const estDate = shipment.estimated_delivery 
        ? new Date(shipment.estimated_delivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
        : 'Pending';
        
      document.getElementById('homeEst').textContent = 'Est: ' + estDate;
      toast.success('Live tracking updated!');

    } catch (err) {
      console.error(err);
      // Reset card to blank state or error state if needed
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}
