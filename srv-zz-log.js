// BF: GO registro de eventos (contas e conexões) para ver no Neon e nos Logs
module.exports=ctx=>{
 const {H,wss,players}=ctx;let pool=null,url=process.env.DATABASE_URL||'';
 try{const u=new URL(url);u.searchParams.delete('channel_binding');url=u.toString()}catch(e){}
 if(url){try{const {Pool}=require('pg');pool=new Pool({connectionString:url,max:1,connectionTimeoutMillis:15000});pool.on('error',()=>{});
  pool.query('CREATE TABLE IF NOT EXISTS eventos(id SERIAL PRIMARY KEY,quando TIMESTAMPTZ DEFAULT now(),tipo TEXT,nick TEXT)')
   .then(()=>pool.query("DELETE FROM eventos WHERE quando<now()-interval '30 days'")).catch(e=>{console.log('eventos erro',e.message);pool=null})}catch(e){}}
 const log=(tipo,nick)=>{console.log('EVENTO',tipo,nick);if(pool)pool.query('INSERT INTO eventos(tipo,nick) VALUES($1,$2)',[tipo,String(nick).slice(0,12)]).catch(()=>{})};
 H.tick.push(()=>{
  wss.clients.forEach(ws=>{if(ws.u&&ws._lg!==ws.u.id){ws._lg=ws.u.id;log('entrou no jogo',ws.u.nick)}});
  players.forEach(p=>{if(!p._lg){p._lg=1;log('entrou na partida',p.nick)}})});
 H.close.push((ws,p)=>{if(ws.u&&ws._lg)log('saiu do jogo',ws.u.nick);if(p&&p._lg)log('saiu da partida',p.nick)});
};
