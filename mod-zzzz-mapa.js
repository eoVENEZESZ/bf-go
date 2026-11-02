// BF: GO mapa com 5 cidades e biomas (Floresta, Deserto, Neve, Vulcão e Porto)
function BF_MAP(){
 let sd=12345;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const crates=[];while(crates.length<16){const x=(rn()-.5)*80,z=(rn()-.5)*80;if(Math.hypot(x,z)>8)crates.push({x,z})}
 const C=[{n:'Floresta',cx:-34,cz:-34},{n:'Deserto',cx:34,cz:-34},{n:'Neve',cx:-34,cz:34},{n:'Vulcão',cx:34,cz:34},{n:'Porto',cx:0,cz:0}];
 let s2=777;const r2=()=>(s2=(s2*16807)%2147483647)/2147483647;
 const tiles=[],decor=[],near=(x,z,a,d)=>a.some(t=>Math.hypot(t.x-x,t.z-z)<d);
 C.forEach((c,b)=>{
  [[-10,-5],[10,-5],[0,11]].forEach(([ox,oz])=>{
   const bx=c.cx+ox,bz=c.cz+oz,dx=Math.abs(ox)>=Math.abs(oz)?-Math.sign(ox):0,dz=dx?0:-Math.sign(oz);
   for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){
    if(!i&&!j)continue;if(i===dx&&j===dz)continue;
    const x=bx+i*3,z=bz+j*3;if(!near(x,z,crates,3.4))tiles.push({x,z,b})}});
  for(let k=0;k<40;k++){const a=r2()*6.283,d=8+r2()*9,x=c.cx+Math.cos(a)*d,z=c.cz+Math.sin(a)*d,s=.8+r2()*.6;
   if(b===4&&Math.hypot(x-c.cx,z-c.cz)<8)continue;
   if(!near(x,z,tiles,3.5)&&!near(x,z,crates,2.5))decor.push({x,z,b,s})}});
 return {tiles,decor,crates,C}}
const MAPA=BF_MAP(),GR=[0x2e6b2a,0xc9a45c,0xdbe6ef,0x2a1f1f,0xe3cf9a],MC=['#2f8a3a','#d9b26f','#dbe6ef','#ff5a2a','#4aa3e8'];
const TG=new THREE.BoxGeometry(3,2.6,3),TM=[0x8a5a2b,0xd8b070,0x9fc4e0,0x4a3a3a,0x2f8fb0].map(c=>new THREE.MeshLambertMaterial({color:c}));
const DP=[
 [[new THREE.CylinderGeometry(.25,.35,2,6),1,0x5a3a1a],[new THREE.ConeGeometry(1.4,3.2,7),3.4,0x1e7a2e]],
 [[new THREE.CylinderGeometry(.35,.4,2.6,6),1.3,0x3a8a3a],[new THREE.SphereGeometry(.45,6,5),2.7,0x3a8a3a]],
 [[new THREE.CylinderGeometry(.25,.35,2,6),1,0x5a3a1a],[new THREE.ConeGeometry(1.3,3.4,7),3.4,0xeef4ff]],
 [[new THREE.ConeGeometry(1,2.6,5),1.3,0x2a2020],[new THREE.ConeGeometry(.6,1.6,5),.8,0x5a2a22]],
 [[new THREE.CylinderGeometry(.2,.3,3,6),1.5,0x8a6a3a],[new THREE.SphereGeometry(1.1,7,6),3.3,0x2f9a3f]]];
let SCN=0,curCity='';
function sceneryOnce(){if(SCN||!S)return;SCN=1;
 MAPA.C.forEach((c,b)=>{const g=new THREE.Mesh(new THREE.CircleGeometry(b===4?20:17,40),new THREE.MeshLambertMaterial({color:GR[b]}));g.rotation.x=-Math.PI/2;g.position.set(c.cx,.03+b*.003,c.cz);S.add(g)});
 const lava=new THREE.MeshBasicMaterial({color:0xff4a10}),wat=new THREE.MeshLambertMaterial({color:0x2a7fd0,transparent:true,opacity:.85});
 [[30,30],[38,36],[36,28],[31,38]].forEach(([x,z])=>{const l=new THREE.Mesh(new THREE.CircleGeometry(2.6,16),lava);l.rotation.x=-Math.PI/2;l.position.set(x,.06,z);S.add(l)});
 const w=new THREE.Mesh(new THREE.CircleGeometry(6,28),wat);w.rotation.x=-Math.PI/2;w.position.set(0,.06,0);S.add(w);
 for(let b=0;b<5;b++){const ds=MAPA.decor.filter(d=>d.b===b),dm=new THREE.Object3D();
  DP[b].forEach(([geo,y,col])=>{const im=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:col}),ds.length);im.frustumCulled=false;
   ds.forEach((d,i)=>{dm.position.set(d.x,y*d.s,d.z);dm.scale.setScalar(d.s);dm.updateMatrix();im.setMatrixAt(i,dm.matrix)});S.add(im)})}}
function addTiles(){MAPA.tiles.forEach(t=>{const m=new THREE.Mesh(TG,TM[t.b]);m.position.set(t.x,1.3,t.z);m.userData.hw=1;m.userData.city=1;S.add(m);crates.push(m)})}
function fixCrates(){crates.forEach((c,i)=>{const p=MAPA.crates[i];if(p&&!c.userData.city){c.position.x=p.x;c.position.z=p.z}})}
const _b9=build;
build=function(){_b9();sceneryOnce();fixCrates();addTiles()};
const _so9=startOnline;
startOnline=function(){_so9();if(!ws)return;const om=ws.onmessage;
 ws.onmessage=ev=>{om&&om(ev);try{if(JSON.parse(ev.data).t==='welcome'){sceneryOnce();addTiles()}}catch(x){}}};
const _fm9=ffMap;
ffMap=function(){_fm9();const g=$('ffmap').getContext('2d'),k=100/130;g.save();g.beginPath();g.arc(50,50,48,0,7);g.clip();
 MAPA.C.forEach((c,b)=>{g.fillStyle=MC[b]+'55';g.beginPath();g.arc(50+c.cx*k,50+c.cz*k,15*k,0,7);g.fill()});g.restore()};
function cityTick(){requestAnimationFrame(cityTick);if(state!=='play'||!C)return;let n='';
 MAPA.C.forEach(c=>{if(Math.hypot(C.position.x-c.cx,C.position.z-c.cz)<14)n=c.n});
 if(n!==curCity){curCity=n;if(n)say('Entrando: '+n,1800)}}
requestAnimationFrame(cityTick);
