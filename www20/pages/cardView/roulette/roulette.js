(function(){
    var PubSub = function(){};
    PubSub.prototype.trigger = function(eventName, obj){
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
    PubSub.prototype.on = function(eventName, handler) {
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

    var Queue = function(n) {
        this._len = n;
        this._a = [];
    };
    Queue.prototype.push = function(v) {
        if (this._a.length > this._len) {
            this._a.splice(0, 1);
        }
        this._a.push(v);
        return this;
    };
    Queue.prototype.pop = function(v) {
        return this._a.pop();
    };
    Queue.prototype.len = function(v) {
        return this._a.length;
    };
    Queue.prototype.empty = function() {
        this._a.length = 0;
    };
    Queue.prototype.value = function() {
        return this._a;
    };
    Queue.prototype.avg = function() {
        var sum = 0,
            len = this._a.length;
        for (var i = 0; i < len; i++) {
            sum += this._a[i];
        }
        return sum / len;
    };
    var absMax = function(n, max) {
            var ret = Math.min(Math.abs(n), max);
            return (n < 0) ? -ret : ret;
        };
    var absMin = function(n, min) {
            var ret = Math.max(Math.abs(n), min);
            return (n < 0) ? -ret : ret;
        };
    var getValueFromRatio = function(min, max) {
        return function(n) {
            return min + (max - min) * n;
        };
    };
    var getRatioFromValue = function(min, max) {
        return function(n) {
            return (n - min) / (max - min);
        };
    };
    /**
     * construct touchScroll widget
     *
     * @name skp.uiCore.TouchScroll
     * @exports TouchScroll as skp.uiCore.TouchScroll
     * @constructor
     *
     * @param {Object} options options object
     * @example
     * new skp.uiCore.TouchScroll(element, {
     *     bouncing : true, //to use bouncing effect when moving out of boundary
     *     containerSelector : undefined, //jQuery Selector string to select container. If undefined, container would be scroller's first children.
     *     contentsSelector : undefined, //jQuery Selector string to select contents. If undefined, contents would be container's children.
     *     adjustInicatorHeightOnBouncing : true,
     *     multiplyingVelocity : 1,
     *     minVelocity : 0,
     *     maxVelocity : 7,
     *     minMomentumDistance : 100,
     *     maxMomentumDistance : 1200,
     *     momentumDuration : 500
     * });
     */
    var TouchScroll = function(el, options) {
        this.element = el;
        this.options = $.extend({
            mode : "translate",
            bouncing : true,
            containerSelector : undefined,
            contentsSelector : undefined,
            adjustInicatorHeightOnBouncing : true,
            multiplyingVelocity : 1,
            minVelocity : 0.5,
            maxVelocity : 7,
            minMomentumDistance : 100,
            maxMomentumDistance : 1200,
            momentumDuration : 500
        }, options);

        this.consts = {
            iphone : (/(iPhone|iPod|iPad)/gi).test(navigator.userAgent),
            touchDevice : 'ontouchstart' in window
        };
        this.el = {
            scroller : undefined,
            container : undefined,
            contents : undefined
        };
        this.coord = [];
        this.info = {
            x : 0,
            y : 0,
            moveX : new Queue(100),
            moveY : new Queue(100),
            pageX : new Queue(100),
            pageY : new Queue(100),
            timestampQ : new Queue(100),
            available : true
        };

        this.el.scroller = $(this.element);/*.css("overflow", "hidden");*/
        this.el.container = (this.options.containerSelector) ? this.el.scroller.find(this.options.containerSelector) : this.el.scroller.children().first();

        this.el.container.css({
            // webkitBackfaceVisibility: "hidden",
            webkitTransformStyle: "preserve-3d",
            webkitTransform: "translate3d(0px, 0px, 0px)"
        });

        this.fnStart = $.proxy(this._start, this);
        this.fnMove = $.proxy(this._move, this);
        this.fnEnd = $.proxy(this._end, this);

        this.refresh(true);
        this.enable();
    };

    TouchScroll.prototype = Object.create(PubSub.prototype);

    /**
     * enable TouchScroll
     *
     * @return {this}
     */
    TouchScroll.prototype.enable = function() {
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
     * disable TouchScroll
     *
     * @return {this}
     */
    TouchScroll.prototype.disable = function() {
        $(this.element).unbind("touchstart", this.fnStart).unbind("touchmove", this.fnMove).unbind("touchend", this.fnEnd);
        if (!this.consts.touchDevice) {
            $(this.element).unbind("mousedown", this.fnStart).unbind("mousemove", this.fnMove).unbind("mouseup", this.fnEnd);
        }
        this.enabled = false;
        return this;
    };

    /**
     * destroy TouchScroll
     *
     * @return {this}
     */
    TouchScroll.prototype.destroy = function() {
        this.el.scroller.css("overflow", "");
        this.el.container.css({
            webkitBackfaceVisibility: "",
            webkitTransformStyle: "",
            webkitTransform: ""
        });
        this.disable();

        return this;
    };

    /**
     * compute the offsets of each children when refreshing
     * @param   {HTMLElement} el a child element
     * @return  {Object}
     * @private
     *
     * @example
     * //return object
     * {
     *     top : {Number},
     *     height : {Number},
     *     outerHeight : {Number}
     * }
     */
    TouchScroll.prototype._offsetFromContainer = function(el) {
        var $el = $(el),
            pos = $el.position(), ppos;

        pos.top -= this.info.y;
        pos.height = $el.height();
        pos.outerHeight = $el.outerHeight(true);

        while (this.el.contents.find(el).length > 0) {
            if ((el = el.offsetParent)) {
                ppos = $(el).position();
                pos.top += ppos.top;
                pos.left += ppos.left;
            }
        }
        return pos;
    };

    /**
     * recalculate the scroller, containerHeight and be ready for user scroll.
     * if you change the contents in the container, then you should call this with true arguments
     * @param {Boolean} recalculate if true, recalculate coordinates of contents
     */
    TouchScroll.prototype.refresh = function(recalculate) {
        this.info.scrollerHeight = this.el.scroller.height();
        this.info.containerHeight = this.el.container.innerHeight();
        this.info.minY = (this.info.scrollerHeight < this.info.containerHeight) ? (this.info.scrollerHeight - this.info.containerHeight) : 0;
        this.info.maxY = 0;

        if (recalculate) {
            this.el.contents = (this.options.contentsSelector) ? this.el.container.find(this.options.contentsSelector) : this.el.container.children();
            this.coord.length = 0;
            for (var i = 0; i < this.el.contents.length; i++) {
                el = this.el.contents[i];
                this.coord[i] = this._offsetFromContainer(el);
            }
        }
        this.scrollTo(Math.max(Math.min(this.info.maxY, this.pos()), this.info.minY));

        return this;
    };

    /**
     * scroll the container element
     *
     * @param   {Number} pos y position
     * @param   {HTMLElement} el (if skipped, assigned with this.el.container)
     * @private
     */
    TouchScroll.prototype._scroll = function(pos, el) {
        el = el || this.el.container;
        el.css("webkitTransform", "translate3d(0px, " + pos + "px, 0px)");
    };

    /**
     * scroll the container element
     *
     * @param   {Number} pos y position
     * @param   {HTMLElement} el (if skipped, assigned with this.el.container)
     * @private
     */
    TouchScroll.prototype._rotate = function(pos, el) {
        el = el || this.el.container;
        el.css("webkitTransform", "translateZ(0px) rotateX(" + -pos + "deg)");
    };

    TouchScroll.prototype._scrollTo = function(pos) {
        var upper = pos > this.info.maxY,
            under = pos < this.info.minY,
            target = pos;

        this.info.bounce = (upper || under) ? pos : null;

        if (!this.options.bouncing) {
            if (upper) {
                target = this.info.maxY;
            }
            if (under) {
                target = this.info.minY;
            }
        }

        if (this.info.y < target) {
            this.info.directionY = 1;
        } else if (this.info.y > target) {
            this.info.directionY = -1;
        } else {
            this.info.directionY = 0;
        }

         if (this.options.mode === "translate") {
            this._scroll(target);
        } else if (this.options.mode === "rotate") {
            this._rotate(pos);
        }

        this.info.y = target;

        if (this.info.bounce) {
            this.trigger("bounce");
        } else {
            this.trigger("scroll");
        }
    };

    /**
     * scroll to specified position
     *
     * @param  {Number} pos y position
     * @return {this}
     */
    TouchScroll.prototype.scrollTo = function(pos) {
        this._scrollTo(pos);
        return this;
    };

    /**
     * to get visible children
     *
     * @return {Array} array of visible children
     */
    TouchScroll.prototype.getVisible = function() {
        var top = (this.options.bouncing) ? -this.info.y : -(Math.max(Math.min(this.info.maxY, this.info.y), this.info.minY)),
            height = this.info.scrollerHeight,
            bottom = top + height,
            upper, under,
            visible = [], i;

        for (i = 0, len = this.el.contents.length; i < len; i++) {
            upper = (this.coord[i].top + this.coord[i].outerHeight) < top;
            under = bottom < this.coord[i].top;
            if (!upper && !under) {
                visible.push(i);
            }
        }

        return visible;
    };

    /**
     * to get scrolled position
     *
     * @return {Number} position y
     */
    TouchScroll.prototype.pos = function() {
        return this.info.y;
    };

    TouchScroll.prototype._easeOutQuad = function (t, b, c, d, s) {
        return c*((t=t/d-1)*t*t + 1) + b;
    };

    TouchScroll.prototype._momentum = function() {
        var now = Date.now(),
            t = Math.max(now - this.info.lastEventTime, 1),
            y = (this.info.bounce) ? this.info.bounce : this.info.y,
            n,
            newY;

        n = this._easeOutQuad(t, 0, this.info.momentumY, this.options.momentumDuration);
        newY = (this.info.velocityY < 0) ? this.info.momentumStartY - n : this.info.momentumStartY + n;

        if (t > this.options.momentumDuration) {
            this._finish(Math.round(newY));
            return;
        }

        this.scrollTo(newY);
        if (!this.info.animationTimeout) {
            this.info.animationTimeout = requestAnimationFrame($.proxy(function(){
                this.info.animationTimeout = null;
                this._momentum();
            }, this));
        }
    };

    TouchScroll.prototype._finish = function(y) {
        if (this.info.animationTimeout) {
            cancelAnimationFrame(this.info.animationTimeout);
            this.info.animationTimeout = null;
        }
        if (typeof y === "number") {
            this.scrollTo(y);
        }

        this.trigger("scrollEnd");
    };
    TouchScroll.prototype._start = function(e) {
        var event = e.originalEvent;

        if (!this.info.available) {
            return;
        }

        if (!this.info.touched) {
            this.info.touched = true;

            /**
             * @event touch
             */
            this.trigger("touch");
            if (this.info.moving) {
                cancelAnimationFrame(this.info.moving);
            }
            if (this.info.animationTimeout) {
                cancelAnimationFrame(this.info.animationTimeout);
            }
            if (this.info.checkScrollTimeout) {
                clearTimeout(this.info.checkScrollTimeout);
            }

            this.info.checkScrollTimeout = null;
            this.info.animationTimeout = null;

            this.info.lastMoveTime = null;
            this.info.lastBounceTime = null;
            this.info.lastEventTime = null;
            this.info.lastMoveTime = null;
            this.info.moving = null;
            this.info.startY = this.info.y || 0;
            this.info.touchX = null;
            this.info.touchY = null;
            this.info.distX = null;
            this.info.distY = null;
            this.info.diffX = null;
            this.info.diffY = null;
            this.info.directionY = undefined;
            this.info.scrolling = false;
            this.info.velocityY = 0;
            this.info.lastOutsideY = null;
            this.info.scrollerHeight = this.info.scrollerHeight || this.el.scroller.height();
            this.info.containerHeight = this.info.containerHeight || this.el.container.innerHeight();
            this.info.minY = (this.info.scrollerHeight < this.info.containerHeight) ? (this.info.scrollerHeight - this.info.containerHeight) : 0;
            this.info.maxY = this.info.maxY || 0;
            this.info.bounce = null;
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

            this.info.pageY.push(this.info.touchY);
            this.info.timestampQ.push(+new Date());
        }
    };
    TouchScroll.prototype._move = function(e) {
        var event = e.originalEvent,
            self = this,
            x, y, lastDistX, lastDistY, newY, newVelocityY, timestamp;

        e.preventDefault();
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
                    if (Math.abs(self.info.moveX.avg()) < Math.abs(self.info.moveY.avg())) {
                        self.info.scrolling = true;
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
            this.info.distX = absMax(x - this.info.touchX, this.info.containerHeight);
            this.info.distY = absMax(y - this.info.touchY, this.info.containerHeight);
            this.info.diffX = this.info.distX - lastDistX;
            this.info.diffY = this.info.distY - lastDistY;
            this.info.lastMoveTime = timestamp;

            if (this.info.checkScrollTimeout) {
                this.info.moveX.push(this.info.diffX);
                this.info.moveY.push(this.info.diffY);
            }

            newY = this.info.startY + this.info.distY;

            if (this.info.y >= this.info.minY && this.info.y <= this.info.maxY && (newY > this.info.maxY || newY < this.info.minY)) {
                this.info.lastBounceTime = timestamp;
            }

            if (!this.info.moving) {
                this.info.moving = requestAnimationFrame($.proxy(function(){
                    this.info.moving = null;
                    this.scrollTo(newY);
                }, this));
            }
        }
    };
    TouchScroll.prototype._end = function(e) {
        var event = e.originalEvent,
            momentum = false,
            moveBack = true,
            x, y, lastY, lastMoveTime, now = +new Date(), endTime = now;

        if (this.info.touched) {
            if (e.type === "touchend" && !(event.touches.length === 0 && event.targetTouches.length === 0)) {
                return;
            }

            this.info.lastEventTime = now;
            this.info.touched = false;
            this.info.momentumStartY = this.info.y;
            this.info.momentumY = 0;

            y = lastY = this.info.pageY.pop();
            endTime = lastMoveTime = this.info.timestampQ.pop();
            this.info.velocityY = 0;

            if (this.info.pageY.len() > 0) {
                // if (this.info.pageY.len() > 1) {
                //     y = this.info.pageY.pop();
                //     endTime = this.info.timestampQ.pop();
                // }
                lastY = this.info.pageY.pop();
                lastMoveTime = this.info.timestampQ.pop();
            }
            if (Math.abs(y - lastY) > 1) {
                momentum = true;
                this.info.velocityY = (y - lastY) / Math.max(1, endTime - lastMoveTime);
                this.info.velocityY = absMax(absMin(this.info.velocityY * this.options.multiplyingVelocity, this.options.minVelocity), this.options.maxVelocity);
            }
            if (now < endTime + 100 && momentum && absMin(Math.abs(this.info.velocityY), this.options.minVelocity) > this.options.minVelocity) {
                var getDistance = getValueFromRatio(this.options.minMomentumDistance, this.options.maxMomentumDistance);
                var getVelocity = getRatioFromValue(this.options.minVelocity, this.options.maxVelocity);
                this.info.momentumY = getDistance(getVelocity(Math.abs(this.info.velocityY)));
            }

            this.info.momentumEndY = (y - lastY < 0) ? this.info.momentumStartY - this.info.momentumY : this.info.momentumStartY + this.info.momentumY;
            this.trigger("touchEnd");

            // if (this.info.timestampQ.len() > 1) {
                // if (Math.abs(this.info.velocityY) > this.options.velocityThreshold) {
                //     this.info.available = false;
                // }
                this._momentum();
            // }
        }
    };

    var Controller = function(){};
    Controller.prototype.setModel = function(model) {
        this.model = model;
        model.setController(this);
        return this;
    };
    Controller.prototype.setView = function(view) {
        this.view = view;
        view.setController(this);
        return this;
    };
    Controller.prototype.getModel = function() {
        return this.model;
    };
    Controller.prototype.getView = function() {
        return this.view;
    };

    var ModelView = function(){};
    ModelView.prototype.setController = function(controller) {
        this.controller = controller;
        return this;
    };
    ModelView.prototype.getController = function() {
        return this.controller;
    };

    var Item2d = function(el) {
        this.element = el;
        this._top = 0;
        this._height = 0;
    };
    Item2d.prototype.top = function(n) {
        this._top = n;
        this.element.style.webkitTransform = "translate3d(0px, " + n + "px, 0px)";// scaleX(1) scaleY(1) scaleZ(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skewX(0deg) skewY(0deg)";
    };
    Item2d.prototype.destroy = function() {
        this.element.parentNode.removeChild(this.element);
        this.element = this._top = this._height = null;
    };

    //ListModel
    var ListModel = function() {
        this._items = [];
        this._data = [];
        this._getting = false;
        this._startIndex = 0;
    };
    ListModel.prototype = Object.create(ModelView.prototype);
    ListModel.prototype.addItems = function(a) {
        var obj,
            self = this;

        a.each(function(i){
            var item = this;
            self._items.push(item);
            obj = self._items[i];
            obj.index = i;
            self._data.push(obj);
        });

        this._startIndex = Math.min(a.length, Math.floor(Math.random() * (a.length + 1)));
    };

    //ListController
    var ListController = function(options){
        this.options = options = $.extend({}, options);
        // this.XHR = new XHRWorker("json", this.options.workerUrl);
    };
    ListController.prototype = Object.create(Controller.prototype);

    //ListView
    var ListView2d = function(options) {
        this.options = options = $.extend({}, options);
        this._el = $(this.options.scroller).find(this.options.list).get(0);
        this._item = $(this.options.scroller).find(this.options.item);
        this.from = 0;
        this.to = 0;
        this._listHeight = 0;
        this._items = [];
        this._itemsRendered = [];
        this._viewportTop = this.options.viewportTop;
        this._viewportHeight = this.options.viewportHeight || $(this.options.scroller).height();
    };
    ListView2d.prototype = Object.create(ModelView.prototype); //inherit
    ListView2d.prototype._below = function(n) {
        return this._itemsRendered.filter(function(item){
            return (item._top >= -n + this._viewportHeight);
        }, this);
    };
    ListView2d.prototype._upper = function(n) {
        return this._itemsRendered.filter(function(item){
            return ((item._top + item._height) <= -n - this._viewportHeight);
        }, this);
    };
    ListView2d.prototype._shown = function(n) {
        if (typeof n === "undefined") {
            n = 0;
        }
        var y = -this._viewportTop,
            height = this._viewportHeight;

        return this._itemsRendered.filter(function(o){
            return o._top <= y + height + n && o._top + o._height + n >= y;
        });
    };
    ListView2d.prototype._unshown = function(n) {
        if (typeof n === "undefined") {
            n = 0;
        }
        var y = -this._viewportTop,
            height = this._viewportHeight;

        return this._itemsRendered.filter(function(o){
            return o._top > y + height + n || o._top + o._height + n < y;
        });
    };
    ListView2d.prototype._notupper = function() {
        return this._itemsRendered.filter(function(item){
            return (item._top + item._height >= -this._viewportTop);
        }, this);
    };
    ListView2d.prototype._relocate = function(uppers, belows) {
        var u = uppers.length,
            b = belows.length,
            g = Math.abs(u - b),
            n, c, last, first, lastFrom = this.from, lastTo = this.to,
            model = this.getController().getModel();

        if (g < 2) {
            return;
        }

        n = Math.floor(g / 2);
        c = n;

        if (u < b) {
            while (c > 0) {
                c -= 1;
                last = this._itemsRendered[this._itemsRendered.length - 1];
                first = this._itemsRendered[0];

                this._itemsRendered.unshift(this._itemsRendered.pop());
                this.from -= 1;
                this.to -= 1;
                last.top(first._top - last._height);
            }
        } else {
            while (c > 0) {
                c -= 1;
                first = this._itemsRendered[0];
                last = this._itemsRendered[this._itemsRendered.length - 1];

                this._itemsRendered.push(this._itemsRendered.shift());
                this.from += 1;
                this.to += 1;
                first.top(last._top + last._height);
            }
        }
    };
    ListView2d.prototype.relocate = function(n) {
        this._relocate(this._upper(n), this._below(n - this._viewportHeight));
    };
    ListView2d.prototype.ready = function(list) {
        this._ready(list);
    };
    ListView2d.prototype._ready = function(list) {
        this._listHeight = 0;

        var height = this._item.eq(0).outerHeight(),
            itemLength = list.length,
            renderLength = itemLength,
            listHeight = (height * itemLength),
            pick = this.getController().getModel()._startIndex;

        while (listHeight < this._viewportHeight * 3) {
            renderLength += itemLength;
            listHeight = height * renderLength;
        }

        for (var i = 0; i < renderLength; i++) {
            var item = new Item2d(this._item[(i + pick) % itemLength].cloneNode(true));
            this._items.push(item);
        }

        this._items.forEach(function(item, i){
            item._parent = this._el;
            item._parent.appendChild(item.element);
            item._height = $(item.element).outerHeight();
            item.top(this._listHeight);
            this._listHeight += item._height;
            this._itemsRendered.push(item);

            this.to = i;
        }, this);

        this._listSetHeight = this._listHeight;

        this.relocate(pick * height);
        // console.log("from", this.from, "to", this.to);
    };

    /**
     * Roulette2d constructor
     *
     * @name skp.uiCore.Roulette2d
     * @exports Roulette2d as skp.uiCore.Roulette2d
     * @constructor
     * @param  {HTMLElement} scroller scroller element
     * @param  {Object} options  options object
     */
    var Roulette2d = function(scroller, options) {
        this.options = options = $.extend({
            touchDisabled : false,
            velocityThreshold: 1,
            duration: 7000,
            round: 10,
            scroller: scroller,
            viewportTop: 0,
            viewportHeight: 0,
            workerUrl: "worker.js",
            onItemAppearCallbackTiming: "scrollEnd",
            jsonListKey: "list",
            itemLength: 20,
            fixed: false,
            className: "infinite"
        }, options);

        //list
        var self = this,
            listController = this._listController = new ListController(options);

        listController.setModel(new ListModel());
        listController.setView(new ListView2d(options));

        $(scroller).addClass(options.className);
        //touchScroll
        this._touchScroll = new TouchScroll(scroller, $.extend(options, {
            mode : "translate",
            indicator : false,
            containerSelector : options.list,
            velocityThreshold : options.velocityThreshold
            //touchScroll 속도 조절 옵션을 infinitescroll 초기화시 지정가능해야함
        })).on({
            touch : function() {
                this.info.maxY = Infinity;
                this.info.containerHeight = Infinity;
                // console.log(this.info, getIndex(this.info.y));
            },
            touchEnd : function() {
                //moving
                this.options.momentumDuration = 500;
                this.info.momentumEndY -= this.info.momentumEndY % self._itemHeight;
                if (this.info.diffY > 0) {
                    if (!this.info.velocityY) {
                        this.info.velocityY = 0.1;
                    }
                    if (this.info.y > 0) {
                         this.info.momentumEndY += self._itemHeight;
                    }
                } else if (this.info.diffY < 0) {
                    if (!this.info.velocityY) {
                        this.info.velocityY = -0.1;
                    }
                    if (this.info.y < 0) {
                         this.info.momentumEndY -= self._itemHeight;
                    }
                } else {
                    this.info.momentumEndY = self.getCloser(this.info.y);
                    if (this.info.momentumEndY > this.info.momentumStartY) {
                        if (!this.info.velocityY) {
                            this.info.velocityY = 0.1;
                        }
                    } else {
                        if (!this.info.velocityY) {
                            this.info.velocityY = -0.1;
                        }
                    }
                }
                this.info.momentumStartY = this.info.y;
                this.info.momentumY = (this.info.velocityY > 0) ? (this.info.momentumEndY - this.info.momentumStartY) : (this.info.momentumStartY - this.info.momentumEndY);

                //quick flicking
                if (this.info.timestampQ.len() > 1 && Math.abs(this.info.velocityY) > this.options.velocityThreshold) {
                    if (typeof this.options.onStart === "function") {
                        this.options.onStart.call(null);
                        this.info.available = false;
                    }
                    this.options.momentumDuration = options.duration;
                    this.info.momentumY += self._itemHeight * self._total * options.round;
                    this.info.momentumY += self.getDistanceOfClosest(this.info, options.value);
                }
            },
            scroll : function() {
                listController.getView()._viewportTop = this.info.y;
                listController.getView().relocate(this.info.y);
            },
            scrollEnd : function() {
                if (!this.info.available && typeof this.options.onEnd === "function") {
                    this.options.onEnd.call(null, options.value);
                }
            }
        });

        var list = $(scroller).find(this.options.item);
        listController.getModel().addItems(list);
        listController.getView().ready(list);

        this._itemHeight = this._listController.getView()._items[0]._height;
        this._start = this._listController.getModel()._startIndex;
        this._total = this._listController.getModel()._items.length;

        list.remove();
        this.refresh();

        if (this.options.touchDisabled) {
            this._touchScroll.disable();
        }
    };
    Roulette2d.prototype.getCloser = function(y) {
        var itemHeight = this._itemHeight,
            gap = Math.abs(y % itemHeight);

        if (y > 0) {
            if (gap < itemHeight / 2) {
                return y - gap;
            } else {
                return y - gap + itemHeight;
            }
        } else {
            if (gap < itemHeight / 2) {
                return y + gap;
            } else {
                return y + gap - itemHeight;
            }
        }
    };
    Roulette2d.prototype.getIndex = function(y) {
        var itemHeight = this._itemHeight,
            start = this._start,
            total = this._total,
            relative = y / itemHeight % total,
            value = 0;

        if (y < 0) {
            value = (Math.floor(Math.abs(relative) + start)) % total;
        } else {
            value = Math.floor((start + total) - relative) % total;
        }
        return value;
    };
    Roulette2d.prototype.getDistanceOfClosest = function(info, targetIndex) {
        var itemHeight = this._itemHeight,
            value = this.options.value,
            start = this._start,
            total = this._total,
            target, index;

        if (info.velocityY < 0) {
            target = info.y - info.momentumY;
            index = this.getIndex(target);
            if (targetIndex > index) {
                return (targetIndex - index - 1) * itemHeight;
            } else {
                return (targetIndex + total - index - 1) * itemHeight;
            }
        } else {
            target = info.y + info.momentumY;
            index = this.getIndex(target);
            if (targetIndex < index) {
                return (index - targetIndex + 1) * itemHeight;
            } else {
                return (index + total - targetIndex + 1) * itemHeight;
            }
        }
    };
    Roulette2d.prototype.start = function() {
        var touchScroll = this.getTouchScroll(),
            itemHeight = this._itemHeight,
            value = this.options.value,
            start = this._start,
            total = this._total;

        touchScroll.options.momentumDuration = touchScroll.options.duration;
        touchScroll.info.lastEventTime = +new Date();
        touchScroll.info.momentumStartY = touchScroll.info.y;

        //quick flicking
        if (typeof touchScroll.options.onStart === "function") {
            touchScroll.options.onStart.call(null);
            touchScroll.info.available = false;
        }
        touchScroll.info.velocityY = 1;
        touchScroll.info.maxY = Infinity;
        touchScroll.info.scrollerHeight = touchScroll.info.scrollerHeight || touchScroll.el.scroller.height();
        touchScroll.info.containerHeight = Infinity;
        touchScroll.info.minY = (touchScroll.info.scrollerHeight < touchScroll.info.containerHeight) ? (touchScroll.info.scrollerHeight - touchScroll.info.containerHeight) : 0;
        touchScroll.info.bounce = 0;
        touchScroll.info.momentumY = itemHeight * total * this.options.round;
        touchScroll.info.momentumY += this.getDistanceOfClosest(touchScroll.info, value);
        touchScroll.info.momentumEndY = touchScroll.info.momentumStartY - touchScroll.info.momentumY;
        touchScroll._momentum();
    };
    /**
     * get the TouchScroll instance
     *
     * @return {skp.uiCore.TouchScroll}
     */
    Roulette2d.prototype.getTouchScroll = function() {
        return this._touchScroll;
    };
    /**
     * refresh the scroller.
     * @return {this}
     */
    Roulette2d.prototype.refresh = function() {
        if (!this.options.fixed) {
            this._listController._viewportHeight = this._touchScroll.info.scrollerHeight = this._touchScroll.el.scroller.height();
            this._touchScroll.scrollTo(Math.max(Math.min(this._touchScroll.info.maxY, this._touchScroll.pos()), this._touchScroll.info.minY));
        }
        return this;
    };
    /**
     * get the list controller object. The list controller handles the list model and the list view object.
     * @return {Object} list controller object
     */
    Roulette2d.prototype.getListController = function() {
        return this._listController;
    };
    /**
     * destroy Roulette2d. it destroys its TouchScroll as well.
     */
    Roulette2d.prototype.destroy = function() {
        if (typeof this._touchScroll !== "undefined") {
            this._touchScroll.destroy();
        }
    };

    if (typeof skp !== "undefined" && typeof skp.uiCore !== "undefined") {
        skp.uiCore.Roulette2d = Roulette2d;
    } else {
        window.Roulette2d = Roulette2d;
    }

    var Item3d = function(el) {
        this.element = el;
        this._deg = 0;
        // this._height = 0;
    };
    Item3d.prototype.rotate = function(n, center) {
        center = center || 0;

        var z = (25 / Math.tan(Math.PI/4/3/*/2/9*/));
        this._deg = n;
        this.element.style.webkitTransform = "translate3d(0, 65px, 0) rotateX(" + n + "deg) translate3d(0px, 0px, " + z + "px)";
    };
    Item3d.prototype.destroy = function() {
        this.element.parentNode.removeChild(this.element);
        // this.element = this._top = this._height = null;
    };

    //ListView
    var ListView3d = function(options) {
        this.options = options = $.extend({}, options);
        this._el = $(this.options.scroller).find(this.options.list).get(0);
        this._item = $(this.options.scroller).find(this.options.item);
        this.from = 0;
        this.to = 0;
        this._items = [];
        this._itemsRendered = [];
        this._viewportTop = this.options.viewportTop;
        this._viewportHeight = this.options.viewportHeight || $(this.options.scroller).height();
    };
    ListView3d.prototype = Object.create(ModelView.prototype); //inherit
    ListView3d.prototype._below = function(n) {
        return this._itemsRendered.filter(function(item){
            return (item._deg < n - 90);
        }, this);
    };
    ListView3d.prototype._upper = function(n) {
        return this._itemsRendered.filter(function(item){
            return (item._deg > n + 90);
        }, this);
    };
    ListView3d.prototype._shown = function(n) {
        if (typeof n === "undefined") {
            n = 0;
        }
        var y = -this._viewportTop,
            height = this._viewportHeight;

        return this._itemsRendered.filter(function(o){
            return o._deg <= 90 && o._deg >= -90;
        });
    };
    ListView3d.prototype._unshown = function(n) {
        if (typeof n === "undefined") {
            n = 0;
        }
        var y = -this._viewportTop,
            height = this._viewportHeight;

        return this._itemsRendered.filter(function(o){
            return o._deg > 90 || o._deg < -90;
        });
    };
    ListView3d.prototype._relocate = function(uppers, belows, centerDeg) {
        var u = uppers.length,
            b = belows.length,
            g = Math.abs(u - b),
            n, c, last, first, lastFrom = this.from, lastTo = this.to,
            model = this.getController().getModel();

        if (g < 2) {
            return;
        }
        n = Math.floor(g / 2);
        c = n;
        if (u < b) {
            while (c > 0) {
                c -= 1;
                last = this._itemsRendered[this._itemsRendered.length - 1];
                first = this._itemsRendered[0];

                this._itemsRendered.unshift(this._itemsRendered.pop());
                this.from -= 1;
                this.to -= 1;
                last.rotate(first._deg + 30, centerDeg);
            }
        } else {
            while (c > 0) {
                c -= 1;
                first = this._itemsRendered[0];
                last = this._itemsRendered[this._itemsRendered.length - 1];

                this._itemsRendered.push(this._itemsRendered.shift());
                this.from += 1;
                this.to += 1;
                first.rotate(last._deg - 30, centerDeg);
            }
        }
    };
    ListView3d.prototype.relocate = function(n) {
        this._relocate(this._upper(n), this._below(n), n);
    };
    ListView3d.prototype.ready = function(list) {
        this._ready(list);
    };
    ListView3d.prototype._ready = function(list) {
        var height = this._item.eq(0).outerHeight(),
            itemLength = list.length,
            renderLength = itemLength,
            pick = this.getController().getModel()._startIndex;

        while (renderLength < 7) {
            renderLength += itemLength;
        }

        for (var i = 0; i < renderLength; i++) {
            var item = new Item3d(this._item[(i + pick) % itemLength].cloneNode(true));
            this._items.push(item);
        }

        var deg = 0;
        this._items.forEach(function(item, i){
            item._parent = this._el;
            item._parent.appendChild(item.element);

            item.rotate(deg);
            deg -= 30;
            // item._height = $(item.element).outerHeight();
            this._itemsRendered.push(item);

            this.to = i;
        }, this);

        this.relocate(0);
        // console.log("from", this.from, "to", this.to);
    };

    /**
     * Roulette3d constructor
     *
     * @name skp.uiCore.Roulette3d
     * @exports Roulette3d as skp.uiCore.Roulette3d
     * @constructor
     * @param  {HTMLElement} scroller scroller element
     * @param  {Object} options  options object
     */
    var Roulette3d = function(scroller, options) {
        this.options = options = $.extend({
            touchDisabled : false,
            scroller: scroller,
            fixed: false,
            velocityThreshold: 1,
            duration: 7000,
            round: 10
        }, options);

        //list
        var self = this,
            listController = this._listController = new ListController(options);

        listController.setModel(new ListModel());
        listController.setView(new ListView3d(options));

        //touchScroll
        this._touchScroll = new TouchScroll(scroller, $.extend(options, {
            mode : "rotate",
            indicator : false,
            containerSelector : options.list,
            velocityThreshold : options.velocityThreshold
            //touchScroll 속도 조절 옵션을 infinitescroll 초기화시 지정가능해야함
        })).on({
            touch : function() {
                this.info.maxY = Infinity;
                this.info.containerHeight = Infinity;
                // console.log(this.info, getIndex(this.info.y));
            },
            touchEnd : function() {
                //moving
                this.options.momentumDuration = 500;
                this.info.momentumEndY -= this.info.momentumEndY % self._deg;
                if (this.info.diffY > 0) {
                    if (!this.info.velocityY) {
                        this.info.velocityY = 0.1;
                    }
                    if (this.info.y > 0) {
                         this.info.momentumEndY += self._deg;
                    }
                } else if (this.info.diffY < 0) {
                    if (!this.info.velocityY) {
                        this.info.velocityY = -0.1;
                    }
                    if (this.info.y < 0) {
                         this.info.momentumEndY -= self._deg;
                    }
                } else {
                    this.info.momentumEndY = self.getCloser(this.info.y);
                    if (this.info.momentumEndY > this.info.momentumStartY) {
                        if (!this.info.velocityY) {
                            this.info.velocityY = 0.1;
                        }
                    } else {
                        if (!this.info.velocityY) {
                            this.info.velocityY = -0.1;
                        }
                    }
                }
                this.info.momentumStartY = this.info.y;
                this.info.momentumY = (this.info.velocityY > 0) ? (this.info.momentumEndY - this.info.momentumStartY) : (this.info.momentumStartY - this.info.momentumEndY);

                //quick flicking
                if (this.info.timestampQ.len() > 1 && Math.abs(this.info.velocityY) > this.options.velocityThreshold) {
                    if (typeof this.options.onStart === "function") {
                        this.options.onStart.call(null);
                        this.info.available = false;
                    }
                    this.options.momentumDuration = options.duration;
                    this.info.momentumY += self._deg * self._total * options.round;
                    this.info.momentumY += self.getDistanceOfClosest(this.info, options.value);
                }
            },
            scroll : function() {
                // listController.getView()._viewportTop = this.info.y;
                listController.getView().relocate(this.info.y);
            },
            scrollEnd : function() {
                // console.log(this.info);
                if (!this.info.available && typeof this.options.onEnd === "function") {
                    this.options.onEnd.call(null, options.value);
                }
            }
        });

        var list = $(scroller).find(this.options.item);
        listController.getModel().addItems(list);
        listController.getView().ready(list);

        this._deg = 30;
        this._start = this._listController.getModel()._startIndex;
        this._total = this._listController.getModel()._items.length;

        list.remove();
        this.refresh();

        if (this.options.touchDisabled) {
            this._touchScroll.disable();
        }
    };
    Roulette3d.prototype.getCloser = function(y) {
        var deg = this._deg,
            gap = Math.abs(y % deg);

        if (y > 0) {
            if (gap < deg / 2) {
                return y - gap;
            } else {
                return y - gap + deg;
            }
        } else {
            if (gap < deg / 2) {
                return y + gap;
            } else {
                return y + gap - deg;
            }
        }
    };
    Roulette3d.prototype.getIndex = function(y) {
        var deg = this._deg,
            start = this._start,
            total = this._total,
            relative = y / deg % total,
            value = 0;

        if (y < 0) {
            value = (Math.floor(Math.abs(relative) + start)) % total;
        } else {
            value = Math.floor((start + total) - relative) % total;
        }
        return value;
    };
    Roulette3d.prototype.getDistanceOfClosest = function(info, targetIndex) {
        var deg = this._deg,
            value = this.options.value,
            start = this._start,
            total = this._total,
            target, index;

        if (info.velocityY < 0) {
            target = info.y - info.momentumY;
            index = this.getIndex(target);
            if (targetIndex > index) {
                return (targetIndex - index) * deg;
            } else {
                return (targetIndex + total - index) * deg;
            }
        } else {
            target = info.y + info.momentumY;
            index = this.getIndex(target);
            if (targetIndex < index) {
                return (index - targetIndex) * deg;
            } else {
                return (index + total - targetIndex) * deg;
            }
        }
    };
    Roulette3d.prototype.start = function() {
        var touchScroll = this.getTouchScroll(),
            deg = this._deg,
            value = this.options.value,
            start = this._start,
            total = this._total;

        touchScroll.options.momentumDuration = touchScroll.options.duration;
        touchScroll.info.lastEventTime = +new Date();
        touchScroll.info.momentumStartY = touchScroll.info.y;

        //quick flicking
        if (typeof touchScroll.options.onStart === "function") {
            touchScroll.options.onStart.call(null);
            touchScroll.info.available = false;
        }
        touchScroll.info.velocityY = 1;
        touchScroll.info.maxY = Infinity;
        touchScroll.info.scrollerHeight = touchScroll.info.scrollerHeight || touchScroll.el.scroller.height();
        touchScroll.info.containerHeight = Infinity;
        touchScroll.info.minY = (touchScroll.info.scrollerHeight < touchScroll.info.containerHeight) ? (touchScroll.info.scrollerHeight - touchScroll.info.containerHeight) : 0;
        touchScroll.info.bounce = 0;
        touchScroll.info.momentumY = deg * total * this.options.round;
        touchScroll.info.momentumY += this.getDistanceOfClosest(touchScroll.info, value);
        touchScroll.info.momentumEndY = touchScroll.info.momentumStartY - touchScroll.info.momentumY;
        touchScroll._momentum();
    };
    /**
     * get the TouchScroll instance
     *
     * @return {skp.uiCore.TouchScroll}
     */
    Roulette3d.prototype.getTouchScroll = function() {
        return this._touchScroll;
    };
    /**
     * refresh the scroller.
     * @return {this}
     */
    Roulette3d.prototype.refresh = function() {
        if (!this.options.fixed) {
            this._listController._viewportHeight = this._touchScroll.info.scrollerHeight = this._touchScroll.el.scroller.height();
            this._touchScroll.scrollTo(Math.max(Math.min(this._touchScroll.info.maxY, this._touchScroll.pos()), this._touchScroll.info.minY));
        }
        return this;
    };
    /**
     * get the list controller object. The list controller handles the list model and the list view object.
     * @return {Object} list controller object
     */
    Roulette3d.prototype.getListController = function() {
        return this._listController;
    };
    /**
     * destroy Roulette3d. it destroys its TouchScroll as well.
     */
    Roulette3d.prototype.destroy = function() {
        if (typeof this._touchScroll !== "undefined") {
            this._touchScroll.destroy();
        }
    };

    if (typeof skp !== "undefined" && typeof skp.uiCore !== "undefined") {
        if (skp.uiCore.AnimationTaskQueue) {
            AnimationTaskQueue = skp.uiCore.AnimationTaskQueue;
        }
    } else {
        if (window.AnimationTaskQueue) {
            AnimationTaskQueue = window.AnimationTaskQueue;
        }
    }

    if (typeof skp !== "undefined" && typeof skp.uiCore !== "undefined") {
        skp.uiCore.Roulette3d = Roulette3d;
    } else {
        window.Roulette3d = Roulette3d;
    }
}(jQuery));