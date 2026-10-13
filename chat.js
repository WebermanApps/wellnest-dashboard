/* WellNest Team Chat. Lock is client-side only: keep replies.json non-sensitive. */
(function(){
  var box=document.getElementById('chat'),TK='wn-chat-thread',NK='wn-chat-name',UK='wn-chat-unlock',BK='wn-chat-backup';
  function nb(u){return u+(u.indexOf('?')<0?'?':'&')+'t='+Date.now()}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function tid(){var t=localStorage.getItem(TK);if(!t){t='t-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);localStorage.setItem(TK,t)}return t}
  function sha(s){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){return [].map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')})}
  function backup(){try{return JSON.parse(localStorage.getItem(BK)||'[]')}catch(_){return[]}}
  function render(replies){
    var mine=backup().map(function(m){return {who:m.name,text:m.message,at:m.sentAt,me:1}});
    var r=(replies&&replies[tid()])||[];
    var all=mine.concat(r.map(function(x){return {who:'WellNest',text:x.text,at:x.at}})).sort(function(a,b){return (a.at||'')<(b.at||'')?-1:1});
    var th=document.getElementById('thread');
    th.innerHTML=all.length?all.map(function(m){return '<div class="msg'+(m.me?' me':'')+'"><b>'+esc(m.who||'')+'</b><p>'+esc(m.text)+'</p><small>'+esc((m.at||'').slice(0,16).replace('T',' '))+'</small></div>'}).join(''):'<p class="empty">No messages yet. Ask WellNest anything.</p>';
  }
  function poll(){fetch(nb('replies.json'),{cache:'no-store'}).then(function(r){return r.json()}).then(render).catch(function(){render(null)})}
  function open(){
    box.innerHTML='<form id="cform"><label>Your Name<input id="cname" required maxlength="60" autocomplete="name"></label><label>Message<textarea id="cmsg" required maxlength="2000" rows="3"></textarea></label><button class="btn mw-hover" type="submit">Send</button><div id="cstat" role="status" aria-live="polite"></div></form><h3>Your Thread</h3><div id="thread"></div>';
    var n=document.getElementById('cname');n.value=localStorage.getItem(NK)||'';
    document.getElementById('cform').onsubmit=function(e){e.preventDefault();
      var st=document.getElementById('cstat'),m=document.getElementById('cmsg');
      var rec={name:n.value.trim(),message:m.value.trim(),threadId:tid(),sentAt:new Date().toISOString()};
      if(!rec.name||!rec.message)return;localStorage.setItem(NK,rec.name);
      var b=backup();b.push(rec);localStorage.setItem(BK,JSON.stringify(b));
      st.textContent='Sending';
      MWSubmit.send({agent:'wellnest',app:'team-chat',deck:rec.threadId,results:rec,notes:rec.message}).then(function(ok){
        st.innerHTML=ok?'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Sent':'Not sent yet. Saved on this device; it retries when you reopen.';
        if(ok)m.value='';render(window.__wnR)});};
    poll();setInterval(poll,45000);
  }
  var _r=render;render=function(x){if(x)window.__wnR=x;_r(window.__wnR)};
  fetch(nb('chat-config.json'),{cache:'no-store'}).then(function(r){return r.json()}).then(function(c){
    if(!c.passwordHash){box.innerHTML='<p class="empty">Team chat opens soon.</p>';return}
    if(localStorage.getItem(UK)===c.passwordHash)return open();
    box.innerHTML='<form id="lock"><label>Team Password<input id="pw" type="password" required autocomplete="current-password"></label><button class="btn mw-hover" type="submit">Unlock</button><div id="lstat" role="status"></div></form>';
    document.getElementById('lock').onsubmit=function(e){e.preventDefault();sha(document.getElementById('pw').value).then(function(h){
      if(h===c.passwordHash){localStorage.setItem(UK,h);open()}else document.getElementById('lstat').textContent='Wrong password.'})};
  }).catch(function(){box.innerHTML='<p class="empty">Team chat is unavailable right now.</p>'});
})();
