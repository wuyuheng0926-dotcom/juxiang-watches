(() => {
'use strict';
const storageKey='juxiang.cart.v1',maxLines=100,maxQuantity=99;
const languages=['en','zh-CN','es','fr','de','ar'];
const words={
 cart:['Cart','购物车','Carrito','Panier','Warenkorb','السلة'],
 add:['Add to cart','添加购物车','Añadir al carrito','Ajouter au panier','In den Warenkorb','أضف إلى السلة'],
 added:['Added to cart','已加入购物车','Añadido al carrito','Ajouté au panier','Zum Warenkorb hinzugefügt','تمت الإضافة إلى السلة'],
 empty:['Your cart is empty.','购物车还是空的。','Su carrito está vacío.','Votre panier est vide.','Ihr Warenkorb ist leer.','سلتك فارغة.'],
 browse:['Browse watches','继续挑选腕表','Ver relojes','Voir les montres','Uhren entdecken','تصفح الساعات'],
 quantity:['Quantity','数量','Cantidad','Quantité','Anzahl','الكمية'],
 remove:['Remove','移除','Eliminar','Retirer','Entfernen','إزالة'],
 clear:['Clear cart','清空购物车','Vaciar carrito','Vider le panier','Warenkorb leeren','إفراغ السلة'],
 subtotal:['Subtotal','商品合计','Subtotal','Sous-total','Zwischensumme','المجموع الفرعي'],
 enquiry:['Contact customer service','联系客服确认订单','Contactar atención al cliente','Contacter le service client','Kundenservice kontaktieren','تواصل مع خدمة العملاء'],
 note:['Availability, shipping and final prices are confirmed by customer service. You can review the message in WhatsApp before sending.','库存、运费及最终价格由客服确认。跳转 WhatsApp 后可核对消息，再自行发送。','El servicio al cliente confirma existencias, envío y precio final. Revise el mensaje en WhatsApp antes de enviarlo.','Le service client confirme disponibilité, livraison et prix final. Vérifiez le message WhatsApp avant envoi.','Verfügbarkeit, Versand und Endpreise bestätigt der Kundenservice. Prüfen Sie die Nachricht vor dem Senden in WhatsApp.','تؤكد خدمة العملاء التوفر والشحن والسعر النهائي. راجع الرسالة في واتساب قبل إرسالها.'],
 request:['Price on request','价格待询','Precio a consultar','Prix sur demande','Preis auf Anfrage','السعر عند الطلب'],
 partial:['Some prices require confirmation.','部分款式价格需联系客服确认。','Algunos precios requieren confirmación.','Certains prix restent à confirmer.','Einige Preise müssen bestätigt werden.','تحتاج بعض الأسعار إلى التأكيد.'],
 locked:['Price access has expired. Enter a new key in Search to use your cart.','查看权限已到期，请在搜索栏输入新密钥后使用购物车。','El acceso ha caducado. Introduzca una clave nueva en Buscar.','Accès expiré. Saisissez une nouvelle clé dans la recherche.','Zugriff abgelaufen. Geben Sie einen neuen Schlüssel in der Suche ein.','انتهت الصلاحية. أدخل مفتاحاً جديداً في البحث لاستخدام السلة.'],
 unavailable:['This selection is no longer available.','此款式已下架，无法加入购物车。','Esta selección ya no está disponible.','Cette sélection est indisponible.','Diese Auswahl ist nicht mehr verfügbar.','لم يعد هذا الخيار متاحاً.'],
 removed:['Unavailable selections were removed from the cart.','已移除购物车中下架的款式。','Se eliminaron las selecciones no disponibles.','Les sélections indisponibles ont été retirées.','Nicht verfügbare Artikel wurden entfernt.','أزيلت الخيارات غير المتاحة من السلة.'],
 limit:['Cart limit reached (100 selections, 99 of each).','已达到购物车上限（100款，每款99件）。','Límite: 100 selecciones, 99 unidades cada una.','Limite : 100 sélections, 99 unités par sélection.','Limit: 100 Artikel, je 99 Stück.','الحد الأقصى 100 خيار و99 قطعة لكل خيار.'],
 temporary:['Cart storage is unavailable. Your cart will remain for this page only.','浏览器未允许保存购物车，当前页面内仍可使用。','No se puede guardar. El carrito solo durará esta página.','Stockage indisponible. Le panier reste sur cette page seulement.','Speichern nicht möglich. Der Warenkorb bleibt nur auf dieser Seite.','التخزين غير متاح. تبقى السلة في هذه الصفحة فقط.'],
 order:['JUXIANG cart enquiry','JUXIANG 购物车订购咨询','Consulta del carrito JUXIANG','Demande de panier JUXIANG','JUXIANG Warenkorbanfrage','استفسار سلة JUXIANG'],
 details:['View details','查看详情','Ver detalles','Voir les détails','Details ansehen','عرض التفاصيل'],
 close:['Close','关闭','Cerrar','Fermer','Schließen','إغلاق']
};
const label=key=>words[key]?.[Math.max(0,languages.indexOf(window.JXI18n?.language||document.documentElement.lang))]||key;
const allowed=()=>!!window.JXPriceAccess?.valid();
const dialog=document.getElementById('cart'),contents=document.getElementById('cartContents'),status=document.getElementById('cartStatus');
const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const translate=s=>window.JXI18n?.translate(String(s||''))||String(s||'');
const dollars=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n)+' USD';
let lines=[],notice='',storageOK=true,lastRendered='';
function fingerprint(){return JSON.stringify([allowed(),window.JXI18n?.language,lines,lines.map(row=>selection(row)?.p.priceUSD)])}
function normalize(value){
 if(!Array.isArray(value))return [];
 const result=[];
 for(const row of value.slice(0,maxLines)){
  if(!row||!/^JX\d+$/.test(row.id)||!/^v\d+$/.test(row.key)||!Number.isInteger(row.quantity)||row.quantity<1)continue;
  const old=result.find(x=>x.id===row.id&&x.key===row.key);
  if(old)old.quantity=Math.min(maxQuantity,old.quantity+row.quantity);else result.push({id:row.id,key:row.key,quantity:Math.min(maxQuantity,row.quantity)});
 }
 return result;
}
try{lines=normalize(JSON.parse(localStorage.getItem(storageKey)||'[]'));}catch{storageOK=false}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(lines));storageOK=true}catch{storageOK=false}}
function selection(row){const p=products.find(p=>p.id===row.id&&!p.adminDeleted&&!p.adminUnpublished);const v=p?.variants.find(v=>v.key===row.key&&!v.catalogHidden);return p&&v?{p,v,row}:null}
function reconcile(){const previous=lines.length;lines=lines.filter(selection);if(lines.length!==previous){notice='removed';persist()}}
function message(key){notice=key;status.textContent=label(key)}
function sync(){
 const enabled=allowed();
 document.querySelectorAll('[data-cart-open],[data-cart-add]').forEach(el=>{el.hidden=!enabled;if(el.hasAttribute('data-cart-add'))el.textContent=label('add')});
 document.querySelectorAll('[data-cart-label]').forEach(el=>el.textContent=label('cart'));
 const count=lines.reduce((n,row)=>n+row.quantity,0);
 document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=String(count));
 const floating=document.getElementById('floatingCart');floating.setAttribute('aria-label',label('cart')+' ('+(enabled?count:0)+')');floating.title=label('cart');
 dialog.querySelector('.close').setAttribute('aria-label',label('close'));
 if(dialog.open&&lastRendered!==fingerprint())render();else if(!dialog.open&&!enabled){contents.replaceChildren();status.textContent=''}
}
function render(){
 lastRendered=fingerprint();
 document.getElementById('cartTitle').textContent=label('cart');
 if(!allowed()){contents.innerHTML='<p>'+html(label('locked'))+'</p>';status.textContent='';return}
 reconcile();
 if(!lines.length){contents.innerHTML='<p class="cart-empty">'+html(label('empty'))+'</p><button type="button" class="button" data-cart-browse>'+html(label('browse'))+' ↗</button>';status.textContent=notice?label(notice):'';return}
 let total=0,complete=true;
 const cards=lines.map(row=>{
  const {p,v}=selection(row),priced=Number.isFinite(p.priceUSD)&&p.priceUSD>=0;if(priced)total+=p.priceUSD*row.quantity;else complete=false;
  const code=p.id+'-'+v.key;
  return '<article class="cart-line" data-cart-code="'+html(code)+'"><button type="button" class="cart-photo" data-cart-detail="'+html(p.id)+'" data-variant="'+html(v.key)+'" aria-label="'+html(label('details')+' '+code)+'">'+selectionPhoto(v.image,p.brand+' '+p.family,'loading="lazy"',v.imagePanel)+'</button><div class="cart-line-info"><p class="cart-brand">'+html(p.brand)+'</p><button type="button" class="cart-watch-name" data-cart-detail="'+html(p.id)+'" data-variant="'+html(v.key)+'">'+html(translate(p.family))+'</button><p>'+html(translate(v.label))+'</p><small>'+html(code)+'</small><p class="cart-unit-price">'+html(priced?dollars(p.priceUSD):label('request'))+'</p><div class="cart-line-actions"><label>'+html(label('quantity'))+'<input type="number" inputmode="numeric" min="1" max="99" step="1" value="'+row.quantity+'" data-cart-quantity="'+html(code)+'" aria-label="'+html(label('quantity')+' '+code)+'"></label><button type="button" data-cart-remove="'+html(code)+'">'+html(label('remove'))+'</button></div></div></article>';
 }).join('');
 const base=CONTACT_URL;
 contents.innerHTML='<div class="cart-lines">'+cards+'</div><div class="cart-summary"><p><span>'+html(label('subtotal'))+'</span><strong>'+html(complete?dollars(total):label('request'))+'</strong></p>'+(complete?'':'<p class="cart-note">'+html(label('partial'))+'</p>')+'<p class="cart-note">'+html(label('note'))+'</p><a class="button contact-gold cart-checkout" id="cartCheckout" target="_blank" rel="noopener noreferrer">'+html(label('enquiry'))+' ↗</a><div class="cart-bottom-actions"><button type="button" data-cart-browse>'+html(label('browse'))+'</button><button type="button" data-cart-clear>'+html(label('clear'))+'</button></div></div>';
 const link=document.getElementById('cartCheckout'),url=buildContactUrl(base,orderText());link.hidden=!url;if(url)link.href=url;
 status.textContent=notice?label(notice):!storageOK?label('temporary'):'';
}
function orderText(){
 if(!allowed())return '';
 const rows=lines.map(selection).filter(Boolean);let total=0,complete=true;
 const text=[label('order'),''];
 for(const {p,v,row}of rows){const fields=productEnquiryFields(p,location.origin,{quantity:String(row.quantity)},v);text.push(makeEnquiryText(fields),'');if(Number.isFinite(p.priceUSD)&&p.priceUSD>=0)total+=p.priceUSD*row.quantity;else complete=false;}
 text.push(label('subtotal')+': '+(complete?dollars(total):label('request')),label('note'));return text.join('\n');
}
function add(id,key){
 if(!allowed()){sync();return false}
 reconcile();const row={id,key,quantity:1};if(!selection(row)){message('unavailable');return false}
 const old=lines.find(x=>x.id===id&&x.key===key);if(old?old.quantity>=maxQuantity:lines.length>=maxLines){message('limit');return false}
 if(old)old.quantity++;else lines.push(row);persist();sync();message('added');return true;
}
function open(){if(!allowed()){sync();return}notice='';render();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;}
// Capture prevents a cart link from being treated as ordinary page-anchor navigation.
document.addEventListener('click',e=>{
 const trigger=e.target.closest('[data-cart-open]');if(trigger){e.preventDefault();e.stopPropagation();open();return}
 const addButton=e.target.closest('[data-cart-add]');if(addButton){e.preventDefault();if(add(addButton.dataset.product,addButton.dataset.variant)){addButton.textContent=label('added')+' ✓';const old=document.getElementById('detailCartStatus');if(old)old.remove();const hint=document.createElement('p');hint.id='detailCartStatus';hint.className='cart-status';hint.setAttribute('role','status');hint.textContent=label('added');addButton.after(hint)}return}
 if(!dialog.contains(e.target))return;
 if(e.target.closest('[data-cart-browse]')){dialog.close();document.getElementById('collection').scrollIntoView({behavior:'smooth'});return}
 if(!allowed()){e.preventDefault();render();return}
 const view=e.target.closest('[data-cart-detail]');if(view){dialog.close();window.showProduct(view.dataset.cartDetail,true,view.dataset.variant);return}
 const remove=e.target.closest('[data-cart-remove]');if(remove){lines=lines.filter(row=>row.id+'-'+row.key!==remove.dataset.cartRemove);persist();notice='';render();sync();return}
 if(e.target.closest('[data-cart-clear]')){lines=[];persist();notice='';render();sync();return}
 if(e.target.closest('#cartCheckout')){const link=document.getElementById('cartCheckout'),url=buildContactUrl(CONTACT_URL,orderText());if(!url){e.preventDefault();return}link.href=url;}
},true);
dialog.addEventListener('change',e=>{
 const input=e.target.closest('[data-cart-quantity]');if(!input)return;if(!allowed()){render();return}
 const row=lines.find(row=>row.id+'-'+row.key===input.dataset.cartQuantity);if(!row)return;
 const quantity=Number(input.value);row.quantity=Number.isFinite(quantity)?Math.max(1,Math.min(maxQuantity,Math.floor(quantity))):row.quantity;persist();notice='';render();sync();
});
window.addEventListener('jx-prices-change',sync);
window.addEventListener('jx-language-change',sync);
window.addEventListener('jx-catalogue-change',()=>{reconcile();sync()});
window.addEventListener('storage',e=>{if(e.key!==storageKey)return;try{lines=normalize(JSON.parse(e.newValue||'[]'))}catch{lines=[]}sync()});
// Timer also protects against an expiry while a tab's other timers are throttled.
setInterval(sync,15000);document.addEventListener('visibilitychange',sync);
window.JXCart={add,open,label};
reconcile();sync();
})();
