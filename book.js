(async function(){
  const e=MLP_esc,root=document.getElementById('bookapp'),c=await MLP_loadConfig();
  const sel=new URLSearchParams(location.search).get('package')||'';
  const field=f=>{const id=e(f.id),req=f.required?'required':'',lab=`${e(f.label)}${f.required?' *':''}`,ph=f.placeholder?`placeholder="${e(f.placeholder)}"`:'';
    const full=['textarea','checkbox','radio','checkboxes'].includes(f.type)||String(f.label).length>34?'full':'';
    if(f.type==='textarea')return `<div class="full"><label>${lab}</label><textarea name="${id}" ${req} ${ph}></textarea></div>`;
    if(f.type==='select')return `<div class="${full}"><label>${lab}</label><select name="${id}" ${req}><option value="">Select option</option>${(f.options||[]).map(o=>`<option>${e(o)}</option>`).join('')}</select></div>`;
    if(f.type==='checkbox')return `<div class="full checks"><label><input type="checkbox" name="${id}" value="yes" ${req}> ${lab}</label></div>`;
    if(f.type==='radio'||f.type==='checkboxes')return `<div class="full checks"><label style="text-transform:uppercase;letter-spacing:.14em;font-weight:600;font-size:12px">${lab}</label>${(f.options||[]).map(o=>`<label><input type="${f.type==='radio'?'radio':'checkbox'}" name="${id}" value="${e(o)}" ${f.type==='radio'?req:''}> ${e(o)}</label>`).join('')}</div>`;
    const t=['text','email','tel','number','date','time'].includes(f.type)?f.type:'text';
    return `<div class="${full}"><label>${lab}</label><input type="${t}" name="${id}" ${req} ${ph} ${t==='number'?'min="0"':''}></div>`};
  const pk=(c.packages||[]).map(p=>`<option value="${e(p.name)}" ${p.id===sel||p.name===sel?'selected':''}>${e(p.name)}${p.category?' — '+e(p.category):''}${p.price?' ('+e(p.price)+')':''}</option>`).join('');
  const ad=(c.addons||[]).map(a=>`<label><input type="checkbox" name="addons" value="${e(a.name)}${a.price?' ('+e(a.price)+')':''}"> ${e(a.name)}${a.price?' — '+e(a.price):''}</label>`).join('');
  const oo=c.other_option||{};
  const chosen=(c.packages||[]).find(p=>p.id===sel);
  root.innerHTML=`<div class="center"><h5>${e(c.eyebrow||'')}</h5><h1>${e(c.heading||'Book a Session')}</h1><p>${e(c.intro||'').replace(/\n/g,'<br>')}</p></div>
  ${chosen&&chosen.image?`<img src="${e(chosen.image)}" alt="" style="max-width:320px;margin:24px auto;border-radius:22px;aspect-ratio:4/5;object-fit:cover">`:''}
  <form class="f" id="bf" style="margin-top:36px"><div class="full"><label>${e(c.package_label||'Session type / package')} *</label><select name="package" id="pkgsel" required><option value="">Select a package</option>${pk}${oo.enabled!==false?`<option value="${e(oo.label||'Other')}" ${sel==='other'?'selected':''}>${e(oo.label||'Other')}</option>`:''}</select></div>
  <div class="full" id="otherwrap" style="display:none"><label>${e(oo.field_label||"Tell us what you'd like")} *</label><textarea name="other_request" id="otherreq" placeholder="${e(oo.placeholder||"Tell Macy what you're looking for")}"></textarea></div>
  ${(c.fields||[]).map(field).join('')}
  ${ad?`<div class="full checks"><label style="text-transform:uppercase;letter-spacing:.14em;font-weight:600;font-size:12px">${e(c.addons_heading||'Add to your package')}</label>${ad}${c.addon_note?`<p style="font-size:14px;margin:4px 0 0">${e(c.addon_note)}</p>`:''}</div>`:''}
  <input name="website" style="display:none" tabindex="-1" autocomplete="off"><div class="full"><button class="btn dark">${e(c.submit_label||'Request my session')}</button></div></form>`;
  const f=document.getElementById('bf'),ps=document.getElementById('pkgsel'),ow=document.getElementById('otherwrap'),orq=document.getElementById('otherreq');
  const isOther=()=>oo.enabled!==false&&ps.value===(oo.label||'Other')&&ps.selectedIndex===ps.options.length-1;
  const tog=()=>{const on=isOther();ow.style.display=on?'':'none';orq.required=on};ps.addEventListener('change',tog);tog();
  f.addEventListener('submit',async ev=>{ev.preventDefault();const fd=new FormData(f),btn=f.querySelector('button');
    const labels={package:'Package',addons:'Add-ons'};(c.fields||[]).forEach(x=>labels[x.id]=x.label);
    if(isOther()){const t=String(fd.get('other_request')||'').trim(),n=String(fd.get('notes')||'').trim();fd.set('notes',`${oo.label||'Other'} request: ${t}`+(n?'\n\n'+n:''));labels.other_request=oo.field_label||'Other request'}else fd.delete('other_request');
    fd.append('source','booking form');fd.append('_labels',JSON.stringify(labels));
    if(!window.MLP_FORM_URL){alert('Online booking is being set up. Please message @maelynnphotos on Instagram or call/text 850-661-8123.');return}
    btn.disabled=true;btn.textContent='Sending...';
    try{await fetch(window.MLP_FORM_URL,{method:'POST',mode:'no-cors',body:new URLSearchParams(fd)});
      const pk=(c.packages||[]).find(p=>p.name==fd.get('package'));const num=v=>{const n=parseFloat(String(v||'').replace(/[^\d.]/g,''));return isFinite(n)?n:0};
      let amt=pk?num(pk.price):0;fd.getAll('addons').forEach(a=>(String(a).match(/\$\s?[\d,.]+/g)||[]).forEach(x=>amt+=num(x)));
      const vu=encodeURIComponent(c.venmo_user||'Macy-Bower'),note=(fd.get('package')||'Photo session')+' - '+(fd.get('name')||'');
      const vl=`https://venmo.com/${vu}?txn=pay${amt?'&amount='+amt.toFixed(2):''}&note=${encodeURIComponent(note)}`;
      root.innerHTML=`<div class="ok"><h5>Request received</h5><h1>${e(c.success_title||'Thank you!')}</h1><p>${e(c.success_text||'')}</p>
      <div class="notice" style="max-width:520px;margin:28px auto;text-align:center"><h5>Ready to pay?</h5><p style="margin:6px 0 14px">${amt?`Session total: <b>$${amt.toFixed(2)}</b>. `:''}You can pay Macy on Venmo (@${e(c.venmo_user||'Macy-Bower')}), or wait for her to confirm your date and send a request.</p>
      <a class="btn dark" id="venmo" href="${e(vl)}" target="_blank" rel="noopener">Pay with Venmo</a><p style="font-size:13px;margin-top:10px">Link not opening? <a href="https://account.venmo.com/u/${vu}" target="_blank" rel="noopener"><u>venmo.com/u/${e(c.venmo_user||'Macy-Bower')}</u></a></p></div>
      <p><a class="btn" href="index.html">Back home</a></p></div>`;scrollTo(0,0)}
    catch(x){btn.disabled=false;btn.textContent='Try again';alert('Something went wrong. Please message @maelynnphotos on Instagram or call/text 850-661-8123.')}});
})();
