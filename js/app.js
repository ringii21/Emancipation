/* État global, langue, rendu de l'accueil, navigation, boot.
   Globaux partagés (var) : ST, LG, W, Wv, U, AVAIL — plus RD/RDL/LCACHE (reader.js),
   S/DB (storage.js), FRUI/JA (i18n.js). Scripts classiques, pas de modules. */

var ST={done:{},journal:[],dur:15,lang:'fr',autoVoice:true};
var LG='fr';    // langue courante ('fr' | 'ja')
var W=null;     // les 24 semaines françaises (data/weeks.fr.json)
var Wv=null;    // semaines dans la langue courante (fusion FR + surcharges JA)
var U=FRUI;     // dictionnaire d'interface courant
var AVAIL=[];   // numéros des parties dont la lecture existe (content/index.json)
// Mode dev : activé par ?dev dans l'URL, jamais persisté — invisible dans l'app installée.
// Déverrouille toutes les semaines et autorise la lecture de n'importe quelle partie écrite,
// sans toucher à la vraie progression (ST). Uniquement pour relire/prévisualiser en local.
var DEV=/[?&]dev\b/.test(location.search);

function applyLang(){
 LG=ST.lang||'fr';
 U = (LG==='ja') ? JA.ui : FRUI;
 Wv = (LG==='ja') ? W.map((w,i)=>Object.assign({},w,JA.W[i])) : W;
 document.body.classList.toggle('ja', LG==='ja');
 document.documentElement.lang = LG;
 const q=(x)=>document.querySelector(x);
 q('#pane-key .eyebrow').textContent=U.eyebrow;
 q('#pane-key h1').innerHTML=U.h1;
 q('#pane-journal .eyebrow').textContent=U.jEyebrow;
 q('#pane-journal h1').innerHTML=U.jH1;
 q('#pnEyebrow').textContent=U.pnEyebrow;
 q('#pnH1').innerHTML=U.pnH1;
 q('#pane-soon .eyebrow').textContent=U.sEyebrow;
 q('#pane-soon h1').innerHTML=U.sH1;
 q('#pane-soon .consigne').innerHTML=U.soonBody;
 const nl=document.querySelectorAll('nav .nl');
 nl[0].textContent=U.navRefuge; nl[1].textContent=U.navKey; nl[2].textContent=U.navJournal; nl[3].textContent=U.navPensees; nl[4].textContent=U.navSoon;
 q('.nsoon').textContent=U.soonTag;
 q('.backbtn').textContent=U.quit;
 q('#quit').textContent=U.quitSess;
 document.getElementById('langbtn').textContent=U.langLabel;
}
async function switchLang(){
 ST.lang = (ST.lang==='ja')?'fr':'ja'; await S.set('mk',ST); applyLang();
 const c=cur();
 if(AVAIL.indexOf(c)>=0){try{await loadPart(c,LG)}catch(e){}}
 render();
 if(window.renderPensees)renderPensees();
 if(window.renderRefuge)renderRefuge();
 if(RD.part && document.getElementById('pane-read').classList.contains('act')){
  // lecteur ouvert : recharge la partie dans la nouvelle langue, même position
  try{RDL=await loadPart(RD.part,LG);if(RD.i>RDL.p.length)RD.i=RDL.p.length;paint()}catch(e){back()}
 }
 scrollTo(0,0);
}

var today=()=>new Date().toISOString().slice(0,10);
var cnt=n=>(ST.done[n]||[]).length;
var didToday=n=>(ST.done[n]||[]).includes(today());
var cur=()=>{for(const w of Wv){if(cnt(w.n)<7)return w.n}return 24};
var total=()=>Wv.reduce((a,w)=>a+cnt(w.n),0);

