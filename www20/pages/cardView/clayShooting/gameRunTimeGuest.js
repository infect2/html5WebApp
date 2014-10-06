/*
 * GameRunTime Guest for running a HTML5 game and interfacing with GameRunTime Host
 * Author: Sang Seok Lim (sangseok.lim@sk.com)
 */
(function(window, undefined){

var hostWindow = window.parent; //host window
var domain = "http://" + (document.domain || "localhost");
var startCB,
    endCB,
    suspendCB,
    resumeCB,
    screenShotCB,
    getGameResolutionCB,
    setGameResolutionCB,
    scaleCanvasCB;

var gameRunTimeGuest = {
    onStarted: function(){
        var msg = {
            status: 'started'
        };
        this._sendStatus( msg );
    },
    onWaiting: function(){
        var msg = {
            status: 'waiting'
        };
        this._sendStatus( msg );
    },
    onReady: function(){
        var msg = {
            status: 'ready'
        };
        this._sendStatus( msg );
    },
    onEnd: function(){
        var msg = {
            status: 'end'
        };
        this._sendStatus( msg );
    },
    onDataReady: function(_status, _data){
        var msg = {
            status: _status,
            data: _data
        };
        this._sendStatus( msg );
    },
    onScreenShotReady: function( _data ){
        var msg = {
            status: 'screenShot',
            data: _data
        };
        this._sendStatus( msg );
    },
    resetGuestEnv: function(){
        //callback
        startCB = null;
        endCB = null;
    },
    setStatusCB: function ( cbObj ){
        startCB = cbObj.startCB;
        endCB = cbObj.endCB;
        screenShotCB = cbObj.screenShotCB;
        setGameResolutionCB = cbObj.setGameResolutionCB;
        getGameResolutionCB = cbObj.getGameResolutionCB;
        scaleCanvasCB = cbObj.scaleCanvasCB;
        gameCustomDataCB = cbObj.gameCustomDataCB;
        suspendCB = cbObj.suspendCB;
        resumeCB = cbObj.resumeCB;
    },
    _sendStatus: function( msg ){
        if(!!hostWindow){
            hostWindow.postMessage(JSON.stringify( msg ), domain);
        } else {
            console.log("invalid hostWindow");
        }
    }
};

function receiveMessage(event){
    var msg;

    if(!!hostWindow) {
        hostWindow = event.source;
    }

    if(event.origin !== domain ){
        alert("Suspicious Message!");
        console.log("origin: " + event.origin);
        console.log("domain: " + domain);
        return;
    }

    msg = JSON.parse( event.data );
    switch( msg.cmd ){
        case "start":
            if(!!startCB) {
                startCB();
            }
            break;
        case "end":
            if(!!endCB) {
                endCB();
            }
            break;
        case "suspend":
            if(!!suspendCB) {
                suspendCB();
            }
            break;
        case "resume":
            if(!!resumeCB) {
                resumeCB();
            }
            break;
        case "captureScreenShot":
            gameRunTimeGuest.onDataReady("screenShot", screenShotCB());
            break;
        case "getGameResolution":
            gameRunTimeGuest.onDataReady("gameResolution", getGameResolutionCB());
            break;
        case "setGameResolution":
            if(!!setGameResolutionCB){
                setGameResolutionCB( msg.data );
            }
            break;
        case "scaleCanvas":
            if(!!scaleCanvasCB){
                scaleCanvasCB( msg.xScale, msg.yScale );
            }
            break;
        case "setGameCustomData":
            if(!!gameCustomDataCB){
                gameCustomDataCB( msg.data );
            }
            break;
        default:
            console.log("unknown signal");
    }
}

window.addEventListener('message',receiveMessage, false);

if( typeof window.gameRunTimeGuest  === "undefined") {
    window.gameRunTimeGuest = gameRunTimeGuest;
} else {
    alert("gameRunTimeHost alread defined");
}
console.log(document.domain);

})(window);