// BF: GO extras: armas, zona, vida, placar, nomes, engrenagem
const WP=[{n:'Pistola',dmg:20,hd:45,cost:1,cd:.28,pel:1,spr:0},{n:'Rifle',dmg:25,hd:60,cost:1,cd:.12,pel:1,spr:.004},{n:'Escopeta',dmg:12,hd:24,cost:5,cd:.75,pel:6,spr:.12}];
let wi=1,lastShotT=0,gearPrev=null,started=false,zt=0,zr=80,zring=null,mk=[],tp=performance.now();const fl=[];
(function(){const h=$('hud');
 const mkb=(id,txt,css)=>{const d=document.createElement('div');d.className='act';d.id=id;d.dataset.b=id;d.textContent=txt;d.style.cssText=css;h.appendChild(d)};
 mkb('gear','⚙','top:34px;right:76px;width:34px;height:34px;border-radius:8px;font-size:20px;background:#122428cc');
 mkb('wpn',WP[wi].n,'right:200px;bottom:14px;width:60px;height:60px;font-size:11px;background:#ffd23fcc;color:#222');
 const t=(id,css)=>{const d=document.createElement('div');d.id=id;d.style.cssText='position:absolute;font:700 12px monospace;text-shadow:0 1px 3px #000;white-space:pre;'+css;h.appendChild(d)};
 t('board','top:72px;right:12px;text-align:right');
 t('feed','top:34px;left:50%;transform:translateX(-50%);text-align:center;font-size:13px');
})();
function openGear(){jid=null;lid=null;firing=false;jv={x:0,y:0};$('stick').style.display='none';gearPrev=state;if(!online)state='pause';loadCfg();show('cfg')}
$('cfgok').onclick=()=>{cfg.sens=+$('sens').value;cfg.fov=+$('fov').value;cfg.snd=$('snd').checked;cfg.vib=$('vib').checked;cfg.fps=$('fpsb').checked;
 try{localStorage.setItem('bf_cfg',JSON.stringify(cfg))}catch(e){}applyGfx();
 if(gearPrev){state=gearPrev;gearPrev=null;show('none');last=performance.now()}else show('lobby')};
addEventListener('pointerdown',e=>{
 if($('cfg').classList.contains('on')){e.stopPropagation();return}
 const b=e.target.dataset&&e.target.dataset.b;
 if(b==='gear'){e.stopPropagation();openGear()}
 else if(b==='wpn'){e.stopPropagation();wi=(wi+1)%3;e.target.textContent=WP[wi].n}
},true);

function label(txt){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.font='bold 34px sans-serif';x.textAlign='center';x.lineWidth=6;x.strokeStyle='#000';x.strokeText(txt,128,44);x.fillStyle='#fff';x.fillText(txt,128,44);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(2.6,.65,1);s.position.y=2.6;return s}
function setMk(list){mk.forEach(k=>S.remove(k.m));mk=list.map(p=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),new THREE.MeshBasicMaterial({color:0x3ddc84}));m.position.set(p.x,.9,p.z);S.add(m);return{x:p.x,z:p.z,on:true,m,t:0}})}

function shoot(){
 const w=WP[wi],t=performance.now()/1000;
 if(t-lastShotT<w.cd)return;
 if(ammo<w.cost){reload=1.4;say('Recarregando…',1300);return}
 lastShotT=t;ammo-=w.cost;upd();beep(w.pel>1?110:160,.08);vib(15);pitch+=.012+Math.random()*.01;yaw+=(Math.random()-.5)*.012;
 if(online){const d=new THREE.Vector3();C.getWorldDirection(d);if(ws&&ws.readyState===1)ws.send(JSON.stringify({t:'shot',w:wi,dx:d.x,dy:d.y,dz:d.z}))}
 else{
  const ray=new THREE.Raycaster();let any=false;
  for(let i=0;i<w.pel;i++){
   ray.setFromCamera({x:(Math.random()-.5)*2*w.spr,y:(Math.random()-.5)*2*w.spr},C);
   const h=ray.intersectObjects([...hits,...crates])[0];
   if(h&&h.object.userData.bot){const o=h.object.userData,bt=o.bot;if(bt.hp<=0)continue;bt.hp-=o.head?w.hd:w.dmg;any=true;
    const dx=bt.m.position.x-C.position.x,dz=bt.m.position.z-C.position.z,d=Math.hypot(dx,dz)||1;bt.m.position.x+=dx/d*.2;bt.m.position.z+=dz/d*.2;
    if(bt.hp<=0&&bots.includes(bt)){bots=bots.filter(b=>b!==bt);hits=hits.filter(x=>x.userData.bot!==bt);dying.push({m:bt.m,t:0});kills++;upd();say(o.head?'Tiro na cabeça!':'Abate!',700);if(!bots.length){finish(true);return}}}}
  if(any){$('cross').classList.add('hit');setTimeout(()=>$('cross').classList.remove('hit'),120);beep(520,.06)}
 }
 if(ammo<=0){reload=1.4;say('Recarregando…',1300)}
}

