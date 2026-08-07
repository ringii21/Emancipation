/* Module 4 — « Pensées constructives ».
   Exercices d'auto-observation et de régulation (TCC / ACT / cohérence cardiaque).
   Autonome : toute la logique est ici. Globaux nommés préfixés PC / pc, sans collision
   avec La Clé (ST/LG/Wv/U/RD/T… restent réservés au module 1).

   Storage cloisonné : clé localStorage "pc" via S.get/S.set. NE JAMAIS toucher "mk".
   Dépend au moment de l'appel de : LG (app.js), S (storage.js), les dictionnaires U/FRUI/JA
   via la variable globale U d'app.js pour le châssis, et content/exercices.<LG>.json pour le
   contenu éditorial (jamais retapé ici).

   Aucun streak, aucun décompte, aucune date « dernière fois » : rien de culpabilisant. */

/* ══════ État ══════ */
var PC={carnet:[],prefs:{souffleDuree:5,vibration:true}};
var PCX={};        // contenu chargé, cache par langue : PCX[lang] = JSON de exercices.<lang>.json
var PCV={view:'accueil'};  // état de vue courant de l'écran d'accueil (accueil | liste)
var PCLOADED=false;        // état persistant chargé de S.get('pc') au moins une fois

/* Moteur de suggestion — CONFIG (pas du texte) : id d'état → ids d'exercices suggérés.
   Codé en dur volontairement : c'est de la configuration, pas du contenu éditorial. */
var PC_MAP={
 anxiete:["ancrage","souffle"],
 rumination:["distance","examiner"],
 durSoi:["examiner","distance"],
 triste:["essentiel","souffle"],
 calme:["essentiel","examiner"],
 perdue:["souffle","essentiel"]
};

/* Session en cours (exercice ouvert) : type + progression + réponses éphémères.
   Les réponses ne sont persistées QUE si l'utilisatrice choisit d'enregistrer dans le carnet. */
var PCS={ex:null,type:null,i:0,ans:{},souffle:{run:false,raf:null,wl:null,end:0,phase:'in',dur:0}};

/* ══════ Utilitaires ══════ */
function pcU(){return (LG==='ja')?JA.ui:FRUI}      // châssis i18n (ne pas confondre avec le contenu)
function pcEsc(s){return String(s==null?'':s).replace(/[<>]/g,'')}
function pcData(){return PCX[LG]||null}            // contenu de la langue courante, ou null

/* ══════ Persistance de l'état du module (clé "pc" uniquement) ══════ */
async function pcLoad(){
 const s=await S.get('pc').catch(()=>null);
 if(s&&typeof s==='object'){
  PC.carnet=Array.isArray(s.carnet)?s.carnet:[];
  PC.prefs=Object.assign({souffleDuree:5,vibration:true},s.prefs||{});
 }
 PCLOADED=true;
}
async function pcSave(){await S.set('pc',{carnet:PC.carnet,prefs:PC.prefs})}

/* ══════ Chargement du contenu (fetch, cache mémoire par langue) — calqué sur loadPart ══════ */
function pcUrl(lang){return 'content/exercices.'+lang+'.json'}
async function pcLoadExos(lang){
 lang=lang||LG;
 if(PCX[lang])return PCX[lang];
 const r=await fetch(pcUrl(lang));
 if(!r.ok)throw new Error(pcUrl(lang)+' → HTTP '+r.status);
 const J=await r.json();
 PCX[lang]=J;
 return J;
}
function pcExo(id){const D=pcData();if(!D)return null;return (D.exercices||[]).find(e=>e.id===id)||null}

/* ══════ Point d'entrée (appelé par app.js après render() au boot) ══════ */
async function initPensees(){
 try{await pcLoad()}catch(e){}
 try{await pcLoadExos(LG)}catch(e){}
 renderPensees();
}

/* Appelé par app.js après switchLang() : recharge le contenu de la langue et re-rend. */
async function renderPensees(){
 const host=document.getElementById('pensees');
 if(!host)return;
 if(!pcData()){
  try{await pcLoadExos(LG)}catch(e){
   host.innerHTML=`<p class="empty">${pcU().pnLoadFail||pcU().loadFail}</p>`;
   return;
  }
 }
 if(PCV.view==='liste')pcRenderListe();
 else pcRenderAccueil();
}

