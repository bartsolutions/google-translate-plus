getBrowser().browserAction.onClicked.addListener(function(tab) {
    openTab("options.html");
});

getBrowser().runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
      openTab("https://www.bart.com.hk/google-translate-plus-installed/");
      openTab("options.html");
    } 
    else if(details.reason == "update"){
      // no need to do the warning here
    }
});
