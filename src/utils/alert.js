/**
 * 轻量浮动提示（原 showAlert.js 的 Vue 版本）
 * 用法：showFloatingAlert('文案', 'success' | 'error' | 'info')
 */
export function showFloatingAlert(message, type = 'info', duration = 3000) {
  let container = document.getElementById('floatAlertContainer')
  if (!container) {
    container = document.createElement('div')
    container.id = 'floatAlertContainer'
    container.style.cssText = `
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
      z-index: 99999; display: flex; flex-direction: column; gap: 10px;
      align-items: center; pointer-events: none;
    `
    document.body.appendChild(container)
  }

  const alertEl = document.createElement('div')
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation'
  }
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  }

  alertEl.style.cssText = `
    display: flex; align-items: center; gap: 10px;
    background: #fff; color: #334155; border-radius: 12px;
    padding: 12px 22px; font-size: 14px; font-weight: 500;
    box-shadow: 0 8px 30px rgba(2, 90, 60, 0.18);
    border-left: 4px solid ${colors[type] || colors.info};
    animation: floatAlertIn 0.3s ease, floatAlertOut 0.3s ease 2.7s forwards;
  `

  alertEl.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}" style="color: ${colors[type] || colors.info}; font-size: 18px;"></i>
    <span>${message}</span>
  `
  container.appendChild(alertEl)

  // 样式注入
  if (!document.getElementById('floatAlertStyle')) {
    const style = document.createElement('style')
    style.id = 'floatAlertStyle'
    style.textContent = `
      @keyframes floatAlertIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes floatAlertOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-16px); } }
    `
    document.head.appendChild(style)
  }

  setTimeout(() => {
    if (alertEl.parentNode) alertEl.parentNode.removeChild(alertEl)
  }, duration + 200)
}
