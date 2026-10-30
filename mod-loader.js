// BF: GO capa e carregamento real (máx. 10 s)
(function(){
 const st=document.createElement('style');st.textContent='#cover{background:radial-gradient(circle at 50% 25%,#5a2390,#2a0f4a 45%,#07040d 85%)}#cover h1 span{text-shadow:0 0 18px #ff7a1a}';document.head.appendChild(st);
 $('cover').querySelector('.sub').textContent='Mega Update de Halloween';
 $('cover').insertAdjacentHTML('afterbegin','<svg width="96" viewBox="0 0 110 100" aria-hidden="true"><rect x="50" y="4" width="10" height="16" rx="3" fill="#3a7d2c"/><ellipse cx="55" cy="58" rx="50" ry="38" fill="#ff7a1a"/><path d="M28 48l14 10-18 2zM82 48l-14 10 18 2zM55 62l-7 12h14zM30 78q25 18 50 0l-6-4-8 5-8-5-8 5-8-5z" fill="#2a0f00"/></svg>');
})();
function buildTex(){
 const mkc=(w,fn)=>{const c=document.createElement('canvas');c.width=c.height=w;const x=c.getContext('2d');fn(x,w);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
 TEX.grass=mkc(256,(x,w)=>{x.fillStyle='#5c9a55';x.fillRect(0,0,w,w);for(let i=0;i<5000;i++){x.fillStyle=Math.random()<.5?'rgba(20,50,20,.25)':'rgba(180,230,140,.18)';x.fillRect(Math.random()*w,Math.random()*w,2,3)}});
 TEX.grass.repeat.set(24,24);
 TEX.wood=mkc(128,(x,w)=>{x.fillStyle='#8a6a45';x.fillRect(0,0,w,w);x.strokeStyle='rgba(50,30,10,.45)';x.lineWidth=3;for(let i=8;i<w;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i+Math.random()*6-3,w);x.stroke()}x.strokeRect(2,2,w-4,w-4)});
 TEX.woodMat=new THREE.MeshLambertMaterial({map:TEX.wood});
}
goLoad=async function(rotate){
 let ok=false;if(rotate){try{await document.documentElement.requestFullscreen()}catch(e){}try{await screen.orientation.lock('landscape');ok=true}catch(e){}}
 rotFB=rotate&&!ok;chkRot();show('load');
 const t0=performance.now(),W={motor:15,tex:25,audio:10,srv:25,cena:25};let got=0;
 const bar=(p,txt)=>{$('fill').style.width=Math.min(100,p)+'%';if(txt)$('tip').textContent=txt};
 const task=(k,txt,fn)=>Promise.resolve().then(fn).catch(()=>{}).then(()=>{got+=W[k];bar(got,txt)});
 bar(0,'Iniciando…');
 const motor=task('motor','Motor 3D pronto',async()=>{for(let i=0;i<100&&!(window.THREE&&R);i++)await new Promise(r=>setTimeout(r,100))});
 const tex=motor.then(()=>task('tex','Texturas prontas',buildTex));
 const audio=task('audio','Sons prontos',()=>{ac=ac||new AudioContext();return ac.resume&&ac.resume()});
 const srv=task('srv','Servidor conectado',async()=>{const c=new AbortController();setTimeout(()=>c.abort(),8000);await fetch(location.pathname||'/',{cache:'no-store',signal:c.signal})});
 const cena=tex.then(()=>task('cena','Arena montada',()=>{hwTheme();R.compile(S,C);R.render(S,C)}));
 await Promise.race([Promise.all([motor,tex,audio,srv,cena]),new Promise(r=>setTimeout(r,10000))]);
 const left=2500-(performance.now()-t0);if(left>0)await new Promise(r=>setTimeout(r,left));
 bar(100,'Pronto!');await new Promise(r=>setTimeout(r,250));show('lobby')};
