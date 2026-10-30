const $=id=>document.getElementById(id);
const show=id=>document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));
let cfg={gfx:'medio',sens:5,fov:75,snd:true,vib:true,fps:false};
try{Object.assign(cfg,JSON.parse(localStorage.getItem('bf_cfg')||'{}'))}catch(e){}
let best=0;try{best=+localStorage.getItem('bf_best')||0}catch(e){}
$('best').textContent=best;
let color=0xff6a2b,nBots=5;
['#ff6a2b','#19c3b1','#ffd23f','#b06cff'].forEach((c,i)=>{const s=document.createElement('button');s.className='sw'+(i?'':' sel');s.style.background=c;s.setAttribute('aria-label','Cor '+(i+1));
s.onclick=()=>{document.querySelectorAll('.sw').forEach(x=>x.classList.remove('sel'));s.classList.add('sel');$('hero').lastChild.style.background=c;color=parseInt(c.slice(1),16)};$('cols').appendChild(s)});
document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');nBots=+b.dataset.n;online=!!b.dataset.o});

// configurações
function loadCfg(){document.querySelectorAll('#gfx .seg').forEach(b=>b.classList.toggle('sel',b.dataset.v===cfg.gfx));$('sens').value=cfg.sens;$('fov').value=cfg.fov;$('snd').checked=cfg.snd;$('vib').checked=cfg.vib;$('fpsb').checked=cfg.fps}
document.querySelectorAll('#gfx .seg').forEach(b=>b.onclick=()=>{cfg.gfx=b.dataset.v;loadCfg()});
$('opt').onclick=()=>{loadCfg();show('cfg')};
$('cfgok').onclick=()=>{cfg.sens=+$('sens').value;cfg.fov=+$('fov').value;cfg.snd=$('snd').checked;cfg.vib=$('vib').checked;cfg.fps=$('fpsb').checked;
try{localStorage.setItem('bf_cfg',JSON.stringify(cfg))}catch(e){}applyGfx();show('lobby')};

// capa -> permissão -> carregamento -> lobby
$('tap').onclick=()=>show('perm');
async function goLoad(rotate){
 let ok=false;if(rotate){try{await document.documentElement.requestFullscreen()}catch(e){}try{await screen.orientation.lock('landscape');ok=true}catch(e){}}
 rotFB=rotate&&!ok;chkRot();
 const tips=['Mire na cabeça: dano dobrado.','Abra o paraquedas antes de chegar ao chão.','Use as caixas como cobertura.','Arraste a tela direita para mirar.'];
 show('load');let p=0;$('tip').textContent=tips[0];
 const iv=setInterval(()=>{p+=2+Math.random()*5;$('fill').style.width=Math.min(p,100)+'%';$('tip').textContent=tips[Math.floor(p/26)%4];
 if(p>=100&&window.THREE){clearInterval(iv);show('lobby')}},120);
}
$('yes').onclick=()=>goLoad(true);$('no').onclick=()=>goLoad(false);

