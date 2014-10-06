/*
 * 육면체를 만들고 회전등 애니메이션을 지원하는 UI Component
 * Author: 임상석 (sangseok.lim@sk.com)
 */
var CubeView = (function (window, document) {
    //CSS prefix, event handler 등록등 공통 기능 모음
    //아래 util은 open source 기반 작성됨
    var utils = (function () {
        var me = {};

        var _elementStyle = document.createElement('div').style;
        var _vendor = (function () {
            var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                transform,
                i = 0,
                l = vendors.length;

            for ( ; i < l; i++ ) {
                transform = vendors[i] + 'ransform';
                if ( transform in _elementStyle ){
                    return vendors[i].substr(0, vendors[i].length-1);
                }
            }

            return false;
        })();

        function _prefixStyle (style) {
            if ( _vendor === false ){
                return false;
            }
            if ( _vendor === '' ){
                return style;
            }
            return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
        }

        me.extend = function (target, obj) {
            for ( var i in obj ) {
                target[i] = obj[i];
            }
        };

        var _transform = _prefixStyle('transform');

        me.extend(me, {
            hasTransform: _transform !== false,
            hasPerspective: _prefixStyle('perspective') in _elementStyle,
            hasTouch: 'ontouchstart' in window,
            hasPointer: navigator.msPointerEnabled,
            hasTransition: _prefixStyle('transition') in _elementStyle
        });

        me.extend(me.style = {}, {
            transform: _transform,
            transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
            transitionDuration: _prefixStyle('transitionDuration'),
            transitionProperty: _prefixStyle('transitionProperty'),
            transformOrigin: _prefixStyle('transformOrigin'),
            perspective: _prefixStyle('perspective'),
            perspectiveOrigin: _prefixStyle('perspectiveOrigin'),
            transformStyle: _prefixStyle('transformStyle')
        });

        me.extend(me.eventType = {}, {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,

            mousedown: 2,
            mousemove: 2,
            mouseup: 2,

            MSPointerDown: 3,
            MSPointerMove: 3,
            MSPointerUp: 3
        });
        me.addEvent = function (el, type, fn, capture) {
            el.addEventListener(type, fn, !!capture);
        };

        me.removeEvent = function (el, type, fn, capture) {
            el.removeEventListener(type, fn, !!capture);
        };
        return me;
    })();
    var START_EV = utils.hasTouch ? 'touchstart' : 'mousedown',
        MOVE_EV = utils.hasTouch ? 'touchmove' : 'mousemove',
        END_EV = utils.hasTouch ? 'touchend' : 'mouseup',
        CANCEL_EV = utils.hasTouch ? 'touchcancel' : 'mouseup';

    function support(props) {
        for(var i = 0, l = props.length; i < l; i++) {
            if(typeof el.style[props[i]] !== "undefined") {
                return props[i];
            }
        }
    }
    /*
     * 초기 조건: markup의 순서와 동일하게 유지 됨
     * face  : rotate(xdeg, ydeg)
     * top   : 0
     * front : 1
     * right : 2
     * back  : 3
     * left  : 4
     * bottom: 5
     * 기준하나 양축으로 180도 회전하면 같으니 하나 추가
     * 각 면별로 첫번째 나오는 것이 사용자 입장에서 name tag가 아래로 향하는 올바른 모습으로 보이는 각도임
     */
    var initialFaceDeg = [
        {faceIdx: 0, x: 270,y: 0  },//top
        {faceIdx: 0, x: 270,y: 90 },//top
        {faceIdx: 0, x: 270,y: 180},//top
        {faceIdx: 0, x: 270,y: 270},//top
        {faceIdx: 0, x: 90, y: 180},//top
        {faceIdx: 1, x: 0,  y: 0  },//front
        {faceIdx: 1, x: 180,y: 180},//front
        {faceIdx: 2, x: 0,  y: 270},//right
        {faceIdx: 2, x: 180,y: 90 },//right
        {faceIdx: 3, x: 0,  y: 180},//back은 x축 180 회전
        {faceIdx: 3, x: 180,y: 0  },//back y축 180 회전하는 두가지 경우
        {faceIdx: 4, x: 0,  y: 90 },//left
        {faceIdx: 4, x: 180,y: 270},//left
        {faceIdx: 5, x: 90, y: 0  },//bottom
        {faceIdx: 5, x: 90, y: 90 },//bottom
        {faceIdx: 5, x: 90, y: 180},//bottom
        {faceIdx: 5, x: 90, y: 270},//bottom
        {faceIdx: 5, x: 270,y: 180}//bottom
    ];
    //constructor
    function CubeView (el, options) {
        var i;
        this.viewport = typeof el === 'string' ? document.querySelector(el) : el;
        this.cube = this.viewport.children[0];
        this.faces = this.cube.querySelectorAll('.face');
        this.faceStyles = [];

        this.options = {
            transDuration: "700ms",
            perspective: "800px",
            perspectiveOrigin: "80% 200px",
            onAnimationEnd: function (){},
            eventQueueSize: 5,
            useTransition: false, //touchend시 transition으로 momuntum scrolling 수행
            tranTimingFunc: "cubic-bezier(0.21, 0.78, 0.4, 1.02)",
            transitionThreshold: 5,
            yOffset: 0,
            flattenDegLimit: 65,
            enableOrientationEvent: false,
            enableIdleAnimation: false,
            idleAnimationType: "blink"
        };

        for ( i in options ) {
            this.options[i] = options[i];
        }

        if (typeof this.options.viewportX !== "undefined") {
            this.viewportX = this.options.viewportX;
        }
        if (typeof this.options.viewportY !== "undefined") {
            this.viewportY = this.options.viewportY;
        }
        //view port setting
        this.viewport.style[utils.style.perspectiveOrigin] = this.options.perspectiveOrigin;
        // cube의 각 face를 setting
        this.faces[0].style[utils.style.transform] = "rotateX(90deg) translateZ(200px)";//top
        this.faces[1].style[utils.style.transform] = "translateZ(200px)";//front
        this.faces[2].style[utils.style.transform] = "rotateY(90deg) translateZ(200px)";//right
        this.faces[3].style[utils.style.transform] = "rotateY(180deg) translateZ(200px)";//back
        this.faces[4].style[utils.style.transform] = "rotateY(270deg) translateZ(200px)";//left
        this.faces[5].style[utils.style.transform] = "rotateX(270deg) translateZ(200px)";//bottom

        this.saveFaceStyles();

        this._initEvents();
    }

    CubeView.prototype = {
        handleEvent: function (e) {
            switch ( e.type ) {
                case START_EV:
                    this._start(e);
                    break;
                case MOVE_EV:
                    this._move(e);
                    break;
                case END_EV:
                case CANCEL_EV:
                    this._end(e);
                    break;
                case 'orientationchange':
                case 'resize':
                    this._resize();
                    break;
                case 'webkitTransitionEnd':
                    this._transitionEnd(e);
                    break;
                case 'keydown':
                    this._keyDown(e);
                case 'deviceorientation':
                    this._deviceOrientHandler(e);
                    break;
            }
        },
        _initEvents: function (remove) {
            utils.addEvent(window, 'orientationchange', this);
            utils.addEvent(window, 'resize', this);

            utils.addEvent(this.viewport, START_EV, this);
            utils.addEvent(this.viewport, MOVE_EV, this);
            utils.addEvent(this.viewport, CANCEL_EV, this);
            utils.addEvent(this.viewport, END_EV, this);

            utils.addEvent(window, "keydown", this);

            if (this.options.enableOrientationEvent && window.DeviceOrientationEvent) {
                utils.addEvent(window,"deviceorientation",this);
            }
        },
        destroy: function () {
            utils.removeEvent(window, 'orientationchange', this);
            utils.removeEvent(window, 'resize', this);

            utils.removeEvent(this.viewport, START_EV, this);
            utils.removeEvent(this.viewport, MOVE_EV, this);
            utils.removeEvent(this.viewport, CANCEL_EV, this);
            utils.removeEvent(this.viewport, END_EV, this);

            utils.removeEvent(window, "keydown", this);

            utils.removeEvent(window, "deviceorientation", this);
        },
        refresh: function () {
        },
        posRecord: {
            start: {},
            all: []//move 발생할때 최고 5개를 저장하여 momentum animation에서 사용
        },
        //현재 viewport X 좌표
        viewportX: -30,
        //현재 viewport Y 좌표
        viewportY: -35,
        enabled: true,
        //cube가 아닌 평면으로 변경되어 있는지 여부
        flattened: false,
        //정식으로 start 했는지
        started: false,
        //touch 이벤트 시작
        _start: function (e) {
            var pos;
            pos = e.touches ? e.touches[0] : e;

            if(!this.enabled) {
                return;
            }

            this.started = true;
            if(this.options.useTransition){
                this.clearTransitionProperty( this.cube );
            }

            this.posRecord.start.x = pos.pageX;
            this.posRecord.start.y = pos.pageY;
            delete this.posRecord.last;
            if (this.posRecord.all.length > 1) {
                this.posRecord.all = [];
            }
            this.posRecord.all.push({
                x: pos.pageX,
                y: pos.pageY
            });

            if (this.options.enableIdleAnimation) {
                this.stopIdleAnimation();
            }
        },
        //touchmove 이벤트 처리. 실제 viewport를 움직임
        _move: function (e) {
            var pos,
                x,
                y;
            var movementScaleFactor = utils.hasTouch ? 1 : 1;
            pos = e.touches ? e.touches[0] : e;

            if (!this.started){
                return;
            }
            e.preventDefault();

            this.posRecord.all.push({
                x: pos.pageX,
                y: pos.pageY
            });
            if (this.posRecord.all.length > this.options.eventQueueSize) {
                this.posRecord.all.shift();
            }

            if (!this.posRecord.last){
                this.posRecord.last = this.posRecord.start;
            } else {
                if (forward(this.posRecord.start.x, this.posRecord.last.x) != forward(this.posRecord.last.x, pos.pageX)) {
                    this.posRecord.start.x = this.posRecord.last.x;
                }
                if (forward(this.posRecord.start.y, this.posRecord.last.y) != forward(this.posRecord.last.y, pos.pageY)) {
                    this.posRecord.start.y = this.posRecord.last.y;
                }
            }

            if (this.flattened) {
                //flattend 된 경우에는 사용성을 위해서 X 축 회전을 하지 않음
                y = this.viewportY - parseInt((this.posRecord.start.x - pos.pageX)/movementScaleFactor);
            } else {
                x = this.viewportX + parseInt((this.posRecord.start.y - pos.pageY)/movementScaleFactor);
                y = this.viewportY - parseInt((this.posRecord.start.x - pos.pageX)/movementScaleFactor);
                x = x%360;
                y = y%360;
            }

            this._setPos({
                x: x,
                y: y
            });

            this.posRecord.last.x = pos.pageX;
            this.posRecord.last.y = pos.pageY;

            function forward(v1, v2) {
                return v1 >= v2 ? true : false;
            }
        },
        //실제 transform 을 설정
        _setPos: function(coords){
            if(!coords) {
                return;
            }
            if(typeof coords.x === "number") {
                this.viewportX = coords.x;
            }
            if(typeof coords.y === "number") {
                if (this.flattened) {
                    if (coords.y > this.options.flattenDegLimit) {
                        coords.y = this.options.flattenDegLimit;
                    } else if (coords.y < -this.options.flattenDegLimit) {
                        coords.y = -this.options.flattenDegLimit;
                    }
                }
                this.viewportY = coords.y;
            }
            this.cube.style[utils.style.transform] = "rotateX("+this.viewportX+"deg) rotateY("+this.viewportY+"deg)";
        },
        _end: function (e) {
            var x, y,
                dx, dy,
                pageX, pageY,
                len,
                posRecordAll = this.posRecord.all;

            delete this.posRecord.last;
            if (!this.options.useTransition) {
                this.started = false;
                return;
            }

            //FIX ME: 성능 최적화한후에 1로 나누는 경우이면 버려라
            var movementScaleFactor = 0.3;

            pageX = 0;
            pageY = 0;
            len = posRecordAll.length;
            dx = posRecordAll[len-1].x - posRecordAll[0].x;
            dy = posRecordAll[len-1].y - posRecordAll[0].y;

            if( Math.abs(dx) < this.options.transitionThreshold && Math.abs(dy) < this.options.transitionThreshold) {
                return;
            }

            pageX = posRecordAll[len-1].x + dx/(len-1);
            pageY = posRecordAll[len-1].y + dy/(len-1);
            if (!this.flattened) {
                x = this.viewportX + parseInt((this.posRecord.start.y - pageY)/movementScaleFactor);
            }
            y = this.viewportY - parseInt((this.posRecord.start.x - pageX)/movementScaleFactor);

            utils.addEvent(this.cube, 'webkitTransitionEnd', this);

            this.setTransitionProperty(this.cube);

            this._setPos({
                x: x,
                y: y
            });

            posRecordAll = [];
        },
        _transitionEnd: function (e) {
            if (!this.options.useTransition) {
                console.log("useTransition이 off인데 transitionend가 발생함");
                return;
            }
            utils.removeEvent(this.cube, 'webkitTransitionEnd', this);
            this.options.onAnimationEnd();

            this.clearTransitionProperty(this.cube);
            this.started = false;
        },
        _keyDown: function(e){
            var x, y;
            e.preventDefault();
            switch(e.keyCode)
            {
                case 37: // left
                    y =  this.viewportY - 90;
                    break;
                case 38: // up
                    x= this.viewportX + 90;
                    break;
                case 39: // right
                    y = this.viewportY + 90;
                    break;
                case 40: // down
                    x = this.viewportX - 90;
                    break;
                default:
                    break;
            };
            if (this.options.useTransition) {
                this.setTransitionProperty( this.cube );
            }
            this._setPos({
                    x: x,
                    y: y
                })
        },
        reset: function(){
            var x = 0,
                y = 0;
            if(this.flattened){
                this.restoreCubic();
            }
            if (this.options.useTransition) {
                this.started = true;
                this.setTransitionProperty( this.cube );
                utils.addEvent(this.cube, 'webkitTransitionEnd', this);
            }
            this._setPos({x: 0, y:0});
        },
        move: function(x, y){
            if(this.flattened){
                return;
            }
            if (this.options.useTransition) {
                this.setTransitionProperty( this.cube );
            }
            this._setPos({x: x, y:y});
        },
        lastXMove: 0,
        lastYMove: 0,
        _deviceOrientHandler: function(eventData){
            var sensorSensitivity = 10,
                sensorFilterDepth = 10.
                movementUnit = this.flattened ? 1:1;
            // http://www.html5rocks.com/en/tutorials/device/orientation/deviceorientationsample.html
            var tiltLR = eventData.gamma,//left-to-right tile in degrees, where right is positive
                tiltFB = eventData.beta,//beta is front-to-back tilt in degrees, where front is positive
                dir = eventData.alpha,//alpha is the compass direction the device is facing in degrees
                x = this.viewportX,
                y = this.viewportY;

            if (this.started) {
                //사용자 touch 조작시 deviceorientationevent는 처리하지 않음
                return;
            }
            if(!this.flattened){
                return;
            }
            if( tiltLR > sensorSensitivity ) {
                //right
                this.lastXMove++;
                if(this.lastXMove>sensorFilterDepth){
                    y += movementUnit;
                    this.lastXMove = sensorFilterDepth;
                }
            } else if (tiltLR < -sensorSensitivity) {
                //left
                this.lastXMove--;
                if(this.lastXMove<-sensorFilterDepth){
                    y -= movementUnit;
                    this.lastXMove = -sensorFilterDepth;
                }
            } else if (tiltFB > sensorSensitivity) {
                //up
                this.lastYMove++;
                if(this.lastYMove>sensorFilterDepth){
                    x += movementUnit;
                    this.lastYMove = sensorFilterDepth;
                }
            } else if (tiltFB < -sensorSensitivity ){
                // down
                this.lastYMove--;
                if(this.lastYMove<-sensorFilterDepth){
                    x -= movementUnit;
                    this.lastYMove = -sensorFilterDepth;
                }
            } else {
                return;
            }

            if(this.flattened){
                x = this.viewportX;
            }

            if (this.options.useTransition) {
                this.setTransitionProperty( this.cube );
            }

            this._setPos({x: x, y: y});
        },
        setTransitionProperty: function (elm){
            elm.style[utils.style.transitionDuration] = this.options.transDuration;
            elm.style[utils.style.transitionProperty] = utils.style.transform;
            elm.style[utils.style.transitionTimingFunction] = this.options.tranTimingFunc;
        },
        clearTransitionProperty: function (elm){
            elm.style[utils.style.transitionDuration] = "";
            elm.style[utils.style.transitionProperty] = "";
            elm.style[utils.style.transitionTimingFunction] = "";
        },
        enable: function(){
            this.enabled = true;
        },
        disable: function(){
            this.enabled = false;
        },
        flattenCubic: function(){
            if (this.flattened) {
                return;
            }
            this.reset();
            this.saveFaceStyles();
            //flatten 시킨다
            this.faces[0].style[utils.style.transform] = "translate3d(-410px, -250px, -400px)";//top
            this.faces[1].style[utils.style.transform] = "translate3d(-410px, 160px, -400px)";//front
            this.faces[2].style[utils.style.transform] = "translate3d(0px, -250px, -400px)";//right
            this.faces[3].style[utils.style.transform] = "translate3d(0px, 160px, -400px)";//back
            this.faces[4].style[utils.style.transform] = "translate3d(410px, -250px, -400px) ";//left
            this.faces[5].style[utils.style.transform] = "translate3d(410px, 160px, -400px) ";//bottom

            this.flattened = true;
        },
        //flatten된 face들을 cube로 복원
        restoreCubic: function(){
            if (!this.flattened) {
                return;
            }
            this.restoreFaceStyles();
            this.flattened = false;
            this.reset();
        },
        //cubic과 flatten을 toggle
        toggleCubic: function(){
            if (this.flattened) {
                this.restoreCubic();
            } else {
                this.flattenCubic();
            }
        },
        //face의 style 값을 저장
        saveFaceStyles: function(){
            var i;

            this.faceStyles = [];
            for (i=0; i<this.faces.length; i++) {
                this.faceStyles.push(this.faces[i].style.cssText);
            }
        },
        //face의 style값을 복원
        restoreFaceStyles: function(){
            var i;

            for (i=0; i<this.faces.length; i++) {
                this.faces[i].style.cssText = this.faceStyles[i];
            }
        },
        //화면에 대면중인 face 정보 축출
        getFrontFacingFaceInfo: function(){
            var curXdeg = (this.viewportX+360)%360, //360 보다 작은 양수각으로 변환
                curYdeg = (this.viewportY+360)%360,
                smallestVal,
                faceIdx;

            //현재 (x,y)deg와 가장 근접한 face를 찾아서 돌려준다
            var distances = initialFaceDeg.map(function(cVal, idx, array){
                var xDiff = Math.min( Math.abs(cVal.x - curXdeg), Math.abs(cVal.x + 360 - curXdeg) ),
                    yDiff = Math.min( Math.abs(cVal.y - curYdeg), Math.abs(cVal.y + 360 - curYdeg) );
                return xDiff + yDiff;
            });
            smallestVal = Math.min.apply(Math, distances)
            for (var i=0; i<distances.length; i++){
                if (distances[i] === smallestVal) {
                    faceIdx = initialFaceDeg[i].faceIdx;
                    //면이 정해지면, 해당 면중에 사용자 입장에서 올바로 보이는 각도를 찾아서 돌려준다
                    //올바로 보이는 각도란, initialFaceDeg에서 각면의 복수개의 각들중에 가장 첫번째 저장된 값이다
                    //그래서 아래 for loop에서는 주어진 index에서 가장 작은 위치로 찾아 내려간다
                    for(var j=i-1; j>=0; j--){
                        if (initialFaceDeg[j].faceIdx === faceIdx) {
                            i = j;
                            continue;
                        } else {
                            i = j+1;
                            break;
                        }
                    }
                    break;
                }
            }
            return {
                face: this.faces[faceIdx],
                degs: initialFaceDeg[i]
            };
        },
        getFrontFacingFaceInfoByElement: function(element){
            var i, faceIdx;

            for (i=0; i<this.faces.length; i++) {
                if (this.faces[i] === element) {
                    faceIdx = i;
                    break;
                }
            }
            for (i=0; i<initialFaceDeg.length; i++) {
                if (initialFaceDeg[i].faceIdx === faceIdx) {
                    break;
                }
            }
            return {
                face: this.faces[faceIdx],
                degs: initialFaceDeg[i]
            };
        },
        executeIdleAnimation: function () {
            if (!this.options.enableIdleAnimation) {
                return;
            }
            switch (this.options.idleAnimationType){
                case "blink" :
                    this._blinkAnimation(true);
                    break;
                case "rotate" :
                    this._rotateAnimation(true);
                    break;
                default:
            }
        },
        stopIdleAnimation: function () {
            switch (this.options.idleAnimationType){
                case "blink" :
                    this._blinkAnimation(false);
                    break;
                case "rotate" :
                    this._rotateAnimation(false);
                    break;
                default:
            }
        },
        _rotateAnimation: function(start) {
            //X, Y축으로 완전히 한바퀴 돌아서 제자리로
            if (this.flattened) {
                return;
            }
            if (!start) {
                return;
            }
            this.move(this.viewportX+360, this.viewportY+360);
        },
        _blinkAnimation: function(start) {
            var i,
                faces = this.faces;
                len = this.faces.length;

            if(!start){
                for (i=0; i<len; i++) {
                    faces[i].style.opacity = 1.0;
                }
                return;
            }
            for (i=0; i<len; i++) {
                (function(index){
                    setTimeout(function(){
                        faces[index].style.opacity = 0.1;
                    }, index*700);
                })(i);
            }
            for (i=0; i<len; i++) {
                (function(index){
                    setTimeout(function(){
                        faces[index].style.opacity = 1;
                    }, (index+6)*700);
                })(i);
            }
        },
        launchingAnimationHandler: function (element) {
            var transformText = element.style[utils.style.transform];
            var aniBegin = transformText + " scale(0.7, 0.7)",
                aniEnd = transformText + (ios ? " scale(1.15,1.15)": " scale(1.35,1.35)");
            element.style[utils.style.transform] = aniBegin;
            setTimeout(function(){
                element.style[utils.style.transform] = aniEnd;
            }, 800);
        },
        scaleUpDownAnimation: function (element) {
            var transformText = element.style[utils.style.transform];
            var aniBegin = transformText + " scale(0.7, 0.7)",
                aniMid = transformText + (ios ? " scale(1.15,1.15)": " scale(1.35,1.35)"),
                aniEnd = transformText + " scale(1.0, 1.0)";
            element.style[utils.style.transform] = aniBegin;
            setTimeout(function(){
                element.style[utils.style.transform] = aniMid;
            }, 800);
            setTimeout(function(){
                element.style[utils.style.transform] = aniEnd;
            }, 2000);
        }
    }

    return CubeView;
})(window, document);