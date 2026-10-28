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
  const chosen=(c.packages||[]).find(p=>p.id===sel);
  root.innerHTML=`<div class="center"><h5>${e(c.eyebrow||'')}</h5><h1>${e(c.heading||'Book a Session')}</h1><p>${e(c.intro||'').replace(/\n/g,'<br>')}</p></div>
  ${chosen&&chosen.image?`<img src="${e(chosen.image)}" alt="" style="max-width:320px;margin:24px auto;border-radius:22px;aspect-ratio:4/5;object-fit:cover">`:''}
  <form class="f" id="bf" style="margin-top:36px"><div class="full"><label>Session type / package *</label><select name="package" required><option value="">Select a package</option>${pk}</select></div>
  ${(c.fields||[]).map(field).join('')}
  ${ad?`<div class="full checks"><label style="text-transform:uppercase;letter-spacing:.14em;font-weight:600;font-size:12px">${e(c.addons_heading||'Add to your package')}</label>${ad}${c.addon_note?`<p style="font-size:14px;margin:4px 0 0">${e(c.addon_note)}</p>`:''}</div>`:''}
  <input name="website" style="display:none" tabindex="-1" autocomplete="off"><div class="full"><button class="btn dark">${e(c.submit_label||'Request my session')}</button></div></form>`;
  const f=document.getElementById('bf');
  f.addEventListener('submit',async ev=>{ev.preventDefault();const fd=new FormData(f),btn=f.querySelector('button');
    const labels={package:'Package',addons:'Add-ons'};(c.fields||[]).forEach(x=>labels[x.id]=x.label);
    fd.append('source','booking form');fd.append('_labels',JSON.stringify(labels));
    if(!window.MLP_FORM_URL){alert('Online booking is being set up. Please message @maelynnphotos on Instagram or call/text 850-661-8123.');return}
    btn.disabled=true;btn.textContent='Sending...';
    try{await fetch(window.MLP_FORM_URL,{method:'POST',mode:'no-cors',body:new URLSearchParams(fd)});
      root.innerHTML=`<div class="ok"><h5>Request received</h5><h1>${e(c.success_title||'Thank you!')}</h1><p>${e(c.success_text||'')}</p><p><a class="btn" href="index.html">Back home</a></p></div>`;scrollTo(0,0)}
    catch(x){btn.disabled=false;btn.textContent='Try again';alert('Something went wrong. Please message @maelynnphotos on Instagram or call/text 850-661-8123.')}});
})();
