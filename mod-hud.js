// BF: GO HUD estilo battle royale + câmera só em 3ª pessoa
tp3=true;$('cam').style.display='none';
const GUN='<svg viewBox="0 0 80 50"><path d="M4 18h46l4-6h22v10H58l-3 5H40l-4 18H24l4-18H4z" fill="#fff"/></svg>';
let ffLbl='',ffn=0;
(function(){
 const st=document.createElement('style');st.textContent='#top,#fire,#jump,#wpn,#emote,#cam,#hp,#ammo{display:none!important}'+
 '#ffhud{position:absolute;inset:0;pointer-events:none;color:#fff}'+
 '#ffmap{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;width:100px;height:100px;border-radius:50%;border:3px solid #fffc;background:#0b0b14}'+
 '#ffinfo{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);display:flex;gap:8px}'+
 '.chip{background:#0b0b14b0;border:1px solid #fff6;border-radius:14px;padding:3px 10px;font:800 13px system-ui}'+
 '#ffpanel{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 8px);width:min(44vw,250px);display:flex;flex-direction:column;gap:5px}'+
 '#ffslots{display:flex;gap:5px;justify-content:center}'+
 '.ffs{pointer-events:auto;touch-action:none;background:#0b0b14b0;border:2px solid #fff6;border-radius:8px;padding:4px 8px;font:800 11px system-ui;text-align:center;min-width:52px}'+
 '.ffs.on{border-color:#ff6a2b;background:#ff6a2bcc}'+
 '#ffhpw{position:relative;height:16px;background:#0b0b14b0;border:2px solid #fffc;border-radius:8px;overflow:hidden}'+
 '#ffhp{height:100%;width:100%;background:#3ddc97}'+
 '#ffhpt{position:absolute;inset:0;text-align:center;font:900 11px/12px system-ui}'+
 '#ffammo{text-align:center;font:900 14px system-ui;text-shadow:0 1px 3px #000}'+
 '.ffb{position:absolute;border-radius:50%;background:#0b0b14b8;border:3px solid #fffd;display:flex;align-items:center;justify-content:center;pointer-events:auto;touch-action:none;font:900 13px system-ui}'+
 '.ffb svg{width:62%;height:62%;pointer-events:none}'+
 '#ffire{right:28px;bottom:calc(env(safe-area-inset-bottom,0px) + 30px);width:98px;height:98px;background:#ff6a2be0}'+
 '#ffjump{right:140px;bottom:calc(env(safe-area-inset-bottom,0px) + 34px);width:58px;height:58px}'+
 '#ffrl{right:36px;bottom:calc(env(safe-area-inset-bottom,0px) + 144px);width:52px;height:52px}'+
 '#ffem{right:104px;bottom:calc(env(safe-area-inset-bottom,0px) + 122px);width:48px;height:48px}'+
 '#ffring{position:absolute;left:34px;bottom:calc(env(safe-area-inset-bottom,0px) + 34px);width:110px;height:110px;border-radius:50%;border:3px dashed #ffffff55}'+
 '#gear{top:calc(env(safe-area-inset-top,0px) + 8px)!important;right:12px!important}'+
 '#exit{top:calc(env(safe-area-inset-top,0px) + 8px)!important;right:58px!important}'+
 '#board{top:52px!important;right:12px!important}'+
 '#feed{top:116px!important;left:10px!important;transform:none!important;text-align:left!important}'+
 '#emgrid{bottom:100px!important}';
 document.head.appendChild(st);
 const r=document.createElement('div');r.id='ffhud';
 r.innerHTML='<canvas id="ffmap" width="100" height="100"></canvas><div id="ffinfo"><span class="chip" id="ffalive"></span><span class="chip" id="ffkills"></span></div>'+
 '<div id="ffpanel"><div id="ffslots"></div><div id="ffhpw"><div id="ffhp"></div><span id="ffhpt"></span></div><div id="ffammo"></div></div><div id="ffring"></div>'+
 '<div class="ffb" id="ffire" data-b="fire">'+GUN+'</div>'+
 '<div class="ffb" id="ffjump" data-b="jump"><svg viewBox="0 0 48 48"><path d="M10 30l14-14 14 14" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
 '<div class="ffb" id="ffrl" data-b="rl"><svg viewBox="0 0 48 48"><path d="M36 24a12 12 0 1 1-4-9" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M34 6v10H24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
 '<div class="ffb" id="ffem" data-b="emote"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="#fff" stroke-width="4"/><circle cx="18" cy="20" r="2.5" fill="#fff"/><circle cx="30" cy="20" r="2.5" fill="#fff"/><path d="M16 29q8 8 16 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg></div>';
 $('hud').appendChild(r);
 WP.forEach((w,i)=>{const d=document.createElement('div');d.className='ffs';d.dataset.b='wp'+i;d.textContent=w.n;$('ffslots').appendChild(d)});
})();
addEventListener('pointerdown',e=>{const b=e.target.dataset&&e.target.dataset.b;if(!b)return;
 if(b==='rl'){e.stopPropagation();if(state==='play'&&reload<=0&&ammo<30){reload=1.4;say('Recarregando…',1300)}}
 else if(b.length===3&&b.slice(0,2)==='wp'){e.stopPropagation();wi=+b[2]}
},true);