// som e vibração
let ac;function beep(f,d,t='square'){if(!cfg.snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(.08,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function vib(ms){if(cfg.vib&&navigator.vibrate)navigator.vibrate(ms)}

// ---- 3D ----
let R,S,C,sun,plane,bots=[],dying=[],crates=[],hits=[],state='idle',hp,ammo,kills,yaw,pitch,last,fr=0,ft=0;
let px,py,pz,vx,vy,vz,chute,grace;let online=false,ws=null,others={},myId=null,lastSend=0,dead=false;
const GFX={baixo:{pr:.6,fog:70,sh:false},medio:{pr:1,fog:110,sh:false},alto:{pr:Math.min(devicePixelRatio,2),fog:150,sh:true}};
function applyGfx(){if(!R)return;const q=GFX[cfg.gfx];R.setPixelRatio(q.pr);S.fog.far=q.fog;sun.castShadow=q.sh;C.fov=cfg.fov;C.updateProjectionMatrix();resize()}
function init(){
 R=new THREE.WebGLRenderer({canvas:$('cv'),antialias:false});R.shadowMap.enabled=true;
 S=new THREE.Scene();S.background=new THREE.Color(0x8fd3e8);S.fog=new THREE.Fog(0x8fd3e8,20,110);
 C=new THREE.PerspectiveCamera(75,1,.1,300);C.rotation.order='YXZ';
 S.add(new THREE.HemisphereLight(0xffffff,0x446644,1));
 sun=new THREE.DirectionalLight(0xffffff,.6);sun.position.set(20,40,10);sun.shadow.camera.left=sun.shadow.camera.bottom=-50;sun.shadow.camera.right=sun.shadow.camera.top=50;sun.shadow.camera.far=120;S.add(sun);
 const g=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshLambertMaterial({color:0x5c9a55}));g.rotation.x=-Math.PI/2;g.receiveShadow=true;S.add(g);
 plane=new THREE.Group();const pm=new THREE.MeshLambertMaterial({color:0xdddddd});
 const f=new THREE.Mesh(new THREE.BoxGeometry(10,2.4,2.4),pm),w=new THREE.Mesh(new THREE.BoxGeometry(2.4,.2,16),pm),t=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.5,.2),pm);t.position.set(-4.5,1.6,0);plane.add(f,w,t);plane.visible=false;S.add(plane);
 addEventListener('resize',chkRot);addEventListener('orientationchange',()=>setTimeout(chkRot,200));applyGfx();requestAnimationFrame(loop);
}
let F=false,rotFB=false;const PX=e=>F?e.clientY:e.clientX,PY=e=>F?innerWidth-e.clientX:e.clientY;
function chkRot(){F=rotFB&&innerHeight>innerWidth;document.documentElement.classList.toggle('force',F);document.body.classList.toggle('f',F);resize()}
function resize(){if(!R)return;const w=F?innerHeight:innerWidth,h=F?innerWidth:innerHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()}
function build(){
 [...bots.map(b=>b.m),...dying.map(b=>b.m),...crates].forEach(o=>S.remove(o));bots=[];dying=[];crates=[];hits=[];
 const cm=new THREE.MeshLambertMaterial({color:0x8a6a45});
 for(let i=0;i<16;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(3,2.6,3),cm);m.castShadow=m.receiveShadow=true;
  let x,z;do{x=(Math.random()-.5)*80;z=(Math.random()-.5)*80}while(Math.hypot(x,z)<8);m.position.set(x,1.3,z);S.add(m);crates.push(m)}
 for(let i=0;i<nBots;i++){
  const m=new THREE.Group(),col=[0x4466ff,0xaa33aa,0x33aa66][i%3];
  const b=new THREE.Mesh(new THREE.BoxGeometry(.9,1.3,.5),new THREE.MeshLambertMaterial({color:col}));b.position.y=1;b.castShadow=true;
  const h=new THREE.Mesh(new THREE.SphereGeometry(.25,12,12),new THREE.MeshLambertMaterial({color:0xf0c8a0}));h.position.y=1.9;h.castShadow=true;
  m.add(b,h);let x,z;do{x=(Math.random()-.5)*80;z=(Math.random()-.5)*80}while(Math.hypot(x,z)<24);m.position.set(x,0,z);S.add(m);
  const bot={m,hp:100,t:Math.random()*2,dir:Math.random()<.5?1:-1,s:1+Math.random()};b.userData={bot,head:false};h.userData={bot,head:true};hits.push(b,h);bots.push(bot)}
}
function push(p,r){crates.forEach(c=>{const dx=p.x-c.position.x,dz=p.z-c.position.z,lim=1.5+r;
 if(Math.abs(dx)<lim&&Math.abs(dz)<lim){if(Math.abs(dx)>Math.abs(dz))p.x=c.position.x+Math.sign(dx)*lim;else p.z=c.position.z+Math.sign(dz)*lim}});
 p.x=Math.max(-56,Math.min(56,p.x));p.z=Math.max(-56,Math.min(56,p.z))}
function say(t,ms){$('msg').textContent=t;if(ms)setTimeout(()=>{if($('msg').textContent===t)$('msg').textContent=''},ms)}
function upd(){$('hpf').style.width=hp+'%';$('ammo').textContent=ammo+' / 30';$('kills').textContent='Abates: '+kills;$('left').textContent='Vivos: '+(bots.length+1)}

