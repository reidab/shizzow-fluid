// ==UserScript==
// @name        Return to Shizzow Homepage
// @namespace   http://fluidapp.com
// @description Returns the user to the shizzow homepage after a time of inactivity.
// @include     *

// @exclude     http://shizzow.com/
// @exclude     https://shizzow.com/
// @exclude     http://www.shizzow.com/
// @exclude     https://www.shizzow.com/
// @author      Reid Beels http://reidbeels.com
// ==/UserScript==

(function () {
    if (window.fluid) {
      var timeout = 120000; // in miliseconds
      
		  var reloadFunc = function(){
          window.location.href = 'http://www.shizzow.com/';
      };
      reloadFunc.timerId = setTimeout(reloadFunc,timeout);

      document.addEventListener('keyup',  function(){reloadFunc.timerId = setTimeout(reloadFunc,timeout);}, false);
      document.addEventListener('click',  function(){reloadFunc.timerId = setTimeout(reloadFunc,timeout);}, false);
    }
})();