import { supabase } from '../supabase.js';
import { formatDate, getStatusBadge } from '../utils/helpers.js';

export function initTracking() {
  const form = document.getElementById('trackForm');
  const input = document.getElementById('trackingCodeInput');
  const btn = document.getElementById('trackSubmitBtn');

  // UI States
  const uiEmpty = document.getElementById('trackEmpty');
  const uiLoading = document.getElementById('trackLoading');
  const uiError = document.getElementById('trackError');
  const uiResult = document.getElementById('trackResult');

  if (!form) return;

  // Check URL for tracking code
  const urlParams = new URLSearchParams(window.location.search);
  const codeFromUrl = urlParams.get('code');
  if (codeFromUrl) {
    input.value = codeFromUrl;
    fetchShipment(codeFromUrl);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim();
    if (code) {
      // Update URL without reload
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('code', code);
      window.history.pushState({}, '', newUrl);
      
      fetchShipment(code);
    }
  });

  async function fetchShipment(code) {
    showUi('loading');
    
    // Simulate slight delay for effect
    btn.disabled = true;
    
    try {
      const { data: shipment, error } = await supabase
        .from('shipments')
        .select('*, shipment_history(*)')
        .eq('tracking_code', code)
        .single();
        
      if (error || !shipment) {
        throw new Error('Not found');
      }

      renderShipment(shipment);
      showUi('result');
      
    } catch (err) {
      console.error(err);
      showUi('error');
    } finally {
      btn.disabled = false;
    }
  }

  function renderShipment(shipment) {
    // Top Info
    document.getElementById('resCode').textContent = shipment.tracking_code;
    document.getElementById('resBadgeWrapper').innerHTML = getStatusBadge(shipment.status);
    document.getElementById('resOrigin').textContent = shipment.origin || 'N/A';
    document.getElementById('resDest').textContent = shipment.destination || 'N/A';
    
    const estDate = shipment.estimated_delivery 
      ? new Date(shipment.estimated_delivery).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
      : 'Pending';
    document.getElementById('resEst').textContent = estDate;

    // Sender / Receiver
    document.getElementById('resSenderName').textContent = shipment.sender_name || 'N/A';
    document.getElementById('resSenderAddress').textContent = shipment.sender_address || 'N/A';
    document.getElementById('resReceiverName').textContent = shipment.receiver_name || 'N/A';
    document.getElementById('resReceiverAddress').textContent = shipment.receiver_address || 'N/A';

    // Package Details
    document.getElementById('resType').textContent = shipment.package_type || 'N/A';
    document.getElementById('resWeight').textContent = shipment.weight || 'N/A';
    document.getElementById('resMethod').textContent = shipment.shipping_method || 'N/A';
    document.getElementById('resDimensions').textContent = shipment.dimensions || 'N/A';

    // Timeline
    const timelineContainer = document.getElementById('resTimeline');
    
    // Sort history latest first
    const history = (shipment.shipment_history || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (history.length === 0) {
      timelineContainer.innerHTML = '<p class="text-muted">No timeline data available yet.</p>';
      return;
    }

    timelineContainer.innerHTML = history.map((item, idx) => {
      const isLatest = idx === 0;
      return `
        <div class="timeline-item ${isLatest ? 'active' : ''}">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-date">
              <i data-lucide="clock" style="width: 14px;"></i> 
              ${formatDate(item.created_at)}
            </div>
            <div class="timeline-status">${item.status.replace(/_/g, ' ').toUpperCase()}</div>
            ${item.location ? `<div class="timeline-location"><i data-lucide="map-pin" style="width: 14px;"></i> ${item.location}</div>` : ''}
            ${item.description ? `<p class="mt-2 text-sm">${item.description}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Re-init generic icons inside the generated HTML
    if (window.lucide) {
      window.lucide.createIcons({ root: timelineContainer });
    }
  }

  function showUi(state) {
    uiEmpty.classList.add('d-none');
    uiLoading.classList.add('d-none');
    uiError.classList.add('d-none');
    uiResult.classList.add('d-none');

    if (state === 'empty') uiEmpty.classList.remove('d-none');
    if (state === 'loading') uiLoading.classList.remove('d-none');
    if (state === 'error') uiError.classList.remove('d-none');
    if (state === 'result') uiResult.classList.remove('d-none');
  }
}
