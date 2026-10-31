// BF: GO Halloween: 3ª pessoa, emotes, skins, arena
const SKN=['Normal','Fantasma','Abóbora','Esqueleto'],EM=[{n:'Dança',b:''},{n:'Risada',b:'MUAHAHA!'},{n:'Susto',b:'BUUU!'},{n:'GG',b:'GG'}];
let mySkin=0,tp3=false,selfM=null,emoteOpen=false,hwDone=false;const SK={},TEX={};
(function(){const h=$('hud');
 const b=(id,txt,css)=>{const d=document.createElement('div');d.className='act';d.id=id;d.dataset.b=id;d.textContent=txt;d.style.cssText=css;h.appendChild(d)};
 b('cam','3ª','top:34px;right:120px;width:34px;height:34px;border-radius:8px;font-size:14px;background:#122428cc');
 b('emote','EMOTE','right:268px;bottom:14px;width:60px;height:60px;font-size:11px;background:#b06cffcc');
 const g=document.createElement('div');g.id='emgrid';g.style.cssText='display:none;position:absolute;left:50%;bottom:20px;transform:translateX(-50%);gap:10px';
 EM.forEach((e,i)=>{const d=document.createElement('div');d.className='act';d.dataset.b='em'+i;d.textContent=e.n;d.style.cssText='position:static;width:62px;height:62px;font-size:11px;background:#b06cffee';g.appendChild(d)});h.appendChild(g);
 const row=document.createElement('div');row.className='row';
 SKN.forEach((n,i)=>{const d=document.createElement('button');d.className='seg alt'+(i?'':' sel');d.textContent=n;d.style.fontSize='12px';d.onclick=()=>{mySkin=i;row.querySelectorAll('button').forEach((x,j)=>x.classList.toggle('sel',j===i))};row.appendChild(d)});
 $('cols').after(row);
})();

function faceTex(k){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#1a0a00';
 if(k===2){x.beginPath();x.moveTo(24,40);x.lineTo(56,56);x.lineTo(20,62);x.fill();x.beginPath();x.moveTo(104,40);x.lineTo(72,56);x.lineTo(108,62);x.fill();
  x.beginPath();x.moveTo(64,66);x.lineTo(52,86);x.lineTo(76,86);x.fill();x.beginPath();x.moveTo(26,96);x.quadraticCurveTo(64,128,102,96);x.lineTo(92,92);x.lineTo(80,100);x.lineTo(64,92);x.lineTo(48,100);x.lineTo(36,92);x.fill()}
 else if(k===3){x.fillStyle='#111';x.beginPath();x.arc(40,56,16,0,7);x.fill();x.beginPath();x.arc(88,56,16,0,7);x.fill();x.beginPath();x.moveTo(64,72);x.lineTo(54,92);x.lineTo(74,92);x.fill();
  for(let i=0;i<6;i++)x.fillRect(34+i*10,104,6,16)}
 else{x.beginPath();x.ellipse(44,54,10,16,0,0,7);x.fill();x.beginPath();x.ellipse(84,54,10,16,0,0,7);x.fill();x.beginPath();x.ellipse(64,96,12,16,0,0,7);x.fill()}
 return new THREE.CanvasTexture(c)}
function applySkin(g,s){if(!s||g.userData.sk===s)return;g.userData.sk=s;const b=g.children[0],h=g.children[1];
 const cl=m=>{const n=m.clone();return n};
 b.material=cl(b.material);h.material=cl(h.material);
 if(s===1){b.material.color.set(0xf4f4ff);h.material.color.set(0xf4f4ff);b.material.transparent=h.material.transparent=true;b.material.opacity=.8;h.material.opacity=.85}
 else if(s===2){h.material.color.set(0xff7a1a);h.scale.setScalar(1.7)}
 else if(s===3){b.material.color.set(0xdcdcdc);h.material.color.set(0xf5f5f0)}
 const f=new THREE.Mesh(new THREE.PlaneGeometry(.42,.42),new THREE.MeshBasicMaterial({map:faceTex(s),transparent:true}));f.position.set(0,1.9,s===2?.44:.26);if(s===2)f.scale.setScalar(1.6);g.add(f)}

function bubble(g,txt){if(g.userData.bub)g.remove(g.userData.bub);const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');
 x.font='900 40px sans-serif';x.textAlign='center';x.lineWidth=8;x.strokeStyle='#000';x.strokeText(txt,128,46);x.fillStyle='#ffc83d';x.fillText(txt,128,46);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(3,.75,1);s.position.y=3.3;g.add(s);g.userData.bub=s}
