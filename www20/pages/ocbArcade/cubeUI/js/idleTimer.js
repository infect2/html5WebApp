/*
* Idle timer: It goes off when the below condition is met
* no user-activated events including mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove are fired
* within specified period of time
* methods: start() and stop()
* Author: Sang Seok Lim
* License: SK planet proprietary
* Dependency: none
*/
( function ( window, undefined ) {
    //array of user events for monitoring user activities
    var _userEvents = [ "mousemove", "keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "touchmove" ];
     /**
      * @description Idle timer It goes off when the below condition is met
      * no user-activated events including mousemove, keydown, DOMMouseScroll,
      * mousewheel, mousedown, touchstart, touchmove are fired within specified period of time
      * @name skp.appCore.IdleTimer
      * @class
      */
    var IdleTimer = function ( timeOut, callbacks, userEvents ) {
        var that = this;

        that.timerID = null;
        that.timeOut = timeOut;
        that.callbacks = callbacks;
        that.timeoutCount = 0; // when timeoutCount becomes 2 mean a user is idle, it is reset to 0 on the reception of _userEvents

        if( typeof callbacks === "function" ){
            //transform function object into Array object so that it can be handled correctly
            that.callbacks = [ callbacks ];
        }

        that.userEvents = ( typeof userEvents === "undefined" ) ? _userEvents : userEvents;
    };
    IdleTimer.prototype = {
        /**
         * @lends skp.appCore.IdleTimer.prototype
         */

        /**
         * @description start IdleTimer object
         * @example
         * var myTimer = new IdleTimer;
         * mytimer.start();
         */
        //timer start function
        start: function() {
            var that = this,
                userEvents = this.userEvents;

            for ( var i = 0; i < userEvents.length; i++ ) {
                document.addEventListener( userEvents[i], that, false );
            }

            this.timerID = setInterval( function() {
                var callbacks = that.callbacks;

                that.timeoutCount++ ;
                console.log("timeout");
                //check if time passes timeout * timeoutCount, which is interpreted as idle time in our implementation
                if( that.timeoutCount > 2 ) {
                    for ( var i = 0; i < callbacks.length; i++ ) {
                        //fire idle timer by executing all registerd callbacks
                        callbacks[i]();
                    }
                    that.timeoutCount = 0;
                }
            }, that.timeOut );
        },
        /**
         * @description stop IdleTimer object
         * @example
         * var myTimer = new IdleTimer;
         * mytimer.stop();
         */
        stop: function() {
            var userEvents = this.userEvents;

            //remove all event listeners
            for ( var i = 0; i < userEvents.length; i++ ) {
                document.removeEventListener( userEvents[i], this, false );
            }
            //remove timer
            clearInterval( this.timerID );
        },
        /**
         *@private
         *@description internal function
         *@param{EventTarget} e e is EventTarget
         */
        handleEvent: function ( e ) {
            this.timeoutCount = 0;
        }
    };
    if( typeof skp !== "undefined" && typeof skp.appCore !=="undefined" ){
        skp.appCore.IdleTimer = IdleTimer;
    } else {
        window.IdleTimer = IdleTimer;
    }
} ) ( window );