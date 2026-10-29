/* Mae Lynn Photos admin. All data calls go to the Apps Script backend, which re-checks the session on every call. */
const esc=MLP_esc;let PAYS=[],PAYS_SET={venmo_user:'Macy-Bower'},B=[],SENDS=[],RESP=[],QS=[],CFG=null,TW=false,TAB='bookings',cm=new Date();cm.setDate(1);
const today=(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})();
let TOK=sessionStorage.getItem('mlp_tok')||'';
async function api(o){const r=await fetch(window.MLP_FORM_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...o,token:TOK})});const j=await r.json();
 if(j.error=='auth'){TOK='';sessionStorage.removeItem('mlp_tok');showPad('Session expired, enter PIN again.');throw 'auth'}if(!j.ok&&!o.quiet)alert(j.error||'Error');return j}
async function load(){const j=await api({action:'list'});B=(j.rows||[]).reverse();SENDS=(j.sends||[]).reverse();RESP=j.responses||[];TW=j.twilio;PAYS=(j.payments||[]).reverse();if(j.pay)PAYS_SET=j.pay;
 const ps=[...new Set(B.map(b=>b.package).filter(Boolean))],fp=document.getElementById('fp'),cur=fp.value;fp.innerHTML='<option value="">All types</option>'+ps.map(p=>`<option>${esc(p)}</option>`).join('');fp.value=cur;render()}
const TABS=[['bookings','Bookings'],['calendar','Calendar'],['bookpage','Book-a-Session Page'],['quest','Questionnaires'],['texts','Texts sent'],['payments','Payments']];
function tab(t){TAB=t;document.getElementById('tabs').innerHTML=TABS.map(([k,n])=>`<button class="btn ${k==t?'on':''}" onclick="tab('${k}')">${n}</button>`).join('');
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('on',p.id=='p-'+t));
 if(t=='calendar')cal();if(t=='bookpage')bookPage();if(t=='quest')questPanel();if(t=='texts')textsPanel();if(t=='payments')payPanel()}
function fmtD(d,t){if(!d)return'—';const x=new Date(d+'T12:00');if(isNaN(x))return esc(d);return x.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})+(t?' '+fmtT(t):'')}
function fmtT(t){const m=String(t).match(/^(\d{1,2}):(\d{2})/);if(!m)return esc(t);const h=+m[1];return((h%12)||12)+':'+m[2]+(h<12?' AM':' PM')}
function render(){const q=document.getElementById('q').value.toLowerCase(),fs=document.getElementById('fs').value,fp=document.getElementById('fp').value,fw=document.getElementById('fw').value;
 const L=B.filter(b=>(!fs||b.status==fs)&&(!fp||b.package==fp)&&(!fw||(fw=='up'?b.date>=today:b.date&&b.date<today))&&(!q||Object.values(b).join(' ').toLowerCase().includes(q)));
 document.getElementById('rows').innerHTML=L.map(b=>`<tr class="r" onclick="show('${b.id}')"><td>${fmtD(b.date,b.time)}</td><td><b>${esc(b.name)}</b></td><td>${esc(b.package)}</td><td class="hide-m">${esc(b.email)}<br>${esc(b.phone)}</td><td class="hide-m">${esc(b.location)}</td><td><span class="pill ${esc(b.status)}">${esc(b.status)}</span></td><td class="hide-m">${esc(b.received)}</td></tr>`).join('')||'<tr><td colspan=7 style="text-align:center;padding:40px">No bookings yet.</td></tr>';
 const c=s=>B.filter(b=>b.status==s).length;document.getElementById('stats').innerHTML=[['Total',B.length],['New',c('new')],['Confirmed',c('confirmed')],['Upcoming',B.filter(b=>b.date>=today&&b.status!='cancelled').length],['Completed',c('completed')],['Questionnaires out',SENDS.filter(s=>s.status!='completed'&&s.status!='failed').length]].map(([k,v])=>`<div class="stat">${k}<b>${v}</b></div>`).join('');
 if(TAB=='calendar')cal()}