/* ══════ Écran d'accueil ══════ */
function pcRenderAccueil(){
 PCV.view='accueil';
 const host=document.getElementById('pensees');if(!host)return;
 const D=pcData();if(!D){host.innerHTML=`<p class="empty">${pcU().loadFail}</p>`;return}
 const a=D.accueil;
 const etats=(a.etats||[]).map(e=>
   `<button class="btn ghost pc-etat" data-etat="${e.id}">${pcEsc(e.label)}</button>`).join('');
 host.innerHTML=`
  <div class="card">
    <p class="wknum">${pcEsc(a.question)}</p>
    <div class="consigne"><p>${pcEsc(a.sousTitre)}</p></div>
    <textarea id="pc-libre" placeholder="${pcEsc(a.placeholder)}"></textarea>
    <button class="btn" id="pc-envoyer">${pcU().pnEnvoyer}</button>
    <p class="src" style="border:0;margin-top:10px">${pcU().pnChoisir}</p>
    <div class="pc-etats">${etats}</div>
  </div>
  <div id="pc-sugg"></div>
  <button class="btn ghost" id="pc-voirtout">${pcEsc(a.voirTout)}</button>
  ${pcCarnetHtml()}`;

 const env=document.getElementById('pc-envoyer');
 if(env)env.onclick=()=>{
  const t=(document.getElementById('pc-libre')||{}).value||'';
  pcSuggestFromText(t);
 };
 host.querySelectorAll('.pc-etat').forEach(b=>b.onclick=()=>pcSuggestFromEtat(b.dataset.etat));
 const vt=document.getElementById('pc-voirtout');if(vt)vt.onclick=()=>pcRenderListe();
 pcWireCarnet(host);
}

/* Suggestion à partir d'un bouton d'état. */
function pcSuggestFromEtat(id){
 const ids=PC_MAP[id]||[];
 pcShowSuggestions(ids,false);
}

/* Suggestion à partir du texte libre. Le texte n'est JAMAIS enregistré ni envoyé :
   il est comparé en mémoire aux mots-clés, puis on ne garde que le résultat. */
function pcSuggestFromText(txt){
 const D=pcData();if(!D)return;
 const t=String(txt||'').toLowerCase().trim();
 let best=null,bestScore=0;
 if(t){
  (D.accueil.etats||[]).forEach(e=>{
   let score=0;
   (e.motscles||[]).forEach(m=>{if(m&&t.indexOf(String(m).toLowerCase())>=0)score++});
   if(score>bestScore){bestScore=score;best=e.id}
  });
 }
 if(best&&bestScore>0)pcShowSuggestions(PC_MAP[best]||[],false);
 else pcShowSuggestions([],true);   // aucune correspondance → message + liste complète
}

/* Affiche les exercices suggérés (cliquables) sous suggestionIntro, + accès liste complète.
   noMatch=true : affiche aucuneSuggestion et la liste complète. */
function pcShowSuggestions(ids,noMatch){
 const D=pcData();if(!D)return;
 const slot=document.getElementById('pc-sugg');if(!slot)return;
 const a=D.accueil;
 let html='';
 if(noMatch){
  html+=`<div class="card"><div class="consigne"><p>${pcEsc(a.aucuneSuggestion)}</p></div></div>`;
  (D.exercices||[]).forEach(e=>{html+=pcExoCard(e)});
 }else{
  html+=`<p class="sechead">${pcEsc(a.suggestionIntro)}</p>`;
  ids.forEach(id=>{const e=pcExo(id);if(e)html+=pcExoCard(e)});
 }
 slot.innerHTML=html;
 slot.querySelectorAll('[data-exo]').forEach(c=>c.onclick=()=>pcOpen(c.dataset.exo));
 if(slot.scrollIntoView)slot.scrollIntoView({block:'nearest'});
}

/* ══════ Carte d'un exercice ══════ */
function pcExoCard(e){
 return `<div class="card pc-card" data-exo="${e.id}">
   <p class="wknum">${pcEsc(e.cadre)}</p>
   <h2 class="wktitle">${pcEsc(e.titre)}</h2>
   <div class="consigne"><p>${pcEsc(e.resume)}</p></div>
 </div>`;
}

