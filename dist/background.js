(()=>{"use strict";chrome.runtime.onMessage.addListener(((t,e,i)=>("SHOW_NOTIFICATION"===t.type&&function(t){const e=`chatgpt-notification-${Date.now()}`;chrome.notifications.create(e,{type:"basic",iconUrl:chrome.runtime.getURL("icon128.png"),title:"ChatGPT Response",message:t,priority:2}),setTimeout((()=>{chrome.notifications.clear(e)}),5e3)}(t.text),!0)))})();