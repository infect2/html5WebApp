var intro = function(canvasElem,ops){


    this.introImage = null;
    this.ops = {
        introPage : ops.introPage || "image/intro01_bg.png",
        introBtnImage : ops.introBtnImage || "image/touch_btn.png",
        modePage : ops.modePage || "image/intro02_bg.png",
        pitcherSprite : ops.pitcherSprite || "image/pitcherEnemyImage.png",
        playerSprite : ops.playerSprite || "image/hitterPlayerLeftImage.png",
        ballSprite : ops.ballSprite || "image/spriteBall.png",
        pitcherBtnImage : ops.pitcherBtnImage || "image/pitcher_btn.png",
        hitterBtnImage : ops.hitterBtnImage || "image/batter_btn.png",
        playballImage : ops.playballImage || "image/playball_btn.png",
        batterinfoImage : ops.batterinfoImage || "image/batter_info_box.png",
        hitterisPlayerImage : ops.hitterisPlayerImage || "image/1p_batter_player.png",
        strikeZonImage : ops.strikeZonImage || "image/strike_zone.png",
        strikeIconImage : ops.strikeIconImage || "image/strike_icon.png",
        homerunImage : ops.homerunImage || "image/homerun_icon.png",
        homerunPanelImg : ops.homerunPanelImg || "image/homerun.png",
        homerunEffectImg : ops.homerunEffectImg || "image/animation_effect.png",
        outImage : ops.outImage || "image/out_icon.png",
        resultPanelImage : ops.resultPanelImage || "image/pop_end_box.png",
        resultPanelcheckbtn : ops.resultPanelcheckbtn || "image/check_btn.png",
        playerisPitcherImg : ops.pitcherinfoImg || "image/1p_pitcher_player.png",
        pitcherinfoImg : ops.pitcherinfoImg || "image/mode_p_info.png",
        missImage : ops.missImage || "image/miss.png",
        hitbtnImage : ops.hitbtnImage || "image/hit_btn.png",
        flashImage : ops.flashImage || "image/hiteffect.png",
        scene2Image : ops.scene2Image || "image/scene2.png",
        sliderImage : ops.sliderImage || "image/select_slider_btn.png",
        curveImage : ops.curveImage || "image/select_curve_btn.png",
        fastballImage : ops.fastballImage || "image/select_straight_btn.png",
        fieldImage : ops.fieldImage || "image/play_bg.png",
        hitterLose : ops.hitterLose || "image/1p_lose.png",
        hitterWin : ops.hitterWin || "image/1p_win.png",
        pitcherLose : ops.pitcherLose || "image/2p_win.png",
        pitcherWin : ops.pitcherWin || "image/2p_lose.png",
        cancelBtn : ops.cancelBtn || "image/cancel_btn.png",
        hitImage : ops.hitImage || "image/hit.png",
        hitterEnemy : ops.hitterEnemy || "image/hitterenemyImage.png",
        hitterLeft : ops.hitterLeft || "image/hitterPlayerLeftImage.png",
        largeNumSprite : ops.largeNumSprite || "image/img_large.png",
        mediumNumSprite : ops.mediumNumSprite || "image/img_meter.png",
        smallNumSprite : ops.smallNumSprite || "image/img_small.png",
        rankSprite : ops.rankSprite || "image/img_rank.png",
        hitterMultiInfo : ops.hitterMultiInfo || "image/mode_b_info.png",
        multiPitcherPanel : ops.multiPitcherPanel || "image/mode_pitcher.png",
        pitcherInfo : ops.pitcherInfo || "image/pitcher_info.png",
        pitcherPlayerSprite : ops.pitcherPlayerSprite || "image/pitcherPlayerImage.png",
        playBallImage : ops.playBallImage || "image/playball.png",
        strikeImage : ops.strikeImage || "image/strike.png",
        pitcherEndPanel : ops.pitcherEndPanel || "image/pop_mode_box.png",
        enempitcherHitImg : ops.enempitcherHitImg || "image/enempitcherHitImg.png",
        enempitcherStrike : ops.enempitcherStrike || "image/enempitcherStrike.png",
        playerhitterHitImg : ops.playerhitterHitImg || "image/playerhitterHitImg.png",
        playerhitterMiss : ops.playerhitterMiss || "image/playerhitterMiss.png",
        signPanel1 : ops.signboard1 || "undefined",
        signPanel2 : ops.signboard2 || "undefined",
        signPanel3 : ops.signboard3 || "undefined",
        signPanel4 : ops.signboard4 || "undefined",
        signPanel5 : ops.signboard5 || "undefined",
        signPanel6 : ops.signboard6 || "undefined",
        signPanel7 : ops.signboard7 || "undefined"
    };
    this.modeSelectImage = null;
    this.canvas = canvasElem;
    this.context = this.canvas.getContext("2d");
    this.hasTouch = 'ontouchstart' in window;
    this.START_EV = this.hasTouch ? 'touchstart' : 'mousedown';
    this.MOVE_EV = this.hasTouch ? 'touchmove' : 'mousemove';
    this.offset = null;
    this.interval = null;
    this.curX = null;
    this.curY = null;
    this.introbtn = null;
    this.pitcherbtn = null;
    this.hitterbtn = null;
    this.playballbtn = null;
    this.sceneManager = null;
    this.xPos = null;
    this.textWidth = null;
    this.yPos = null;
    this.mode = "hitter";

    this.introLoadFlag = false;
    this.selectModePageFlag = false;
    this.playModePageFlag = false;
    this.allEndFlag = false;
    this.playBallFlag = false;

    this.gameModeObject = {
        mode:null,
        playMode:null
    };
    this.init();
};
intro.prototype = {

    init:function(){
        this.sceneManager = new sceneManager(this.canvas,this.context);
        this.bindEvent();
        this.loadResource();
    },
    bindEvent:function(){
        var that = this;
        $(this.canvas).on( this.START_EV, $.proxy( function(e){
                 e.preventDefault();

                var myWidth = window.innerWidth;
                var myHeight = window.innerHeight;
                var gameStartPanel ={
                    startX:415,
                    startY:415,
                    endX:415+210,
                    endY:415+50
                };
                var gameStartPanel320 = {
                    startX:gameStartPanel.startX/2,
                    startY:gameStartPanel.startY/2,
                    endX:gameStartPanel.endX/2,
                    endY:gameStartPanel.endY/2
                };
                var hitPanel640 = {
                        startX:121,
                        startY:298,
                        endX:321,
                        endY:366
                };
                var hitPanel320 = {
                        startX:hitPanel640.startX/2,
                        startY:hitPanel640.startY/2,
                        endX:hitPanel640.endX/2,
                        endY:hitPanel640.endY/2
                };
                var pitPanel640 = {
                        startX:321,
                        startY:298,
                        endX:526,
                        endY:366
                };
                var pitPanel320 = {
                        startX:pitPanel640.startX/2,
                        startY:pitPanel640.startY/2,
                        endX:pitPanel640.endX/2,
                        endY:pitPanel640.endY/2
                };
                var pitPos = {
                    startX:0,
                    startY:0,
                    endX:0,
                    endY:0
                };
                var hitPos = {
                    startX:0,
                    startY:0,
                    endX:0,
                    endY:0
                };
                var startPanelPos = null;
                var myWidthRatio = myWidth/640;
                var myHeightRatio = myHeight/480;

                if(myWidthRatio!==0){
                    pitPos.startX = pitPanel640.startX * myWidthRatio;
                    pitPos.startY = pitPanel640.startY * myHeightRatio;
                    pitPos.endX = pitPanel640.endX * myWidthRatio;
                    pitPos.endY = pitPanel640.endY * myHeightRatio;
                    hitPos.startX = hitPanel640.startX * myWidthRatio;
                    hitPos.startY = hitPanel640.startY * myHeightRatio;
                    hitPos.endX = hitPanel640.endX * myWidthRatio;
                    hitPos.endY = hitPanel640.endY * myHeightRatio;
                    gameStartPanel.startX = gameStartPanel.startX * myWidthRatio;
                    gameStartPanel.startY = gameStartPanel.startY * myHeightRatio;
                    gameStartPanel.endX = gameStartPanel.endX * myWidthRatio;
                    gameStartPanel.endY = gameStartPanel.endY * myHeightRatio;
                }
                var point = that.hasTouch ? e.originalEvent.touches[0] : e;
                that.offset = that.getOffset(that.canvas);
                that.curX = point.pageX - that.offset.left;
                that.curY = point.pageY - that.offset.top;
                console.log(that.curX + ", " + that.curY);

                if(that.playBallFlag){
                    if(that.curX>gameStartPanel.startX&&that.curX<gameStartPanel.endX){
                        if(that.curY>gameStartPanel.startY && that.curY<gameStartPanel.endY){
                            that.sceneManager.initGame(that.mode, that.ops);
                        }
                    }else{
                        alert("playBall을 터치해주세요");
                    }
                    that.allEndFlag = true;
                    that.playBallFlag = false;
                }

                if(that.playModePageFlag){

                    if(that.curY >hitPos.startY && that.curY<hitPos.endY){
                        if(that.curX>hitPos.startX&&that.curX<hitPos.endX){
                            that.mode="hitter";
                        }else if(that.curX>pitPos.startX&&that.curX<pitPos.endX){
                            that.mode="pitcher";
                        }
                        that.playModePageFlag = false;
                        that.playBallFlag = true;
                    }else{
                        alert("모드를 선택해 주세요");
                    }
                    console.log(that.mode);
                 }
              if(that.introLoadFlag){
                    that.drawSelectPlayModePage();
                    that.introLoadFlag = false;
                    that.playModePageFlag = true;
                 }
        }, this ));
    },
    getOffset:function(el){

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
    loadResource:function(){
        var that = this;
        this.introbtn = new Image();
        this.introbtn.onload = function(){
            console.log("intro btn loaded");
        };
        this.introbtn.src=this.ops.introBtnImage;
        this.introImage = new Image();
        this.introImage.onload = function(){
            console.log("intro image loaded");
            that.introLoadFlag = true;
            that.context.drawImage(that.introImage,0,0,that.canvas.width,that.canvas.height);
            that.fadeoutEffect(that);
        };
        if(typeof this.ops.introPage ==="undefined"){
            this.introImage.src=this.ops.introPage;
        }else{
            this.introImage.src=this.ops.introPage;
        }
        this.playballbtn = new Image();
        this.playballbtn.onload = function(){
            console.log("playballbtn image loaded");
        };
        this.playballbtn.src=this.ops.playballImage;
        this.pitcherbtn = new Image();
        this.pitcherbtn.onload = function(){
            console.log("pitcher btn image loaded");
        };
        this.pitcherbtn.src=this.ops.pitcherBtnImage;
        this.hitterbtn = new Image();
        this.hitterbtn.onload = function(){
            console.log("hitter btn image loaded");
        };
        this.hitterbtn.src=this.ops.hitterBtnImage;
        this.modeSelectImage = new Image();
        this.modeSelectImage.onload=function(){
            console.log("mode select Image loaded");
        };
        this.modeSelectImage.src=this.ops.modePage;
    },
    drawSelectPlayModePage:function(){
        clearInterval(this.interval);
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.drawImage(this.modeSelectImage,0,0,this.canvas.width,this.canvas.height);
        this.context.drawImage(this.hitterbtn,121,298,200,68);
        this.context.drawImage(this.pitcherbtn,321,298,200,68);
        this.context.drawImage(this.playballbtn,415,415,210,50);
    },
    fadeoutEffect:function(that){
       var alpha = 1.0,
           fadeoutFlag = false,
           self = that;
        self.interval = setInterval(function () {
            // self.context.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
            self.context.save();
            self.context.globalAlpha = alpha;
            self.context.drawImage(self.introbtn,80,388,480,60);
            self.context.restore();
            if(alpha >0){
                alpha = alpha - 0.05;
            }
        }, 100);
    }

};