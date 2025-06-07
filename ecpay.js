/* ecpay.js  – GitHub-Pages client that posts to ECPay
 *  1. decode ?p=…  ({ cfg , amt , tno })
 *  2. build a hidden-input form exactly as backend expects
 *  3. wire the visible button  (id="go")  + optional auto-submit
 *  4. console.table() all params for easy debugging                  */

(function () {
  /* ---------- helpers --------------------------------------------------- */
  const qs   = new URLSearchParams(location.search);
  const enc  = qs.get('p') || '';
  const $box = document.getElementById('box');   // where the form lives
  const $btn = document.getElementById('go');    // the visible button

  if (!enc) {
    $box.innerHTML = '<p style="color:#c00">付款參數缺失，請重新下單</p>';
    $btn.remove();
    return;
  }

  /* safe-decode ----------------------------------------------------------- */
  let decoded;
  try {
    decoded = JSON.parse(atob(decodeURIComponent(enc)));
  } catch (e) {
    console.error('[ecpay.js] decode error', e);
    $box.innerHTML = '<p style="color:#c00">付款參數無法解析</p>';
    $btn.remove();
    return;
  }

  const { cfg, amt, tno } = decoded;

  /* taipei-time “YYYY/MM/DD hh:mm:ss” ------------------------------------ */
  const taipeiTime = () => {
    const t = new Date(Date.now() + 8 * 60 * 60 * 1000);   // force +08:00
    const z = n => String(n).padStart(2, '0');
    return (
      `${t.getUTCFullYear()}/${z(t.getUTCMonth() + 1)}/${z(t.getUTCDate())} ` +
      `${z(t.getUTCHours())}:${z(t.getUTCMinutes())}:${z(t.getUTCSeconds())}`
    );
  };

  /* build parameter object (CheckMacValue already computed server-side!) */
  const p = {
    MerchantID       : cfg.merchantId,
    MerchantTradeNo  : tno,
    MerchantTradeDate: taipeiTime(),
    PaymentType      : 'aio',
    TotalAmount      : amt,
    TradeDesc        : '商品訂單',
    ItemName         : '課程',
    ReturnURL        : 'https://www.sooooz.com/_functions/updateECPayTransaction',
    ClientBackURL    : 'https://www.sooooz.com/',
    OrderResultURL   : 'https://www.sooooz.com/_functions/paymentResult',
    ChoosePayment    : 'ALL',
    EncryptType      : '1',
    CustomField1     : cfg.wixTransactionId,
    CustomField2     : cfg.orderId,
    CheckMacValue    : cfg.mac                    // ← provided by backend
  };

  /* debug – see everything that will be POSTed --------------------------- */
  console.table(p);

  /* make form ------------------------------------------------------------- */
  const form = document.createElement('form');
  form.method = 'post';
  form.action =
    p.MerchantID === '3002607'
      ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
      : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';
  form.id = 'pay';

  Object.entries(p).forEach(([k, v]) => {
    const inp = document.createElement('input');
    inp.type  = 'hidden';
    inp.name  = k;
    inp.value = v;
    form.appendChild(inp);
  });

  $box.appendChild(form);

  /* wire visible button --------------------------------------------------- */
  $btn.hidden = false;
  $btn.addEventListener('click', () => form.submit());

  /* auto-submit – comment this out if you prefer manual click */
  form.submit();
})();
