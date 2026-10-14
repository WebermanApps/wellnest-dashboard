/* WellNest deck rotation. Source of truth: deck-queue.json (published by /workspace/wellnest/sync-deck-queue.sh).
   Same-device instant swap: ?done=<deckId> on the return URL, or localStorage 'wn-deck-done' (JSON array) set by the deck on Submit. */
(function(){
var CATS=['Brand Look','Voice & Story','Experiences & Tours','Products & Tea','Dashboard & Online'],K='wn-deck-done',Q=null,MAX=5;
function local(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch(_){return[]}}
function addLocal(id){var a=local();if(a.indexOf(id)<0){a.push(id);try{localStorage.setItem(K,JSON.stringify(a))}catch(_){}}}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var u=new URL(location.href),d=u.searchParams.get('done');
if(d){d.split(',').forEach(function(x){x=x.trim();if(/^[\w.-]{1,80}$/.test(x))addLocal(x)});u.searchParams.delete('done');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash);}
var COL={'Brand Look':'#B5651D','Voice & Story':'#6B7F3A','Experiences & Tours':'#2F6F8F','Products & Tea':'#8A5A8C','Dashboard & Online':'#5E6670'},OK='wn-deck-opened',ST=null;
function opened(){try{return JSON.parse(localStorage.getItem(OK)||'[]')}catch(_){return[]}}
function today(){var t=new Date(Date.now()+7*3600e3);return t.toISOString().slice(0,10)}
function render(){if(!Q)return;var L=local(),O=opened(),g=document.getElementById('rgrid');
 var pub=Q.decks.filter(function(x){return x.status==='done'}).map(function(x){return x.deckId});
 var keep=L.filter(function(x){return pub.indexOf(x)<0});if(keep.length!==L.length)try{localStorage.setItem(K,JSON.stringify(keep))}catch(_){}
 var isDone=function(x){return x.status==='done'||L.indexOf(x.deckId)>=0},t=today(),dt=0,cards=[];
 Q.decks.forEach(function(x){if(isDone(x)&&(L.indexOf(x.deckId)>=0||String(x.doneAt||'').slice(0,10)===t))dt++});
 CATS.forEach(function(c,i){var ds=Q.decks.filter(function(x){return x.category===c}).sort(function(a,b){return a.order-b.order});
  var n=ds.filter(isDone).length,cur=ds.filter(function(x){return!isDone(x)})[0];
  if(cur&&cur.url&&cur.status!=='planned')cards.push({d:cur,c:c,slot:i,refill:n>0,started:(cur.answered||0)>0});});
 /* started decks first; otherwise keep each category's slot so a refill stays where its deck was */
 cards.sort(function(a,b){return(b.started-a.started)||(a.slot-b.slot)});cards=cards.slice(0,MAX);
 var h=cards.map(function(o){var d=o.d,isNew=o.refill&&!o.started&&O.indexOf(d.deckId)<0;
  return'<a class="rs-card" style="--rs-c:'+(COL[o.c]||'#5E6670')+'" data-deck="'+esc(d.deckId)+'" href="'+esc(d.url)+'"><span class="rs-tagrow"><span class="rs-tag">'+esc(o.c)+'</span>'+(isNew?'<span class="rs-new">New</span>':'')+'</span><span class="rs-t">'+esc(d.name)+'</span><span class="rs-go">'+(o.started?'Continue':'Start')+'</span></a>'}).join('');
 g.innerHTML=h||'<p class="rs-empty">All caught up. New decks are on the way.</p>';
 g.querySelectorAll('.rs-card').forEach(function(a){a.addEventListener('click',function(){var o=opened(),id=a.getAttribute('data-deck');if(o.indexOf(id)<0){o.push(id);try{localStorage.setItem(OK,JSON.stringify(o))}catch(_){}}})});
 document.getElementById('rot-sum').textContent=dt+' done today';stats();}
function stats(){var el=document.getElementById('rs-stats');if(!el)return;if(!ST){el.hidden=true;return}
 var a=(ST.agents||{}).wellnest;if(!a){el.hidden=true;return}
 document.getElementById('rs-today').textContent=((a.days||{})[today()]||0).toLocaleString('en-US');document.getElementById('rs-all').textContent=(a.total||0).toLocaleString('en-US');el.hidden=false;}
fetch('https://webermanapps.github.io/style-swipe/kit/swipe-stats.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){ST=j;stats()}).catch(function(){});
function load(){return fetch('deck-queue.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){Q=j;render()}).catch(function(){var s=document.getElementById('rot-sum');if(s&&!Q)s.textContent='Deck list unavailable. Pull to refresh.'});}
window.WNRotation={markDone:function(id){addLocal(id);render()},reload:load};
addEventListener('storage',function(e){if(e.key===K)render()});
addEventListener('pageshow',function(e){if(e.persisted)load()});
document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
