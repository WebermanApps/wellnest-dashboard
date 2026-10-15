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
    var ul=document.getElementById('thread'),em=document.getElementById('chat-empty');ul.textContent='';em.hidden=all.length>0;
    all.forEach(function(m){var li=document.createElement('li');li.className='chat-row'+(m.me?' me':' them');
      li.innerHTML='<span class="cw">'+esc(m.who||'')+'</span><span class="tx">'+esc(m.text)+'</span><span class="dt">'+esc(m.at?new Date(m.at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'')+'</span>';ul.appendChild(li)});
  }
  function css(){if(document.getElementById('chat-css'))return;var c=document.createElement('style');c.id='chat-css';c.textContent=
  '#chat .chat-form{display:grid;gap:8px;max-width:none}'+
  '#chat .chat-form input{flex:1;min-width:0;min-height:48px;font:16px var(--mw-font-body);padding:10px 12px;border:1px solid var(--mw-border);border-radius:10px;background:#fff;color:#333;width:100%;box-sizing:border-box}'+
  '#chat .chat-form input:focus{outline:2px solid #7A5A12;outline-offset:-1px}#chat .chat-form .cn{max-width:260px}'+
  '#chat .chat-row-in{display:flex;gap:8px}'+
  '#chat .chat-row-in button{min-height:48px;padding:0 22px;font:600 15px var(--mw-font-body);letter-spacing:.04em;background:#7A5A12;color:#fff;border:1px solid #7A5A12;border-radius:999px;cursor:pointer;flex:none}'+
  '#chat .cstat{min-height:1.2em;font-size:14px;color:var(--mw-muted-text);margin:6px 0 0}'+
  '#chat .chat-list{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:8px}'+
  '#chat .chat-row{display:flex;align-items:baseline;gap:10px;padding:10px 12px;border:1px solid var(--mw-border);border-left:4px solid #ECC978;border-radius:10px;background:#fff}'+
  '#chat .chat-row.them{border-left-color:#267D58;background:#FBF7EF}'+
  '#chat .chat-row .cw{font-weight:600;flex:none}#chat .chat-row .tx{flex:1;min-width:0;overflow-wrap:anywhere;white-space:pre-wrap}'+
  '#chat .chat-row .dt{font-size:.8rem;color:var(--mw-muted-text);white-space:nowrap;margin-left:auto}'+
  '#chat .empty{color:var(--mw-muted-text);margin:12px 0 0}#chat .hint{font-size:14px;color:var(--mw-muted-text);margin:10px 0 0}'+
  '@media(max-width:480px){#chat .chat-row{flex-wrap:wrap}#chat .chat-row .dt{width:100%;margin-left:0}#chat .chat-form .cn{max-width:none}}';document.head.appendChild(c)}
  function poll(){fetch(nb('replies.json'),{cache:'no-store'}).then(function(r){return r.json()}).then(render).catch(function(){render(null)})}
  function open(){
    css();
    box.innerHTML='<form class="chat-form" id="cform" autocomplete="off"><input id="cname" class="cn" required maxlength="40" autocomplete="name" placeholder="Your Name" aria-label="Your Name"><div class="chat-row-in"><input id="cmsg" type="text" required maxlength="500" placeholder="Ask WellNest a question" aria-label="Message" enterkeyhint="send"><button type="submit" class="mw-hover">Send</button></div></form><div id="cstat" class="cstat" role="status" aria-live="polite"></div><ul class="chat-list" id="thread"></ul><p class="empty" id="chat-empty">No messages yet. Ask one above.</p><p class="hint">Replies from WellNest show up here, usually within the day.</p>';
    var n=document.getElementById('cname');n.value=localStorage.getItem(NK)||'';
    document.getElementById('cform').onsubmit=function(e){e.preventDefault();
      var st=document.getElementById('cstat'),m=document.getElementById('cmsg');
      var rec={name:n.value.trim(),message:m.value.trim(),threadId:tid(),sentAt:new Date().toISOString()};var T=/[?&]chattest=1/.test(location.search);if(T)rec.test=true;
      if(!rec.name||!rec.message)return;
      if(rec.name.length>40||rec.message.length>500){st.textContent='Please keep your name under 40 characters and your message under 500.';return}
      if(LINK.test(rec.name)||LINK.test(rec.message)){st.textContent='Links can not be sent in Team Chat. Please describe it in words instead.';return}
      var now=Date.now(),log=sentLog().filter(function(t){return now-t<3600000});
      if(log.length&&now-log[log.length-1]<30000){st.textContent='Please wait '+Math.ceil((30000-(now-log[log.length-1]))/1000)+' seconds before sending another message.';return}
      if(log.length>=10){st.textContent='You have reached 10 messages this hour. Please try again a little later.';return}
      log.push(now);localStorage.setItem(RK,JSON.stringify(log));localStorage.setItem(NK,rec.name);
      var b=backup();b.push(rec);localStorage.setItem(BK,JSON.stringify(b));
      st.textContent='Sending';
      MWSubmit.send({agent:'wellnest',app:'team-chat',deck:rec.threadId,results:rec,notes:rec.message,test:T||undefined}).then(function(ok){
        st.textContent=ok?'Sent':'Not sent yet. Saved on this device; it retries when you reopen.';
        if(ok)m.value='';render(window.__wnR)});};
    poll();setInterval(poll,45000);
  }
  var _r=render;render=function(x){if(x)window.__wnR=x;_r(window.__wnR)};
  open();
})();
