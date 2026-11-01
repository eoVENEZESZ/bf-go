// BF: GO amigos fáceis: buscar pelo nome e convidar por link
let PA='';try{PA=(new URLSearchParams(location.search).get('add')||'').slice(0,12)}catch(e){}
(function(){
 const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e};
 const row=$('fcode').parentElement,sug=el('div');sug.id='fsug';sug.style.cssText='display:flex;flex-direction:column;gap:6px';
 const share=el('button',null,'Convidar amigo por link');share.style.width='100%';
 share.onclick=async()=>{const nm=$('nick').value||'Jogador',url=location.origin+'/?add='+encodeURIComponent(nm),txt='Joga BF: GO comigo! Abre o link e a gente vira amigos:';
  try{if(navigator.share){await navigator.share({title:'BF: GO',text:txt,url});return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(txt+' '+url);$('socmsg').textContent='Link copiado! Cole no WhatsApp.'}catch(e){$('socmsg').textContent=url}};
 row.before(share);row.after(sug);
 let tm=0;$('fcode').addEventListener('input',()=>{clearTimeout(tm);const q=$('fcode').value.trim();if(q.length<2){sug.textContent='';return}tm=setTimeout(()=>ssend({t:'find',q}),250)});
 function renderSug(list){sug.textContent='';if(!list.length&&$('fcode').value.trim().length>=2){sug.append(el('div','sub','Ninguém com esse nome.'));return}
  list.forEach(n=>{const r=el('div','row'),s=el('span',null,n);s.style.cssText='flex:1;text-align:left';r.append(s);
   if(friends.some(f=>f.nick.toLowerCase()===n.toLowerCase()))r.append(el('span','sub','✓ amigo'));
   else{const b=el('button','seg alt','Adicionar');b.style.flex='0';b.onclick=()=>{ssend({t:'addfriend',nick:n});$('fcode').value='';sug.textContent=''};r.append(b)}sug.append(r)})}
 function toast(t){const d=el('div',null,t);d.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:40;background:#122428;border:2px solid #3ddc97;border-radius:12px;padding:10px 16px;font:800 15px system-ui;color:#fff';document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}
 const hk=s=>{if(!s||s._k)return;s._k=1;const om=s.onmessage;s.onmessage=e=>{try{const m=JSON.parse(e.data);
   if(m.t==='found')renderSug(m.list);
   else if(m.t==='me'&&!m.off&&PA){const n=PA;PA='';try{history.replaceState(null,'',location.pathname)}catch(x){}if(n.toLowerCase()!==(m.nick||'').toLowerCase())ssend({t:'addfriend',nick:n})}
   else if(m.t==='sinfo'&&!$('soc').classList.contains('on'))toast(m.m)}catch(x){}om&&om(e)}};
 const _c2=conn;conn=function(){_c2();hk(sws)};hk(sws);
})();
