/* Voix — synthèse vocale (say/hush/sayCue) et enregistrement personnel
   (recToggle/playMine/delMine/toggleAuto), portés de demo/index.html.
   Dépend au moment de l'appel de : LG, ST, Wv (app.js), S, DB (storage.js), paint (reader.js). */

/* ══════ Voix : enregistrement personnel (IndexedDB) + synthèse ══════ */
var VT={
 fr:{rec:"S'enregistrer",recing:"Enregistrement… appuyer pour arrêter",mine:"Ma voix",
     again:"Réenregistrer",tts:"Voix de l'app",listen:"Écouter la consigne",stop:"Arrêter",
     auto:"Lecture auto de ma voix",noMic:"Micro indisponible sur cet appareil.",
     first:"Première lecture : enregistre-toi paragraphe par paragraphe. Dès la deuxième, tu pourras t'écouter.",
     kept:"Enregistré sur ce téléphone uniquement."},
 ja:{rec:"録音する",recing:"録音中… タップで停止",mine:"自分の声",
     again:"録り直す",tts:"アプリの声",listen:"指示を聞く",stop:"停止",
     auto:"自分の声を自動再生",noMic:"この端末ではマイクを利用できません。",
     first:"最初の通読では、段落ごとに自分の声を録音します。二度目からは、自分の声で聴けます。",
     kept:"録音はこの端末の中だけに保存されます。"}
};
var V=()=>VT[LG]||VT.fr;

/* ---- synthèse vocale ---- */
var SPK=false;
function strip(h){const d=document.createElement('div');d.innerHTML=h;
 return d.textContent.replace(/\s+/g,' ').trim()}
function say(t){
 if(!('speechSynthesis' in window))return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(t);
 u.lang=(LG==='ja')?'ja-JP':'fr-FR'; u.rate=(LG==='ja')?0.95:0.92; u.pitch=1;
 u.onend=()=>{SPK=false;paintVoiceBtns()}; u.onerror=()=>{SPK=false;paintVoiceBtns()};
 SPK=true; speechSynthesis.speak(u); paintVoiceBtns();
}
function hush(){if('speechSynthesis' in window)speechSynthesis.cancel();SPK=false;paintVoiceBtns()}
function paintVoiceBtns(){document.querySelectorAll('.ttsbtn').forEach(b=>{
  b.textContent=(SPK?'■ '+V().stop:'▸ '+(b.dataset.lbl||V().tts))})}
function sayCue(n){ if(SPK){hush();return}
  const w=Wv.find(x=>x.n===n); say(w.t+'. '+strip(w.x)); }

/* ---- enregistrement ---- */
var REC={mr:null,ch:[],key:null,stream:null};
async function recToggle(key,btnId){
 const b=document.getElementById(btnId);
 if(REC.mr&&REC.mr.state==='recording'){REC.mr.stop();return}
 if(!navigator.mediaDevices||!window.MediaRecorder||!DB.ok){alert(V().noMic);return}
 try{
  REC.stream=await navigator.mediaDevices.getUserMedia({audio:true});
 }catch(e){alert(V().noMic);return}
 REC.ch=[];REC.key=key;
 REC.mr=new MediaRecorder(REC.stream);
 REC.mr.ondataavailable=e=>{if(e.data.size)REC.ch.push(e.data)};
 REC.mr.onstop=async()=>{
   const blob=new Blob(REC.ch,{type:REC.mr.mimeType||'audio/mp4'});
   try{await DB.put(REC.key,blob)}catch(e){}
   REC.stream.getTracks().forEach(t=>t.stop());
   REC.mr=null; if(typeof paint==='function'&&document.getElementById('pane-read').classList.contains('act'))paint();
 };
 REC.mr.start();
 if(b){b.textContent='■ '+V().recing;b.classList.add('recing')}
}
var AU=null;
async function playMine(key,btnId){
 if(AU&&!AU.paused){AU.pause();AU=null;const b=document.getElementById(btnId);if(b)b.textContent='▸ '+V().mine;return}
 const blob=await DB.get(key); if(!blob)return;
 AU=new Audio(URL.createObjectURL(blob));
 const b=document.getElementById(btnId);
 if(b)b.textContent='■ '+V().stop;
 AU.onended=()=>{if(b)b.textContent='▸ '+V().mine};
 AU.play().catch(()=>{});
}
async function delMine(key){ if(!DB.ok)return; await DB.del(key); paint(); }
async function toggleAuto(){ ST.autoVoice=!ST.autoVoice; await S.set('mk',ST); paint(); }
