(async function(){
  const e=MLP_esc,root=document.getElementById('qapp'),t=new URLSearchParams(location.search).get('t');
  const fail=m=>root.innerHTML=`<div class="ok"><h2>${e(m)}</h2><p>Questions? Message @maelynnphotos on Instagram or call/text 850-661-8123.</p></div>`;
  if(!t||!window.MLP_FORM_URL)return fail('This questionnaire link is not valid.');
  let q;try{q=await (await fetch(window.MLP_FORM_URL+'?a=q&t='+encodeURIComponent(t))).json()}catch(x){return fail('Could not load the questionnaire. Please try again.')}
  if(!q.ok)return fail(q.error||'This link is not valid.');
  if(q.done)return fail('You already filled this out. Thank you!');
  const fld=(f,i)=>{const n='q'+i,req=f.required?'required':'',lab=`${e(f.label)}${f.required?' *':''}`;
    if(f.type==='textarea')return `<div class="full"><label>${lab}</label><textarea name="${n}" ${req}></textarea></div>`;
    if(f.type==='select')return `<div class="full"><label>${lab}</label><select name="${n}" ${req}><option value="">Select option</option>${(f.options||[]).map(o=>`<option>${e(o)}</option>`).join('')}</select></div>`;
    if(f.type==='radio'||f.type==='checkboxes')return `<div class="full checks"><label style="text-transform:uppercase;letter-spacing:.14em;font-weight:600;font-size:12px">${lab}</label>${(f.options||[]).map(o=>`<label><input type="${f.type==='radio'?'radio':'checkbox'}" name="${n}" value="${e(o)}" ${f.type==='radio'?req:''}> ${e(o)}</label>`).join('')}</div>`;
    if(f.type==='checkbox')return `<div class="full checks"><label><input type="checkbox" name="${n}" value="yes" ${req}> ${lab}</label></div>`;
    const ty=['text','email','tel','number','date','time'].includes(f.type)?f.type:'text';return `<div class="full"><label>${lab}</label><input type="${ty}" name="${n}" ${req}></div>`};
  root.innerHTML=`<div class="center"><h5>Mae Lynn Photography</h5><h1>${e(q.title)}</h1>${q.name?`<p>Hi ${e(q.name.split(' ')[0])}!</p>`:''}<p>${e(q.intro||'').replace(/\n/g,'<br>')}</p></div>
   <form class="f" id="qf" style="margin-top:30px">${q.questions.map(fld).join('')}<div class="full"><button class="btn dark">Submit</button></div></form>`;
  document.getElementById('qf').addEventListener('submit',async ev=>{ev.preventDefault();const fd=new FormData(ev.target),a={},b=ev.target.querySelector('button');
    q.questions.forEach((f,i)=>{a[f.label]=fd.getAll('q'+i).join(', ')});b.disabled=true;b.textContent='Sending...';
    try{const r=await (await fetch(window.MLP_FORM_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'qsubmit',t,answers:a})})).json();
      if(r.ok){root.innerHTML='<div class="ok"><h1>Thank you!</h1><p>Your answers were sent to Macy. Can’t wait for your session!</p><p><a class="btn" href="index.html">Back home</a></p></div>';scrollTo(0,0)}else{b.disabled=false;b.textContent='Submit';alert(r.error||'Error')}}
    catch(x){b.disabled=false;b.textContent='Try again';alert('Could not send. Please try again.')}});
})();