function doEmote(g,e){g.userData.em={e,t:0};if(EM[e].b)bubble(g,EM[e].b)}
function animEm(g,dt){const u=g.userData.em;if(!u)return;u.t+=dt;const t=u.t,done=t>2.5;let off=0;g.rotation.z=0;g.scale.setScalar(1);
 if(!done){if(u.e===0){off=Math.abs(Math.sin(t*9))*.35;g.rotation.z=Math.sin(t*9)*.25}
  else if(u.e===1){g.rotation.z=Math.sin(t*35)*.12}
  else if(u.e===2){g.scale.setScalar(1+.35*Math.sin(Math.min(t/.4,1)*Math.PI));off=Math.max(0,.4-t)}
  else{off=Math.abs(Math.sin(t*7))*.2}}
 g.children.forEach(c=>{if(c.isSprite)return;if(c.userData.by===undefined)c.userData.by=c.position.y;c.position.y=c.userData.by+off});
 if(done){g.userData.em=null;if(g.userData.bub){g.remove(g.userData.bub);g.userData.bub=null}}}
function sendEmote(i){if(state!=='play')return;if(online&&ws&&ws.readyState===1)ws.send(JSON.stringify({t:'emote',e:i}));
 if(selfM&&tp3)doEmote(selfM,i);say(EM[i].b||EM[i].n,900)}

addEventListener('pointerdown',e=>{const b=e.target.dataset&&e.target.dataset.b;if(!b)return;
 if(b==='cam'){e.stopPropagation();tp3=!tp3;e.target.textContent=tp3?'1ª':'3ª'}
 else if(b==='emote'){e.stopPropagation();emoteOpen=!emoteOpen;$('emgrid').style.display=emoteOpen?'flex':'none'}
 else if(b.length===3&&b.slice(0,2)==='em'){e.stopPropagation();emoteOpen=false;$('emgrid').style.display='none';sendEmote(+b[2])}
},true);

const _so=startOnline;
startOnline=function(){_so();if(!ws)return;const om=ws.onmessage,oo=ws.onopen;
 ws.onopen=ev=>{oo&&oo(ev);ws.send(JSON.stringify({t:'skin',s:mySkin}))};
 ws.onmessage=ev=>{try{const m=JSON.parse(ev.data);if(m.t==='state')m.p.forEach(q=>{SK[q.id]=q.s|0});else if(m.t==='emote'&&m.id!==myId&&others[m.id])doEmote(others[m.id].m,m.e)}catch(x){}om&&om(ev)}};

const _rr=R.render.bind(R);
R.render=function(s,c){
 if(tp3&&state==='play'){
  const key=color+'-'+mySkin;if(!selfM||selfM.userData.key!==key){if(selfM)S.remove(selfM);selfM=mkMan(color);selfM.userData.key=key;applySkin(selfM,mySkin)}
  selfM.visible=true;const y=yaw,ox=C.position.x,oy=C.position.y,oz=C.position.z;
  selfM.position.set(ox,oy-1.6,oz);selfM.rotation.y=y+Math.PI;
  C.position.set(ox+Math.sin(y)*3.4+Math.cos(y)*.7,Math.max(.6,oy+.8),oz+Math.cos(y)*3.4-Math.sin(y)*.7);
  _rr(s,c);C.position.set(ox,oy,oz)}
 else{if(selfM)selfM.visible=false;_rr(s,c)}};

function hwTheme(){if(hwDone||!S)return;hwDone=true;
 S.background=new THREE.Color(0x120a26);S.fog.color.set(0x2a1236);
 S.children.forEach(o=>{if(o.isHemisphereLight){o.color.set(0x9a7fd0);o.groundColor.set(0x221133)}if(o.isDirectionalLight){o.color.set(0xffb070);o.intensity=.55}
  if(o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'){o.material.color.set(0x7a9a70);if(TEX.grass)o.material.map=TEX.grass;o.material.needsUpdate=true}});
 const moon=new THREE.Mesh(new THREE.SphereGeometry(14,24,24),new THREE.MeshBasicMaterial({color:0xfff2c0,fog:false}));moon.position.set(-70,55,-130);S.add(moon);
 let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647,ft=faceTex(2);
 for(let i=0;i<14;i++){const g=new THREE.Group(),p=new THREE.Mesh(new THREE.SphereGeometry(.7,14,10),new THREE.MeshLambertMaterial({color:0xff7a1a,emissive:0x401800}));p.scale.y=.85;p.position.y=.6;
  const st=new THREE.Mesh(new THREE.BoxGeometry(.12,.25,.12),new THREE.MeshLambertMaterial({color:0x3a7d2c}));st.position.y=1.28;
  const f=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9),new THREE.MeshBasicMaterial({map:ft,transparent:true}));f.position.set(0,.6,.71);g.add(p,st,f);
  let x,z;do{x=(r()-.5)*100;z=(r()-.5)*100}while(Math.hypot(x,z)<10);g.position.set(x,0,z);g.rotation.y=r()*6.28;S.add(g)}}

function hwTick(now){requestAnimationFrame(hwTick);const dt=Math.min((now-(hwTick.p||now))/1000,.1);hwTick.p=now;if(!S)return;
 if(TEX.woodMat)crates.forEach(c=>{if(!c.userData.hw){c.material=TEX.woodMat;c.userData.hw=1}});
 for(const id in others){const o=others[id];if(SK[id])applySkin(o.m,SK[id]);animEm(o.m,dt)}
 if(selfM)animEm(selfM,dt)}
requestAnimationFrame(hwTick);
