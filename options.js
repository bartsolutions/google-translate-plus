var getReviewUrl = function(){
  var url; 
  if(gIsChrome)
    url = "https://chrome.google.com/webstore/detail/google-translate-plus/" + getExtensionID() + "/reviews?hl=en";
  else
    url = "https://addons.mozilla.org/en-US/firefox/addon/google-translate-plus/#reviews";

  return url;
};

var savePreferences = function(){
  var max_history = $("input[name='max_history']:checked").val();

  getBrowser().storage.local.set(
    {"max_history": max_history}, 
    function(result){
      $("#status").html("Preferences saved.<br/><br/>");
      setTimeout(function() { 
        $("#status").html("");
      }, 3000);
    }
  );
};

var pullPreferences = function(){
  getBrowser().storage.local.get(
    ["max_history"],
    function(result){
      console.log("@GTP, options", result.max_history);
      if(result.max_history){
        $("input[name='max_history'][value='" + result.max_history + "']").prop("checked", true);
      }
    }
  );
};

$(document).ready(function(){
  $("#save").click(savePreferences);
  $("#review").click(function(){
    window.open(getReviewUrl(), "_blank");
  });

  pullPreferences();
});
