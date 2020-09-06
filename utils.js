/*
 * Simple Gmail Screen 
 * https://github.com/bart2016
 * Copyright (C) 2020 Bart Solutions (HK)
 * License: GPLv3
 */

// do once and cache to global
gIsChrome = false;
if(!window.location.href.startsWith("moz-extension:"))
  gIsChrome = !!window.chrome;

var getBrowser = function(){
  if(gIsChrome)
    return chrome;

  //firefox
  return browser;
};

var openTab = function(page){
  var url;
  if(page.startsWith("https://")){
    url = page;
  }
  else {
    if(gIsChrome)
      url = "chrome-extension://" + chrome.runtime.id + "/" + page;
    else
      url = browser.extension.getURL(page);
  }

  getBrowser().tabs.create({"url" : url});
};

var getExtensionID = function(){
  return getBrowser().runtime.id;
};

