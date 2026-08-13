function s(l,n="info",i=3e3){let e=document.getElementById("floatAlertContainer");e||(e=document.createElement("div"),e.id="floatAlertContainer",e.style.cssText=`
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
      z-index: 99999; display: flex; flex-direction: column; gap: 10px;
      align-items: center; pointer-events: none;
    `,document.body.appendChild(e));const t=document.createElement("div"),r={success:"fa-circle-check",error:"fa-circle-xmark",info:"fa-circle-info",warning:"fa-triangle-exclamation"},o={success:"#10b981",error:"#ef4444",info:"#3b82f6",warning:"#f59e0b"};if(t.style.cssText=`
    display: flex; align-items: center; gap: 10px;
    background: #fff; color: #334155; border-radius: 12px;
    padding: 12px 22px; font-size: 14px; font-weight: 500;
    box-shadow: 0 8px 30px rgba(2, 90, 60, 0.18);
    border-left: 4px solid ${o[n]||o.info};
    animation: floatAlertIn 0.3s ease, floatAlertOut 0.3s ease 2.7s forwards;
  `,t.innerHTML=`
    <i class="fa-solid ${r[n]||r.info}" style="color: ${o[n]||o.info}; font-size: 18px;"></i>
    <span>${l}</span>
  `,e.appendChild(t),!document.getElementById("floatAlertStyle")){const a=document.createElement("style");a.id="floatAlertStyle",a.textContent=`
      @keyframes floatAlertIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes floatAlertOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-16px); } }
    `,document.head.appendChild(a)}setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t)},i+200)}export{s};
