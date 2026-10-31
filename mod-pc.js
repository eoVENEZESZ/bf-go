// BF: GO versão PC: teclado e mouse
const PC=matchMedia('(pointer:fine)').matches&&matchMedia('(hover:hover)').matches,K={},INM=()=>['play','plane','drop'].includes(state);
if(PC){
 $('tap').onclick=()=>goLoad(false);
 const st=document.createElement('style');st.textContent='#ffring{display:none!important}';document.head.appendChild(st);
 const h=document.createElement('p');h.className='sub';h.style.fontSize='12px';h.textContent='WASD mover · mouse mirar · clique atirar · Espaço pular · R recarregar · 1 2 3 armas · Z X C V emotes · Esc pausa';
 document.querySelectorAll('#lobby .card')[1].appendChild(h);
 const l=document.createElement('div');l.id='pclk';l.style.cssText='display:none;position:absolute;top:58%;width:100%;text-align:center;font:800 20px system-ui;text-shadow:0 2px 6px #000;pointer-events:none';l.textContent='Clique na tela para jogar';$('hud').appendChild(l);
}
addEventListener('pointerdown',e=>{
 if(!PC||e.pointerType!=='mouse'||!INM()||$('cfg').classList.contains('on'))return;
 if(e.target.dataset&&e.target.dataset.b)return;
 e.stopPropagation();
 if(!document.pointerLockElement){$('cv').requestPointerLock()}
 else if(e.button===0){if(state==='play')firing=true;else act()}
},true);
addEventListener('mousemove',e=>{if(!document.pointerLockElement||!INM())return;const k=cfg.sens/5;
 yaw-=e.movementX*.0025*k;pitch=Math.max(-1.4,Math.min(1.4,pitch-e.movementY*.0022*k))});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&INM()&&!$('cfg').classList.contains('on'))openGear()});
addEventListener('keydown',e=>{K[e.code]=true;if(!INM()||$('cfg').classList.contains('on'))return;
 if(e.code==='Space'){e.preventDefault();if(e.repeat)return;if(state==='play')jumpReq=true;else act()}
 else if(e.code==='KeyR'&&state==='play'&&reload<=0&&ammo<30){reload=1.4;say('Recarregando…',1300)}
 else if(e.code==='Digit1')wi=0;else if(e.code==='Digit2')wi=1;else if(e.code==='Digit3')wi=2;
 else{const i=['KeyZ','KeyX','KeyC','KeyV'].indexOf(e.code);if(i>=0&&!e.repeat)sendEmote(i)}});
addEventListener('keyup',e=>{K[e.code]=false});
function pcTick(){requestAnimationFrame(pcTick);const m=INM();
 if(!m&&document.pointerLockElement)document.exitPointerLock();
 if(PC){$('pclk').style.display=m&&!document.pointerLockElement&&!$('cfg').classList.contains('on')?'block':'none'}
 if(m&&jid===null){const x=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),y=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0),l=Math.hypot(x,y)||1;jv={x:x/l,y:y/l}}}
requestAnimationFrame(pcTick);
