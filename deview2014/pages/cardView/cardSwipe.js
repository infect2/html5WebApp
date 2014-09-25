(function($){

    var util = {
        PubSub : function(){},
        Queue : function(n) {
            this._len = n;
            this._a = [];
        },
        absMax : function(n, max) {
            var ret = Math.min(Math.abs(n), max);
            return (n < 0) ? -ret : ret;
        },
        absMin : function(n, min) {
            var ret = Math.max(Math.abs(n), min);
            return (n < 0) ? -ret : ret;
        },
        easeOutQuad : function (t, b, c, d) { // t: current time, b: begInnIng value, c: change In value, d: duration
            return -c *(t/=d)*(t-2) + b;
        },
        linear : function(t, b, c, d) {
            return c * t / d + b;
        }
    };

    util.PubSub.prototype.trigger = function(eventName, obj){
        if (typeof this._eventHandlers === "undefined") {
            this._eventHandlers = [];
        }

        var ret = [], i, j;
        for (i = 0; i < this._eventHandlers.length; i++) {
            if (this._eventHandlers[i].name === eventName) {
                for (j = 0; j < this._eventHandlers[i].fn.length; j++) {
                    ret.push(this._eventHandlers[i].fn[j].call(this, obj));
                }
                break;
            }
        }
        for (i = 0; i < ret.length; i++) {
            if (ret[i] === false) {
                return false;
            }
        }

        return true;
    };
    util.PubSub.prototype.on = function(eventName, handler) {
        var index = -1, i;
        if (typeof this._eventHandlers === "undefined") {
            this._eventHandlers = [];
        }
        if (typeof handler === "undefined" && typeof eventName !== "string") {
            for (var key in eventName) {
                this.on(key, eventName[key]);
            }
            return this;
        }
        for (i = 0; i < this._eventHandlers.length; i++) {
            if (this._eventHandlers[i].name === eventName) {
                index = i;
            }
        }

        if (index < 0) {
            this._eventHandlers.push({
                name : eventName,
                fn : [ handler ]
            });
        } else {
            this._eventHandlers[index].fn.push(handler);
        }

        return this;
    };

    util.Queue.prototype.push = function(v) {
        if (this._a.length > this._len) {
            this._a.splice(0, 1);
        }
        this._a.push(v);
        return this;
    };
    util.Queue.prototype.pop = function(v) {
        return this._a.pop();
    };
    util.Queue.prototype.len = function(v) {
        return this._a.length;
    };
    util.Queue.prototype.empty = function() {
        this._a.length = 0;
    };
    util.Queue.prototype.value = function() {
        return this._a;
    };
    util.Queue.prototype.avg = function() {
        var sum = 0,
            len = this._a.length;
        for (var i = 0; i < len; i++) {
            sum += this._a[i];
        }
        return sum / len;
    };

    /**
     * construct CardSwipe widget
     *
     * @name skp.uiCore.CardSwipe
     * @exports CubeSwipe as skp.uiCore.CardSwipe
     * @constructor
     *
     * @param {HTMLElement} el swipe element
     * @param {Object} options options object
     * @example
     * new skp.uiCore.CardSwipe(element, {
     *     threshold : 40,
     *     duration : 200,
     *     multiplyingVelocity : 1,
     *     minVelocity : 0,
     *     maxVelocity : 7
     * });
     */
    var CardSwipe = function(el, options) {
        this.element = el;
        this.options = $.extend({
            threshold : 40,
            duration : 200,
            minScale : 0.9,
            minOpacity : 0.25,
            multiplyingVelocity : 1,
            minVelocity : 0,
            maxVelocity : 7
        }, options);

        this.consts = {
            touchDevice : 'ontouchstart' in window
        };
        this.el = {
            scroller : undefined
        };
        this.info = {
            x : 0,
            y : 0,
            index : 0,
            moveX : new CardSwipe.util.Queue(100),
            moveY : new CardSwipe.util.Queue(100),
            pageX : new CardSwipe.util.Queue(100),
            pageY : new CardSwipe.util.Queue(100),
            timestampQ : new CardSwipe.util.Queue(100)
        };

        var self = this,
            panelCount = 5,
            itemCount = 0,
            newItems = [],
            newItemsCount = 0,
            i = 0,
            fn;

        this.el.scroller = $(this.element); //.css("overflow", "hidden");
        this.el.items = this.el.scroller.children();

        this.info.itemCount = itemCount = this.el.items.length;

        this.el.items.each(function(i){
            newItems.push(this);
            newItemsCount += 1;
        });
        fn = function(i){
            newItems.push($(this).clone().get(0));
            newItemsCount += 1;
        };
        while (newItemsCount < panelCount) {
            this.el.items.each(fn);
        }

        this.el.items = $(newItems);
        this.el.items.remove();

        i = panelCount;
        while(i--) {
            this.el.scroller.append($("<div class='card-panel'>"));
        }
        this.el.panels = this.el.scroller.children();

        // console.log("getItem", index, this._getItemIndex(index))

        this.fnStart = $.proxy(this._start, this);
        this.fnMove = $.proxy(this._moving, this);
        this.fnEnd = $.proxy(this._end, this);

        this.refresh();
        this.readyPanels();

        if (this.info.itemCount > 1) {
            this.enable();
        }

        $(window).on("resize", function(){
            setTimeout(function(){
                self.refresh();
                self.readyPanels();
            }, 200);
        });
        this.on({
            move : function(){
                var index = this.info.index,
                    $current = this._getPanel(index),
                    $pprev = this._getPanel(index - 2),
                    $prev = this._getPanel(index - 1),
                    $next = this._getPanel(index + 1),
                    $nnext = this._getPanel(index + 2);

                this._move($current, $current.data("from") + this.info.distX);
                this._move($next, $next.data("from") + this.info.distX);
                this._move($prev, $prev.data("from") + this.info.distX);
                this._move($pprev, $pprev.data("from") + this.info.distX);
                this._move($nnext, $nnext.data("from") + this.info.distX);
            }
        });
    };

    CardSwipe.util = util;
    CardSwipe.prototype = Object.create(CardSwipe.util.PubSub.prototype);

    /**
     * enable CardSwipe
     *
     * @return {this}
     */
    CardSwipe.prototype.enable = function() {
        if (!this.enabled) {
            $(this.element).bind("touchstart", this.fnStart).bind("touchmove", this.fnMove).bind("touchend", this.fnEnd);
            if (!this.consts.touchDevice) {
                $(this.element).bind("mousedown", this.fnStart).bind("mousemove", this.fnMove).bind("mouseup", this.fnEnd);
            }
            this.info.touched = false;
            this.enabled = true;
        }
        return this;
    };

    /**
     * disable CardSwipe
     *
     * @return {this}
     */
    CardSwipe.prototype.disable = function() {
        $(this.element).unbind("touchstart", this.fnStart).unbind("touchmove", this.fnMove).unbind("touchend", this.fnEnd);
        if (!this.consts.touchDevice) {
            $(this.element).unbind("mousedown", this.fnStart).unbind("mousemove", this.fnMove).unbind("mouseup", this.fnEnd);
        }
        this.enabled = false;
        return this;
    };

    /**
     * destroy CardSwipe
     *
     * @return {this}
     */
    CardSwipe.prototype.destroy = function() {
        this.el.scroller.css("overflow", "");
        this.disable();

        return this;
    };

    CardSwipe.prototype.refresh = function() {
        this.info.swipeWidth = this.el.panels.eq(0).width();
        this.info.containerWidth = window.innerWidth;
        this.info.leftMargin = Math.round((this.info.containerWidth - this.info.swipeWidth) / 2);
        return this;
    };

    CardSwipe.prototype.readyPanels = function() {
        var self = this,
            iw = this.info.containerWidth,
            sw = this.info.swipeWidth,
            gap = this.info.leftMargin;

        this._move(this._getPanel(this.info.index).append(this._getItem(this.info.index).attr("data-index", this._getItemIndex(this.info.index))).data("from", gap), gap);

        if (this.info.itemCount > 1) {
            this._move(this._getPanel(this.info.index + 1).append(this._getItem(this.info.index + 1).attr("data-index", this._getItemIndex(this.info.index + 1))).data("from", gap + sw), gap + sw);
            this._move(this._getPanel(this.info.index - 1).append(this._getItem(this.info.index - 1).attr("data-index", this._getItemIndex(this.info.index - 1))).data("from", gap - sw), gap - sw);

            this._move(this._getPanel(this.info.index + 2).append(this._getItem(this.info.index + 2).attr("data-index", this._getItemIndex(this.info.index + 2))).data("from", gap + sw * 2), gap + sw * 2);
            this._move(this._getPanel(this.info.index - 2).append(this._getItem(this.info.index - 2).attr("data-index", this._getItemIndex(this.info.index - 2))).data("from", gap - sw * 2), gap - sw * 2);
        }
    };

    CardSwipe.prototype.updatePanels = function(index) {
        var current = index,
            next = index + 1,
            prev = index - 1,
            nnext = index + 2,
            pprev = index - 2,
            nextItemIndex = this._getItemIndex(next),
            nextPanel = this._getPanel(next),
            nextItem = this._getItem(next),
            nnextItemIndex = this._getItemIndex(nnext),
            nnextPanel = this._getPanel(nnext),
            nnextItem = this._getItem(nnext),
            prevItemIndex = this._getItemIndex(prev),
            prevPanel = this._getPanel(prev),
            prevItem = this._getItem(prev),
            pprevItemIndex = this._getItemIndex(pprev),
            pprevPanel = this._getPanel(pprev),
            pprevItem = this._getItem(pprev);

        if (nextItemIndex !== nextPanel.children().eq(0).data("index")) {
            nextPanel.html("").append(nextItem.attr("data-index", nextItemIndex));
        }
        if (nnextItemIndex !== nnextPanel.children().eq(0).data("index")) {
            nnextPanel.html("").append(nnextItem.attr("data-index", nnextItemIndex));
        }
        if (prevItemIndex !== prevPanel.children().eq(0).data("index")) {
            prevPanel.html("").append(prevItem.attr("data-index", prevItemIndex));
        }
        if (pprevItemIndex !== pprevPanel.children().eq(0).data("index")) {
            pprevPanel.html("").append(pprevItem.attr("data-index", pprevItemIndex));
        }

        this.el.panels.each(function(){
            $(this).data("from", $(this).data("pos"));
        });
    };

    CardSwipe.prototype._getItemIndex = function(index) {
        var ret = index;
        if (index < 0) {
            ret = index % this.el.items.length;
            if (ret < 0) {
                ret += this.el.items.length;
            }
        } else {
            ret = index % this.el.items.length;
        }
        return ret;
    };

    CardSwipe.prototype._getItem = function(index) {
        return this.el.items.eq(this._getItemIndex(index));
    };

    CardSwipe.prototype._getPanel = function(index) {
        var ret = index, len = this.el.panels.length;
        ret = (ret + len) % len;
        return this.el.panels.eq(ret);
    };

    CardSwipe.prototype.moveTo = function(index) {
        var self = this,
            currentIndex = this.info.index,
            nextIndex = index,
            direction = nextIndex - currentIndex,
            panelPPrev = this._getPanel(currentIndex - 2),
            panelPrev = this._getPanel(currentIndex - 1),
            panelCurrent = this._getPanel(currentIndex),
            panelNext = this._getPanel(currentIndex + 1),
            panelNNext = this._getPanel(currentIndex + 2),
            posCurrent,
            posNNext,
            posNext,
            posPrev,
            posPPrev,
            animate,
            toBeReplaced;

        this.info.animating = true;
        if (direction > 0) {
            posPrev = panelPrev.data("from") - this.info.swipeWidth;
            posCurrent = panelCurrent.data("from") - this.info.swipeWidth;
            posNext = panelNext.data("from") - this.info.swipeWidth;
            posNNext = posNext + this.info.swipeWidth;
            posPPrev = posNNext + this.info.swipeWidth;
            // console.log(posPrev, posCurrent, posNext, posNNext, posPPrev);
        } else if (direction < 0) {
            posPrev = panelPrev.data("from") + this.info.swipeWidth;
            posCurrent = panelCurrent.data("from") + this.info.swipeWidth;
            posNext = panelNext.data("from") + this.info.swipeWidth;
            posPPrev = posPrev - this.info.swipeWidth;
            posNNext = posPPrev - this.info.swipeWidth;
            // console.log(posPrev, posCurrent, posNext, posNNext, posPPrev);
        } else {
            posCurrent = panelCurrent.data("from");
            posPPrev = posCurrent - this.info.swipeWidth * 2;
            posPrev = posCurrent - this.info.swipeWidth;
            posNext = posCurrent + this.info.swipeWidth;
            posNNext = posCurrent + this.info.swipeWidth * 2;
        }

        var cf = panelCurrent.data("from"),
            cp = panelCurrent.data("pos"),
            nf = panelNext.data("from"),
            np = panelNext.data("pos"),
            nnf = panelNNext.data("from"),
            nnp = panelNNext.data("pos"),
            pf = panelPrev.data("from"),
            pp = panelPrev.data("pos"),
            ppf = panelPPrev.data("from"),
            ppp = panelPPrev.data("pos");

            // time = Math.abs(cf - cp) / (Math.abs(cf - cp) + Math.abs(ct - cp)) * self.options.duration;
        animate = function(){
            requestAnimationFrame(function(){
                var past = (+new Date() - from);
                if (past > (self.options.duration)) {
                    self._move(panelCurrent, posCurrent);
                    self._move(panelNext, posNext);
                    self._move(panelPrev, posPrev);
                    self._move(panelPPrev, posPPrev);
                    self._move(panelNNext, posNNext);

                    // console.log(posPrev, posCurrent, posNext, posNNext, posPPrev);
                    self.info.animating = false;
                    self.info.index = index;
                    self.info.page = self._getItemIndex(index) % self.info.itemCount;
                    self.updatePanels(index);
                    self.trigger("moved", self.info);
                } else {
                    if (Math.abs(self.info.distX) > self.options.threshold) {
                        if (self.info.distX < 0) {
                            //console.log(cp, 0, self.info.swipeWidth - Math.abs(cp), cp - easeOutQuad(past, 0, self.info.swipeWidth - Math.abs(cp), self.options.duration))
                            self._move(panelCurrent, cp - CardSwipe.util.easeOutQuad(past, 0, Math.abs(posCurrent - cp), self.options.duration));
                            self._move(panelNext, np - CardSwipe.util.easeOutQuad(past, 0, Math.abs(posNext - np), self.options.duration));
                            self._move(panelPrev, pp - CardSwipe.util.easeOutQuad(past, 0, Math.abs(posPrev - pp), self.options.duration));
                            self._move(panelNNext, nnp - CardSwipe.util.easeOutQuad(past, 0, Math.abs(posNNext - nnp), self.options.duration));
                        } else {
                            self._move(panelCurrent, cp + CardSwipe.util.easeOutQuad(past, 0, Math.abs(posCurrent - cp), self.options.duration));
                            self._move(panelNext, np + CardSwipe.util.easeOutQuad(past, 0, Math.abs(posNext - np), self.options.duration));
                            self._move(panelPrev, pp + CardSwipe.util.easeOutQuad(past, 0, Math.abs(posPrev - pp), self.options.duration));
                            self._move(panelPPrev, ppp + CardSwipe.util.easeOutQuad(past, 0, Math.abs(posPPrev - ppp) % self.info.swipeWidth, self.options.duration));
                        }
                    } else {
                        if (self.info.distX < 0) {
                            //console.log(cp, 0, self.info.swipeWidth - Math.abs(cp), cp - easeOutQuad(past, 0, self.info.swipeWidth - Math.abs(cp), self.options.duration))
                            self._move(panelCurrent, cp + CardSwipe.util.easeOutQuad(past, 0, Math.abs(cf - cp), self.options.duration));
                            self._move(panelNext, np + CardSwipe.util.easeOutQuad(past, 0, Math.abs(nf - np), self.options.duration));
                            self._move(panelPrev, pp + CardSwipe.util.easeOutQuad(past, 0, Math.abs(pf - pp), self.options.duration));
                            self._move(panelNNext, nnp + CardSwipe.util.easeOutQuad(past, 0, Math.abs(nnf - nnp), self.options.duration));
                        } else {
                            self._move(panelCurrent, cp - CardSwipe.util.easeOutQuad(past, 0, Math.abs(cf - cp), self.options.duration));
                            self._move(panelPrev, pp - CardSwipe.util.easeOutQuad(past, 0, Math.abs(pf - pp), self.options.duration));
                            self._move(panelNext, np - CardSwipe.util.easeOutQuad(past, 0, Math.abs(nf - np), self.options.duration));
                            self._move(panelPPrev, ppp - CardSwipe.util.easeOutQuad(past, 0, Math.abs(ppf - ppp), self.options.duration));
                        }
                    }
                    // console.log(nf, nt, easeOutQuad(time, nf, nt, self.options.duration));
                    animate();
                }
            });
        };
        // this._move(panelPrev, posPrev);
        var from = +new Date();
        animate();

        return this;
    };

    CardSwipe.prototype._move = function($el, pos) {
        var max = this.info.leftMargin,
            distance = CardSwipe.util.absMax(pos - max, this.info.swipeWidth),
            ratio,
            opacity, scale;

        distance = (distance < 0) ? this.info.swipeWidth + distance : this.info.swipeWidth - distance;
        ratio = distance / this.info.swipeWidth;
        opacity = CardSwipe.util.linear(ratio, this.options.minOpacity, 1 - this.options.minOpacity, 1);
        scale = CardSwipe.util.linear(ratio, this.options.minScale, 1 - this.options.minScale, 1);

        $el
            .css("webkitTransform", "translate3d(" + pos + "px, 0px, 0px)")
            .data("pos", pos);

        $el.children().eq(0)
            .css("webkitTransform", "translateZ(0px) scale(" + scale + ")")
            .css("opacity", opacity);
    };

    CardSwipe.prototype._start = function(e) {
        var event = e.originalEvent;

        if (!this.info.touched) {
            if (this.info.animating) {
                return;
            }
            this.info.touched = true;
            /**
             * @event touch
             */
            this.trigger("touch");

            if (this.info.checkScrollTimeout) {
                clearTimeout(this.info.checkScrollTimeout);
            }

            this.info.checkScrollTimeout = null;

            this.info.lastEventTime = null;
            this.info.lastMoveTime = null;
            this.info.startX = 0;
            this.info.startY = 0;
            this.info.touchX = null;
            this.info.touchY = null;
            this.info.distX = null;
            this.info.distY = null;
            this.info.diffX = null;
            this.info.diffY = null;
            this.info.swiping = false;
            this.info.velocity = 0;
            this.info.swipeWidth = this.info.swipeWidth || this.el.scroller.width();
            this.info.pageX.empty();
            this.info.pageY.empty();
            this.info.timestampQ.empty();

            if (e.type === "touchstart") {
                if (event !== undefined && event.touches.length === 1 && event.targetTouches.length === 1 && event.changedTouches.length === 1) {
                    this.info.touchX = event.touches[0].pageX;
                    this.info.touchY = event.touches[0].pageY;
                }
            } else {
                this.info.touchX = e.pageX;
                this.info.touchY = e.pageY;
            }

            this.info.pageX.push(this.info.touchX);
            this.info.timestampQ.push(+new Date());
        }
    };
    CardSwipe.prototype._moving = function(e) {
        var event = e.originalEvent,
            self = this,
            x, y, lastDistX, lastDistY, newX, newY, timestamp;

        // e.preventDefault();
        if (this.info.touched) {
            if (e.type === "touchmove" && !(event.touches.length === 1 && event.targetTouches.length === 1 && event.changedTouches.length === 1)) {
                return;
            }

            timestamp = +new Date();
            // e.preventDefault();

            if (!this.info.checkScrollTimeout) {
                this.info.moveX.empty();
                this.info.moveY.empty();
                this.info.checkScrollTimeout = setTimeout(function() {
                    if (Math.abs(self.info.moveX.avg()) > Math.abs(self.info.moveY.avg())) {
                        // self.info.swiping = true;
                    }
                }, 100);
            }

            if (self.info.scrolling) {
                e.stopPropagation();
            }

            if (e.type === "touchmove") {
                x = event.touches[0].pageX;
                y = event.touches[0].pageY;
            } else {
                x = e.pageX;
                y = e.pageY;
            }

            lastDistX = (this.info.distX || 0);
            lastDistY = (this.info.distY || 0);
            this.info.pageX.push(x);
            this.info.pageY.push(y);
            this.info.timestampQ.push(timestamp);

            this.info.lastEventTime = timestamp;
            this.info.distX = CardSwipe.util.absMax(x - this.info.touchX, this.info.swipeWidth);
            // this.info.distX = x - this.info.touchX;
            this.info.distY = y - this.info.touchY;
            this.info.diffX = this.info.distX - lastDistX;
            this.info.diffY = this.info.distY - lastDistY;
            this.info.lastMoveTime = timestamp;

            if (this.info.checkScrollTimeout) {
                this.info.moveX.push(this.info.diffX);
                this.info.moveY.push(this.info.diffY);
            }

            this.info.x = this.info.startX + this.info.distX;
            this.info.y = this.info.startY + this.info.distY;

            if (!this.info.swiping) {
                if (Math.abs(x - this.info.touchX) >= Math.abs(this.info.distY)) {
                    this.info.swiping = true;
                } else {
                    this.info.touched = false;
                    return;
                }
            }
            if (this.info.swiping) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.trigger("move", $.extend({}, this.info));
        }
    };
    CardSwipe.prototype._end = function(e) {
        var event = e.originalEvent,
            momentum = false,
            pos, pageQueue, lastPos, lastMoveTime, now = +new Date(), endTime = now;

        if (this.info.touched) {
            if (e.type === "touchend" && !(event.touches.length === 0 && event.targetTouches.length === 0)) {
                return;
            }
            this.info.touched = false;
            this.info.momentum = 0;

            pageQueue = this.info.pageX;
            pos = pageQueue.pop();
            endTime = this.info.timestampQ.pop();
            this.info.velocity = 0;

            if (pageQueue.len() > 0) {
                if (pageQueue.len() > 1) {
                    pos = pageQueue.pop();
                    endTime = this.info.timestampQ.pop();
                }
                lastPos = pageQueue.pop();
                lastMoveTime = this.info.timestampQ.pop();

                if (Math.abs(pos - lastPos) > 1) {
                    momentum = true;
                    this.info.velocity = (pos - lastPos) / Math.max(1, endTime - lastMoveTime);
                    this.info.velocity = CardSwipe.util.absMax(CardSwipe.util.absMin(this.info.velocity * this.options.multiplyingVelocity, this.options.minVelocity), this.options.maxVelocity);
                }
            }
            if (now < endTime + 100 && momentum && CardSwipe.util.absMin(Math.abs(this.info.velocity), this.options.minVelocity) > this.options.minVelocity) {
                this.info.momentum = Math.abs(this.info.velocity);
            }

            // console.log("end", this.info.momentum);
            if (Math.abs(this.info.distX) > this.options.threshold) {
                this.moveTo(this.info.index + ((this.info.distX < 0) ? 1 : -1));
            } else {
                this.moveTo(this.info.index);
            }
        }
    };

    if (typeof skp !== "undefined" && typeof skp.uiCore !== "undefined") {
        skp.uiCore.CardSwipe = CardSwipe;
    } else {
        window.CardSwipe = CardSwipe;
    }
}(jQuery));
