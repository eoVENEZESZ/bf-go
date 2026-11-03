// BF: GO baús de loot nas casas (jogo)
const LC=[[-34,-34],[34,-34],[-34,34],[34,34],[0,0]],LO=[[-10,-5],[10,-5],[0,11]],LK=['vida','colete','municao'],LCOL=[0x3ddc84,0x4aa3ff,0xffc83d],LTXT=['+40 de vida','Colete: +50 de vida extra','Munição cheia'];
const CH=[];LC.forEach(c=>LO.forEach(o=>CH.push({x:c[0]+o[0],z:c[1]+o[1],on:true,k:Math.floor(Math.random()*3),t:0,m:null})));
let chMade=0;
function makeChests(){if(chMade||!S)return;chMade=1;CH.forEach(c=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.9,.7,.7),new THREE.MeshLambertMaterial({color:0xffc83d,emissive:0x553300}));m.position.set(c.x,.5,c.z);S.add(m);c.m=m})}
function chestTick(){requestAnimationFrame(chestTick);if(!S)return;
 if(state!=='play'&&state!=='pause'){CH.forEach(c=>{if(c.m)c.m.visible=false});return}
 makeChests();const now=performance.now();
 CH.forEach(c=>{const m=c.m;if(!m)return;m.visible=c.on;m.rotation.y+=.02;m.material.color.setHex(LCOL[c.k]);m.material.emissive.setHex(LCOL[c.k]).multiplyScalar(.3);
  if(!online&&state==='play'){
   if(c.on&&Math.hypot(C.position.x-c.x,C.position.z-c.z)<1.7){c.on=false;c.t=now+45000;
    if(c.k===0)hp=Math.min(100,hp+40);else if(c.k===1)hp=Math.min(150,hp+50);else ammo=30;
    upd();say(LTXT[c.k],900);beep(660,.1,'sine')}
   else if(!c.on&&now>c.t){c.on=true;c.k=Math.floor(Math.random()*3)}}});
 if($('ffhp'))$('ffhp').style.background=hp>100?'#4aa3ff':'#3ddc97'}
requestAnimationFrame(chestTick);
const _b8=build;
build=function(){_b8();CH.forEach(c=>{c.on=true;c.k=Math.floor(Math.random()*3)})};
const _so8=startOnline;
startOnline=function(){_so8();if(!ws)return;const om=ws.onmessage;
 ws.onmessage=ev=>{try{const m=JSON.parse(ev.data);
  if(m.t==='chests')m.on.forEach((f,i)=>{if(CH[i]){CH[i].on=!!f;CH[i].k=m.k[i]}});
  else if(m.t==='loot'){say(LTXT[LK.indexOf(m.k)],900);beep(660,.1,'sine');if(m.k==='municao'){ammo=30;upd()}}}catch(x){}
  om&&om(ev)}};
