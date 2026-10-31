// BF: GO social: banco de dados, amigos e equipes (Duo/Squad)
const crypto=require('crypto');
module.exports=ctx=>{
 const {H,send}=ctx;let pool=null;
 let url=process.env.DATABASE_URL||'';
 try{const u=new URL(url);u.searchParams.delete('channel_binding');url=u.toString()}catch(e){}
 if(url){try{const {Pool}=require('pg');pool=new Pool({connectionString:url,max:4,connectionTimeoutMillis:15000});pool.on('error',e=>console.log('pg erro',e.message));
  pool.query('CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,tk TEXT UNIQUE NOT NULL,code TEXT UNIQUE NOT NULL,nick TEXT NOT NULL,created TIMESTAMPTZ DEFAULT now())')
   .then(()=>pool.query('CREATE TABLE IF NOT EXISTS friends(a INT NOT NULL,b INT NOT NULL,PRIMARY KEY(a,b))'))
   .then(()=>console.log('banco ok')).catch(e=>{console.log('banco erro',e.message);pool=null})}catch(e){console.log('sem pg',e.message)}}
 else console.log('sem DATABASE_URL: amigos desligados');
 const on=new Map(),parties=new Map(),inv=new Map();
 const hash=t=>crypto.createHash('sha256').update(String(t)).digest('hex'),rid=()=>crypto.randomBytes(5).toString('hex');
 const rcode=()=>Array.from({length:6},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
 const ah=fn=>(ws,m,p)=>{fn(ws,m,p).catch(e=>console.log('erro social',e.message))};
 const cap=p=>p.mode==='duo'?2:4;
 async function login(tk,nick){const h=hash(tk);let r=await pool.query('SELECT id,code,nick FROM users WHERE tk=$1',[h]);
  if(r.rows[0]){const u=r.rows[0];if(nick&&nick!==u.nick){await pool.query('UPDATE users SET nick=$1 WHERE id=$2',[nick,u.id]);u.nick=nick}return u}
  for(let i=0;i<5;i++){try{r=await pool.query('INSERT INTO users(tk,code,nick) VALUES($1,$2,$3) RETURNING id,code,nick',[h,rcode(),nick||'Jogador']);return r.rows[0]}catch(e){}}
  throw new Error('nao criou usuario')}
 const friendsOf=async id=>(await pool.query('SELECT u.id,u.code,u.nick FROM friends f JOIN users u ON u.id=f.b WHERE f.a=$1 ORDER BY u.nick',[id])).rows.map(f=>({code:f.code,nick:f.nick,on:on.has(f.id)}));
 async function push(id){const e=on.get(id);if(e)send(e.ws,{t:'friends',list:await friendsOf(id)})}
 async function notify(id){(await pool.query('SELECT b FROM friends WHERE a=$1',[id])).rows.forEach(x=>push(x.b).catch(()=>{}))}
 const pinfo=p=>({t:'party',id:p.id,mode:p.mode,leader:on.get(p.leader)?.code,members:p.members.map(i=>{const u=on.get(i);return u&&{code:u.code,nick:u.nick}}).filter(Boolean)});
 const bparty=p=>p.members.forEach(i=>{const u=on.get(i);u&&send(u.ws,pinfo(p))});
 function leave(u){const p=u.party&&parties.get(u.party);u.party=null;if(!p)return;send(u.ws,{t:'party',none:true});
  p.members=p.members.filter(i=>i!==u.id);
  if(!p.members.length){parties.delete(p.id);return}
  if(p.leader===u.id)p.leader=p.members[0];
  if(p.members.length===1){const r=on.get(p.members[0]);if(r){r.party=null;send(r.ws,{t:'party',none:true})}parties.delete(p.id);return}
  bparty(p)}
 H.msg.hello=ah(async(ws,m)=>{
  if(!pool||typeof m.token!=='string'||m.token.length<16)return send(ws,{t:'me',off:true});
  const u=await login(m.token.slice(0,64),String(m.nick||'Jogador').slice(0,12)),prev=on.get(u.id);
  const e={ws,id:u.id,nick:u.nick,code:u.code,party:prev&&prev.ws===ws?prev.party:null};on.set(u.id,e);ws.u=e;
  send(ws,{t:'me',code:u.code,nick:u.nick});await push(u.id);await notify(u.id)});
 H.msg.addfriend=ah(async(ws,m)=>{const u=ws.u;if(!u||!pool)return;const code=String(m.code||'').trim().toUpperCase();
  const t=(await pool.query('SELECT id,nick FROM users WHERE code=$1',[code])).rows[0];
  if(!t)return send(ws,{t:'sinfo',m:'Código não encontrado.'});
  if(t.id===u.id)return send(ws,{t:'sinfo',m:'Esse é o seu próprio código.'});
  await pool.query('INSERT INTO friends(a,b) VALUES($1,$2),($2,$1) ON CONFLICT DO NOTHING',[u.id,t.id]);
  send(ws,{t:'sinfo',m:'Amigo adicionado: '+t.nick});await push(u.id);await push(t.id)});
 H.msg.pinvite=ah(async(ws,m)=>{const u=ws.u;if(!u||!pool)return;
  const t=(await pool.query('SELECT id FROM users WHERE code=$1',[String(m.code||'').toUpperCase()])).rows[0],tu=t&&on.get(t.id);
  if(!tu)return send(ws,{t:'sinfo',m:'Amigo offline.'});
  if(!(await pool.query('SELECT 1 FROM friends WHERE a=$1 AND b=$2',[u.id,tu.id])).rows.length)return;
  let p=u.party&&parties.get(u.party);
  if(!p){p={id:rid(),leader:u.id,mode:'duo',members:[u.id]};parties.set(p.id,p);u.party=p.id}
  if(p.leader!==u.id)return send(ws,{t:'sinfo',m:'Só o líder convida.'});
  if(tu.party)return send(ws,{t:'sinfo',m:'Esse amigo já está em uma equipe.'});
  if(p.members.length>=cap(p))return send(ws,{t:'sinfo',m:'Equipe cheia.'});
  inv.set(tu.id,p.id);send(tu.ws,{t:'invite',from:u.nick,party:p.id,mode:p.mode});bparty(p);send(ws,{t:'sinfo',m:'Convite enviado para '+tu.nick})});
 H.msg.paccept=(ws,m)=>{const u=ws.u;if(!u)return;const pid=inv.get(u.id);inv.delete(u.id);const p=parties.get(pid);if(!p||pid!==m.party||u.party)return;
  if(p.members.length>=cap(p))return send(ws,{t:'sinfo',m:'Equipe cheia.'});p.members.push(u.id);u.party=p.id;bparty(p)};
 H.msg.pdecline=ws=>{if(ws.u)inv.delete(ws.u.id)};
 H.msg.pmode=(ws,m)=>{const u=ws.u,p=u&&u.party&&parties.get(u.party);if(!p||p.leader!==u.id||(m.m!=='duo'&&m.m!=='squad'))return;
  if(m.m==='duo'&&p.members.length>2)return send(ws,{t:'sinfo',m:'Há mais de 2 na equipe.'});p.mode=m.m;bparty(p)};
 H.msg.pleave=ws=>{if(ws.u)leave(ws.u)};
 H.msg.pstart=(ws)=>{const u=ws.u,p=u&&u.party&&parties.get(u.party);if(!p||p.leader!==u.id||p.members.length<2)return;
  p.members.forEach(i=>{const x=on.get(i);x&&send(x.ws,{t:'pgo',team:p.id})})};
 H.msg.team=(ws,m,p)=>{if(parties.has(m.team))p.team=m.team};
 H.canHit.push((a,b)=>!(a.team&&a.team===b.team));
 H.state.push((q,e)=>{e.tm=q.team||'s'+q.id});
 H.close.push(ws=>{const u=ws.u;if(u&&on.get(u.id)&&on.get(u.id).ws===ws){leave(u);on.delete(u.id);inv.delete(u.id);if(pool)notify(u.id).catch(()=>{})}});
};
