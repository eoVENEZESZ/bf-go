// BF: GO social: amigos, equipes Duo/Squad e aliados na partida
let sws=null,me={code:'------'},friends=[],party=null,MYTM='',sfail=0,tk='';const TM={},NM={};
try{tk=localStorage.getItem('bf_tk')||'';if(tk.length<16){tk=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('bf_tk',tk)}}catch(e){tk=Math.random().toString(16).slice(2).padEnd(20,'0')}
(function(){
 const sc=document.createElement('div');sc.className='scr';sc.id='soc';
 sc.innerHTML='<div class="card"><h2 style="margin:0">Amigos e Equipe</h2>'+
 '<div class="row"><span class="sub">Seu código:</span><b id="mycode" style="font-size:22px;letter-spacing:3px">------</b><button class="seg alt" id="cpcode" style="flex:0">Copiar</button></div>'+
 '<div class="row"><input type="text" id="fcode" maxlength="6" placeholder="Código do amigo" style="flex:1;min-width:0;text-transform:uppercase"><button id="fadd" style="padding:9px 14px;font-size:15px">Adicionar</button></div>'+
 '<p class="sub" id="socmsg" style="font-size:13px;min-height:16px"></p><div id="flist"></div><hr style="width:100%;border-color:#2a4a50"><div id="plist"></div></div><button id="socback" class="alt">Voltar</button>';
 document.body.appendChild(sc);
 const iv=document.createElement('div');iv.id='invt';iv.style.cssText='display:none;position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:30;background:#122428;border:2px solid #ff6a2b;border-radius:12px;padding:10px 14px;gap:10px;align-items:center;font:700 14px system-ui;color:#fff';
 iv.innerHTML='<span id="invtxt"></span><button id="invok" style="padding:6px 12px;font-size:14px">Aceitar</button><button id="invno" class="alt" style="padding:6px 12px;font-size:14px">Recusar</button>';document.body.appendChild(iv);
 const b=document.createElement('button');b.className='alt';b.textContent='Amigos e Equipe';b.onclick=()=>{show('soc');renderF();renderP()};$('opt').before(b);
 $('socback').onclick=()=>show('lobby');
 $('cpcode').onclick=()=>{try{navigator.clipboard.writeText(me.code);$('socmsg').textContent='Código copiado.'}catch(e){}};
 $('fadd').onclick=()=>{ssend({t:'addfriend',code:$('fcode').value});$('fcode').value=''};
 $('invok').onclick=()=>{ssend({t:'paccept',party:$('invt').dataset.p});$('invt').style.display='none'};
 $('invno').onclick=()=>{ssend({t:'pdecline'});$('invt').style.display='none'};
 $('nick').addEventListener('change',()=>ssend({t:'hello',token:tk,nick:$('nick').value||'Jogador'}));
})();
function ssend(o){if(sws&&sws.readyState===1)sws.send(JSON.stringify(o))}
function renderF(){const L=$('flist');L.textContent='';if(!friends.length){L.textContent='Nenhum amigo ainda. Troque códigos com alguém.';return}
 friends.forEach(f=>{const r=document.createElement('div');r.className='row';const n=document.createElement('span');n.style.cssText='flex:1;text-align:left';n.textContent=(f.on?'● ':'○ ')+f.nick;r.appendChild(n);
  if(f.on){const b=document.createElement('button');b.className='seg alt';b.style.flex='0';b.textContent='Convidar';b.onclick=()=>ssend({t:'pinvite',code:f.code});r.appendChild(b)}L.appendChild(r)})}
