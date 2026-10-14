/* WellNest deck rotation. Source of truth: deck-queue.json (published by /workspace/wellnest/sync-deck-queue.sh).
   Same-device instant swap: ?done=<deckId> on the return URL, or localStorage 'wn-deck-done' (JSON array) set by the deck on Submit. */
(function(){
var CATS=['Brand Look','Voice & Story','Experiences & Tours','Products & Tea','Dashboard & Online'],K='wn-deck-done',Q=null;
function local(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch(_){return[]}}
function addLocal(id){var a=local();if(a.indexOf(id)<0){a.push(id);try{localStorage.setItem(K,JSON.stringify(a))}catch(_){}}}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var u=new URL(location.href),d=u.searchParams.get('done');
if(d){d.split(',').forEach(function(x){x=x.trim();if(/^[\w.-]{1,80}$/.test(x))addLocal(x)});u.searchParams.delete('done');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash);}
function render(){if(!Q)return;var L=local(),g=document.getElementById('rgrid'),tot=0,h='';
 /* prune local flags the published list already confirms */
 var pub=Q.decks.filter(function(x){return x.status==='done'}).map(function(x){return x.deckId});
 var keep=L.filter(function(x){return pub.indexOf(x)<0});if(keep.length!==L.length)try{localStorage.setItem(K,JSON.stringify(keep))}catch(_){}
 CATS.forEach(function(c){var ds=Q.decks.filter(function(x){return x.category===c}).sort(function(a,b){return a.order-b.order});
  var isDone=function(x){return x.status==='done'||L.indexOf(x.deckId)>=0};var n=ds.filter(isDone).length;tot+=n;
  var cur=ds.filter(function(x){return!isDone(x)})[0],bar='<span class="rbar" aria-hidden="true">'+ds.map(function(x){return'<i class="'+(isDone(x)?'on':(x===cur?'cur':''))+'"></i>'}).join('')+'</span>';
  var prog=n+' of '+ds.length+' done';
  if(!cur)h+='<div class="rc fin" data-cat="'+esc(c)+'"><span class="rk">'+esc(c)+'</span><span class="rn">Category Complete</span><span class="rm">'+prog+'</span>'+bar+'</div>';
  else if(cur.url&&cur.status!=='planned')h+='<a class="rc" data-cat="'+esc(c)+'" data-deck="'+esc(cur.deckId)+'" href="'+esc(cur.url)+'"><span class="rk">'+esc(c)+'</span><span class="rn">'+esc(cur.name)+'</span><span class="rm">Deck '+cur.order+' of '+ds.length+' · '+prog+'</span>'+bar+'<span class="rgo">Open Deck →</span></a>';
  else h+='<div class="rc soon" data-cat="'+esc(c)+'" data-deck="'+esc(cur.deckId)+'"><span class="rk">'+esc(c)+'</span><span class="rn">'+(n?'Next Deck Coming Soon':'Deck Coming Soon')+'</span><span class="rm">Deck '+cur.order+' of '+ds.length+' · '+prog+'</span>'+bar+'</div>';});
 g.innerHTML=h;document.getElementById('rot-sum').textContent=tot+' of '+Q.decks.length+' decks done';}
function load(){return fetch('deck-queue.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){Q=j;render()}).catch(function(){var s=document.getElementById('rot-sum');if(s&&!Q)s.textContent='Deck list unavailable. Pull to refresh.'});}
window.WNRotation={markDone:function(id){addLocal(id);render()},reload:load};
addEventListener('storage',function(e){if(e.key===K)render()});
addEventListener('pageshow',function(e){if(e.persisted)load()});
document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
