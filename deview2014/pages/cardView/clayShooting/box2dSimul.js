importScripts('./box2dweb.js');

var claySimulator,
    fired = false;

self.addEventListener('message', function(e) {
	switch(e.data.cmd) {
        case 'init' :
            e.data.option.frameRate = e.data.fps || e.data.option.frameRate;
            claySimulator = new claySimulator(e.data.option);
            break;
        case 'fire' :
            if(!fired) {
                claySimulator.bullet = parseInt(e.data.round, 10)+Math.floor(e.data.round/2);
                claySimulator.useCircle = e.data.useCircle;
                claySimulator.addClay(parseInt(e.data.round, 10), JSON.parse(e.data.claySizes));
                fired = true;
            }
            break;
        case 'start' :
            if(e.data.round > e.data.maxR) {
                break;
            }
            claySimulator.bullet = parseInt(e.data.round, 10)+Math.floor(e.data.round/2);
            claySimulator.useCircle = e.data.useCircle;
            claySimulator.addClay(parseInt(e.data.round, 10), JSON.parse(e.data.claySizes));
            break;
        case 'update' :
            claySimulator.update();
            break;
        case 'fireAsync' :
            if(!fired) {
                if(claySimulator.running){
                    claySimulator.stopSimulate();
                    claySimulator.cnt = 0;
                }
                claySimulator.bullet = parseInt(e.data.round, 10)+Math.floor(e.data.round/2);
                claySimulator.useCircle = e.data.useCircle;
                claySimulator.addClay(parseInt(e.data.round, 10), JSON.parse(e.data.claySizes));
                claySimulator.stop = false;
                claySimulator.startSimulate();
                fired = true;
            }
            break;
        case 'startAsync':
            if(e.data.round > e.data.maxR) {
                break;
            }
            if(claySimulator.running){
                claySimulator.stopSimulate();
                claySimulator.cnt = 0;
            }
            claySimulator.bullet = parseInt(e.data.round, 10)+Math.floor(e.data.round/2);
            claySimulator.useCircle = e.data.useCircle;
            claySimulator.addClay(parseInt(e.data.round, 10), JSON.parse(e.data.claySizes));
            claySimulator.stop = false;
            claySimulator.startSimulate();
            break;
        case 'touch' :
			clickHandler(e.data.point);
	}
});

var claySimulator = function(opt) {
	this.world = new this.b2World(new this.b2Vec2(0, 9.8),true);
    this.bodies = [];
    this.startFlag = false;
    this.endFlag = false;
    this.bonusFlag = false;
    this.bullet = 0;
    this.round = 0;
    this.destroyCnt = 0;
    this.score = 0;

    options = {};

    //user set variable
    this.maxRound = 1;
    this.startRound = 1;  //round equals number of clay
    this.roundInterval = 5000;
    this.explosionCuts = 12;
    this.clayPoint = 5;
    this.fragmentPoint = 100;
    this.clearPoint = 100;
    this.minAngle = 50;
    this.maxAngle = 65;
    this.minPower = 20;
    this.maxPower = 25;
    this.frameRate = 50;
    //clay info
    this.buttonImg = null;

    this.endCallBack = null;

    this.segment = new this.b2Segment();
    this.canvasPosition = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mousePVec = null;
    this.selectedBody = null;
    //explosion coordiates
    this.explosionX = 0;
    this.explosionY = 0;
    this.cnt = 0;

    if(opt) {
        extend(this, opt);
    }
};

claySimulator.prototype.b2Vec2 = Box2D.Common.Math.b2Vec2;
claySimulator.prototype.b2BodyDef = Box2D.Dynamics.b2BodyDef;
claySimulator.prototype.b2Body = Box2D.Dynamics.b2Body;
claySimulator.prototype.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
claySimulator.prototype.b2Fixture = Box2D.Dynamics.b2Fixture;
claySimulator.prototype.b2World = Box2D.Dynamics.b2World;
claySimulator.prototype.b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
claySimulator.prototype.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
claySimulator.prototype.b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
claySimulator.prototype.b2AABB = Box2D.Collision.b2AABB;
claySimulator.prototype.b2Segment = Box2D.Collision.b2Segment;

