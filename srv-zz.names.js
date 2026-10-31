// BF: GO nomes únicos (sem senha) e amigos pelo nome
const crypto=require('crypto');
module.exports=ctx=>{
 const {H,send}=ctx;let pool=null,url=process.env.DATABASE_URL||'';
 try{const u=new URL(url);u.searchParams.delete('channel_binding');url=u.toString()}catch(e){}
 if(url){try{const {Pool}=require('pg');pool=new Pool({connectionString:url,max:2,connectionTimeoutMillis:15000});pool.on('error',()=>{})}catch(e){}}
 const hash=t=>crypto.createHash('sha256').update(String(t)).digest('hex');
 const oldHello=H.msg.hello,oldAdd=H.msg.addfriend;
 H.msg.hello=async(ws,m,p)=>{
  try{if(!pool||typeof m.token!=='string'||m.token.length<16)return oldHello(ws,m,p);
   const nick=String(m.nick||'Jogador').trim().slice(0,12),h=hash(m.token.slice(0,64));
   const mine=(await pool.query('SELECT id,nick FROM users WHERE tk=$1',[h])).rows[0];
   const taken=(await pool.query('SELECT 1 FROM users WHERE lower(nick)=lower($1) AND tk<>$2',[nick,h])).rows.length;
   if(taken){send(ws,{t:'nickfail',m:'O nome "'+nick+'" já está em uso. Escolha outro.'});if(mine)return oldHello(ws,Object.assign({},m,{nick:mine.nick}),p);return}
   return oldHello(ws,m,p)}catch(e){console.log('erro nomes',e.message)}};
 H.msg.addfriend=async(ws,m,p)=>{
  try{if(m.nick===undefined||!pool)return oldAdd(ws,m,p);
   const n=String(m.nick).trim().slice(0,12),r=(await pool.query('SELECT code FROM users WHERE lower(nick)=lower($1) ORDER BY id LIMIT 1',[n])).rows[0];
   if(!r)return send(ws,{t:'sinfo',m:'Jogador "'+n+'" não encontrado.'});
   return oldAdd(ws,Object.assign({},m,{code:r.code}),p)}catch(e){console.log('erro nomes',e.message)}};
};
