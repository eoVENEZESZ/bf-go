// BF: GO buscar jogadores pelo nome (sugestões ao digitar)
module.exports=ctx=>{
 const {H,send}=ctx;let pool=null,url=process.env.DATABASE_URL||'';
 try{const u=new URL(url);u.searchParams.delete('channel_binding');url=u.toString()}catch(e){}
 if(url){try{const {Pool}=require('pg');pool=new Pool({connectionString:url,max:2,connectionTimeoutMillis:15000});pool.on('error',()=>{})}catch(e){}}
 H.msg.find=async(ws,m)=>{try{if(!ws.u||!pool)return;const q=String(m.q||'').replace(/[%_\\]/g,'').trim().slice(0,12);
  if(q.length<2)return send(ws,{t:'found',list:[]});
  const r=await pool.query("SELECT nick FROM users WHERE lower(nick) LIKE lower($1)||'%' AND id<>$2 ORDER BY nick LIMIT 6",[q,ws.u.id]);
  send(ws,{t:'found',list:r.rows.map(x=>x.nick)})}catch(e){console.log('erro busca',e.message)}};
};
