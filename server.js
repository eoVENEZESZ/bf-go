const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const server=http.createServer((req,res)=>{
  try{
    const mods=['extra.js',...fs.readdirSync(__dirname).filter(f=>/^mod-[\w-]+\.js$/.test(f)).sort()];
    const nm=req.url.split('?')[0].slice(1);
    if(mods.includes(nm)){res.writeHead(200,{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-cache'});return res.end(read(nm))}
    const html=read('index.html').replace('</body>',mods.map(f=>'<script src="/'+f+'"></script>').join('\n')+'\n</body>');
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(html);
  }catch(e){res.writeHead(500);res.end('erro')}
});
const wss=new WebSocketServer({server});
let seed=12345;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const crates=[];while(crates.length<16){const x=(rnd()-.5)*80,z=(rnd()-.5)*80;if(Math.hypot(x,z)>8)crates.push({x,z})}
const meds=[];while(meds.length<6){const x=(rnd()-.5)*70,z=(rnd()-.5)*70;if(Math.hypot(x,z)>6)meds.push({x,z,on:true})}
const WP=[{dmg:20,hd:45,cd:250,pel:1,spr:0},{dmg:25,hd:60,cd:90,pel:1,spr:.004},{dmg:12,hd:24,cd:650,pel:6,spr:.09}];
const T0=Date.now();
const zone=()=>{const t=((Date.now()-T0)/1000)%160;return t<20?80:t<120?Math.max(14,80-(t-20)*.66):14};
const players=new Set();let nextId=1;
const num=(v,a,b,d=0)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):d;
const spawn=()=>({x:(Math.random()-.5)*70,z:(Math.random()-.5)*70});
const send=(w,o)=>{if(w.readyState===1)w.send(JSON.stringify(o))};
const bc=o=>{const s=JSON.stringify(o);players.forEach(q=>{if(q.ws.readyState===1)q.ws.send(s)})};
function rs(o,d,c,r){const lx=c.x-o.x,ly=c.y-o.y,lz=c.z-o.z,t=lx*d.x+ly*d.y+lz*d.z;if(t<0)return null;const q=lx*lx+ly*ly+lz*lz-t*t;return q>r*r?null:t-Math.sqrt(r*r-q)}
function rb(o,d,c){let a=0,b=1e9;for(const [k,h,m] of [['x',1.5,c.x],['y',1.3,1.3],['z',1.5,c.z]]){
  const lo=m-h-o[k],hi=m+h-o[k],dk=d[k];
  if(Math.abs(dk)<1e-9){if(lo>0||hi<0)return null}
  else{let t1=lo/dk,t2=hi/dk;if(t1>t2)[t1,t2]=[t2,t1];a=Math.max(a,t1);b=Math.min(b,t2);if(a>b)return null}
}return a}
function die(v,by,killer){
  v.a=false;v.hp=0;bc({t:'feed',a:by,b:v.nick});send(v.ws,{t:'dead'});
  if(killer){killer.k++;send(killer.ws,{t:'kill'})}
  setTimeout(()=>{if(!players.has(v))return;const r=spawn();v.x=r.x;v.z=r.z;v.y=1.6;v.hp=100;v.a=true;send(v.ws,{t:'respawn',x:r.x,z:r.z})},3000);
}
wss.on('connection',ws=>{
  const s=spawn(),p={ws,id:nextId++,nick:'Jogador',c:0xff6a2b,x:s.x,y:1.6,z:s.z,yaw:0,hp:100,k:0,a:true,joined:false,lastShot:0,skin:0,lastEm:0};
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw)}catch(e){return}
    if(m.t==='join'&&!p.joined){
      p.joined=true;p.nick=String(m.nick||'Jogador').slice(0,12);
      p.c=Number.isInteger(m.color)&&m.color>=0&&m.color<=0xffffff?m.color:0xff6a2b;
      players.add(p);send(ws,{t:'welcome',id:p.id,crates,mk:meds.map(k=>({x:k.x,z:k.z})),x:p.x,z:p.z});
    }else if(!p.joined||!p.a){return}
    else if(m.t==='skin'){p.skin=Math.max(0,Math.min(3,m.s|0))}
    else if(m.t==='emote'){const n=Date.now();if(n-p.lastEm<1200)return;p.lastEm=n;bc({t:'emote',id:p.id,e:Math.max(0,Math.min(3,m.e|0))})}
    else if(m.t==='pos'){p.x=num(m.x,-56,56);p.y=num(m.y,.5,60,1.6);p.z=num(m.z,-56,56);p.yaw=num(m.yaw,-1e4,1e4)}
    else if(m.t==='shot'){
      const w=WP[m.w]||WP[1],now=Date.now();if(now-p.lastShot<w.cd*.8)return;p.lastShot=now;
      const dl=Math.hypot(m.dx,m.dy,m.dz);if(!(dl>0))return;
      const o={x:p.x,y:p.y,z:p.z},dm=new Map();
      for(let i=0;i<w.pel;i++){
        const d={x:m.dx/dl+(Math.random()-.5)*w.spr*2,y:m.dy/dl+(Math.random()-.5)*w.spr*2,z:m.dz/dl+(Math.random()-.5)*w.spr*2};
        const n=Math.hypot(d.x,d.y,d.z);d.x/=n;d.y/=n;d.z/=n;
        let best=1e9;for(const c of crates){const t=rb(o,d,c);if(t!==null&&t<best)best=t}
        let hit=null,head=false;
        for(const q of players){if(q===p||!q.a)continue;const g=q.y-1.6;
          const th=rs(o,d,{x:q.x,y:g+1.9,z:q.z},.3),tb=rs(o,d,{x:q.x,y:g+1,z:q.z},.7);
          if(th!==null&&th<best){best=th;hit=q;head=true}else if(tb!==null&&tb<best){best=tb;hit=q;head=false}}
        if(hit)dm.set(hit,(dm.get(hit)||0)+(head?w.hd:w.dmg));
      }
      if(dm.size)send(ws,{t:'hit'});
      for(const [q,v] of dm){q.hp-=v;if(q.hp<=0&&q.a)die(q,p.nick,p)}
    }
  });
  ws.on('close',()=>players.delete(p));
});
setInterval(()=>{
  const z=zone();
  for(const q of players){
    if(!q.a)continue;
    if(Math.hypot(q.x,q.z)>z){q.hp-=.27;if(q.hp<=0){die(q,'Zona',null);continue}}
    for(const k of meds)if(k.on&&q.hp<100&&Math.hypot(q.x-k.x,q.z-k.z)<1.8){q.hp=Math.min(100,q.hp+40);k.on=false;setTimeout(()=>{k.on=true},15000)}
  }
  const list=[...players].map(q=>({id:q.id,n:q.nick,c:q.c,x:q.x,y:q.y,z:q.z,yaw:q.yaw,hp:Math.ceil(q.hp),k:q.k,a:q.a,s:q.skin}));
  bc({t:'state',p:list,z,mk:meds.map(k=>k.on?1:0)});
},66);
server.listen(process.env.PORT||3000,()=>console.log('BF: GO online na porta',process.env.PORT||3000));
