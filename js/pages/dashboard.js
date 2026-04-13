import { supabase } from '../../js/supabase.js';
import { toast } from '../../js/components/toast.js';
import { formatDate, getStatusBadge, generateTrackingCode } from '../../js/utils/helpers.js';

// --- State & Auth ---
let currentUser = null;
let currentShipments = [];

async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.location.href = '../admin-login.html';
    return null;
  }
  return session.user;
}

// --- Initialization ---
export const Auth = checkAuth().then(user => {
  if (!user) return;
  currentUser = user;
  
  // Init UI features
  initSidebar();
  initLogout();
  
  // Load initial data
  loadDashboardData();
  
  // Setup forms
  initCreateForm();
  initUpdateStatusModal();
  
  // Setup filters
  document.getElementById('searchShipmentInput').addEventListener('input', renderAllShipmentsTable);
  document.getElementById('filterStatus').addEventListener('change', renderAllShipmentsTable);
  
  if (window.lucide) window.lucide.createIcons();
});

// --- UI Navigation ---
function initSidebar() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const views = document.querySelectorAll('.view-section');
  const mobileToggle = document.getElementById('mobileSidebarToggle');
  const sidebar = document.getElementById('sidebar');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      
      // Update Active Nav
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update View
      views.forEach(view => {
        if (view.id === `view${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
      
      // Load specific data if needed
      if (targetTab === 'shipments') {
        renderAllShipmentsTable();
      } else if (targetTab === 'overview') {
        loadDashboardData();
      }
      
      // Close mobile menu on select
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
      }
    });
  });

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }
}

function initLogout() {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '../admin-login.html';
  });
}

// --- Data Fetching ---
async function loadDashboardData() {
  document.getElementById('btnRefreshStats').disabled = true;
  
  try {
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    currentShipments = shipments || [];
    
    // Update Stats
    const total = shipments.length;
    const inTransit = shipments.filter(s => s.status === 'in_transit' || s.status === 'out_for_delivery').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const pending   = shipments.filter(s => s.status === 'pending' || s.status === 'picked_up').length;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statInTransit').textContent = inTransit;
    document.getElementById('statDelivered').textContent = delivered;
    document.getElementById('statPending').textContent = pending;
    
    // Recent shipments table (Top 5)
    renderRecentTable(shipments.slice(0, 5));
    
    // Render all shipments if that tab is somehow active
    renderAllShipmentsTable();
    
  } catch (err) {
    console.error('Error loading data', err);
    toast.error('Failed to load dashboard data.');
  } finally {
    document.getElementById('btnRefreshStats').disabled = false;
  }
}

document.getElementById('btnRefreshStats').addEventListener('click', loadDashboardData);

// --- Render Tables ---
function renderRecentTable(shipments) {
  const tbody = document.getElementById('recentShipmentsTable');
  if (shipments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No recent shipments found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = shipments.map(s => `
    <tr>
      <td><strong>${s.tracking_code}</strong></td>
      <td>${s.destination || 'N/A'}</td>
      <td>${getStatusBadge(s.status)}</td>
      <td>${formatDate(s.created_at)}</td>
    </tr>
  `).join('');
  
  if (window.lucide) window.lucide.createIcons({ root: tbody });
}

function renderAllShipmentsTable() {
  const tbody = document.getElementById('allShipmentsTable');
  const search = document.getElementById('searchShipmentInput').value.toLowerCase();
  const statusFilter = document.getElementById('filterStatus').value;
  
  let filtered = currentShipments;
  
  if (search) {
    filtered = filtered.filter(s => 
      (s.tracking_code && s.tracking_code.toLowerCase().includes(search)) ||
      (s.sender_name && s.sender_name.toLowerCase().includes(search)) ||
      (s.receiver_name && s.receiver_name.toLowerCase().includes(search))
    );
  }
  
  if (statusFilter !== 'all') {
    filtered = filtered.filter(s => s.status === statusFilter);
  }
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No shipments match your criteria.</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td><strong>${s.tracking_code}</strong></td>
      <td>
        <div>${s.sender_name || 'N/A'}</div>
        <div class="text-muted text-sm">${s.origin || 'N/A'}</div>
      </td>
      <td>
        <div>${s.receiver_name || 'N/A'}</div>
        <div class="text-muted text-sm">${s.destination || 'N/A'}</div>
      </td>
      <td>${getStatusBadge(s.status)}</td>
      <td>
        <button class="btn btn-outline btn-sm btn-update-status" data-id="${s.id}" data-code="${s.tracking_code}" data-status="${s.status}">
          Update Status
        </button>
      </td>
    </tr>
  `).join('');
  
  // Attach update handlers
  document.querySelectorAll('.btn-update-status').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('button').getAttribute('data-id');
      const code = e.target.closest('button').getAttribute('data-code');
      const currentStatus = e.target.closest('button').getAttribute('data-status');
      openUpdateModal(id, code, currentStatus);
    });
  });
}

