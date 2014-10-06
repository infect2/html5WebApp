/**
 * @preserve Alien Invations is originally developed by Pascal Ritt
 * which is found at https://github.com/cykod/AlienInvasion
 * Original MIT license is still hold for source code reuse/distribution
 */
var AlienInvasionGame = (function(){
    var self = this,
        perfOpt = {
            domBg: false,
            clearRate: -1,
            skipCnt: 0
        },
        boards = [],
        status = [],
        started = false,
        KEY_CODES = {
            37: 'left',
            39: 'right',
            32: 'fire'
        },
        OBJECT_PLAYER = 1,
        OBJECT_PLAYER_PROJECTILE = 2,
        OBJECT_ENEMY = 4,
        OBJECT_ENEMY_PROJECTILE = 8,
        OBJECT_ITEM = 16,
        OBJECT_EXPLOSION = 13,
        sprites = {
            ship: { sx: 0, sy: 0, w: 64, h: 60, sw:40, sh:40, frames: 1 },
            missile: { sx: 192, sy: 256, w: 32, h: 32, sw:24, sh:24, frames: 1 },
            enemy_missile: { sx: 224, sy: 256, w: 32, h: 32, sw:28, sh:36, frames: 1 },
            enemy_missile2: { sx: 192, sy: 288, w: 32, h: 32, sw:32, sh:32, frames: 1 },
            enemy_missile3: { sx: 224, sy: 288, w: 32, h: 32, sw:32, sh:32, frames: 1 },
            enemy_ship1: { sx: 0, sy: 64, w: 64, h: 64, sw:40, sh:40, frames: 1 },
            enemy_ship2: { sx: 64, sy: 64, w: 64, h: 64, sw:40, sh:40, frames: 1 },
            enemy_ship3: { sx: 128, sy: 64, w: 64, h: 64, sw:40, sh:40, frames: 1 },
            enemy_bee1: { sx: 0, sy: 128, w: 64, h: 64, sw:40, sh:40, frames: 1 },
            enemy_bee2: { sx: 64, sy: 128, w: 64, h: 64, sw:40, sh:40, frames: 1 },
            enemy_bug1: { sx: 128, sy: 128, w: 64, h: 64, sw:40, sh:40, frames: 1 },
            enemy_bug2: { sx: 192, sy: 128, w: 64, h: 64, sw:40, sh:40, frames: 1 },
            enemy_circle: { sx: 192, sy: 64, w: 64, h: 64, sw:32, sh:32, frames: 1 },
            enemy_boss: { sx: 256, sy: 0, w: 256, h: 226, sw:128, sh:114, frames: 1 },
            explosion: { sx: 0, sy: 320, w: 64, h: 64, sw:64, sh:64, frames: 12 },
            okcashbag: { sx: 0, sy: 192, w: 64, h: 64, sw:64, sh:64, frames: 2 }
        },
        collides = {
            enemy_boss: [
                {x:113, y:192, w:28, h:35},
                {x:99, y:170, w:58, h:43},
                {x:59, y:110, w:16, h:88},
                {x:180, y:107, w:16, h:88},
                {x:60, y:102, w:136, h:67},
                {x:27, y:3, w:202, h:100},
                {x:0, y:0, w:256, h:67}
            ],
            enemy_ship1: [
                {x:31, y:58, w:2, h:6},
                {x:29, y:54, w:6, h:4},
                {x:27, y:46, w:10, h:8},
                {x:23, y:42, w:18, h:4},
                {x:19, y:0, w:26, h:42},
                {x:0, y:16, w:64, h:23}
            ],
            enemy_ship2: [
                {x:31, y:58, w:2, h:6},
                {x:29, y:54, w:6, h:4},
                {x:27, y:46, w:10, h:8},
                {x:23, y:42, w:18, h:4},
                {x:19, y:0, w:26, h:42},
                {x:0, y:16, w:64, h:23}
            ],
            enemy_ship3: [
                {x:31, y:58, w:2, h:6},
                {x:29, y:54, w:6, h:4},
                {x:27, y:46, w:10, h:8},
                {x:23, y:42, w:18, h:4},
                {x:19, y:0, w:26, h:42},
                {x:0, y:16, w:64, h:23}
            ],
            enemy_circle: [
                {x:0, y:24, w:64, h:16},
                {x:5, y:19, w:54, h:26},
                {x:25, y:0, w:14, h:64},
                {x:20, y:4, w:24, h:56},
                {x:10, y:9, w:44, h:46}
            ],
            ship: [
                {x:0, y:8, w:64, h:29},
                {x:27, y:0, w:10, h:60},
                {x:7, y:35, w:50, h:18},
                {x:23, y:54, w:18, h:6}
            ],
            missile: [
                {x:15, y:8, w:4, h:15}
            ],
            enemy_missile: [
                {x:14, y:11, w:4, h:9}
            ],
            enemy_missile2: [
                {x:14, y:14, w:4, h:4}
            ],
            enemy_missile3: [
                {x:14, y:14, w:4, h:4}
            ]
        },
        objectProps = {
            boss:       { behavior:"enemyBoss", x: 0, y: -150, health: 2500, points: 100000, E:15, missiles : 10, missileType: "straight", missileSpeed: 400, missileReload: 5 },
            straight:   { behavior:"enemy", x: 0, y: -50, health: 10, points: 100, E: 100, missiles: 1, missileType: "straight", missileSpeed: 175, missileReload: 1 },
            ltr:        { behavior:"enemy", x: 0, y: -100, health: 10, points: 100, A: 80, B: 0, E: 150, missiles: 2, missileType: "straight", missileSpeed: 175, missileReload: 1 },
            rtl:        { behavior:"enemy", x: 280, y: -100, health: 10, points: 100, A: -80, B: 0, E: 150, missiles: 2, missileType: "straight", missileSpeed: 175, missileReload: 1 },
            circlel:     { behavior:"enemy", x: 250, y: -50, health: 10, points: 100, A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2, missiles: 1, missileType: "straight", missileSpeed: 175, missileReload: 1},
            circler:     { behavior:"enemy", x: 250, y: -50, health: 10, points: 100, A: 0,  B: 100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2, missiles: 1, missileType: "straight", missileSpeed: 175, missileReload: 1},
            wiggle:     { behavior:"enemy", x: 100, y: -50, health: 20, points: 200, B: 50, C: 4, E: 100, missiles: 2, missileType: "straight", missileSpeed: 175, missileReload: 1 },
            wave:       { behavior:"enemy", x: 0, y: -50, health: 10, points: 100, B: 150, C: 1.2, E: 75, missiles: 1, missileType: "straight", missileSpeed: 175, missileReload: 1 },
            targete:    { behavior:"enemy", x: 0, y: -50, health: 10, points: 100, A: function(){
                var board = self.getBoard(6),
                    playerShip = board.detect(function(){
                        return (this.type === OBJECT_PLAYER) ? this : false;
                    }),
                    playerX = playerShip.x + playerShip.w / 2,
                    x = this.x + this.w / 2;

                return (playerX - x) / random(3, 8);
            }, E: function(){
                return random(200, 300);
            }, missiles: 0, missileType: "straight", missileSpeed: 350, missileReload: 1},
            okcashbag:  { behavior:"item", reward:"missile", x: 0, y: -50, points: 500, B: 30, C: 4, E: 100, missiles: 0, missileType: "straight", missileSpeed: 175, missileReload: 1 }
        },
        random = function(from, to) {
            var max = to - from,
                ret = Math.floor(Math.random() * (max + 1));

            return (to > max + from) ? to : from + ret;
        },
        temp = {},
        levels = [
            //    Start,    End,    Gap,    Sprite,         PropertyKey,    Override Properties
            [
                [ 1000,     1500,   500,    'enemy_ship1',  'straight',     { x: function(){ temp.l1 = random(0, 80); return temp.l1; }, missiles : 0 } ],
                [ 1000,     1500,   500,    'enemy_ship1',  'straight',     { x: function(){ return temp.l1 + 10 + this.w; }, missiles : 0 } ],
                [ 1000,     1500,   500,    'enemy_ship1',  'straight',     { x: function(){ return temp.l1 + 20 + this.w * 2; }, missiles : 0 } ],
                [ 3000,     3500,   500,    'enemy_ship1',  'straight',     { x: function(){ temp.l1 = random(80, 160); return temp.l1; }, missiles : 0 } ],
                [ 3000,     3500,   500,    'enemy_ship1',  'straight',     { x: function(){ return temp.l1 + 10 + this.w; }, missiles : 0 } ],
                [ 3000,     3500,   500,    'enemy_ship1',  'straight',     { x: function(){ return temp.l1 + 20 + this.w * 2; }, missiles : 0 } ],
                [ 5000,     5500,   500,    'enemy_ship1',  'straight',     { x: function(){ temp.l1 = random(0, 160); return temp.l1; }, missiles : 0 } ],
                [ 5000,     5500,   500,    'enemy_ship1',  'straight',     { x: function(){ return temp.l1 + 10 + this.w; }, missiles : 0 } ],
                [ 5000,     5500,   500,    'enemy_ship1',  'straight',     { x: function(){ return temp.l1 + 20 + this.w * 2; }, missiles : 0 } ],
                [ 9000,     20000,  500,    'enemy_ship1',  'straight',     { x: function(){ return random(0, 320 - this.w); }, missiles : 0 } ],
                [ 10000,    10500,  500,    'okcashbag',    'okcashbag',    { reward:"missile", x: function(){ return random(0, 320 - this.w); } } ]
            ],
            [
                [ 1000,     10000,   500,    'enemy_bug1',  'wave',     { x:function(){ return random(0, 320 - this.w);}, A:0, B: 50, C:4, D:0, E:120, health: 10, points: 10, missiles: 1, missileReload: 3 } ],
                [ 11000,    25000,  500,    'enemy_ship2',  'straight',     { x: function(){ return random(0, 160 - this.w); }, E : 140, missiles : 1, missileReload: 5 } ],
                [ 13000,    13500,   500,    'okcashbag',    'okcashbag',    { reward:"missileSpeed", x: function(){ return random(0, 320 - this.w); } } ],
                [ 11250,    25250,  500,    'enemy_ship2',  'straight',     { x: function(){ return random(160, 320 - this.w); }, E : 130, missiles : 1, missileSpeed:200, missileReload: 5 } ]
            ],
            [
                [ 1000,     7000,   700,    'enemy_bee1',  'circlel',          { x: 100, health:20, points:200, missiles : 1 } ],
                [ 1000,     7000,   700,    'enemy_bee1',  'circler',          { x: 180, health:20, points:200, missiles : 1 } ],
                [ 7000,     8000,   500,    'enemy_bug1',  'straight',     { x: function(){ return (temp.l1 = random(0, 80)); }, health:20, points:200, missiles : 0 } ],
                [ 7000,     8000,   500,    'enemy_bug1',  'straight',     { x: function(){ return temp.l1 + 10 + this.w; }, health:20, points:200, missiles : 0 } ],
                [ 7000,     8000,   500,    'enemy_bug1',  'straight',     { x: function(){ return temp.l1 + 20 + this.w * 2 }, health:20, points:200, missiles : 0 } ],
                [ 10000,     11000,   500,    'enemy_bug1',  'straight',     { x: function(){ return (temp.l1 = random(80, 160)); }, health:20, points:200, missiles : 0 } ],
                [ 10000,     11000,   500,    'enemy_bug1',  'straight',     { x: function(){ return temp.l1 + 10 + this.w; }, health:20, points:200, missiles : 0 } ],
                [ 10000,     11000,   500,    'enemy_bug1',  'straight',     { x: function(){ return temp.l1 + 20 + this.w * 2 }, health:20, points:200, missiles : 0 } ],
                [ 10500,     11000,   500,    'okcashbag',    'okcashbag',    { reward:"missile", x: function(){ return random(0, 320 - this.w); } } ],
                [ 15000,     25000,   1000,    'enemy_bug2',  'straight',     { x: function(){ return (temp.l1 = random(0, 160)); }, E: 150, health: 30, points: 300, missiles: 2, missileReload: 5, missileSpeed: 180 } ],
                [ 15000,     25000,   1000,    'enemy_bug2',  'straight',     { x: function(){ return temp.l1 + 10 + this.w; }, E: 150, health: 30, points: 300, missiles: 2, missileReload: 5, missileSpeed: 180 } ],
                [ 15000,     25000,   1000,    'enemy_bug2',  'straight',     { x: function(){ return temp.l1 + 20 + this.w * 2 }, E: 150, health: 30, points: 300, missiles: 2, missileReload: 5, missileSpeed: 180 } ]
            ],
            [
                [ 0,        5000,   500,   'enemy_ship3',   'targete',      { x: function(){ return random(10, 310 - this.w); }, health:20, points:200, E: function(){ return random(175, 250); }, missiles : 1, missileSpeed : 275 } ],
                [ 5000,     15000,  300,   'enemy_ship3',   'targete',      { x: function(){ return random(10, 310 - this.w); }, health:20, points:200, E: function(){ return random(200, 300); }, missiles : 1, missileSpeed : 325 } ],
                [ 5500,     6000,   500,   'okcashbag',     'okcashbag',    { reward:"missileReload", x: function(){ return random(0, 320 - this.w); } } ],
                [ 15000,    30000,  200,   'enemy_ship3',   'targete',      { x: function(){ return random(10, 310 - this.w); }, health:20, points:200, E: function(){ return random(300, 350); }, missiles : 1, missileSpeed : 350 } ]
            ],
            [
                [ 0,        35000,  300,    'enemy_circle', 'wave',         { x:function(){ return random(0, 320 - this.w);}, A:0, B: 50, C:4, D:0, E:120, health: 30, points: 10, missiles: 0 } ],
                [ 5000,     15000,  2000,   'enemy_bee2',  'straight',     { x:function(){ return random(0, 320 - this.w);}, E:function(){ return random(120, 150);}, health: 20, points: 100, missiles: 1, missileReload: 3 } ],
                [ 5000,     5500,   500,    'enemy_boss',   'boss',         { x: random(0, 110) } ],
                [ 7000,     7500,   500,    'okcashbag',    'okcashbag',    { reward:"missile", x: function(){ return random(0, 320 - this.w); } } ],
                [ 17000,    35000,  1000,    'enemy_bug2',   'targete',      { x:function(){ return random(0, 320 - this.w);}, E:function(){ return random(150, 200);}, health: 30, points: 300, missileSpeed : 250, missiles: 2, missileReload: 5 } ]
            ]
        ],

        startGame = function() {
            var ua = navigator.userAgent.toLowerCase();

            // Only 1 row of stars
            if (ua.match(/android/)) {
                self.setBoard(0, new Starfield(50, 0.6, 80, !perfOpt.domBg));
            } else {
                self.setBoard(0, new Starfield(20, 0.4, 80, true));
                self.setBoard(1, new Starfield(50, 0.6, 40));
                self.setBoard(2, new Starfield(100, 1.0, 20));
            }
        },
        endGame = function(win) {
            started = false;
            self.disableBoard(6);
            self.disableBoard(7);

            $(".gameCanvas").trigger("finish", self.getBoard(4).points);
        };

    // Game Initialization
    this.initialize = function(canvasElementId, imgSrc, viewport) {
        this.canvas = (typeof canvasElementId === "string") ? document.getElementById(canvasElementId) : canvasElementId;
        this.canvas.style.width = viewport.width + "px";
        this.canvas.style.height = viewport.height + "px";
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.scale = {};
        this.scale.x = parseInt(this.canvas.style.width || this.canvas.width, 10) / 320;
        this.scale.y = parseInt(this.canvas.style.height || this.canvas.height, 10) / 400;
        this.playerOffset = 32;

        this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
        if (!this.ctx) {
            return alert("Please upgrade your browser to play");
        }

        (function(){
            var ua = window.navigator.userAgent;
            if ((/Android 2/i).test(ua) && typeof self.ctx.flush === "undefined") {
                perfOpt.domBg = true;
                perfOpt.clearRate = -2;
            }
            if ((/Android 4.0/i).test(ua)) {
                perfOpt.domBg = true;
            }
        }());

        if (perfOpt.domBg) {
            $(this.canvas).css({
                background:"#000",
                "-webkit-transform": "translateZ(0)"
            });
            $(this.canvas).wrapAll("<div>").parent().css({
                height:"399px",
                overflow:"hidden"
            }).parent().css({
                backgroundColor:"#2f2f2f"
            });
        }


        SpriteSheet.load(sprites, startGame, imgSrc);

        this.setupInput();
        this.loop();
        started = true;
    };

    this.playGame = function() {
//        started = true;

        var level = new Level(levels, endGame),
            board;

        this.disableBoard(4);
        this.disableBoard(5);
        this.disableBoard(6);
        this.disableBoard(7);

        // if(!!('ontouchstart' in window)) {
        //     board = new GameBoard();
        //     board.add(new Left());
        //     board.add(new Right());
        //     this.setBoard(7, board);
        // }

//        board = new GameBoard();

//
//        this.board.add(level);
//        level.next();
//        this.setBoard(4, new GamePoints(0));
//        this.setBoard(5, new LevelScreen("Level " + (level.stage + 1)));
//        this.setBoard(6, this.board);

        this.board = new GameBoard();
        this.level = new Level(levels, endGame);

        this.board.add(new PlayerShip());
        this.board.add(this.level);
        this.level.next();
        this.setBoard(4, new GamePoints(0));
        this.setBoard(5, new LevelScreen("Level " + (this.level.stage + 1)));
        this.setBoard(6, this.board);

    };

    this.keys = {};

    this.setupInput = function() {
        window.addEventListener('keydown', function(e) {
            if (KEY_CODES[event.keyCode]) {
                self.keys[KEY_CODES[event.keyCode]] = true;
                e.preventDefault();
            }
        }, false);

        window.addEventListener('keyup', function(e) {
            if (KEY_CODES[event.keyCode]) {
                self.keys[KEY_CODES[event.keyCode]] = false;
                e.preventDefault();
            }
        }, false);

        self.controller = Object.create(PubSub.prototype);
        (function(){

            var left, move, timer;
            self.canvas.addEventListener('dblclick', function(e) {
                e.preventDefault();
            }, true);
            self.canvas.addEventListener('click', function(e) {
                e.preventDefault();
            }, true);
            self.canvas.addEventListener('touchstart', function(e){
                var touch = e.targetTouches[0],
                    x = touch.pageX / self.scale.x,
                    y = touch.pageY / self.scale.y - self.canvas.offsetTop;

                if (y > self.height / 2) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                left = x;
                self.keys.fire = true;
            }, true);
            self.canvas.addEventListener('touchmove', function(e){
                var touch = e.targetTouches[0],
                    x = touch.pageX / self.scale.x;
                // console.log(self.scale.x)
                //e.preventDefault();
                //e.stopPropagation();

                move = x - left;
                left = x;
                self.controller.trigger("move", move);

                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function(){
                    self.controller.trigger("move", 0);
                }, 100);
            }, true);
            self.canvas.addEventListener('touchend', function(e){
                self.keys.fire = false;
            }, true);

            // $(document).on('touchstart', function(e){
            //     e.preventDefault();
            //     e.stopPropagation();
            // });
            // $(document).on('touchmove', function(e){
            //     e.preventDefault();
            //     e.stopPropagation();
            // });
            //

        }());

        this.trackTouch = function(e) {
            var touch, x, y;

            self.keys.left = false;
            self.keys.right = false;
            for (var i = 0; i < e.targetTouches.length; i++) {
                touch = e.targetTouches[i];
                x = touch.pageX / self.scale.x - self.canvas.offsetLeft;
                y = touch.pageY / self.scale.y - self.canvas.offsetTop;

                if (y < self.height / 2) {
                    continue;
                }
                e.preventDefault();
                if (x < self.width / 2) {
                    self.keys.left = true;
                }
                if (x > self.width / 2) {
                    self.keys.right = true;
                }
            }

            // if (e.type == 'touchstart' || e.type == 'touchend') {
            //     for (i = 0; i < e.changedTouches.length; i++) {
            //         touch = e.changedTouches[i];

            //         // * scale.x,
            //         x = touch.pageX / self.scale.x - self.canvas.offsetLeft;
            //         if (x > 4 * unitWidth) {
            //             self.keys['fire'] = (e.type == 'touchstart');
            //         }
            //     }
            // }
        };

        // self.canvas.addEventListener('touchstart', this.trackTouch, true);
        // self.canvas.addEventListener('touchend', this.trackTouch, true);
        // self.playerOffset = 60;
    };

    var lastTime = new Date().getTime();
    // var maxTime = 1 / 30;

    // Game Loop
    this.loop = function() {
        var curTime = new Date().getTime();
        requestAnimationFrame(self.loop);
        var dt = (curTime - lastTime) / 1000;
        // if (dt > maxTime) { dt = maxTime; }

        if (started) {
            for (var i = 0, len = boards.length; i < len; i++) {
                if (boards[i] && status[i]) {
                    boards[i].step(dt);
                    boards[i].draw(self.ctx);
                }
            }
        }
        if (self.ctx.flush) {
            self.ctx.flush();
        }
        lastTime = curTime;
    };
    // ScreenCapture
    this.captureScreenShot = function() {
        for (var i = 0, len = boards.length; i < len; i++) {
            if (boards[i]) {
                boards[i].draw(self.ctx);
            }
        }
        return self.canvas.toDataURL();
    };
    // Change an active game board
    this.setBoard = function(num, board) {
        this.disableBoard(num);
        boards[num] = board;
        this.enableBoard(num);
    };
    this.getBoardNum = function(obj) {
        return (typeof obj !== "number") ? boards.indexOf(obj) : obj;
    };
    this.getBoard = function(num) {
        return boards[this.getBoardNum(num)];
    };
    this.enableBoard = function(num) {
        status[this.getBoardNum(num)] = true;
    };
    this.disableBoard = function(num) {
        status[this.getBoardNum(num)] = false;
    };



    var SpriteSheet = (function() {
        this.map = {};

        this.load = function(spriteData, callback, img) {
            this.map = spriteData;
            this.image = new Image();
            this.image.onload = callback;
            this.image.src = img;
        };

        this.draw = function(ctx, sprite, x, y, frame) {
            var s = this.map[sprite],
                w, h;

            if (!frame) {
                frame = 0;
            }

            x = Math.floor(x);
            y = Math.floor(y);
            w = s.sw || s.w;
            h = s.sh || s.h;

            if (x > self.width || (x + w) < 0 || y > self.height || (y + h) < 0) {
                return;
            }

            ctx.drawImage(this.image,
                s.sx + frame * s.w,
                s.sy,
                s.w, s.h,
                x,
                y,
                w,
                h);
        };

        return this;
    }).call(SpriteSheet);

    var Starfield = function(speed,opacity,numStars,clear) {
        // Set up the offscreen canvas
        var stars = document.createElement("canvas");
        stars.width = self.width;
        stars.height = self.height;
        var starCtx = stars.getContext("2d");

        var offset = 0;

        // If the clear option is set,
        // make the background black instead of transparent
        if (clear) {
            starCtx.fillStyle = "#000";
            starCtx.fillRect(0, 0, stars.width, stars.height);
        }

        // Now draw a bunch of random 2 pixel
        // rectangles onto the offscreen canvas
        starCtx.fillStyle = "#999";
        starCtx.globalAlpha = opacity;
        for (var i = 0; i < numStars; i++) {
            starCtx.fillRect(Math.floor(Math.random() * stars.width),
                Math.floor(Math.random() * stars.height),
                random(1,2),
                random(1,2));
        }

        // This method is called every frame
        // to draw the starfield onto the canvas
        this.draw = function(ctx) {
            var intOffset = Math.floor(offset);
            var remaining = stars.height - intOffset;

            if (perfOpt.domBg) {
                perfOpt.skipCnt++;
                if (perfOpt.skipCnt > 0) {
                    ctx.clearRect(0, 0, stars.width, stars.height - 1);
                    perfOpt.skipCnt = perfOpt.clearRate;
                }
            }

            // Draw the top half of the starfield
            if (intOffset > 0) {
                ctx.drawImage(stars,
                    0, remaining,
                    stars.width, intOffset,
                    0, 0,
                    stars.width, intOffset);
            }

            // Draw the bottom half of the starfield
            if (remaining > 0) {
                ctx.drawImage(stars,
                    0, 0,
                    stars.width, remaining,
                    0, intOffset,
                    stars.width, remaining);
            }
        };

        // This method is called to update
        // the starfield
        this.step = function(dt) {
            offset += dt * speed;
            offset = offset % stars.height;
        };
    };

    var GameBoard = function() {
        var board = this;

        // The current list of objects
        this.objects = [];
        this.removed = [];
        this.cnt = {};
        this.cnt[OBJECT_PLAYER] = 0;
        this.cnt[OBJECT_PLAYER_PROJECTILE] = 0;
        this.cnt[OBJECT_ENEMY] = 0;
        this.cnt[OBJECT_ENEMY_PROJECTILE] = 0;
        this.cnt[OBJECT_EXPLOSION] = 0;
        this.cnt[OBJECT_ITEM] = 0;

        // Add a new object to the object list
        this.add = function(obj) {
            obj.board = this;
            this.objects.push(obj);
            if (typeof obj.type !== "undefined") { //level
                this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
            }
            return obj;
        };

        // Mark an object for removal
        this.remove = function(obj) {
            var idx = this.removed.indexOf(obj);
            if (idx === -1) {
                this.removed.push(obj);
                return true;
            } else {
                return false;
            }
        };

        // Removed an objects marked for removal from the list
        this.finalizeRemoved = function() {
            for (var i = 0, len = this.removed.length; i < len; i++) {
                var idx = this.objects.indexOf(this.removed[i]);
                if (idx !== -1) {
                    this.cnt[this.removed[i].type]--;
                    this.objects.splice(idx, 1);
                }
            }
            this.removed = [];
        };

        // Call the same method on all current objects
        this.iterate = function(funcName) {
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, len = this.objects.length; i < len; i++) {
                var obj = this.objects[i];
                if (obj) {
                    obj[funcName].apply(obj, args);
                }
            }
        };

        // Find the first object for which func is true
        this.detect = function(func) {
            for (var i = 0, val = null, len = this.objects.length; i < len; i++) {
                if (this.removed.indexOf(this.objects[i]) === -1 && func.call(this.objects[i])) {
                    return this.objects[i];
                }
            }
            return false;
        };

        // Call step on all objects and them delete
        // any object that have been marked for removal
        this.step = function(dt) {
            this.iterate('step', dt);
            this.finalizeRemoved();
        };

        // Draw all the objects
        this.draw = function(ctx) {
            this.iterate('draw', ctx);
        };

        // Check for a collision between the
        // bounding rects of two objects
        this.overlap = function(o1, o2) {
            return !((o1.y + o1.h < o2.y) || (o1.y > o2.y + o2.h) ||
                (o1.x + o1.w < o2.x) || (o1.x > o2.x + o2.w));
        };

        // Find the first object that collides with obj
        // match against an optional type
        this.collide = function(obj, type) {
            return this.detect(function() {
                if (obj !== this) {
                    if (this.type === type) {
                        var collides1 = obj.collides.map(function(o){
                            return {
                                x: this.x + o.x,
                                y: this.y + o.y,
                                w: o.w,
                                h: o.h
                            };
                        }, obj);

                        var collides2 = this.collides.map(function(o){
                            return {
                                x: this.x + o.x,
                                y: this.y + o.y,
                                w: o.w,
                                h: o.h
                            };
                        }, this);

                        return collides1.some(function(o1){
                            return collides2.some(function(o2){
                                return board.overlap(o1, o2);
                            }, this);
                        }, this);
                    }
                    return false;
                    // var col = (!type || this.type & type) && board.overlap(obj, this);
                    // return col ? this : false;
                }
            });
        };

        this.clear = function() {
            this.objects.forEach(function(o){
                if (typeof o.type !== "undefined" && (o.type === OBJECT_PLAYER_PROJECTILE || o.type === OBJECT_ENEMY_PROJECTILE)) {
                    this.remove(o);
                }
            }, this);
            this.finalizeRemoved();
        };
    };

    var TitleScreen = function (title, subtitle, callback) {
        var up = false;
        this.step = function(dt) {
            if (!self.keys.fire) {
                up = true;
            }
            if (up && self.keys.fire && callback) {
                self.disableBoard(self.getBoard(this));
                callback();
            }
        };

        this.draw = function(ctx) {
            ctx.fillStyle = "#FFFFFF";

            var big = 40,
                small = big * 0.5;

            ctx.font = "bold " + big + "px sans-serif";
            var measure = ctx.measureText(title);
            ctx.fillText(title, self.width / 2 - measure.width / 2, self.height / 2);

            ctx.font = "bold " + small + "px sans-serif";
            var measure2 = ctx.measureText(subtitle);
            ctx.fillText(subtitle, self.width / 2 - measure2.width / 2, self.height / 2 + big);
        };
    };

    var LevelScreen = function (title) {
        var up = false,
            running = 0,
            duration = 1;

        this.step = function(dt) {
            running += dt;
        };

        this.draw = function(ctx) {
            ctx.fillStyle = "#FFFFFF";

            var big = 40,
                small = 18;

            // if (running < duration) {
            //     ctx.font = "bold " + big + "px sans-serif";
            //     var measure = ctx.measureText(title);
            //     ctx.fillText(title, self.width / 2 - measure.width / 2, self.height / 2);
            // }

            ctx.font = "bold " + small + "px sans-serif";
            var measure2 = ctx.measureText(title.toUpperCase());
            ctx.fillText(title.toUpperCase(), self.width - measure2.width - 10, 20);
        };
    };

    var Level = function(levelData, callback) {
        this.stage = -1;
        this.stages = [];
        for (var i = 0; i < levelData.length; i++) {
            this.stages.push(Object.create(levelData[i]));
        }
        this.callback = callback;
    };
    Level.prototype.next = function() {
        if (this.stages.length - 1 < this.stage) {
            return;
        }
        // this.board.clear();
        this.t = -1000;
        this.endTime = Infinity;
        this.stage += 1;
        this.levelData = [];

        for (var i = 0; i < this.stages[this.stage].length; i++) {
            this.levelData.push(Object.create(this.stages[this.stage][i]));
        }
    };
    Level.prototype.step = function(dt) {
        var idx = 0,
            remove = [],
            curShip = null;

        // Update the current time offset
        this.t += dt * 1000;

        //   Start, End,  Gap, Type,   Override
        // [ 0,     4000, 500, 'step', { x: 100 } ]
        while ((curShip = this.levelData[idx]) &&
            (curShip[0] < this.t + 2000)) {
            // Check if we've passed the end time
            if (this.t > curShip[1]) {
                remove.push(curShip);
            } else if (curShip[0] < this.t) {
                // Get the enemy definition blueprint
                var prop = $.extend({}, objectProps[curShip[4]], curShip[5]),
                    sprite = curShip[3],
                    newObject;

                switch (prop.behavior) {
                    case "enemy":
                    case "enemyBoss":
                        newObject = new Enemy(sprite, prop);
                    break;
                    case "item":
                        newObject = new Item(sprite, prop);
                    break;
                }

                // Add a new enemy with the blueprint and override
                this.board.add(newObject);

                // Increment the start time by the gap
                curShip[0] += curShip[2];
            }
            idx++;
        }

        // Remove any objects from the levelData that have passed
        for (var i = 0, len = remove.length; i < len; i++) {
            var remIdx = this.levelData.indexOf(remove[i]);
            if (remIdx !== -1) {
                this.levelData.splice(remIdx, 1);
            }
        }

        // If there are no more enemies on the board or in
        // levelData, this level is done
        if (this.levelData.length === 0 &&
            this.board.cnt[OBJECT_PLAYER] === 1 &&
            this.board.cnt[OBJECT_ENEMY] === 0 &&
            this.board.cnt[OBJECT_ENEMY_PROJECTILE] === 0 &&
            this.board.cnt[OBJECT_EXPLOSION] === 0 && this.endTime === Infinity) {
            this.endTime = this.t;
        }

        if (this.endTime + 3000 < this.t) {
            if (this.stage === this.stages.length - 1) {
                if (this.callback) {
                    this.callback(true);
                }
            } else {
                this.next();
                self.setBoard(5, new LevelScreen("Level " + (this.stage + 1)));
            }
        }
    };
    Level.prototype.draw = function(ctx) { };

    var GamePoints = function() {
        this.points = 0;
        this.comboPoints = 0;

        var pointsLength = 8;

        this.draw = function(ctx) {
            ctx.save();
            var size = 18;
            ctx.font = "bold " + size + "px sans-serif";
            ctx.fillStyle = "#FFFFFF";

            var txt = "" + this.points;
            var i = pointsLength - txt.length,
                zeros = "";
            while (i-- > 0) {
                zeros += "0";
            }

            ctx.fillText(zeros + txt, 10, 20);
            ctx.restore();

        };

        this.step = function(dt) {};
    };

    var Sprite = function() {};
    Sprite.prototype.setup = function(sprite, props) {
        this.sprite = sprite;
        this.merge(props);
        this.frame = this.frame || 0;
        this.w = SpriteSheet.map[sprite].sw || SpriteSheet.map[sprite].w;
        this.h = SpriteSheet.map[sprite].sh || SpriteSheet.map[sprite].h;
        var wr = this.w / SpriteSheet.map[sprite].w;
        var hr = this.h / SpriteSheet.map[sprite].h;

        this.collides = (collides[sprite]) ? collides[sprite].map(function(s){
            return {
                x:s.x * wr,
                y:s.y * hr,
                w:s.w * wr,
                h:s.h * hr
            };
        }) : [{
            x:0,
            y:0,
            w:SpriteSheet.map[sprite].w * wr,
            h:SpriteSheet.map[sprite].h * hr
        }];

        // console.log({
        //     x:0,
        //     y:0,
        //     w:this.w * wr,
        //     h:this.h * hr
        // })
    };
    Sprite.prototype.merge = function(props) {
        if (props) {
            for (var prop in props) {
                this[prop] = props[prop];
            }
        }
    };
    Sprite.prototype.draw = function(ctx) {
        ctx.globalAlpha = this.alpha || 1;
        SpriteSheet.draw(ctx, this.sprite, this.x, this.y, this.frame);
        ctx.globalAlpha = 1;
    };
    Sprite.prototype.step = function(dt) {};
    Sprite.prototype.hit = function(damage) {
        this.board.remove(this);
    };

    var PlayerShip = function() {
        this.setup('ship', {
            vx: 0,
            damage: 300,
            missileReload: 0.2,
            missile: 1,
            missileSpeed: -300
        });
        self.controller.on("move", function(vx){
            if (vx < 0) {
                vx = Math.max(vx, -this.w);
            } else {
                vx = Math.min(vx, this.w);
            }
            this.vx = vx;
            this.lastx = this.x;
            this.x += this.vx;
            this.x = Math.min(Math.max(this.x, 0), self.width - this.w);
        }.bind(this));

        this.reload = this.missileReload;
        this.x = this.lastx = self.width / 2 - this.w / 2;
        this.y = self.height - self.playerOffset - this.h;

        this.step = function(dt) {
            // if (self.keys.left || self.keys.right) {
            //     if (self.keys.left) {
            //         this.vx = -200 * dt;
            //     }
            //     if (self.keys.right) {
            //         this.vx = 200 * dt;
            //     }
            //     this.x += this.vx;
            //     this.x = Math.min(Math.max(this.x, 0), self.width - this.w);
            // }

            //enemy
            var enemy = this.board.collide(this, OBJECT_ENEMY);
            if (enemy) {
                enemy.hit(this.damage);
                this.hit(enemy.damage);
            }

            //enemy missile
            var enemyMissile = this.board.collide(this, OBJECT_ENEMY_PROJECTILE);
            if (enemyMissile) {
                this.board.remove(enemyMissile);
                this.hit(enemyMissile.damage);
            }

            this.reload -= dt;
            if (this.reload < 0) {
                // return;
                this.reload = this.missileReload;
                if (this.missile === 1) {
                    this.board.add(new PlayerMissile(this.x + this.w / 2, this.y + 7, this.missileSpeed));
                } else if (this.missile === 2) {
                    this.board.add(new PlayerMissile(this.x + 0 + 1, this.y + 12, this.missileSpeed));
                    this.board.add(new PlayerMissile(this.x + this.w - 1, this.y + 12, this.missileSpeed));
                } else if (this.missile === 3) {
                    this.board.add(new PlayerMissile(this.x + 0 + 1, this.y + 12, this.missileSpeed));
                    this.board.add(new PlayerMissile(this.x + this.w / 2, this.y + 7, this.missileSpeed));
                    this.board.add(new PlayerMissile(this.x + this.w - 1, this.y + 12, this.missileSpeed));
                } else if (this.missile === 4) {
                    this.board.add(new PlayerMissile(this.x + 0 + 1, this.y + 12, this.missileSpeed));
                    this.board.add(new PlayerMissile(this.x + this.w / 3 * 1, this.y + 7, this.missileSpeed));
                    this.board.add(new PlayerMissile(this.x + this.w / 3 * 2, this.y + 7, this.missileSpeed));
                    this.board.add(new PlayerMissile(this.x + this.w - 1, this.y + 12, this.missileSpeed));
                }
            }
        };
    };
    PlayerShip.prototype = new Sprite();
    PlayerShip.prototype.type = OBJECT_PLAYER;
    PlayerShip.prototype.hit = function(damage) {
        if (this.board.remove(this)) {
            this.board.add(new Explosion(this.x + this.w / 2,
                    this.y + this.h / 2));

            setTimeout(function(){
                endGame(false);
            }, 2000);
        }
    };
    PlayerShip.prototype.enhance = function(reward) {
        switch (reward) {
            case "missile":
                this.missile += 1;
                this.missile = Math.min(this.missile, 4);
            break;
            case "missileSpeed":
                this.missileSpeed -= 200;
                this.missileSpeed = Math.max(this.missileSpeed, -500);
            break;
            case "missileReload":
                this.missileReload -= 0.75;
                this.missileReload = Math.max(this.missileReload, 0.125);
            break;
        }
    };

    var PlayerMissile = function(x,y,speed) {
        this.setup('missile', {
            vy: (speed || -300),
            damage: 10
        });
        this.x = x - this.w / 2;
        this.y = y - this.h;
    };
    PlayerMissile.prototype = new Sprite();
    PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;
    PlayerMissile.prototype.step = function(dt)  {
        this.y += this.vy * dt;
        var collision = this.board.collide(this, OBJECT_ENEMY);
        if (collision) {
            collision.hit(this.damage);
            this.board.remove(this);
        } else if (this.y < -this.h) {
            this.board.remove(this);
        }
    };

    var Enemy = function(sprite,prop) {
        this.merge(this.baseParameters);
        this.setup(sprite, prop);

        ["x", "y", "A", "B", "E", "F"].forEach(function(key) {
            if (typeof this[key] === "function") {
                this[key] = this[key].call(this);
            }
        }, this);

        this.healthLast = this.health;
        this.reload = Math.random() * 1.5;
    };
    Enemy.prototype = new Sprite();
    Enemy.prototype.type = OBJECT_ENEMY;
    Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, t: 0, missileReload: 1, reload: 0, damaga: 100 };
    Enemy.prototype.step = function(dt) {
        this.t += dt;

        this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
        this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (/*Math.random() < 0.01 && */this.reload <= 0) {
            this.reload = this.missileReload;
            if (this.missiles > 0) {
                if (this.missiles === 1) {
                    this.board.add(new EnemyMissile(this.x + this.w / 2, this.y + this.h, this.missileSpeed));
                } else if (this.missiles === 2) {
                    this.board.add(new EnemyMissile(this.x + 1, this.y + this.h, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w - 1, this.y + this.h, this.missileSpeed));
                } else if (this.missiles === 10) {
                    this.board.add(new EnemyMissile(this.x + 1, this.y + this.h - 75, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10, this.y + this.h - 45, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 2, this.y + this.h - 30, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 3, this.y + this.h - 15, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 4, this.y + this.h, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 2, this.y + this.h, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 6, this.y + this.h, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 7, this.y + this.h - 15, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 8, this.y + this.h - 30, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 9, this.y + this.h - 45, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w - 1, this.y + this.h - 75, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 3, this.y + this.h - 75, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 4, this.y + this.h - 55, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 2, this.y + this.h - 45, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 6, this.y + this.h - 55, this.missileSpeed));
                    this.board.add(new EnemyMissile(this.x + this.w / 10 * 7, this.y + this.h - 75, this.missileSpeed));
                }
            }
        }
        this.reload -= dt;

        if (this.y > self.height/* ||
            this.x < -this.w ||
            this.x > self.width*/) {
            // this.hit(10000);
            this.board.remove(this);
            self.getBoard(4).comboPoints = 0;
        }
    };
    Enemy.prototype.hit = function(damage) {
        this.healthLast -= damage;
        this.alpha = this.healthLast / this.health * 0.5 + 0.5;
        var gamePoints = self.getBoard(4);

        if (this.healthLast <= 0) {
            if (this.board.remove(this)) {
                gamePoints.points += (this.points || 100) + gamePoints.comboPoints;
                gamePoints.comboPoints = Math.min(gamePoints.comboPoints + 10, 1000);
                if (this.behavior === "enemyBoss") {
                    var t = 0, that = this, exp = function(){
                        that.board.add(new Explosion(random(that.x, that.x + that.w), random(that.y, that.y + that.h)));
                    };
                    for (var i = 0; i < 20; i++) {
                        setTimeout(exp, t += 150);
                    }
                } else {
                    this.board.add(new Explosion(this.x + this.w / 2, this.y + this.h / 2));
                }
            }
        }
    };

    var EnemyMissile = function(x,y,speed) {
        this.setup('enemy_missile', {
            vy: (speed || 200),
            damage: 10
        });
        this.x = x - this.w / 2;
        this.y = y;
    };
    EnemyMissile.prototype = new Sprite();
    EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;
    EnemyMissile.prototype.step = function(dt)  {
        this.y += this.vy * dt;
        if (this.y > self.height) {
            this.board.remove(this);
        }
    };

    var Explosion = function(centerX,centerY) {
        this.setup('explosion', {
            frame: 0
        });
        this.x = centerX - this.w / 2;
        this.y = centerY - this.h / 2;
    };
    Explosion.prototype = new Sprite();
    Explosion.prototype.type = OBJECT_EXPLOSION;
    Explosion.prototype.step = function(dt) {
        this.frame++;
        if (this.frame >= 12) {
            this.board.remove(this);
        }
    };

    var Item = function(sprite,prop) {
        this.merge(this.baseParameters);
        this.setup(sprite, prop);
        this.frameNum = 0;

        ["x", "y", "A", "B", "E", "F"].forEach(function(key) {
            if (typeof this[key] === "function") {
                this[key] = this[key].call(this);
            }
        }, this);
    };
    Item.prototype = new Sprite();
    Item.prototype.type = OBJECT_ITEM;
    Item.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, t: 0 };
    Item.prototype.step = function(dt) {
        this.t += dt;

        this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
        this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        var collision = this.board.collide(this, OBJECT_PLAYER);
        if (collision) {
            collision.enhance(this.reward);
            this.board.remove(this);
        }

        if (this.y > self.height ||
            this.x < -this.w ||
            this.x > self.width) {
            this.board.remove(this);
        }
        this.frameNum += 1;
        if (this.frameNum === 8) {
            this.frameNum = 0;
        }
        this.frame = Math.floor(this.frameNum / 4);
    };

    return this;
}).call({});
