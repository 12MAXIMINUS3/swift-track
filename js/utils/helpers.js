/**
 * Generates a random tracking code
 */
export function generateTrackingCode() {
  const prefix = 'SFT';
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${randomStr}`;
}

/**
 * Formats a database date string to a readable format
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Returns HTML for a status badge
 */
export function getStatusBadge(status) {
  const statusMap = {
    'pending': { className: 'badge-pending', label: 'Pending' },
    'picked_up': { className: 'badge-pending', label: 'Picked Up' },
    'in_transit': { className: 'badge-in-transit', label: 'In Transit' },
    'out_for_delivery': { className: 'badge-in-transit', label: 'Out for Delivery' },
    'delivered': { className: 'badge-delivered', label: 'Delivered' },
    'on_hold': { className: 'badge-danger', label: 'On Hold' },
    'returned': { className: 'badge-danger', label: 'Returned' }
  };

  const info = statusMap[status] || { className: '', label: status };
  return `<span class="badge ${info.className}">${info.label}</span>`;
}
