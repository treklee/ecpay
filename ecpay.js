/* ecpay.js  – self-contained version, no #box or #go needed  */
(function () {
  /* pull ?p=… */
  const enc = new URLSearchParams(location.search).get('p') || '';
  if (!enc) return document.body.innerHTML =
    '<p style="color:#c00;text-align:center;margin-top:40vh">付款參數缺失，請重新下單</p>';

  /* decode */
  let decoded;
  try { decoded = JSON.parse(atob(decodeURIComponent(enc))); }
  catch { return document.body.textContent = '付款參數無法解析'; }

  const { cfg, amt, tno } = decoded;

  /* create placeholder card -------------------------------------------- */
  const card = document.createElement('div');
  card.style.cssText =
    'max-width:360px;margin:20vh auto;padding:32px;border-radius:16px;' +
    'box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center;font-family:sans-serif';
  card.innerHTML =
    '<h2 style="margin:0 0 12px;font-size:1.25rem">前往綠界金流付款頁面</h2>' +
    '<p>請點按鈕完成付款</p>';
  document.body.appendChild(card);

  /* build form --------------------------------------------------------- */
  const form = document.createElement('form');
  form.method = 'post';
  form.action =
    cfg.merchantId === '3002607'
      ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
      : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';
  form.id = 'pay';

  const params = { /* …same construction as before… */ };
  /* (unchanged code that fills params, console.table, etc.) */

  /* visible button */
  const btn = document.createElement('button');
  btn.textContent = '前往付款';
  btn.style.cssText =
    'margin-top:16px;padding:10px 26px;font-size:1rem;border:0;border-radius:8px;' +
    'background:#2ab894;color:#fff;cursor:pointer';
  btn.onclick = () => form.submit();

  form.appendChild(btn);
  card.appendChild(form);

  /* auto-submit if you still want it */
  form.submit();
})();
