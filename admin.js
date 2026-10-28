let B=[],view='list',cm=new Date();cm.setDate(1);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=new Date().toISOString().slice(0,10);
let TOK=sessionStorage.getItem('mlp_tok')||'';
async function api(o){const r=await fetch(window.MLP_FORM_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...o,token:TOK})});const j=await r.json();if(j.error=='auth'){TOK='';sessionStorage.removeItem('mlp_tok');showPad('Session expired, enter PIN again.');throw 'auth'}if(!j.ok)alert(j.error||'Error');return j}
async function load(){const j=await api({action:'list'});B=(j.rows||[]).reverse();
 const ps=[...new Set(B.map(b=>b.package).filter(Boolean))];const fp=document.getElementById('fp'),cur=fp.value;fp.innerHTML='<option value="">All types</option>'+ps.map(p=>`<option>${esc(p)}</option>`).join('');fp.value=cur;render()}
function fmtD(d,t){if(!d)return'—';const x=new Date(d+'T12:00');return x.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})+(t?' '+fmtT(t):'')}
function fmtT(t){const[h,m]=t.split(':');return((h%12)||12)+':'+m+(h<12?' AM':' PM')}
function render(){const q=document.getElementById('q').value.toLowerCase(),fs=fs_.value,fp=document.getElementById('fp').value,fw=document.getElementById('fw').value;
 const L=B.filter(b=>(!fs||b.status==fs)&&(!fp||b.package==fp)&&(!fw||(fw=='up'?b.date>=today:b.date&&b.date<today))&&(!q||Object.values(b).join(' ').toLowerCase().includes(q)));
 document.getElementById('rows').innerHTML=L.map(b=>`<tr class="r" onclick="show(${B.indexOf(b)})"><td>${fmtD(b.date,b.time)}</td><td><b>${esc(b.name)}</b></td><td>${esc(b.package)}</td><td class="hide-m">${esc(b.email)}<br>${esc(b.phone)}</td><td class="hide-m">${esc(b.location)}</td><td><span class="pill ${b.status}">${b.status}</span></td><td class="hide-m">${esc(b.received)}</td></tr>`).join('')||'<tr><td colspan=7 style="text-align:center;padding:40px">No bookings yet.</td></tr>';
 const c=s=>B.filter(b=>b.status==s).length;document.getElementById('stats').innerHTML=[['Total',B.length],['New',c('new')],['Confirmed',c('confirmed')],['Upcoming',B.filter(b=>b.date>=today&&b.status!='cancelled').length],['Completed',c('completed')]].map(([k,v])=>`<div class="stat">${k}<b>${v}</b></div>`).join('');
 if(view=='cal')cal()}