// partida: avião -> salto -> paraquedas -> pouso
function startMatch(){
 if(online)return startOnline();
 build();hp=100;ammo=30;kills=0;yaw=-Math.PI/2;pitch=-.3;vx=vy=vz=0;chute=false;grace=3;
 show('none');$('hud').classList.add('on');document.body.classList.add('playing');upd();$('fps').style.display=cfg.fps?'block':'none';
 state='plane';plane.visible=true;plane.userData.x=-90;$('fire').textContent='PULAR';say('No avião: toque em PULAR');
}
function jumpOut(){state='drop';plane.visible=false;px=plane.userData.x;py=55;pz=-4;vx=14;vy=0;vz=0;chute=false;$('fire').textContent='ABRIR';say('Salto! Toque em ABRIR',1500);vib(60)}
function openChute(){if(chute)return;chute=true;$('fire').textContent='FOGO';say('Paraquedas aberto',1200);beep(300,.2,'sine')}
function land(){state='play';vx=vy=vz=0;py=1.6;$('fire').textContent='FOGO';say('Valendo!',1000);vib(80);last=performance.now()}
function finish(win){
 state='over';$('hud').classList.remove('on');document.body.classList.remove('playing');plane.visible=false;
 if(kills>best){best=kills;try{localStorage.setItem('bf_best',best)}catch(e){}$('best').textContent=best}
 $('etitle').textContent=win?'Último de pé!':'Eliminado';$('etitle').style.color=win?'#ffd23f':'#ff6a2b';
 $('etext').textContent=($('nick').value||'Jogador')+' · Abates: '+kills+' · Melhor: '+best;show('end');
}
$('play').onclick=startMatch;$('back').onclick=()=>show('lobby');

// controles
let jid=null,jo=null,jv={x:0,y:0},lid=null,lp=null,firing=false,cd=0,reload=0,jumpReq=false;
function act(){if(state==='plane')jumpOut();else if(state==='drop')openChute()}
addEventListener('pointerdown',e=>{if(!['play','plane','drop'].includes(state))return;const b=e.target.dataset&&e.target.dataset.b;
 if(b==='fire'){if(state==='play')firing=true;else act();return}
 if(b==='exit'){leaveOnline();return}
 if(b==='jump'){jumpReq=true;return}
 const W2=F?innerHeight:innerWidth,X=PX(e),Y=PY(e);
 if(X<W2/2&&jid===null){jid=e.pointerId;jo={x:X,y:Y};const s=$('stick');s.style.display='block';s.style.left=jo.x+'px';s.style.top=jo.y+'px'}
 else if(X>=W2/2&&lid===null){lid=e.pointerId;lp={x:X,y:Y}}});
addEventListener('pointermove',e=>{if(e.pointerId===jid){const dx=PX(e)-jo.x,dy=PY(e)-jo.y,l=Math.min(Math.hypot(dx,dy),50)/50,a=Math.atan2(dy,dx);jv={x:Math.cos(a)*l,y:Math.sin(a)*l}}
 else if(e.pointerId===lid){const k=cfg.sens/5;const X=PX(e),Y=PY(e);yaw-=(X-lp.x)*.006*k;pitch=Math.max(-1.4,Math.min(1.4,pitch-(Y-lp.y)*.005*k));lp={x:X,y:Y}}});
const up=e=>{if(e.pointerId===jid){jid=null;jv={x:0,y:0};$('stick').style.display='none'}if(e.pointerId===lid)lid=null;firing=false};
addEventListener('pointerup',up);addEventListener('pointercancel',up);

