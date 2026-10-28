(function(){
  const sel=new URLSearchParams(location.search).get('package');
  const ps=document.querySelector('select[name=package]');
  if(ps&&sel){[...ps.options].forEach(o=>{if(o.dataset.slug===sel)o.selected=true})}
  document.querySelectorAll("form.f[data-source]").forEach(f=>{
    f.addEventListener('submit',async ev=>{
      ev.preventDefault();
      const btn=f.querySelector('button'),fd=new FormData(f);
      fd.append('source',f.dataset.source||'booking form');
      if(f.dataset.source==='contact form'){fd.set('package','Contact inquiry');fd.set('email',fd.get('email_phone')||'');fd.set('notes',fd.get('message')||'')}
      if(!window.MLP_FORM_URL){alert('Online booking is being set up. Please message @maelynnphotos on Instagram or call/text 850-661-8123.');return}
      btn.disabled=true;btn.textContent='Sending...';
      try{await fetch(window.MLP_FORM_URL,{method:'POST',mode:'no-cors',body:new URLSearchParams(fd)});
        f.outerHTML='<div class="ok" style="padding:40px 0"><h2>Thank you, '+(fd.get('name')||'').replace(/[<>&]/g,'')+'!</h2><p>Your request was sent. Macy will reach out to confirm. If you do not hear back in 24 hours, message me on Instagram or call/text 850-661-8123.</p></div>';
        scrollTo(0,0)}
      catch(e){btn.disabled=false;btn.textContent='Try again';alert('Something went wrong. Please message @maelynnphotos on Instagram or call/text 850-661-8123.')}
    })
  })
})();
