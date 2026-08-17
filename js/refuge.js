/* Module 2 — « Le refuge ».
   Logique OPPOSÉE à La Clé (PROJET.md §2) : disponible sans condition, à n'importe
   quelle heure, sans rien avoir fait avant. AUCUN décompte, AUCUNE série (streak),
   AUCUN rappel, AUCUNE progression affichée, AUCUNE culpabilisation. Si ce module se
   met un jour à afficher une progression ou une date, c'est un bug de conception.

   Autonome : toute la logique est ici. Globaux nommés préfixés RF / rf, sans collision
   avec La Clé ni avec Pensées.
   Storage cloisonné : clé localStorage "refuge" via S.get/S.set — état MINIMAL et
   volontairement pauvre. NE JAMAIS lire ni écrire "mk" (état de La Clé).
   Dépend au moment de l'appel de : LG (app.js), S (storage.js), les dictionnaires
   U/FRUI/JA via l'accès i18n, content/refuge.<LG>.json pour le contenu éditorial
   (jamais retapé ici), et pcOpen (js/pensees.js, chargé avant) pour la respiration.

   INTERDITS dans ce fichier (ne doivent JAMAIS apparaître, sauf dans cet en-tête) :
   cur, cnt, total, didToday, ST, Wv, mk, ainsi que tout compteur, streak, ou date
   affichée. Le seul état persistant est la dernière chose nommée, écrasable, jamais
   réaffichée. Le fil de conversation ne quitte pas la mémoire vive. */

/* ══════ État persistant MINIMAL (clé "refuge" uniquement) ══════
   graine     : dernière chose que l'utilisatrice a nommée. SCALAIRE, écrasé à chaque
                fois (jamais un tableau, jamais un historique). JAMAIS réaffiché ici.
   graineDate : horodatage de cette dernière chose. Stocké pour un usage futur éventuel
                (module 5), mais JAMAIS affiché dans le refuge. */
var RF={graine:'',graineDate:null};
var RFX={};          // contenu chargé, cache par langue : RFX[lang] = JSON de refuge.<lang>.json
var RFLOADED=false;  // état persistant chargé de S.get('refuge') au moins une fois
var RFMOUNTED=false; // structure DOM montée une seule fois (append-only)

/* Fil de conversation — EN MÉMOIRE SEULEMENT. Jamais sérialisé, jamais passé à S.set.
   ton     : dernier ton détecté (pour tirer la relance dans le même registre) ;
   last    : mémorise le dernier message tiré par famille, pour éviter la répétition
             immédiate (tirage sans répétition) ;
   waiting : mode d'attente d'une réponse libre ('nommer' quand on attend la chose à
             nommer, sinon null → conversation ordinaire). */
var RFS={ton:null,last:{},waiting:null};

/* ══════ Utilitaires ══════ */
function rfU(){return (LG==='ja')?JA.ui:FRUI}      // châssis i18n (jamais le contenu)
function rfEsc(s){return String(s==null?'':s).replace(/[<>]/g,'')}
function rfData(){return RFX[LG]||null}            // contenu de la langue courante, ou null

/* Tirage aléatoire dans un tableau, sans répéter l'élément précédent de la même
   « famille » (clé). Renvoie '' si le tableau est vide. */
function rfPick(arr,key){
 if(!Array.isArray(arr)||!arr.length)return '';
 if(arr.length===1)return arr[0];
 const prev=key?RFS.last[key]:null;
 let out=arr[Math.floor(Math.random()*arr.length)];
 let guard=0;
 while(out===prev&&guard<8){out=arr[Math.floor(Math.random()*arr.length)];guard++}
 if(key)RFS.last[key]=out;
 return out;
}

/* ══════ Persistance de l'état du module (clé "refuge" uniquement) ══════ */
async function rfLoad(){
 const s=await S.get('refuge').catch(()=>null);
 if(s&&typeof s==='object'){
  RF.graine=(typeof s.graine==='string')?s.graine:'';
  RF.graineDate=s.graineDate||null;
 }
 RFLOADED=true;
}
async function rfSave(){await S.set('refuge',{graine:RF.graine,graineDate:RF.graineDate})}

