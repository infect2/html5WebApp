var slideOn = (/android (2.|4.0|4.1)/gi).test(navigator.appVersion);
var androidOld = (/android (2.|4.0|4.1)/gi).test(navigator.appVersion);
var ios = (/iphone OS/gi).test(navigator.appVersion);
var enableGameStatusCard = true; //게임 현황판 카드 enabl/disable. disable시 룰렛 카드로 fallback
var initialCubeViewMode = true;  //첫번째 화면 loading시 cube일지 flat 일지 결정

var cube,
    slide,
    arcade = document.getElementsByClassName("arcade")[0],
    launchAnimation = !slideOn,//GO EVENT 버튼 클릭시 launch animation
    launchingDelay = 2000;//in msec

//fragmentation handling용 변수
var backFaceVisibilityOff,
    badgeAnimationOff,
    enableIdleAnimation,
    idleAnimationType,
    snowFallingEffect,
    perspectiveOrigin;

//Cube 모드일때 bottom card에 게임 정보 출력
var gameIdx = -1,//현재 화면에 뿌리고 있는 게임 index
    gameLevelNum = -1;

/*
 * selector: class selector getElementsByClassName으로 찾음
 * event status
 * ongoing: 이벤트 진행 중
 * coming: 조만간 진행
 * terminated: 종료 됨
 * DISCLAIMER
 * element는 slide 모드 일 경우 초기 시점 DOM node이고 slide component는 동적으로 DOM을 변경하므로
 * 레퍼런스를 저장해서 사용하는게 무의미함
 * 즉 element는 cube 모드일 때만 유효하고 sldie mode 일 경우 매번 document에서 얻어야 함
 */
var landingPageInfo = {
    top : {
        element: document.getElementsByClassName("card top")[slideOn?0:1],
        landingUrl: "https://egame.skmcgw.com/ocbgameB3/index.html",
        title: "요리조리 베이스볼",
        iconUrl: "img/card_baseball.png",
        status: "ongoing",
        badgeUrl: "img/cube_event.png",
        cardViewLoader: function(element, cardURL, badgeURL) {
            //첫번째 image tag는 face icon
            element.children[0].setAttribute("src",cardURL);
            if (badgeURL.length > 0) {
                //두번째 image tag는 badge
                if(!!element.children[1])
                element.children[1].setAttribute("src",badgeURL);
            }
        }
    },
    front  : {
        element: document.getElementsByClassName("card front")[slideOn?0:1],
        landingUrl: "https://egame.skmcgw.com/ocbgame8/index.html",
        title: "캐치맨",
        iconUrl: "img/card_cashman.png",
        status: "ongoing",
        badgeUrl: "img/cube_event.png",
        cardViewLoader: function(element, cardURL, badgeURL) {
            //첫번째 image tag는 face icon
            element.children[0].setAttribute("src",cardURL);
            if (badgeURL.length > 0) {
                //두번째 image tag는 badge
                if(!!element.children[1])
                element.children[1].setAttribute("src",badgeURL);
            }
        }
    },
    bottom : {
        element: document.getElementsByClassName("card bottom")[slideOn?0:1],
        landingUrl: "../games/cashpang/index.html",
        title: "캐쉬팡",
        iconUrl: "img/card_cashpang.png",
        status: "terminated",
        badgeUrl: "",
        cardViewLoader: cardImageLoader
    },
    back  : {
        element: document.getElementsByClassName("card back")[slideOn?0:1],
        landingUrl: "../games/gallaga/index.html",
        title: "스페이스 2014",
        iconUrl: "img/card_space2014.png",
        status: "terminated",
        badgeUrl: "",
        cardViewLoader: cardImageLoader
    },
    left   : {
        element: document.getElementsByClassName("card left")[slideOn?0:1],
        title: "2048",
        landingUrl: "../games/2048/index.html",
        iconUrl: "img/card_2048.png",
        status: "terminated",
        badgeUrl: "",
        cardViewLoader: cardImageLoader
    },
    right: {
        element: document.getElementsByClassName("card right")[slideOn?0:1],
        landingUrl: "",
        title: "오락실 현황판",
        iconUrl: "img/game-promotion.png",
        status: "ongoing",
        badgeUrl: "",
        cardViewLoader: gameStatusCardLoader
    }
};

