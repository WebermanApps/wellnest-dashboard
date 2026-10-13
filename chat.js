/* WellNest Team Chat. Open to anyone with the link: keep replies.json non-sensitive. */
(function(){
  var box=document.getElementById('chat'),TK='wn-chat-thread',NK='wn-chat-name',BK='wn-chat-backup';
  function nb(u){return u+(u.indexOf('?')<0?'?':'&')+'t='+Date.now()}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function tid(){var t=localStorage.getItem(TK);if(!t){t='t-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);localStorage.setItem(TK,t)}return t}
  var RK='wn-chat-rate',LINK=/(https?:|ftp:|www\.|:\/\/|\b[a-z0-9-]+(\.[a-z0-9-]+)*(\.|\s*\[\.\]\s*|\s*\(dot\)\s*|\s+dot\s+)(com|net|org|io|co|ly|me|app|xyz|info|biz|ru|cn|th|uk|us|ai|gg|to|tk|link|site|online|shop|top|club|live|[a-z]{2})\b)/i;
  function sentLog(){try{return JSON.parse(localStorage.getItem(RK)||'[]')}catch(_){return[]}}
  function backup(){try{return JSON.parse(localStorage.getItem(BK)||'[]')}catch(_){return[]}}
  function render(replies){
    var mine=backup().map(function(m){return {who:m.name,text:m.message,at:m.sentAt,me:1}});
    var r=(replies&&replies[tid()])||[];
    var all=mine.concat(r.map(function(x){return {who:'WellNest',text:x.text,at:x.at}})).sort(function(a,b){return (a.at||'')<(b.at||'')?-1:1});
    var th=document.getElementById('thread');
    th.innerHTML=all.length?all.map(function(m){return '<div class="msg'+(m.me?' me':'')+'"><b>'+esc(m.who||'')+'</b><p>'+esc(m.text)+'</p><small>'+esc(m.at?new Date(m.at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'')+'</small></div>'}).join(''):'<p class="empty">No messages yet. Ask WellNest anything.</p>';
  }
  function poll(){fetch(nb('replies.json'),{cache:'no-store'}).then(function(r){return r.json()}).then(render).catch(function(){render(null)})}
  function open(){
    box.innerHTML='<form id="cform"><label>Your Name<input id="cname" required maxlength="40" autocomplete="name"></label><label>Message<textarea id="cmsg" required maxlength="500" rows="3"></textarea></label><button class="btn mw-hover" type="submit">Send</button><div id="cstat" role="status" aria-live="polite"></div></form><h3>Your Thread</h3><div id="thread"></div>';
    var n=document.getElementById('cname');n.value=localStorage.getItem(NK)||'';
    document.getElementById('cform').onsubmit=function(e){e.preventDefault();
      var st=document.getElementById('cstat'),m=document.getElementById('cmsg');
      var rec={name:n.value.trim(),message:m.value.trim(),threadId:tid(),sentAt:new Date().toISOString()};
      if(!rec.name||!rec.message)return;
      if(rec.name.length>40||rec.message.length>500){st.textContent='Please keep your name under 40 characters and your message under 500.';return}
      if(LINK.test(rec.name)||LINK.test(rec.message)){st.textContent='Links can not be sent in Team Chat. Please describe it in words instead.';return}
      var now=Date.now(),log=sentLog().filter(function(t){return now-t<3600000});
      if(log.length&&now-log[log.length-1]<30000){st.textContent='Please wait '+Math.ceil((30000-(now-log[log.length-1]))/1000)+' seconds before sending another message.';return}
      if(log.length>=10){st.textContent='You have reached 10 messages this hour. Please try again a little later.';return}
      log.push(now);localStorage.setItem(RK,JSON.stringify(log));localStorage.setItem(NK,rec.name);
      var b=backup();b.push(rec);localStorage.setItem(BK,JSON.stringify(b));
      st.textContent='Sending';
      MWSubmit.send({agent:'wellnest',app:'team-chat',deck:rec.threadId,results:rec,notes:rec.message}).then(function(ok){
        st.innerHTML=ok?'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Sent':'Not sent yet. Saved on this device; it retries when you reopen.';
        if(ok)m.value='';render(window.__wnR)});};
    poll();setInterval(poll,45000);
  }
  var _r=render;render=function(x){if(x)window.__wnR=x;_r(window.__wnR)};
  open();
})();
