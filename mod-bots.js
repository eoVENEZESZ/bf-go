// BF: GO 30 jogadores offline (29 bots) e até 40 online
document.querySelectorAll('.mode').forEach(b=>{b.textContent=b.dataset.o?'Online (40)':b.dataset.n==='5'?'Fácil (30)':'Difícil (30)'});
const _build=build;
build=function(){const n=nBots;nBots=29;_build();nBots=n;bots.forEach(b=>{b.w=null})};
const _so2=startOnline;
startOnline=function(){_so2();if(!ws)return;const om=ws.onmessage;
 ws.onmessage=ev=>{try{if(JSON.parse(ev.data).t==='full'){leaveOnline('Servidor cheio (40/40). Tente de novo em instantes.');return}}catch(x){}om&&om(ev)}};
let botCd=0;
function botsAI(dt){const P=C.position;botCd-=dt;
 bots.forEach(b=>{const p=b.m.position,dx=P.x-p.x,dz=P.z-p.z,d=Math.hypot(dx,dz)||1;
  if(d<24){b.m.rotation.y=Math.atan2(dx,dz);const mv=(d>12?3:0)*dt;p.x+=dx/d*mv+(dz/d)*b.dir*2*dt;p.z+=dz/d*mv+(-dx/d)*b.dir*2*dt;
   b.t-=dt;if(b.t<=0){b.t=1+Math.random()*1.5;b.dir*=-1}
   b.s-=dt;if(b.s<=0){b.s=1.3+Math.random()*1.2;
    if(grace<=0&&botCd<=0&&Math.random()<(nBots>5?.25:.12)){botCd=.3;hp=Math.max(0,hp-7);upd();vib(40);beep(90,.12,'sawtooth');$('dmg').style.opacity=.7;setTimeout(()=>$('dmg').style.opacity=0,200);if(hp<=0)finish(false)}}}
  else{if(!b.w||Math.hypot(b.w.x-p.x,b.w.z-p.z)<2)b.w={x:(Math.random()-.5)*100,z:(Math.random()-.5)*100};
   const wx=b.w.x-p.x,wz=b.w.z-p.z,wd=Math.hypot(wx,wz)||1;p.x+=wx/wd*2.4*dt;p.z+=wz/wd*2.4*dt;b.m.rotation.y=Math.atan2(wx,wz)}
  push(p,.5)})}
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
  if(!online)botsAI(dt);
 }
 dying=dying.filter(o=>{o.t+=dt;o.m.rotation.x=-Math.min(o.t*4,1.5);o.m.position.y=-Math.min(o.t,1)*.3;if(o.t>2){S.remove(o.m);return false}return true});
 R.render(S,C)}