//화면에 출력할 데이터를 서버로부터 적재
//현재는 모두 hard coding되어 있음
//FIX ME
(function loadData(){
    // var data = getFaceList();
})();

//OCB feed data를 가져옴
// getOCBFeedInfo(loadOCBFeedDataToView);
//OCB feed data load
function loadOCBFeedDataToView(feedInfo){
    var len = feedInfo.length;
}

//단말별 Fragmentation handing
(function(){
    var i, faces, badges, characters;
    //backface-visibility와 bagde animation을 일부 단말에서 off
    //L사 단말 개발팀 좀더 신중하게 일해야 한다
    backFaceVisibilityOff = (/LG-F400|IM-A930/gi).test(navigator.appVersion);
    // badgeAnimationOff = (/LG-F400|IM-A930/gi).test(navigator.appVersion);
    // 사업부 요청으로 모든 단말에서 끔
    badgeAnimationOff = true;
    cardAnimationOff = (/IM-A930/gi).test(navigator.appVersion);
    // cardAnimationOff = true;

    if (backFaceVisibilityOff) {
        faces = document.getElementsByClassName("face");
        for(i=0;i<faces.length;i++){
            faces[i].style.webkitBackfaceVisibility = "hidden";
            faces[i].classList.add("full");
        }
    }

    if (!badgeAnimationOff) {
        badges = document.getElementsByClassName('badge');
        for(i=0;i<badges.length;i++){
            badges[i].classList.add('ing');
        }
    }

    //card별 animation 개시
    if (!cardAnimationOff) {
        setTimeout(function(){
            var characters = document.getElementsByClassName("character");
            for (i=0; i<characters.length; i++) {
                characters[i].classList.add("ing");
            }
        },2000);
    }

    //iOS에서만 device orient event에 따른 scrolling on
    orientationEvent = ios;

    //cube mode에서 enable
    enableIdleAnimation = !slideOn;
    idleAnimationType = (backFaceVisibilityOff) ? "rotate" : "blink";

    //snow falling effect
    //4.3 과 iOS에서만 잘됨
    // snowFallingEffect = ios || ((/SHV-E210|SHV-E300|SHV-E500/gi).test(navigator.appVersion) && (/android (4.3)/gi).test(navigator.appVersion));
    snowFallingEffect = false;
    if (ios) {
        perspectiveOrigin = "130% 200px";
    } else {
        perspectiveOrigin = "80% 200px";
    }

    //slide 모드에서는 game status card 미지원
    enableGameStatusCard = (slideOn)? false : enableGameStatusCard;
    //game result card는 cube에만 적용
    if (!enableGameStatusCard) {
        landingPageInfo.right = {
            element: document.getElementsByClassName("card right")[slideOn?0:1],
            landingUrl: "http://m.okcashbag.com/event/common/rouletteMain.mocb?feed_id=13626&rmcd_cd=999&is_feed=false",
            title: "OCB 룰렛",
            iconUrl: "img/card_roulette.png",
            status: "ongoing",
            badgeUrl: "img/cube_event.png",
            cardViewLoader: function(element, cardURL, badgeURL) {
                $(".game-status").hide();
                cardImageLoader(element,cardURL);
            }
        }
    }
})();

// card와 badge용 <img>를 생성하여 주어진 element 하위에 append
// card와 badge 순서 바뀌면 안됨
function cardBadgeImageLoader(element, cardURL, badgeURL) {
    var img;

    img = document.createElement("img");
    img.src = cardURL;
    element.appendChild(img);

    img = document.createElement("img");
    img.src = badgeURL;
    img.classList.add("badge");
    element.appendChild(img);
}

