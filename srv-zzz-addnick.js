// BF: GO adicionar amigo pelo nome (garantia)
module.exports=ctx=>{
 const {H,send}=ctx;let pool=null,url=process.env.DATABASE_URL||'';
 try{const u=new URL(url);u.searchParams.delete('channel_binding');url=u.toString()}catch(e){}
 if(url){try{const {Pool}=require('pg');pool=new Pool({connectionString:url,max:2,connectionTimeoutMillis:15000});pool.on('error',()=>{})}catch(e){}}
 const old=H.msg.addfriend;
 H.msg.addfriend=async(ws,m,p)=>{try{if(!pool||m.nick===undefined)return old(ws,m,p);
  const n=String(m.nick).trim().slice(0,12);console.log('adicionar por nome:',n);
  const r=(await pool.query('SELECT code FROM users WHERE lower(nick)=lower($1) ORDER BY id LIMIT 1',[n])).rows[0];
  if(!r)return send(ws,{t:'sinfo',m:'Jogador "'+n+'" não encontrado.'});
  return old(ws,Object.assign({},m,{code:r.code}),p)}catch(e){console.log('erro addnick',e.message)}};
};
