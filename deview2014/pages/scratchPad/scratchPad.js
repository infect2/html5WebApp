/*
 * HTML5 Canvas based lottery
 * AUTHOR: sangseok.lim@sk.com
 */
(function ( window, undefined ) {
    var hasTouch = 'ontouchstart' in window,
        START_EV = hasTouch ? 'touchstart' : 'mousedown',
        MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
        END_EV = hasTouch ? 'touchend' : 'mouseup',
        CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup';

    var ScratchPad = function( parentID, ops ){
        var that = this;
        this.parentID = parentID;
        this.game = $( '#' + this.parentID );
        this.canvas = ops.canvas;
        this.canvasWidth = parseInt(this.canvas.style.width,10);
        this.canvasHeight = parseInt(this.canvas.style.height,10);
        this.context = null;
        this.offset = null;
        // this.result = this.game.find(".lotteryResult");
        this.result = document.getElementById("lotteryResult");
        this.repeat = null;
        this.deviceAgent = window.navigator.userAgent.indexOf('SHW-M250');
        this.versionInfo = window.navigator.userAgent.indexOf('4.1.2');
        this.touchEnable = false;
        this.resultMessage = null;
        this.counter = 0;
        this.ops = ops;
        this.lastX = null;
        this.lastY = null;
        this.progress = 0;
        this.imageTag = null;
        this.isOnload = false;
        this.started = false;
        this.scratching = false;
        this.alertFlag = false;
        this.endFlag = false;
        this.allscratchedFlag = false;
        this.field = null;
        this.percent = null;
        this.coverImg = null;
        this.coveronLoad = false;
        this.ops = {
            brushThickness : 40,//brush 두께
            coverImgUrl: "", //긁어서 없어지는 cover 이미지
            couponImgUrl : "img/baskinrobbins.jpg",
            drawType: "line", // drawtype 'circle' or 'line'
            bonusPoint : "50,000",  // 포인트 당첨시 얼마의 포인트를 지급할지 결정하는 옵션
            scratchedArea : 50,// cover image를 몇 %나 scratch했을때 게임을 끝낼 것인지 결정, 단위는 %(백분율)

            state:"login", //로그인 여부 판단.

            /* event callback options */
            onTouchStart:null,// 터치가 시작될때 호출할 함수
            onTouchMove:null, // 터치가 진행중일때 호출할 함수
            onTouchEnd:this.touchEndMessage,// 터치가 끝났을때 호출할 함수

            onScratchStart:null,//cover image의 scratch가 최초에 실행했을때 호출할 함수
            onScratchProgress:null,//cover image의 scratch가 진행중일때 호출할 함수
            onScratchEnd:this.endMessage, // cover image의 scratch가 scratchedArea 만큼의 영역을 넘었을때 호출할 함수
            onAllScratched:this.allScratchedMessage//cover image가 모두 scratch 되었을때 호출할 함수

            //////////////////////////////////
            , winLose : null
            , giftType : null
            , missionId : null
            , missionMessage : null
        };
        for( var i in ops ){
            this.ops[i] = ops[i];
        }
         that.init();

    };

    ScratchPad.prototype = {

        init: function() {
            /* canvas를 초기화, 게임을 시작할 수 있도록 구성함. */
            this.context = this.canvas.getContext("2d");

            this.initMatrix();
            this.loadResource();

            if(this.ops.state !== "login"){
                $( this.canvas ).unbind(START_EV);
                $( this.canvas ).unbind(MOVE_EV);
            }

        },
        /* 게임을 컨트롤 하기 위해 필요한 각종 event bind */
        bindEvents: function(){
            $(this.canvas).bind("oninIt",{that:this},function(event){
                var that = event.data.that;

                console.log("################## call bindEvents!!");

                if(that.coveronLoad && that.isOnload){
                    console.log("################## call bindEvents!! >> SUCCESS");
                    setTimeout(function(){
                    that.context.drawImage(that.coverImg,0,0,640,336);
                    that.offset = that.getOffset(that.canvas);
                   if(!that.ops.serverResult){
                        that.resultMessage = that.getResult();
                    }
                    if(typeof that.resultMessage === "string"){
                        if(that.result){
                            that.result.innerText = that.resultMessage;
                        }
                    }else{
                        $(that.result).empty();
                        that.result.appendChild(that.resultMessage);
                   }
                    //console.log(that.resultMessage);
                    },100);

                }else{
                    console.log("################## call bindEvents!! >> FAIL");
                }
            });
            $(this.canvas).bind("onScratchStart",{that:this},function(event){
                var that = event.data.that;
                if(that.ops.onScratchStart){
                    that.ops.onScratchStart.call(that,event);
                }
            });
            $(this.canvas).bind("onScratchProgress",{that:this},function(event){
                var that = event.data.that;
                if(that.ops.onScratchProgress){
                    that.ops.onScratchProgress.call(that,event);
                }
            });
            $(this.canvas).bind("onScratchEnd",{that:this},function(event){
                var that = event.data.that;
                if(that.ops.onScratchEnd){
                    that.ops.onScratchEnd.call(that,event);
                }
            });
            $(this.canvas).bind("onAllScratched",{that:this}, function(event){
                var that = event.data.that;
                if(that.ops.onAllScratched){
                    that.ops.onAllScratched.call(that,event);
                }
            });
            $( this.canvas ).unbind(START_EV);
            $( this.canvas ).on( START_EV, $.proxy( function(e){
                this.offset = this.getOffset(this.canvas);
                 e.preventDefault();
                 this.scratching = true;
                 //console.log("startX :" + this.curX + " startY :" + this.curY);
                 if(!this.touchEnable){
                    $(this.canvas).trigger("onScratchStart");
                 }
                 if (this.ops.onTouchStart){
                    this.ops.onTouchStart.call(this, e);
                }
                 var point = hasTouch ? e.originalEvent.touches[0] : e;
                 this.curX = point.pageX - this.offset.left;
                 this.curY = point.pageY - this.offset.top;
                 this.curX = this.curX/this.ops.widthRatio;
                 this.curY = this.curY/this.ops.heightRatio;

                if(this.ops.drawType==="line"){
                      //console.log("start touch");
                       this.context.globalCompositeOperation = "destination-out";
                      this.context.beginPath();
                      this.context.moveTo(this.curX ,this.curY);
                      this.context.lineWidth = this.ops.brushThickness;
                      this.context.lineCap = this.context.lineJoin = "round";
                      this.started=true;
                }
                this.touchEnable = true;

            }, this ));
            $( this.canvas ).unbind(MOVE_EV);
            $( this.canvas ).on( MOVE_EV, $.proxy( function(e){
                this.offset = this.getOffset(this.canvas);
                if (this.ops.onTouchMove){
                    this.ops.onTouchMove.call(this, e);
                }
                var point = hasTouch ? e.originalEvent.touches[0] : e,
                    maxScratchedArea = 98.5,
                    xVal=0,
                    yVal=0;

                this.curX = point.pageX - this.offset.left;
                this.curY = point.pageY - this.offset.top;
                xVal = this.curX;
                yVal = this.curY;
                this.curX = this.curX/this.ops.widthRatio;
                this.curY = this.curY/this.ops.heightRatio;
                this.canvasWidth = 640 * this.ops.widthRatio;
                this.canvasHeight = 336 * this.ops.heightRatio;

                var allArea = this.canvasWidth * this.canvasHeight;
                var percentedArea = allArea - (allArea * (this.ops.scratchedArea * 0.01));

                if(this.ops.drawType==="circle"){
                    this.drawCircle(this.curX, this.curY);
                }else{
                    this.drawLine(this.curX,this.curY);
                }
                this.progress = this.drawPoint(xVal , yVal);
                //console.log("progress :" + this.counter + ","+ "percentedArea" + percentedArea);
                if(this.progress < percentedArea && !this.endFlag){
                    $(this.canvas).trigger("onScratchEnd");
                    this.endFlag = true;
                }else if(this.progress < percentedArea && !this.allscratchedFlag){
                    $(this.canvas).trigger("onAllScratched");
                    this.allscratchedFlag = true;
                }else if(this.progress > percentedArea){
                    $(this.canvas).trigger("onScratchProgress");
                }
            }, this ));
             $( this.canvas ).unbind(END_EV);
            $( this.canvas ).on( END_EV, $.proxy( function(e){
                //console.log("in end ev");
                this.context.closePath();
                // this.context.clearRect(0,0,1,1);
                this.scratching = false;
                this.started = false;
                if(this.ops.onTouchEnd){
                    this.ops.onTouchEnd.call(this,e);
                }
            }, this ));
            $(window).on("resize",$.proxy(function(e){

                var widthRatio = (window.innerWidth -40) / 640;
                var heightRatio = widthRatio;
                var canvas = document.getElementById("lotteryTicket");
                var resultPanel = document.getElementById("lotteryResult");

                if(!this.confirmAgent()){
                        this.ops.widthRatio = widthRatio;
                        this.ops.heightRatio = heightRatio;
                        this.imageTag.style.width = 640*widthRatio + "px";
                        this.imageTag.style.height = 336 * heightRatio + "px";
                        this.initMatrix(this.field);
                        $(canvas).css({
                                width: 640 * widthRatio,
                                height:336 * heightRatio
                        });
                        $(resultPanel).css({
                                width: 640 * widthRatio,
                                height:336 * heightRatio
                        });
                        $(".dimmedBg").css("width", 640 * widthRatio).css("height", 336 * widthRatio).css("margin-left", 20+"px");
                        window.lotteryTicketHeight = 336 * widthRatio;
                    }
                },this));
        },
        confirmAgent:function(){
            if(this.versionInfo !== -1 && this.deviceAgent !== -1){
                return true;
            }else{
                return false;
            }
        },
        unbindEvent:function(){
           $(this.canvas).unbind(START_EV);
           $(this.canvas).unbind(MOVE_EV);
           $(this.canvas).unbind(END_EV);
        },
        /*
            현제 데모에서는 1~10까지의 숫자중 5일 경우에는 포인트, 8일 경우에는 상품권을
            상품으로 줄 수 있도록 구성되어 있습니다.

            추후 서버에서 result를 받는 것으로 변경해야 합니다.
         */
        getRandom: function(min, max) {
            min = min || 1;
            max = max || 10;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getResult: function() {
            var winFlag = this.ops.winLose,
                result;
            result = "아쉽지만 다음 기회를";
            if (winFlag === "W") {
                if (this.ops.giftType === "P") { // 포인트
                    result = this.imageTag;
                } else { // 쿠폰
                    result = this.imageTag;
                }
            }

            return result;
        },
        /*
            canvas의 offset을 계산합니다.
        */
        getOffset: function(el) {
            var box = { top: 0, left: 0 },
                doc = document.documentElement;

            if ( typeof el.getBoundingClientRect !== "undefined" ) {
                box = el.getBoundingClientRect();
            }
            return {
                top: box.top + window.pageYOffset - doc.clientTop,
                left: box.left + window.pageXOffset  - doc.clientLeft
            };
        },
        /* 게임에 필요한 모든 리소스를 로드하는 메서드 */
        loadResource : function(){
             var that = this;

             if(!that.isOnload){
                 this.imageTag = new Image();
                 this.imageTag.onload=function(){
                       that.isOnload = true;
                       console.log("imageTag loaded");
                       that.imageTag.style.width=(640*that.ops.widthRatio) + "px";
                       that.imageTag.style.height = (336 * that.ops.heightRatio) + "px";
                       $(that.canvas).trigger('oninIt');
                 };
                 this.imageTag.src= this.ops.couponImgUrl;
             }

             /* cover image가 로드되어야 이후 작업 진행 */
             if(!that.coveronLoad){
                 this.coverImg = new Image();
                 this.coverImg.onload = $.proxy(function(){
                     console.log("coverImage loaded");
                     that.coveronLoad = true;
                      $(that.canvas).trigger('oninIt');
                  }, this);
                  this.coverImg.src = this.ops.coverImgUrl;
             }

            window.scratchLoadedFlag = true; // 20131030 권기환 추가

            // 위에 login state 값으로 체크하는 부분 있어서 주석 처리함 - 20131025 권기환
             this.bindEvents();



        },
        /* 몇 %나 cover image가 scratch 되었는지 계산하는 메서드 */
        drawPoint: function(x, y) {

            var textArea = document.getElementById("textArea"),
                checkFlag = false,
                progress,
                inlineText;

            /* fillMatrix를 통해 현재 scratch된 범위를 표시 */
            checkFlag = this.fillMatrix(x, y);

            if(checkFlag){
                /* 현재 scratch된
                 범위가 전체 범위에서 몇 % 나 차지하는지 계산*/
                progress = this.calcDrawArea();
            }
            //textArea.innerText = progress + "%";
            return progress;
        },
         /* circle모양으로 cover image를 scratch 할 때 호출되는 메서드*/
        drawCircle:function(x,y){

            this.context.beginPath();
            this.context.arc(x, y, this.ops.brushThickness/2, 0, Math.PI * 2, true);
            this.context.fill();
            this.context.closePath();

        },
        /* line 모양으로 cover image를 scratch 할 때 호출되는 메서드 */
        drawLine:function(x,y){
            //console.log("drawLine Start");
           if(!this.started){
            return ;
           }
           this.context.lineTo(x,y);
           this.context.stroke();
           //console.log("drawLine Start");
        },
        /* 현재 scratch된 영역을 확인하기위해 가상의 matrix 초기화 */
        initMatrix:function(field){
            if(this.field === null){
                this.field = [];
            }else{
                this.field = field;
            }

            this.canvasWidth = 640 * this.ops.widthRatio;
            this.canvasHeight = 336 * this.ops.heightRatio;
            var width = this.canvasWidth,
                height = this.canvasHeight;

            for (var i = 0; i < width; i++) {
                if(this.field===null){
                    this.field[i] = [];
                }else{
                    if(typeof this.field[i] === "undefined"){
                        this.field[i] = [];
                    }
                }
            }

            for (var j = 0; j < width; j++) {
                for(var k = 0; k < height; k++){
                    if(this.field[j][k]!=="0" && this.field[j][k]!=="1"){
                        this.field[j][k] = "0";
                    }
               }
            }
        },
        /* 현재 scratch된 영역이 전체 영역에서 몇%나 차지하는지 확인*/
        fillMatrix:function(x,y){

            /*
                1.터치하는 영역의 정확한 범위를 계산하기 위해서 터치/클릭 되는
                지점으로 부터 brushThickness만큼의 지름을 가지는 원이 그려진다고
                가정

                2. 그 원의 시작 지점과 끝지점을 파악하여 해당 범위의 값을 변경
            */
            var  width = parseInt(this.ops.brushThickness /2, 10),
                 length = parseInt(width * Math.sqrt(2),10),
                 curX = parseInt(x,10),
                 curY = parseInt(y,10),
                 positionX = curX - length,
                 positionY = curY - length,
                 drawX = positionX + (this.ops.brushThickness * 2),
                 count =0,
                 flag = true,
                 drawY = positionY + (this.ops.brushThickness * 2);

            if(x<0 || x>parseInt(640, 10)){
                flag =  false;
            }else if(y<0 || y>parseInt(336, 10)){
                flag =  false;
            }

            for (var i = positionX; i < drawX ; i++) {
                for(var j = positionY; j<drawY; j++){
                      if(i<this.field.length){
                          if(j<this.field[i].length){
                              this.field[i][j] = "1";
                              this.counter++;
                          }
                      }

                }
            }

            return flag;
        },
        calcDrawArea:function(){

            /*     fillMatrix를 통해서 scratch되었다고 표시한 영역이
                   전체 영역에서 몇 %나 차지하는지 백분율로 계산하는 메서드
            */
            this.canvasWidth = 640 * this.ops.widthRatio;
            this.canvasHeight = 336 * this.ops.heightRatio;
            var allArea = this.canvasWidth * this.canvasHeight;
                filledArea = 0,
                filledOfAll = 0,
                width = parseInt(this.canvasWidth,10),
                height = parseInt(this.canvasHeight,10);

            for (var i = 0; i < width; i++) {
                for (var j = 0; j <height; j++) {
                    if(this.field[i][j] === "1"){
                        filledArea = filledArea + 1;
                    }
                }
            }
            filledOfAll = filledArea / allArea * 100;
            filledOfAll = parseFloat(filledOfAll.toFixed(2));

            return allArea - filledArea;
        },
        endMessage:function(){
             var alertMessage = " ";
            if(typeof this.resultMessage !== "string"){
                alertMessage = " 축하합니다. 상품권에 당첨되셨습니다.";
                alert(alertMessage);
            }else if(this.resultMessage.match(this.ops.bonusPoint)){
                alertMessage = "축하합니다 "+this.ops.bonusPoint+"POINT에 당첨되셨습니다.";
                alert(alertMessage);
            }

            $(this.canvas).remove();
        },
        touchEndMessage:function(){
             var alertMessage = " ";
            if(typeof this.resultMessage !== "string" && !this.endFlag){
                    alertMessage = "지금 나가시면 상품을 획득하실 수 없습니다.";
                    alert(alertMessage);
            }else if(this.resultMessage.match(this.ops.bonusPoint) && !this.endFlag){
                    alertMessage = " 지금 나가시면 상품을 획득하실 수 없습니다.";
                    alert(alertMessage);
            }
        },
        allScratchedMessage:function(){
             alert("게임이 끝났습니다.");
        }

    };
    window.ScratchPad = ScratchPad;
})( window );