/* ══════ Liste complète des exercices ══════ */
function pcRenderListe(){
 PCV.view='liste';
 const host=document.getElementById('pensees');if(!host)return;
 const D=pcData();if(!D){host.innerHTML=`<p class="empty">${pcU().loadFail}</p>`;return}
 let html=`<div class="warn">${pcEsc(D.gardeFouGlobal)}</div>`;
 html+=`<button class="btn ghost" id="pc-retour" style="margin-top:16px">${pcU().pnBack}</button>`;
 (D.exercices||[]).forEach(e=>{html+=pcExoCard(e)});
 html+=pcCarnetHtml();
 host.innerHTML=html;
 host.querySelectorAll('[data-exo]').forEach(c=>c.onclick=()=>pcOpen(c.dataset.exo));
 const rb=document.getElementById('pc-retour');if(rb)rb.onclick=()=>pcRenderAccueil();
 pcWireCarnet(host);
}

/* ══════ Ouverture d'un exercice ══════ */
function pcOpen(id){
 const e=pcExo(id);if(!e)return;
 PCS.ex=e;PCS.type=e.type;PCS.i=0;PCS.ans={};
 if(e.type==='souffle')pcSouffleStart(e);
 else pcStepPaint();       // etapes / sens partagent l'overlay pas-à-pas
}