/* ══════ Chargement du contenu (fetch, cache mémoire par langue) — calqué sur pcLoadExos ══════ */
function rfUrl(lang){return 'content/refuge.'+lang+'.json'}
async function rfLoadContent(lang){
 lang=lang||LG;
 if(RFX[lang])return RFX[lang];
 const r=await fetch(rfUrl(lang));
 if(!r.ok)throw new Error(rfUrl(lang)+' → HTTP '+r.status);
 const J=await r.json();
 RFX[lang]=J;
 return J;
}

/* ══════ Point d'entrée (appelé par app.js au boot) ══════ */
async function initRefuge(){
 try{await rfLoad()}catch(e){}
 try{await rfLoadContent(LG)}catch(e){}
 rfMount();
 rfRenderHeader();
 rfGreet();
}

/* Appelé par app.js après switchLang() : recharge le contenu de la langue,
   remet à jour le header, et repart sur un accueil dans la nouvelle langue.
   Le fil est réinitialisé (langue changée) mais la structure n'est PAS détruite. */
async function renderRefuge(){
 if(!rfData()){
  try{await rfLoadContent(LG)}catch(e){}
 }
 rfMount();
 rfRenderHeader();
 rfResetThread();
 rfGreet();
}

/* ══════ Montage de la structure figée — UNE SEULE FOIS (append-only strict) ══════
   Le composeur (#rf-input) est monté ici et n'est JAMAIS détruit : le focus et le
   curseur ne sautent donc jamais pendant la saisie. Le fil (#rf-thread) ne reçoit
   que des appendChild — jamais innerHTML=. */
function rfMount(){
 if(RFMOUNTED)return;
 const host=document.getElementById('refuge');
 if(!host)return;
 host.innerHTML=`
  <div id="rf-thread" aria-live="polite"></div>
  <div id="rf-actions"></div>
  <div id="rf-composer">
    <div class="rf-composer-in">
      <textarea id="rf-input" rows="1"></textarea>
      <button class="btn" id="rf-send"></button>
    </div>
  </div>`;
 const inp=document.getElementById('rf-input');
 const snd=document.getElementById('rf-send');
 if(snd)snd.onclick=()=>rfSubmit();
 if(inp){
  // Entrée = envoyer (Maj+Entrée = saut de ligne), comportement de messagerie.
  inp.addEventListener('keydown',e=>{
   if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();rfSubmit()}
  });
 }
 RFMOUNTED=true;
 rfFitComposer();
 addEventListener('resize',rfFitComposer);
}

/* La nav du bas n'a pas une hauteur fixe (safe-area iPhone, densité de police selon
   l'écran). On la mesure et on expose --nav-h : le composeur se cale ainsi pile
   au-dessus, sans chevauchement, sur n'importe quel écran. */
function rfFitComposer(){
 const nav=document.querySelector('nav');
 if(nav)document.documentElement.style.setProperty('--nav-h',nav.offsetHeight+'px');
}

/* Le composeur porte les libellés/placeholder d'interface (i18n). Rafraîchi à chaque
   changement de langue sans toucher au champ lui-même (pas de re-création). */
function rfRenderHeader(){
 const D=rfData();
 const eb=document.getElementById('rfEyebrow');
 const h1=document.getElementById('rfH1');
 if(D&&D.accueil){
  if(eb)eb.textContent=rfEsc(D.accueil.eyebrow||'');
  if(h1)h1.innerHTML=D.accueil.titre||'';   // titre contient <em>, fourni par le contenu
 }
 const inp=document.getElementById('rf-input');
 if(inp&&D&&D.accueil)inp.setAttribute('placeholder',rfEsc(D.accueil.placeholder||''));
 const snd=document.getElementById('rf-send');
 if(snd)snd.textContent=rfU().rfSend;
}