// card <img>를 생성하여 주어진 element 하위에 append
function cardImageLoader(element, cardURL) {
    var img;

    img = document.createElement("img");
    img.src = cardURL;
    element.appendChild(img);
}

//Cube 또는 Slide View로 초기화
(function initView(){
    var faceInfo,
        main = document.getElementsByClassName("main")[0];

    if (ios){
        main.classList.add("ios");
    }

    if (slideOn) {
        //slide view를 생성
        arcade.classList.add("nav-2d");
        for (var key in landingPageInfo){
            var obj = landingPageInfo[key];
            //첫번째 image tag는 face icon
            obj.element.style.backgroundImage = "url(" + obj.iconUrl + ")";
            if (obj.badgeUrl.length > 0) {
                //두번째 image tag는 badge
                //추가 구현을 해야한다.
            }
        }
        slide = $(".nav-2d .swiper-container").swiper({
            mode:'horizontal',
            loop: true
        });
    } else {
        //3d cube를 생성
        arcade.classList.add("nav-3d");
        cube = new CubeView(".viewport", {
                viewportX: -30,
                viewportY: -35,
                transDuration: "500ms",
                // perspective: "800px",
                perspectiveOrigin: perspectiveOrigin,
                useTransition: true,
                transitionThreshold: 5,//이거 절대 끄지 마시오. 클릭 이벤트 꼬임
                tranTimingFunc: "cubic-bezier(0.21, 0.78, 0.4, 1.02)",
                flattenDegLimit: 60,
                enableOrientationEvent: orientationEvent,
                enableIdleAnimation: enableIdleAnimation,
                idleAnimationType: idleAnimationType,
                onAnimationEnd: function (){
                    console.log("transition ends");
                }
            });
        //landingPageInfo에 따라 Face에 view data 적재
        for (var key in landingPageInfo){
            var obj = landingPageInfo[key];
            if (typeof obj.cardViewLoader !== "undefined") {
                obj.cardViewLoader(obj.element, obj.iconUrl, obj.badgeUrl);
            } else {
                console.log(key + "용 정의된 card view loader가 없음");
            }
        }

        if (!initialCubeViewMode) {
            //flat mode로 전환
            cube.toggleCubic();
            arcade.classList.toggle("nav-cube");
            arcade.classList.toggle("nav-tile");
        }
    }

    //View 초기화가 끝난후에 실제 화면에 출력
    //opacity를 CSS로 0.0으로 설정 후, cube/slide 결정되면 필요한 CSS를 모두 적용후에 화면에 출력하도록한다
    //이렇게 하지 않으면 초기화 전에 카드가 널부러져있는 것이 보여서 좋지 않음
    if (slideOn) {
        setTimeout(function(){
                var faces = document.getElementsByClassName("card");
                for (var i=0; i<faces.length; i++) {
                    faces[i].style['opacity'] = "1.0";
                }
        },50);
    } else {
        (function() {
            var i, len,
                faces = [];
                delay = initialCubeViewMode ? 250: 50;
            //아래의 순서로 순차적으로 나타난다.
            //이는 사용자가 cube의 모든면에 매핑된 이벤트를 인지하게 하기 위함이다.
            faces.push(document.getElementsByClassName("card bottom")[slideOn?0:1]);
            faces.push(document.getElementsByClassName("card back")[slideOn?0:1]);
            faces.push(document.getElementsByClassName("card left")[slideOn?0:1]);
            faces.push(document.getElementsByClassName("card right")[slideOn?0:1]);
            faces.push(document.getElementsByClassName("card top")[slideOn?0:1]);
            faces.push(document.getElementsByClassName("card front")[slideOn?0:1]);
            len = faces.length;
            for (i=0; i<len; i++) {
                (function(index){
                    setTimeout(function(){
                        console.log(index + " appear");
                        faces[index].style.opacity = 1;
                    }, (index)*(slideOn ? 0:delay));
                })(i);
            }
        })();
    }
})();