function shoot(){
 ammo--;upd();beep(160,.08);vib(15);pitch+=.012+Math.random()*.01;yaw+=(Math.random()-.5)*.012;
 if(online){const d=new THREE.Vector3();C.getWorldDirection(d);if(ws&&ws.readyState===1)ws.send(JSON.stringify({t:'shot',dx:d.x,dy:d.y,dz:d.z}));if(ammo<=0){reload=1.4;say('Recarregando…',1300)}return}
 const ray=new THREE.Raycaster();ray.setFromCamera({x:0,y:0},C);
 const h=ray.intersectObjects([...hits,...crates])[0];
 if(h&&h.object.userData.bot){const o=h.object.userData,bt=o.bot,dmg=o.head?60:25;bt.hp-=dmg;
  const dx=bt.m.position.x-C.position.x,dz=bt.m.position.z-C.position.z,d=Math.hypot(dx,dz)||1;bt.m.position.x+=dx/d*.4;bt.m.position.z+=dz/d*.4;
  $('cross').classList.add('hit');setTimeout(()=>$('cross').classList.remove('hit'),120);beep(520,.06);
  if(bt.hp<=0&&bots.includes(bt)){bots=bots.filter(b=>b!==bt);hits=hits.filter(x=>x.userData.bot!==bt);dying.push({m:bt.m,t:0});kills++;upd();say(o.head?'Tiro na cabeça!':'Abate!',700);if(!bots.length)finish(true)}}
 if(ammo<=0){reload=1.4;say('Recarregando…',1300)}
}
function loop(now){requestAnimationFrame(loop);if(!R)return;
 const dt=Math.min((now-(loop.p||now))/1000,.05);loop.p=now;
 fr++;ft+=dt;if(ft>=.5){if(cfg.fps)$('fps').textContent=Math.round(fr/ft)+' FPS';fr=0;ft=0}
 if(state==='plane'){
  plane.userData.x+=16*dt;plane.position.set(plane.userData.x,55,-4);C.position.set(plane.userData.x,56.4,-4);C.rotation.set(pitch,yaw,0);
  if(plane.userData.x>85)jumpOut();
 }else if(state==='drop'){
  const g=chute?4:22,tv=chute?-6:-32;vy=Math.max(tv,vy-g*dt);
  const sp=chute?11:7,fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  vx+=((fx*-jv.y+Math.cos(yaw)*jv.x)*sp-vx)*Math.min(1,2*dt);vz+=((fz*-jv.y-Math.sin(yaw)*jv.x)*sp-vz)*Math.min(1,2*dt);
  px+=vx*dt;pz+=vz*dt;py+=vy*dt;C.position.set(px,py,pz);C.rotation.set(pitch,yaw,0);
  if(py<20&&!chute)openChute();
  if(py<=1.6){C.position.y=1.6;land()}
 }else if(state==='play'){
  last=now;C.rotation.set(pitch,yaw,0);
  const air=C.position.y>1.65,sp=7,fx=-Math.sin(yaw),fz=-Math.cos(yaw),k=Math.min(1,(air?2:10)*dt);
  vx+=((fx*-jv.y+Math.cos(yaw)*jv.x)*sp-vx)*k;vz+=((fz*-jv.y-Math.sin(yaw)*jv.x)*sp-vz)*k;
  if(jumpReq&&!air){vy=8;beep(220,.1,'sine')}jumpReq=false;vy-=22*dt;
  C.position.x+=vx*dt;C.position.z+=vz*dt;C.position.y+=vy*dt;if(C.position.y<=1.6){C.position.y=1.6;vy=0}
  push(C.position,.6);if(online)sync(now);
  cd-=dt;grace-=dt;if(reload>0){reload-=dt;if(reload<=0){ammo=30;upd()}}
  if(firing&&cd<=0&&reload<=0&&!dead){shoot();cd=.14}
  bots.forEach(b=>{const p=b.m.position,dx=C.position.x-p.x,dz=C.position.z-p.z,d=Math.hypot(dx,dz)||1;b.m.rotation.y=Math.atan2(dx,dz);
   b.t-=dt;if(b.t<=0){b.t=1+Math.random()*1.5;b.dir*=-1}
   const mv=(d>14?3:0)*dt;p.x+=dx/d*mv+(dz/d)*b.dir*2*dt;p.z+=dz/d*mv+(-dx/d)*b.dir*2*dt;push(p,.5);
   b.s-=dt;if(b.s<=0){b.s=1.1+Math.random()*.8;if(grace<=0&&d<30&&Math.random()<(nBots>5?.5:.35)){hp=Math.max(0,hp-7);upd();vib(40);beep(90,.12,'sawtooth');$('dmg').style.opacity=.7;setTimeout(()=>$('dmg').style.opacity=0,200);if(hp<=0)finish(false)}}});
 }
 dying=dying.filter(o=>{o.t+=dt;o.m.rotation.x=-Math.min(o.t*4,1.5);o.m.position.y=-Math.min(o.t,1)*.3;if(o.t>2){S.remove(o.m);return false}return true});
 R.render(S,C)}