/* Vide le fil (changement de langue uniquement). Le composeur reste intact. */
function rfResetThread(){
 const th=document.getElementById('rf-thread');
 if(th)while(th.firstChild)th.removeChild(th.firstChild);
 const ac=document.getElementById('rf-actions');
 if(ac)ac.innerHTML='';
 RFS.ton=null;RFS.last={};RFS.waiting=null;
}

/* ══════ Ajout d'un message au fil (append-only) ══════
   role : 'me' (l'utilisatrice) | 'refuge' (le lieu). Tout texte utilisateur réinjecté
   passe par rfEsc. On n'écrit JAMAIS innerHTML sur #rf-thread. */
function rfAppend(role,texte){
 const th=document.getElementById('rf-thread');
 if(!th)return;
 const div=document.createElement('div');
 div.className='rf-msg rf-'+role;
 div.textContent=String(texte==null?'':texte);   // textContent = pas d'injection HTML
 th.appendChild(div);
 if(div.scrollIntoView)div.scrollIntoView({block:'nearest'});
}

/* Réponse du refuge, avec un léger délai pour un rythme humain (pas de streaming
   caractère par caractère). Enchaîne éventuellement plusieurs répliques. */
function rfSay(texte,then){
 setTimeout(()=>{
  rfAppend('refuge',texte);
  if(typeof then==='function')then();
 },500);
}

/* ══════ Accueil ══════
   Message tiré au hasard de accueil.messages (aucun ne mentionne le passé — garanti
   côté contenu). Puis on propose, sans obligation, les trois portes. */
function rfGreet(){
 const D=rfData();
 if(!D){
  rfAppend('refuge',rfU().rfLoadFail||rfU().loadFail);
  return;
 }
 rfAppend('refuge',rfPick((D.accueil&&D.accueil.messages)||[],'accueil'));
 rfShowActions();
}

/* Les trois propositions. #rf-actions est réécrit par innerHTML : c'est admis car il
   ne contient aucun champ actif (le composeur, lui, n'est jamais touché). */
function rfShowActions(){
 const D=rfData();if(!D)return;
 const ac=document.getElementById('rf-actions');if(!ac)return;
 const p=D.propositions||{};
 ac.innerHTML=`
  <p class="rf-actions-intro">${rfEsc(p.intro||'')}</p>
  <button class="btn ghost" data-rf="respirer">${rfEsc(p.respirer||'')}</button>
  <button class="btn ghost" data-rf="nommer">${rfEsc(p.nommer||'')}</button>
  <button class="btn ghost" data-rf="ecoute">${rfEsc(p.ecoute||'')}</button>`;
 ac.querySelectorAll('[data-rf]').forEach(b=>b.onclick=()=>rfAction(b.dataset.rf));
}

function rfHideActions(){
 const ac=document.getElementById('rf-actions');
 if(ac)ac.innerHTML='';
}

/* ══════ Détection de ton (en mémoire, jamais stockée ni envoyée) ══════
   Calqué sur la logique de suggestion du module 4 : comparaison du texte aux motscles
   de chaque humeur du contenu. Renvoie un id d'humeur ('detresse'|'anxiete'|… |'neutre'). */
function rfClassify(txt){
 const D=rfData();if(!D)return 'neutre';
 const t=String(txt||'').toLowerCase();
 if(!t.trim())return 'neutre';
 const humeurs=(D.accueil&&D.accueil.humeurs)||[];
 // La détresse prime : si un de ses mots-clés est présent, on la renvoie d'emblée.
 const det=humeurs.find(h=>h.id==='detresse');
 if(det&&(det.motscles||[]).some(m=>m&&t.indexOf(String(m).toLowerCase())>=0))return 'detresse';
 let best='neutre',bestScore=0;
 humeurs.forEach(h=>{
  if(h.id==='detresse'||h.id==='neutre')return;
  let score=0;
  (h.motscles||[]).forEach(m=>{if(m&&t.indexOf(String(m).toLowerCase())>=0)score++});
  if(score>bestScore){bestScore=score;best=h.id}
 });
 return best;
}

