// BF: GO lobby v2: menu lateral, personagem em tela própria, cidade ao fundo e modo Dupla/Esquadrão
(function(){
 const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e};
 const st=el('style');st.textContent=
 '@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}#fchar svg{animation:fl 3s ease-in-out infinite;filter:drop-shadow(0 0 22px #ff7a1a88)}'+
 '#fglow{position:absolute;left:50%;top:52%;width:280px;height:280px;margin:-140px;border-radius:50%;background:radial-gradient(#ff7a1a55,transparent 70%);pointer-events:none}'+
 '#fsky{position:absolute;left:0;right:0;bottom:0;width:100%;height:34%;pointer-events:none}'+
 '#fmenu .fb{width:68px!important;height:56px!important}'+
 '#fm2{display:none;position:absolute;inset:0;z-index:7;background:#000b;align-items:center;justify-content:center}#fm2.on{display:flex}'+
 '#fm2 #fcs{position:static!important;transform:none!important;width:auto!important}'+
 '#fchips{display:none;gap:6px}#fchips .fb{flex:1;font-size:12px;padding:7px 2px;text-align:center}#fchips .on{background:#ff6a2b!important}';
 document.head.appendChild(st);
 const sky=document.createElementNS('http://www.w3.org/2000/svg','svg');sky.setAttribute('id','fsky');sky.setAttribute('viewBox','0 0 400 100');sky.setAttribute('preserveAspectRatio','none');
 sky.innerHTML='<path fill="#10061f" d="M0 100V58h24V40h18v22h20V30h26v34h18V48h22v16h24V22h20v44h18V50h26v14h22V36h20v30h24V52h18v48z"/><path fill="#1b0b33" d="M0 100V78h30V64h22v16h28V60h24v22h30V70h26v12h30V56h22v26h28V72h24v10h30V62h26v38z"/>';
 $('lobby').prepend(sky);const gl=el('div');gl.id='fglow';$('lobby').prepend(gl);
 const mb=el('div');mb.id='fm2x';
 const m2=el('div');m2.id='fm2';const box=el('div','card');box.style.cssText='max-width:340px;align-items:center';
 box.append(el('h2',null,'Personagem'));box.append($('fcs'));const x=el('button','alt','Pronto');x.onclick=()=>m2.classList.remove('on');box.append(x);m2.append(box);$('lobby').append(m2);
 m2.onclick=e=>{if(e.target===m2)m2.classList.remove('on')};
 const fb=(t,f)=>{const b=el('button','fb',t);b.style.padding='4px';b.style.fontSize='12px';b.onclick=f;return b};
 function toast(t){const d=el('div',null,t);d.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:40;background:#122428;border:2px solid #ffc83d;border-radius:12px;padding:10px 16px;font:800 15px system-ui;color:#fff';document.body.appendChild(d);setTimeout(()=>d.remove(),3000)}
 $('fmenu').append(fb('Personagem',()=>m2.classList.add('on')),fb('Loja',()=>toast('A loja chega em breve. Guarde suas moedas!')));
 // modo de equipe (só no online)
 const chips=el('div');chips.id='fchips';
 [['Solo','solo'],['Dupla','duo'],['Esquadrão','squad']].forEach(([t,m])=>{const b=fb(t,()=>{
   if(m==='solo'){if(party)ssend({t:'pleave'});return}
   if(!party){$('who').textContent='Convide um amigo em Amigos para jogar de '+t+'.';return}
   if(party.leader!==me.code){$('who').textContent='Só o líder escolhe o modo.';return}
   ssend({t:'pmode',m})});b.dataset.m=m;chips.append(b)});
 $('fgo').prepend(chips);
 setInterval(()=>{chips.style.display=online?'flex':'none';const cur=party?party.mode:'solo';chips.querySelectorAll('.fb').forEach(b=>b.classList.toggle('on',b.dataset.m===cur))},500);
})();