claySimulator.prototype.startSimulate = function() {
    this.running = true;
    while(this.cnt < 200) {
        if(this.stop) {
            this.stop = false;
            return;
        }
        this.cnt++;
        this.update();
    }
};
claySimulator.prototype.stopSimulate = function() {
    this.running = false;
    this.stop = true;
};
claySimulator.prototype.deleteClay = function(x, y){
    var clickedBody;

    x = x/this.scale;
    y = y/this.scale;
    if(this.bullet > 0 && !this.endFlag){
        this.bullet--;
        clickedBody = this.getBodyAtMouse('dynamics', x, y);
        if(clickedBody){
            this.addFragmentClay(clickedBody, x, y);
            this.world.DestroyBody(clickedBody);
            self.postMessage({cmd: 'deleteClay', explosion: {x: x, y:y}});
        }
    }else if(this.endFlag){
        clickedBody = this.getBodyAtMouse('statics', x, y);
        if(clickedBody && this.buttonImg){
            this.endCallBack(this.score);
        }
    }
};
claySimulator.prototype.getBodyAtMouse = function(bodyType, x, y){
    var mousePVec = new this.b2Vec2(x, y), self = this;

    // Query the world for overlapping shapes.
    this.selectedBody = null;
    this.world.QueryPoint(function(fixture){self.getBodyCB(fixture, bodyType, mousePVec);}, mousePVec);
    return this.selectedBody;
};
claySimulator.prototype.getBodyCB = function(fixture, bodyType, mousePVec){
    if(bodyType === 'dynamics'){
        if(fixture.GetBody().GetType() !== this.b2Body.b2_staticBody){
            if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)){
                this.selectedBody = fixture.GetBody();
                return false;
            }
        }
    }else if(bodyType === 'statics'){
        if(fixture.GetBody().GetType() === this.b2Body.b2_staticBody){
            if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)){
                this.selectedBody = fixture.GetBody();
                return false;
            }
        }
    }
    return true;
};
claySimulator.prototype.addFragmentClay = function(clickedBody, x, y){
    var closestFraction = 1;
    var rayLength = 25;

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

    if(!this.useCircle) {
        var bodyVertices = clickedBody.GetFixtureList().GetShape().GetVertices();
        for(i=0; i<bodyVertices.length; i++){
            bodyPoints.push(clickedBody.GetWorldPoint(bodyVertices[i]));
        }
    }

    for(i=0; i<this.explosionCuts; i++){
        this.segment.p1 = new this.b2Vec2(x, y);
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
claySimulator.prototype.sortPoints = function sortPoints(points, segment)  {
    points.sort(function(a,b){
        var aTanA = Math.atan2((a.y - segment.p1.y),(a.x - segment.p1.x));
        var aTanB = Math.atan2((b.y - segment.p1.y),(b.x - segment.p1.x));
        if (aTanA < aTanB){ return -1; }
        else if (aTanB < aTanA){ return 1; }
        return 0;
    });
    return points;
};
claySimulator.prototype.addClay = function(count, claySizes){
    var force, angle, power, t,
        clayNum, clayWidth, clayHeight, clay,
        shape = this.useCircle ? this.b2CircleShape : this.b2PolygonShape;

    //clay Bodydef, Fixturedef setting
    var fixDef = new this.b2FixtureDef();
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new this.b2BodyDef();
    bodyDef.type = this.b2Body.b2_dynamicBody;

    for(var i = 0; i < count; ++i){
        clayNum = Math.floor(Math.random() * claySizes.length);
        clayWidth = (claySizes[clayNum].width * this.sizeRatio)/this.scale;
        clayHeight = (claySizes[clayNum].height * this.sizeRatio)/this.scale;

        fixDef.shape = new shape();
        if(this.useCircle) {
            fixDef.shape.SetRadius(Math.min(clayWidth, clayHeight)/2);
        } else {
            fixDef.shape.SetAsBox(clayWidth/2, clayHeight/2);
        }

        fixDef.density = this.useCircle? 0.42/fixDef.shape.GetRadius() : 1250/(claySizes[clayNum].width * claySizes[clayNum].height); //m and d are inverse proportion

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
        } else{
            t = Math.random();
            angle = parseInt(this.minAngle,10) + (this.maxAngle-this.minAngle)*t;
            t = Math.random();
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

claySimulator.prototype.update = function() {
    // self.postMessage({msg: "updating async simul"});
    this.world.Step(1/this.frameRate, 6, 2);
    // this.world.DrawDebugData(); //for debuging
    this.world.ClearForces();
    linearize(this.world.GetBodyList());
};

claySimulator.prototype.makeNewPolygons = function(cbp, segment) {
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

claySimulator.prototype.end = function (){
    this.endFlag = true;

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
};

function clickHandler(point) {
	var x = point.x,
		y = point.y;

	claySimulator.deleteClay(x, y);
}

function extend(target, from) {
    if (!target) {
        target = {};
    }

    for(var i in from) {
        target[i] = from[i];
    }

    return target;
}

function linearize(list) {
    var result = [], item, tmp, dynamic = false;

    for(item = list; item; item = item.GetNext()) {
        tmp = {};
        tmp.center = {x: item.GetWorldCenter().x, y: item.GetWorldCenter().y};
        tmp.angle = item.GetAngle();
        tmp.fragment = item.GetUserData() && (item.GetUserData().fragment === 'y');
        tmp.bodyType = item.GetType();
        tmp.clayNum = item.GetUserData() && item.GetUserData().clayNum;
        result.push(tmp);

        if(tmp.bodyType !== 0) {
            dynamic = true;
        }
    }

    if(dynamic) {
        self.postMessage({bodies: result});
    }

    return result;
}
