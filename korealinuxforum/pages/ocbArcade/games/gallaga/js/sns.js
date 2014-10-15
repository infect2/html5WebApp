// //tw
// !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

// //fb
// window.fbAsyncInit = function() {
// // init the FB JS SDK
// FB.init({
//   appId      : '438418686262671',                        // App ID from the app dashboard
//   // channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
//   status     : true,                                 // Check Facebook Login status
//   xfbml      : true                                  // Look for social plugins on the page
// });

// // Additional initialization code such as adding Event Listeners goes here
// };

// // Load the SDK asynchronously
// (function(){
//  // If we've already installed the SDK, we're done
//  if (document.getElementById('facebook-jssdk')) {return;}

//  // Get the first script element, which we'll use to find the parent node
//  var firstScriptElement = document.getElementsByTagName('script')[0];

//  // Create a new script element and set its id
//  var facebookJS = document.createElement('script');
//  facebookJS.id = 'facebook-jssdk';

//  // Set the new script's source to the source of the Facebook JS SDK
//  facebookJS.src = '//connect.facebook.net/ko_KR/all.js';

//  // Insert the Facebook JS SDK into the DOM
//  firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
// }());

/*
 Copyright 2012 KAKAO
 */
(function (window, undefined) {
    var kakao = {};
    window.kakao = window.kakao || kakao;

    var uagent = navigator.userAgent.toLocaleLowerCase();
    if (uagent.search("android") > -1) {
        kakao.os = "android";
        if (uagent.search("chrome") > -1) {
            kakao.browser = "android+chrome";
        }
    } else if (uagent.search("iphone") > -1 || uagent.search("ipod") > -1 || uagent.search("ipad") > -1) {
        kakao.os = "ios";
    }

    var app = {
        talk: {
            base_url: "kakaolink://sendurl?",
            apiver: "2.0.1",
            store: {
                android: "market://details?id=com.kakao.talk",
                ios: "http://itunes.apple.com/app/id362057947"
            },
            pack: "com.kakao.talk"
        },
        story: {
            base_url: "storylink://posting?",
            apiver: "1.0",
            store: {
                android: "market://details?id=com.kakao.story",
                ios: "http://itunes.apple.com/app/id486244601"
            },
            pack: "com.kakao.story"
        }
    };

    kakao.link = function (name) {
        var link_app = app[name];
        if (!link_app) {
            return { send: function () {
            throw "No App exists";
            }};
        }
        return {
            send: function (params) {
                var self = this;
                var _app = this.app;
                params.apiver = _app.apiver;
                var full_url = _app.base_url + serialized(params);

                if (this.os === "ios") {
                    var last = +new Date();
                    // var timer = setTimeout(install_block, 2 * 1000);
                    var timer = setTimeout(function(){
                        var past = (+new Date() - last);
                        if (past < 2500) {
                            window.location = _app.store[self.os];
                        }
                    }, 2000);

                    window.addEventListener('pagehide', clearTimer(timer));
                    window.location = full_url;
                } else if (this.os === "android") {
                    // if (this.browser == "android+chrome") {
                    //     window.location = "intent:" + full_url + "#Intent;package=" + _app.package + ";end;";
                    // } else {
                        var iframe = document.createElement('iframe');
                        iframe.style.visibility = 'hidden';
                        iframe.style.position = "absolute";
                        iframe.style.left = "-1000px";
                        iframe.style.height = "0px";
                        iframe.src = "fakescheme://egame.skmcgw.com/openUrl?url=" + encodeURIComponent(full_url);
                        iframe.onload = function(){
                            window.location = "http://egame.skmcgw.com/openUrl?url=" + encodeURIComponent(_app.store[self.os]);
                        };
                        document.body.appendChild(iframe);
                    // }
                }
            },
            app: link_app,
            os: kakao.os,
            browser: kakao.browser
        };

        function serialized(params) {
            var stripped = [];
            for (var k in params) {
                if (params.hasOwnProperty(k)) {
                    stripped.push(k + "=" + encodeURIComponent(params[k]));
                }
            }
            return stripped.join("&");
        }

        function clearTimer(timer) {
            return function () {
                clearTimeout(timer);
                window.removeEventListener('pagehide', arguments.callee);
            };
        }
    };
}(window));