/* ══════ Type "souffle" : minuteur respiratoire dédié (overlay #pcSession) ══════ */
function pcSouffleStart(e){
 const sf=e.souffle||{};
 const durs=sf.durees||[5];
 let dur=PC.prefs.souffleDuree;
 if(durs.indexOf(dur)<0)dur=sf.defaut||durs[0];
 PC.prefs.souffleDuree=dur;
 PCS.souffle={run:false,raf:null,wl:null,end:0,phase:'in',dur:dur,cyc:(sf.inspir||5)+(sf.expir||5)};
 const ov=document.getElementById('pcSession');if(!ov)return;
 ov.classList.add('on');
 const g=id=>document.getElementById(id);
 g('pc-phase').textContent=sf.phaseIn||'';
 g('pc-clock').textContent=pcFmt(dur*60);
 g('pc-cue').textContent=pcEsc(sf.prete||'');
 g('pc-warn').textContent=pcEsc(e.gardeFou||'');
 g('pc-picker').innerHTML=durs.map(m=>
   `<button class="${m===dur?'sel':''}" data-dur="${m}">${m} min</button>`).join('');
 g('pc-picker').querySelectorAll('button').forEach(b=>b.onclick=()=>{
   PC.prefs.souffleDuree=parseInt(b.dataset.dur,10)||dur;pcSave();pcSouffleStart(e)});
 const ss=g('pc-start');ss.textContent=pcU().pnStart;ss.style.display='';
 ss.onclick=()=>pcSouffleToggle(e);
 g('pc-quit').textContent=pcU().pnQuit;g('pc-quit').onclick=()=>pcSouffleQuit();
 pcArcReset();
}
function pcFmt(s){return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`}
var PC_ARC=2*Math.PI*46;
function pcArcReset(){const a=document.getElementById('pc-arc');if(a){a.style.strokeDasharray=PC_ARC;a.style.strokeDashoffset=PC_ARC}}
async function pcSouffleToggle(e){
 const S2=PCS.souffle;
 const ss=document.getElementById('pc-start');
 if(!S2.run){
  S2.run=true;S2.end=Date.now()+S2.dur*60*1000;S2.t0=Date.now();
  ss.textContent=pcU().pnStop;
  try{S2.wl=await navigator.wakeLock.request('screen')}catch(err){}
  pcSouffleTick(e);
 }else{
  S2.run=false;if(S2.raf)cancelAnimationFrame(S2.raf);
  if(S2.wl){try{S2.wl.release()}catch(err){}S2.wl=null}
  ss.textContent=(LG==='ja'?'再開':'Reprendre');
 }
}
function pcSouffleTick(e){
 const S2=PCS.souffle;if(!S2.run)return;
 const sf=e.souffle||{};
 const inspir=sf.inspir||5,expir=sf.expir||5,cyc=inspir+expir;
 const now=Date.now();
 const left=Math.max(0,(S2.end-now)/1000);
 const clk=document.getElementById('pc-clock');if(clk)clk.textContent=pcFmt(left);
 // position dans le cycle respiratoire
 const inCyc=((now-S2.t0)/1000)%cyc;
 let phase,frac;
 if(inCyc<inspir){phase='in';frac=inCyc/inspir}          // remplissage
 else{phase='out';frac=1-((inCyc-inspir)/expir)}          // vidage
 const arc=document.getElementById('pc-arc');
 if(arc)arc.style.strokeDashoffset=PC_ARC*(1-frac);
 if(phase!==S2.phase){
  S2.phase=phase;
  const ph=document.getElementById('pc-phase');
  if(ph)ph.textContent=(phase==='in')?(sf.phaseIn||''):(sf.phaseOut||'');
  if(PC.prefs.vibration&&navigator.vibrate){try{navigator.vibrate(40)}catch(err){}}
 }
 if(left<=0){pcSouffleDone(e);return}
 S2.raf=requestAnimationFrame(()=>pcSouffleTick(e));
}
function pcSouffleDone(e){
 const S2=PCS.souffle;S2.run=false;if(S2.raf)cancelAnimationFrame(S2.raf);
 if(S2.wl){try{S2.wl.release()}catch(err){}S2.wl=null}
 if(PC.prefs.vibration&&navigator.vibrate){try{navigator.vibrate([60,120,60])}catch(err){}}
 const sf=e.souffle||{};
 const g=id=>document.getElementById(id);
 g('pc-phase').textContent='';
 g('pc-clock').textContent='';
 g('pc-cue').textContent=pcEsc(sf.fin||'');
 g('pc-picker').innerHTML='';
 g('pc-start').style.display='none';
 g('pc-quit').textContent=pcU().pnDone;
 pcArcReset();
}
function pcSouffleQuit(){
 const S2=PCS.souffle;S2.run=false;if(S2.raf)cancelAnimationFrame(S2.raf);
 if(S2.wl){try{S2.wl.release()}catch(err){}S2.wl=null}
 const ov=document.getElementById('pcSession');if(ov)ov.classList.remove('on');
 renderPensees();
}

/* ══════ Types "etapes" (formulaire pas-à-pas) et "sens" (5-4-3-2-1) ══════
   Rendus dans #pensees (esprit .rdstage), un écran par question. */
function pcStepPaint(){
 const e=PCS.ex;if(!e)return;
 const host=document.getElementById('pensees');if(!host)return;
 const steps=e.etapes||[];
 const N=steps.length;
 const i=PCS.i;

 if(i>=N){pcStepClose();return}

 const st=steps[i];
 let field='';
 if(e.type==='sens'){
  field=`<textarea id="pc-fld" placeholder="${pcU().pnSkip}"></textarea>`;
 }else if(st.saisie==='texte'){
  field=`<textarea id="pc-fld"></textarea>`;
 }else if(st.saisie==='echelle'){
  const b=st.bornes||['',''];
  const v=(PCS.ans[st.champ]!=null)?PCS.ans[st.champ]:50;
  field=`<input type="range" id="pc-fld" min="0" max="100" value="${v}">
    <div class="pc-scale"><span>${pcEsc(b[0])}</span><span id="pc-scaleval">${v}</span><span>${pcEsc(b[1])}</span></div>`;
 }else if(st.saisie==='choix'){
  const opts=(st.options||[]).map(o=>
    `<button class="btn ghost pc-choice${PCS.ans[st.champ]===o?' sel':''}" data-choix="${pcEsc(o)}">${pcEsc(o)}</button>`).join('');
  field=`<div class="pc-choices">${opts}</div>`;
 }

 const label=(e.type==='sens')?(pcU().pnSensCount?pcU().pnSensCount(st.compte):('×'+st.compte)):'';
 host.innerHTML=`
  <div class="pc-step">
    <div class="rdtop"><div class="rdrow">
      <button class="backbtn" id="pc-abort">${pcU().pnQuit}</button>
      <span class="rdcount">${pcEsc(e.titre)} · ${i+1}/${N}</span>
    </div><div class="rdprog"><i style="width:${(i+1)/N*100}%"></i></div></div>
    <div class="pc-stage">
      ${label?`<p class="rdtag">${label}</p>`:''}
      <p class="rdpara">${pcEsc(st.question)}</p>
      ${field}
    </div>
    <div class="warn">${pcEsc(e.gardeFou||'')}</div>
    <div class="pc-nav">
      ${i>0?`<button class="btn ghost" id="pc-prev">${pcU().pnBack}</button>`:''}
      <button class="btn" id="pc-next">${i===N-1?pcU().pnFinish:pcU().pnNext}</button>
    </div>
  </div>`;

 const rng=document.getElementById('pc-fld');
 if(st.saisie==='echelle'&&rng){
  rng.oninput=()=>{const sv=document.getElementById('pc-scaleval');if(sv)sv.textContent=rng.value};
 }
 // pré-remplissage des champs texte au retour arrière
 if((e.type==='sens'||st.saisie==='texte')&&rng&&PCS.ans[pcStepKey(st,i)]!=null){
  rng.value=PCS.ans[pcStepKey(st,i)];
 }
 host.querySelectorAll('.pc-choice').forEach(b=>b.onclick=()=>{
  PCS.ans[st.champ]=b.dataset.choix;pcStepNext();
 });
 const nx=document.getElementById('pc-next');if(nx)nx.onclick=()=>pcStepNext();
 const pv=document.getElementById('pc-prev');if(pv)pv.onclick=()=>{PCS.i=Math.max(0,i-1);pcStepPaint()};
 const ab=document.getElementById('pc-abort');if(ab)ab.onclick=()=>renderPensees();
 scrollTo(0,0);
}
function pcStepKey(st,i){return st.champ||('sens'+i)}
function pcStepNext(){
 const e=PCS.ex;const steps=e.etapes||[];const i=PCS.i;const st=steps[i];
 if(st){
  const fld=document.getElementById('pc-fld');
  if(fld){
   if(st.saisie==='choix'){/* déjà capté au clic */}
   else PCS.ans[pcStepKey(st,i)]=fld.value;
  }
 }
 PCS.i=i+1;
 pcStepPaint();
}

/* ══════ Clôture d'un exercice (etapes / sens) : proposition d'enregistrer ══════ */
function pcStepClose(){
 const e=PCS.ex;if(!e)return;
 const host=document.getElementById('pensees');if(!host)return;
 host.innerHTML=`
  <div class="card">
    <h2 class="wktitle">${pcEsc(e.titre)}</h2>
    <div class="consigne"><p>${pcEsc(e.cloture||'')}</p></div>
    <button class="btn" id="pc-save">${pcU().pnSave}</button>
    <button class="btn ghost" id="pc-noSave">${pcU().pnQuit}</button>
  </div>`;
 const sv=document.getElementById('pc-save');if(sv)sv.onclick=()=>pcSaveEntry();
 const ns=document.getElementById('pc-noSave');if(ns)ns.onclick=()=>{PCS.ans={};renderPensees()};
 scrollTo(0,0);
}

/* Crée une entrée dans le carnet UNIQUEMENT sur choix explicite. */
async function pcSaveEntry(){
 const e=PCS.ex;if(!e)return;
 const steps=e.etapes||[];
 const lignes=[];
 steps.forEach((st,i)=>{
  const k=pcStepKey(st,i);
  const v=PCS.ans[k];
  if(v==null||String(v).trim()==='')return;
  lignes.push({q:st.question,r:String(v)});
 });
 PC.carnet.push({
  date:new Date().toLocaleDateString(LG==='ja'?'ja-JP':'fr-FR'),
  exo:e.id,titre:e.titre,cadre:e.cadre,lignes:lignes
 });
 await pcSave();
 PCS.ans={};
 renderPensees();
}

/* ══════ Carnet du module (PC.carnet) ══════ */
function pcCarnetHtml(){
 let html=`<p class="sechead" style="margin-top:34px">${pcU().pnCarnet}</p>`;
 if(!PC.carnet.length){
  html+=`<p class="empty">${pcU().pnEmpty}</p>`;
  return html;
 }
 PC.carnet.slice().reverse().forEach((en,ri)=>{
  const idx=PC.carnet.length-1-ri;   // index réel dans PC.carnet
  const corps=(en.lignes||[]).map(l=>
    `<p class="jtext"><span class="pc-q">${pcEsc(l.q)}</span>${pcEsc(l.r)}</p>`).join('');
  html+=`<div class="jentry">
    <p class="jmeta">${pcEsc(en.date)} · ${pcEsc(en.titre)}</p>
    ${corps}
    <button class="btn ghost pc-del" data-i="${idx}" style="margin-top:8px">${pcU().pnDelete}</button>
  </div>`;
 });
 return html;
}
function pcWireCarnet(host){
 host.querySelectorAll('.pc-del').forEach(b=>b.onclick=()=>pcDeleteEntry(parseInt(b.dataset.i,10)));
}
async function pcDeleteEntry(i){
 if(i>=0&&i<PC.carnet.length){PC.carnet.splice(i,1);await pcSave()}
 renderPensees();
}