/* ══════ Rendu ══════ */
function render(){
 const c=cur();
 document.getElementById('dial').innerHTML=Wv.map(w=>{const d=cnt(w.n);
   return `<div class="dweek">${[0,1,2,3,4,5,6].map(i=>`<div class="dot ${i<d?'on':''} ${w.n===c&&i===d?'cur':''}"></div>`).join('')}</div>`}).join('');
 const t=total();
 document.getElementById('dialcap').textContent = t===0
   ? U.start0 : U.day(t,c);

 const w=Wv.find(x=>x.n===c), d=cnt(c), dt=didToday(c);
 let html=`<div class="card">
   <p class="wknum">${U.wk(c)}</p>
   <h2 class="wktitle">${w.t}</h2>
   <div class="consigne">${w.x}</div>
   <p class="src">${w.s} · ${U.src}</p>
   <div class="days">${[0,1,2,3,4,5,6].map(i=>`<div class="day ${i<d?'done':''} ${i===d&&!dt?'today':''}">${i<d?'✓':i+1}</div>`).join('')}</div>
   ${(()=>{
     /* trois états : partie disponible → bouton de lecture (comportement démo) ;
        partie absente de content/index.json → mention discrète, non cliquable ;
        (les semaines verrouillées restent des lignes compactes plus bas, comme dans la démo) */
     if(AVAIL.indexOf(c)<0)return `<p class="src" style="border:0;margin-top:16px">${U.notWritten}</p>`;
     const Lc=LCACHE[c+'-'+LG];
     if(!Lc){loadPart(c,LG).then(()=>render()).catch(()=>{});return ''}
     const P=Lc.p.length,pos=(ST.pos||{})[c]||0,lp=(ST.loops||{})[c]||0;
     const lbl = (lp>0 ? U.reread(lp) : pos>0 ? U.resume(pos,P) : U.readIt(P)) + (U.frOnly||'');
     return `<button class="btn" onclick="read(${c})">${lbl}</button>`})()}
   ${dt?`<button class="btn ghost" disabled>${U.doneToday}</button><button class="btn ghost" onclick="open_(${c})">${U.again}</button>`
       :`<button class="btn ghost" onclick="open_(${c})">${U.begin(d+1)}</button>`}
   <div class="vbar"><button class="ttsbtn" data-lbl="${U.listenLbl}" onclick="sayCue(${c})">▸ ${U.listenLbl}</button></div>
   <details><summary>${U.whatMeans}</summary><div class="explain">${w.e}</div></details>
 </div>`;

 const past=Wv.filter(x=>x.n<c);
 if(past.length){html+=`<p class="sechead">${U.doneHead}</p>`+past.map(x=>
   `<div class="row past" onclick="open_(${x.n})"><span class="idx">${x.n}</span><span class="nm">${x.t}</span><span class="st">7/7</span></div>`).join('')}

 const next=Wv.filter(x=>x.n>c);
 if(next.length){html+=`<p class="sechead">${U.lockHead}</p>`+next.map(x=>
   DEV
    ? `<div class="row past" onclick="open_(${x.n})"><span class="idx">${x.n}</span><span class="nm">${x.t}</span><span class="st">dev</span></div>`
    : `<div class="row lock"><span class="idx">${x.n}</span><span class="nm">${x.n===c+1?x.t:'—'}</span><span class="st">${x.n===c+1?U.sess(7-d):''}</span></div>`).join('')
   +(DEV?'':`<p class="src" style="border:0;margin-top:16px">${U.lockNote}</p>`)}

 const devBar = DEV ? `<div class="card" style="border-color:var(--brass)">
   <p class="wknum" style="color:var(--brass)">Mode dev</p>
   <div class="consigne"><p>Accès libre : toutes les semaines sont ouvrables et tu peux lire n'importe quelle partie déjà écrite, sans faire les séances. Ta vraie progression n'est pas modifiée.</p></div>
   <div class="days" style="justify-content:flex-start;gap:8px">
     <input id="devpart" type="number" min="1" max="24" value="2" aria-label="Numéro de partie" style="width:70px;background:var(--ink3);color:var(--paper);border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit">
     <button class="btn" style="width:auto;padding:8px 18px" onclick="read(parseInt(document.getElementById('devpart').value,10)||1)">Lire cette partie</button>
   </div>
   <p class="src" style="border:0;margin-top:12px">Seules les parties dont le contenu existe s'ouvriront. Retire <code>?dev</code> de l'URL pour revenir au mode normal.</p>
 </div>` : '';

 document.getElementById('weeks').innerHTML=devBar+html;

 document.getElementById('journal').innerHTML = ST.journal.length
  ? ST.journal.slice().reverse().map(e=>`<div class="jentry"><p class="jmeta">${e.date} · semaine ${e.week}</p><p class="jtext">${e.txt.replace(/[<>]/g,'')}</p></div>`).join('')
  : `<p class="empty">${U.jEmpty}</p>`;
}

document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{
 document.getElementById('rd-nav').classList.remove('on');
 document.querySelectorAll('nav button').forEach(x=>x.classList.remove('act'));
 document.querySelectorAll('.pane').forEach(x=>x.classList.remove('act'));
 b.classList.add('act');document.getElementById('pane-'+b.dataset.p).classList.add('act');scrollTo(0,0)});

if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
(async()=>{
 try{
  const j=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+' → HTTP '+r.status);return r.json()});
  const [wfr,wja,idx]=await Promise.all([
   j('data/weeks.fr.json'), j('data/weeks.ja.json'), j('content/index.json')
  ]);
  W=wfr; JA.W=wja; AVAIL=(idx&&idx.available)||[];
 }catch(e){
  const s=await S.get('mk').catch(()=>null);
  const ui=(s&&s.lang==='ja')?JA.ui:FRUI;
  document.getElementById('weeks').innerHTML=`<p class="empty">${ui.loadFail}</p>`;
  return;
 }
 await DB.open();
 const s=await S.get('mk'); if(s)ST={...ST,...s};
 applyLang();
 const c=cur();
 if(AVAIL.indexOf(c)>=0){try{await loadPart(c,LG)}catch(e){}}  // précharge la partie courante pour le libellé du bouton
 render();
 if(window.initPensees)initPensees();
 if(window.initRefuge)initRefuge();
})();