//각 면별로 Event Handler 등록
(function initEvent(){
    var index = slideOn ? 0 :1,
        key, obj, element;

    //button 초기화
    if (slideOn) {
        //slide mode시 pre/next 버튼 동작 handler
        var prevButton = document.getElementsByClassName("prev")[0];
        var nextButton = document.getElementsByClassName("next")[0];

        addEvent(prevButton, "click", function(){
            slide.swipePrev();
        });
        addEvent(nextButton, "click", function(){
            slide.swipeNext();
        });
    } else {
        //cube mode시 mode 전환 및 위치 초기화 버튼 handler
        var flattenButton = document.getElementsByClassName("toggle")[0],
            asitwasButton = document.getElementsByClassName("refresh")[0];

        addEvent( flattenButton, "click", function(){
            cube.toggleCubic();
            arcade.classList.toggle("nav-cube");
            arcade.classList.toggle("nav-tile");
        });
        addEvent( asitwasButton, "click", function(){
            if (arcade.classList.contains("nav-tile")) {
                arcade.classList.remove("nav-tile");
                arcade.classList.add("nav-cube");
            }
            cube.reset();
        });
    }
    //GO Event button binding
    var goEventBtn = document.getElementsByClassName("go-event")[0];
    addEvent( goEventBtn, "click", function(){
        var faceInfo;
        if (slideOn) {
            faceInfo = {
                face: document.getElementsByClassName("swiper-slide-active")[0]
            };
            launchingDelay = 0;
        } else {
            faceInfo = cube.getFrontFacingFaceInfo(true/*vertically aligned face*/);
            cube.move(faceInfo.degs.x, faceInfo.degs.y);
        }
        if (slideOn || arcade.classList.contains("nav-cube")) {
            //cube 모드일때만 클릭을 지원하고, flat일 경우는 워닝 메세지 출력
            for( key in landingPageInfo ){
                obj = landingPageInfo[key];
                if (obj.element.classList.contains(key) && faceInfo.face.classList.contains(key)) {
                    if (obj.landingUrl.length === 0) {
                        break;
                    }
                    //페이지 전환 애니메이션
                    if (launchAnimation) {
                        cube.launchingAnimationHandler(obj.element);
                    }
                    setTimeout(function(){
                        console.log(obj.title);
                        window.location.href = obj.landingUrl;
                    },launchingDelay);
                    break;
                }
            }
        } else {
            //flattend mode에서는 본 버튼으로 선택을 할수가 없음
            alert("화면을 터치해서 게임 카드를 직접 선택해주세요");
        }
    });
    //face 클릭 이벤트 초기화
    for (key in landingPageInfo) {
        obj = landingPageInfo[key];
        //landingPageInfo[key].element를 사용하면 slide 모드에서 엘리먼트가 다르므로 동작하지 않음
        //slide시 DOM 엘리먼트를 동적을 변경하는 작업을 하므로 발생하는 형상임
        //즉 매번 DOM node를 사용직전 읽어 와야함
        //최적화 하려거든 주의 하세요
        element = document.getElementsByClassName(key)[index];

        (function(){
            var landingUrl = obj.landingUrl,
                elm = obj.element;

            addEvent(element, "click", function(e){
                var faceInfo;

                if (slideOn || arcade.classList.contains("nav-tile")) {
                    //slide 나 flat mode 일 경우에는 애니메이션 없이 목적 페이지 이동
                    if (landingUrl.length > 0) {
                        window.location.href = landingUrl;
                    }
                    return;
                }
                //주어진 element의 cube 각도를 찾아옴
                faceInfo = cube.getFrontFacingFaceInfoByElement(elm);
                cube.move(faceInfo.degs.x, faceInfo.degs.y);
                if (landingUrl.length > 0) {
                    if (launchAnimation) {
                        cube.launchingAnimationHandler(elm);
                    }
                    setTimeout( function() {
                        window.location.href = landingUrl;
                    }, launchingDelay);
                }
            });
        })();
    }
})();

