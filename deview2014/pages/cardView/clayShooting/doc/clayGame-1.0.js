    //ClayGame-1.0.js
    //Using Box2dweb

    //Sound Add Using Howler Audio Framework https://github.com/goldfire/howler.js
    var fireSound = new Howl({ urls: ['./sound/firesound.mp3']});
    var collisionSound = new Howl({ urls: ['./sound/collisionsound.mp3']});

    //GameImage Class
    var GameImage = function(){
        this.clayImg = [];
        this.targetImg = null;
        this.backgroundImg = null;
        this.fragmentClayImg = null;
        this.bulletImg = null;
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
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        // this.canvasWidth = this.canvas.offsetParent.clientWidth;
        // this.canvasHeight = this.canvas.offsetParent.clientHeight;
    };

    //Game Class
    var Game = function(gameCanvas){
        this.world = new this.b2World(new this.b2Vec2(0, 9.8),true);
        this.segment = new this.b2Segment();
        this.canvasPosition = null;
        this.mouseX = 0;
        this.mouseY = 0;
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
    Game.prototype.b2ContactListener = Box2D.Dynamics.b2ContactListener;

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
        return {x: $(canvas).offset().left, y: $(canvas).offset().top};
    };
    Game.prototype.getBodyAtMouse = function(){
        var game = this;
        this.mousePVec = new this.b2Vec2(this.mouseX, this.mouseY);

        // Query the world for overlapping shapes.
        this.selectedBody = null;
        this.world.QueryPoint(function(fixture){game.getBodyCB(fixture, game);}, this.mousePVec);
        return this.selectedBody;
    };
    Game.prototype.getBodyCB = function(fixture, game){
        if(fixture.GetBody().GetType() !== game.b2Body.b2_staticBody){
            if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), game.mousePVec)){
                game.selectedBody = fixture.GetBody();
                return false;
            }
        }
        return true;
    };
    Game.prototype.handleMouseMove = function(e, game){
        game.mouseX = (e.clientX - game.canvasPosition.x) / game.scale;
        game.mouseY = (e.clientY - game.canvasPosition.y) / game.scale;
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
        this.collisionListener = new this.b2ContactListener;
        this.collisionListener.BeginContact = function(contact){
            if(contact.GetFixtureA().GetBody().GetUserData().fragment === 'n' && contact.GetFixtureB().GetBody().GetUserData().fragment === 'n'){
                collisionSound.play();
            }
        }
    };
    ClayGame.prototype = new Game();
    ClayGame.prototype.addScore = function(clickedBody){
        if(clickedBody.GetUserData().fragment === "n"){
            var clayGame = this;
            this.score += parseInt(this.clayPoint,10); //clay
            this.destroyCnt += 1;
            if(this.destroyCnt === this.round){ //if user clear all of clay
                this.bonusFlag = true;
                this.score += parseInt(this.clearPoint, 10);
                setTimeout(function(){clayGame.bonusFlag = false;}, 2000);
            }
        }else{
            this.score += parseInt(this.fragmentPoint, 10); //clayfragment
        }
    };
    ClayGame.prototype.addFragmentClay = function(clickedBody){
        var closestFraction = 1;
        var rayLength = 25;

        this.explosionX = this.mouseX;
        this.explosionY = this.mouseY;

        var cutAngle = 0;
        var stepAngle = (360/this.explosionCuts)*(Math.PI/180);

        var bodyVertices = clickedBody.GetFixtureList().GetShape().GetVertices();
        var bodyPoints = [];

        var input, output;

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

        for(i=0; i<bodyVertices.length; i++){
            bodyPoints.push(clickedBody.GetWorldPoint(bodyVertices[i]));
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
        }
    };
    ClayGame.prototype.addClay = function(count){
        var force, angle, power;
        var clayNum, clayWidth, clayHeight, clay;

        //clay Bodydef, Fixturedef setting
        var fixDef = new this.b2FixtureDef();
        fixDef.density = 1;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;

        var bodyDef = new this.b2BodyDef();
        bodyDef.type = this.b2Body.b2_dynamicBody;

        for(var i = 0; i < count; ++i){
            clayNum = Math.floor(Math.random()*this.clayImg.length);
            clayWidth = (this.clayImg[clayNum].width*this.sizeRatio)/this.scale;
            clayHeight = (this.clayImg[clayNum].height*this.sizeRatio)/this.scale;

            fixDef.density = 1250/(this.clayImg[clayNum].width*this.clayImg[clayNum].height); //m and d are inverse proportion
            fixDef.shape = new this.b2PolygonShape();
            fixDef.shape.SetAsBox(clayWidth/2, clayHeight/2); //clay size

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
        }
    };
    ClayGame.prototype.deleteClay = function(clayGame){
        if(clayGame.bullet > 0){
            clayGame.bullet--;
            fireSound.play();
            var clickedBody = clayGame.getBodyAtMouse();
            if(clickedBody !== null){
                clayGame.addFragmentClay(clickedBody);
                clayGame.world.DestroyBody(clickedBody);
                clayGame.addScore(clickedBody);
            }
        }
    };
    ClayGame.prototype.reload = function(bulletCount){
        this.bullet = bulletCount;
    };
    ClayGame.prototype.makeNewPolygons = function(cbp, segment) {
        var index = [];
        var result = [];
        var temp, temp2;
        var last, first;

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
    ClayGame.prototype.start = function start(startR, maxR){
        var clayGame = this;
        startR = parseInt(startR, 10);
        maxR = parseInt(maxR, 10);
        if(startR<=maxR){
            clayGame.round = startR;
            clayGame.destroyCnt = 0;  //init destroyCnt
            clayGame.reload(parseInt(startR, 10)+Math.floor(startR/2));
            clayGame.addClay(startR);
            setTimeout(function(){clayGame.start(++startR, maxR);}, clayGame.roundInterval);
        }else{
            clayGame.end();
        }
    };
    ClayGame.prototype.end = function end(){
        this.endFlag = true;
    };

    //GameController Class
    var GameController = function(canvasId){
        if(canvasId === "debugGame"){
            this.debugMode = true;
        }
        this.gameCanvas = new GameCanvas(canvasId);
        this.gameImage = new GameImage();
        this.clayGame = new ClayGame(this.gameCanvas);
        this.interval = null;
    };
    GameController.prototype.init = function(initData){
        var clayGame = this.clayGame;
        var gameCanvas = this.gameCanvas;
        var gameImage = this.gameImage;
        var gameController = this;

        var imageFlag = false;
        var clickortouch = ('ontouchstart' in window) ? 'touchstart' : 'mousedown'; //if browser support

        //set Round
        if(initData.maxRound){
            clayGame.maxRound = initData.maxRound;
        }
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
        //set Game explosionCuts
        if(initData.explosionCuts){
            clayGame.explosionCuts = initData.explosionCuts;
        }
        //set Game frame
        if(initData.frameRate){
            clayGame.frameRate = initData.frameRate;
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
            for(i=0; i<initData.clayImg.length; i++){
                gameImage.clayImg[i] = gameImage.setImage(initData.clayImg[i]);
            }
            clayGame.clayImg = gameImage.clayImg;
        }
        if(initData.bulletImg){
            gameImage.bulletImg = gameImage.setImage(initData.bulletImg);
        }

        //for starting after image load
        gameImage.clayImg[initData.clayImg.length-1].onload = function(e){
            imageFlag = true;
        };
        gameCanvas.canvas.addEventListener("mousemove", function(event){
            if(!event){
                event = window.event;
            }
            clayGame.handleMouseMove(event, clayGame);
        }, true);
        gameCanvas.canvas.addEventListener(clickortouch, function(){
            clayGame.deleteClay(clayGame);
        }, true);
        gameCanvas.canvas.addEventListener('click', function(){
            if(!clayGame.startFlag && imageFlag){
                clayGame.startFlag = true;
                clayGame.start(clayGame.startRound, clayGame.maxRound);
            }
        }, true);

        this.clayGame.debugDraw(this.gameCanvas.canvas);
        this.interval = window.setInterval(function(){gameController.update(gameController);}, 1000 / clayGame.frameRate);
    };
    GameController.prototype.update = function(gameController) {
        var clayGame = gameController.clayGame;
        var gameCanvas = gameController.gameCanvas;
        var gameImage = gameController.gameImage;
        var clayImg;

        clayGame.world.Step(1/clayGame.frameRate, 6, 2);
        clayGame.world.DrawDebugData(); //for debuging
        clayGame.world.ClearForces();
        clayGame.world.SetContactListener(clayGame.collisionListener);

        if(clayGame.endFlag){
            gameCanvas.context.clearRect(0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
            if(!gameController.debugMode){
                gameCanvas.context.drawImage(gameImage.backgroundImg, 0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
            }
            gameCanvas.context.font= 30*clayGame.sizeRatio+"px Arial";
            gameCanvas.context.fillStyle = 'red';
            gameCanvas.context.fillText("Game Over !! Score : "+clayGame.score, (gameCanvas.canvasWidth/2)-(150*clayGame.sizeRatio), (gameCanvas.canvasHeight/2));
        }else if(clayGame.startFlag){
            if(!gameController.debugMode){
                gameCanvas.context.drawImage(gameImage.backgroundImg, 0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
            }
            gameCanvas.context.font= 20*clayGame.sizeRatio+"px Arial";
            gameCanvas.context.fillStyle = 'black';
            gameCanvas.context.fillText("Score : "+clayGame.score, gameCanvas.canvasWidth-(100*clayGame.sizeRatio), 30*clayGame.sizeRatio);

            for(var i=0; i<clayGame.bullet; i++){
                gameCanvas.context.drawImage(gameImage.bulletImg, gameCanvas.canvasWidth-(clayGame.sizeRatio*(160+i*30)), 10*clayGame.sizeRatio, gameImage.bulletImg.width*clayGame.sizeRatio, gameImage.bulletImg.height*clayGame.sizeRatio);
            }

            for (b = clayGame.world.GetBodyList() ; b; b = b.GetNext()){
                var pos = b.GetWorldCenter();
                if(b.GetType() === clayGame.b2Body.b2_dynamicBody && b.GetUserData().fragment === 'n'){
                    clayImg = gameImage.clayImg[b.GetUserData().clayNum];
                    gameCanvas.context.save();
                    gameCanvas.context.translate(pos.x * clayGame.scale, pos.y * clayGame.scale);
                    gameCanvas.context.rotate((b.GetAngle()));
                    if(!gameController.debugMode){
                        gameCanvas.context.drawImage(clayImg, -(clayImg.width*clayGame.sizeRatio)/2, -(clayImg.height*clayGame.sizeRatio)/2, clayImg.width*clayGame.sizeRatio, clayImg.height*clayGame.sizeRatio);
                    }
                    gameCanvas.context.restore();
                }else if(b.GetType() === clayGame.b2Body.b2_dynamicBody && b.GetUserData().fragment === 'y'){
                    gameCanvas.context.save();
                    gameCanvas.context.translate(pos.x * clayGame.scale, pos.y * clayGame.scale);
                    gameCanvas.context.rotate((b.GetAngle()));
                    if(!gameController.debugMode){
                        gameCanvas.context.drawImage(gameImage.fragmentClayImg, 0, 0, gameImage.fragmentClayImg.width*clayGame.sizeRatio, gameImage.fragmentClayImg.height*clayGame.sizeRatio);
                    }
                    gameCanvas.context.restore();
                }
            }
            gameCanvas.context.drawImage(gameImage.targetImg, clayGame.mouseX*clayGame.scale-(gameImage.targetImg.width/2)*clayGame.sizeRatio, clayGame.mouseY*clayGame.scale-(gameImage.targetImg.height/2)*clayGame.sizeRatio, gameImage.targetImg.width*clayGame.sizeRatio, gameImage.targetImg.height*clayGame.sizeRatio);

            if(clayGame.bonusFlag){
                gameCanvas.context.font= 20*clayGame.sizeRatio+"px Arial";
                gameCanvas.context.fillStyle = 'yellow';
                gameCanvas.context.fillText("Clear! Bonus "+clayGame.clearPoint+"point!!", clayGame.explosionX*clayGame.scale, clayGame.explosionY*clayGame.scale);
            }
        }else{
            gameCanvas.context.clearRect(0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
            if(!gameController.debugMode){
                gameCanvas.context.drawImage(gameImage.backgroundImg, 0, 0, gameCanvas.canvasWidth, gameCanvas.canvasHeight);
            }
            gameCanvas.context.font= 30*clayGame.sizeRatio+"px Arial";
            gameCanvas.context.fillStyle = 'blue';
            gameCanvas.context.fillText("Touch the screen!", (gameCanvas.canvasWidth/2)-(120*clayGame.sizeRatio), (gameCanvas.canvasHeight/2));
        }
    };