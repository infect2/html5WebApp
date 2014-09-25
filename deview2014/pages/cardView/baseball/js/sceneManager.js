(function ($,window,document,undefined) {

     var hasTouch = 'ontouchstart' in window,
        START_EV = hasTouch ? 'touchstart' : 'mousedown',
        MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
        END_EV = hasTouch ? 'touchend' : 'mouseup',
        CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup';

     function sceneManager(canvasElem,ctx)
     {
          this.canvas = canvasElem;
          this.context = ctx;
          this.ops = null;
          this.tempDiv = document.getElementById("temp");
          this.curX = 0;
          this.curY = 0;
          this.frameRate = 20;
          this.a =null;
          //game interval
          this.scene2Interval = null;
          this.interval = null;
          this.intervalTime = 1000/this.frameRate;
          this.effectInterval = null;
          //object value
          this.pitcher = null;
          this.player = null;
          this.manager = null;
          this.rank = null;
          this.ball = null;
          this.flash = null;
          this.intro = null;
          this.middleDigit = null;
          this.bigDigit = null;
          this.smallDigit = null;
          this.ballPos = [];
          this.myWidth = window.innerWidth;
          this.myHeight = window.innerHeight;
          this.myWidthRatio = this.myWidth / 640;
          this.myHeightRatio = this.myHeight / 480;

          this.selectPos = {
            x:0,
            y:0
          };
          this.playerisHitterPointPos = [136,166,196,226,256];
          this.playerisHitterPointPosY = 11;
          this.playerisPitcherPointPos = [106,136,166,196,226,256,286,316,346,494];
          this.playerisPitcherPointPosY = 11;
          this.distanceCounter ={
            x:391,
            y:18
          };
          this.pitchingCounter = {
            x:442,
            y:17
          };
          this.scene2BallPos = 0;
          this.pitcherFrame = 0;
          this.hitterFrame = 0;
          this.ballFrame = 0;
          this.simulator = null;
          this.offset = null;
          this.sprite = null;
          this.pitcherGameInitFlag = false;
          this.failFlag = false;
          this.swingCounter = 0;

          this.gameStartFlag = false;
          this.pitcherModeStartFlag = false;
          this.ballTypeSelectedFlag = false;
          this.gameReadyFlag = false;
          this.pitcherGameEndFlag = false;
          this.startedIntervalFlag = false;
          this.initGameManager = false;
          this.firstLoadGame = false;
          this.swingFlag = false;
          this.endMessageTouchFlag = false;
          this.selectedTypeFlag = false;
          this.selectedBallPos = false;
          this.afterAnimateFlag = true;
          this.signPanelFlag = [];
          this.hitterUIswing = null;

          //image resource
          this.image = new Image();
          this.stage = new Image();
          this.batterinfo =new Image();
          this.hitterisPlayer = new Image();
          this.pitcherisPlayer = new Image();
          this.strikeZon = new Image();
          this.resultPanel = new Image();
          this.hitbtnImage = new Image();
          this.missMessage = new Image();
          this.playerImage = new Image();
          this.pitcherImage = new Image();
          this.resultCheckbtn = new Image();
          this.ballImage = new Image();
          this.flashImage = new Image();
          this.scene2Image = new Image();
          this.homerunPanel = new Image();
          this.homerunEffect = new Image();
          this.hitterLose = new Image();
          this.hitterWin = new Image();
          this.pitcherLose = new Image();
          this.pitcherWin = new Image();
          this.cancelBtn = new Image();
          this.hitImage = new Image();
          this.hitterEnemy = new Image();
          this.hitterLeft = new Image();
          this.largeNumSprite = new Image();
          this.mediumNumSprite = new Image();
          this.smallNumSprite = new Image();
          this.rankSprite = new Image();
          this.hitterMultiInfo = new Image();
          this.multiPitcherPanel = new Image();
          this.pitcherInfo = new Image();
          this.pitcherPlayerSprite = new Image();
          this.playBallImage = new Image();
          this.strikeImage = new Image();
          this.pitcherEndPanel  = new Image();
          this.enempitcherHitImg = new Image();
          this.enempitcherStrike = new Image();
          this.playerhitterHitImg = new Image();
          this.playerhitterMiss = new Image();
          this.strikeIconImage = new Image();
          this.signPanel1 = new Image();
          this.signPanel2 = new Image();
          this.signPanel3 = new Image();
          this.signPanel4 = new Image();
          this.signPanel5 = new Image();
          this.signPanel6 = new Image();
          this.signPanel7 = new Image();
          this.Icon = {
            out : new Image(),
            homerun : new Image(),
            strike : new Image()
          };
          this.balltypeImage ={
            fastball:new Image(),
            slider:new Image(),
            curve:new Image()
          };
          this.pitcherinfoImg = new Image();
          this.playerisPitcherPanel = new Image();

     }
     sceneManager.prototype={

          initGame:function(mode,ops){
              this.ops = ops;
              this.mode = mode;
              this.bigDigit = new sceneManager.sprite(this);
              this.middleDigit = new sceneManager.sprite(this);
              this.smallDigit = new sceneManager.sprite(this);
              this.rank = new sceneManager.sprite(this);
              this.pitcher = new sceneManager.pitcher(this.canvas,this.context);
              this.player = new sceneManager.hitter(this.canvas,this.context);
              this.ball = new sceneManager.ball(this.canvas,this.context);
              this.render = new sceneManager.render(this);
              this.simulator = new baseballSimulator();
              this.a = new sceneManager.resourceManager(this);
              this.hitterUIswing = this.render.getRandomInt(0,10);
              this.simulator.init(mode,this,this.myWidth);
              if(!this.initGameManager){
                this.manager = new baseballSimulator.gameManager(this.mode);
                this.initGameManager = true;
              }
              this.a.loadResource();
              $(this.canvas).trigger('oninIt');
          },
          getOffset: function(el) {
            var box = { top: 0, left: 0 },
                doc = document.documentElement;
            this.simulator.getOffsetFlag = true;
            if ( typeof el.getBoundingClientRect !== "undefined" ) {
                box = el.getBoundingClientRect();
            }
            return {
                top: box.top + window.pageYOffset - doc.clientTop,
                left: box.left + window.pageXOffset  - doc.clientLeft
            };
          },
          addEvent:function(){
            $(this.canvas).bind("oninIt",{that:this},function(event){
                var that = event.data.that;
                if(that.simulator.playerReadyFlag&&that.simulator.pitcherReadyFlag&&that.simulator.ballReadyFlag){
                         that.gameReadyFlag = true;
                         that.offset = that.getOffset(that.canvas);
                         that.startInterval();
                }else{
                  setTimeout(function(){
                    $(that.canvas).trigger('oninIt');
                  },10);
                }
            });
            $( this.canvas ).unbind( START_EV);
            $( this.canvas ).on( START_EV, $.proxy( function(e){
              var that = this;
              var flag = false;
              var endPanelPos = {
                startX:218,
                startY:347,
                endX:428,
                endY:397
              };

              var point = hasTouch ? e.originalEvent.touches[0] : e;
                  this.curX = point.pageX - this.offset.left;
                  this.curY = point.pageY - this.offset.top;

              endPanelPos.startX = endPanelPos.startX * this.myWidthRatio;
              endPanelPos.startY = endPanelPos.startY * this.myHeightRatio;
              endPanelPos.endX = endPanelPos.endX * this.myWidthRatio;
              endPanelPos.endY = endPanelPos.endY * this.myHeightRatio;


               if(this.simulator.startGameEndingFlag){
                  window.location.reload(true);
               }
               if(this.gameStartFlag){
                     if(this.mode==="pitcher"){
                        if(!this.selectedTypeFlag){
                           this.simulator.selectType=this.findType(this.curX,this.curY);
                           if(typeof this.simulator.selectType === "number"){
                            this.selectedTypeFlag = true;
                           }
                           this.startInterval();
                        }else{
                          if(!this.selectedBallPos){

                            that.selectPos.x = that.curX;
                            that.selectPos.y = that.curY;
                            that.simulator.targetPos.x = that.curX;
                            that.simulator.targetPos.y = that.curY;
                            this.selectedBallPos = true;
                            this.simulator.chooseBallPosFlag = true;
                            this.startInterval();
                           }
                        }
                      }else{
                          that.simulator.swingFlag = true;
                      }
              }else{
                if(this.endMessageTouchFlag){
                    if(this.curX>endPanelPos.startX && this.curX<endPanelPos.endX){
                      if(this.curY>endPanelPos.startY && this.curY<endPanelPos.endY){
                         window.location.reload();
                      }
                    }
                  }
              }
            }, this ));
          },
          //게임 스레드 스타드
          startInterval:function(){
               var that = this;
                if(that.manager.getGameCount() > that.manager.maxGame - 1){
                  that.startGameEnding(that);
                }else{
                 if(this.gameReadyFlag){
                   this.interval = setInterval(function(){
                       that.gameStartFlag = true;
                       if(that.mode==="hitter"){
                         that.hitterGameStart(that);
                       }else if(that.mode==="pitcher"){
                         that.pitcherGameStart(that);
                       }
                    }, that.intervalTime);
                 }
               }
          },
          //interval stop
          stopInterval:function(interval){
               window.clearInterval(interval);
          },
          startScene2Interval:function(that){
              var end = null;
              // that.stopInterval(that.interval);
              that.render.counter = 0;
              clearInterval(that.scene2Interval);
              that.scene2Interval = setInterval(function(){
                  that.render.renderBackground("scene2");
                  end = that.render.renderScene2Ball(that.simulator.scene2BallPos);
                  if(end === 14){
                    clearInterval(that.scene2Interval);
                    that.simulator.gameEndFlag = false;
                    that.render.renderMeter(that.simulator.scene2BallPos);
                    that.render.hitResult(that.hitResult);
                    setTimeout(function(){
                    that.simulator.initVal(that.simulator.playMode,that.ops);
                    that.ballFrame = 0;
                    }, 1000);
                  }
              },50);
          },
          startGameEnding:function(that){
            var distance=0,
                homerunCount=0,
                check=0,
                hitCount=0,
                outCount=0,
                strikeCount=0;
            that.curX = 0;
            that.curY = 0;
            that.gameStartFlag = false;
            that.endMessageTouchFlag = true;
            that.render.renderBackground();
            if(that.mode==="hitter"){
                  that.render.renderPicture(that.resultPanel,135,129,377,188);
                  distance = that.manager.getDistance();
                  if(distance===0){
                      homerunCount = that.manager.getResult(1);
                      that.bigDigit.drawCharacter(homerunCount,1,"big",{x:403,y:208});
                      that.rank.drawCharacter("c",3,"rank",{x:168,y:200});
                      that.bigDigit.drawCharacter(0,1,"big",{x:423,y:249});
                      that.bigDigit.drawCharacter(11,0,"big",{x:436,y:249});
                      that.render.renderPicture(that.resultCheckbtn,218,347,210,50);
                  }else{
                      check = parseInt(distance/100,10) === 0 ? 2:3;
                      //distance를 그린다
                      if(check===2){
                        number = parseInt(distance/10,10);
                        that.bigDigit.drawCharacter(number,10,"big",{x:410,y:249});
                        number = distance % 10;
                        that.bigDigit.drawCharacter(number,1,"big",{x:423,y:249});
                        that.bigDigit.drawCharacter(11,0,"big",{x:436,y:249});
                      }else{
                        number = parseInt(distance/100,10);
                        that.bigDigit.drawCharacter(number,100,"big",{x:397,y:249});
                        reminder = parseInt((distance - (number*100))%10,10);
                        number = parseInt((distance - (number*100))/10,10);
                        that.bigDigit.drawCharacter(number,10,"big",{x:410,y:249});
                        that.bigDigit.drawCharacter(reminder,1,"big",{x:423,y:249});
                        that.bigDigit.drawCharacter(11,0,"big",{x:436,y:249});
                      }

                      homerunCount = that.manager.getResult(1);
                      that.bigDigit.drawCharacter(homerunCount,1,"big",{x:403,y:208});

                    if(homerunCount > 4 && distance >= 360){
                    //s
                      that.rank.drawCharacter("s",0,"rank",{x:168,y:200});
                    }else if(homerunCount > 3 && distance >= 270){
                    //a
                      that.rank.drawCharacter("a",1,"rank",{x:168,y:200});
                    }else if(homerunCount > 2 && distance >= 180){
                    //b
                      that.rank.drawCharacter("b",2,"rank",{x:168,y:200});
                    }else{
                    //c
                      that.rank.drawCharacter("c",3,"rank",{x:168,y:200});
                    }
                    that.render.renderPicture(that.resultCheckbtn,218,347,210,50);
                    }
              }else{
                that.render.renderPicture(that.pitcherEndPanel,135,129,377,188);
                strikeCount = that.manager.getResult(1);
                hitCount = that.manager.getResult(2);
                outCount = that.manager.getResult(0);
                that.bigDigit.drawCharacter(strikeCount,1,"big",{x:353,y:233});
                that.bigDigit.drawCharacter(hitCount+outCount,1,"big",{x:353,y:263});
                that.bigDigit.drawCharacter(9,1,"big",{x:398,y:203});
                if(strikeCount>8){
                  //s
                   that.rank.drawCharacter("s",0,"rank",{x:168,y:200});
                }else if(strikeCount>6){
                  //a
                  that.rank.drawCharacter("a",1,"rank",{x:168,y:200});
                }else if(strikeCount>4){
                  //b
                   that.rank.drawCharacter("b",2,"rank",{x:168,y:200});
                }else{
                  //c
                  that.rank.drawCharacter("c",3,"rank",{x:168,y:200});
                }
                that.render.renderPicture(that.resultCheckbtn,218,347,210,50);
              }
          },
          pitcherGameStart:function(that){
            that.render.renderBackground("pitcher");
            //updateGame
            that.updateGame(that);
            //renderGame
            that.renderGame(that);
            //gameEndFlag
            if(that.simulator.gameEndFlag){
                that.stopInterval(that.interval);
                that.showResultPanel(that);
                setTimeout(function(){
                    that.simulator.initVal(that.simulator.playMode,that.ops);
                    that.ballFrame = 0;
                    that.selectedBallPos = false;
                    that.selectedTypeFlag = false;
                    that.curX = 0;
                    that.curY = 0;
                    that.hitterUIswing = that.render.getRandomInt(0,10);
                    that.simulator.getOffsetFlag = true;
                },1000);
            }
            //select type
            if(!that.selectedTypeFlag){
              //type이 선택되지않았다면.
               that.stopInterval(that.interval);
               that.selectType(that);
            }else{
              //select ball Pos
              if(!that.selectedBallPos){
                 that.stopInterval(that.interval);
                 that.selectBallPos(that);
              }
            }
            //
          },
          showResultPanel:function(that){
            var result = null;
            result = that.getPitchingResult(that);
            // that.render.renderBall();
            if(result === "strike"){
              if(!that.simulator.hitFlag){
                  that.render.renderPicture(that.strikeImage,79,97,480,60);
                  that.manager.setResult(1);
              }else{
                that.render.renderPicture(that.hitImage,79,97,480,60);
                that.manager.setResult(2);
              }
            }else if(result === "ball"){
               if(!that.simulator.hitFlag){
                  that.render.renderPicture(that.missMessage,79,97,480,60);
                  that.manager.setResult(0);
               }else{
                that.render.renderPicture(that.strikeImage,79,97,480,60);
                that.manager.setResult(1);
               }

            }
          },
          getPitchingResult:function(that){
            var startX=that.simulator.ball.strikeZonPos.startX,
                startY=that.simulator.ball.strikeZonPos.startY,
                endX = that.simulator.ball.strikeZonPos.endX,
                endY = that.simulator.ball.strikeZonPos.endY;
            var result = "ball";
            if(that.selectPos.x > startX && that.selectPos.x<endX){
                if(that.selectPos.y>startY && that.selectPos.y < endY){
                      result = "strike";
                }
            }
            return result;
          },
          selectType:function(that){
             //타입 선택 문구 집어넣기
             that.render.renderPicture(that.balltypeImage.slider,294,260,61,66); //slider 판
             that.render.renderPicture(that.balltypeImage.fastball,294,326,61,61); //fastball 판
             that.render.renderPicture(that.balltypeImage.curve,353,327,66,61); //curve판
          },
          findType:function(curX,curY){
            var x = curX,
                y = curY,
                ballType = false;

            this.myWidthRatio = window.innerWidth / 640;
            this.myHeightRatio = window.innerHeight / 480;

            var sliderPos = {
              startX:294,
              startY:260,
              endX:355,
              endY:326
            };
            var fastballPos = {
              startX:294,
              startY:326,
              endX:355,
              endY:388
            };
            var curveballPos = {
              startX:360,
              startY:327,
              endX:426,
              endY:388
            };
            sliderPos.startX = sliderPos.startX * this.myWidthRatio;
            sliderPos.startY = sliderPos.startY * this.myHeightRatio;
            sliderPos.endX = sliderPos.endX * this.myWidthRatio;
            sliderPos.endY = sliderPos.endY * this.myHeightRatio;

            fastballPos.startX = fastballPos.startX * this.myWidthRatio;
            fastballPos.startY = fastballPos.startY * this.myHeightRatio;
            fastballPos.endX = fastballPos.endX * this.myWidthRatio;
            fastballPos.endY = fastballPos.endY * this.myHeightRatio;

            curveballPos.startX = curveballPos.startX * this.myWidthRatio;
            curveballPos.startY = curveballPos.startY * this.myHeightRatio;
            curveballPos.endX = curveballPos.endX * this.myWidthRatio;
            curveballPos.endY = curveballPos.endY * this.myHeightRatio;


            if(x>sliderPos.startX&&x<sliderPos.endX){
              //slider,fastball
              if(y>sliderPos.startY&&y<sliderPos.endY){
                  //slider
                  ballType = 1;
              }else if(y>fastballPos.startY&&y<fastballPos.endY){
                  //fastball
                  ballType = 0;

              }else{
                alert("다시 선택하세요");
              }
            }else if(x>curveballPos.startX&&x<curveballPos.endX){
              //curve
              if(y>curveballPos.startY&&y<curveballPos.endY){
                ballType = 2;
              }
            }else{
              alert("다시 선택하세요");
            }
            return ballType;
          },
          selectBallPos:function(that){
             // that.render.renderBackground("pitcher");
          },
          hitterGameStart:function(that){
               that.render.renderBackground();
               that.updateGame(that);
               that.renderGame(that);

        },
        updateGame:function(that){
            if(that.mode==="pitcher"){
              if(that.hitterUIswing > 3 && that.hitterUIswing < 11){
                if(that.simulator.ballFrame > 5){
                    that.simulator.swingFlag = true;
                }
              }
            }
              that.simulator.updatePitcher();
              that.simulator.updatePlayer();
              that.simulator.updateBall();


        },
        renderGame:function(that){
              that.render.renderPitcher();
              if(that.simulator.balldrawFlag){
                that.render.renderBall();
              }
              if(that.mode==="hitter"){
                 if(that.simulator.gameEndFlag){
                 that.stopInterval(that.interval);
                 that.render.renderBackground();
                 if(that.simulator.flashFlag){
                    that.render.renderPicture(that.flashImage,150,180,343,282);
                  }
                 that.renderAfterAnimation(that,"hit");
                 setTimeout(function(){
                  that.startScene2Interval(that);
                 },100);
                }else{
                  that.render.renderHitter(that);
                }
                if(that.simulator.notScene2){ //게임이 scene2로 넘어가지 않고 scene1에서 나머지작업 처리할
                 if(!that.simulator.swingFlag){ //스윙이 일어나지않을때
                    that.stopInterval(that.interval);
                    that.gameStartFlag = false;
                     if(that.simulator.failFlag){ //스트라이크
                       that.render.renderBackground();
                       that.render.renderBall();
                       that.context.drawImage(that.strikeImage,79,97,480,60);
                       that.renderAfterAnimation(that,"noSwing");
                       that.render.renderHitter(that);
                       that.manager.setResult(0); // 아웃카운트 증가
                      }
                    setTimeout(function(){
                    that.simulator.initVal(that.simulator.playMode,that.ops);
                    that.ballFrame = 0;
                    }, 1000);
                 }else{ // 스윙이 일어날때
                    if(that.swingCounter === 1){ // 스윙이 일어남
                    that.stopInterval(that.interval);
                    that.gameStartFlag = false;
                    if(that.simulator.failFlag){ //볼
                       that.render.renderBackground();
                       that.render.renderBall();
                       that.context.drawImage(that.missMessage,79,97,480,60);
                       that.renderAfterAnimation(that,"noHit");
                       that.manager.setResult(0); // 헛스윙으로 인한 아웃카운트 증가
                      }else{
                       that.render.renderBackground();
                       that.render.renderBall();
                       that.context.drawImage(that.missMessage,79,97,480,60);
                       that.renderAfterAnimation(that,"noHit");
                       that.manager.setResult(0); // 헛스윙으로 인한 아웃카운트 증가
                    }
                    setTimeout(function(){
                    that.simulator.initVal(that.simulator.playMode,that.ops);
                    that.ballFrame = 0;
                    }, 1000);
                   }else{
                      console.log("another options");
                   }
                 }
                }
              }else{//pitchermode renderhitter
                that.render.renderHitter(that);
              }
        },
        renderAfterAnimation:function(that,hitResult){
              var pitcherFrame = 0,
              hitterFrame = 1;
              that.pitcher.afterAnimatedSprites(pitcherFrame,hitResult);
              that.player.afterAnimatedSprites(hitterFrame,hitResult);
        }
     };
     sceneManager.render = function(sceneManager){
        this.sceneManager = sceneManager;
        this.counter = 0;
     };
     sceneManager.render.prototype.renderBackground = function(backType){
        this.clearField();
        var type = typeof backType;
        if(type==="undefined"){
          this.renderPicture(this.sceneManager.image,0,0,this.sceneManager.canvas.width,this.sceneManager.canvas.height);
          this.fieldUIRender();
          this.renderSignPanel();
          this.renderPicture(this.sceneManager.strikeZon,296,330,53,53);
          this.distanceRender();
        }else if(backType==="pitcher"){
          this.renderPicture(this.sceneManager.image,0,0,this.sceneManager.canvas.width,this.sceneManager.canvas.height);
          this.renderSignPanel();
          this.renderPicture(this.sceneManager.strikeZon,296,330,53,53);
          this.fieldUIRender();
        }else{
          this.renderPicture(this.sceneManager.scene2Image,0,0,this.sceneManager.canvas.width,this.sceneManager.canvas.height);
        }
     };
     sceneManager.render.prototype.renderSignPanel = function(){
       var signPanelInfo = {
        imgSrc:[this.sceneManager.signPanel1,this.sceneManager.signPanel2,this.sceneManager.signPanel3,this.sceneManager.signPanel4,this.sceneManager.signPanel5,this.sceneManager.signPanel6,this.sceneManager.signPanel7],
        posX:[0,81,181,282,387,484,593],
        posY:[193,192,192,192,192,192,193],
        width:[43,73,73,68,57,61,47],
        height:[24,25,24,24,24,24,26]
       },
       signPanel = this.sceneManager.signPanelFlag;

       if(signPanel.length===0){
        return ;
       }
       for(var i=0;i<7;i++){
         for(var j=0;j<signPanel.length;j++){
            if(signPanel[j]===i){
            this.renderPicture(signPanelInfo.imgSrc[i],signPanelInfo.posX[i],signPanelInfo.posY[i],signPanelInfo.width[i],signPanelInfo.height[i]);
          }
         }
       }
     };
     sceneManager.render.prototype.distanceRender = function(){
       var distance = 0,
           check = 0,
           number =0,
           reminder = 0;

       this.sceneManager.context.save();
       distance = this.sceneManager.manager.getDistance();
       if(distance===0){
          this.sceneManager.smallDigit.drawCharacter(0,1,"small",{x:409,y:18});
          this.sceneManager.smallDigit.drawCharacter(10,0,"small",{x:418,y:18});
       }else{
          check = parseInt(distance/100,10) === 0 ? 2:3;
          //distance를 그린다
          if(check===2){
            number = parseInt(distance/10,10);
            this.sceneManager.smallDigit.drawCharacter(number,10,"small",{x:400,y:18});
            number = distance % 10;
            this.sceneManager.smallDigit.drawCharacter(number,1,"small",{x:409,y:18});
            this.sceneManager.smallDigit.drawCharacter(10,0,"small",{x:418,y:18});
          }else{
            number = parseInt(distance/100,10);
            this.sceneManager.smallDigit.drawCharacter(number,100,"small",{x:391,y:18});
            reminder = parseInt((distance - (number*100))%10,10);
            number = parseInt((distance - (number*100))/10,10);
            this.sceneManager.smallDigit.drawCharacter(number,10,"small",{x:400,y:18});
            this.sceneManager.smallDigit.drawCharacter(reminder,1,"small",{x:409,y:18});
            this.sceneManager.smallDigit.drawCharacter(10,0,"small",{x:418,y:18});
          }
       }
     };
     sceneManager.render.prototype.renderHitter = function(){
        this.sceneManager.context.save(); //push context  stack
        this.sceneManager.player.drawCharacter(this.sceneManager.simulator,this.sceneManager.simulator.playerFrame);
        this.sceneManager.context.restore(); //pop context stack
     };
     sceneManager.render.prototype.renderPitcher = function(){
        this.sceneManager.context.save();
        this.sceneManager.pitcher.drawCharacter(this.sceneManager.simulator.pitcherFrame);
        this.sceneManager.context.restore();
     };
     sceneManager.render.prototype.renderBall = function(){
        var currentBallPos = {
              x:0,
              y:0
         };
         if(this.sceneManager.ballFrame===0){
          return;
         }
        this.sceneManager.context.save();
        if(this.sceneManager.simulator.pitchingStartFlag){
                currentBallPos.x = this.sceneManager.ballPos.x[this.sceneManager.ballFrame];
                currentBallPos.y = this.sceneManager.ballPos.y[this.sceneManager.ballFrame];
        }
        if(!this.sceneManager.simulator.hitFlag){
                this.sceneManager.ball.drawCharacter(this.sceneManager.ballFrame,this.sceneManager.ballPos);
        }
        this.sceneManager.context.restore();
     };
     sceneManager.render.prototype.renderScene2Ball=function(ballPos){
        var curBallPos = {
          x:ballPos.x[this.counter],
          y:ballPos.y[this.counter]
        };
        var type = typeof curBallPos.x;
        if(type==="undefined"){
          return type;
        }else{
          this.sceneManager.ball.drawCharacter("scene2",curBallPos);
          this.counter++;
          return this.counter;
        }
     };
     sceneManager.render.prototype.hitResult = function(hitResult){
        var result = hitResult;
        if(hitResult === "perfect"){
          this.renderPicture(this.sceneManager.homerunPanel,80,176,480,60);
          this.renderPicture(this.sceneManager.homerunEffect,10,10,567,283);
          this.sceneManager.manager.setResult(1);
        }else{
          this.renderPicture(this.sceneManager.missMessage,80,176,480,60);
          this.sceneManager.manager.setResult(0);
        }
     };
     sceneManager.render.prototype.renderMeter=function(ballPos){
        var length = ballPos.x.length -1,
            dx = ballPos.x[length] - ballPos.x[0],
            dy = ballPos.y[length] - ballPos.y[0],
            renderDistance = 0,
            firstDigit = 0,
            secondDigit = 0,
            distance = Math.sqrt((dx*dx) + (dy*dy));

            distance = parseInt(distance,10);

            if(this.sceneManager.hitResult==="perfect"){
              renderDistance = this.getRandomInt(95,99);
            }else if(this.sceneManager.hitResult==="late"){

               renderDistance = parseInt((distance/378)*100,10);

            }else{
                renderDistance = parseInt((distance/379)*100,10);
            }
            // renderDistance = distance % 100;
            firstDigit = parseInt(renderDistance/10,10);
            secondDigit = renderDistance - (firstDigit*10);
            this.sceneManager.middleDigit.drawCharacter(firstDigit,10,"middle");
            this.sceneManager.middleDigit.drawCharacter(secondDigit,1,"middle");
            this.sceneManager.middleDigit.drawCharacter(10,0,"middle");
            this.sceneManager.manager.setDistance(renderDistance);
     };
     sceneManager.render.prototype.fieldUIRender = function(){
        if(this.sceneManager.mode === "hitter"){
           this.sceneManager.context.drawImage(this.sceneManager.batterinfo,0,0,484,57);
           this.sceneManager.context.drawImage(this.sceneManager.hitterisPlayer,495,0,145,57);
           this.drawHitterScore();
        }else{
           this.sceneManager.context.drawImage(this.sceneManager.pitcherInfo,0,0,484,57);
           this.sceneManager.context.drawImage(this.sceneManager.playerisPitcherPanel,495,0,145,57);
           this.renderPitcherScore();
        }
     };
     sceneManager.render.prototype.renderPitcherScore=function(){
        var totalScore = this.sceneManager.manager.getResult();
            if(totalScore.length === 0){
                return;
            }
            for(var i = 0; i<totalScore.length;i++){
              if(totalScore[i]===1){
                this.sceneManager.context.drawImage(this.sceneManager.strikeIconImage,this.sceneManager.playerisPitcherPointPos[i],this.sceneManager.playerisPitcherPointPosY,24,24);
              }else if(totalScore[i]===0){
                this.sceneManager.context.drawImage(this.sceneManager.Icon.out,this.sceneManager.playerisPitcherPointPos[i],this.sceneManager.playerisPitcherPointPosY,24,24);
              }else{
                this.sceneManager.context.drawImage(this.sceneManager.Icon.homerun,this.sceneManager.playerisPitcherPointPos[i],this.sceneManager.playerisPitcherPointPosY,24,24);
              }
            }
     };
     sceneManager.render.prototype.getRandomInt=function(min, max) {
              return Math.floor(Math.random() * (max - min + 1)) + min;
     };

     sceneManager.render.prototype.gameEndRender = function(){
     };
     sceneManager.render.prototype.renderPicture = function(img,posX,posY,sizeW,sizeH){
        this.sceneManager.context.drawImage(img,posX,posY,sizeW,sizeH);
     };
     sceneManager.render.prototype.clearField = function(){
        this.sceneManager.context.clearRect(0,0,this.sceneManager.canvas.width,this.sceneManager.canvas.height);
     };
     sceneManager.render.prototype.drawHitterScore = function(){
            var totalScore = this.sceneManager.manager.getResult();
            if(totalScore.length === 0){
                return;
            }
            for(var i = 0; i<totalScore.length;i++){
              if(totalScore[i]===1){
                this.sceneManager.context.drawImage(this.sceneManager.Icon.homerun,this.sceneManager.playerisHitterPointPos[i],this.sceneManager.playerisHitterPointPosY,24,24);
              }else{
                this.sceneManager.context.drawImage(this.sceneManager.Icon.out,this.sceneManager.playerisHitterPointPos[i],this.sceneManager.playerisHitterPointPosY,24,24);
              }
            }
     };
     sceneManager.hitter = function(canvas,context){
        this.character = null;
        this.canvas = canvas;
        this.context = context;
        this.playerImage= null;
        this.spriteInterval = 340;
        this.missSpritePos = 4420;
        this.hitSpritePos = 5780;
        this.hitterPos = {
          x:64,
          y:210
        };
        this.size = {
          width:340,
          height:235
        };
        this.frame = 0;
     };
     sceneManager.hitter.prototype.init=function(img){
       this.hitterImage = img;
       this.character = this.setCharacter();
     };
     sceneManager.hitter.prototype.drawCharacter=function(simulator,sceneNumber){
           var currentScene = sceneNumber;
           this.displayAnimatedSprites(simulator,currentScene);
     };
     sceneManager.hitter.prototype.setCharacter=function(){
        var man1 = new sprite(this.hitterImage,this.size.width,this.size.height,0,0,this.frame,100,1);
        return man1;
     };
     sceneManager.hitter.prototype.displayAnimatedSprites=function(simulator,currentScene){
        var cScene = currentScene;
        this.character.setPosition(this.hitterPos.x,this.hitterPos.y); // character opsition in canvas
        this.character.draw(this.context,this.size.width,this.size.height,this.spriteInterval * currentScene,0);
     };
     sceneManager.hitter.prototype.afterAnimatedSprites=function(currentScene,hitResult){
        var cScene = currentScene;
        this.character.setPosition(this.hitterPos.x,this.hitterPos.y); // character opsition in canvas
        if(hitResult==="hit"){
          this.character.draw(this.context,this.size.width,this.size.height,this.hitSpritePos+(this.spriteInterval * currentScene),0);
        }else if(hitResult==="noSwing"){

        }else{
          this.character.draw(this.context,this.size.width,this.size.height,this.missSpritePos+(this.spriteInterval * currentScene),0);
        }

     };
     sceneManager.pitcher = function(canvas,context){
        this.character = null;
        this.canvas = canvas;
        this.context = context;
        this.pitcherImage= null;
        this.spriteInterval = 79;
        this.strikeSpritePos = 2212; // 이후5씬
        this.hitSpritePos = 1738; //이후 3씬
        this.size = {
          width:79,
          height:113
        };
        this.frame = 0;
    };
    sceneManager.pitcher.prototype.init=function(img){
        this.pitcherImage = img;
        this.character = this.setCharacter();

    };
    sceneManager.pitcher.prototype.drawCharacter=function(sceneNumber){
        var currentScene = sceneNumber;
        this.displayAnimatedSprites(currentScene);
    };
    sceneManager.pitcher.prototype.setCharacter=function(){
        var man1 = new sprite(this.pitcherImage,this.size.width,this.size.height,0,0,this.frame,100,1);
        return man1;
    };
    sceneManager.pitcher.prototype.displayAnimatedSprites = function(currentScene){
        var cScene = currentScene;
        this.character.setPosition(295,181); // character opsition in canvas
        this.character.draw(this.context,this.size.width,this.size.height,this.spriteInterval * currentScene,0);
    };
    sceneManager.pitcher.prototype.afterAnimatedSprites = function(currentScene,hitResult){
        var cScene = currentScene;
        this.character.setPosition(295,181); // character opsition in canvas

        if(hitResult === "hit"){
          this.character.draw(this.context,this.size.width,this.size.height,this.hitSpritePos+(this.spriteInterval * currentScene),0);
        }else if(hitResult==="noSwing"){
           this.character.draw(this.context,this.size.width,this.size.height,this.strikeSpritePos+(this.spriteInterval * currentScene),0);
        }else{
          this.character.draw(this.context,this.size.width,this.size.height,this.strikeSpritePos+(this.spriteInterval * currentScene),0);
        }

    };
    sceneManager.ball = function(canvas,context){
        this.character = null;
        this.canvas = canvas;
        this.context = context;
        this.ballImage= null;
        this.spritePos = 24;
        this.size = {
          width:24,
          height:23
        };
        this.ballPos = [];
        this.frame = 0;
        this.xP = 0;
    };
    sceneManager.ball.prototype.init=function(img){
        this.ballImage = img;
        this.character = this.setCharacter();
    };
    sceneManager.ball.prototype.setCharacter=function(){
        var man1 = new sprite(this.ballImage,this.size.width,this.size.height,0,0,this.frame,100,1);
        return man1;
    };
    sceneManager.ball.prototype.drawCharacter=function(sceneNumber,ballPos){
         var currentScene = sceneNumber;
         this.ballPos = ballPos;
         if(sceneNumber==="scene2"){
          this.animatedSprite(currentScene,ballPos);
         }else{
          this.displayAnimatedSprites(currentScene);
         }

    };
    sceneManager.ball.prototype.displayAnimatedSprites=function(currentScene){
        var cScene = currentScene - 1;
        if(cScene===0){
          this.xP = 0;
        }
        this.character.setPosition(this.ballPos.x[cScene],this.ballPos.y[cScene]); // character opsition in canvas
        this.character.draw(this.context,this.size.width,this.size.height,this.spritePos * this.xP,0);
        if(cScene%2===1){
              this.xP++;
        }
        if(cScene === 12){
          this.xP = 6;
        }
    };
    sceneManager.ball.prototype.animatedSprite = function(currentScene,ballPos){
        this.character.setPosition(ballPos.x,ballPos.y); // character opsition in canvas
        this.character.draw(this.context,this.size.width,this.size.height,this.spritePos * 6,0);
    };
    sceneManager.sprite = function(sceneManager){
      this.sceneManager = sceneManager;
      this.image = null;
      this.character = null;
      this.spritePos = 32;
      this.middleDigitSize = [34,23,32,32,35,32,35,33,34,34,46];
      this.middleDigitPos = [0,34,57,89,121,156,188,223,256,290,324];
      this.bigDigitSize = [13,9,14,13,13,13,13,13,15,13,15,18,15];
      this.bigDigitPos = [0,13,22,36,49,62,75,88,101,115,128,137,156,173];
      this.smallDigitSize = [9,6,10,9,8,9,9,9,9,9,13];
      this.smallDigitPos = [0,9,15,25,34,42,51,60,69,78,87];
      this.bigSize = {
        width:13,
        height:19
      };
      this.size = {
        width:32,
        height:41
      };
      this.smallSize = {
        width:9,
        height:11
      };
      this.frame = 0;
    };
    sceneManager.sprite.prototype.init = function(img){
      this.image = img;
      this.character = this.setCharacter();
    };
    sceneManager.sprite.prototype.setCharacter=function(){
        var man1 = new sprite(this.image,this.size.width,this.size.height,0,0,this.frame,100,1);
        return man1;
    };
    sceneManager.sprite.prototype.drawCharacter=function(sceneNumber,position,size,pos){
         if(size==="middle"){
          this.displayAnimatedSprites(sceneNumber,position);
         }else if(size==="big"){
          this.bigAnimatedSprites(sceneNumber,position,pos);
         }else if(size==="rank"){
          this.rankAnimatedSprites(sceneNumber,position,pos);
         }else{
          this.smallAnimatedSprites(sceneNumber,position,pos);
         }

    };
    sceneManager.sprite.prototype.displayAnimatedSprites=function(currentScene,position){
        var cScene = currentScene;
        if(position === 10){
          this.character.setPosition(this.sceneManager.canvas.width/2-32,this.sceneManager.canvas.height/2); // character opsition in canvas
        }else if(position===1){
          this.character.setPosition(this.sceneManager.canvas.width/2,this.sceneManager.canvas.height/2);
        }else{
          this.character.setPosition(this.sceneManager.canvas.width/2+32,this.sceneManager.canvas.height/2);
        }
        this.character.draw(this.sceneManager.context,this.middleDigitSize[cScene],this.size.height,this.middleDigitPos[cScene],0);
    };
    sceneManager.sprite.prototype.bigAnimatedSprites=function(currentScene,position,pos){
        var cScene = currentScene;
        if(position === 100){
          this.character.setPosition(pos.x,pos.y); // character opsition in canvas
        }else if(position===10){
          this.character.setPosition(pos.x,pos.y);
        }else if(position===1){
          this.character.setPosition(pos.x,pos.y);
        }else{
          this.character.setPosition(pos.x,pos.y);
        }
        this.character.draw(this.sceneManager.context,this.bigDigitSize[cScene],this.bigSize.height,this.bigDigitPos[cScene],0);
    };
    sceneManager.sprite.prototype.smallAnimatedSprites=function(currentScene,position,pos){
        var cScene = currentScene;
        if(position === 100){
          this.character.setPosition(pos.x,pos.y); // character opsition in canvas
        }else if(position===10){
          this.character.setPosition(pos.x,pos.y);
        }else if(position===1){
          this.character.setPosition(pos.x,pos.y);
        }else{
          this.character.setPosition(pos.x,pos.y);
        }
        this.character.draw(this.sceneManager.context,this.smallDigitSize[cScene],this.smallSize.height,this.smallDigitPos[cScene],0);
    };
    sceneManager.sprite.prototype.rankAnimatedSprites=function(currentScene,position,pos){
        var cScene = currentScene;
        this.character.setPosition(pos.x,pos.y);
        this.character.draw(this.sceneManager.context,82,98,82*position,0);
    };
    sceneManager.resourceManager = function(sceneManager){
          this.sceneManager = sceneManager;
          this.ops = sceneManager.ops;
          this.ball = sceneManager.ball;
          this.player = sceneManager.player;
          this.pitcher = sceneManager.pitcher;

      };
      sceneManager.resourceManager.prototype.loadResource=function(){
              var that = this.sceneManager;
              that.image.onload=function(){

              };
              that.largeNumSprite.onload = function(){
                that.bigDigit.init(that.largeNumSprite);
                that.bigDigit.setCharacter();
              };
              that.mediumNumSprite.onload = function(){
                that.middleDigit.init(that.mediumNumSprite);
                that.middleDigit.setCharacter();
              };
              that.smallNumSprite.onload = function(){
                that.smallDigit.init(that.smallNumSprite);
                that.smallDigit.setCharacter();
              };

              that.rankSprite.onload = function(){
                that.rank.init(that.rankSprite);
                that.rank.setCharacter();
              };
              that.playerImage.onload=function(){
                        that.simulator.playerReadyFlag = true;
                        that.player.init(that.playerImage);
              };
              that.ballImage.onload=function(){
                  that.simulator.ballReadyFlag = true;
                  that.ball.init(that.ballImage);
              };
              that.pitcherImage.onload=function(){
                  that.simulator.pitcherReadyFlag = true;
                  that.pitcher.init(that.pitcherImage);
              };
              that.signPanel1.onload=function(){
                that.signPanelFlag.push(0);
              };
              that.signPanel2.onload=function(){
                that.signPanelFlag.push(1);
              };
              that.signPanel3.onload=function(){
                that.signPanelFlag.push(2);
              };
              that.signPanel4.onload=function(){
                that.signPanelFlag.push(3);
              };
              that.signPanel5.onload=function(){
                that.signPanelFlag.push(4);
              };
              that.signPanel6.onload=function(){
                that.signPanelFlag.push(5);
              };
              that.signPanel7.onload=function(){
                that.signPanelFlag.push(6);
              };
              that.image.src = that.ops.fieldImage;
              that.largeNumSprite.src =this.ops.largeNumSprite;
              that.mediumNumSprite.src =this.ops.mediumNumSprite;
              that.smallNumSprite.src =this.ops.smallNumSprite;
              that.playerImage.src = this.ops.playerSprite;
              that.ballImage.src=this.ops.ballSprite;
              that.hitterLose.src =this.ops.hitterLose;
              that.hitterWin.src =this.ops.hitterWin;
              that.pitcherLose.src =this.ops.pitcherLose;
              that.pitcherWin.src =this.ops.pitcherWin;
              that.cancelBtn.src =this.ops.cancelBtn;
              that.hitbtnImage.src =this.ops.hitbtnImage;
              that.hitterEnemy.src =this.ops.hitterEnemy;
              that.hitterLeft.src =this.ops.hitterLeft;
              that.rankSprite.src =this.ops.rankSprite;
              that.hitterMultiInfo.src =this.ops.hitterMultiInfo;
              that.multiPitcherPanel.src =this.ops.multiPitcherPanel;
              that.pitcherInfo.src =this.ops.pitcherInfo;
              that.pitcherPlayerSprite.src =this.ops.pitcherPlayerSprite;
              that.playBallImage.src =this.ops.playBallImage;
              that.strikeImage.src =this.ops.strikeImage;
              that.pitcherEndPanel.src  =this.ops.pitcherEndPanel;
              that.enempitcherHitImg.src =this.ops.enempitcherHitImg;
              that.enempitcherStrike.src =this.ops.enempitcherStrike;
              that.playerhitterHitImg.src =this.ops.playerhitterHitImg;
              that.playerhitterMiss.src =this.ops.playerhitterMiss;
              that.pitcherinfoImg.src=that.ops.pitcherinfoImg;
              that.playerisPitcherPanel.src=that.ops.playerisPitcherImg;
              that.resultCheckbtn.src=that.ops.resultPanelcheckbtn;
              that.resultPanel.src=that.ops.resultPanelImage;
              that.homerunEffect.src=that.ops.homerunEffectImg;
              that.homerunPanel.src=that.ops.homerunPanelImg;
              that.Icon.out.src=that.ops.outImage;
              that.Icon.homerun.src=that.ops.homerunImage;
              that.missMessage.src=that.ops.missImage;
              that.batterinfo.src=that.ops.batterinfoImage;
              that.hitterisPlayer.src=that.ops.hitterisPlayerImage;
              that.strikeZon.src=that.ops.strikeZonImage;
              that.strikeIconImage.src=that.ops.strikeIconImage;
              that.hitImage.src=that.ops.hitImage;
              that.pitcherImage.src=this.ops.pitcherSprite;
              that.flashImage.src = this.ops.flashImage;
              that.scene2Image.src=this.ops.scene2Image;
              that.balltypeImage.fastball.src=this.ops.fastballImage;
              that.balltypeImage.slider.src=this.ops.sliderImage;
              that.balltypeImage.curve.src=this.ops.curveImage;
              if(this.ops.signPanel1!=="undefined"){
                that.signPanel1.src=this.ops.signPanel1;
              }
              if(this.ops.signPanel2!=="undefined"){
                that.signPanel2.src=this.ops.signPanel2;
              }
              if(this.ops.signPanel3!=="undefined"){
                that.signPanel3.src=this.ops.signPanel3;
              }
              if(this.ops.signPanel4!=="undefined"){
                that.signPanel4.src=this.ops.signPanel4;
              }
              if(this.ops.signPanel5!=="undefined"){
                that.signPanel5.src=this.ops.signPanel5;
              }
              if(this.ops.signPanel6!=="undefined"){
                that.signPanel6.src=this.ops.signPanel6;
              }
              if(this.ops.signPanel7!=="undefined"){
                that.signPanel7.src=this.ops.signPanel7;
              }
              that.addEvent();
      };

     window.sceneManager = sceneManager;
}(jQuery,window,document));