function mkMan(col){const m=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(.9,1.3,.5),new THREE.MeshLambertMaterial({color:col}));b.position.y=1;b.castShadow=true;
 const h=new THREE.Mesh(new THREE.SphereGeometry(.25,12,12),new THREE.MeshLambertMaterial({color:0xf0c8a0}));h.position.y=1.9;m.add(b,h);S.add(m);return m}
function sync(now){if(dead)C.position.y=.5;for(const id in others){const o=others[id];o.m.position.lerp(o.t,.35);o.m.rotation.y=o.ry}
 if(ws&&ws.readyState===1&&!dead&&now-lastSend>66){lastSend=now;ws.send(JSON.stringify({t:'pos',x:C.position.x,y:C.position.y,z:C.position.z,yaw}))}}
function leaveOnline(msg){try{ws&&ws.close()}catch(e){}ws=null;for(const id in others)S.remove(others[id].m);others={};crates.forEach(c=>S.remove(c));crates=[];
 state='idle';online=false;$('hud').classList.remove('on');document.body.classList.remove('playing');$('exit').style.display='none';$('msg').textContent='';show('lobby');
 document.querySelectorAll('.mode').forEach(x=>x.classList.toggle('sel',x.dataset.n==='5'));nBots=5;$('who').style.whiteSpace='normal';$('who').textContent=msg||''}
function startOnline(){
 hp=100;ammo=30;kills=0;yaw=0;pitch=0;vx=vy=vz=0;dead=false;grace=0;
 [...bots.map(b=>b.m),...dying.map(b=>b.m),...crates].forEach(o=>S.remove(o));bots=[];dying=[];crates=[];hits=[];
 show('none');$('hud').classList.add('on');document.body.classList.add('playing');$('exit').style.display='flex';say('Conectando…');state='wait';upd();
 let ok=false;try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host)}catch(e){return leaveOnline('Servidor offline')}
 ws.onopen=()=>ws.send(JSON.stringify({t:'join',nick:$('nick').value||'Jogador',color}));
 ws.onerror=()=>{if(!ok)leaveOnline('Servidor offline. O modo online só funciona no jogo hospedado no Render.')};
 ws.onclose=()=>{if(ok&&state==='play')leaveOnline('Conexão perdida')};
 ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}
  if(m.t==='welcome'){ok=true;myId=m.id;const cm=new THREE.MeshLambertMaterial({color:0x8a6a45});
   m.crates.forEach(c=>{const b=new THREE.Mesh(new THREE.BoxGeometry(3,2.6,3),cm);b.castShadow=b.receiveShadow=true;b.position.set(c.x,1.3,c.z);S.add(b);crates.push(b)});
   C.position.set(m.x,1.6,m.z);state='play';last=performance.now();say('Valendo!',1000)}
  else if(m.t==='state'){const seen={};
   m.p.forEach(q=>{if(q.id===myId){if(q.hp<hp){$('dmg').style.opacity=.7;setTimeout(()=>$('dmg').style.opacity=0,200);vib(40)}hp=q.hp;kills=q.k;$('hpf').style.width=hp+'%';$('kills').textContent='Abates: '+kills;return}
    seen[q.id]=1;let o=others[q.id];if(!o){o={m:mkMan(q.c),t:new THREE.Vector3(q.x,q.y-1.6,q.z),ry:0};o.m.position.copy(o.t);others[q.id]=o}
    o.t.set(q.x,q.y-1.6,q.z);o.ry=q.yaw+Math.PI;o.m.visible=q.a});
   for(const id in others)if(!seen[id]){S.remove(others[id].m);delete others[id]}
   $('left').textContent='Jogadores: '+m.p.length}
  else if(m.t==='hit'){$('cross').classList.add('hit');setTimeout(()=>$('cross').classList.remove('hit'),120);beep(520,.06)}
  else if(m.t==='kill')say('Abate!',700)
  else if(m.t==='dead'){dead=true;firing=false;say('Eliminado! Volta em 3s')}
  else if(m.t==='respawn'){C.position.set(m.x,1.6,m.z);dead=false;hp=100;ammo=30;upd();say('De volta!',700)}}
}
init();
