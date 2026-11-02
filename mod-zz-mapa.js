// BF: GO mapa (servidor): paredes das cidades bloqueiam tiros
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
module.exports=ctx=>{
 const {H}=ctx,M=BF_MAP();
 const hit=(a,b,t)=>{let t0=0,t1=1;
  for(const [k,lo,hi] of [['x',t.x-1.5,t.x+1.5],['y',0,2.6],['z',t.z-1.5,t.z+1.5]]){
   const d=b[k]-a[k];
   if(Math.abs(d)<1e-9){if(a[k]<lo||a[k]>hi)return false}
   else{let u=(lo-a[k])/d,v=(hi-a[k])/d;if(u>v)[u,v]=[v,u];t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1)return false}}
  return true};
 H.canHit.push((p,q)=>{const a={x:p.x,y:p.y,z:p.z},b={x:q.x,y:q.y-.6,z:q.z};return !M.tiles.some(t=>hit(a,b,t))});
};
