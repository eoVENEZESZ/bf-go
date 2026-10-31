// BF: GO perfil: nível, XP, moedas e missões diárias (salvo na conta)
module.exports=ctx=>{
 const {H,send}=ctx;let pool=null,url=process.env.DATABASE_URL||'';
 try{const u=new URL(url);u.searchParams.delete('channel_binding');url=u.toString()}catch(e){}
 if(url){try{const {Pool}=require('pg');pool=new Pool({connectionString:url,max:2,connectionTimeoutMillis:15000});pool.on('error',()=>{});
  pool.query("CREATE TABLE IF NOT EXISTS profiles(uid INT PRIMARY KEY,xp INT NOT NULL DEFAULT 0,coins INT NOT NULL DEFAULT 0,day TEXT NOT NULL DEFAULT '',prog TEXT NOT NULL DEFAULT '{}',claimed TEXT NOT NULL DEFAULT '[]')")
   .then(()=>console.log('perfil ok')).catch(e=>{console.log('perfil erro',e.message);pool=null})}catch(e){console.log('perfil sem pg')}}
 const POOL=[{t:'kills',n:5,xp:60,c:20,x:'Elimine 5 jogadores'},{t:'kills',n:10,xp:120,c:40,x:'Elimine 10 jogadores'},{t:'played',n:2,xp:60,c:20,x:'Jogue 2 partidas'},{t:'played',n:3,xp:90,c:30,x:'Jogue 3 partidas'},{t:'won',n:1,xp:150,c:50,x:'Vença 1 partida'},{t:'emotes',n:3,xp:40,c:15,x:'Use 3 emotes'}];
 const EVENT={t:'kills',n:15,xp:200,c:100,x:'Evento Halloween: elimine 15 jogadores',ev:1};
 const today=()=>new Date(Date.now()-3*3600e3).toISOString().slice(0,10);
 const missionsFor=d=>{let s=0;for(const ch of d)s=(s*31+ch.charCodeAt(0))>>>0;const a=POOL.slice(),r=[];while(r.length<3){s=(s*1103515245+12345)>>>0;r.push(a.splice(s%a.length,1)[0])}return [...r,EVENT]};
 const lvl=xp=>Math.floor(Math.sqrt(xp/100))+1;
 const ah=fn=>(ws,m,p)=>{fn(ws,m,p).catch(e=>console.log('erro perfil',e.message))};
 async function load(uid){const d=today();let row=(await pool.query('SELECT xp,coins,day,prog,claimed FROM profiles WHERE uid=$1',[uid])).rows[0];
  if(!row){await pool.query('INSERT INTO profiles(uid,day) VALUES($1,$2) ON CONFLICT DO NOTHING',[uid,d]);row={xp:0,coins:0,day:d,prog:'{}',claimed:'[]'}}
  if(row.day!==d){row.day=d;row.prog='{}';row.claimed='[]'}
  return {xp:row.xp,coins:row.coins,day:d,prog:JSON.parse(row.prog),claimed:JSON.parse(row.claimed)}}
 const save=(uid,P)=>pool.query('UPDATE profiles SET xp=$2,coins=$3,day=$4,prog=$5,claimed=$6 WHERE uid=$1',[uid,P.xp,P.coins,P.day,JSON.stringify(P.prog),JSON.stringify(P.claimed)]);
 const view=P=>{const L=lvl(P.xp);return {t:'profile',lv:L,xp:P.xp,from:(L-1)*(L-1)*100,to:L*L*100,coins:P.coins,
  ms:missionsFor(P.day).map((m,i)=>({x:m.x,n:m.n,p:Math.min(P.prog[m.t]||0,m.n),xp:m.xp,c:m.c,ev:m.ev?1:0,cl:P.claimed.includes(i)?1:0}))}};
 H.msg.profile=ah(async ws=>{if(!ws.u||!pool)return;send(ws,view(await load(ws.u.id)))});
 H.msg.report=ah(async(ws,m)=>{if(!ws.u||!pool)return;const now=Date.now();if(ws.lr&&now-ws.lr<15000)return;ws.lr=now;
  const k=Math.max(0,Math.min(40,m.kills|0)),w=m.won?1:0,e=Math.max(0,Math.min(20,m.emotes|0)),P=await load(ws.u.id);
  P.prog.kills=(P.prog.kills||0)+k;P.prog.played=(P.prog.played||0)+1;P.prog.won=(P.prog.won||0)+w;P.prog.emotes=(P.prog.emotes||0)+e;
  const gx=20+k*10+w*50,gc=k*2+w*10;P.xp+=gx;P.coins+=gc;await save(ws.u.id,P);send(ws,Object.assign(view(P),{gain:{xp:gx,c:gc}}))});
 H.msg.claim=ah(async(ws,m)=>{if(!ws.u||!pool)return;const P=await load(ws.u.id),i=m.i|0,mm=missionsFor(P.day)[i];
  if(!mm||P.claimed.includes(i)||(P.prog[mm.t]||0)<mm.n)return;P.claimed.push(i);P.xp+=mm.xp;P.coins+=mm.c;await save(ws.u.id,P);send(ws,Object.assign(view(P),{gain:{xp:mm.xp,c:mm.c}}))});
};
