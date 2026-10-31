// BF: GO lobby estilo battle royale: login por nome (sem senha), perfil, evento e missões
let LOGGED=false,PROF=null,EMC=0;
try{PROF=JSON.parse(localStorage.getItem('bf_prof')||'null')}catch(e){}
const savedName=(()=>{try{return localStorage.getItem('bf_name')||''}catch(e){return ''}})();
if(savedName){LOGGED=true;$('nick').value=savedName}
(function(){
 const st=document.createElement('style');st.textContent=
 '#lobby{background:radial-gradient(circle at 30% 15%,#4a1d7a,#1b0b33 55%,#07040d);flex-direction:row;flex-wrap:wrap;align-items:flex-start;justify-content:center;gap:14px;padding-top:calc(env(safe-area-inset-top,0px) + 14px)}'+
 '.lcol{display:flex;flex-direction:column;gap:12px;align-items:stretch;flex:1 1 280px;max-width:360px}.lcol .card{max-width:none}'+
 '.pn{background:#0b0b14c0;border:1px solid #ff6a2b66;border-radius:14px;padding:12px;text-align:left;display:flex;flex-direction:column;gap:8px}'+
 '.pn h3{margin:0;font-size:15px;letter-spacing:1px;color:#ffc83d}.bar{height:10px;background:#ffffff22;border-radius:5px;overflow:hidden}.bar i{display:block;height:100%;background:#3ddc97}'+
 '.ev{background:linear-gradient(120deg,#ff6a2b,#b02a6e);border-radius:14px;padding:14px;text-align:left}.ev b{font-size:20px;display:block}.ev span{font-size:13px}'+
 '.ms{display:flex;flex-direction:column;gap:4px;font-size:13px}.ms .r{display:flex;gap:8px;align-items:center}.ms button{padding:5px 10px;font-size:12px;border-radius:8px}'+
 '#nick{display:none}#login{z-index:9;background:radial-gradient(circle at 50% 25%,#5a2390,#2a0f4a 45%,#07040d 85%)}';
 document.head.appendChild(st);
 const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e};
 const prof=el('div','pn'),miss=el('div','pn'),ev=el('div','ev');
 const col=id=>{const d=el('div','lcol');d.id=id;return d};
 const A=col('lc1'),B=col('lc2'),C=col('lc3'),cs=$('lobby').querySelectorAll('.card');
 A.append(prof,miss);B.append(ev,cs[0]);C.append(cs[1]);$('lobby').append(A,B,C);
 const lg=el('div','scr');lg.id='login';
 lg.innerHTML='<h1 style="margin:0;font-size:54px;font-weight:900;transform:skewX(-8deg)">BF<span style="color:#ff6a2b">: GO</span></h1><div class="card"><h2 style="margin:0">Entrar</h2><input type="text" id="lname" maxlength="12" placeholder="Seu nome" aria-label="Seu nome"><button id="lgo">Entrar</button><p class="sub" id="lmsg" style="font-size:12px">Sem senha. Seu progresso fica salvo neste aparelho e na sua conta.</p></div>';
 document.body.appendChild(lg);$('lname').value=savedName;
 $('lgo').onclick=()=>{const n=$('lname').value.trim().replace(/\s+/g,' ').slice(0,12);if(n.length<2){$('lmsg').textContent='Digite um nome com pelo menos 2 letras.';return}
  LOGGED=true;try{localStorage.setItem('bf_name',n)}catch(e){}$('nick').value=n;ssend({t:'hello',token:tk,nick:n});lg.classList.remove('on');render()};
 new MutationObserver(()=>{if(!LOGGED&&$('lobby').classList.contains('on'))lg.classList.add('on')}).observe($('lobby'),{attributes:true,attributeFilter:['class']});
 function render(){const P=PROF,nm=$('nick').value||'Jogador';prof.textContent='';
  const top=el('div');top.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:8px';top.append(el('b',null,nm));
  const tr=el('button','seg alt','Trocar nome');tr.style.cssText='flex:0;font-size:11px;padding:4px 8px;white-space:nowrap';tr.onclick=()=>{LOGGED=false;$('lname').value=nm;lg.classList.add('on')};top.append(tr);prof.append(top);
  const from=P?P.from:0,to=P?P.to:100,xp=P?P.xp:0;prof.append(el('div',null,'Nível '+(P?P.lv:1)+(P?' · ◆ '+P.coins:'')));
  const bar=el('div','bar'),fi=el('i');fi.style.width=Math.max(0,Math.min(100,(xp-from)/(to-from)*100))+'%';bar.append(fi);prof.append(bar,el('div','sub',xp+' / '+to+' XP'));
  miss.textContent='';miss.append(el('h3',null,'MISSÕES DIÁRIAS'));
  if(!P)miss.append(el('div','sub','Conectando à sua conta…'));
  else P.ms.forEach((m,i)=>{const row=el('div','ms');row.append(el('div',null,(m.ev?'★ ':'')+m.x));const r=el('div','r'),b=el('div','bar'),f=el('i');b.style.flex='1';f.style.width=(m.p/m.n*100)+'%';b.append(f);r.append(b,el('span',null,m.p+'/'+m.n));
   if(m.cl)r.append(el('span',null,'✓'));else if(m.p>=m.n){const g=el('button',null,'Resgatar');g.onclick=()=>ssend({t:'claim',i});r.append(g)}else r.append(el('span','sub','+'+m.xp+' XP'));
   row.append(r);miss.append(row)})}
 function evTxt(){const d=Math.max(0,new Date(2026,10,3)-Date.now()),h=Math.floor(d/36e5);ev.textContent='';ev.append(el('b',null,'EVENTO HALLOWEEN'),el('span',null,d>0?'Termina em '+Math.floor(h/24)+'d '+h%24+'h · missão especial vale 200 XP':'Evento encerrado'))}
 function toast(t){const d=el('div',null,t);d.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:40;background:#122428;border:2px solid #3ddc97;border-radius:12px;padding:10px 16px;font:800 15px system-ui;color:#fff';document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}
 const hook=s=>{if(!s||s._h)return;s._h=1;const om=s.onmessage;s.onmessage=e=>{try{const m=JSON.parse(e.data);
   if(m.t==='me'&&!m.off)ssend({t:'profile'});
   else if(m.t==='profile'){PROF=m;try{localStorage.setItem('bf_prof',JSON.stringify(m))}catch(x){}render();if(m.gain)toast('+'+m.gain.xp+' XP  ·  +'+m.gain.c+' moedas')}}catch(x){}om&&om(e)}};
 const _c=conn;conn=function(){_c();hook(sws)};hook(sws);
 const rep=w=>{ssend({t:'report',kills:kills|0,won:w,emotes:EMC});EMC=0};
 const _fin=finish;finish=function(w){_fin(w);rep(w?1:0)};
 const _lo=leaveOnline;leaveOnline=function(m){const was=online&&state==='play';_lo(m);if(was)rep(0)};
 const _se=sendEmote;sendEmote=function(i){if(state==='play')EMC++;_se(i)};
 render();evTxt();setInterval(evTxt,60000);
})();