function cam3(){return{x:C.position.x+Math.sin(yaw)*3.4+Math.cos(yaw)*.7,y:Math.max(.6,C.position.y+.8),z:C.position.z+Math.cos(yaw)*3.4-Math.sin(yaw)*.7}}
function shoot(){
 const w=WP[wi],t=performance.now()/1000;
 if(t-lastShotT<w.cd)return;
 if(ammo<w.cost){reload=1.4;say('Recarregando…',1300);return}
 lastShotT=t;ammo-=w.cost;upd();beep(w.pel>1?110:160,.08);vib(15);pitch+=.012+Math.random()*.01;yaw+=(Math.random()-.5)*.012;
 const cp=cam3(),cy=Math.cos(pitch),aim=new THREE.Vector3(cp.x-Math.sin(yaw)*cy*45,cp.y+Math.sin(pitch)*45,cp.z-Math.cos(yaw)*cy*45);
 const eye=C.position.clone(),base=aim.sub(eye).normalize();
 if(online){if(ws&&ws.readyState===1)ws.send(JSON.stringify({t:'shot',w:wi,dx:base.x,dy:base.y,dz:base.z}))}
 else{
  let any=false;
  for(let i=0;i<w.pel;i++){
   const s=w.spr*.75,d=new THREE.Vector3(base.x+(Math.random()-.5)*2*s,base.y+(Math.random()-.5)*2*s,base.z+(Math.random()-.5)*2*s).normalize();
   const h=new THREE.Raycaster(eye,d).intersectObjects([...hits,...crates])[0];
   if(h&&h.object.userData.bot){const o=h.object.userData,bt=o.bot;if(bt.hp<=0)continue;bt.hp-=o.head?w.hd:w.dmg;any=true;
    const dx=bt.m.position.x-eye.x,dz=bt.m.position.z-eye.z,dd=Math.hypot(dx,dz)||1;bt.m.position.x+=dx/dd*.2;bt.m.position.z+=dz/dd*.2;
    if(bt.hp<=0&&bots.includes(bt)){bots=bots.filter(b=>b!==bt);hits=hits.filter(x=>x.userData.bot!==bt);dying.push({m:bt.m,t:0});kills++;upd();say(o.head?'Tiro na cabeça!':'Abate!',700);if(!bots.length){finish(true);return}}}}
  if(any){$('cross').classList.add('hit');setTimeout(()=>$('cross').classList.remove('hit'),120);beep(520,.06)}
 }
 if(ammo<=0){reload=1.4;say('Recarregando…',1300)}
}

function ffMap(){const g=$('ffmap').getContext('2d'),k=100/130,dot=(p,c)=>{g.fillStyle=c;g.fillRect(50+p.x*k-2,50+p.z*k-2,4,4)};
 g.clearRect(0,0,100,100);g.save();g.beginPath();g.arc(50,50,48,0,7);g.clip();g.fillStyle='#183222';g.fillRect(0,0,100,100);
 g.strokeStyle='#ff4040';g.lineWidth=2;g.beginPath();g.arc(50,50,Math.min(zr*k,70),0,7);g.stroke();
 crates.forEach(c=>dot(c.position,'#a98456'));mk.forEach(m=>{if(m.on)dot(m,'#3ddc84')});
 bots.forEach(b=>dot(b.m.position,'#ff4a4a'));for(const id in others)if(others[id].m.visible)dot(others[id].m.position,'#ff4a4a');
 g.translate(50+C.position.x*k,50+C.position.z*k);g.rotate(Math.atan2(-Math.cos(yaw),-Math.sin(yaw))+Math.PI/2);
 g.fillStyle='#fff';g.beginPath();g.moveTo(0,-6);g.lineTo(4,4);g.lineTo(-4,4);g.closePath();g.fill();g.restore()}
const setT=(id,t)=>{const e=$(id);if(e.textContent!==t)e.textContent=t};
function ffTick(){requestAnimationFrame(ffTick);if(!$('hud').classList.contains('on'))return;
 setT('ffalive','Vivos '+(online?Object.keys(others).length+1:bots.length+1));setT('ffkills','Abates '+(kills|0));
 $('ffhp').style.width=(hp||0)+'%';setT('ffhpt',String(Math.round(hp||0)));setT('ffammo',(ammo|0)+' / 30');
 $('ffslots').childNodes.forEach((s,i)=>s.classList.toggle('on',i===wi));
 const l=state==='plane'?'PULAR':state==='drop'?'ABRIR':'gun';if(l!==ffLbl){ffLbl=l;$('ffire').innerHTML=l==='gun'?GUN:l}
 if((ffn++&1)===0&&C)ffMap()}
requestAnimationFrame(ffTick);