function mv(d){cm.setMonth(cm.getMonth()+d);cal()}
function cal(){const y=cm.getFullYear(),m=cm.getMonth();document.getElementById('mon').textContent=cm.toLocaleDateString('en-US',{month:'long',year:'numeric'});
 const start=new Date(y,m,1-new Date(y,m,1).getDay());let h=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="h">${d}</div>`).join('');
 for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const ev=B.filter(b=>b.date==ds&&b.status!='cancelled').map(b=>`<span class="ev ${esc(b.status)}" onclick="show('${b.id}')">${b.time?fmtT(b.time)+' ':''}${esc(b.name)}</span>`).join('');
  h+=`<div class="${d.getMonth()!=m?'o':''} ${ds==today?'today':''}"><b>${d.getDate()}</b>${ev}</div>`}
 document.getElementById('cal').innerHTML=h;
 const up=B.filter(b=>b.date>=today&&b.status!='cancelled').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 document.getElementById('upc').innerHTML=up.map(b=>`<p class="cardx" style="cursor:pointer" onclick="show('${b.id}')"><b>${fmtD(b.date,b.time)}</b> — ${esc(b.name)} · ${esc(b.package)} · ${esc(b.location)} <span class="pill ${esc(b.status)}">${esc(b.status)}</span></p>`).join('')||'<p>No upcoming sessions.</p>'}
const LBL={package:'Package / session type',name:'Name',email:'Email',phone:'Phone',people:'Number of people',date:'Preferred date',time:'Preferred time',alt_date:'Backup date',outfits:'Outfits',location:'Location',addons:'Add-ons',outside_tlh:'Outside Tallahassee',occasion:'Occasion',found:'Found me via',notes:'Customer notes',source:'Source'};
function closeD(){document.getElementById('dlg').style.display='none'}
function openD(h){document.getElementById('box').innerHTML=h;document.getElementById('dlg').style.display='flex'}
const byId=id=>B.find(x=>x.id==id);
function sendStatus(s){const tw=s.twilio_status?` · text ${esc(s.twilio_status)}`:'';return `<span class="pill ${s.status=='completed'?'completed':s.status=='failed'?'cancelled':s.status=='opened'?'confirmed':'new'}">${esc(s.status)}</span>${tw}`}
function show(id){const b=byId(id);if(!b)return;let extra={};try{extra=JSON.parse(b.answers||'{}')}catch(e){}
 const rows=Object.entries(LBL).filter(([k])=>b[k]).map(([k,l])=>`<tr><th style="width:38%">${l}</th><td>${k=='date'||k=='alt_date'?fmtD(b[k]):k=='time'?fmtT(b[k]):esc(b[k])}</td></tr>`).join('');
 const known=new Set(Object.values(LBL).concat(['Package','Add-ons','source']));const ex=Object.entries(extra).filter(([k,v])=>v&&!known.has(k)&&!(k in LBL));
 const ss=SENDS.filter(s=>s.booking_id==id),rs=RESP.filter(r=>r.booking_id==id);
 openD(`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2 style="margin:0">${esc(b.name)}</h2><button class="btn" onclick="closeD()">Close</button></div>
 <p>Received ${esc(b.received)} · Source: ${esc(b.source)}</p>
 <div class="bar">${['new','confirmed','completed','cancelled'].map(s=>`<button class="btn ${b.status==s?'dark':''}" onclick="save('${id}',{status:'${s}'})">${s}</button>`).join('')}</div>
 <table>${rows}${ex.map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
 <label style="margin-top:18px">Internal notes</label><textarea id="an">${esc(b.admin_notes)}</textarea>
 <div class="bar"><button class="btn dark" onclick="save('${id}',{admin_notes:document.getElementById('an').value})">Save notes</button><button class="btn" onclick="openEdit(byId('${id}'))">Edit</button>
 ${b.email?`<a class="btn" href="mailto:${esc(b.email)}">Email</a>`:''}${b.phone?`<a class="btn" href="sms:${esc(b.phone)}">Text</a>`:''}<button class="btn" style="color:#b33;border-color:#b33" onclick="del('${id}')">Delete</button></div>
 <h3 style="margin-top:22px">Questionnaires</h3>
 ${ss.map(s=>`<div class="cardx" style="background:var(--soft)"><b>${esc(s.q_title)}</b> → ${esc(s.phone)} · sent ${esc(s.sent_at)} ${sendStatus(s)}${s.error?`<br><small style="color:#b33">${esc(s.error)}</small>`:''}</div>`).join('')||'<p>None sent yet.</p>'}
 ${rs.map(r=>{let a={};try{a=JSON.parse(r.answers_json)}catch(e){}return `<div class="cardx" style="border:1px solid var(--line)"><h4 style="margin:0">${esc(r.q_title)} — answers</h4><small>Submitted ${esc(r.submitted_at)}</small><table>${Object.entries(a).map(([k,v])=>`<tr><th style="width:42%">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table></div>`}).join('')}
 <button class="btn dark" onclick="sendDlg('${id}')">Text a questionnaire</button>
 <h3 style="margin-top:22px">Payments</h3>${PAYS.filter(p=>p.booking_id==id).map(payLine).join('')||'<p>No payment requests yet.</p>'}
 <button class="btn dark" onclick="payDlg('${id}')">Request payment (Venmo)</button>`)}
function openEdit(b){const f=['package','name','email','phone','people','date','time','alt_date','outfits','location','addons','outside_tlh','occasion','found','notes'];
 const ty={date:'date',alt_date:'date',time:'time',people:'number',email:'email'};
 openD(`<h2>${b.id?'Edit booking':'Add booking'}</h2><form id="ef" class="f">${f.map(k=>k=='notes'?`<div class="full"><label>${LBL[k]}</label><textarea name="${k}">${esc(b[k])}</textarea></div>`:`<div><label>${LBL[k]}</label><input type="${ty[k]||'text'}" name="${k}" value="${esc(b[k])}"></div>`).join('')}
 <div><label>Status</label><select name="status">${['new','confirmed','completed','cancelled'].map(s=>`<option ${b.status==s?'selected':''}>${s}</option>`).join('')}</select></div>
 <div class="full bar"><button type="submit" class="btn dark">Save</button><button type="button" class="btn" onclick="closeD()">Cancel</button></div></form>`);
 document.getElementById('ef').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
  const j=await api(b.id?{action:'update',id:b.id,data:d}:{action:'create',data:d});if(j.ok){await load();show(b.id||j.id)}}}
async function save(id,d){const j=await api({action:'update',id,data:d});if(j.ok){await load();show(id)}}
async function del(id){const b=byId(id);if(!confirm(`Delete the booking for ${b.name}? This cannot be undone.`))return;const j=await api({action:'delete',id});if(j.ok){closeD();load()}}
function csv(){const cols=['received','status','source','package','name','email','phone','people','date','time','alt_date','outfits','location','addons','outside_tlh','occasion','found','notes','admin_notes','answers'];
 const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const t=[cols.join(',')].concat(B.map(b=>cols.map(c=>q(b[c])).join(','))).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download='maelynn-bookings.csv';a.click()}
/* ---------- Book-a-Session customizer ---------- */
const FTYPES=['text','email','tel','number','date','time','textarea','select','radio','checkboxes','checkbox'];
let PHOTOS=[],PICK=null,DIRTY=false;
async function bookPage(){const P=document.getElementById('p-bookpage');if(!CFG){P.innerHTML='<p>Loading…</p>';const j=await api({action:'getConfig'});
 CFG=(j.ok&&j.config&&j.config.packages)?j.config:await (await fetch('config-default.json',{cache:'no-cache'})).json();loadPhotos()}drawBP()}
function setv(path,v){let o=CFG;const k=path.split('.');k.slice(0,-1).forEach(x=>o=o[x]);o[k[k.length-1]]=v;DIRTY=true;document.getElementById('dirty').textContent='Unsaved changes'}
const inp=(path,v,ph='')=>`<input value="${esc(v)}" placeholder="${esc(ph)}" oninput="setv('${path}',this.value)">`;
const ta=(path,v,rows=3)=>`<textarea rows="${rows}" oninput="setv('${path}',this.value)">${esc(v)}</textarea>`;
function mvItem(list,i,d){const a=CFG[list],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];DIRTY=true;drawBP()}
function rmItem(list,i){if(!confirm('Remove this item?'))return;CFG[list].splice(i,1);DIRTY=true;drawBP()}
const ctr=(list,i)=>`<span style="flex:0 0 auto"><button type="button" class="btn mini" onclick="mvItem('${list}',${i},-1)">↑</button> <button type="button" class="btn mini" onclick="mvItem('${list}',${i},1)">↓</button> <button type="button" class="btn mini" style="color:#b33;border-color:#b33" onclick="rmItem('${list}',${i})">✕</button></span>`;
function drawBP(){const c=CFG,P=document.getElementById('p-bookpage');
 P.innerHTML=`<div class="row" style="position:sticky;top:0;z-index:5;background:var(--soft);padding:10px 0"><h2 style="margin:0">Book-a-Session page</h2><span id="dirty" style="color:var(--pink)">${DIRTY?'Unsaved changes':''}</span>
 <span style="flex:0 0 auto"><a class="btn" href="book.html" target="_blank">Preview</a> <button class="btn" onclick="resetCfg()">Reset to original</button> <button class="btn dark" onclick="saveCfg()">Save & publish</button></span></div>
 <div class="cardx ed"><h3>Page text</h3><div class="row"><div><label>Small heading</label>${inp('eyebrow',c.eyebrow)}</div><div><label>Main heading</label>${inp('heading',c.heading)}</div></div>
 <label>Intro text</label>${ta('intro',c.intro)}<div class="row"><div><label>Packages heading (Services page)</label>${inp('packages_heading',c.packages_heading)}</div><div><label>Add-ons heading</label>${inp('addons_heading',c.addons_heading)}</div></div>
 <label>Add-on note</label>${inp('addon_note',c.addon_note)}<div class="row"><div><label>Submit button</label>${inp('submit_label',c.submit_label)}</div><div><label>Thank-you heading</label>${inp('success_title',c.success_title)}</div></div><label>Thank-you message</label>${ta('success_text',c.success_text)}</div>
 <div class="cardx ed"><h3>Packages</h3>${(c.packages||[]).map((p,i)=>`<div class="cardx" style="background:var(--soft)"><div class="row"><b>${i+1}. ${esc(p.name)}</b>${ctr('packages',i)}</div>
  <div class="row"><div style="flex:0 0 120px">${p.image?`<img src="${esc(p.image)}" style="width:120px;aspect-ratio:4/5;object-fit:cover;border-radius:12px">`:'<div style="width:120px;aspect-ratio:4/5;background:#fff;border-radius:12px"></div>'}<button type="button" class="btn mini" style="margin-top:6px;width:120px" onclick="pickPhoto('packages.${i}.image')">Change photo</button></div>
  <div><div class="row"><div><label>Category</label>${inp(`packages.${i}.category`,p.category)}</div><div><label>Name</label>${inp(`packages.${i}.name`,p.name)}</div><div style="max-width:140px"><label>Price</label>${inp(`packages.${i}.price`,p.price,'$0.00')}</div></div>
  <label>Description</label>${ta(`packages.${i}.description`,p.description,2)}<label>What's included (one per line)</label><textarea rows="6" oninput="setv('packages.${i}.items',this.value.split('\\n').filter(x=>x.trim()))">${esc((p.items||[]).join('\n'))}</textarea></div></div></div>`).join('')}
  <button class="btn" onclick="CFG.packages.push({id:'pkg-'+Date.now().toString(36),category:'',name:'New package',price:'',description:'It includes:',items:[],image:''});DIRTY=true;drawBP()">+ Add package</button></div>
 <div class="cardx ed"><h3>Add-ons</h3>${(c.addons||[]).map((a,i)=>`<div class="row"><div>${inp(`addons.${i}.name`,a.name,'Name')}</div><div style="max-width:160px">${inp(`addons.${i}.price`,a.price,'Price')}</div>${ctr('addons',i)}</div>`).join('')}
  <button class="btn" onclick="CFG.addons.push({id:'add-'+Date.now().toString(36),name:'',price:''});DIRTY=true;drawBP()">+ Add add-on</button></div>
 <div class="cardx ed"><h3>Form questions</h3><p style="margin-top:0">The package picker and add-ons always show. Name plus email or phone are needed so you can reach the customer.</p>
  ${(c.fields||[]).map((f,i)=>`<div class="cardx" style="background:var(--soft);padding:12px 14px"><div class="row"><div style="flex:2">${inp(`fields.${i}.label`,f.label,'Question')}</div>
  <div><select onchange="setv('fields.${i}.type',this.value);drawBP()">${FTYPES.map(t=>`<option ${f.type==t?'selected':''}>${t}</option>`).join('')}</select></div>
  <label style="flex:0 0 auto;margin:0;display:flex;gap:6px;align-items:center;text-transform:none;letter-spacing:0"><input type="checkbox" style="width:auto;margin:0" ${f.required?'checked':''} onchange="setv('fields.${i}.required',this.checked)"> Required</label>${ctr('fields',i)}</div>
  ${['select','radio','checkboxes'].includes(f.type)?`<label>Options (one per line)</label><textarea rows="3" oninput="setv('fields.${i}.options',this.value.split('\\n').filter(x=>x.trim()))">${esc((f.options||[]).join('\n'))}</textarea>`:''}
  ${['text','email','tel','number','textarea'].includes(f.type)?inp(`fields.${i}.placeholder`,f.placeholder||'','Placeholder (optional)'):''}</div>`).join('')}
  <button class="btn" onclick="CFG.fields.push({id:'f_'+Date.now().toString(36),label:'New question',type:'text',required:false,options:[],placeholder:''});DIRTY=true;drawBP()">+ Add question</button></div>
 <div class="cardx"><h3>Photos</h3><p style="margin-top:0">Uploads go to the "Mae Lynn Photos Site/Photos" Drive folder and are public by link.</p>
  <input type="file" accept="image/*" multiple onchange="upload(this.files)"><p id="upmsg"></p><div class="thumbs" id="thumbs"></div></div>`;
 drawThumbs()}
async function saveCfg(){const c=CFG;if(!(c.fields||[]).some(f=>f.id=='name'))if(!confirm('There is no "name" question (id name). Save anyway?'))return;
 const j=await api({action:'saveConfig',config:c});if(j.ok){CFG=j.config;DIRTY=false;drawBP();alert('Saved. The Book-a-Session and Services pages now use these changes.')}}
async function resetCfg(){if(!confirm('Load the original Pixieset content? (Not saved until you click Save & publish.)'))return;CFG=await (await fetch('config-default.json',{cache:'no-cache'})).json();DIRTY=true;drawBP()}
async function loadPhotos(){const j=await api({action:'listPhotos',quiet:true});PHOTOS=j.photos||[];drawThumbs()}
function drawThumbs(){const t=document.getElementById('thumbs');if(!t)return;const site=['hero1','hero2','hero3','family','graduates','couples','testi1','testi2','testi3','macy','cta1','cta2','cta3'].map(n=>({url:'static/img/'+n+'.jpg',name:n,site:1}));
 t.innerHTML=PHOTOS.concat(site).map(p=>`<div><img src="${esc(p.url)}" title="${esc(p.name)}" onclick="usePhoto('${esc(p.url)}')">${p.site?'':`<button class="btn mini" style="width:100%;margin-top:4px" onclick="delPhoto('${p.id}')">Delete</button>`}</div>`).join('')}
function pickPhoto(path){PICK=path;openD(`<h3>Pick a photo</h3><p>Click a photo, or upload a new one.</p><input type="file" accept="image/*" onchange="upload(this.files,true)"><p id="upmsg2"></p><div class="thumbs" id="thumbs"></div><button class="btn" style="margin-top:14px" onclick="PICK=null;closeD();drawBP()">Cancel</button>`);drawThumbs()}
function usePhoto(url){if(PICK){setv(PICK,url);PICK=null;closeD();drawBP()}else{navigator.clipboard&&navigator.clipboard.writeText(url);alert('Photo link copied.')}}
function shrink(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,2000/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.86))};im.onerror=rej;im.src=r.result};r.onerror=rej;r.readAsDataURL(file)})}
async function upload(files,andPick){const m=document.getElementById(andPick?'upmsg2':'upmsg');let last=null;for(const f of files){m.textContent='Uploading '+f.name+'…';const j=await api({action:'uploadPhoto',name:f.name,data:await shrink(f)});if(j.ok){last=j.url;PHOTOS.unshift({id:j.id,url:j.url,name:f.name})}}
 m.textContent='Uploaded.';drawThumbs();if(andPick&&last)usePhoto(last)}
async function delPhoto(id){if(!confirm('Delete this photo from Drive? Pages using it will show a broken image.'))return;const j=await api({action:'deletePhoto',id});if(j.ok){PHOTOS=PHOTOS.filter(p=>p.id!=id);drawThumbs()}}
/* ---------- Questionnaires ---------- */
let QE=null;
async function loadQs(){const j=await api({action:'listQ'});QS=j.questionnaires||[];return QS}
async function questPanel(){const P=document.getElementById('p-quest');P.innerHTML='<p>Loading…</p>';await loadQs();drawQ()}
function drawQ(){const P=document.getElementById('p-quest');
 if(QE){P.innerHTML=`<div class="cardx ed"><div class="row"><h2 style="margin:0">${QE.id?'Edit':'New'} questionnaire</h2><span style="flex:0 0 auto"><button class="btn" onclick="QE=null;drawQ()">Cancel</button> <button class="btn dark" onclick="saveQ()">Save</button></span></div>
  <label>Title</label><input value="${esc(QE.title)}" oninput="QE.title=this.value"><label>Intro (shown at the top)</label><textarea rows="3" oninput="QE.intro=this.value">${esc(QE.intro)}</textarea>
  <h3>Questions</h3>${QE.questions.map((f,i)=>`<div class="cardx" style="background:var(--soft);padding:12px 14px"><div class="row"><div style="flex:2"><input value="${esc(f.label)}" placeholder="Question" oninput="QE.questions[${i}].label=this.value"></div>
   <div><select onchange="QE.questions[${i}].type=this.value;drawQ()">${FTYPES.map(t=>`<option ${f.type==t?'selected':''}>${t}</option>`).join('')}</select></div>
   <label style="flex:0 0 auto;margin:0;display:flex;gap:6px;align-items:center;text-transform:none;letter-spacing:0"><input type="checkbox" style="width:auto;margin:0" ${f.required?'checked':''} onchange="QE.questions[${i}].required=this.checked"> Required</label>
   <span style="flex:0 0 auto"><button class="btn mini" onclick="qmv(${i},-1)">↑</button> <button class="btn mini" onclick="qmv(${i},1)">↓</button> <button class="btn mini" style="color:#b33;border-color:#b33" onclick="QE.questions.splice(${i},1);drawQ()">✕</button></span></div>
   ${['select','radio','checkboxes'].includes(f.type)?`<label>Options (one per line)</label><textarea rows="3" oninput="QE.questions[${i}].options=this.value.split('\\n').filter(x=>x.trim())">${esc((f.options||[]).join('\n'))}</textarea>`:''}</div>`).join('')}
  <button class="btn" onclick="QE.questions.push({label:'',type:'text',required:false,options:[]});drawQ()">+ Add question</button></div>`;return}
 P.innerHTML=`<div class="row"><h2 style="margin:0">Questionnaires</h2><span style="flex:0 0 auto"><button class="btn" onclick="sendDlg('')">Text one to a phone number</button> <button class="btn dark" onclick="QE={title:'',intro:'',questions:[{label:'',type:'text',required:false,options:[]}]};drawQ()">+ New questionnaire</button></span></div>
 ${TW?'':'<p class="notice">Texting is not set up yet: add TWILIO_SID, TWILIO_TOKEN and TWILIO_FROM in the Apps Script Script Properties. Sends will be logged with a link you can copy.</p>'}
 ${QS.map(q=>{const s=SENDS.filter(x=>x.qid==q.id);return `<div class="cardx"><div class="row"><div><h3 style="margin:0">${esc(q.title)}</h3><small>${q.questions.length} questions · updated ${esc(q.updated)} · sent ${s.length} · completed ${s.filter(x=>x.status=='completed').length}</small></div>
  <span style="flex:0 0 auto"><button class="btn" onclick="sendDlg('',${JSON.stringify(q.id).replace(/"/g,'&quot;')})">Send</button> <button class="btn" onclick="QE=JSON.parse(JSON.stringify(QS.find(x=>x.id=='${q.id}')));drawQ()">Edit</button> <button class="btn" style="color:#b33;border-color:#b33" onclick="delQ('${q.id}')">Delete</button></span></div></div>`}).join('')||'<p>No questionnaires yet. Create one to send to customers.</p>'}`}
function qmv(i,d){const a=QE.questions,j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];drawQ()}
async function saveQ(){if(!QE.title.trim())return alert('Give it a title.');QE.questions=QE.questions.filter(q=>q.label.trim());if(!QE.questions.length)return alert('Add at least one question.');
 const j=await api({action:'saveQ',q:QE});if(j.ok){QE=null;await loadQs();drawQ()}}
async function delQ(id){if(!confirm('Delete this questionnaire? Already-sent links will stop working.'))return;const j=await api({action:'deleteQ',id});if(j.ok){await loadQs();drawQ()}}
async function sendDlg(bid,qid){if(!QS.length)await loadQs();if(!QS.length){alert('Create a questionnaire first (Questionnaires tab).');return}const b=bid?byId(bid):null;
 openD(`<h2>Text a questionnaire</h2>${b?`<p>To <b>${esc(b.name)}</b> (booking)</p>`:''}<form id="sf" class="f"><div class="full"><label>Questionnaire</label><select name="qid">${QS.map(q=>`<option value="${q.id}" ${q.id==qid?'selected':''}>${esc(q.title)}</option>`).join('')}</select></div>
 <div><label>Name</label><input name="name" value="${esc(b?b.name:'')}"></div><div><label>Mobile number *</label><input name="phone" type="tel" required value="${esc(b?b.phone:'')}"></div>
 <div class="full"><label>Message (link is added at the end; leave blank for the default)</label><textarea name="message" rows="3" placeholder="Hi! This is Macy with Mae Lynn Photography. Please fill out your questionnaire before our session:"></textarea></div>
 <div class="full bar"><button class="btn dark">Send text</button><button type="button" class="btn" onclick="${bid?`show('${bid}')`:'closeD()'}">Cancel</button></div><p id="sm" class="full"></p></form>`);
 document.getElementById('sf').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),btn=e.target.querySelector('button');btn.disabled=true;btn.textContent='Sending…';
  const j=await api({action:'sendQ',bookingId:bid,...d,quiet:true});await load();
  document.getElementById('sm').innerHTML=j.ok?`<b style="color:#2e7a3c">Sent!</b> Link: <a href="${esc(j.link)}" target="_blank">${esc(j.link)}</a>`:`<b style="color:#b33">${esc(j.error||'Not sent')}</b>${j.link?`<br>You can share this link yourself: <a href="${esc(j.link)}" target="_blank">${esc(j.link)}</a>`:''}`;btn.disabled=false;btn.textContent='Send another'}}
async function textsPanel(){const P=document.getElementById('p-texts');
 P.innerHTML=`<div class="row"><h2 style="margin:0">Questionnaire texts</h2><span style="flex:0 0 auto"><button class="btn" onclick="refreshSends()">Refresh delivery status</button></span></div>
 <div style="overflow:auto;margin-top:14px"><table><thead><tr><th>Sent</th><th>To</th><th>Questionnaire</th><th>Status</th><th class="hide-m">Opened</th><th class="hide-m">Completed</th><th>Link</th></tr></thead><tbody>
 ${SENDS.map(s=>`<tr ${s.booking_id?`class="r" onclick="show('${s.booking_id}')"`:''}><td>${esc(s.sent_at)}</td><td>${esc(s.name)}<br><small>${esc(s.phone)}</small></td><td>${esc(s.q_title)}</td><td>${sendStatus(s)}${s.error?`<br><small style="color:#b33">${esc(s.error)}</small>`:''}</td><td class="hide-m">${esc(s.opened_at)}</td><td class="hide-m">${esc(s.completed_at)}</td>
 <td><button class="btn mini" onclick="event.stopPropagation();navigator.clipboard.writeText(location.href.replace(/admin\\.html.*$/,'')+'questionnaire.html?t=${esc(s.token)}');this.textContent='Copied'">Copy</button></td></tr>`).join('')||'<tr><td colspan=7 style="text-align:center;padding:30px">No texts sent yet.</td></tr>'}</tbody></table></div>`}
async function refreshSends(){const j=await api({action:'refreshSends'});if(j.ok){SENDS=(j.sends||[]).reverse();textsPanel()}}
/* ---------- PIN keypad ---------- */
function logout(){api({action:'logout',quiet:true}).catch(()=>{});TOK='';sessionStorage.removeItem('mlp_tok');showPad('')}
let pv='';const PD=document.getElementById('pd'),MS=document.getElementById('msg'),KP=document.getElementById('kp');
function drawPad(){PD.innerHTML=Array.from({length:4},(_,i)=>`<i class="${i<pv.length?'f':''}"></i>`).join('')}
function showPad(m){KP.style.display='grid';MS.textContent=m||'';pv='';drawPad()}
async function start(){KP.style.display='none';tab(TAB);await load()}
async function key(k){if(KP.style.display=='none')return;if(k=='⌫')pv=pv.slice(0,-1);else if(k=='C')pv='';else if(pv.length<4)pv+=k;drawPad();
 if(pv.length==4){if(!window.MLP_FORM_URL){showPad('Backend not connected yet.');return}MS.textContent='Checking…';
  try{const r=await fetch(window.MLP_FORM_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'login',pin:pv})});const j=await r.json();
   if(j.ok){TOK=j.token;sessionStorage.setItem('mlp_tok',TOK);start()}
   else showPad(j.error=='locked'?`Too many wrong tries. Locked for ${j.minutes} min.`:j.error=='wrong'?`Wrong PIN. ${j.left} tries left.`:(j.error||'Error'))}
  catch(e){showPad('Could not reach the server.')}}}
['1','2','3','4','5','6','7','8','9','C','0','⌫'].forEach(k=>{const b=document.createElement('button');b.type='button';b.textContent=k;b.onclick=()=>key(k);document.getElementById('pad').appendChild(b)});
document.addEventListener('keydown',e=>{if(KP.style.display=='none')return;if(/^\d$/.test(e.key))key(e.key);if(e.key=='Backspace')key('⌫')});
window.addEventListener('beforeunload',e=>{if(DIRTY){e.preventDefault();e.returnValue=''}});
if(TOK)start().catch(()=>{});else showPad('');
/* ---------- Payments (Venmo requests) ---------- */
const num=v=>{const n=parseFloat(String(v||'').replace(/[^\d.]/g,''));return isFinite(n)?n:0};
const money=n=>'$'+(+n||0).toFixed(2);
function venmoLink(amt,note){const u=encodeURIComponent(PAYS_SET.venmo_user||'Macy-Bower');return `https://venmo.com/${u}?txn=pay&amount=${(+amt).toFixed(2)}&note=${encodeURIComponent(note)}`}
function payLine(p){return `<div class="cardx" style="background:var(--soft)"><div class="row"><div><b>${money(p.amount)}</b> · ${esc(p.note)} · ${esc(p.channel)} · ${esc(p.requested_at)}
 <span class="pill ${p.status=='paid'?'completed':p.status=='cancelled'?'cancelled':'confirmed'}">${esc(p.status)}</span>${p.paid_at?` <small>paid ${esc(p.paid_at)}</small>`:''}
 ${[p.sms_status&&('text: '+p.sms_status),p.email_status&&('email: '+p.email_status)].filter(Boolean).map(x=>`<br><small style="color:${/fail/.test(x)?'#b33':'inherit'}">${esc(x)}</small>`).join('')}</div>
 <span style="flex:0 0 auto">${p.status!='paid'?`<button class="btn mini" onclick="payStatus('${p.id}','paid')">Mark paid</button>`:`<button class="btn mini" onclick="payStatus('${p.id}','requested')">Unmark</button>`}
 ${p.status!='cancelled'?`<button class="btn mini" onclick="payStatus('${p.id}','cancelled')">Cancel</button>`:''} <button class="btn mini" onclick="navigator.clipboard.writeText('${esc(p.link)}');this.textContent='Copied'">Copy link</button></span></div></div>`}
async function payStatus(id,status){const j=await api({action:'payUpdate',id,status});if(j.ok){await load();if(document.getElementById('dlg').style.display=='flex'){const p=PAYS.find(x=>x.id==id);if(p&&p.booking_id)show(p.booking_id)}if(TAB=='payments')payPanel()}}
async function suggest(b){if(!b)return {amt:'',note:'Deposit'};const c=CFG||await MLP_loadConfig();const pk=(c.packages||[]).find(p=>p.name==b.package);
 let t=pk?num(pk.price):0;(String(b.addons||'').match(/\$\s?[\d,.]+/g)||[]).forEach(x=>t+=num(x));
 const paid=PAYS.filter(p=>p.booking_id==b.id&&p.status=='paid').reduce((s,p)=>s+num(p.amount),0);
 return {total:t,paid,amt:t?(t-paid).toFixed(2):'',note:(paid?'Balance':'Payment')+(b.package?' - '+b.package:'')}}
async function payDlg(bid){const b=bid?byId(bid):null,sg=await suggest(b),S=PAYS_SET;
 openD(`<h2>Request payment (Venmo @${esc(S.venmo_user)})</h2>${b?`<p>For <b>${esc(b.name)}</b> · ${esc(b.package)}${sg.total?` · package + add-ons ${money(sg.total)}, paid so far ${money(sg.paid)}`:''}</p>`:''}
 <form id="pf" class="f"><div><label>Amount *</label><input name="amount" required inputmode="decimal" value="${esc(sg.amt)}"></div>
 <div><label>Note</label><input name="note" value="${esc(sg.note)}" list="notes"><datalist id="notes"><option>Deposit${b&&b.package?' - '+esc(b.package):''}</option><option>Balance${b&&b.package?' - '+esc(b.package):''}</option><option>Payment</option></datalist></div>
 ${sg.total?`<div class="full row" style="gap:6px"><span style="flex:0 0 auto">Quick fill:</span><button type="button" class="btn mini" onclick="pf.amount.value='${(sg.total/2).toFixed(2)}';pf.note.value='Deposit - ${esc(b.package).replace(/'/g,'')}'">50% deposit</button><button type="button" class="btn mini" onclick="pf.amount.value='${(sg.total-sg.paid).toFixed(2)}';pf.note.value='Balance - ${esc(b.package).replace(/'/g,'')}'">Remaining balance</button><button type="button" class="btn mini" onclick="pf.amount.value='${sg.total.toFixed(2)}';pf.note.value='Payment - ${esc(b.package).replace(/'/g,'')}'">Full amount</button></div>`:''}
 <div><label>Name</label><input name="name" value="${esc(b?b.name:'')}"></div><div><label>Phone</label><input name="phone" type="tel" value="${esc(b?b.phone:'')}"></div>
 <div class="full"><label>Email</label><input name="email" type="email" value="${esc(b?b.email:'')}"></div>
 <div class="full checks"><label><input type="checkbox" name="sms" ${b&&b.phone?'checked':''}> Send by text${TW?'':' (Twilio not set up yet)'}</label><label><input type="checkbox" name="em" ${b&&b.email?'checked':''}> Send by email (from your Gmail)</label></div>
 <div class="full"><small>Link preview: <a id="lp" target="_blank"></a></small></div>
 <div class="full bar"><button class="btn dark">Send request</button><button type="button" class="btn" onclick="${bid?`show('${bid}')`:'closeD()'}">Cancel</button></div><p id="pm" class="full"></p></form>`);
 const f=document.getElementById('pf');window.pf=f;const lp=()=>{const l=venmoLink(num(f.amount.value),f.note.value);const a=document.getElementById('lp');a.href=l;a.textContent=l};f.oninput=lp;lp();
 f.querySelectorAll('.btn.mini').forEach(x=>x.addEventListener('click',lp));
 f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f)),btn=f.querySelector('button.dark');if(!d.sms&&!d.em)return alert('Pick text and/or email.');
  btn.disabled=true;btn.textContent='Sending…';const j=await api({action:'payRequest',bookingId:bid,amount:d.amount,note:d.note,name:d.name,phone:d.phone,email:d.email,sendSms:!!d.sms,sendEmail:!!d.em,quiet:true});
  await load();document.getElementById('pm').innerHTML=j.ok?`<b style="color:#2e7a3c">Request sent.</b> ${[j.sms_status&&'Text: '+esc(j.sms_status),j.email_status&&'Email: '+esc(j.email_status)].filter(Boolean).join(' · ')}`:`<b style="color:#b33">${esc(j.error||'Not sent')}</b>`;
  btn.disabled=false;btn.textContent='Send another';if(TAB=='payments')payPanel()}}
