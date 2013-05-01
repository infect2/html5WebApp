/*
 * rotation.js rotation.js is css animation framework. make your own animation by using some simple modules like push, sync, execute.
 * Owner: JeongHyun Yoon (jeonghyun.yoon@sk.com)
 * License: SK planet wholly owned
 */

(function (window, undefined) {
	var	needPrefix = [
			'animation',
			'animation-name',
			'animation-duration',
			'animation-timing-function',
			'animation-delay',
			'animation-iteration-count',
			'animation-direction',
			'animation-play-state',
			'backface-visibility',
			'border-image',
			'box-align',
			'box-direction',
			'box-flex',
			'box-ordinal-group',
			'box-orient',
			'box-pack',
			'box-shadow',
			'column-gap',
			'column-rule',
			'column-rule-color',
			'column-rule-style',
			'column-rule-width',
			'columns',
			'column-count',
			'transform',
			'transform-origin',
			'transform-style',
			'transition',
			'transition-property',
			'transition-timing-function'
		],
		vendor = [ "-webkit-", "-moz-", "-ms-", "-o-" ],
		endEventList = [ "transitionend", "webkitTransitionEnd", "oTransitionEnd" ];
	// delay & duration default value is 0ms, 500ms
	/**
	 * create Rotation object
	 *
	 * @name skp.uiCore.Rotation
	 * @class
	 * @example
	 *	Rotation()
	 *		.push("#div1", {
	 *		"duration":"1000",
	 *		"transform":"rotate(300deg)"
	 *	})
	 *	execute();
	 */
	var Rotation = function(){
		return new Rotation.fn.init();
	};

	Rotation.fn = Rotation.prototype = {
		constructor: Rotation,
		animationQueue: [],
		lastExecuteElement: null,
		element: null,
		isEndEvent: false,
		isSync: false,
		errorOccurred: false,
		callback:null,
		/**
		* initialization Rotation object
		*/
		init: function(){

		},
        /**
         * push module for select elements and set css animation
         * @param {String} selectorfor element select, you can pass the String selector(id or class) or jQuery Object
         * @param {Object} properties set css property, key is css name, value is css value
         * @param {Object} callback set animation end callback function
         */
		push: function(selector, properties, callback){
			var isSameElement = false,
				animationQueueLength = this.animationQueue.length;
			// error check
			if(this.errorOccurred){
				return this;
			}

			// selector에 매칭되는 element가 없는 경우에도 querySelectorAll에서 length 가 0 인item Array를 반환
			// jQuery object가 전달된 경우 getElementById 또는 querySelectorAll을 거치지 않고 selector를 그대로 this.element에 저장
			this.element = ( typeof selector === "string" ) ? ( document.getElementById(selector) || document.querySelectorAll(selector) ) : selector;
			if(this.element.length === 0){
				// this.element.length가 0 인 경우
				// document.querySelectorAll(selector)로 element를 선택했지만 매칭되는 element가 없는 경우이므로 에러 발생
				console.log("Error Occured : in push method // cannot select element, '" + selector + "' is not exist");
				// error가 발생한 경우 errorOccurred 값을 true로 변경 후 animationQueue를 비움
				this.errorOccurred = true;
				this.animationQueue.splice(0, this.animationQueue.length + 1);

				return this;
			}else if(this.element.length === undefined){
				// this.element.length 가 undefined인 경우
				// document.getElementById(selector)로 element로 선택한 경우이므로 element를 배열로 만들어 준다.
				this.element = [this.element];
			}
			// save properties
			this.properties = properties;
			// adjust properties
			this._adjustProperty(this.properties);
			// save end callback
			this.callback = callback;
			// save type, element, properties, callback in animationQueue
			this.animationQueue.push({
				type:"animation",
				element:this.element,
				properties:this.properties,
				callback:this.callback
			});

			return this;
		},
        /**
         * @description sync module for asynchronous animation
         */
		sync: function(){
			// error check
			if(this.errorOccurred){
				return this;
			}
			if(this.animationQueue.length === 0){
				console.log("Error Occured : in sync method // need push method before sync");
				this.errorOccurred = true;
			}else{
				this.animationQueue.push({type:"sync"});
			}

			return this;
		},
		/**
         * @description execute module for do animation
         */
		execute: function(){
			//error check
			if(this.errorOccurred){
				return this;
			}
			if(this.animationQueue.length === 0){
				console.log("Error Occured : in execute method // need push method ");
				this.errorOccurred = true;
				return this;
			}else if(this.animationQueue[this.animationQueue.length -1].type === "sync"){
				console.log("Error Occured : in execute method // need push method after sync");
				this.errorOccurred = true;
				return this;
			}
			// set defaultValue
			var	animationQueueLength = this.animationQueue.length,
				// set defaultValue longestAnimationTime
				longestAnimationTime = this._getAnimationTime(this.animationQueue[0]),
				currentAnimationTime,
				index;

			// set defaultValue lastExecuteElement
			for(var frame in this.animationQueue){
				if(this.animationQueue[frame].element !== undefined){
					this.lastExecuteElement = this.animationQueue[frame].element;
					break;
				}
			}
			// animationQueue에서 type이 sync인 object를 찾아 index를 저장
			for(var objectIndex in this.animationQueue){
				if(this.animationQueue[objectIndex].type === "sync"){
					index = objectIndex;
					this.isSync = true;
					break;
				}else{
					// sync가 없는 경우 isSync를 false로 저장
					this.isSync = false;
				}
			}
			// animation Queue 에 type이 sync인 object가 없는 경우 index값을 animationQueue의 총 길이로 설정
			index = ( index === undefined ) ? animationQueueLength : index;
			for(var i= 0; i < index; i++){
				currentAnimationTime = this._getAnimationTime(this.animationQueue[i]);
				// 현재 element의 animation시간이 저장된 longestAnimationTime 보다 긴 경우 longestAnimationTime을 바꿔줌
				if(longestAnimationTime < currentAnimationTime){
					longestAnimationTime = currentAnimationTime;
					if(typeof this.animationQueue[i].element[0] !== undefined){
						// lastExecuteElement값 역시 animation 수행 시간이 가장 긴 element로 변경
						this.lastExecuteElement = this.animationQueue[i].element;
					}
				}
				// set endCallback
				if(this.animationQueue[i].callback !== undefined){
					this._setEndCallback(this.animationQueue[i].callback, currentAnimationTime);
				}
				// do animation
				this._doAnimation(this.animationQueue[i]);
			}
			// set endEvent
			this._setEndEvent(longestAnimationTime);
			// sync앞부분까지 animation을 수행한 후 animationQueue에서 제거
			this.animationQueue.splice(0, parseInt(index, 10)+1);

			return true;
		},
        /**
         * @description set animation end event callback
         * @param {Number} animationTime total animation time
         */
		_setEndEvent: function(animationTime){
			var self = this;
			setTimeout(function(){self._endEventHandler(self);}, animationTime);
		},
        /**
         * @description set end callback function
         * @param {Object} endCallback end callback function
         * @param {Number} currentAnimationTime current element's animation time
         */
		_setEndCallback: function(endCallback, currentAnimationTime){
			setTimeout(endCallback, currentAnimationTime);
		},
        /**
         * @description get element's animation time
         * @param {Object} element pass the element witch want to know animation time
         */
		_getAnimationTime: function(element){
			// set default duration, delay value
			var duration = ( element.properties.duration ) === undefined ? 500 : element.properties.duration,
				delay = ( element.properties.delay ) === undefined ? 0 : element.properties.delay,
				totalAnimationTime = duration + delay;

			return totalAnimationTime;
		},
        /**
         * @description set element's css property for animation
         * @param {Object} frame pass the animation information. elements, css properties, end callback function information
         */
		_doAnimation: function(frame){
			var elementLength = frame.element.length,
				element = frame.element,
				properties = frame.properties,
				callback = frame.callback;

			for(var i = 0; i  < elementLength; i++){
				for(var propertyName in properties){
					element[i].style.setProperty(propertyName, properties[propertyName]);
				}
			}
		},
		// bind transitionend event
		_endEventHandler: function(self){
			if(self.isSync){
				self.execute();
			}
		},
        /**
         * @description set vendor prefix compare needPrefix array with properties and set duration, delay values
         * @param {Object} properties pass the css properties which need vendor prefix property
         */
		_adjustProperty: function(properties){
			// selector가 class로 들어오는 등 여러개의 element가 선택되었어도, 하나의 push안에서 properties는 변함이 없으므로 element별로 properties를 설정해줄 필요가 없음..
			var	duration = ( properties.duration === undefined ) ? "500ms" : properties.duration + "ms",
				delay = ( properties.delay === undefined ) ? "0ms" : properties.delay + "ms";
			// 사용자가 transition-duration 을 입력한 경우, 입력한 transition-duration값을 duration에 저장
			for( var propertyName in properties ){
				// 사용자가 직접 transition-duration을 입력한 경우 기존 duration값을 무시하고 transition-duration값을 duration변수에 저장
				if(propertyName.indexOf("transition-duration") !== -1){
					duration = properties.duration = properties[propertyName];
				}
				// 사용자가 직접 transition-delay 입력한 경우 기존 delay값을 무시하고 transition-delay값을 delay변수에 저장
				if(propertyName.indexOf("transition-delay") !== -1){
					delay = properties.delay = properties[propertyName];
				}
				if(needPrefix.indexOf(propertyName !== -1)){
					this._extend(properties, this._attachVendorPrefix( propertyName, properties[propertyName] ));
				}
				// needPrefix배열과 매칭되는 propertyName이 존재하면 vendorPrefix를 붙임
				// ( needPrefix.indexOf(propertyName) >=0 ) ? this._extend(properties, this._attachVendorPrefix( propertyName, properties[propertyName] )) : false;
			}
			// duration과 delay값에 vendorPrefix붙임
			this._extend(properties, this._attachVendorPrefix("transition-duration", duration));
			this._extend(properties, this._attachVendorPrefix("transition-delay", delay));
		},
        /**
         * @description attach vendor prefix
         * @param {String} propertyName property name
         * @param {String} value css value
         */
		_attachVendorPrefix: function(propertyName, value){
			var addVendorPrefix = {};
			// vendor array를 closure로 뺌
			for( var i in vendor ){
				addVendorPrefix[vendor[i] + propertyName] = value;
			}

			return addVendorPrefix;
		},
         /**
         * @description merge two objects
         * @param {Object} destination destination object
         * @param {Object} source source object will be mearged to destination object
         */
		_extend: function(destination, source){
			for ( var property in source ){
				destination[property] = source[property];
			}

			return destination;
		}
	};

	Rotation.fn.init.prototype = Rotation.fn;

    if (typeof skp !== "undefined" && typeof skp.uiCore !== "undefined") {
        skp.uiCore.Rotation = Rotation;
    } else {
        window.Rotation = Rotation;
    }
})(window);