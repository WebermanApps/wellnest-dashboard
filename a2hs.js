(function(){
  var b=document.getElementById('a2hs'),sh=document.getElementById('a2hs-sheet'),dp=null;
  var standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(standalone){b.hidden=true;return}
  addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e});
  addEventListener('appinstalled',function(){b.hidden=true});
  function openS(){sh.hidden=false;sh.querySelector('.a2hs-close').focus()}
  function closeS(){sh.hidden=true;b.focus()}
  b.addEventListener('click',function(){if(dp){dp.prompt();dp.userChoice.then(function(){dp=null})}else openS()});
  sh.addEventListener('click',function(e){if(e.target===sh||e.target.closest('.a2hs-close'))closeS()});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&!sh.hidden)closeS()});
})();
