export const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

export const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (date) => date.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}).replace(',', '');

export const calculateDuration = (start, end) => {
  const diff = end - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}H ${minutes}M`;
  }
  return `${minutes}M`;
};