function payPanel(){const P=document.getElementById('p-payments'),S=PAYS_SET,act=PAYS.filter(p=>p.status!='cancelled');
 const tot=s=>act.filter(p=>!s||p.status==s).reduce((a,p)=>a+num(p.amount),0);
 P.innerHTML=`<div class="row"><h2 style="margin:0">Payments</h2><span style="flex:0 0 auto"><button class="btn dark" onclick="payDlg('')">+ New payment request</button></span></div>
 <div class="stats" style="margin:14px 0">${[['Requested (total)',money(tot())],['Paid',money(tot('paid'))],['Outstanding',money(tot('requested'))],['Requests',act.length]].map(([k,v])=>`<div class="stat">${k}<b>${v}</b></div>`).join('')}</div>
 <div style="overflow:auto"><table><thead><tr><th>Requested</th><th>Customer</th><th>Amount</th><th>Note</th><th class="hide-m">Sent by</th><th>Status</th><th></th></tr></thead><tbody>
 ${PAYS.map(p=>`<tr ${p.booking_id?`class="r" onclick="show('${p.booking_id}')"`:''}><td>${esc(p.requested_at)}</td><td>${esc(p.name)}<br><small>${esc(p.phone||p.email)}</small></td><td><b>${money(p.amount)}</b></td><td>${esc(p.note)}</td>
 <td class="hide-m">${esc(p.channel)}${/fail/.test(p.sms_status+p.email_status)?'<br><small style="color:#b33">'+esc([p.sms_status,p.email_status].filter(Boolean).join('; '))+'</small>':''}</td><td><span class="pill ${p.status=='paid'?'completed':p.status=='cancelled'?'cancelled':'confirmed'}">${esc(p.status)}</span></td>
 <td onclick="event.stopPropagation()">${p.status!='paid'?`<button class="btn mini" onclick="payStatus('${p.id}','paid')">Paid</button>`:`<button class="btn mini" onclick="payStatus('${p.id}','requested')">Unmark</button>`}</td></tr>`).join('')||'<tr><td colspan=7 style="text-align:center;padding:30px">No payment requests yet.</td></tr>'}</tbody></table></div>
 <div class="cardx ed" style="margin-top:20px"><h3>Venmo & message settings</h3><p style="margin-top:0">Placeholders: {first} {name} {amount} {note} {link} {link2} {venmo}</p>
 <label>Venmo username</label><input id="vu" value="${esc(S.venmo_user)}"><label>Text message</label><textarea id="vs" rows="3">${esc(S.pay_sms_template)}</textarea>
 <label>Email subject</label><input id="ves" value="${esc(S.pay_email_subject)}"><label>Email message</label><textarea id="vb" rows="7">${esc(S.pay_email_template)}</textarea>
 <button class="btn dark" onclick="savePay()">Save settings</button></div>`}
async function savePay(){const j=await api({action:'savePaySettings',settings:{venmo_user:vu.value,pay_sms_template:vs.value,pay_email_subject:ves.value,pay_email_template:vb.value}});if(j.ok){PAYS_SET=j.pay;CFG=null;alert('Saved.');payPanel()}}
