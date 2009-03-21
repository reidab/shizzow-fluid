// ==UserScript==
// @name        Shizzow Growl Notifications
// @namespace   http://fluidapp.com
// @description Displays growl notifications for new entries on Shizzow.
// @include     http://shizzow.com/
// @include     http://www.shizzow.com/
// @include     https://shizzow.com/
// @include     https://www.shizzow.com/
// @author      Reid Beels http://reidbeels.com, Based on http://userscripts.org/scripts/show/29007
// ==/UserScript==      



/* === GETELEMENTSBYCLASSNAME ===
   Developed by Robert Nyman, http://www.robertnyman.com
   Code/licensing: http://code.google.com/p/getelementsbyclassname/
   ============================== */


var getElementsByClassName = function(className, tag, elm) {
    if (document.getElementsByClassName) {
        getElementsByClassName = function(className, tag, elm) {
            elm = elm || document;
            var elements = elm.getElementsByClassName(className),
            nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null,
            returnElements = [],
            current;
            for (var i = 0, il = elements.length; i < il; i += 1) {
                current = elements[i];
                if (!nodeName || nodeName.test(current.nodeName)) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    else if (document.evaluate) {
        getElementsByClassName = function(className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
            classesToCheck = "",
            xhtmlNamespace = "http://www.w3.org/1999/xhtml",
            namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace: null,
            returnElements = [],
            elements,
            node;
            for (var j = 0, jl = classes.length; j < jl; j += 1) {
                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
            }
            try {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
            }
            catch(e) {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
            }
            while ((node = elements.iterateNext())) {
                returnElements.push(node);
            }
            return returnElements;
        };
    }
    else {
        getElementsByClassName = function(className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
            classesToCheck = [],
            elements = (tag === "*" && elm.all) ? elm.all: elm.getElementsByTagName(tag),
            current,
            returnElements = [],
            match;
            for (var k = 0, kl = classes.length; k < kl; k += 1) {
                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
            }
            for (var l = 0, ll = elements.length; l < ll; l += 1) {
                current = elements[l];
                match = false;
                for (var m = 0, ml = classesToCheck.length; m < ml; m += 1) {
                    match = classesToCheck[m].test(current.className);
                    if (!match) {
                        break;
                    }
                }
                if (match) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    return getElementsByClassName(className, tag, elm);
};

/* === //GETELEMENTSBYCLASSNAME === */

   

/* === GETCOOKIE, SETCOOKIE and DELETECOOKIE ===
   Wanted to use GM_setValue and GM_getValue but both didn’t work with
   GreaseKit. So I had to use cookies which fortunately worked.
   Those tree functions were found at dustindiaz.com:
   http://www.dustindiaz.com/top-ten-javascript/
   ============================== */

function getCookie(name) {
    var start = document.cookie.indexOf(name + "=");
    var len = start + name.length + 1;
    if ((!start) && (name != document.cookie.substring(0, name.length))) {
        return null;
    }
    if (start == -1) return null;
    var end = document.cookie.indexOf(';', len);
    if (end == -1) end = document.cookie.length;
    return unescape(document.cookie.substring(len, end));
}

function setCookie(name, value, expires, path, domain, secure) {
    var today = new Date();
    today.setTime(today.getTime());
    if (expires) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date(today.getTime() + (expires));
    document.cookie = name + '=' + escape(value) +
    ((expires) ? ';expires=' + expires_date.toGMTString() : '') +
    //expires.toGMTString()
    ((path) ? ';path=' + path: '') +
    ((domain) ? ';domain=' + domain: '') +
    ((secure) ? ';secure': '');
}

function deleteCookie(name, path, domain) {
    if (getCookie(name)) document.cookie = name + '=' +
    ((path) ? ';path=' + path: '') +
    ((domain) ? ';domain=' + domain: '') +
    ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
}


function Shout(user,action,place,ago,messages,place_name,icon) {
  this.user = user;
  this.place = place;
  this.ago = ago;
  this.messages = messages;
  this.place_name = place_name;
  this.action = action;
  this.icon = icon;
  
  this.serialize = function() {
    if (this.messages.length > 0) {
      last_message = this.messages[0]
    } else {
      last_message = '';
    }

    return this.user + '|' + this.action + '|' + this.place + '|' + this.ago + '|' + last_message
  }
}

function splitShout(shout) {
  user = shout.getElementsByTagName('img')[0].getAttribute('alt');
  icon = 'http://www.shizzow.com' + shout.getElementsByTagName('img')[0].getAttribute('src');
  place_id = shout.getElementsByTagName('a')[2].getAttribute('href').replace('/places/','');
  place_name = shout.getElementsByTagName('a')[2].innerHTML;
  
  shout_split = shout.getElementsByTagName('p')[0].innerHTML.split('•');
  
  ago_text = shout_split[2]
  number_ago = ago_text.match(/[0-9]+/)[0];
  units_ago = ago_text.match(/hours?|minutes?|days?|weeks?|months?|years?/g)[0];
  ago = number_ago + ' ' + units_ago;
  
  action = shout_split[2].match(/left|shouted|was here/g)[0];
  
  var messages = shout.getElementsByClassName('message');
  var msg = Array();
    
  if(messages.length > 0) {
    for(var k = 0; k < messages.length; k++) {
      msg.push(messages[k].innerHTML);
    }
  }
  
  messages = msg;
  
  return new Shout(user,action,place_id,ago,messages,place_name,icon);
}

function decodeShout(serialized) {
  split = serialized.split('|');
  shout = new Shout(split[0],split[1],split[2],split[3],split[4]);
  shout.messages = Array(shout.messages);
  return shout;
}

(function() {
    if (window.fluid) {
        
        lastshout = getCookie("lastshout");

        if (lastshout == null) {
            lastshout = new Shout();
        } else {
          lastshout = decodeShout(lastshout);
        }
     	
       	thisuser = document.getElementById('content-primary').getElementsByTagName('h2')[0].getElementsByTagName('a')['0'].innerHTML

        var first = getElementsByClassName('list-item-top')[0];
        var contents = getElementsByClassName('list-item');
        contents.unshift(first);

        var firstshout = splitShout(first);
        
        setCookie("lastshout", firstshout.serialize());

        var badgecount = 0;

        for (var i = 0; i <= contents.length; i++) {
          
            var shout = splitShout(contents[i]);
            
            if (shout.user == lastshout.user && shout.place == lastshout.place) {
              if (shout.messages.length == 0 || (shout.messages.length == 1 && shout.messages[0] == lastshout.messages[0])){
                break;
              } else if (shout.messages.length > 1) {
                lastmsg = lastshout.messages[0].split('•')[0];
                thismsg = shout.messages[0].split('•')[0];
                if (lastmsg==thismsg) {
                  break;
                }
              }
            }
                        
            if (window.fluid.dockBadge) {
              window.fluid.dockBadge = parseInt(window.fluid.dockBadge, 10) + 1;
            } else {
              window.fluid.dockBadge = 1;
            }
            
            
            var thistitle = shout.user;
            var thisbody = shout.place_name + ": " + shout.action + ' ' + shout.ago + ' ago.';

            if(shout.messages.length > 0) {
              for(var j = 0; j < shout.messages.length; j++) {
                thisbody += '\n\n' + shout.messages[j];
              }
            }
            
            // have the browser do dom HTML entity conversion for us.
            var temp_div = document.createElement('div');
            temp_div.innerHTML = thisbody;
            thisbody = temp_div.firstChild.nodeValue

            var thisicon = shout.icon;
            
    				var thispriority = (thisbody.indexOf(thisuser) == -1) ? 0 : 1;
    				

                window.fluid.showGrowlNotification({
                    title: thistitle,
                    description: thisbody,
                    priority: thispriority,
                    sticky: false,
                    identifier: "shizzow" + shout.serialize(),
                    icon: thisicon
                });
            }
            
    }
})();