/**
 * Backbone.React.Component
 * @version 0.4.1
 * @author "Magalhas" José Magalhães <magalhas@gmail.com>
 * @license MIT <http://opensource.org/licenses/MIT>
 */
!function(a){if("function"==typeof define&&define.amd)define(["react","backbone","underscore"],a);else if("undefined"!=typeof module){var b=require("react"),c=require("backbone"),d=require("underscore");module.exports=a(b,c,d)}else a(this.React,this.Backbone,this._)}(function(a,b,c){"use strict";return b.React||(b.React={}),b.React.Component=function(a){a=a||{},this.cid=c.uniqueId(),(c.isElement(a.el)||b.$&&a.el instanceof b.$)&&(this.setElement(a.el),delete a.el),(a.model instanceof b.Model||a.model instanceof Object&&c.values(a.model)[0]instanceof b.Model)&&(this.model=a.model,delete a.model,this.__setPropsBackbone__(this.model,void 0,a)),(a.collection instanceof b.Collection||a.collection instanceof Object&&c.values(a.collection)[0]instanceof b.Collection)&&(this.collection=a.collection,delete a.collection,this.__setPropsBackbone__(this.collection,void 0,a))},b.React.Component.extend=function(d){var e,f=function(a,d){var g=new b.React.Component(a),h=new e(a,d);return c.extend(h,g),h.__factory__=f,h.initialize&&h.initialize(a),h.__startModelListeners__().__startCollectionListeners__(),h};return f.extend=function(){return b.React.Component.extend(c.extend({},d,arguments[0]))},c.extend(f.prototype,b.React.Component.prototype,d),e=a.createClass(f.prototype),f},c.extend(b.React.Component.prototype,b.Events,{mixins:[{componentDidMount:function(){this.setElement(this.getDOMNode()).__startModelListeners__().__startCollectionListeners__()},componentDidUpdate:function(){this.setElement(this.getDOMNode())},componentWillUnmount:function(){this.stopListening()}}],$:function(){return this.$el?this.$el.find.apply(this.$el,arguments):void 0},getCollection:function(){return this.getOwner().collection},getModel:function(){return this.getOwner().model},getOwner:function(){for(var a=this;a.props.__owner__;)a=a.props.__owner__;return a},mount:function(b,c){if(!b&&!this.el)throw new Error("No element to mount on");return b||(b=this.el),a.renderComponent(this,b,c),this.isRendered=!0,this},remove:function(){return this.isRendered&&this.unmount(),this.el&&this.el.remove(),this.stopListening(),this},setElement:function(a){if(a&&b.$&&a instanceof b.$){if(a.length>1)throw new Error("You can only assign one element to a component");this.el=a[0],this.$el=a}else a&&(this.el=a,b.$&&(this.$el=b.$(a)));return this},toHTML:function(b){if(!b)throw new Error("Useless to call toHTML without a callback");var c=new this.__factory__(this.props);a.renderComponentToString(c,b)},unmount:function(){var b=this.el.parentNode;if(!a.unmountComponentAtNode(b))throw new Error("There was an error unmounting the component");this.setElement(b),delete this.isRendered},__onError__:function(){arguments[arguments.length-1].silent||this.__setProps__({isRequesting:!1,hasError:!0})},__onRequest__:function(){var a=arguments[arguments.length-1];a&&a.silent||this.__setProps__({isRequesting:!0})},__onSync__:function(a,b){var c=arguments[arguments.length-1];c&&c.silent||(this.__setProps__({isRequesting:!1}),this.__setPropsBackbone__(a,b))},__setProps__:function(a,d,e){this.isRendered||e||(e=this.props);var f=arguments[arguments.length-1];if(!f||!f.xhr){var g={},h=a.toJSON?a.toJSON():a;d?g[d]=h:a instanceof b.Collection?g.collection=h:g=h,e?c.extend(e,g):this.setProps(g)}},__setPropsBackbone__:function(a,c,d){if(a instanceof b.Collection||a instanceof b.Model)this.__setProps__.apply(this,arguments);else for(c in a)this.__setPropsBackbone__(a[c],c,d)},__startCollectionListeners__:function(a,c){if(a||(a=this.collection),a instanceof b.Collection)this.listenTo(a,"add remove change",this.__setPropsBackbone__.bind(this,a,c,void 0)).listenTo(a,"error",this.__onError__.bind(this,a,c)).listenTo(a,"request",this.__onRequest__.bind(this,a,c)).listenTo(a,"sync",this.__onSync__.bind(this,a,c));else if(a)for(c in a)this.__startCollectionListeners__(a[c],c);return this},__startModelListeners__:function(a,c){if(a||(a=this.model),a instanceof b.Model)this.listenTo(a,"change",this.__setPropsBackbone__.bind(this,a,c,void 0)).listenTo(a,"error",this.__onError__.bind(this,a,c)).listenTo(a,"request",this.__onRequest__.bind(this,a,c)).listenTo(a,"sync",this.__onSync__.bind(this,a,c));else if(a)for(c in a)this.__startModelListeners__(a[c],c);return this}}),b.React.Component});