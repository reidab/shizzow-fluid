// ==UserScript==
// @name        Reload Shizzow
// @namespace   http://fluidapp.com
// @description Reloads Shizzow every minute, except when input fields have focus.
// @include     http://shizzow.com/
// @include     http://www.shizzow.com/
// @include     https://shizzow.com/
// @include     https://www.shizzow.com/
// @author      Reid Beels http://reidbeels.com
// ==/UserScript==

(function () {
    if (window.fluid) {
        var reloadFunc = function(){
            window.location.href = window.location.href;
        };
        reloadFunc.timerId = setTimeout(reloadFunc,60000);
        
        fields = ['form_name','form_address','message','shoutMessageLeave']
        for ( var i in fields ) {
          var el = document.getElementById(fields[i]);
          el.addEventListener('keyup', function(e){clearTimeout(reloadFunc.timerId);}, false);
          el.addEventListener('click', function(e){clearTimeout(reloadFunc.timerId);}, false);
          el.addEventListener('focus', function(e){clearTimeout(reloadFunc.timerId);}, false);
          el.addEventListener('blur',  function(e){reloadFunc.timerId = setTimeout(reloadFunc,60000);}, false);
        }
    }
})();