//각종 animation effect 설정
(function(){
    //idle시 cube animation 수행
    if (!enableIdleAnimation) {
        return;
    }
    var idleTimer = new IdleTimer( 3000, function() {
        console.log("idle animation");
        cube.executeIdleAnimation();
        if (snowFallingEffect) {
            setTimeout( function(){
                snowFallingAnimator.start();
            }, 3000);
        }
    } );
    idleTimer.start();
    setTimeout( function(){
        if (snowFallingEffect) {
            snowFallingAnimator.stop();
        }
        idleTimer.stop();
    }, 60000 );

    //snow falling effect 설정
    if (snowFallingEffect) {
        // 중지 시키는 handler 등록
        document.addEventListener('touchstart', function (e) {
            //화면을 touch하면 수행 중지
            if (snowFallingEffect) {
                snowFallingAnimator.stop();
            }
        }, false);
    }
})();


function loadLevelDataFromLocalStorage() {
    var i, key, value, level, rate,
        res = [];
    //local storage에서 load
    //구현을 해야하는데 각 게임에서 먼저 아래 정보를 저장해주어야 함
    //loca storage 저장 data structure중 2048이 일관성이 없어서 어쩔수 2048은 별도 로딩
    var keys = [
        {
            key: "cashpang",
            json: true
        }, {
            key: "gallaga",
            json: true
        }
    ];
    for (i=0; i<keys.length; i++) {
        key = keys[i];
        if (key.json) {
            value = JSON.parse(window.localStorage.getItem(key.key));
        } else {
            value = window.localStorage.getItem(key.key);
        }
        if (value === null) {
            continue;
        }
        if (!value.rate || !value.level) {
            continue;
        }
        res.push({
            title: key.key,
            level: value.level,
            rate: value.rate
        });
    }
    //2048 정보 적재
    level =  window.localStorage.getItem("7bestLevel");
    rate = window.localStorage.getItem("7bestRate");
    if (level && rate) {
        res.push({
            title: "eo48",
            level: level,
            rate: rate
        })
    }
    return res;
}

//Game Level Load
function gameStatusCardLoader(){

    if (slideOn) {
        //cube mode에서만 지원
        return;
    }
    gameIdx = -1;
    gameLevelNum = -1;
    var gameRes = loadLevelDataFromLocalStorage();
    if (gameRes.length <= 0 ){
        $('.game-result')[0].style.backgroundImage = "url(./img/game-promotion.png)"
        $('.game-result-content').hide();
        return;
    }
    //첫 게임을 화면에 출력한다.
    $('.game-status .p0 strong').addClass(gameRes[0].title+"-title");
    $('.game-status .p2 strong').addClass(gameRes[0].level);
    $('.game-status .p1 strong').text(gameRes[0].rate);
    if (gameRes.length === 1) {
        return;
    }
    //2개 이상인 경우에는 timer로 card내용을 주기적으로 바꾸어준다
    gameIdx = 0;
    gameLevelNum = gameRes.length-1;

    var idleTimer = new IdleTimer( 600, function() {
        var prevIdx = gameIdx;
        gameIdx++;
        if (gameIdx>gameLevelNum) {
            gameIdx = 0;
        }
        $('.game-status .p0 strong').removeClass(gameRes[prevIdx].title+"-title");
        $('.game-status .p0 strong').addClass(gameRes[gameIdx].title+"-title");
        $('.game-status .p2 strong').removeClass(gameRes[prevIdx].level);
        $('.game-status .p2 strong').addClass(gameRes[gameIdx].level);
        $('.game-status .p1 strong').text(gameRes[gameIdx].rate);
    } );
    idleTimer.start();
}

function addEvent (el, type, fn, capture) {
    el.addEventListener(type, fn, !!capture);
};

function removeEvent (el, type, fn, capture) {
    el.removeEventListener(type, fn, !!capture);
};