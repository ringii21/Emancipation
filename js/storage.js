/* Persistance — deux magasins, mêmes clés et schémas que la démo :
   S  : état utilisateur dans localStorage sous la clé "mk"
        ({done, journal, dur, lang, autoVoice, pos, loops}) ;
   DB : IndexedDB "lacle-voice", store "v", clés p<part>-<num> (audio).
   Jamais de binaire dans localStorage. */

/* ══════ Persistance : window.storage si dispo, sinon localStorage ══════ */
var S={
 async get(k){try{if(window.storage){const r=await window.storage.get(k,false);return r?JSON.parse(r.value):null}return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
 async set(k,v){try{if(window.storage){await window.storage.set(k,JSON.stringify(v),false)}else localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};

var DB={d:null,ok:false,
 async open(){try{
   this.d=await new Promise((res,rej)=>{const r=indexedDB.open('lacle-voice',1);
     r.onupgradeneeded=e=>{if(!e.target.result.objectStoreNames.contains('v'))e.target.result.createObjectStore('v')};
     r.onsuccess=e=>res(e.target.result);r.onerror=()=>rej(r.error)});
   this.ok=true}catch(e){this.ok=false}},
 tx(m){return this.d.transaction('v',m).objectStore('v')},
 put(k,b){return new Promise((res,rej)=>{const q=this.tx('readwrite').put(b,k);q.onsuccess=()=>res(1);q.onerror=()=>rej()})},
 get(k){return new Promise(res=>{if(!this.ok)return res(null);const q=this.tx('readonly').get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})},
 del(k){return new Promise(res=>{const q=this.tx('readwrite').delete(k);q.onsuccess=()=>res(1);q.onerror=()=>res(0)})},
 keys(){return new Promise(res=>{if(!this.ok)return res([]);const q=this.tx('readonly').getAllKeys();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([])})}
};
