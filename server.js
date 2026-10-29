const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const server=http.createServer((req,res)=>{
  fs.readFile(path.join(__dirname,'index.html'),(e,d)=>{
    if(e){res.writeHead(500);return res.end('erro')}
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(d);
  });
});
const wss=new WebSocketServer({server});
let seed=12345;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const crates=[];while(crates.length<16){const x=(rnd()-.5)*80,z=(rnd()-.5)*80;if(Math.hypot(x,z)>8)crates.push({x,z})}
const players=new Set();let nextId=1;
const num=(v,a,b,d=0)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):d;
const spawn=()=>({x:(Math.random()-.5)*70,z:(Math.random()-.5)*70});
const send=(w,o)=>{if(w.readyState===1)w.send(JSON.stringify(o))};
function rs(o,d,c,r){const lx=c.x-o.x,ly=c.y-o.y,lz=c.z-o.z,t=lx*d.x+ly*d.y+lz*d.z;if(t<0)return null;const q=lx*lx+ly*ly+lz*lz-t*t;return q>r*r?null:t-Math.sqrt(r*r-q)}
function rb(o,d,c){let a=0,b=1e9;for(const [k,h,m] of [['x',1.5,c.x],['y',1.3,1.3],['z',1.5,c.z]]){
  const lo=m-h-o[k],hi=m+h-o[k],dk=d[k];
  if(Math.abs(dk)<1e-9){if(lo>0||hi<0)return null}
  else{let t1=lo/dk,t2=hi/dk;if(t1>t2)[t1,t2]=[t2,t1];a=Math.max(a,t1);b=Math.min(b,t2);if(a>b)return null}
}return a}
wss.on('connection',ws=>{
  const s=spawn(),p={ws,id:nextId++,nick:'Jogador',c:0xff6a2b,x:s.x,y:1.6,z:s.z,yaw:0,hp:100,k:0,a:true,joined:false,lastShot:0};
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw)}catch(e){return}
    if(m.t==='join'&&!p.joined){
      p.joined=true;p.nick=String(m.nick||'Jogador').slice(0,12);
      p.c=Number.isInteger(m.color)&&m.color>=0&&m.color<=0xffffff?m.color:0xff6a2b;
      players.add(p);send(ws,{t:'welcome',id:p.id,crates,x:p.x,z:p.z});
    }else if(!p.joined||!p.a){return}
    else if(m.t==='pos'){p.x=num(m.x,-56,56);p.y=num(m.y,.5,60,1.6);p.z=num(m.z,-56,56);p.yaw=num(m.yaw,-1e4,1e4)}
    else if(m.t==='shot'){
      const now=Date.now();if(now-p.lastShot<100)return;p.lastShot=now;
      const dl=Math.hypot(m.dx,m.dy,m.dz);if(!(dl>0))return;
      const d={x:m.dx/dl,y:m.dy/dl,z:m.dz/dl},o={x:p.x,y:p.y,z:p.z};
      let best=1e9;for(const c of crates){const t=rb(o,d,c);if(t!==null&&t<best)best=t}
      let hit=null,head=false;
      for(const q of players){if(q===p||!q.a)continue;const g=q.y-1.6;
        const th=rs(o,d,{x:q.x,y:g+1.9,z:q.z},.3),tb=rs(o,d,{x:q.x,y:g+1,z:q.z},.7);
        if(th!==null&&th<best){best=th;hit=q;head=true}else if(tb!==null&&tb<best){best=tb;hit=q;head=false}}
      if(hit){
        hit.hp-=head?60:25;send(ws,{t:'hit'});
        if(hit.hp<=0){hit.a=false;hit.hp=0;p.k++;send(ws,{t:'kill'});send(hit.ws,{t:'dead'});
          setTimeout(()=>{if(!players.has(hit))return;const r=spawn();hit.x=r.x;hit.z=r.z;hit.y=1.6;hit.hp=100;hit.a=true;send(hit.ws,{t:'respawn',x:r.x,z:r.z})},3000)}
      }
    }
  });
  ws.on('close',()=>players.delete(p));
});
setInterval(()=>{
  const list=[...players].map(q=>({id:q.id,n:q.nick,c:q.c,x:q.x,y:q.y,z:q.z,yaw:q.yaw,hp:q.hp,k:q.k,a:q.a}));
  const msg=JSON.stringify({t:'state',p:list});
  players.forEach(q=>{if(q.ws.readyState===1)q.ws.send(msg)});
},66);
server.listen(process.env.PORT||3000,()=>console.log('BF: GO online na porta',process.env.PORT||3000));
