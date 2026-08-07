/* Lecteur pas à pas — porté de demo/index.html.
   Différence avec la démo : les leçons ne sont plus embarquées, read(n) charge
   content/part-NN.<lang>.json par fetch(), avec cache mémoire par (partie, langue).
   Format d'un paragraphe : {n, txt, glose} (la démo utilisait des triplets). */

var RD={part:null,i:0};
var RDL=null;    // leçon affichée (partie RD.part, langue courante)
var LCACHE={};   // cache mémoire des parties, clé "<part>-<lang>"

function partUrl(n,lang){return 'content/part-'+String(n).padStart(2,'0')+'.'+lang+'.json'}
async function loadPart(n,lang){
 const k=n+'-'+lang;
 if(LCACHE[k])return LCACHE[k];
 const r=await fetch(partUrl(n,lang));
 if(!r.ok)throw new Error(partUrl(n,lang)+' → HTTP '+r.status);
 const L=await r.json();
 LCACHE[k]=L;
 return L;
}
async function read(n){
 if(AVAIL.indexOf(n)<0)return;           // partie pas encore écrite : rien à ouvrir
 let L;
 try{L=await loadPart(n,LG)}catch(e){back();return}  // échec de chargement : retour propre à l'accueil
 RDL=L;RD.part=n;RD.i=(ST.pos&&ST.pos[n])||0;
 if(RD.i>L.p.length)RD.i=L.p.length;
 document.querySelectorAll('.pane').forEach(x=>x.classList.remove('act'));
 document.getElementById('pane-read').classList.add('act');
 document.querySelectorAll('nav button').forEach(x=>x.classList.remove('act'));
 document.getElementById('rd-nav').classList.add('on');
 paint();
}
function paint(){
 const L=RDL;if(!L)return;const N=L.p.length,i=RD.i;
 const stage=document.getElementById('rd-stage');

 if(i>=N){ // écran de fin
  const loops=((ST.loops||{})[RD.part]||0);
  document.getElementById('rd-count').textContent=U.partDone;
  document.getElementById('rd-prog').style.width="100%";
  stage.innerHTML=`<div class="done-card">
    <h2>${U.doneH(L.titre)}</h2>
    <p>${U.doneP1}</p>
    <p>${U.doneP2}</p>
    <p class="loops">${U.loops(loops,RD.part)}</p>
  </div>`;
  document.getElementById('rd-prev').disabled=false;
  const nx=document.getElementById('rd-next');
  nx.textContent=U.rereadStart;
  nx.onclick=()=>{RD.i=0;savePos();paint()};
  return;
 }

 const q=L.p[i],num=q.n,txt=q.txt,gl=q.glose;
 document.getElementById('rd-count').textContent=U.counter(num,i+1,N);
 document.getElementById('rd-prog').style.width=((i+1)/N*100)+'%';
 stage.innerHTML=`
   ${num===44?`<p class="rdtag">${U.exoTag}</p>`:''}
   <p class="rdpara${num===44?' exo':''}">${txt}</p>
   <details class="pgloss"><summary>${U.whatSays}</summary><div class="gtxt">${gl}</div></details>
   <div id="vslot"></div>`;
 voiceBar(num,txt);
 document.getElementById('rd-prev').disabled=(i===0);
 const nx=document.getElementById('rd-next');
 nx.textContent=(i===N-1)?U.finish:U.next;
 nx.onclick=()=>step(1);
 scrollTo(0,0);
}
function step(d){
 if(!RDL)return;
 const N=RDL.p.length;
 const nv=RD.i+d;
 if(nv<0)return;
 if(nv>N)return;
 if(nv===N){ // on vient de finir : on compte une lecture
  ST.loops=ST.loops||{};ST.loops[RD.part]=(ST.loops[RD.part]||0)+1;
 }
 RD.i=nv;savePos();paint();
}
function savePos(){ST.pos=ST.pos||{};ST.pos[RD.part]=RD.i;S.set('mk',ST)}
function back(){hush();if(AU){AU.pause();AU=null}
 document.getElementById('rd-nav').classList.remove('on');
 document.querySelectorAll('.pane').forEach(x=>x.classList.remove('act'));
 document.getElementById('pane-key').classList.add('act');
 document.querySelector('nav button[data-p=key]').classList.add('act');
 render();scrollTo(0,0);
}
/* swipe horizontal */
var sx=0;
document.getElementById('pane-read').addEventListener('touchstart',e=>{sx=e.changedTouches[0].clientX},{passive:true});
document.getElementById('pane-read').addEventListener('touchend',e=>{
 const dx=e.changedTouches[0].clientX-sx;
 if(Math.abs(dx)>60)step(dx<0?1:-1);
},{passive:true});
document.addEventListener('keydown',e=>{
 if(!document.getElementById('pane-read').classList.contains('act'))return;
 if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);
});

async function voiceBar(num,txt){
 const slot=document.getElementById('vslot'); if(!slot)return;
 const key=`p${RD.part}-${num}`;
 const has=DB.ok ? !!(await DB.get(key)) : false;
 const first=!has;
 slot.innerHTML=`<div class="vbar">
   <button id="vrec" class="${first?'on':''}" onclick="recToggle('${key}','vrec')">● ${first?V().rec:V().again}</button>
   ${has?`<button id="vplay" onclick="playMine('${key}','vplay')">▸ ${V().mine}</button>
          <button class="tiny" onclick="delMine('${key}')">✕</button>`:''}
   <button class="ttsbtn" onclick="say(${JSON.stringify(txt).replace(/'/g,"\\u0027")}.replace(/<[^>]+>/g,''))">▸ ${V().tts}</button>
 </div>
 <div class="autorow"><button class="${ST.autoVoice?'on':''}" onclick="toggleAuto()">${ST.autoVoice?'●':'○'}</button><span>${V().auto}</span></div>
 <p class="vhint">${first?V().first:V().kept}</p>`;
 paintVoiceBtns();
 if(has&&ST.autoVoice&&!SPK)playMine(key,'vplay');
}