function renderP(){const P=$('plist');P.textContent='';if(!party){P.textContent='Sem equipe. Convide um amigo que esteja online.';return}
 const h=document.createElement('p');h.className='sub';h.textContent='Equipe '+(party.mode==='duo'?'Duo':'Squad')+' ('+party.members.length+'/'+(party.mode==='duo'?2:4)+')';P.appendChild(h);
 party.members.forEach(m=>{const d=document.createElement('div');d.textContent=(m.code===party.leader?'★ ':'· ')+m.nick;P.appendChild(d)});
 if(party.leader===me.code){const r=document.createElement('div');r.className='row';['duo','squad'].forEach(md=>{const b=document.createElement('button');b.className='seg alt'+(party.mode===md?' sel':'');b.textContent=md==='duo'?'Duo':'Squad';b.onclick=()=>ssend({t:'pmode',m:md});r.appendChild(b)});P.appendChild(r)}
 const l=document.createElement('button');l.className='seg alt';l.textContent='Sair da equipe';l.onclick=()=>ssend({t:'pleave'});P.appendChild(l);
 const t=document.createElement('p');t.className='sub';t.style.fontSize='12px';t.textContent='Para jogar em equipe: o líder escolhe Online no lobby e toca em Iniciar partida.';P.appendChild(t)}
function conn(){if(sfail>5)return;try{sws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host)}catch(e){return}
 sws.onopen=()=>{sfail=0;ssend({t:'hello',token:tk,nick:$('nick').value||'Jogador'})};
 sws.onclose=()=>{sws=null;sfail++;setTimeout(conn,6000)};
 sws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}
  if(m.t==='me'){me=m.off?{code:'------'}:m;$('mycode').textContent=me.code;if(m.off)$('socmsg').textContent='Amigos indisponíveis (banco não conectado).'}
  else if(m.t==='friends'){friends=m.list;renderF()}
  else if(m.t==='party'){party=m.none?null:m;renderP()}
  else if(m.t==='sinfo')$('socmsg').textContent=m.m;
  else if(m.t==='invite'){$('invt').dataset.p=m.party;$('invtxt').textContent=m.from+' convidou você para '+(m.mode==='duo'?'Duo':'Squad');$('invt').style.display='flex'}
  else if(m.t==='pgo'){$('invt').style.display='none';if(state==='idle'||state==='over'){online=true;startMatch()}}}}
conn();
const _pl=$('play').onclick;
$('play').onclick=()=>{if(online&&party&&party.members.length>1){if(party.leader===me.code)ssend({t:'pstart'});else $('who').textContent='Aguarde o líder iniciar a partida.';return}_pl()};
const _so3=startOnline;
startOnline=function(){_so3();if(!ws)return;const om=ws.onmessage,oo=ws.onopen,tm=party&&party.members.length>1?party.id:'';
 ws.onopen=ev=>{oo&&oo(ev);if(tm)ws.send(JSON.stringify({t:'team',team:tm}))};
 ws.onmessage=ev=>{try{const m=JSON.parse(ev.data);if(m.t==='state')m.p.forEach(q=>{TM[q.id]=q.tm;NM[q.id]=q.n;if(q.id===myId)MYTM=q.tm})}catch(x){}om&&om(ev)}};
function tlabel(txt){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.font='bold 34px sans-serif';x.textAlign='center';x.lineWidth=6;x.strokeStyle='#000';x.strokeText(txt,128,44);x.fillStyle='#6dff9a';x.fillText(txt,128,44);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(2.6,.65,1);s.position.y=2.6;return s}
function stick(){requestAnimationFrame(stick);if(!MYTM||!online)return;
 for(const id in others){const o=others[id];if(!o.m.userData.tmate&&TM[id]===MYTM&&NM[id]){const s=o.m.children.find(c=>c.isSprite&&c!==o.m.userData.bub);if(s)o.m.remove(s);o.m.add(tlabel(NM[id]));o.m.userData.tmate=1}}}
requestAnimationFrame(stick);
const _fm=ffMap;
ffMap=function(){_fm();if(!MYTM)return;const g=$('ffmap').getContext('2d'),k=100/130;g.save();g.beginPath();g.arc(50,50,48,0,7);g.clip();g.fillStyle='#4aa3ff';
 for(const id in others){if(TM[id]===MYTM&&others[id].m.visible){const p=others[id].m.position;g.fillRect(50+p.x*k-3,50+p.z*k-3,6,6)}}g.restore()};
