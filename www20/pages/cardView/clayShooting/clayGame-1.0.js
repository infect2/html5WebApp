//ClayGame-1.0.js
//Using Box2dweb

//GameImage Class
(function(window, undefined) {
    var perfOpt = {
        webWorker: true,
        simulateAsync: false, //can be true only when using webWorker
        useRequestAnimFrame: true,

        frameRate: 50,
        velocityIteration: 6,
        positionIteration: 2,

        imageScale: false,
        domBG: false,
        graphicsLayerBG: true,
        graphicsLayerCanvas: true,
        disableBG: false,

        clearHackEnabled: false,
        clearEntireCanvas: true,
        useCircle: true,
        avoidFloatPoint: true,

        maxRound: 5,
        numFragment: 5
    };

    var bodiesToRemove = [];

    var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return setTimeout(callback, 1000/perfOpt.frameRate); },
        changed = true;

    var GameImage = function(){
        this.clayImg = [];
        this.targetImg = null;
        this.backgroundImg = null;
        this.fragmentClayImg = null;
        this.bulletImg = null;
        this.buttonImg = null;
    };
    GameImage.prototype.setImage = function(imgFile){
        var img = new Image();
        img.src = imgFile;
        return img;
    };

    //GameCanvas Class
    var GameCanvas = function(canvasId){
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.canvasWidth = parseInt(this.canvas.style.width || this.canvas.width, 10);
        this.canvasHeight = parseInt(this.canvas.style.height || this.canvas.height, 10);
    };
    GameCanvas.prototype.setCanvas = function(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        this.cssWidth = parseInt(this.canvas.style.width || this.canvas.width, 10);
        this.cssHeight = parseInt(this.canvas.style.height || this.canvas.height, 10);
    };
    //Game Class
    var Game = function(gameCanvas){
        this.world = new this.b2World(new this.b2Vec2(0, 9.8),true);
        this.segment = new this.b2Segment();
        this.canvasPosition = null;
        this.mouseX = gameCanvas && gameCanvas.canvasWidth/2;
        this.mouseY = gameCanvas && gameCanvas.canvasHeight/2;
        this.mousePVec = null;
        this.selectedBody = null;
        this.frameRate = 50;
        if(gameCanvas){
            this.canvasPosition = this.getElementPosition(gameCanvas.canvas);
            this.sizeRatio = gameCanvas.canvasWidth/480; //ex)320/480 == 2/3
            this.scale = 30*this.sizeRatio;
            this.canvasWidth = gameCanvas.canvasWidth;
            this.canvasHeight = gameCanvas.canvasHeight;
        }else{
            this.canvasPosition = null;
            this.sizeRatio = 1;
            this.canvasWidth = null;
            this.canvasHeight = null;
        }
    };
    Game.prototype.b2Vec2 = Box2D.Common.Math.b2Vec2;
    Game.prototype.b2BodyDef = Box2D.Dynamics.b2BodyDef;
    Game.prototype.b2Body = Box2D.Dynamics.b2Body;
    Game.prototype.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    Game.prototype.b2Fixture = Box2D.Dynamics.b2Fixture;
    Game.prototype.b2World = Box2D.Dynamics.b2World;
    Game.prototype.b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    Game.prototype.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    Game.prototype.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    Game.prototype.b2AABB = Box2D.Collision.b2AABB;
    Game.prototype.b2Segment = Box2D.Collision.b2Segment;
    Game.prototype.getElementPosition = function(canvas){
        var elem=canvas, tagname="", x=0, y=0;
        while((typeof(elem) === "object") && (typeof(elem.tagName) !== "undefined")){
            y += elem.offsetTop;
            x += elem.offsetLeft;
            tagname = elem.tagName.toUpperCase();
            if(tagname === "BODY"){
                elem=0;
            }
            if(typeof(elem) === "object"){
                if(typeof(elem.offsetParent) === "object"){
                    elem = elem.offsetParent;
                }
            }
        }
        return {x: x, y: y};
    };
    Game.prototype.getBodyAtMouse = function(bodyType, x, y){
        var game = this;
        this.mousePVec = new this.b2Vec2(x, y);

        // Query the world for overlapping shapes.
        this.selectedBody = null;
        this.world.QueryPoint(function(fixture){game.getBodyCB(fixture, game, bodyType);}, this.mousePVec);
        return this.selectedBody;
    };
    Game.prototype.getBodyCB = function(fixture, game, bodyType){
        if(bodyType === 'dynamics'){
            if(fixture.GetBody().GetType() !== game.b2Body.b2_staticBody){
                if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), game.mousePVec)){
                    game.selectedBody = fixture.GetBody();
                    return false;
                }
            }
        }else if(bodyType === 'statics'){
            if(fixture.GetBody().GetType() === game.b2Body.b2_staticBody){
                if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), game.mousePVec)){
                    game.selectedBody = fixture.GetBody();
                    return false;
                }
            }
        }
        return true;
    };
    Game.prototype.handleMouseMove = function(e, game){
        game.mouseX = (e.clientX - game.canvasPosition.x);
        game.mouseY = (e.clientY - game.canvasPosition.y);
        // changed = true;
    };
    Game.prototype.debugDraw = function(gameCanvas){
        var debugDraw = new this.b2DebugDraw();
        debugDraw.SetSprite(gameCanvas.getContext("2d"));
        debugDraw.SetDrawScale(this.scale);
        debugDraw.SetFillAlpha(1);
        debugDraw.SetAlpha(1);
        debugDraw.SetLineThickness(1);
        debugDraw.SetFlags(this.b2DebugDraw.e_shapeBit | this.b2DebugDraw.e_jointBit);
        this.world.SetDebugDraw(debugDraw);
    };
    Game.prototype.setCanvas = function(gameCanvas) {
        this.canvasPosition = this.getElementPosition(gameCanvas.canvas);
        this.sizeRatio = gameCanvas.canvasWidth/480; //ex)320/480 == 2/3
        this.scale = 30*this.sizeRatio;
        this.canvasWidth = gameCanvas.canvasWidth;
        this.canvasHeight = gameCanvas.canvasHeight;
    };
    //ClayGame Class
    var ClayGame = function(gameCanvas){
        //super class constructor call
        Game.call(this, gameCanvas);
        //variable
        this.startFlag = false;
        this.endFlag = false;
        this.bonusFlag = false;
        this.bullet = 0;
        this.round = 0;
        this.destroyCnt = 0;
        this.score = 0;
        //user set variable
        this.maxRound = 7;
        this.startRound = 1;  //round equals number of clay
        this.roundInterval = 5000;
        this.explosionCuts = 12;
        this.clayPoint = 5;
        this.fragmentPoint = 10;
        this.clearPoint = 10;
        this.minAngle = 30;
        this.maxAngle = 50;
        this.minPower = 15;
        this.maxPower = 25;
        //explosion coordiates
        this.explosionX = 0;
        this.explosionY = 0;
        //clay info
        this.clayImg = null;
        this.buttonImg = null;

        this.bodies = [];

        this.endCallBack = null;
    };
    ClayGame.prototype = new Game();
    ClayGame.prototype.addScore = function(){
        // {
            var clayGame = this;
            this.score += parseInt(this.clayPoint, 10); //clay
            this.destroyCnt += 1;
            if(this.destroyCnt === this.round){ //if user clear all of clay
                this.bonusFlag = true;
                this.score += parseInt(this.clearPoint, 10);
                setTimeout(function(){clayGame.bonusFlag = false;}, 2000);
            }
        // }
        // else{
        //     this.score += parseInt(this.fragmentPoint, 10); //clayfragment
        // }
    };
    ClayGame.prototype.addFragmentClay = function(clickedBody, x, y){
        var closestFraction = 1;
        var rayLength = 25;

        this.explosionX = x;
        this.explosionY = y;

        var cutAngle = 0;
        var stepAngle = (360/this.explosionCuts)*(Math.PI/180);

        var bodyPoints = [];

        var input, output, i;

        var intersectionPoint = new this.b2Vec2();
        var normalize = new this.b2Vec2();
        var newbody;

        var bodyDef = new this.b2BodyDef();
        bodyDef.type = this.b2Body.b2_dynamicBody;
        bodyDef.userData = { fragment : 'y' };

        var fixtureDef = new this.b2FixtureDef();
        fixtureDef.density = clickedBody.GetFixtureList().GetDensity();
        fixtureDef.restitution = 0.2;
        fixtureDef.shape = new this.b2PolygonShape();

        var dist, arrayNewPolygons, fragmentForce;

        if(!perfOpt.useCircle) {
            var bodyVertices = clickedBody.GetFixtureList().GetShape().GetVertices();
            for(i=0; i<bodyVertices.length; i++){
                bodyPoints.push(clickedBody.GetWorldPoint(bodyVertices[i]));
            }
        }

        for(i=0; i<this.explosionCuts; i++){
            this.segment.p1 = new this.b2Vec2(this.explosionX, this.explosionY);
            this.segment.p2 = new this.b2Vec2(this.segment.p1.x + rayLength * Math.cos(cutAngle), this.segment.p1.y + rayLength * Math.sin(cutAngle));

            // Ray-cast input data. The ray extends from p1 to p1 + maxFraction * (p2 - p1).
            input = new Box2D.Collision.b2RayCastInput(); //struct has b2Vec2 p1, p2; float maxfraction;
            output = new Box2D.Collision.b2RayCastOutput(); //struct has b2Vec2 normal, float fraction;
            // Ray-cast output data. The ray hits at p1 + fraction * (p2 - p1), where p1 and p2

            input.p1 = this.segment.p2;
            input.p2 = this.segment.p1;
            input.maxFraction = 1;

            for(var f = clickedBody.GetFixtureList(); f; f = f.GetNext()) {
                if(!f.RayCast(output, input)){
                    continue;
                }
                else if(output.fraction < closestFraction){
                    closestFraction = output.fraction;
                }
            }

            dist = Math.sqrt((this.segment.p1.x - this.segment.p2.x)*(this.segment.p1.x - this.segment.p2.x)+(this.segment.p1.y - this.segment.p2.y)*(this.segment.p1.y - this.segment.p2.y));
            normalize.x = (this.segment.p2.x - this.segment.p1.x)/dist;  //cos
            normalize.y = (this.segment.p2.y - this.segment.p1.y)/dist;  //sin
            intersectionPoint.x = this.segment.p1.x + normalize.x * (1-closestFraction)*dist;
            intersectionPoint.y = this.segment.p1.y + normalize.y * (1-closestFraction)*dist;

            bodyPoints.push({x:intersectionPoint.x, y:intersectionPoint.y, flag:'NEW'});
            cutAngle+=stepAngle;
            closestFraction = 1;
        }

        bodyPoints = this.sortPoints(bodyPoints, this.segment);
        arrayNewPolygons = this.makeNewPolygons(bodyPoints, this.segment);
        fragmentForce = clickedBody.GetLinearVelocity();
        fragmentForce.Multiply(1/this.explosionCuts);

        for(i=0; i<arrayNewPolygons.length; i++){
            fixtureDef.shape.SetAsArray(arrayNewPolygons[i]);
            newbody = this.world.CreateBody(bodyDef);
            newbody.CreateFixture(fixtureDef);
            newbody.ApplyImpulse(fragmentForce, this.segment.p1);
            bodiesToRemove.push(newbody);
        }
    };
    ClayGame.prototype.addClay = function(count){
        var force, angle, power, t,
            clayNum, clayWidth, clayHeight, clay,
            shape = perfOpt.useCircle ? this.b2CircleShape : this.b2PolygonShape;

        //clay Bodydef, Fixturedef setting
        var fixDef = new this.b2FixtureDef();
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;

        var bodyDef = new this.b2BodyDef();
        bodyDef.type = this.b2Body.b2_dynamicBody;

        // fixDef.shape = new shape();
        // if(perfOpt.useCircle) {
        //     // fixDef.shape.m_radius = Math.max(clayWidth, clayHeight)/2;
        //     fixDef.shape.SetRadius(Math.min(clayWidth, clayHeight)/2);
        // } else {
        //     fixDef.shape.SetAsBox(clayWidth/2, clayHeight/2);
        // }

        for(var i = 0; i < count; ++i){
            clayNum = Math.floor(Math.random()*this.clayImg.length);
            clayWidth = (this.clayImg[clayNum].width*this.sizeRatio)/this.scale;
            clayHeight = (this.clayImg[clayNum].height*this.sizeRatio)/this.scale;

            fixDef.shape = new shape();
            if(perfOpt.useCircle) {
                fixDef.shape.SetRadius(Math.min(clayWidth, clayHeight)/2);
            } else {
                fixDef.shape.SetAsBox(clayWidth/2, clayHeight/2);
            }
            fixDef.density = perfOpt.useCircle? 0.42/fixDef.shape.GetRadius() : 1250/(this.clayImg[clayNum].width*this.clayImg[clayNum].height); //m and d are inverse proportion

            if((t=Math.random()) > 0.5){
                t=Math.random();
                angle = parseInt(this.minAngle,10) + (this.maxAngle-this.minAngle)*t;
                t=Math.random();
                power = parseInt(this.minPower,10) + (this.maxPower-this.minPower)*t;
                force = new this.b2Vec2(Math.cos(angle*Math.PI/180)*power, -Math.sin(angle*Math.PI/180)*power);
                bodyDef.position.x = 0-(t*3);
                bodyDef.position.y = this.canvasHeight/this.scale+(t*5);
                fixDef.filter.maskBits = 2;
                fixDef.filter.categoryBits = 1;
            }else{
                t=Math.random();
                angle = parseInt(this.minAngle,10) + (this.maxAngle-this.minAngle)*t;
                t=Math.random();
                power = parseInt(this.minPower,10) + (this.maxPower-this.minPower)*t;
                force = new this.b2Vec2(-Math.cos(angle*Math.PI/180)*power, -Math.sin(angle*Math.PI/180)*power);
                bodyDef.position.x = this.canvasWidth/this.scale+(t*3);
                bodyDef.position.y = this.canvasHeight/this.scale+(t*5);
                fixDef.filter.maskBits = 1;
                fixDef.filter.categoryBits = 2;
                //(catA & maskB) != 0 && (catB & maskA) != 0  ====> can collide
            }
            bodyDef.userData = {fragment : 'n', clayNum : clayNum};
            clay = this.world.CreateBody(bodyDef);
            clay.CreateFixture(fixDef);
            clay.ApplyImpulse(force, clay.GetWorldCenter());
            bodiesToRemove.push(clay);
        }

        changed = true;
    };
    ClayGame.prototype.deleteClay = function(x, y){
        var clickedBody;

        x = x/this.scale;
        y = y/this.scale;
        if(this.bullet > 0 && !this.endFlag){
            clickedBody = this.getBodyAtMouse('dynamics', x, y);
            if(clickedBody !== null){
                this.addFragmentClay(clickedBody, x, y);
                this.world.DestroyBody(clickedBody);
                if(clickedBody.GetUserData().fragment === "n") {
                    this.addScore();
                }
            }
        }else if(this.endFlag){
            clickedBody = this.getBodyAtMouse('statics', x, y);
            if(clickedBody && this.buttonImg){
                this.endCallBack(this.score);
            }
        }
    };
    ClayGame.prototype.removeUseless = function() {
        bodiesToRemove.map(this.world.DestroyBody, this.world);
    };
    ClayGame.prototype.reload = function(bulletCount){
        this.bullet = bulletCount;
    };
    ClayGame.prototype.makeNewPolygons = function(cbp, segment) {
        var index = [];
        var result = [];
        var temp, temp2;
        var last, first, i, j;

        for(i=0; i<cbp.length; i++){
            if(cbp[i].flag === 'NEW'){
                index.push(i);
            }
        }
        for(i=0; i<index.length; i++){
            if(i<index.length-1){
                temp = [];
                temp = cbp.slice(index[i],index[i+1]+1);
                temp.push(new this.b2Vec2(segment.p1.x, segment.p1.y));
                result.push(temp);
            }else{
                temp2 = [];
                last = index[index.length-1];
                first = index[0];

                for(j=last; j<cbp.length; j++){
                    temp2.push(cbp[j]);
                }
                for(j=0; j<=first; j++){
                    temp2.push(cbp[j]);
                }
                temp2.push(new this.b2Vec2(segment.p1.x, segment.p1.y));
                result.push(temp2);
            }
        }
        return result;
    };
    ClayGame.prototype.sortPoints = function sortPoints(points, segment)  {
        points.sort(function(a,b){
            var aTanA = Math.atan2((a.y - segment.p1.y),(a.x - segment.p1.x));
            var aTanB = Math.atan2((b.y - segment.p1.y),(b.x - segment.p1.x));
            if (aTanA < aTanB){ return -1; }
            else if (aTanB < aTanA){ return 1; }
            return 0;
        });
        return points;
    };
    ClayGame.prototype.start = function start(startR, maxR, worker){
        var clayGame = this, claySizes = [], i;

        this.removeUseless();
        startR = parseInt(startR, 10);
        maxR = parseInt(maxR, 10);
        if(startR <= maxR){
            clayGame.round = startR;
            clayGame.destroyCnt = 0;  //init destroyCnt
            clayGame.reload(parseInt(startR, 10)+Math.floor(startR/2));

            if(perfOpt.webWorker) {
                for(i = 0; i < this.clayImg.length; i++) {
                    claySizes.push({width: this.clayImg[i].width, height: this.clayImg[i].height});
                }
                if(perfOpt.simulateAsync) {
                    worker.postMessage({cmd:'fireAsync', round: startR, max: maxR, claySizes: JSON.stringify(claySizes), useCircle: perfOpt.useCircle});
                    this.timeout = setTimeout(function() {
                        clayGame.bodies = [];
                        clayGame.queue = [];
                        worker.postMessage({cmd: 'startAsync', round: ++startR, max: maxR, claySizes: JSON.stringify(claySizes), useCircle: perfOpt.useCircle});
                        clayGame.start(startR, maxR, worker);
                    }, clayGame.roundInterval);
                } else {
                    worker.postMessage({cmd:'fire', round: startR, max: maxR, claySizes: JSON.stringify(claySizes), useCircle: perfOpt.useCircle});
                    this.timeout = setTimeout(function() {
                        worker.postMessage({cmd: 'start', round: ++startR, max: maxR, claySizes: JSON.stringify(claySizes), useCircle: perfOpt.useCircle});
                        clayGame.start(startR, maxR, worker);
                    }, clayGame.roundInterval);
                }
            } else {
                clayGame.addClay(startR);
                this.timeout = setTimeout(function(){clayGame.start(++startR, maxR);}, clayGame.roundInterval);
            }
        }else{
            clearTimeout(this.timeout);
            clayGame.end();
        }
    };
    ClayGame.prototype.end = function end(){
        this.endFlag = true;
        this.startFlag = false;

        if(this.buttonImg){
            var buttonWidth = (this.buttonImg.width*this.sizeRatio)/this.scale;
            var buttonHeight = (this.buttonImg.height*this.sizeRatio)/this.scale;

            var bodyDef = new this.b2BodyDef();
            bodyDef.type = this.b2Body.b2_staticBody;
            bodyDef.position.x = (this.canvasWidth/2)/this.scale;
            bodyDef.position.y = ((this.canvasHeight/2)+25)/this.scale;
            bodyDef.userData = { button: 'y' };

            var fixDef = new this.b2FixtureDef();
            fixDef.shape = new this.b2PolygonShape();
            fixDef.shape.SetAsBox(buttonWidth/2, buttonHeight/2);

            var button = this.world.CreateBody(bodyDef);
            button.CreateFixture(fixDef);
        }
        if(!!this.gameEndCB){
            this.gameEndCB();
        }
    };
    ClayGame.prototype.gameEndCB = null;


    //GameController Class
    var GameController = function(canvasId){
        this.gameCanvas = new GameCanvas(canvasId);
        this.gameImage = new GameImage();
        this.clayGame = new ClayGame(this.gameCanvas);

        this.canvasId = canvasId;

        this.interVal = null;

        if(perfOpt.simulateAsync) {
            this.clayGame.queue = [];
        }

        //event translation with respect to scaling factor
        this.xScale = 1;
        this.yScale = 1;
    };
    GameController.prototype.init = function(initData){
        var clayGame = this.clayGame;
        var gameCanvas = this.gameCanvas;
        var gameImage = this.gameImage;
        var gameController = this;

        var imageFlag = false;
        var clickOrTouch = ('ontouchstart' in window) ? 'touchstart' : 'mousedown'; //if browser support

        if(!('Worker' in window)) {
            perfOpt.webWorker = false;
        }

        if(perfOpt.domBG && perfOpt.graphicsLayerBG) {
            gameCanvas.canvas.parentElement.style['-webkit-transform'] = 'translateZ(0)';
        }

        if(perfOpt.graphicsLayerCanvas) {
            gameCanvas.canvas.style['-webkit-transform'] = 'translateZ(0)';
        }

        if(perfOpt.webWorker) {
            this.worker = new Worker(initData.workerPath || './box2dSimul.js');
            initData.scale = clayGame.scale;
            initData.sizeRatio = clayGame.sizeRatio;
            initData.canvasHeight = clayGame.canvasHeight;
            initData.canvasWidth = clayGame.canvasWidth;

            if(perfOpt.useCircle) {
                initData.useCircle = perfOpt.useCircle;
            }

            this.worker.postMessage({cmd: 'init', option: initData, fps: perfOpt.frameRate});
            clayGame.bodies = [];

            this.worker.addEventListener('message', function(e) {
                changed = true;
                if(e.data.msg) {
                    console.log(e.data);
                }
                if(e.data.bodies) {
                    clayGame.bodies = e.data.bodies;
                    if(perfOpt.simulateAsync) {
                        clayGame.queue.push(e.data.bodies);
                    }
                }
                if(e.data.cmd) {
                    switch (e.data.cmd) {
                        case 'deleteClay' :
                            clayGame.addScore();
                            clayGame.explosionX = e.data.explosion.x;
                            clayGame.explosionY = e.data.explosion.y;
                            break;
                    }
                }
            }, false);
        }

        //set Round
        clayGame.maxRound = initData.maxRound || perfOpt.maxRound;
        clayGame.frameRate = initData.frameRate || perfOpt.frameRate;
        clayGame.explosionCuts = initData.explosionCuts ||perfOpt.numFragment;
        if(initData.startRound){
            clayGame.startRound = initData.startRound;
        }
        //set Game Point
        if(initData.clayPoint){
            clayGame.clayPoint = initData.clayPoint;
        }
        if(initData.fragmentPoint){
            clayGame.fragmentPoint = initData.fragmentPoint;
        }
        if(initData.clearPoint){
            clayGame.clearPoint = initData.clearPoint;
        }
        //set Game Round Interval
        if(initData.roundInterval){
            clayGame.roundInterval = initData.roundInterval;
        }
        //set Game Clay's Power&Angle
        if(initData.minAngle){
            clayGame.minAngle = initData.minAngle;
        }
        if(initData.maxAngle){
            clayGame.maxAngle = initData.maxAngle;
        }
        if(initData.minPower){
            clayGame.minPower = initData.minPower;
        }
        if(initData.maxPower){
            clayGame.maxPower = initData.maxPower;
        }
        //set Game Image
        if(initData.clayfragmentImg){
            gameImage.fragmentClayImg = gameImage.setImage(initData.clayfragmentImg);
        }
        if(initData.backgroundImg){
            gameImage.backgroundImg = gameImage.setImage(initData.backgroundImg);
        }
        if(initData.targetImg){
            gameImage.targetImg = gameImage.setImage(initData.targetImg);
        }
        if(initData.clayImg){
            for(var i=0; i<initData.clayImg.length; i++){
                gameImage.clayImg[i] = gameImage.setImage(initData.clayImg[i]);
            }
            clayGame.clayImg = gameImage.clayImg;
        }
        if(initData.bulletImg){
            gameImage.bulletImg = gameImage.setImage(initData.bulletImg);
        }
        if(initData.buttonImg){
            gameImage.buttonImg = gameImage.setImage(initData.buttonImg);
            clayGame.buttonImg = gameImage.buttonImg;
        }
        if(initData.endCallBack){
            clayGame.endCallBack = initData.endCallBack;
        }

        //for starting after image load
        gameImage.clayImg[initData.clayImg.length-1].onload = function(e){
            imageFlag = true;
        };

        //eventListener add
        gameCanvas.canvas.addEventListener("mousemove", function(event){
            if(!event){
                event = window.event;
            }
            clayGame.handleMouseMove(event, clayGame);
        }, true);

        gameCanvas.canvas.addEventListener(clickOrTouch, function(e){
            var x = (e.offsetX || (e.clientX && e.clientX - clayGame.canvasPosition.x) || e.touches[0].clientX - clayGame.canvasPosition.x),
                y = (e.offsetY || (e.clientX && e.clientY - clayGame.canvasPosition.y) || e.touches[0].clientY - clayGame.canvasPosition.y);

            if(clayGame.startFlag) {
                e.preventDefault();
                clayGame.mouseX = x;
                clayGame.mouseY = y;

                x = x/gameController.xScale;
                y = y/gameController.yScale;

                if(perfOpt.webWorker) {
                    gameController.worker.postMessage({cmd: "touch", point: {x: x, y: y}});
                } else {
                    clayGame.deleteClay(x, y);
                }
                if(clayGame.bullet > 0 && !clayGame.endFlag) {
                    clayGame.bullet--;
                }
            }
        }, false);

        gameCanvas.canvas.addEventListener('click', function(){
            if(!clayGame.startFlag && imageFlag){
                clayGame.startFlag = true;
                clayGame.start(clayGame.startRound, clayGame.maxRound, gameController.worker);
            }
        }, false);

        // this.clayGame.debugDraw(this.gameCanvas.canvas);

        if(perfOpt.useRequestAnimFrame) {
            (function animate() {
                if(perfOpt.webWorker && !perfOpt.simulateAsync) {
                    gameController.worker.postMessage({cmd: 'update'});
                } else {
                    clayGame.world.Step(1/clayGame.frameRate, perfOpt.velocityIteration, perfOpt.positionIteration);
                    clayGame.world.ClearForces();
                }
                if(changed) {
                    if(perfOpt.simulateAsync && clayGame.queue.length) {
                        clayGame.bodies = clayGame.queue.splice(0, 1)[0];
                    }
                    gameController.update();
                }
                raf(animate);
            }());
        } else {
            gameController.interVal = window.setInterval(function(){
                if(perfOpt.webWorker && !perfOpt.simulateAsync) {
                    gameController.worker.postMessage({cmd: 'update'});
                } else if(!perfOpt.webWorker) {
                    clayGame.world.Step(1/clayGame.frameRate, 6, 2);
                    clayGame.world.ClearForces();
                }
                if(changed) {
                    if(perfOpt.simulateAsync && clayGame.queue.length) {
                        clayGame.bodies = clayGame.queue.splice(0, 1)[0];
                    }
                    gameController.update();
                }
            }, 1000 / clayGame.frameRate);
        }
    };
    GameController.prototype.update = function(screenCapture) {
        var clayGame = this.clayGame;
        var gameCanvas = this.gameCanvas;
        var gameImage = this.gameImage;
        var clayImg, pos, b, len, i, x, y,
            bodies = clayGame.bodies;

        len = clayGame.bodies.length;
        if(perfOpt.clearHackEnabled) {
            gameCanvas.canvas.width = gameCanvas.canvas.width;
        } else {
            if(perfOpt.clearEntireCanvas) {
                gameCanvas.context.clearRect(0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
            } else {
                // need to be fixed
                gameCanvas.context.clearRect(0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
            }
        }
        if(!perfOpt.disableBG) {
            if(!perfOpt.domBG) {
                gameCanvas.context.drawImage(gameImage.backgroundImg, 0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
            } else {
                var wrapper = gameCanvas.canvas.parentElement;

                wrapper.style.background = "#ffffff url(" + gameImage.backgroundImg.src + ") no-repeat top left";
                wrapper.style['background-size'] = "100% 100%";
            }
        }

        clayGame.world.DrawDebugData();

        if(perfOpt.webWorker) {

            if(clayGame.startFlag) {
                gameCanvas.context.font= 20*clayGame.sizeRatio+"px Arial";
                gameCanvas.context.fillStyle = 'black';
                gameCanvas.context.fillText("score : "+clayGame.score, gameCanvas.canvasWidth-(100*clayGame.sizeRatio), 30*clayGame.sizeRatio);

                for(i=0; i<clayGame.bullet; i++){
                    gameCanvas.context.drawImage(gameImage.bulletImg, gameCanvas.canvasWidth-(clayGame.sizeRatio*(160+i*30)), 10*clayGame.sizeRatio, gameImage.bulletImg.width*clayGame.sizeRatio, gameImage.bulletImg.height*clayGame.sizeRatio);
                }

                for(i = 0; i < len; i++) {
                    b = bodies[i];
                    if(b.bodyType === clayGame.b2Body.b2_dynamicBody && !b.fragment){
                        clayImg = gameImage.clayImg[b.clayNum];
                        x = b.center.x * clayGame.scale;
                        y = b.center.y * clayGame.scale;
                        if(perfOpt.avoidFloatPoint) {
                            x = Math.round(x);
                            y = Math.round(y);
                        }
                        gameCanvas.context.save();
                        gameCanvas.context.translate(x,y);
                        gameCanvas.context.rotate(b.angle);
                        gameCanvas.context.drawImage(clayImg, -(clayImg.width*clayGame.sizeRatio)/2, -(clayImg.height*clayGame.sizeRatio)/2, (perfOpt.imageScale ? clayImg.width*clayGame.sizeRatio : clayImg.width), (perfOpt.imageScale ? clayImg.height*clayGame.sizeRatio : clayImg.height));
                        gameCanvas.context.restore();
                    }else if(b.bodyType === clayGame.b2Body.b2_dynamicBody && b.fragment){
                        gameCanvas.context.save();
                        gameCanvas.context.translate(b.center.x * clayGame.scale, b.center.y * clayGame.scale);
                        gameCanvas.context.rotate(b.angle);
                        gameCanvas.context.drawImage(gameImage.fragmentClayImg, 0, 0, gameImage.fragmentClayImg.width*clayGame.sizeRatio, gameImage.fragmentClayImg.height*clayGame.sizeRatio);
                        gameCanvas.context.restore();
                    }
                }

                gameCanvas.context.drawImage(gameImage.targetImg, clayGame.mouseX/this.xScale-(gameImage.targetImg.width/2)*clayGame.sizeRatio, clayGame.mouseY/this.yScale-(gameImage.targetImg.height/2)*clayGame.sizeRatio, gameImage.targetImg.width*clayGame.sizeRatio, gameImage.targetImg.height*clayGame.sizeRatio);

                if(clayGame.bonusFlag){
                    gameCanvas.context.font= 20*clayGame.sizeRatio+"px Arial";
                    gameCanvas.context.fillStyle = 'yellow';
                    gameCanvas.context.fillText("Clear! Bonus "+clayGame.clearPoint+"point!!", clayGame.explosionX*clayGame.scale, clayGame.explosionY*clayGame.scale);
                }
            } else if(clayGame.endFlag) {
                gameCanvas.context.font= 30*clayGame.sizeRatio+"px Arial";
                gameCanvas.context.fillStyle = 'red';
                gameCanvas.context.fillText("Game Over !! Score : "+clayGame.score, (gameCanvas.canvasWidth/2)-(150*clayGame.sizeRatio), (gameCanvas.canvasHeight/2));
                changed = false;
            } else {
                gameCanvas.context.font= 30*clayGame.sizeRatio+"px Arial";
                gameCanvas.context.fillStyle = 'blue';
                gameCanvas.context.fillText("Touch the screen!", (gameCanvas.canvasWidth/2)-(120*clayGame.sizeRatio), (gameCanvas.canvasHeight/2));
                changed = false;
            }
        }

        else {

            if(clayGame.endFlag){
                gameCanvas.context.font= 30*clayGame.sizeRatio+"px Arial";
                gameCanvas.context.fillStyle = 'red';
                gameCanvas.context.fillText("Game Over !! Score : "+clayGame.score, (gameCanvas.canvasWidth/2)-(150*clayGame.sizeRatio), (gameCanvas.canvasHeight/2));

                gameCanvas.context.save();
                for (b = clayGame.world.GetBodyList() ; b; b = b.GetNext()){
                    if(b.GetType() === clayGame.b2Body.b2_staticBody && b.GetUserData() !== null && b.GetUserData().button === "y"){
                        pos = b.GetWorldCenter();
                        gameCanvas.context.translate(pos.x * clayGame.scale, pos.y * clayGame.scale);
                        gameCanvas.context.drawImage(gameImage.buttonImg, -(gameImage.buttonImg.width*clayGame.sizeRatio)/2, -(gameImage.buttonImg.height*clayGame.sizeRatio)/2, gameImage.buttonImg.width*clayGame.sizeRatio, gameImage.buttonImg.height*clayGame.sizeRatio);
                    }
                }
                gameCanvas.context.restore();
                changed = false;
            }else if(clayGame.startFlag){
                gameCanvas.context.font= 20*clayGame.sizeRatio+"px Arial";
                gameCanvas.context.fillStyle = 'black';
                gameCanvas.context.fillText("Score : "+clayGame.score, gameCanvas.canvasWidth-(100*clayGame.sizeRatio), 30*clayGame.sizeRatio);

                for(i=0; i<clayGame.bullet; i++){
                    gameCanvas.context.drawImage(gameImage.bulletImg, gameCanvas.canvasWidth-(clayGame.sizeRatio*(160+i*30)), 10*clayGame.sizeRatio, gameImage.bulletImg.width*clayGame.sizeRatio, gameImage.bulletImg.height*clayGame.sizeRatio);
                }

                for (b = clayGame.world.GetBodyList() ; b; b = b.GetNext()){
                    pos = b.GetWorldCenter();
                    if(b.GetType() === clayGame.b2Body.b2_dynamicBody && b.GetUserData().fragment === 'n'){
                        clayImg = gameImage.clayImg[b.GetUserData().clayNum];
                        gameCanvas.context.save();
                        gameCanvas.context.translate(pos.x * clayGame.scale, pos.y * clayGame.scale);
                        gameCanvas.context.drawImage(clayImg, -(clayImg.width*clayGame.sizeRatio)/2, -(clayImg.height*clayGame.sizeRatio)/2, clayImg.width*clayGame.sizeRatio, clayImg.height*clayGame.sizeRatio);
                        gameCanvas.context.restore();
                    }else if(b.GetType() === clayGame.b2Body.b2_dynamicBody && b.GetUserData().fragment === 'y'){
                        gameCanvas.context.save();
                        gameCanvas.context.translate(pos.x * clayGame.scale, pos.y * clayGame.scale);
                        gameCanvas.context.rotate((b.GetAngle()));
                        gameCanvas.context.drawImage(gameImage.fragmentClayImg, 0, 0, gameImage.fragmentClayImg.width*clayGame.sizeRatio, gameImage.fragmentClayImg.height*clayGame.sizeRatio);
                        gameCanvas.context.restore();
                    }
                }
                gameCanvas.context.drawImage(gameImage.targetImg, clayGame.mouseX/this.xScale-(gameImage.targetImg.width/2)*clayGame.sizeRatio, clayGame.mouseY/this.yScale-(gameImage.targetImg.height/2)*clayGame.sizeRatio, gameImage.targetImg.width*clayGame.sizeRatio, gameImage.targetImg.height*clayGame.sizeRatio);

                if(clayGame.bonusFlag){
                    gameCanvas.context.font= 20*clayGame.sizeRatio+"px Arial";
                    gameCanvas.context.fillStyle = 'yellow';
                    gameCanvas.context.fillText("Clear! Bonus "+clayGame.clearPoint+"point!!", clayGame.explosionX*clayGame.scale, clayGame.explosionY*clayGame.scale);
                }
            }else{
                gameCanvas.context.clearRect(0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
                gameCanvas.context.font= 30*clayGame.sizeRatio+"px Arial";
                gameCanvas.context.fillStyle = 'blue';
                gameCanvas.context.fillText("Touch the screen!", (gameCanvas.canvasWidth/2)-(120*clayGame.sizeRatio), (gameCanvas.canvasHeight/2));
                changed = false;
            }
        }
        if(!!screenCapture) {
            return this.gameCanvas.canvas.toDataURL();
        }
    };
    // GameController.prototype.setCanvas = function(canvasId) {
    //     this.gameCanvas.setCanvas(canvasId);
    //     this.clayGame.setCanvas(this.gameCanvas);

    //     this.xScale = this.gameCanvas.cssWidth/640;
    //     this.yScale = this.gameCanvas.cssHeight/480;

    //     this.update();
    // };
    GameController.prototype.setSizeScale = function(xScale, yScale) {
        this.xScale = this.xScale*xScale;
        this.yScale = this.yScale*yScale;
    };
    GameController.prototype.captureScreenShot = function() {
        return this.update(true);
    };

    window.GameController = GameController;
})(window);