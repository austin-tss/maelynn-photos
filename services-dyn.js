(async function(){const c=await MLP_loadConfig();const p=document.getElementById('pkgs'),a=document.getElementById('adds');
 if(p)p.innerHTML=`<h1 class="center">${MLP_esc(c.packages_heading||'Packages')}</h1>`+MLP_pkgHTML(c);if(a)a.innerHTML=MLP_addHTML(c)})();
