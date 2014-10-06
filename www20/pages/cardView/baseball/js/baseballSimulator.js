(function($,window,document,undefined){

    function baseballSimulator(){

          this.typeNum = null;
          this.pitcherModeStartFlag = false;
          this.ballTypeSelectedFlag = false;
          this.ballPosSelectedFlag = false;
          this.pitcherGameInitFlag = false;
          this.gameStartFlag = false;
          this.drawBallPosFlag = false;
          this.timeoutOn = false;
          this.maxFrame = 0;
          this.pitcherGameEndFlag = false;
          this.clearArcFlag = false;
          this.selectType = 0;
          this.failFlag = false;
          this.startGameEndingFlag = false;
          this.gameCounter = 0;
          this.balltype = [];
          this.point = null;
          this.playerFrame = 0;
          this.pitcherFrame = 0;
          this.ballFrame = 0;
          this.pitcherDepth = 100;
          this.scene2 = null;
          this.playMode = null;
          this.getOffsetFlag = false;
          this.frameRate = 15;
          this.playerDrawFlag = true;


          this.drawedBallPos = {
            x:0,
            y:0
          };
          this.start={
              x:406,
              y:237
          };
          this.targetPos={
            x:0,
            y:0
          };
          this.currentBallPos = {
              x:0,
              y:0
          };
          this.batPos = {
              x:160,
              y:148,
              dX:230,
              dy:158
          };
          this.strikeZonPos ={
              startX:296,
              startY:330,
              endX:296+53,
              endY:330+53
          };
          this.flyingballPos = {
              x:0,
              y:0
          };
          this.scene2BallPos = {
            x:[],
            y:[]
          };
          this.swingCounter = 0;
          //game's flag
          this.gameReadyFlag = false;
          this.gameEndFlag = false;
          this.backgroundReadyFlag = false;
          this.pitcherReadyFlag = false;
          this.playerReadyFlag = false;
          this.ballReadyFlag = false;
          //player flag
          this.swingFlag = false;
          this.pitcherFlag = false;
          this.stopFlag = false;
          this.endSwingFlag = false;
          this.hitFlag = false;
          this.flashFlag = false;
          //pitcher flag
          this.pitchStartFlag = false;
          this.pitchEndFlag = false;
          //ball flag
          this.pitchingStartFlag = false;
          this.balldrawFlag = false;
          this.notScene2 = false;
          this.chooseBallPosFlag = false;
          this.screenWidth = null;

          this.ball = null;
          this.player = null;
          this.pitcher = null;
          this.client = null;

          this.playMode = "hitter";
    }
    baseballSimulator.prototype={
        //시뮬레이션 초기화.
        init:function(mode,client,screenWidth){

          this.ball = new baseballSimulator.ball();
          this.screenWidth = screenWidth;
          // this.ball.initResolution(this.screenWidth);
          this.playMode = mode;
          this.balltype.push("fastball");
          this.balltype.push("slider");
          this.balltype.push("curve");
          console.log("init in simulator");
          this.ballMovesArray = [];
          this.client = client;
        },
        //pitcher frame에 따른 동작 관리.
        updatePitcher:function(){

               if(this.pitchStartFlag){
                    this.pitcherFrame++;
               }
               if(this.pitcherFrame>9){
                    this.pitchStartFlag = false;
                    this.stopFlag = true;
               }
               if(this.pitcherFrame===0){
                  this.failFlag = this.ball.init(this.client.mode,this.targetPos);
                  this.client.failFalg = this.failFalg;
                  if(this.client.mode==="hitter"){
                    this.targetPos = this.ball.getTargetPos();
                    this.typeNum = this.getRandomInt(0,2);
                    // this.typeNum = 2;
                  }else{
                    this.typeNum = this.selectType;
                  }
                  if(this.client.mode==="hitter"){
                    this.getBallPosition();
                    this.pitchStartFlag = true;
                  }else{
                    if(this.chooseBallPosFlag){
                      this.getBallPosition();
                      this.pitchStartFlag = true;
                    }
                  }

               }

        },
        //hitter frame에 따른 동작정리
        updatePlayer:function(){
             if(this.swingFlag){
                this.playerFrame++;
             }
             if(this.playerFrame >9){

             }
             if(this.playerFrame>11){
                // this.player.setDrawFlag(false);
                this.playerDrawFlag = false;
                // this.swingFlag = false;
                this.flashFlag = false;
                this.client.swingCounter = 1;
             }
        },
        //ball frame에 따른 동작정리와 공이 날라가는 타이밍, 모션 정리
        updateBall:function(){
             var that = this;
            if(this.pitcherFrame>5){
                  this.pitchingStartFlag = true;
                  this.balldrawFlag = true;
                  this.client.ballPos = this.ballMovesArray;
            }
            if(this.client.mode==="hitter"){
               if(this.ballFrame === this.maxFrame){
                  this.pitchingStartFlag = false;
                  if(!this.hitFlag){
                    this.notScene2 = true;
                  }else{
                    this.endGame();
                    console.log("end game");
                  }
               }else if(this.ballFrame > this.maxFrame - 2){
                  if(this.playerFrame>8 && this.playerFrame<11){
                       if(this.failFlag){
                         this.scene2BallPos = this.ball.getMovingPosition("late");
                         this.client.hitResult = "late";
                         this.hitFlag = true;
                         this.flashFlag = true;
                         this.gameEndFlag = true; // 공을 쳤고 2번째 씬으로 넘어감 넘어감
                         console.log("swing counter is ok");
                        }
                  }else if( this.playerFrame>4 && this.playerFrame < 8){
                      //perfect hit
                       if(this.failFlag){
                      this.scene2BallPos = this.ball.getMovingPosition("perfact");
                      this.client.hitResult = "perfect";
                      this.hitFlag = true;
                      this.flashFlag = true;
                      this.gameEndFlag = true;// 공을 쳤고 2번째 씬으로 넘어감 넘어감
                      console.log("swing counter is ok");
                    }
                  }else if(this.playerFrame > 2 && this.playerFrame < 4){
                      //fast hit
                    if(this.failFlag){
                      this.scene2BallPos = this.ball.getMovingPosition("fast");
                      this.client.hitResult = "fast";
                      this.hitFlag = true;
                      this.flashFlag = true;
                      this.gameEndFlag = true;// 공을 쳤고 2번째 씬으로 넘어감 넘어감
                      console.log("swing counter is ok");
                    }
                  }else{
                      console.log("no hit");
                  }
               }
            }else{
                  if(this.ballFrame===this.maxFrame-1 && this.ballFrame!==0){
                    this.pitchingStartFlag = false;
                    this.clearArcFlag = true;
                    if(this.playerFrame>7){
                      this.hitFlag = true;
                      if(this.client.getPitchingResult(this.client)==="strike"){
                        this.flashFlag = true;
                      }

                    }
                    this.gameEndFlag = true;
                  }

                }
            if(this.pitchingStartFlag){
                // setInterval(20);
                this.ballFrame++;
                this.client.ballFrame++;
                this.client.frameRate += 2;
                this.client.intervalTime = 1000/this.client.frameRate;
                this.client.stopInterval(this.client.interval);
                this.client.startInterval();
            }


        },
        //util적 요소로 랜덤값을 불러오도록 하는 함수
        getRandomInt:function(min, max) {
              return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        getBallPosition:function(){
            if(this.typeNum===0){
                  this.maxFrame = 14;
                  this.client.maxFrame = 14;
                  this.ballMovesArray = this.ball.getFastBallPosArray(this.playMode,this.targetPos);
            }else if(this.typeNum===1){
                  this.maxFrame = 13;
                  this.client.maxFrame = 13;
                  this.ballMovesArray = this.ball.getSliderBallPosArray(this.playMode,this.targetPos);
            }else if(this.typeNum===2){
                  this.maxFrame = 13;
                  this.client.maxFrame = 13;
                  this.ballMovesArray = this.ball.getCurveBallPosArray(this.playMode,this.targetPos);
            }
        },
        //공이 날아갔을때 게임 종료
        endGame:function(){
              if(this.currentBallPos.x> 431 && this.currentBallPos.y<17){
                this.gameEndFlag = true;
              }
        },
        //value값을 정리, 게임 재시작
        initVal:function(mode,ops){
          this.ops = ops;
          this.typeNum = null;
           this.pitcherModeStartFlag = false;
          this.ballTypeSelectedFlag = false;
          this.ballPosSelectedFlag = false;
          this.pitcherGameInitFlag = false;
          this.gameStartFlag = false;
          this.drawBallPosFlag = false;
          this.timeoutOn = false;
          this.chooseBallPosFlag= false;
          this.drawedBallPos = {
            x:0,
            y:0
          };
          // this.maxFrame = 0;
          this.gameCounter = 0;
          this.pitcherGameEndFlag = false;
          this.clearArcFlag = false;
          this.selectType = 0;

          this.failFlag = false;
          this.startGameEndingFlag = false;
          this.balltype = [];
          this.point = null;
          this.playerFrame = 0;
          this.pitcherFrame = 0;
          this.ballFrame = 0;
          this.pitcherDepth = 100;

          this.scene2 = null;
          this.playMode = null;
          this.getOffsetFlag = false;
          this.frameRate = 15;
          this.playerDrawFlag = true;

          this.myWidth = window.innerWidth;
          this.myHeight = window.innerHeight;
          this.myWidthRatio = this.myWidth / 640;
          this.myHeightRatio = this.myHeight / 480;

          this.start={
              x:305,
              y:100
          };
          this.targetPos={
            x:0,
            y:0
          };
          this.target = null;
          this.currentBallPos = {
              x:0,
              y:0
          };
          this.strikeZonPos ={
              startX:296,
              startY:330,
              endX:296+53,
              endY:330+53
            };
          this.swingCounter = 0;
          //game's flag
          this.gameReadyFlag = false;
          this.gameEndFlag = false;
          this.backgroundReadyFlag = false;
          this.pitcherReadyFlag = false;
          this.playerReadyFlag = false;
          this.ballReadyFlag = false;
          //player flag
          this.swingFlag = false;
          this.pitcherFlag = false;
          this.stopFlag = false;
          this.endSwingFlag = false;
          this.hitFlag = false;
          this.flashFlag = false;
          //pitcher flag
          this.pitchStartFlag = false;
          this.pitchEndFlag = false;
          //ball flag
          this.pitchingStartFlag = false;
          this.balldrawFlag = false;
          this.notScene2 = false;
          this.client.frameRate = 15;
          this.client.intervalTime = 1000/this.client.frameRate;
          // this.client.initGame(mode,ops);
          this.client.startInterval();
        }


    };
  baseballSimulator.ball = function(){
        this.targetPoint={
            startX:280,
              startY:320,
              endX:343,
              endY:383
          };
         this.curvePoint ={
            startX:276,
            startY:400,
            endX:276+73,
            endY:400+30
         };
          this.target={
            x:0,
            y:0
          };
          this.strikeZonPos ={
              startX:296,
              startY:330,
              endX:296+40,
              endY:330+40
          };
          this.unit = {
            x:0,
            y:0
          };
          this.movesPos ={
            x:0,
            y:0
          };
          this.curvePos={
            x1:0,
            y1:0,
            x2:0,
            y2:0
          };
          this.sliderPos={
            x1:0,
            y1:0,
            x2:0,
            y2:0
          };
          this.startPos={
            x:295,
            y:191
          };
          this.distance = 0; // distance
          this.speed = 12; //distance까지 몇번의 움직임으로 그릴것인지.
          this.move = 0; // 한번움직일때마다 얼마씩 이동해야하는지.
          this.angle = 35;
          this.zoomLevel = 0.01;
          this.finalZoomLevel = 0;

           this.myWidth = window.innerWidth;
          this.myHeight = window.innerHeight;
          this.myWidthRatio = this.myWidth / 640;
          this.myHeightRatio = this.myHeight / 480;

  };
  baseballSimulator.ball.prototype={
        init:function(playMode,targetPos,screenWidth){
            var target = 0;   //타겟 위치를 잡음
            var flag = false; //볼
            if(playMode==="hitter"){
              target = this.calcTargetCoordinates(this.targetPoint);
            }else{
              target = targetPos;
              this.target.x = target.x;
              this.target.y = target.y;
            }
            target.x = target.x+12;
            target.y = target.y+11;
            if(target.x>=this.strikeZonPos.startX&&target.x<=this.strikeZonPos.endX){
              if(target.y>=this.strikeZonPos.startY&&target.y<=this.strikeZonPos.endY){
                  flag = true; // 스트라이크
              }
            }
            console.log("flag : " + flag);
            console.log("strike x :" + this.strikeZonPos.startX + "+ 53 " + "target y :" + this.strikeZonPos.startY + "+ 53");
            console.log("target x :" + target.x + "target y :" + target.y);
            return flag;
        },
        initResolution:function(screenWidth){

            this.targetPoint.startX = this.targetPoint.startX * this.myWidthRatio;
            this.targetPoint.startY = this.targetPoint.startY * this.myHeightRatio;
            this.targetPoint.endX = this.targetPoint.endX * this.myWidthRatio;
            this.targetPoint.endY = this.targetPoint.endY * this.myHeightRatio;

            this.curvePoint.startX = this.curvePoint.startX * this.myWidthRatio;
            this.curvePoint.startY = this.curvePoint.startY * this.myHeightRatio;
            this.curvePoint.endX = this.curvePoint.endX * this.myWidthRatio;
            this.curvePoint.endY = this.curvePoint.endY * this.myHeightRatio;

            this.strikeZonPos.startX = this.strikeZonPos.startX * this.myWidthRatio;
            this.strikeZonPos.startY = this.strikeZonPos.startY * this.myHeightRatio;
            this.strikeZonPos.endX = this.strikeZonPos.endX * this.myWidthRatio;
            this.strikeZonPos.endY = this.strikeZonPos.endY * this.myHeightRatio;


        },
        calcTargetCoordinates:function(pos){

              this.target.x = this.getRandomInt(pos.startX,pos.endX);
              this.target.y = this.getRandomInt(pos.startY,pos.endY);

              return this.target;
        },
        getRandomInt:function(min, max) {

            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
          //도록 회전공식을 이용해 작업할 수 있도록 한다.
          //fastball, curve, slider 에 대해서
        getFastBallPosArray:function(playMode,targetPos){
            var ballPos = {
                x:[],
                y:[]
            };
            if(playMode==="pitcher"){
              this.target = targetPos;
            }
            this.movesPos.x = this.startPos.x;
            this.movesPos.y = this.startPos.y;

            ballPos.x.push(this.startPos.x);
            ballPos.y.push(this.startPos.y);

            this.getDistance();
            this.getMoves();
            this.getUnitsMove();

            for(var i = 0; i<this.speed;i++){
              this.movesPos.x += this.unit.x;
              this.movesPos.y += this.unit.y;
              ballPos.x.push(this.movesPos.x);
              ballPos.y.push(this.movesPos.y);
            }
            ballPos.x.push(this.target.x);
            ballPos.y.push(this.target.y);
            return ballPos;
        },
        getCurveDistance:function(playMode){
          var halfDistance = 0,
                moves = 0,
                mode=0;
          if(playMode==="hitter"){
            this.calcTargetCoordinates(this.curvePoint);
          }

            halfDistance = parseInt((this.target.y - this.startPos.y)/2 + this.startPos.y,10);

            this.curvePos.y1 = halfDistance - 20;
            this.curvePos.y2 = halfDistance - 20;
            this.curvePos.x1 = this.startPos.x;
            this.curvePos.x2 = this.target.x;
        },
        getCurveBallPosArray:function(playMode,targetPos){
           var ballPos = {
                      x:[],
                      y:[]
                },
                move = 0,
                drawPos = {
                      x:0,
                      y:0
                };
            if(playMode==="pitcher"){
              this.target = targetPos;
            }
            this.getCurveDistance(playMode);
            var ax=0,bx=0,cx=0,ay=0,by=0,cy=0,xt=0,yt=0,speed = 0.08;

            for(var i=0;i<this.speed;i++){
              cx = 3 * (this.curvePos.x1 - this.startPos.x);
              bx = 3 * (this.curvePos.x2 - this.curvePos.x1) - cx;
              ax = this.target.x - this.startPos.x - cx - bx;

              cy = 3 * (this.curvePos.y1 - this.startPos.y);
              by = 3 * (this.curvePos.y2 - this.curvePos.y1) - cy;
              ay = this.target.y - this.startPos.y - cy - by;

              xt = ax * (move*move*move) + bx * (move*move) + cx*move + this.startPos.x;
              yt = ay * (move*move*move) + by * (move*move) + cy*move + this.startPos.y;

              drawPos.x = xt;
              drawPos.y = yt;

              ballPos.x.push(drawPos.x);
              ballPos.y.push(drawPos.y);

              move += speed;
            }
            ballPos.x.push(this.target.x);
            ballPos.y.push(this.target.y);

            return ballPos;
        },
        getSliderDistance:function(){
           var halfDistance = 0,
                moves = 0,
                mode=0;
            halfDistance = parseInt((this.target.y - this.startPos.y)/2 + this.startPos .y,10);

            this.sliderPos.y1 = this.startPos.y + 30;
            this.sliderPos.y2 = this.target.y;
            this.sliderPos.x1 = this.startPos.x ;
            this.sliderPos.x2 = this.target.x - 30;
        },
        getSliderBallPosArray:function(playMode,targetPos){
           var ballPos = {
                      x:[],
                      y:[]
                },
                move = 0,
                drawPos = {
                      x:0,
                      y:0
                };

            if(playMode==="pitcher"){
              this.target = targetPos;
            }
            this.getSliderDistance();
            var ax=0,bx=0,cx=0,ay=0,by=0,cy=0,xt=0,yt=0,speed = 0.08;


            for(var i=0;i<this.speed;i++){
              cx = 3 * (this.sliderPos.x1 - this.startPos.x);
              bx = 3 * (this.sliderPos.x2 - this.sliderPos.x1) - cx;
              ax = this.target.x - this.startPos.x - cx - bx;

              cy = 3 * (this.sliderPos.y1 - this.startPos.y);
              by = 3 * (this.sliderPos.y2 - this.sliderPos.y1) - cy;
              ay = this.target.y - this.startPos.y - cy - by;

              xt = ax * (move*move*move) + bx * (move*move) + cx*move + this.startPos.x;
              yt = ay * (move*move*move) + by * (move*move) + cy*move + this.startPos.y;

              drawPos.x = xt;
              drawPos.y = yt;

              ballPos.x.push(drawPos.x);
              ballPos.y.push(drawPos.y);

              move += speed;
            }
            ballPos.x.push(this.target.x);
            ballPos.y.push(this.target.y);

            return ballPos;
        },
        getMoves:function(){
              this.moves = this.distance/this.speed;
              return this.moves;
        },
        getTargetPos:function(){
            return this.target;
        },
        getUnitsMove:function(){
            this.unit.x = (this.target.x - this.startPos.x) / this.moves;
            this.unit.y = (this.target.y - this.startPos.y) / this.moves;
        },
        getDistance:function(){
          var dx = this.target.x - this.startPos.x;
          var dy = this.target.y - this.startPos.y;

          var distance = Math.sqrt((dx*dx)+(dy*dy));
          this.distance = distance;
        },
        getFarDistance:function(hittingPoint){

          var secondStartPos = {
              x:470,
              y:460
          };
          var secondTargetPos = {
              x:0,
              y:0
          };
          if(hittingPoint === "perfect"){
              //두번째 경기장에서 어디까지 날아갈 것인가
              secondTargetPos.x = this.getRandomInt(0,640);
              secondTargetPos.y = this.getRandomInt(0,237);

          }else if(hittingPoint === "fast"){
              secondTargetPos.x = this.getRandomInt(61,500);
              secondTargetPos.y = this.getRandomInt(270,370);

          }else if(hittingPoint === "late"){
              secondTargetPos.x = this.getRandomInt(61,500);
              secondTargetPos.y = this.getRandomInt(270,370);
          }else{
            console.log("miss swing");
          }


          return secondTargetPos;
        },
        getMovingPosition:function(hittingPoint){
            var dx,dy,distance,speed=10,moves;
            var ballPos = {
                x:[],
                y:[]
            };

            var movingPos = {
                x:0,
                y:0
            };
            var unitPos = {
              x:0,
              y:0
            };
            var movePos = {
              x:0,
              y:0
            };
            var secondStartPos = {
              x:470,
              y:460
            };
            movingPos = this.getFarDistance(hittingPoint);
            ballPos.x.push(470);
            ballPos.y.push(460);
            movePos = secondStartPos;
            dx = movingPos.x - secondStartPos.x;
            dy = movingPos.y - secondStartPos.y;
            distance = Math.sqrt((dx*dx) + (dy*dy));
            moves = distance/speed;
            unitPos.x = (movingPos.x - 470) / moves;
            unitPos.y = (movingPos.y - 460) / moves;
            for(var i = 0; i<this.speed;i++){
              movePos.x += unitPos.x;
              movePos.y += unitPos.y;
              ballPos.x.push(movePos.x);
              ballPos.y.push(movePos.y);
            }
            ballPos.x.push(movingPos.x);
            ballPos.y.push(movingPos.y);
            return ballPos;
        }


  };
  baseballSimulator.gameManager = function(mode){
    this.gameCounter = 0;
    this.distanceCount = 0;
    this.homerunCount = 0;
    this.distanceArray = [];
    this.gameResult = [];
    this.playMode = mode;
    if(this.playMode === "hitter"){
      this.maxGame = 5;
    }else{
      this.maxGame = 9;
    }
  };
  baseballSimulator.gameManager.prototype.setDistance = function(distance){
      this.distanceCount += distance;
  };
  baseballSimulator.gameManager.prototype.getDistance = function(){
        return this.distanceCount;
  };
  baseballSimulator.gameManager.prototype.setResult = function(result){
        var pos = this.gameResult.length;
        if(this.gameResult.length >this.maxGame){
          return;
        }
        this.gameResult[pos] = result;
        this.setGameCount();
  };
  baseballSimulator.gameManager.prototype.getResult = function(wantData){
       var type = typeof wantData,
           count = 0;
       if(type === "undefined"){
          return this.gameResult;
       }else{
          for(var i =0; i<this.gameResult.length;i++){
              if(this.gameResult[i] === wantData){
                  count++;
              }
            }
            return count;
       }

  };
  baseballSimulator.gameManager.prototype.setGameCount = function(){
      this.gameCounter++;
  };
  baseballSimulator.gameManager.prototype.getGameCount = function(){
       return this.gameCounter;
  };

  window.baseballSimulator = baseballSimulator;
}(jQuery,window,document));

