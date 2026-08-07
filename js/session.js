/* Séance minutée — porté de demo/index.html tel quel :
   minuteur (ring SVG), WakeLock, vibration, note de carnet en fin de séance. */

/* ══════ Séance ══════ */
var T={w:null,end:0,tot:0,run:false,raf:null,wl:null};
var R=2*Math.PI*46;
document.getElementById('arc').style.strokeDasharray=R;

function open_(n){
 T.w=n;T.run=false;cancelAnimationFrame(T.raf);
 const w=Wv.find(x=>x.n===n);
 document.getElementById('cue').textContent=w.c;
 document.getElementById('picker').innerHTML=[15,20,30].map(m=>`<button class="${m===ST.dur?'sel':''}" onclick="setDur(${m})">${m} min</button>`).join('');
 clock(ST.dur*60,ST.dur*60);
 document.getElementById('startStop').textContent=U.startBtn;
 document.getElementById('session').classList.add('on');
 const sb=document.getElementById('sayCue');
 if(sb){sb.onclick=()=>sayCue(n);sb.textContent='▸ '+U.listenLbl}
}
function setDur(m){ST.dur=m;S.set('mk',ST);open_(T.w)}
function clock(l,t){
 document.getElementById('clock').textContent=`${Math.floor(l/60)}:${String(Math.floor(l%60)).padStart(2,'0')}`;
 document.getElementById('arc').style.strokeDashoffset=R*(1-l/t);
}
function tick(){const l=Math.max(0,(T.end-Date.now())/1000);clock(l,T.tot);
 if(l<=0){done();return}T.raf=requestAnimationFrame(tick)}

document.getElementById('startStop').onclick=async()=>{
 if(!T.run){T.tot=ST.dur*60;T.end=Date.now()+T.tot*1000;T.run=true;
  document.getElementById('startStop').textContent=U.stopBtn;
  try{T.wl=await navigator.wakeLock.request('screen')}catch(e){}
  tick();
 }else{T.run=false;cancelAnimationFrame(T.raf);T.tot=Math.max(1,(T.end-Date.now())/1000);
  document.getElementById('startStop').textContent=(LG==='ja'?'再開':'Reprendre');
  if(T.wl){T.wl.release();T.wl=null}}
};
document.getElementById('quit').onclick=()=>{hush();if(AU){AU.pause();AU=null}T.run=false;cancelAnimationFrame(T.raf);
 if(T.wl){T.wl.release();T.wl=null}document.getElementById('session').classList.remove('on')};

async function done(){
 T.run=false;if(T.wl){T.wl.release();T.wl=null}
 if(navigator.vibrate)navigator.vibrate([90,140,90]);
 ST.done[T.w]=ST.done[T.w]||[];
 if(!ST.done[T.w].includes(today()))ST.done[T.w].push(today());
 await S.set('mk',ST);
 document.getElementById('session').innerHTML=
  `<div style="max-width:400px;width:100%">
     <h2 style="font-family:Fraunces,serif;font-weight:300;font-size:26px;margin:0 0 10px">${U.sessDone}</h2>
     <p class="cue" style="text-align:left;margin:0">${U.sessAsk}</p>
     <textarea id="note" placeholder="${LG==='ja'?'任意':'Optionnel.'}"></textarea>
     <button class="btn" onclick="note(${T.w})">${U.save}</button>
     <button class="btn ghost" onclick="location.reload()">${U.skip}</button>
   </div>`;
}
async function note(w){
 const v=document.getElementById('note').value.trim();
 if(v){ST.journal.push({date:new Date().toLocaleDateString(LG==='ja'?'ja-JP':'fr-FR'),week:w,txt:v});await S.set('mk',ST)}
 location.reload();
}