// --- Create Shipment ---
function initCreateForm() {
  const form = document.getElementById('createShipmentForm');
  const codeGenBtn = document.getElementById('btnGenCode');
  const codeField = document.getElementById('trackingCodeField');
  
  codeGenBtn.addEventListener('click', () => {
    codeField.value = generateTrackingCode();
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Auto-generate if empty
    if (!codeField.value.trim()) {
      codeField.value = generateTrackingCode();
    }
    
    const formData = new FormData(form);
    const shipmentData = Object.fromEntries(formData.entries());
    
    // Default status
    shipmentData.status = 'pending';
    
    const btn = document.getElementById('btnCreateShipment');
    btn.disabled = true;
    btn.innerHTML = 'Saving...';
    
    try {
      // 1. Insert Shipment
      const { data: newShipment, error: insertError } = await supabase
        .from('shipments')
        .insert([shipmentData])
        .select()
        .single();
        
      if (insertError) {
        if (insertError.code === '23505') { throw new Error('Tracking code already exists. Try generating a new one.'); }
        throw insertError;
      }
      
      // 2. Insert Initial History
      await supabase.from('shipment_history').insert([{
        shipment_id: newShipment.id,
        status: 'pending',
        location: shipmentData.origin,
        description: 'Shipment created and data received.'
      }]);
      
      toast.success(`Shipment ${newShipment.tracking_code} created successfully!`);
      form.reset();
      
      // Reload data to reflect change
      loadDashboardData();
      
      // Switch back to shipments tab
      document.querySelector('.nav-item[data-tab="shipments"]').click();
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error creating shipment.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Save Shipment';
    }
  });
}

// --- Update Status Modal ---
const modal = document.getElementById('statusModal');

function initUpdateStatusModal() {
  document.getElementById('closeModalBtn').addEventListener('click', closeUpdateModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeUpdateModal);
  
  const form = document.getElementById('updateStatusForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('modalShipmentId').value;
    const newStatus = document.getElementById('modalStatus').value;
    const location = document.getElementById('modalLocation').value.trim();
    const description = document.getElementById('modalDescription').value.trim();
    
    const btn = document.getElementById('btnSaveStatus');
    btn.disabled = true;
    btn.textContent = 'Updating...';
    
    try {
      // 1. Update Shipment record
      const { error: updateError } = await supabase
        .from('shipments')
        .update({ status: newStatus, current_location: location })
        .eq('id', id);
        
      if (updateError) throw updateError;
      
      // 2. Insert into History
      const { error: historyError } = await supabase
        .from('shipment_history')
        .insert([{
          shipment_id: id,
          status: newStatus,
          location: location,
          description: description
        }]);
        
      if (historyError) throw historyError;
      
      toast.success('Shipment status updated.');
      closeUpdateModal();
      
      // Reload Data
      loadDashboardData();
      
    } catch (err) {
      console.error('Error updating status', err);
      toast.error('Failed to update status.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Status';
    }
  });
}

function openUpdateModal(id, code, currentStatus) {
  document.getElementById('modalShipmentId').value = id;
  document.getElementById('modalTrackingCode').textContent = code;
  document.getElementById('modalStatus').value = currentStatus;
  
  // Clear optional fields
  document.getElementById('modalLocation').value = '';
  document.getElementById('modalDescription').value = '';
  
  modal.classList.remove('d-none');
}

function closeUpdateModal() {
  modal.classList.add('d-none');
}
