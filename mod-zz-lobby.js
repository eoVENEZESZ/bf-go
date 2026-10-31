// BF: GO lobby estilo battle royale: login só com nome, perfil, missões, esquadrão e amigos pelo nome
let LOGGED=false,PROF=null,EMC=0,pendingNick='';
try{PROF=JSON.parse(localStorage.getItem('bf_prof')||'null')}catch(e){}
const savedName=(()=>{try{return localStorage.getItem('bf_name')||''}catch(e){return ''}})();
if(savedName){LOGGED=true;$('nick').value=savedName}
(function(){
 const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e};
 const st=el('style');st.textContent=
 '#nick{display:none}#lobby{padding:0!important;overflow:hidden;background:radial-gradient(circle at 50% 110%,#7a32c0 0,#2a0f4a 45%,#07040d 85%)}'+
 '#ff{position:absolute;inset:0;color:#fff}#ff>*{position:absolute}'+
 '#fp{top:calc(env(safe-area-inset-top,0px) + 10px);left:12px;width:200px;text-align:left}'+
 '#fev{top:calc(env(safe-area-inset-top,0px) + 12px);left:50%;transform:translateX(-50%);background:linear-gradient(120deg,#ff6a2b,#b02a6e)!important;white-space:nowrap}'+
 '#ftop{top:calc(env(safe-area-inset-top,0px) + 10px);right:12px;display:flex;gap:8px;align-items:center}'+
 '#fmenu{top:104px;left:12px;display:flex;flex-direction:column;gap:10px}'+
 '#fchar{left:50%;top:50%;transform:translate(-50%,-54%)}'+
 '#fcs{left:50%;bottom:8px;transform:translateX(-50%);display:flex;flex-direction:column;gap:6px;align-items:center;width:300px}'+
 '#fsq{left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);display:flex;gap:8px}'+
 '#fgo{right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);width:240px;display:flex;flex-direction:column;gap:8px}'+
 '.fb{background:#0b0b14c0;border:2px solid #ffffff55;border-radius:12px;padding:8px 10px;color:#fff;font:800 13px system-ui;position:relative}'+
 '.fq{width:46px;height:56px;border-radius:10px;background:#0b0b14c0;border:2px dashed #ffffff66;display:flex;align-items:center;justify-content:center;font:800 11px system-ui;text-align:center;overflow:hidden;color:#fff}'+
 '.dot{position:absolute;top:-5px;right:-5px;width:14px;height:14px;border-radius:50%;background:#ff3b3b;border:2px solid #fff}'+
 '#play{font-size:26px!important;padding:14px!important;letter-spacing:2px;transform:skewX(-6deg);background:linear-gradient(#ffb02e,#ff6a2b)!important;box-shadow:0 4px 0 #a63b00}'+
 '#fgo .mode{font-size:12px!important;padding:7px 2px!important}.bar{height:9px;background:#ffffff22;border-radius:5px;overflow:hidden}.bar i{display:block;height:100%;background:#3ddc97}'+
 '#fmodal{display:none;position:absolute;inset:0;z-index:7;background:#000b;align-items:center;justify-content:center}#fmodal.on{display:flex}'+
 '.ms{display:flex;flex-direction:column;gap:4px;font-size:13px;text-align:left}.ms .r{display:flex;gap:8px;align-items:center}.ms button{padding:5px 10px;font-size:12px;border-radius:8px}'+
 '#login{z-index:9;background:radial-gradient(circle at 50% 25%,#5a2390,#2a0f4a 45%,#07040d 85%)}'+
 '@media (orientation:portrait){#lobby{overflow:auto}#ff{position:static;display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px}#ff>*{position:static!important;transform:none!important;width:auto!important}}';
 document.head.appendChild(st);
 const ff=el('div');ff.id='ff';ff.innerHTML='<div id="fp" class="fb"></div><div id="fev" class="fb"></div><div id="ftop"></div><div id="fmenu"></div><div id="fchar"></div><div id="fcs"></div><div id="fsq"></div><div id="fgo"></div>';
 const cols=$('cols'),skins=cols.nextElementSibling,modes=document.querySelector('.mode').parentElement,pl=$('play'),who=$('who');
 $('lobby').append(ff);$('fcs').append(cols,skins);$('fgo').append(who,modes,pl);
 $('lobby').querySelectorAll('.card').forEach(c=>c.style.display='none');
 const modal=el('div');modal.id='fmodal';modal.innerHTML='<div class="card" id="fmbox" style="max-height:88%;overflow:auto"></div>';$('lobby').append(modal);
 modal.onclick=e=>{if(e.target===modal)modal.classList.remove('on')};
 // amigos pelo nome
 const sc=$('mycode').parentElement;sc.style.display='none';$('fcode').placeholder='Nome do amigo';$('fcode').maxLength=12;$('fcode').style.textTransform='none';
 $('fadd').onclick=()=>{ssend({t:'addfriend',nick:$('fcode').value.trim()});$('fcode').value=''};
 // login
 const lg=el('div','scr');lg.id='login';
 lg.innerHTML='<h1 style="margin:0;font-size:54px;font-weight:900;transform:skewX(-8deg)">BF<span style="color:#ff6a2b">: GO</span></h1><div class="card"><h2 style="margin:0">Entrar</h2><input type="text" id="lname" maxlength="12" placeholder="Seu nome" aria-label="Seu nome"><button id="lgo">Entrar</button><p class="sub" id="lmsg" style="font-size:12px">Sem senha. O nome é só seu: ninguém mais pode usar o mesmo.</p></div>';
 document.body.appendChild(lg);$('lname').value=savedName;
 const accept=n=>{pendingNick='';LOGGED=true;try{localStorage.setItem('bf_name',n)}catch(e){}$('nick').value=n;lg.classList.remove('on');render()};
 $('lgo').onclick=()=>{const n=$('lname').value.trim().replace(/\s+/g,' ').slice(0,12);if(n.length<2){$('lmsg').textContent='Digite um nome com pelo menos 2 letras.';return}
  if(!sws||sws.readyState!==1){accept(n);return}
  pendingNick=n;$('lmsg').textContent='Entrando…';ssend({t:'hello',token:tk,nick:n});setTimeout(()=>{if(pendingNick===n)accept(n)},6000)};
 new MutationObserver(()=>{if(!LOGGED&&$('lobby').classList.contains('on'))lg.classList.add('on')}).observe($('lobby'),{attributes:true,attributeFilter:['class']});
 // personagem
 const face=s=>s===2?'<rect x="56" y="4" width="8" height="12" fill="#3a7d2c"/><g fill="#ffe066" stroke="#2a0f00" stroke-width="2"><polygon points="42,34 50,22 58,34"/><polygon points="62,34 70,22 78,34"/><path d="M42 44l6-5 6 7 6-7 6 7 6-7 6 5-2 10H44z"/></g>':
  s===3?'<g fill="#111"><circle cx="48" cy="34" r="7"/><circle cx="72" cy="34" r="7"/><polygon points="60,42 55,50 65,50"/></g><path d="M46 56h28" stroke="#111" stroke-width="3" stroke-dasharray="4 3"/>':
  s===1?'<g fill="#222"><ellipse cx="48" cy="34" rx="5" ry="8"/><ellipse cx="72" cy="34" rx="5" ry="8"/><ellipse cx="60" cy="54" rx="6" ry="7"/></g>':
  '<g fill="#2a0f00"><rect x="45" y="30" width="8" height="8"/><rect x="67" y="30" width="8" height="8"/><rect x="50" y="50" width="20" height="4"/></g>';
 function drawChar(){const sig=color+'-'+mySkin,F=$('fchar');if(F._s===sig)return;F._s=sig;const s=mySkin,c='#'+('000000'+color.toString(16)).slice(-6),
  head=s===2?'#ff7a1a':s===1?'#f4f4ff':s===3?'#f5f5f0':'#f0c8a0',body=s===1?'#f4f4ff':s===3?'#dcdcdc':c;
  F.innerHTML='<svg viewBox="0 0 120 200" width="140" height="233" aria-hidden="true"><ellipse cx="60" cy="192" rx="38" ry="6" fill="#0006"/><rect x="38" y="122" width="18" height="58" fill="#2b184d"/><rect x="64" y="122" width="18" height="58" fill="#2b184d"/><rect x="34" y="174" width="24" height="12" rx="3" fill="#1a0f2e"/><rect x="62" y="174" width="24" height="12" rx="3" fill="#1a0f2e"/>'+
  '<rect x="32" y="66" width="56" height="60" fill="'+body+'"/><rect x="76" y="66" width="12" height="60" fill="#0003"/><rect x="32" y="96" width="56" height="8" fill="#ff7a1a"/><rect x="16" y="70" width="14" height="46" rx="6" fill="'+body+'"/><rect x="90" y="70" width="14" height="46" rx="6" fill="'+body+'"/>'+
  '<rect x="34" y="14" width="52" height="50" rx="'+(s===2?10:8)+'" fill="'+head+'"/>'+face(s)+'</svg>'}
 // esquadrão
 function squad(){const S=$('fsq'),ms=(party&&party.members)||[],sig=ms.map(m=>m.nick).join('|')+'#'+($('nick').value);if(S._s===sig)return;S._s=sig;S.textContent='';
  const mine=el('div','fq',($('nick').value||'?').slice(0,8));mine.style.cssText='border-style:solid;border-color:#ff6a2b';S.append(mine);
  const o=ms.filter(m=>m.code!==me.code);for(let i=0;i<3;i++){const d=el('div','fq',o[i]?o[i].nick.slice(0,8):'+');d.onclick=()=>{show('soc');renderF();renderP()};S.append(d)}}
 // menu e topo
 const fb=(t,f)=>{const b=el('button','fb',t);b.style.cssText='width:64px;height:54px;padding:4px;font-size:12px';b.onclick=f;return b};
 const bm=fb('Missões',()=>{openM()}),ba=fb('Amigos',()=>{show('soc');renderF();renderP()});$('fmenu').append(bm,ba);
 const coin=el('div','fb','◆ 0'),gear=fb('Config',()=>$('opt').onclick());gear.style.width='auto';gear.style.height='auto';gear.style.padding='8px 10px';$('ftop').append(coin,gear);
 $('fev').onclick=()=>openM();
 function openM(){modal.classList.add('on');renderM()}
 function renderM(){const B=$('fmbox'),P=PROF;B.textContent='';B.append(el('h2',null,'Missões diárias'));B.append(el('p','sub',evLine()));
  if(!P)B.append(el('div','sub','Conectando à sua conta…'));else P.ms.forEach((m,i)=>{const row=el('div','ms');row.append(el('div',null,(m.ev?'★ ':'')+m.x));const r=el('div','r'),b=el('div','bar'),f=el('i');b.style.flex='1';f.style.width=(m.p/m.n*100)+'%';b.append(f);r.append(b,el('span',null,m.p+'/'+m.n));
   if(m.cl)r.append(el('span',null,'✓'));else if(m.p>=m.n){const g=el('button',null,'Resgatar');g.onclick=()=>ssend({t:'claim',i});r.append(g)}else r.append(el('span','sub','+'+m.xp+' XP'));row.append(r);B.append(row)});
  const x=el('button','alt','Fechar');x.onclick=()=>modal.classList.remove('on');B.append(x)}
 function evLine(){const d=Math.max(0,new Date(2026,10,3)-Date.now()),h=Math.floor(d/36e5);return d>0?'Evento Halloween termina em '+Math.floor(h/24)+'d '+h%24+'h':'Evento encerrado'}
 function render(){const P=PROF,nm=$('nick').value||'Jogador',p=$('fp');p.textContent='';
  const top=el('div');top.style.cssText='display:flex;gap:8px;align-items:center';const av=el('div',null,nm[0].toUpperCase());av.style.cssText='width:38px;height:38px;border-radius:8px;background:#ff6a2b;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none';
  const nb=el('div');nb.style.minWidth='0';const nn=el('b',null,nm);nn.style.cssText='display:block;overflow:hidden;text-overflow:ellipsis';nb.append(nn,el('span',null,'Nível '+(P?P.lv:1)));top.append(av,nb);p.append(top);
  const from=P?P.from:0,to=P?P.to:100,xp=P?P.xp:0,bar=el('div','bar'),fi=el('i');fi.style.width=Math.max(0,Math.min(100,(xp-from)/(to-from)*100))+'%';bar.append(fi);p.append(bar);
  const tr=el('button','alt','Trocar nome');tr.style.cssText='font-size:11px;padding:3px 8px;border-radius:8px;align-self:flex-start';tr.onclick=()=>{LOGGED=false;$('lname').value=nm;lg.classList.add('on')};p.append(tr);
  p.style.cssText+=';display:flex;flex-direction:column;gap:6px';coin.textContent='◆ '+(P?P.coins:0);$('fev').textContent='EVENTO HALLOWEEN · '+evLine().replace('Evento Halloween ','');
  bm.querySelectorAll('.dot').forEach(d=>d.remove());if(P&&P.ms.some(m=>m.p>=m.n&&!m.cl))bm.append(el('span','dot'));if(modal.classList.contains('on'))renderM();squad()}
 function toast(t){const d=el('div',null,t);d.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:40;background:#122428;border:2px solid #3ddc97;border-radius:12px;padding:10px 16px;font:800 15px system-ui;color:#fff';document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}
 const hook=s=>{if(!s||s._h)return;s._h=1;const om=s.onmessage;s.onmessage=e=>{try{const m=JSON.parse(e.data);
   if(m.t==='me'&&!m.off){if(pendingNick&&m.nick===pendingNick)accept(m.nick);ssend({t:'profile'})}
   else if(m.t==='nickfail'){if(pendingNick){pendingNick='';LOGGED=false;lg.classList.add('on');$('lmsg').textContent=m.m}}
   else if(m.t==='profile'){PROF=m;try{localStorage.setItem('bf_prof',JSON.stringify(m))}catch(x){}render();if(m.gain)toast('+'+m.gain.xp+' XP  ·  +'+m.gain.c+' moedas')}}catch(x){}om&&om(e)}};
 const _c=conn;conn=function(){_c();hook(sws)};hook(sws);
 const rep=w=>{ssend({t:'report',kills:kills|0,won:w,emotes:EMC});EMC=0};
 const _fin=finish;finish=function(w){_fin(w);rep(w?1:0)};
 const _lo=leaveOnline;leaveOnline=function(m){const was=online&&state==='play';_lo(m);if(was)rep(0)};
 const _se=sendEmote;sendEmote=function(i){if(state==='play')EMC++;_se(i)};
 render();drawChar();setInterval(()=>{drawChar();squad();$('fev').textContent='EVENTO HALLOWEEN · '+evLine().replace('Evento Halloween ','')},1000);
})();
