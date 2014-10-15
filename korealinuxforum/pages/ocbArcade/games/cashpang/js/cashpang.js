define("ocb/cashpang", ['pwge/util'], function(util){

    var common = {
        totalTypes: 7,
        types: ["white", "yellow", "orange", "purple", "blue", "green", "red"],
        specialTypes: {3: "bomb", 4: "cross", 5: "bomb", 6: "cross"},
        boardWidth: 8,
        boardHeight: 8,
        gemWidth: 135,
        gemHeight: 135,
        pangAnimWidth: 180,
        pangAnimHeight: 180,
        // comboTimer: 2500,
        // initialComboTimer: 2500,
        // minComboTimer: 1412,
        // comboTimerDesc: 68,
        // comboCnt: 5,
        comboTimer: 2000,
        initialComboTimer: 2000,
        minComboTimer: 1412,
        comboTimerDesc: 150,
        comboCnt: 5,

        eachPoint: 250,
        comboBonus: 750,
        // maxComboBonus: 6000,
        maxComboBonus: 6000,

        // matchPoint: 750,
        // cascadeBonus: 750,
        bombBonus: 2000,
        crossBonus: 5000,

        // comboBonusIncr: 550,
        animationDuration: 150,
        offsetY: 80
    },
    mobile = 'ontouchstart' in window,
    START_EV = mobile ? 'touchstart' : 'mousedown',
    MOVE_EV = mobile ? 'touchmove' : 'mousemove',
    END_EV = mobile ? 'touchend' : 'mouseup';

    var testMatrix =
    [
        5, 1, 5, 5, 4, 5, 6, 0,
        1, 5, 4, 4, 5, 3, 3, 5,
        2, 3, 2, 5, 3, 3, 0, 3,
        3, 3, 2, 2, 3, 2, 1, 3,
        4, 0, 6, 3, 1, 5, 3, 0,
        5, 6, 0, 1, 1, 4, 3, 5,
        6, 0, 2, 2, 3, 2, 5, 6,
        0, 0, 3, 2, 2, 4, 6, 0
    ];
    // [0,1,2,3,4,3,6,4,
    // 1,2,3,4,5,6,3,6,
    // 2,3,4,5,6,0,1,2,
    // 3,4,5,6,0,1,2,3,
    // 4,5,6,0,1,2,3,4,
    // 5,6,0,1,2,3,4,5,
    // 6,0,1,2,3,4,5,6,
    // 0,1,2,3,4,5,6,0];
   // [
   //     0, 1, 5, 1, 2, 1, 5, 0,
   //     1, 6, 5, 4, 5, 6, 4, 5,
   //     4, 3, 2, 5, 5, 3, 3, 2,
   //     2, 2, 6, 2, 3, 0, 2, 0,
   //     4, 0, 1, 3, 5, 2, 3, 1,
   //     5, 4, 1, 6, 6, 3, 1, 5,
   //     6, 2, 6, 5, 0, 2, 5, 6,
   //     0, 0, 3, 2, 2, 4, 6, 0
   // ];
    // [0, 5, 3, 5, 5, 5, 1, 4,
    // 3, 0, 3, 3, 3, 2, 4, 4,
    // 6, 4, 3, 6, 0, 2, 6, 1,
    // 0, 2, 5, 4, 1, 1, 3, 1,
    // 5, 1, 4, 1, 4, 0, 5, 2,
    // 4, 6, 4, 0, 3, 4, 0, 1,
    // 6, 0, 6, 5, 5, 5, 2, 3,
    // 4, 1, 0, 2, 2, 6, 5, 6];

    var DEBUG = false;

    /* Match 3 Game Class */
    var Cashpang = function (option) {
        var self = this;
        util.extend(this, common, option);
        // util.extend(this, option);
        this.board = [];
        // this.gemCnts = {};
        this.registry = {};

        this.judge = this.game.entityPool.allocate().disable();
        this.judge.step = (function() {
            this.cascade(true);
        }).bind(this);

        this.hint = this.game.entityPool.allocate({
            x: -100,
            y: -100,
            z: 3,
            width: this.gemWidth,
            height: this.gemHeight,
            anchorX: this.gemWidth/2,
            anchorY: this.gemHeight/2
        }).disable();

        this.selected = this.game.entityPool.allocate({
            x: -100,
            y: -100,
            z: 4,
            width: this.gemWidth,
            height: this.gemHeight,
            anchorX: this.gemWidth/2,
            anchorY: this.gemHeight/2
        }).disable();

        this._onTouchstart = this.onTouchstart.bind(this);
        this._onTouchend = this.onTouchEnd.bind(this);
        this.moveHandler = this.onTouchMove.bind(this);

        this.game.input.on(START_EV, this._onTouchstart);
        this.game.input.on(END_EV, this._onTouchend);
        this.game.input.on('touchcancel', this._onTouchend);

        this.on("pause", function(duration) {
            duration = duration || self.animationDuration;
            self.touchable = false;
            setTimeout(function() {
                self.touchable = true;
            }, duration);

            self.comboTimer += duration;
        });

        this.on("abort", function(){
            if (typeof self.gameoverTimer !== "undefined") {
                clearTimeout(self.gameoverTimer);
            }
            self.touchable = false;
            self.fire("hide combo");
        });
    };

    Cashpang.prototype.init = function(engineBoard) {
        this.touchable = false;
        this.engineBoard = engineBoard;
        this.score = 0;
        this.comboCnt = 0;
        this.offsetY = engineBoard.offsetY;

        var i = -64, entity;
        for (i = 63; i >= -64; i--) {
            if (this.board[i]) {
                this.board[i].destroy();
            }
        }
        this.board = [];

        i = this.engineBoard.entities.length;
        while (i--) {
            if (this.engineBoard.entities[i] && this.engineBoard.entities[i].name === "effect" || this.engineBoard.entities[i].name === "gem") {
                entity = this.engineBoard.entities.splice(i, 1)[0];
                entity.destroy();
            }
        }

        this.lastpangCalled = false;
        this.lastpangCallback = undefined;
        this.gameover = false;
        this.gemCnts = {};
        this.cascadeCnt = 0;

        this._hintGem = undefined;

        this.hint.setBaseSprite("hint").addTo(this.engineBoard.name);
        this.selected.setBaseSprite("selected").addTo(this.engineBoard.name);
        this.judge.addTo(this.engineBoard.name);

        this.hideHint();
        this.hideSelected();

        this.generateBoard();
    };

    Cashpang.prototype.start = function() {
        this.touchable = true;
        this.score = 0;
        this.comboCnt = 0;
        this.maxCombo = 0;
        this.timeLastMatch = new Date().getTime();
        this.judge.enable();
    };

    Cashpang.prototype.end = function(callback) {
        this.hideHint();
        this.hideSelected();
        this.touchable = false;
        this.gameover = true;

        this.gameoverTimer = setTimeout((function(){
            if (this.hasSpecial()) {
                this.game.trigger("lastpang");
                setTimeout((function(){
                    this.lastpangCalled = true;
                }).bind(this), 1500);
            } else {
                this.lastpangCalled = true;
            }
        }).bind(this), 1500);

        this.lastpangCallback = callback;
    };

    /* Board utilities */
    Cashpang.prototype.getGemAt = function(i, j) {
        return this.board[i * this.boardWidth + j];
    };

    Cashpang.prototype.getGemIdx = function(i, j) {
        return i * this.boardWidth + j;
    };

    Cashpang.prototype.getIJfromIdx = function(idx) {
        var j = idx % this.boardWidth;
        if (j < 0) {
            j += this.boardWidth;
        }

        return {
            i: Math.floor(idx / this.boardWidth),
            j: j
        };
    };

    /* Board Generation */
    Cashpang.prototype.generateBoard = function() {
        var i, j, type, gem;

        // initialize
        for(var color in this.types) {
            if(this.types.hasOwnProperty(color)) {
                this.gemCnts[this.types[color]] = 0;
            }
        }

        if (this.board.length === 64) { // re-generate
            for (i = 0; i < this.board.length; i++) {
                type = this.generateRandomType();
                gem = this.board[i];
                // preserve special gems
                gem.type = type;
                gem.setBaseSprite(type);
                gem.x = gem.j * this.gemWidth + this.gemWidth/2;
                gem.y = gem.i * this.gemHeight + this.offsetY + this.gemHeight/2;
                gem.scaleX = 1;
                gem.scaleY = 1;
                gem.status = "ready"; // "exploding", "swapping", "falling"
                gem.special = undefined;
                gem.gatherTo = undefined;
            }
            this.judge.enable();
        } else { // initial generation
            for (i = 0;i < this.boardHeight; i++) {
                for (j = 0; j < this.boardWidth; j++) {
                    if (DEBUG) {
                        type = this.types[testMatrix[this.getGemIdx(i,j)]];
                        this.gemCnts[type]++;
                    } else {
                        type = this.generateRandomType();
                    }
                    this.board.push(
                        this.game.entityPool.allocate({
                            name : "gem",
                            x: j * this.gemWidth + this.gemWidth/2,
                            y: i * this.gemHeight + this.offsetY + this.gemHeight/2,
                            width: this.gemWidth,
                            height: this.gemHeight,
                            i: i,
                            j: j,
                            anchorX: this.gemWidth/2,
                            anchorY: this.gemHeight/2,
                            type: type,
                            status: "ready",
                            special: undefined,
                            gatherTo: undefined,
                            effect: undefined
                        }).addTo(this.engineBoard.name).setBaseSprite(type)
                    );
                }
            }
        }

        // console.log(this.printBoard());
        while (this.hasEmpty() || this.findAllMatches().length !== 0) {
            this.cascade();
        }
    };

    Cashpang.prototype.generateRandomType = function() {
        var type;
        do {
            type = this.types[Math.floor(Math.random() * 7)];
        } while (this.gemCnts[type] >= 13);

        ++this.gemCnts[type];
        return type;
    };

    Cashpang.prototype.destroyBoard = function() {
        this.judge.disable();

        var cnt = this.board.length;
        this.board.forEach(function(gem){

            this.setZoomOutAnimation(gem, this.animationDuration * 2, "easeInQuad", destroyCB.bind(this));
            // this.setLinearAnimation(gem, 10, gem.j, Math.floor(Math.random() * this.animationDuration * 2) + 100, "easeInQuad", destroyCB.bind(this));
        }, this);

        function destroyCB() {
            if (--cnt === 0) {
                this.generateBoard();
            }
        }
    };

    Cashpang.prototype.cascade = function(animate) {
        //if lastpanging
        if (this.lastpangCalled) {
            if (this.isIdle()) {
                var specials = this.board.filter(function(gem){
                    return gem.special;
                });

                if (specials.length > 0) {
                    this.doSpecial(specials.splice(0, 1)[0]);
                } else {
                    this.hideHint();
                    this.judge.disable();
                    // this.lastpangCalled = false;
                    setTimeout((function(){
                        this.lastpangCallback();
                    }).bind(this), 1000);
                }
            }
        }

        //has empty slots
        if (this.hasEmpty()) {
            this.fall(animate);
        }

        //has matched gems
        var matchedGems = this.findAllMatches(animate);
        if (matchedGems.length > 0) {
            var sound = "combo" + Math.min(7, (this.comboCnt + 1));
            if (animate) {
                // this.game.soundManager.playSound(sound);
            }
            if (animate && this.comboCnt > common.comboCnt) {
                this.explodeNeighbors(matchedGems, animate);
            } else {
                this.explode(matchedGems, animate);
            }
        } else {
            this._hintGem = this.findPossibleMatch();
            if (this._hintGem && animate) {
                this.showHint();
            } else {
                this.regenerateBoard(animate);
            }
        }
    };

    Cashpang.prototype.regenerateBoard = function(animate) {
        this.hideHint();

        //swapping
        if (!this.gameover && this.board.every(function(gem){
            if (gem && gem.status === "ready") {
                return true;
            }
        })) {
            console.log("no possible match found. re-generate board");
            if (animate) {
                this.fire("no possible match", 1000);
                this.fire("pause", this.animationDuration * 2);
                this.destroyBoard();
            } else {
                this.generateBoard();
            }
        }
    };

    Cashpang.prototype.explode = function(gems, animate) {
        var self = this;

        //remove only "ready" and not special
        gems = gems.filter(function(idx){
            var gem = this.board[idx];
            if (idx < 0 || !gem || gem.status !== "ready") {
                return false;
            }

            if (gem.special) {
                gem.type = gem.special;
                return false;
            }

            return true;
        }, this);

        gems.sort(function(a, b) {
            return b - a;
        });

        if (animate && !this.lastpangCalled) {
            this.comboCnt++;
            this.maxCombo = Math.max(this.comboCnt, this.maxCombo);
        }

        if (animate && this.comboCnt >= 2) {
            this.fire("combo");
            clearTimeout(this.hideComboTimer);
            this.hideComboTimer = setTimeout((function() {
                this.fire("hide combo");
            }).bind(this), this.comboTimer);
        }

        if (gems.length > 0) {
            this.hideHint();
        }

        if (animate) {
            this.score += Math.min(this.comboBonus * (this.comboCnt - 1), this.maxComboBonus);
        }

        gems.forEach(function(v, i) {
            var gem = this.board[v],
                gather;

            // use removed gems as gem pool cause this way a gem can store it's column number
            gem.status = "exploding";
            if (animate) {
                this.score += this.eachPoint;
                this._applyPangAnimation(gem);
                if (gem.gatherTo && (gather = this.getGemAt(gem.gatherTo.i, gem.gatherTo.j)) && gather.special) {
                    this.setLinearAnimation(gem, gem.gatherTo.i, gem.gatherTo.j, this.animationDuration, "easeInQuad", explodeCB);
                } else {
                    this.setZoomOutAnimation(gem, this.animationDuration, "easeInQuad", explodeCB);
                }
            } else {
                explodeCB.call(gem);
            }

            function explodeCB () {
                //minus index
                var idx = self.getGemIdx(-1, this.j);
                while (self.board[idx]) {
                    idx -= self.boardWidth;
                }

                self.board[idx] = this;
                self.board[v] = undefined;
                this.i = Math.floor(idx / 8);

                self.gemCnts[this.type]--;
                if (animate && this.effect) {
                    this.effect.enabled = false;
                    this.effect.destroy();
                    this.effect = undefined;
                }
                this.status = "ready";
                this.x = this.j * self.gemWidth + self.gemWidth/2;
                this.y = this.i * self.gemHeight + self.offsetY + self.gemHeight/2;
                this.z = 0;
                this.scaleX = 1;
                this.scaleY = 1;
                this.type = self.generateRandomType();
                this.setBaseSprite(this.type);
                this.gatherTo = undefined;
                this.special = undefined;
            }

        }, this);
    };

    Cashpang.prototype._fallColumn = function(j, animate) {

        //fall only if all gems in the same column are ready
        if (this.board.some(function(gem, i){
            return (gem && (i % this.boardWidth) === j && (gem.status !== "ready"));
        }, this)) {
            return;
        }

        var fallOrder = [];

        //empty
        var emptyBottommostIdx;
        for (var i = 56 + j; i >= 0; i-= 8) {
            if (!this.board[i]) {
                emptyBottommostIdx = i;
                break;
            }
        }

        //fallOrder
        i = emptyBottommostIdx;
        while (i >= -64) {
            if (this.board[i]) {
                fallOrder.push(i);
            }
            i -= this.boardWidth;
        }

        var empty = this.getIJfromIdx(emptyBottommostIdx);

        fallOrder.forEach(function(fallIdx, i){
            this._fall(fallIdx, empty.i, i, animate);
            // console.log(fallIdx, this.getIJfromIdx(fallIdx), empty.i, this.getIJfromIdx(fallIdx).i);
        }, this);
    };

    Cashpang.prototype._applyPangAnimation = function(gem) {
        if (gem.effect) {
            gem.effect.enabled = false;
            gem.effect.destroy();
        }
        gem.effect = this.game.entityPool.allocate({
            name: "effect",
            width: this.pangAnimWidth,
            height: this.pangAnimHeight,
            x: gem.x,
            y: gem.y,
            z: 5,
            anchorX: this.pangAnimWidth / 2,
            anchorY: this.pangAnimHeight / 2
        }).addTo(this.engineBoard.name).setBaseSprite("pang");
    };

    /* Special Gems Action */
    Cashpang.prototype.doSpecial = function(gem) {
        var matchTime = new Date().getTime();
        // process combo count
        if (matchTime - this.timeLastMatch <= this.comboTimer) {
            this.comboTimer = Math.max(this.comboTimer - this.comboTimerDesc, this.minComboTimer);
        } else {
            this.comboCnt = 0;
            this.comboTimer = this.initialComboTimer;
        }

        switch(gem.type) {
            case this.specialTypes[3]:
                this.bomb(gem);
                break;
            case this.specialTypes[4]:
                this.cross(gem);
                break;
            default:
                break;
        }
        this.timeLastMatch = matchTime;
    };

    Cashpang.prototype.bomb = function(bomb) {
        var gems = [], i, j, offset, idx, targetGem;

        for (i = -2; i <= 2; i++) {
            offset = Math.abs(i);
            if (bomb.i + i < 0 || bomb.i + i >= this.boardHeight) {
                continue;
            }
            for (j = Math.max(0, bomb.j-(2-offset)); j <= Math.min(bomb.j+ (2-offset), this.boardWidth-1); j++) {
                if ((idx = this.getGemIdx(bomb.i+i, j)) >= 0) {
                    if (!(targetGem = this.board[idx]) || targetGem.status !== "ready") {
                        return;
                    }
                    gems.push(idx);
                }
            }
        }

        this.score += this.bombBonus;
        if (!this.lastpangCallback) {
            this.fire("pause");
        }

        bomb.special = undefined;
        // this.game.soundManager.playSound("bomb");
        this.explode(gems, true);
    };

    Cashpang.prototype.cross = function(cross) {
        var gems = [], i, j, targetGem;

        // col (include special gem)
        for (j = 0; j < this.boardWidth; j++) {
            if (!(targetGem = this.getGemAt(cross.i, j)) || targetGem.status !== "ready") {
            }
            gems.push(this.getGemIdx(cross.i, j));
        }

        // row (exclude special gem)
        for (i = 0; i < this.boardHeight; i++) {
            // // avoid redundancy
            if (cross.i === i) {
                continue;
            }
            if (!(targetGem = this.getGemAt(i, cross.j)) || targetGem.status !== "ready") {
                return;
            }
            gems.push(this.getGemIdx(i, cross.j));
        }

        this.score += this.crossBonus;
        if(!this.lastpangCallback) {
            this.fire("pause");
        }
        cross.special = undefined;
        // this.game.soundManager.playSound("cross");
        this.explode(gems, true);
    };

    Cashpang.prototype.explodeNeighbors = function(gems, animate) {
        var neighborGems = [],
            i,
            gem,
            len = gems.length,
            gemIdx,
            pushUnique = (function(idx) {
                if (idx < 0 || idx >= this.board.length){
                    return;
                }
                if (neighborGems.indexOf(idx) < 0) {
                    neighborGems.push(idx);
                }
            }).bind(this);

        for (i = 0; i < len; i++) {
            gemIdx = gems[i];
            gem = this.getIJfromIdx(gemIdx);
            pushUnique(gemIdx);
            pushUnique(gemIdx + this.boardWidth);
            pushUnique(gemIdx - this.boardWidth);
            pushUnique(this.getGemIdx(gem.i, Math.min(gem.j+1, this.boardHeight-1)));
            pushUnique(this.getGemIdx(gem.i, Math.max(0, gem.j-1)));
        }

        this.explode(neighborGems, animate);
    };

    /* Match finding logics */
    Cashpang.prototype.findMatchAt = function(i, j, type) {
        if(i < 0 || j < 0 || i > this.boardHeight-1 || j > this.boardWidth-1 ) {
            return;
        }
        var verticalMatch = [],
            horizontalMatch = [],
            thisGem = this.getGemAt(i, j),
            idx;

        type = type || thisGem.type;

        this.findLinearMatch(verticalMatch, type, i+1, j, function(prevI, prevJ) { return {i: prevI + 1, j: prevJ }; });
        this.findLinearMatch(verticalMatch, type, i-1, j, function(prevI, prevJ) { return {i: prevI - 1, j: prevJ }; });
        this.findLinearMatch(horizontalMatch, type, i, j+1, function(prevI, prevJ) { return {i: prevI, j: prevJ + 1 }; });
        this.findLinearMatch(horizontalMatch, type, i, j-1, function(prevI, prevJ) { return {i: prevI, j: prevJ - 1 }; });

        if(verticalMatch.length < 2) {
            verticalMatch = [];
        } else if (verticalMatch.length === 3 || verticalMatch.length === 4) {
            for(idx = 0; idx < verticalMatch.length; idx++) {
                this.board[verticalMatch[idx]].gatherTo = {i: i, j: j};
            }
        }
        if(horizontalMatch.length < 2) {
            horizontalMatch = [];
        } else if (horizontalMatch.length === 3 || horizontalMatch.length === 4) {
            for(idx = 0; idx < horizontalMatch.length; idx++) {
                this.board[horizontalMatch[idx]].gatherTo = {i: i, j: j};
            }
        }

        return {v: verticalMatch, h: horizontalMatch};
    };

    Cashpang.prototype.findLinearMatch = function (array, type, i, j, next) {
        if(this.specialTypes[3] === type || this.specialTypes[4] === type) { // don't make match 3 of special gem
            return;
        }
        while (i >= 0 && i < this.boardWidth && j >= 0 && j < this.boardHeight) {
            var target = this.getGemAt(i,j);
            if (!target || target.status !== "ready" || target.type !== type) {
                return;
            }
            array.push(this.getGemIdx(i, j));
            var nextIJ = next(i, j);
            i = nextIJ.i;
            j = nextIJ.j;
        }
    };

    Cashpang.prototype.findAllMatches = function(animate, fromI, fromJ, toI, toJ) {
        var verticalMatch = [],
            horizontalMatch = [],
            totalMatchedGems = [],
            fnVert = function(prevI, prevJ) { return {i: prevI + 1, j: prevJ }; },
            fnHori = function(prevI, prevJ) { return {i: prevI, j: prevJ + 1 }; },
            i,
            j;

        for(i = fromI || 0; i <= (toI || this.boardHeight-1); i++) {
            for(j = fromJ || 0; j <= (toJ || this.boardWidth-1); j++) {
                var thisGem = this.getGemAt(i, j),
                    idx = this.getGemIdx(i, j),
                    len, type;

                if (!thisGem) {
                    continue;
                }
                type = thisGem.type;

                verticalMatch = [];
                horizontalMatch = [];

                this.findLinearMatch(verticalMatch, type, i+1, j, fnVert);
                this.findLinearMatch(horizontalMatch, type, i, j+1, fnHori);

                len = verticalMatch.length;
                if (len < 2) {
                    verticalMatch = [];
                } else {
                    makeSpecialGem.call(this,verticalMatch, animate);
                }

                len = horizontalMatch.length;
                if (len < 2) {
                    horizontalMatch = [];
                } else {
                    makeSpecialGem.call(this, horizontalMatch, animate);
                }
                totalMatchedGems = concatUnique(totalMatchedGems, verticalMatch, horizontalMatch);

                if((horizontalMatch.length >= 2 || verticalMatch.length >= 2) && totalMatchedGems.indexOf(idx) < 0) {
                    totalMatchedGems.push(idx);
                }
            }
        }

        function makeSpecialGem(matches, makeSpecial) {
            var len = matches.length,
                gem,
                iterator;

            if(this.specialTypes.hasOwnProperty(len)) {
                for(iterator = 0; iterator < len; iterator++) {
                    gem = this.board[matches[iterator]];
                    if(!gem.gatherTo && !gem.special && !thisGem.special) {
                        gem.gatherTo = {i:i, j:j};
                    } else {
                        makeSpecial = false;
                        break;
                    }
                }
                if(makeSpecial) { // don't make a special gem whlie generating board
                    thisGem.special = this.specialTypes[len];
                    thisGem.z = 1;
                    thisGem.setBaseSprite(thisGem.special);
                    this.gemCnts[thisGem.type]--;

                    return matches === horizontalMatch;
                }
            }
        } // makeSpecialGem

        return totalMatchedGems;
    };

    Cashpang.prototype.findPossibleMatch = function() {
        var idx, result, coord, hint = [], special = [];
        for(idx = 0; idx < this.board.length; idx++) {
            coord = this.getIJfromIdx(idx);

            if(!!(result = this.isSwappable(coord.i, coord.j, coord.i+1, coord.j))) {
                hint.push(result.swappedTo || result.swappedFrom);
            } else if (!!(result = this.isSwappable(coord.i, coord.j, coord.i, coord.j+1)) ) {
                hint.push(result.swappedTo || result.swappedFrom);
            } else if(this.board[idx] && this.board[idx].special) {
                special.push(this.board[idx]);
            }
        }
        return hint[Math.floor(Math.random() * hint.length)] || special[Math.floor(Math.random() * special.length)];
    };

    Cashpang.prototype.showHint = function() {
        if (!this.hintTimer && !this.lastpangCalled) {
            this.hintTimer = setTimeout((function(){
                if(!this._hintGem) {
                    return;
                }
                if(this.hint.x >= 0 && this.hint.y >= 0) {
                    return;
                }
                this.hint.x = this._hintGem.x;
                this.hint.y = this._hintGem.y;
                this.hint.enable();
                this.hintTimer = null;

                // this.game.soundManager.playSound("hint");
            }).bind(this), 3000);
        }
    };

    Cashpang.prototype.hideHint = function() {
        if (this.hintTimer) {
            clearTimeout(this.hintTimer);
            // this.game.soundManager.stopSound("hint");
            this.hintTimer = null;
        }

        this.hint.x = -100;
        this.hint.y = -100;
        this.hint.disable();
    };

    Cashpang.prototype.showSelected = function(gem) {
        this.selected.animation = null;
        this.selected.enable();
        this.selected.x = gem.x;
        this.selected.y = gem.y;
    };

    Cashpang.prototype.hideSelected = function() {
        this.selected.animation = null;
        this.selected.x = -100;
        this.selected.y = -100;
        this.selected.disable();
    };

    /* Gem Movement */
    Cashpang.prototype.isSwappable = function(fromI, fromJ, toI, toJ) {
        // check if two coordinates are adjacent
        if(fromI < 0 || fromJ < 0 || fromI > this.boardHeight-1 || fromJ > this.boardWidth-1 ) {
            return;
        }
        if(toI < 0 || toJ < 0 || toI > this.boardHeight-1 || toJ > this.boardWidth-1 ) {
            return;
        }

        var from = this.getGemAt(fromI, fromJ),
            to = this.getGemAt(toI, toJ),
            atFromIJ,
            atToIJ,
            result,
            tempType;

        if (!from || !to) {
            return;
        }

        if(this.isAdjacent(fromI, fromJ, toI, toJ)) {
            tempType = from.type;
            from.type = to.type;
            to.type = tempType;

            atFromIJ = this.findMatchAt(fromI, fromJ, from.type);
            atToIJ = this.findMatchAt(toI, toJ, to.type);

            tempType = from.type;
            from.type = to.type;
            to.type = tempType;

            if(atFromIJ.v.length >= 2 || atFromIJ.h.length >= 2) {
                result = result || {};
                result.swappedTo = to;
            }
            if(atToIJ.v.length >= 2 || atToIJ.h.length >= 2) {
                result = result || {};
                result.swappedFrom = from;
            }
            if(result) {
                result.matchesAtFrom = atFromIJ;
                result.matchesAtTo = atToIJ;
            }
        }
        return result;
    };

    Cashpang.prototype.isAdjacent = function(fromI, fromJ, toI, toJ) {
        return (fromI === toI && Math.abs(fromJ-toJ) === 1) || (fromJ === toJ && Math.abs(fromI-toI) === 1);
    };

    Cashpang.prototype.swap = function(fromI, fromJ, toI, toJ) {
        var from = this.getGemAt(fromI, fromJ),
            to = this.getGemAt(toI, toJ),
            fromIdx = this.getGemIdx(fromI, fromJ),
            toIdx = this.getGemIdx(toI, toJ),
            self = this,
            swappable,
            matchTime,
            len,
            matchedGems;

        if (!from || !to || from.status !== "ready" || to.status !== "ready") {
            return;
        }

        from.status = "swapping";
        to.status = "swapping";
        from.z = 1;
        to.z = 0;

        // draw animation
        this.setLinearAnimation(from, toI, toJ, this.animationDuration, "easeInQuad");
        this.setLinearAnimation(to, fromI, fromJ, this.animationDuration, "easeInQuad", swapCB.bind(this));
        this.setLinearAnimation(this.selected, toI, toJ, this.animationDuration, "easeInQuad", function(){
            self.hideSelected();
        });

        function swapCB() {
            if ((swappable = this.isSwappable(fromI, fromJ, toI, toJ))) {

                from.status = "ready";
                to.status = "ready";

                // swap
                to.i = fromI;
                to.j = fromJ;
                this.board[fromIdx] = to;

                from.i = toI;
                from.j = toJ;
                this.board[toIdx] = from;

                // calculate score
                matchTime = new Date().getTime();
                if(matchTime - this.timeLastMatch <= this.comboTimer) {
                    this.comboTimer = Math.max(this.comboTimer - this.comboTimerDesc, this.minComboTimer);
                } else {
                    this.comboCnt = 0;
                    this.comboTimer = this.initialComboTimer;
                }
                this.timeLastMatch = matchTime;

                // make special gem according to the number of matched gems
                if (swappable.swappedFrom && self.specialTypes.hasOwnProperty(len = Math.max(swappable.matchesAtTo.v.length, swappable.matchesAtTo.h.length)))  {
                    from.special = self.specialTypes[len];
                    from.setBaseSprite(from.special);
                    self.gemCnts[from.type]--;
                }
                if (swappable.swappedTo && self.specialTypes.hasOwnProperty(len = Math.max(swappable.matchesAtFrom.v.length, swappable.matchesAtFrom.h.length))) {
                    to.special = self.specialTypes[len];
                    to.setBaseSprite(to.special);
                    self.gemCnts[to.type]--;
                }

            } else {
                self.setLinearAnimation(to, toI, toJ, self.animationDuration, "easeInQuad", function(){
                    to.status = "ready";
                });
                self.setLinearAnimation(from, fromI, fromJ, self.animationDuration, "easeInQuad", function(){
                    from.status = "ready";
                });
                if (self.gemOnHand === from) {
                    self.setLinearAnimation(self.selected, fromI, fromJ, self.animationDuration, "easeInQuad");
                }
            }
        }
    };

    Cashpang.prototype.fall = function(animate) {
        // for (var j = 0; j < 7; j++) {
        //     if (this.findEmpty(j)) {
        //         this._fallColumn(j, animate);
        //     }
        // }
        for (var i = -64; i < 0; i++) {
            if (this.board[i] && this.board[i].status === "ready") {
                this._fallColumn(this.getIJfromIdx(i).j, animate);
            }
        }
    };

    Cashpang.prototype.findEmpty = function(j) {
        return this.board.some(function(gem){
            return !gem;
        });
    };

    Cashpang.prototype._fall = function(idx, destI, fallIndex, animate) {
        var gem = this.board[idx];

        if (gem === this.gemOnHand) {
            this.hideSelected();
        }

        idx = +idx;
        destI = destI - fallIndex;

        gem.status = "falling";
        if (animate) {
            this.setLinearAnimation(gem, destI, gem.j, this.animationDuration, "easeInQuad", (function(){
                gem.i = destI;
                this._fallDone(idx, gem);
            }).bind(this));
        } else {
            gem.i = destI;
            gem.y = destI * this.gemHeight + this.offsetY + this.gemWidth/2;
            this._fallDone(idx, gem);
        }
    };

    Cashpang.prototype._fallDone = function(lastIndex, gem) {
        gem.status = "ready";

        var newIndex = this.getGemIdx(gem.i, gem.j);
        if (this.board[lastIndex] === gem) { //cause this could be replace by other
            this.board[lastIndex] = undefined;
        }
        if (this.board[newIndex] !== gem) {
            this.board[newIndex] = gem;
        }
    };

    /* animation setting */
    Cashpang.prototype.setLinearAnimation = function(gem, destI, destJ, duration, easingName, callback) {
        gem.animate({
            duration : duration,
            type: gem.gatherTo ? "zoomout" : undefined,
            from : {
                x : gem.x,
                y : gem.y
            },
            to : {
                x : destJ * this.gemWidth + this.gemWidth/2,
                y : destI * this.gemHeight + this.offsetY + this.gemHeight/2
            },
            easing : {
                x : easingName,
                y : easingName
            },
            callback : callback || function(){}
        });
    };

    Cashpang.prototype.setZoomOutAnimation = function(gem, duration, easingName, callback) {
        // gem.anchorX = gem.x + 22.5;
        // gem.anchorY = gem.y + 22.5;
        gem.animate({
            type: "zoomout",
            duration : duration,
            from : {
                scaleX : 1,
                scaleY : 1
            },
            to : {
                scaleX : 0,
                scaleY : 0
            },
            easing : {
                scaleX : easingName,
                scaleY : easingName
            },
            callback : callback || function(){}
        });
    };

    /* Score */
    Cashpang.prototype.getScore = function() {
        return this.score;
    };

    Cashpang.prototype.getCombo = function() {
        return this.comboCnt;
    };

    Cashpang.prototype.getMaxCombo = function() {
        return this.maxCombo;
    };

    Cashpang.prototype.isSelectable = function(gem) {
        if (gem.status !== "ready") {
            return false;
        }

        var gemIdx = this.getGemIdx(gem.i, gem.j) + this.boardWidth;
            explodingUnder = this.board.some(function(targetGem, i){
                return (targetGem && i > gemIdx && (i % this.boardWidth) === gem.j && targetGem.status === "exploding");
            }, this);

        return !explodingUnder;
    };

    Cashpang.prototype.isIdle = function() {
        var allReady = this.board.every(function(gem){
            return (gem && gem.status === "ready");
        });

        return (allReady && this.findAllMatches().length === 0);
    };

    Cashpang.prototype.hasEmpty = function() {
        return this.board.some(function(gem){
            return !gem;
        });
    };

    Cashpang.prototype.hasError = function() {
        return this.board.some(function(gem){
            return !gem;
        });
    };

    Cashpang.prototype.hasSpecial = function() {
        return this.board.some(function(gem){
            return (gem && gem.special);
        });
    };


    /* User Input Handlers */
    // TO DO: 1. calculate selected gem location by touch location
    //        2. determine swap direction. if move is not a proper swap (diagonal, etc), ignore it.
    Cashpang.prototype.onTouchstart = function(e) {
        if (!this.touchable) {
            return;
        }
        var x = e.designX,
            y = e.designY,
            j = Math.floor(x/this.gemWidth),
            i = Math.floor((y - this.offsetY)/this.gemHeight),
            gemOnHand;

        e.preventDefault();

        if (i < 0 || i >= this.boardHeight || j < 0 || j >= this.boardWidth) {
            return;
        }

        gemOnHand = this.getGemAt(i, j);
        if (!gemOnHand) {
            return;
        }

        if (gemOnHand.x === this.hint.x && gemOnHand.y === this.hint.y) {
            this.hideHint();
        }

        if (this.isSelectable(gemOnHand)) {
            this.gemOnHand = gemOnHand;

            // this.game.soundManager.playSound("select");

            // this.gemOnHand.status !== "ready") {
            if (this.gemOnHand.special) {
                this.doSpecial(this.gemOnHand);
                return;
            }

            this.showSelected(this.gemOnHand);
            this.game.input.on(MOVE_EV, this.moveHandler);
        }
    };

    Cashpang.prototype.onTouchMove = function(e) {
        var x = e.designX,
            y = e.designY,
            j = Math.floor(x/this.gemWidth),
            i = Math.floor((y - this.offsetY)/this.gemHeight);
            // targetGem;
        e.preventDefault();

        if (i < 0 || i >= this.boardHeight || j < 0 || j >= this.boardWidth) {
            return;
        }
        if ((i === this.gemOnHand.i && j === this.gemOnHand.j) || (i !== this.gemOnHand.i && j !== this.gemOnHand.j)) {
            return;
        }

        if (this.isAdjacent(this.gemOnHand.i, this.gemOnHand.j, i, j)) {
            // this.game.soundManager.playSound("move");
            this.swap(this.gemOnHand.i, this.gemOnHand.j, i, j);
        }
        this.game.input.off(MOVE_EV, this.moveHandler);
    };

    Cashpang.prototype.onTouchEnd = function() {
        this.game.input.off(MOVE_EV, this.moveHandler);
    };

    /* events */
    Cashpang.prototype.on = function(event, callback) {
        var reg = this.registry;

        if(!reg[event]) {
            reg[event] = [];
        }

        reg[event].push(callback);
    };

    Cashpang.prototype.fire = function(event, duration) {
        var callbacks = this.registry[event],
            i,
            len = callbacks && callbacks.length || 0;
        for(i = 0; i < len; i++) {
            callbacks[i].call(null, duration);
        }
    };

    /* other utilities */
    Cashpang.prototype.scanBoard = function(prop, val) {
        var board = this.board,
            idx = 0,
            len = board.length,
            result,
            gem;

        for(; idx < len; idx++) {
            gem = board[idx];
            if(gem[prop] === val) {
                (result || (result = [])).push({i:gem.i, j:gem.j});
            }
        }

        return result;
    };

    Cashpang.prototype.printBoard = function() {
        var result = [], i = 0;
        for(; i < this.board.length; i++) {
            result.push(this.types.indexOf(this.board[i].type));
        }

        return result;
    };

    Cashpang.prototype.debug = function() {
        var status = [],
            pos = [],
            i = 0,
            inner;

        for(i = -64; i < 64; i++) {
            if (i % 8 === 0) {
                inner = [];
                status.push(inner);
            }
            if (!this.board[i]) {
                inner.push(null);
            } else {
                inner.push(this.board[i].status);
            }
        }

        for(i = -64; i < 64; i++) {
            if (i % 8 === 0) {
                inner = [];
                pos.push(inner);
            }
            if (!this.board[i]) {
                inner.push(null);
            } else {
                inner.push("[" + i + "] " + this.board[i].i +", " + this.board[i].j);
            }
        }

        console.table(status);
        console.table(pos);
    };

    /* Util function */
    function concatUnique() {
        var arr = [],
            fn = function(value) {
                if (this.indexOf(value) < 0) {
                    this.push(value);
                }
            },
            i;

        for (i = 0; i < arguments.length; i++) {
            arguments[i].forEach(fn, arr);
        }

        return arr;
    }

    return Cashpang;
});
