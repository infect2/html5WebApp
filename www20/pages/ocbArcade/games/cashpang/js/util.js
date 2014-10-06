(function(){
    //Object.create polyfill
    if (!Object.create) {
        Object.create = (function(){
            function F(){}

            return function(o){
                if (arguments.length !== 1) {
                    throw new Error('Object.create implementation only accepts one parameter.');
                }
                F.prototype = o;
                return new F();
            };
        }());
    }

    if (!isNaN) {
        window.isNaN = function(v){
            return v !== v;
        };
    }

    //Function.prototyp.bind polyfill
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function() {},
                fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    //String.prototype.trim
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    //pubsub
    var PubSub = window.PubSub = function(){};
    PubSub.prototype.trigger = function(eventName, obj){
        if (typeof this._eventHandlers === "undefined") {
            this._eventHandlers = [];
        }

        var ret = [], i, j;
        for (i = 0; i < this._eventHandlers.length; i++) {
            if (this._eventHandlers[i].name === eventName) {
                for (j = 0; j < this._eventHandlers[i].fn.length; j++) {
                    ret.push(this._eventHandlers[i].fn[j].call(this, obj));
                }
                break;
            }
        }
        for (i = 0; i < ret.length; i++) {
            if (ret[i] === false) {
                return false;
            }
        }

        return true;
    };
    PubSub.prototype.on = function(eventName, handler) {
        var index = -1, i;
        if (typeof this._eventHandlers === "undefined") {
            this._eventHandlers = [];
        }
        if (typeof handler === "undefined" && typeof eventName !== "string") {
            for (var key in eventName) {
                this.on(key, eventName[key]);
            }
            return this;
        }
        for (i = 0; i < this._eventHandlers.length; i++) {
            if (this._eventHandlers[i].name === eventName) {
                index = i;
            }
        }

        if (index < 0) {
            this._eventHandlers.push({
                name : eventName,
                fn : [ handler ]
            });
        } else {
            this._eventHandlers[index].fn.push(handler);
        }

        return this;
    };

    //: selector
    // $.extend($.expr[":"], {
    //     data: $.expr.createPseudo ? $.expr.createPseudo(function(dataName) {
    //         return function(elem) {
    //             return !!$.data(elem, dataName);
    //         };
    //     }) :
    //     // support: jQuery <1.8

    //     function(elem, i, match) {
    //         return !!$.data(elem, match[3]);
    //     }
    // });
}());

/*
 * requestAnimationFrame polyfill by Erik Möller
 * fixes from Paul Irish and Tino Zijdel
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if(!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback /*, element*/ ) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if(!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());