const fs_={get value(){return document.getElementById('fs').value}};
function tab(v){view=v;document.getElementById('list').style.display=v=='list'?'':'none';document.getElementById('calv').style.display=v=='cal'?'':'none';tList.className='btn'+(v=='list'?' dark':'');tCal.className='btn'+(v=='cal'?' dark':'');render()}
function mv(d){cm.setMonth(cm.getMonth()+d);cal()}
function cal(){const y=cm.getFullYear(),m=cm.getMonth();document.getElementById('mon').textContent=cm.toLocaleDateString('en-US',{month:'long',year:'numeric'});
 const start=new Date(y,m,1-new Date(y,m,1).getDay());let h=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="h">${d}</div>`).join('');
 for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const ev=B.filter(b=>b.date==ds&&b.status!='cancelled').map(b=>`<span class="ev ${b.status}" onclick="show(${B.indexOf(b)})">${b.time?fmtT(b.time)+' ':''}${esc(b.name)}</span>`).join('');
  h+=`<div class="${d.getMonth()!=m?'o':''} ${ds==today?'today':''}"><b>${d.getDate()}</b>${ev}</div>`}
 document.getElementById('cal').innerHTML=h;
 const up=B.filter(b=>b.date>=today&&b.status!='cancelled').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 document.getElementById('upc').innerHTML=up.map(b=>`<p style="background:#fff;padding:12px 16px;border-radius:12px;cursor:pointer" onclick="show(${B.indexOf(b)})"><b>${fmtD(b.date,b.time)}</b> — ${esc(b.name)} · ${esc(b.package)} · ${esc(b.location)} <span class="pill ${b.status}">${b.status}</span></p>`).join('')||'<p>No upcoming sessions.</p>'}
const LBL={package:'Package / session type',name:'Name',email:'Email',phone:'Phone',people:'Number of people',date:'Preferred date',time:'Preferred time',alt_date:'Backup date',outfits:'Outfits',location:'Location',addons:'Add-ons',outside_tlh:'Outside Tallahassee',occasion:'Occasion',found:'Found me via',notes:'Customer notes',source:'Source'};
function closeD(){document.getElementById('dlg').style.display='none'}
function openD(h){document.getElementById('box').innerHTML=h;document.getElementById('dlg').style.display='flex'}
function show(id){const b=B[id];if(!b)return;
 const rows=Object.entries(LBL).filter(([k])=>b[k]).map(([k,l])=>`<tr><th style="width:38%">${l}</th><td>${k=='date'||k=='alt_date'?fmtD(b[k]):k=='time'?fmtT(b[k]):esc(b[k])}</td></tr>`).join('');
 openD(`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2 style="margin:0">${esc(b.name)}</h2><button class="btn" onclick="closeD()">Close</button></div>
 <p>Received ${esc(b.received)} · Source: ${esc(b.source)}</p>
 <div class="bar">${['new','confirmed','completed','cancelled'].map(s=>`<button class="btn ${b.status==s?'dark':''}" onclick="save(${B.indexOf(b)},{status:'${s}'})">${s}</button>`).join('')}</div>
 <table>${rows}</table>
 <label style="margin-top:18px">Internal notes</label><textarea id="an">${esc(b.admin_notes)}</textarea>
 <div class="bar"><button class="btn dark" onclick="save(${B.indexOf(b)},{admin_notes:document.getElementById('an').value})">Save notes</button><button class="btn" onclick="openEdit(B[${B.indexOf(b)}])">Edit</button>
 <a class="btn" href="mailto:${esc(b.email)}">Email</a>${b.phone?`<a class="btn" href="sms:${esc(b.phone)}">Text</a>`:''}<button class="btn" style="color:#b33;border-color:#b33" onclick="del(${B.indexOf(b)})">Delete</button></div>`)}
function openEdit(b){const f=['package','name','email','phone','people','date','time','alt_date','outfits','location','addons','outside_tlh','occasion','found','notes'];
 const ty={date:'date',alt_date:'date',time:'time',people:'number',email:'email'};
 openD(`<h2>${b.id?'Edit booking':'Add booking'}</h2><form id="ef" class="f">${f.map(k=>k=='notes'?`<div class="full"><label>${LBL[k]}</label><textarea name="${k}">${esc(b[k])}</textarea></div>`:`<div><label>${LBL[k]}</label><input type="${ty[k]||'text'}" name="${k}" value="${esc(b[k])}"></div>`).join('')}
 <div><label>Status</label><select name="status">${['new','confirmed','completed','cancelled'].map(s=>`<option ${b.status==s?'selected':''}>${s}</option>`).join('')}</select></div>
 <div class="full bar"><button type="submit" class="btn dark">Save</button><button type="button" class="btn" onclick="closeD()">Cancel</button></div></form>`);
 document.getElementById('ef').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(!b.id)d.source='admin';
  await api(b.id?{action:'update',id:b.id,data:d}:{action:'create',data:d});await load();closeD()}}
async function save(i,d){const id=B[i].id;await api({action:'update',id,data:d});await load();const k=B.findIndex(x=>x.id==id);if(k>=0)show(k);else closeD()}
async function del(i){const b=B[i];if(!confirm(`Delete the booking for ${b.name}? This cannot be undone.`))return;await api({action:'delete',id:b.id});closeD();load()}
function csv(){const cols=['received','status','source','package','name','email','phone','people','date','time','alt_date','outfits','location','addons','outside_tlh','occasion','found','notes','admin_notes'];
 const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const t=[cols.join(',')].concat(B.map(b=>cols.map(c=>q(b[c])).join(','))).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download='maelynn-bookings.csv';a.click()}
function logout(){TOK='';sessionStorage.removeItem('mlp_tok');showPad('')}
let pv='';const PD=document.getElementById('pd'),MS=document.getElementById('msg'),KP=document.getElementById('kp');
function drawPad(){PD.innerHTML=Array.from({length:6},(_,i)=>`<i class="${i<pv.length?'f':''}"></i>`).join('')}
function showPad(m){KP.style.display='grid';MS.textContent=m||'';pv='';drawPad()}
async function key(k){if(KP.style.display=='none')return;if(k=='⌫')pv=pv.slice(0,-1);else if(k=='C')pv='';else if(pv.length<6)pv+=k;drawPad();
 if(pv.length==6){if(!window.MLP_FORM_URL){MS.textContent='Backend not connected yet.';pv='';drawPad();return}MS.textContent='Checking...';
  try{const r=await fetch(window.MLP_FORM_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'login',pin:pv})});const j=await r.json();
   if(j.ok){TOK=j.token;sessionStorage.setItem('mlp_tok',TOK);KP.style.display='none';load()}
   else showPad(j.error=='locked'?`Too many wrong tries. Locked for ${j.minutes} min.`:j.error=='wrong'?`Wrong PIN. ${j.left} tries left.`:(j.error||'Error'))}
  catch(e){showPad('Could not reach the server.')}}}
['1','2','3','4','5','6','7','8','9','C','0','⌫'].forEach(k=>{const b=document.createElement('button');b.type='button';b.textContent=k;b.onclick=()=>key(k);document.getElementById('pad').appendChild(b)});
document.addEventListener('keydown',e=>{if(/^\d$/.test(e.key))key(e.key);if(e.key=='Backspace')key('⌫')});
if(TOK){KP.style.display='none';load().catch(()=>{})}else showPad('');