/* ══════ Envoi d'un message de l'utilisatrice ══════ */
function rfSubmit(){
 const inp=document.getElementById('rf-input');
 if(!inp)return;
 const raw=inp.value||'';
 const txt=raw.trim();
 if(!txt)return;
 // Le champ est vidé mais jamais recréé : le focus reste.
 inp.value='';
 rfAppend('me',rfEsc(txt));

 // Parcours B : on attendait la chose à nommer.
 if(RFS.waiting==='nommer'){
  RFS.waiting=null;
  rfNameDone(txt);
  return;
 }

 // Conversation ordinaire : classification en mémoire, puis réponse.
 const ton=rfClassify(txt);
 if(ton==='detresse'){rfDistress();return}
 RFS.ton=ton;
 rfRespond(ton);
}

/* Réponse ordinaire : accueil du ton, puis relance, puis on repropose les portes.
   Tirage sans répétition immédiate par famille (ton+phase). */
function rfRespond(ton){
 const D=rfData();if(!D)return;
 const R=(D.reponses||{})[ton]||(D.reponses||{}).neutre||{};
 rfHideActions();
 rfSay(rfPick(R.accueil||[],ton+':accueil'),()=>{
  rfSay(rfPick(R.relance||[],ton+':relance'),()=>{
   rfShowActions();
  });
 });
}

/* ══════ Chemin détresse — NON NÉGOCIABLE (PROJET.md §5) ══════
   Message clair + orientation (le 3114). Jamais de réponse vague, jamais adouci. */
function rfDistress(){
 const D=rfData();if(!D)return;
 const d=D.detresse||{};
 rfHideActions();
 rfSay(d.message||'',()=>{
  rfSay(d.orientation||'',()=>{
   rfShowActions();
  });
 });
}

/* ══════ Les trois portes ══════ */
function rfAction(kind){
 const D=rfData();if(!D)return;
 if(kind==='respirer')return rfRespirer();
 if(kind==='nommer')return rfNameInvite();
 if(kind==='ecoute')return rfEcoute();
}

/* A) Respirer → délègue au module 4 (respiration guidée). Au retour, le fil du refuge
   est intact : pcOpen ouvre son propre overlay #pcSession, ne touche pas #refuge. */
function rfRespirer(){
 if(window.pcOpen){
  try{pcOpen('souffle');return}catch(e){}
 }
 // Repli si le module 4 est indisponible : on ne casse rien, on reste présent.
 rfSay(rfPick(((rfData()||{}).ecoute||{}).messages||[],'ecoute'));
}

/* B) Nommer → invite, puis on attend la réponse libre (RFS.waiting='nommer'). */
function rfNameInvite(){
 const D=rfData();if(!D)return;
 const n=D.nommer||{};
 rfHideActions();
 rfSay(n.invite||'',()=>{
  RFS.waiting='nommer';
  const inp=document.getElementById('rf-input');
  if(inp){
   if(n.placeholder)inp.setAttribute('placeholder',rfEsc(n.placeholder));
   if(inp.focus)try{inp.focus()}catch(e){}
  }
 });
}

/* La chose nommée est écrite dans RF.graine (SCALAIRE, écrasée), sauvegardée, puis on
   accuse réception. On n'en reparle plus : jamais réaffichée dans le refuge. */
function rfNameDone(txt){
 RF.graine=String(txt||'');
 RF.graineDate=new Date().toISOString();   // stocké, JAMAIS affiché
 rfSave();
 const D=rfData();
 const n=(D&&D.nommer)||{};
 // Restaure le placeholder d'accueil (le champ n'est pas recréé).
 const inp=document.getElementById('rf-input');
 if(inp&&D&&D.accueil)inp.setAttribute('placeholder',rfEsc(D.accueil.placeholder||''));
 rfSay(rfPick(n.apres||[],'nommer:apres'),()=>{
  rfShowActions();
 });
}

/* C) Écoute → un message de simple présence, sans rien demander. */
function rfEcoute(){
 const D=rfData();if(!D)return;
 rfSay(rfPick(((D.ecoute)||{}).messages||[],'ecoute'),()=>{
  rfShowActions();
 });
}
