/*! (C) WebReflection Mit Style License */
(function(e,t,n,r){"use strict";function k(e,t){(e[t]||e[t+"Callback"]||C).call(e)}function L(e,t){x(e,t),k(e,"created")}function A(e){L(e,l[O(e)])}function O(e){return h.call(f,(e.getAttribute("is")||"").toUpperCase()||e.nodeName)}function M(e,t,n){p.call(e.querySelectorAll(c.join(",")),t,n)}function _(e,t){var n,r=O(e);-1<r&&(n=l[r],w(e)!==n&&L(e,n),k(e,t))}function D(e){function t(t){_(t,e)}return function(n){var r=n.target;v.call(T,r)&&(_(r,e),M(r,t))}}if(r in t)return;var i="addEventListener",s="prototype",o="extends",u=/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,a=["ANNOTATION-XML","COLOR-PROFILE","FONT-FACE","FONT-FACE-SRC","FONT-FACE-URI","FONT-FACE-FORMAT","FONT-FACE-NAME","MISSING-GLYPH"],f=[],l=[],c=[],h=f.indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},p=f.forEach||function(e,t){for(var n=0,r=this.length;n<r;n++)e.call(t,this[n])},d=f.hasOwnProperty,v=f.isPrototypeOf,m=t.createElement,g=n.defineProperty,y=n.getOwnPropertyDescriptor,b=n.getOwnPropertyNames,w=n.getPrototypeOf,E=!1,S=!1,x=n.setPrototypeOf||(n.__proto__?function(e,t){return e.__proto__=t,e}:"getOwnPropertyDescriptor"in n?function(){function e(e,t){for(var n,r=b(t),i=0,s=r.length;i<s;i++)n=r[i],d.call(e,n)||g(e,n,y(t,n))}return function(t,n){do e(t,n);while(n=w(n));return t}}():function(e,t){for(var n in t)e[n]=t[n];return e}),T=(e.HTMLElement||e.Element||e.Node)[s],N=T.cloneNode,C=function(){};t[r]=function(n,r){var p=n.toUpperCase();E||(E=!0,t[i]("DOMNodeInserted",D("attached")),t[i]("DOMNodeRemoved",D("detached")),t.createElement=function(e,n){var r,i=m.apply(t,arguments);return n&&i.setAttribute("is",e=n.toLowerCase()),r=h.call(f,e.toUpperCase()),-1<r&&L(i,l[r]),i},T.cloneNode=function(e){var t=N.call(this,!!e),n=O(t);return-1<n&&L(t,l[n]),e&&M(t,A),t});if(-1<h.call(f,p))throw new Error("A "+n+" type is already registered");if(!u.test(p)||-1<h.call(a,p))throw new Error("The type "+n+" is invalid");var v=d.call(r||n,o),g=v?r[o]:p,y=f.push(p)-1;return c.push(v?g+'[is="'+n.toLowerCase()+'"]':g),l[y]=d.call(r,s)?r[s]:T,function(){return t.createElement(g,v&&p)}}})(window,document,Object,"registerElement");