
define('ocb/main', ['pwge/game', 'ocb/cashpang', 'ocb/resource'], function(Game, Cashpang, resource) {
    var planetWebview = false;
    var ua = window.navigator.userAgent;
    var game = new Game({
        container : window,
        canvas : document.getElementById("cashpangCanvas"),
        resolution : {
            quality : "high",
            width : 1080,
            height : 1350
        },
        viewport : (planetWebview) ? "default" : "scale_to_fit",
        clearCanvasOnEveryFrame : false,
        planetWebview : false,
        viewportAlign : {
            vertical : "top",
            horizontal: "center"
        },
        quality : "low",
        maxQuality : "mid"
    });


    var cashpang = new Cashpang({
        game : game
    });

    if (DEBUG) {
        window.cashpang = cashpang;
    }

    //boards
    var playBgBoard = game.boardManager.makeBoard("playBgBoard");
    var playBoard = game.boardManager.makeBoard("playBoard", {offsetY: 252});
    var playFgBoard = game.boardManager.makeBoard("playFgBoard");
    var headerBoard = game.boardManager.makeBoard("headerBoard");
    var scoreBoard = game.boardManager.makeBoard("scoreBoard");
    var endBoard = game.boardManager.makeBoard("endBoard");

    //scenes
    game.renderer.makeScene("playScene",["playBgBoard", "playBoard", "playFgBoard", "headerBoard"]);
    game.renderer.makeScene("endScene", ["endBoard"]);

    //entities
    //play
    var i, len;
    var headerBackground = game.entityPool.allocate({
        x: 0,
        y: 0,
        width: 1080,
        height: 238
    }).addTo("headerBoard");
    var comboBox = game.entityPool.allocate({
        x: 0,
        y: 0,
        width: 458,
        height: 148
    }).addTo("headerBoard").disable();

    var timer = game.entityPool.allocate({
        x: 63,
        y: 162,
        width: 942,
        height: 56
    }).addTo("headerBoard");

    var noPossibleMsg = game.entityPool.allocate({
        x: 140,
        y: 360,
        width: 808,
        height: 433
    }).addTo("headerBoard").disable();

    var comboArray = ["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"];

    var combos = [];
    for(i = 0; i < 2; i++){
        combos.push(game.entityPool.allocate({
            x: 82 + (50) * i,
            y: 20,
            width: 50,
            height: 60
        }).addTo("headerBoard").disable());
    }
    var animateCombo = function (entity) {
        var inAnimation = {
                duration : 70,
                from: {
                    scaleX: 0.8,
                    scaleY: 0.8
                },
                to: {
                    scaleX: 1.1,
                    scaleY: 1.1
                },
                easing : {
                    scaleX : "easeInQuad",
                    scaleY : "easeInQuad",
                },
                callback : function() {
                    entity.animate(outAnimation);
                }
            },
            outAnimation = {
                duration: 30,
                from: {
                    scaleX: 1.1,
                    scaleY: 1.1
                },
                to: {
                    scaleX: 1,
                    scaleY: 1
                },
                easing: {
                    scaleX: "easeInQuad",
                    scaleY: "easeInQuad"
                }
            };

        // entity.anchorX = entity.x + entity.width/2;
        // entity.anchorY = entity.y + entity.height/2;
        entity.enable().animate(inAnimation);

    };

    var setCombo = function() {
        var currCombo = Math.min(99, cashpang.getCombo());
        combos[0].applySprite(comboArray[Math.floor(currCombo/10)]);
        combos[1].applySprite(comboArray[currCombo%10]);

        comboBox.enable();

        animateCombo(combos[0].enable());
        animateCombo(combos[1].enable());
    };

    var hideCombo = function() {
        comboBox.disable();
        combos[0].disable();
        combos[1].disable();
    };

    // timerTextCanvas.width = 80;
    // timerTextCanvas.height = 50;
    var times = [];

    for(i = 0; i < 2; i++) {
        times.push(game.entityPool.allocate({
            x: 505 + 35 *i,
            y: 162,
            width: 35,
            height: 42
        }).addTo("headerBoard"));
    }
    var drawTimerText = function(t) {
        times[0].setBaseSprite("t"+ Math.floor(t/10));
        times[1].setBaseSprite("t"+ t%10);
    };

    var stopHeaderBoard = function(duration) {
        headerBoard.pause();
        setTimeout(function() {
            headerBoard.resume();
        }, duration || cashpang.animationDuration);
    };

    var showNoPossibleMsg = function(duration) {
        noPossibleMsg.enable();
        game.soundManager.playSound("suffle");
        setTimeout(function() {
            noPossibleMsg.disable();
        }, duration || 1500);
    };

    var timerText = game.entityPool.allocate({
        x: (game.viewport.designWidth/2 - 50) ,
        y: 138,
        width: 240,
        height: 150
    }).addTo("headerBoard");

    var endCalled = false;
    timer.step = function(dt) {
        if (!timer.sprite) {
            return;
        }
        var r = dt % 1000;
        dt -= r;

        timer.width = Math.max(942 * (60000 - dt) / 60000, 0);
        // console.log(game.viewport.imageRatio, )
        timer.sprite.width = Math.max(942 * game.viewport.imageRatio * (60000 - dt) / 60000, 0);
        // console.log(timer.width, timer.sprite.width)
        drawTimerText(Math.min(60, Math.max( (60000 - dt) / 1000, 0)));
        // timerText.setBaseSprite("timeText");
    };

    var playBackground = game.entityPool.allocate({
        x: 0,
        y: 238,
        width: 1080,
        height: 1112,
    }).addTo("playBgBoard");

    var flashBackground = game.entityPool.allocate({
        x: 0,
        y: 238,
        width: 1080,
        height: 1112,
    }).addTo("playBgBoard").disable();

    var ready = game.entityPool.allocate({
        x: 0,
        y: 0,
        width: 1080,
        height: 1350
    }).addTo("playFgBoard").disable();

    var go = game.entityPool.allocate({
        x: 0,
        y: 0,
        width: 1080,
        height: 1350
    }).addTo("playFgBoard").disable();

    var gameover = game.entityPool.allocate({
        x: 0,
        y: 0,
        width: 1080,
        height: 1350
    }).addTo("headerBoard").disable();

    var lastpang = game.entityPool.allocate({
        x: 0,
        y: 0,
        width: 1080,
        height: 1350
    }).addTo("headerBoard").disable();

    var scores = [];
    for (i = 0, len = 7; i < len; i++) {
        scores.push(game.entityPool.allocate({
            x: (game.viewport.designWidth - len * 52 - 65) + (52 * i),
            y: 35,
            width: 60,
            height: 90
        }).addTo("headerBoard"));
    }

    var numArray = ["zero","one","two","three","four","five","six","seven","eight","nine"];
    var scoreControllerEntity = game.entityPool.allocate().addTo("headerBoard"); //화면에 보이지않는 엔티티
    scoreControllerEntity.step = function(dt){
        var score = cashpang.getScore(),
            a = score.toString().split("");

        for (var i = 0; i < a.length; i++) {
            scores[i + (scores.length - a.length)].setBaseSprite(numArray[a[i]]);
        }
    };
    var flashInAnimation = function() {
        if(endCalled) {
            flashBackground.opacity = 0;
            flashBackground.disable();
            return;
        }
        flashBackground.animate({
            duration: 300,
            from: {
                opacity: 0
            },
            to: {
                opacity: 0.2
            },
            easing: {
                opacity: "linear"
            },
            callback: flashOutAnimation
        });
    };

    var flashOutAnimation = function() {
        if(endCalled) {
            flashBackground.opacity = 0;
            flashBackground.disable();
            return;
        }
        flashBackground.animate({
            duration: 300,
            from: {
                opacity: 0.2
            },
            to: {
                opacity: 0
            },
            easing: {
                opacity: "linear"
            },
            callback:flashInAnimation
        });

    };

    var playTimeline = [
        [0, function(start,now){
            headerBoard.pause();
            ready.enable();
            game.soundManager.playSound("ready");
        }],
        [1500, function(start,now){
            ready.disable();
            go.enable();
            game.soundManager.playSound("start");
        }],
        [2000,function(start,now){
            go.disable();
            cashpang.start();
            headerBoard.resume();
        }]
    ];

    var headerTimeline = [
        [50000, function(start, now) {
            // if (!game.runtime.planetWebview) {
                flashBackground.enable();
                flashInAnimation();
            // }
            game.soundManager.stopMusic("play");
            game.soundManager.playMusic("countdown", true);
        }],
        // 60s 종료
        [60000,function(start,now){
            console.log("end game");
//            game.trigger("lastpang");
            game.trigger("end");

//            endCalled = true;
//            gameover.enable().animate({
//                duration: 300,
//                from: {
//                    x: lastpang.x
//                },
//                to: {
//                    x: gameover.x
//                },
//                easing: {
//                    x: "easeInQuad"
//                }
//            });
//
//            go.disable();
//            ready.disable();
//            lastpang.disable();
//            gameover.disable();
//            game.soundManager.stopMusic("play");
//            game.soundManager.stopMusic("countdown");
//            game.soundManager.playSound("end");
//            game.renderer.switchScene("endScene", "slideInRight");



//            $("._gameCanvas").trigger("finish", cashpang.getScore());
        }]
    ];

    var endTimeline = [
        [0, function(start, now) {
            console.log("end, rendererstop");
            console.log("stop");


//            game.renderer.stop();
        }]
    ];

    //end
    var endBackground = game.entityPool.allocate({
        x: 0,
        y: 0,
        width: game.viewport.designWidth,
        height: game.viewport.designHeight,
        detectable: false
    }).addTo("endBoard");

    game.on("ready", function(e){
        headerBackground.setBaseSprite("headerBg");
        comboBox.setBaseSprite("comboBox");
        timer.setBaseSprite("Timer");
        noPossibleMsg.setBaseSprite("noPossibleMatch");
        playBackground.setBaseSprite("playBg");
        flashBackground.setBaseSprite("flashBg");
        gameover.setBaseSprite("gameOver");
        lastpang.setBaseSprite("lastpang");
        endBackground.setBaseSprite("endBg");
        ready.setBaseSprite("ready");
        go.setBaseSprite("Go");

        cashpang.on("pause", stopHeaderBoard);
        cashpang.on("no possible match", showNoPossibleMsg);
        cashpang.on("combo", setCombo);
        cashpang.on("hide combo", hideCombo);

        playBoard.timeline(playTimeline);
        headerBoard.timeline(headerTimeline);
        endBoard.timeline(endTimeline);
        game.trigger("play");
    });

    game.on("play",function(e){
        scores.forEach(function(e){
            e.setBaseSprite("zero");
        });
        endCalled = false;

        $(".popupContainer").removeClass("shown").addClass('hidden');
        game.soundManager.playMusic("play", true);
        cashpang.init(playBoard);
        game.renderer.start();
        game.renderer.switchScene("playScene", "fade");
    });

    game.on("lastpang", function(){
        gameover.disable();
        game.soundManager.playSound("lastpang");
        lastpang.enable().animate({
            duration: 200,
            from: {
                x: 500
            },
            to: {
                x: lastpang.x
            },
            easing: {
                x: "easeInQuad"
            }
        });
    });

    game.on("abort", function(){
        go.disable();
        ready.disable();
        lastpang.disable();
        gameover.disable();
        game.soundManager.stopMusic("play");
        game.soundManager.stopMusic("countdown");
        game.renderer.stop();
        cashpang.fire("abort");
    });

    game.on("end",function(){
        endCalled = true;
        gameover.enable().animate({
            duration: 300,
            from: {
                x: lastpang.x
            },
            to: {
                x: gameover.x
            },
            easing: {
                x: "easeInQuad"
            }
        });
        game.soundManager.playSound("gameover");
        game.soundManager.stopMusic("countdown");

        cashpang.end(function() {
            go.disable();
            ready.disable();
            lastpang.disable();
            gameover.disable();
            game.soundManager.stopMusic("play");
            game.soundManager.stopMusic("countdown");
            game.soundManager.playSound("end");
            game.renderer.switchScene("endScene", "slideInRight");

            $("._gameCanvas").trigger("finish", cashpang.getScore());
        });
    });

    return cashpang;
});