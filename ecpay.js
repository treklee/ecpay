/* ecpay.js  –  builds a hidden-input form and (optionally) auto-submits
 *
 * 1. Pull “p=ENCODED_STRING” from the page URL
 * 2. Decode => { cfg, amt, tno }  (must match what backend created)
 * 3. Create a <form> with all the required hidden inputs
 * 4. Insert the form into the DOM and wire “前往付款” button
 * 5. (Optional) auto-submit instantly
 */

/* --- tiny helpers --- */
const qs    = new URLSearchParams(location.search);
const enc   = qs.get("p") || "";
const $box  = document.getElementById("box");
const $btn  = document.getElementById("go");

/* bail out if params missing */
if (!enc) {
  $box.innerHTML = "<p style='color:#c00'>付款參數缺失，請重新下單</p>";
  $btn.remove();
  throw new Error("missing ?p param");
}

let decoded;
try {
  decoded = JSON.parse(
    decodeURIComponent(atob(enc))
  );                     // { cfg:{…}, amt:'299', tno:'…' }
} catch (e) {
  console.error("[ecpay.js] decode failed:", e);
  $box.innerHTML = "<p style='color:#c00'>付款參數無法解析</p>";
  $btn.remove();
  throw e;
}

const { cfg, amt, tno } = decoded;

/* --- build the parameter object exactly as backend did --- */
const p = {
  MerchantID:        cfg.merchantId,
  MerchantTradeNo:   tno,
  MerchantTradeDate: new Date().toISOString().slice(0, 19).replace("T", " "),
  PaymentType:       "aio",
  TotalAmount:       amt,
  TradeDesc:         "商品訂單",
  ItemName:          "課程",
  ReturnURL:         "https://www.sooooz.com/_functions/updateECPayTransaction",
  ClientBackURL:     "https://www.sooooz.com/",
  OrderResultURL:    "https://www.sooooz.com/_functions/paymentResult",
  ChoosePayment:     "ALL",
  EncryptType:       "1",
  CustomField1:      cfg.wixTransactionId,
  CustomField2:      cfg.orderId,
  /* CheckMacValue already calculated server-side → include it: */
  CheckMacValue:     cfg.mac // ← you passed this in cfg when you built the link
};

/* --- create the form & append hidden inputs --- */
const form = document.createElement("form");
form.method = "post";
form.action = "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";
form.id     = "pay";

Object.entries(p).forEach(([k, v]) => {
  const inp = document.createElement("input");
  inp.type  = "hidden";
  inp.name  = k;
  inp.value = v;
  form.appendChild(inp);
});

$box.appendChild(form);

/* --- enable the visible button --- */
$btn.hidden = false;
$btn.addEventListener("click", () => form.submit());

/* (Optional) auto-submit instantly.  Comment out if you prefer manual click */
form.submit();
