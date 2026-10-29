// Applies Macy's saved "Book a Session" button settings (labels + link) to every book link on the page.
(function(){
  let C=null;
  const apply=()=>{if(!C)return;const b=C.buttons||{},link=(b.link||'').trim();
    document.querySelectorAll('a[href^="book.html"],a[data-mlp-book]').forEach(a=>{
      if(!a.dataset.mlpBook){a.dataset.mlpBook=a.closest('header nav')?'nav':/package=/.test(a.getAttribute('href'))?'pkg':/^book a session$/i.test(a.textContent.trim())?'cta':'other';a.dataset.mlpHref=a.getAttribute('href')}
      const k=a.dataset.mlpBook,lab={nav:b.nav_label,pkg:b.package_label,cta:b.cta_label}[k];
      if(lab&&a.textContent!==lab)a.textContent=lab;
      const h=link&&link!=='book.html'?link:a.dataset.mlpHref;if(a.getAttribute('href')!==h)a.setAttribute('href',h);
      if(/^https?:/i.test(h)){a.target='_blank';a.rel='noopener'}});
    if(b.show_in_nav===false)document.querySelectorAll('a[data-mlp-book="nav"]').forEach(a=>a.style.display='none')};
  (async()=>{try{C=await MLP_loadConfig()}catch(e){return}apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true})})();
})();