function startOnline(){
 hp=100;ammo=30;kills=0;yaw=0;pitch=0;vx=vy=vz=0;dead=false;grace=0;wi=1;$('wpn').textContent=WP[wi].n;started=false;
 [...bots.map(b=>b.m),...dying.map(b=>b.m),...crates].forEach(o=>S.remove(o));bots=[];dying=[];crates=[];hits=[];
 show('none');$('hud').classList.add('on');document.body.classList.add('playing');$('exit').style.display='flex';say('Conectando…');state='wait';upd();
 let ok=false;try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host)}catch(e){return leaveOnline('Servidor offline')}
 ws.onopen=()=>ws.send(JSON.stringify({t:'join',nick:$('nick').value||'Jogador',color}));
 ws.onerror=()=>{if(!ok)leaveOnline('Servidor offline. O modo online só funciona no jogo hospedado no Render.')};
 ws.onclose=()=>{if(ok&&state!=='idle')leaveOnline('Conexão perdida')};
 ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}
  if(m.t==='welcome'){ok=true;myId=m.id;const cm=new THREE.MeshLambertMaterial({color:0x8a6a45});
   m.crates.forEach(c=>{const b=new THREE.Mesh(new THREE.BoxGeometry(3,2.6,3),cm);b.castShadow=b.receiveShadow=true;b.position.set(c.x,1.3,c.z);S.add(b);crates.push(b)});
   setMk(m.mk);C.position.set(m.x,1.6,m.z);state='play';last=performance.now();say('Valendo!',1000)}
  else if(m.t==='state'){const seen={};zr=m.z;m.mk.forEach((f,i)=>{if(mk[i])mk[i].on=!!f});
   m.p.forEach(q=>{if(q.id===myId){if(q.hp<hp){$('dmg').style.opacity=.7;setTimeout(()=>$('dmg').style.opacity=0,200);vib(40)}hp=q.hp;kills=q.k;$('hpf').style.width=hp+'%';$('kills').textContent='Abates: '+kills;return}
    seen[q.id]=1;let o=others[q.id];if(!o){o={m:mkMan(q.c),t:new THREE.Vector3(q.x,q.y-1.6,q.z),ry:0};o.m.add(label(q.n));o.m.position.copy(o.t);others[q.id]=o}
    o.t.set(q.x,q.y-1.6,q.z);o.ry=q.yaw+Math.PI;o.m.visible=q.a});
   for(const id in others)if(!seen[id]){S.remove(others[id].m);delete others[id]}
   $('left').textContent='Jogadores: '+m.p.length;
   $('board').textContent='Zona '+Math.round(zr)+'m\n'+m.p.slice().sort((a,b)=>b.k-a.k).slice(0,5).map(q=>(q.id===myId?'> ':'')+q.n+' '+q.k).join('\n')}
  else if(m.t==='feed'){fl.push(m.a+' eliminou '+m.b);if(fl.length>4)fl.shift();$('feed').textContent=fl.join('\n');setTimeout(()=>{fl.shift();$('feed').textContent=fl.join('\n')},4000)}
  else if(m.t==='hit'){$('cross').classList.add('hit');setTimeout(()=>$('cross').classList.remove('hit'),120);beep(520,.06)}
  else if(m.t==='kill')say('Abate!',700)
  else if(m.t==='dead'){dead=true;firing=false;say('Eliminado! Volta em 3s')}
  else if(m.t==='respawn'){C.position.set(m.x,1.6,m.z);dead=false;hp=100;ammo=30;upd();say('De volta!',700)}}
}

function tick(now){requestAnimationFrame(tick);const dt=Math.min((now-tp)/1000,.1);tp=now;if(!S)return;
 if(!zring){zring=new THREE.Mesh(new THREE.CylinderGeometry(1,1,60,64,1,true),new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));zring.position.y=30;zring.visible=false;S.add(zring)}
 if(state==='idle'||state==='over'||state==='wait'){started=false;zring.visible=false;if(!online)mk.forEach(k=>k.m.visible=false);return}
 if(!started&&state==='play'){started=true;zt=0;wi=1;$('wpn').textContent=WP[wi].n;if(!online)setMk(Array.from({length:5},()=>({x:(Math.random()-.5)*70,z:(Math.random()-.5)*70})))}
 if(!started)return;
 if(!online){
  if(state!=='pause')zt+=dt;const t=zt%160;zr=t<20?80:t<120?Math.max(14,80-(t-20)*.66):14;
  if(state==='play'){
   if(Math.hypot(C.position.x,C.position.z)>zr){hp=Math.max(0,hp-4*dt);$('hpf').style.width=hp+'%';if(hp<=0){finish(false);return}}
   mk.forEach(k=>{if(!k.on){k.t-=dt;if(k.t<=0)k.on=true}else if(hp<100&&Math.hypot(C.position.x-k.x,C.position.z-k.z)<1.8){hp=Math.min(100,hp+40);k.on=false;k.t=15;say('+40 vida',700);$('hpf').style.width=hp+'%'}})}
  $('board').textContent='Zona '+Math.round(zr)+'m'}
 zring.visible=true;zring.scale.set(zr,1,zr);mk.forEach(k=>{k.m.visible=k.on;k.m.rotation.y+=dt*2})}
requestAnimationFrame(tick);
