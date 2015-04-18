/** @license

 DHTML Snowstorm! JavaScript-based snow for web pages
 Making it snow on the internets since 2003. You're welcome.
 -----------------------------------------------------------
 Version 1.44.20131111 (Previous rev: 1.43.20111201)
 Copyright (c) 2007, Scott Schiller. All rights reserved.
 Code provided under the BSD License
 http://schillmania.com/projects/snowstorm/license.txt
*/
var snowStorm=function(f,d){function k(a,e){isNaN(e)&&(e=0);return Math.random()*a+e}function w(){f.setTimeout(function(){a.start(!0)},20);a.events.remove(m?d:f,"mousemove",w)}function x(){(!a.excludeMobile||!C)&&w();a.events.remove(f,"load",x)}this.excludeMobile=this.autoStart=!0;this.flakesMax=128;this.flakesMaxActive=64;this.animationInterval=33;this.useGPU=!0;this.flakeBottom=null;this.followMouse=!0;this.snowColor="#fff";this.snowCharacter="&bull;";this.snowStick=!0;this.targetElement=null;this.useMeltEffect=
!0;this.usePositionFixed=this.useTwinkleEffect=!1;this.freezeOnBlur=!0;this.flakeRightOffset=this.flakeLeftOffset=0;this.flakeHeight=this.flakeWidth=8;this.vMaxX=5;this.vMaxY=4;this.zIndex=0;var a=this,q,m=navigator.userAgent.match(/msie/i),D=navigator.userAgent.match(/msie 6/i),C=navigator.userAgent.match(/mobile|opera m(ob|in)/i),r=m&&"BackCompat"===d.compatMode||D,h=null,n=null,l=null,p=null,u=null,y=null,z=null,v=1,s=!1,t;a:{try{d.createElement("div").style.opacity="0.5"}catch(E){t=!1;break a}t=
!0}var A=!1,B=d.createDocumentFragment();q=function(){function c(b){f.setTimeout(b,1E3/(a.animationInterval||20))}function e(a){return void 0!==h.style[a]?a:null}var g,b=f.requestAnimationFrame||f.webkitRequestAnimationFrame||f.mozRequestAnimationFrame||f.oRequestAnimationFrame||f.msRequestAnimationFrame||c;g=b?function(){return b.apply(f,arguments)}:null;var h;h=d.createElement("div");g={transform:{ie:e("-ms-transform"),moz:e("MozTransform"),opera:e("OTransform"),webkit:e("webkitTransform"),w3:e("transform"),
prop:null},getAnimationFrame:g};g.transform.prop=g.transform.w3||g.transform.moz||g.transform.webkit||g.transform.ie||g.transform.opera;h=null;return g}();this.timer=null;this.flakes=[];this.active=this.disabled=!1;this.meltFrameCount=20;this.meltFrames=[];this.setXY=r?function(c,e,g){c&&(c.style.left=e+"px",c.style.top=Math.min(g,u-a.flakeHeight)+"px")}:function(a,e,g){a&&(a.style.right=100-100*(e/h)+"%",a.style.bottom=100-100*(g/l)+"%")};this.events=function(){function a(c){c=b.call(c);var e=c.length;
g?(c[1]="on"+c[1],3<e&&c.pop()):3===e&&c.push(!1);return c}function e(a,b){var c=a.shift(),e=[d[b]];if(g)c[e](a[0],a[1]);else c[e].apply(c,a)}var g=!f.addEventListener&&f.attachEvent,b=Array.prototype.slice,d={add:g?"attachEvent":"addEventListener",remove:g?"detachEvent":"removeEventListener"};return{add:function(){e(a(arguments),"add")},remove:function(){e(a(arguments),"remove")}}}();this.randomizeWind=function(){var c;c=k(a.vMaxX,0.2);y=1===parseInt(k(2),10)?-1*c:c;z=k(a.vMaxY,0.2);if(this.flakes)for(c=
0;c<this.flakes.length;c++)this.flakes[c].active&&this.flakes[c].setVelocities()};this.scrollHandler=function(){var c;p=a.flakeBottom?0:parseInt(f.scrollY||d.documentElement.scrollTop||(r?d.body.scrollTop:0),10);isNaN(p)&&(p=0);if(!s&&!a.flakeBottom&&a.flakes)for(c=0;c<a.flakes.length;c++)0===a.flakes[c].active&&a.flakes[c].stick()};this.resizeHandler=function(){f.innerWidth||f.innerHeight?(h=f.innerWidth-16-a.flakeRightOffset,l=a.flakeBottom||f.innerHeight):(h=(d.documentElement.clientWidth||d.body.clientWidth||
d.body.scrollWidth)-(!m?8:0)-a.flakeRightOffset,l=a.flakeBottom||d.documentElement.clientHeight||d.body.clientHeight||d.body.scrollHeight);u=d.body.offsetHeight;n=parseInt(h/2,10)};this.resizeHandlerAlt=function(){h=a.targetElement.offsetLeft+a.targetElement.offsetWidth-a.flakeRightOffset;l=a.flakeBottom||a.targetElement.offsetTop+a.targetElement.offsetHeight;n=parseInt(h/2,10);u=d.body.offsetHeight};this.freeze=function(){if(a.disabled)return!1;a.disabled=1;a.timer=null};this.resume=function(){if(a.disabled)a.disabled=
0;else return!1;a.timerInit()};this.toggleSnow=function(){a.flakes.length?(a.active=!a.active,a.active?(a.show(),a.resume()):(a.stop(),a.freeze())):a.start()};this.stop=function(){var c;this.freeze();for(c=0;c<this.flakes.length;c++)this.flakes[c].o.style.display="none";a.events.remove(f,"scroll",a.scrollHandler);a.events.remove(f,"resize",a.resizeHandler);a.freezeOnBlur&&(m?(a.events.remove(d,"focusout",a.freeze),a.events.remove(d,"focusin",a.resume)):(a.events.remove(f,"blur",a.freeze),a.events.remove(f,
"focus",a.resume)))};this.show=function(){var a;for(a=0;a<this.flakes.length;a++)this.flakes[a].o.style.display="block"};this.SnowFlake=function(c,e,g){var b=this;this.type=c;this.x=e||parseInt(k(h-20),10);this.y=!isNaN(g)?g:-k(l)-12;this.vY=this.vX=null;this.vAmpTypes=[1,1.2,1.4,1.6,1.8];this.vAmp=this.vAmpTypes[this.type];this.melting=!1;this.meltFrameCount=a.meltFrameCount;this.meltFrames=a.meltFrames;this.twinkleFrame=this.meltFrame=0;this.active=1;this.fontSize=10+10*(this.type/5);this.o=d.createElement("div");
this.o.innerHTML=a.snowCharacter;this.o.style.color=a.snowColor;this.o.style.position=s?"fixed":"absolute";a.useGPU&&q.transform.prop&&(this.o.style[q.transform.prop]="translate3d(0px, 0px, 0px)");this.o.style.width=a.flakeWidth+"px";this.o.style.height=a.flakeHeight+"px";this.o.style.fontFamily="arial,verdana";this.o.style.cursor="default";this.o.style.overflow="hidden";this.o.style.fontWeight="normal";this.o.style.zIndex=a.zIndex;B.appendChild(this.o);this.refresh=function(){if(isNaN(b.x)||isNaN(b.y))return!1;
a.setXY(b.o,b.x,b.y)};this.stick=function(){r||a.targetElement!==d.documentElement&&a.targetElement!==d.body?b.o.style.top=l+p-a.flakeHeight+"px":a.flakeBottom?b.o.style.top=a.flakeBottom+"px":(b.o.style.display="none",b.o.style.bottom="0%",b.o.style.position="fixed",b.o.style.display="block")};this.vCheck=function(){0<=b.vX&&0.2>b.vX?b.vX=0.2:0>b.vX&&-0.2<b.vX&&(b.vX=-0.2);0<=b.vY&&0.2>b.vY&&(b.vY=0.2)};this.move=function(){var c=b.vX*v;b.x+=c;b.y+=b.vY*b.vAmp;b.x>=h||h-b.x<a.flakeWidth?b.x=0:0>
c&&b.x-a.flakeLeftOffset<-a.flakeWidth&&(b.x=h-a.flakeWidth-1);b.refresh();l+p-b.y+a.flakeHeight<a.flakeHeight?(b.active=0,a.snowStick?b.stick():b.recycle()):(a.useMeltEffect&&(b.active&&3>b.type&&!b.melting&&0.998<Math.random())&&(b.melting=!0,b.melt()),a.useTwinkleEffect&&(0>b.twinkleFrame?0.97<Math.random()&&(b.twinkleFrame=parseInt(8*Math.random(),10)):(b.twinkleFrame--,t?b.o.style.opacity=b.twinkleFrame&&0===b.twinkleFrame%2?0:1:b.o.style.visibility=b.twinkleFrame&&0===b.twinkleFrame%2?"hidden":
"visible")))};this.animate=function(){b.move()};this.setVelocities=function(){b.vX=y+k(0.12*a.vMaxX,0.1);b.vY=z+k(0.12*a.vMaxY,0.1)};this.setOpacity=function(a,b){if(!t)return!1;a.style.opacity=b};this.melt=function(){!a.useMeltEffect||!b.melting?b.recycle():b.meltFrame<b.meltFrameCount?(b.setOpacity(b.o,b.meltFrames[b.meltFrame]),b.o.style.fontSize=b.fontSize-b.fontSize*(b.meltFrame/b.meltFrameCount)+"px",b.o.style.lineHeight=a.flakeHeight+2+0.75*a.flakeHeight*(b.meltFrame/b.meltFrameCount)+"px",
b.meltFrame++):b.recycle()};this.recycle=function(){b.o.style.display="none";b.o.style.position=s?"fixed":"absolute";b.o.style.bottom="auto";b.setVelocities();b.vCheck();b.meltFrame=0;b.melting=!1;b.setOpacity(b.o,1);b.o.style.padding="0px";b.o.style.margin="0px";b.o.style.fontSize=b.fontSize+"px";b.o.style.lineHeight=a.flakeHeight+2+"px";b.o.style.textAlign="center";b.o.style.verticalAlign="baseline";b.x=parseInt(k(h-a.flakeWidth-20),10);b.y=parseInt(-1*k(l),10)-a.flakeHeight;b.refresh();b.o.style.display=
"block";b.active=1};this.recycle();this.refresh()};this.snow=function(){var c=0,e=null,d,e=0;for(d=a.flakes.length;e<d;e++)1===a.flakes[e].active&&(a.flakes[e].move(),c++),a.flakes[e].melting&&a.flakes[e].melt();c<a.flakesMaxActive&&(e=a.flakes[parseInt(k(a.flakes.length),10)],0===e.active&&(e.melting=!0));a.timer&&q.getAnimationFrame(a.snow)};this.mouseMove=function(c){if(!a.followMouse)return!0;c=parseInt(c.clientX,10);c<n?v=-2+2*(c/n):(c-=n,v=2*(c/n))};this.createSnow=function(c,e){var d;for(d=
0;d<c;d++)if(a.flakes[a.flakes.length]=new a.SnowFlake(parseInt(k(6),10)),e||d>a.flakesMaxActive)a.flakes[a.flakes.length-1].active=-1;a.targetElement.appendChild(B)};this.timerInit=function(){a.timer=!0;a.snow()};this.init=function(){var c;for(c=0;c<a.meltFrameCount;c++)a.meltFrames.push(1-c/a.meltFrameCount);a.randomizeWind();a.createSnow(a.flakesMax);a.events.add(f,"resize",a.resizeHandler);a.events.add(f,"scroll",a.scrollHandler);a.freezeOnBlur&&(m?(a.events.add(d,"focusout",a.freeze),a.events.add(d,
"focusin",a.resume)):(a.events.add(f,"blur",a.freeze),a.events.add(f,"focus",a.resume)));a.resizeHandler();a.scrollHandler();a.followMouse&&a.events.add(m?d:f,"mousemove",a.mouseMove);a.animationInterval=Math.max(20,a.animationInterval);a.timerInit()};this.start=function(c){if(A){if(c)return!0}else A=!0;if("string"===typeof a.targetElement&&(c=a.targetElement,a.targetElement=d.getElementById(c),!a.targetElement))throw Error('Snowstorm: Unable to get targetElement "'+c+'"');a.targetElement||(a.targetElement=
d.docuentElement||d.body);a.targetElement!==d.documentElement&&a.targetElement!==d.body&&(a.resizeHandler=a.resizeHandlerAlt);a.resizeHandler();a.usePositionFixed=a.usePositionFixed&&!r;s=a.usePositionFixed;h&&(l&&!a.disabled)&&(a.init(),a.active=!0)};a.autoStart&&a.events.add(f,"load",x,!1);return this}(window,document);