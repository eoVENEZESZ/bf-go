// BF: GO baús de loot nas casas (servidor)
module.exports=ctx=>{
 const {H,players,send,bc}=ctx;
 const C=[[-34,-34],[34,-34],[-34,34],[34,34],[0,0]],O=[[-10,-5],[10,-5],[0,11]],POS=[],KINDS=['vida','colete','municao'],pick=()=>Math.floor(Math.random()*3);
 C.forEach(c=>O.forEach(o=>POS.push({x:c[0]+o[0],z:c[1]+o[1],on:true,k:pick(),t:0})));
 let tk=0;
 const snap=()=>({t:'chests',on:POS.map(c=>c.on?1:0),k:POS.map(c=>c.k)});
 H.tick.push(()=>{let ch=false;const now=Date.now();
  for(const q of players){if(!q.a)continue;
   for(const c of POS){if(c.on&&Math.hypot(q.x-c.x,q.z-c.z)<1.7&&q.y<4){c.on=false;c.t=now+45000;ch=true;
    if(c.k===0)q.hp=Math.min(100,q.hp+40);else if(c.k===1)q.hp=Math.min(150,q.hp+50);
    send(q.ws,{t:'loot',k:KINDS[c.k]})}}}
  POS.forEach(c=>{if(!c.on&&now>c.t){c.on=true;c.k=pick();ch=true}});
  if(ch||++tk%20===0)bc(snap())});
};
