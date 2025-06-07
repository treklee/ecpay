/* ecpay.js  –  self-contained, no #box / #go required  */
(function () {
  /* pull ?p=… ---------------------------------------------------------- */
  const enc = new URLSearchParams(location.search).get('p') || '';
  if (!enc) return document.body.innerHTML =
    '<p style="color:#c00;text-align:center;margin-top:40vh">付款參數缺失，請重新下單</p>';

  /* decode ------------------------------------------------------------- */
  let d;
  try { d = JSON.parse(atob(decodeURIComponent(enc))); }
  catch { return document.body.textContent = '付款參數無法解析'; }

  const { cfg, amt, tno } = d;

  /* placeholder card --------------------------------------------------- */
  const card = document.createElement('div');
  card.style.cssText =
    'max-width:360px;margin:20vh auto;padding:32px;border-radius:18px;' +
    'box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center;font-family:sans-serif';
  card.innerHTML =
    '<h2 style="margin:0 0 14px;font-size:1.25rem;font-weight:700">前往綠界金流付款頁面</h2>' +
    '<p>請點按鈕完成付款</p>';
  document.body.appendChild(card);

  /* build parameter object --------------------------------------------- */
  const p = {
    MerchantID       : cfg.merchantId,
    MerchantTradeNo  : tno,
    MerchantTradeDate: new Date().toISOString().slice(0,19).replace('T',' '),
    PaymentType      : 'aio',
    TotalAmount      : amt,
    TradeDesc        : '課程訂單',
    ItemName         : '課程',
    ReturnURL        : 'https://www.sooooz.com/_functions/updateECPayTransaction',
    ClientBackURL    : 'https://www.sooooz.com/',
    OrderResultURL   : 'https://www.sooooz.com/_functions/paymentResult',
    ChoosePayment    : 'ALL',
    EncryptType      : '1',
    CustomField1     : cfg.wixTransactionId,
    CustomField2     : cfg.orderId,
    CheckMacValue    : cfg.mac                // calculated server-side
  };

  /* show all fields in the console for debugging ----------------------- */
  console.table(p);

  /* create form -------------------------------------------------------- */
  const form = document.createElement('form');
  form.method = 'post';
  form.action =
    cfg.merchantId === '3002607'        // staging vs production
      ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
      : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';

  Object.entries(p).forEach(([k,v])=>{
    const inp = document.createElement('input');
    inp.type='hidden'; inp.name=k; inp.value=v;
    form.appendChild(inp);
  });

  /* visible button ----------------------------------------------------- */
  const btn = document.createElement('button');
  btn.textContent = '前往付款';
  btn.style.cssText =
    'margin-top:16px;padding:10px 26px;font-size:1rem;border:none;border-radius:8px;' +
    'background:#2ab894;color:#fff;cursor:pointer';
  btn.onclick = () => form.submit();

  form.appendChild(btn);
  card.appendChild(form);

  /* auto-submit (optional) --------------------------------------------- */
  form.submit();          // comment out if you want manual click
})();
