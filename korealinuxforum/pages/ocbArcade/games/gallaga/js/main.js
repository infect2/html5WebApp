(function($){
    var API = {};
    var ERROR = {};
    var USER = {};
    var MSG = {};
    var GID = "2";
    var C = CryptoJS;

    var queryString = (function(str){
        var obj = {};
        if (str.length) {
            str.split("&").forEach(function(v){
                var t = v.split("=");
                if (t[0] === "mbr_id") {
                    obj[t[0]] = t[1];
                } else {
                    obj[t[0]] = decodeURIComponent(t[1]);
                }
            });
        }
        return obj;
    }(location.search.replace("?", "")));

    //DEV
    if (DEBUG) {
        // queryString.mbr_id = "IyzeIYH5E9UrrVddwygdTg%3D%3D";
        queryString.mbr_id = "%2B0TqSJIohmEInkTdg8hYbA%3D%3D";
        queryString.CI_YN = "Y";
    }

    API.PATH = "http://egame.skmcgw.com/mgw/";
    // API.APP_S_ID = "w3JSPv/UyGt4cLmi"; //to be modified
    // API.APP_S_ID = "moRl20w1PghdNt5I"; //to be modified
    API.WEB_S_ID = "nGvDvIduQ11SNYo9";
    API.GETKEY = API.PATH + "game/glg/getkey.jsp";
    API.USER_INFO = API.PATH + "game/glg/user_info.jsp";
    API.PART_GAME = API.PATH + "game/glg/part_game.jsp";
    API.INVITE_LIST = API.PATH + "game/glg/invite_list.jsp";
    API.SEND_SMS = API.PATH + "game/glg/send_sms.jsp";
    API.RANK_LIST = API.PATH + "game/glg/gameover_ranklist.jsp";
    API.GET_MSG = API.PATH + "game/glg/get_msg.jsp";
    API.PASS_INPUT = API.PATH + "game/glg/pass_input.jsp";
    API.POINT_LIST = API.PATH + "game/glg/point_list.jsp";
    API.SAVE_POINT = API.PATH + "game/glg/save_point.jsp";
    API.GET_MDN = API.PATH + "game/glg/get_mdn.jsp";
    API.WEB_KEY = null;

    MSG.SEND_SMS = "SMS 발송이 완료되었습니다.";
    MSG.PASS_INPUT = "친구에게 3회의 게임기회가 제공되었습니다.";

    ERROR.INIT = "게임 이벤트 초기화가 지연되고 있습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.POINT_LIST = "랭킹별 시상금 정보를 가져올 수 없습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.INVITE_LIST = "초대실적 정보를 가져올 수 없습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.GET_MSG = "문자메시지 정보를 가져올 수 없습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.SEND_SMS = "SMS 발송 오류입니다.<br>잠시후 다시 시도해주세요.";
    ERROR.SEND_SMS_MYSELF = "보내는 사람과 받는 사람의 핸드폰번호가 같습니다.";
    ERROR.SEND_SMS_AGAIN = "이미 초대 문자가 발송된 핸드폰번호입니다.";
    ERROR.INVALID_PHONE_NUMBER = "유효하지 않은 핸드폰번호입니다.";
    ERROR.USER_INFO = "실시간 점수/랭킹/실적/행운포인트 정보 노출이 지연되고 있습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.RANK_LIST = "랭킹 조회가 지연되고 있습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.PART_GAME = "게임 참여 오류입니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.NOT_ENOUGH_GAME_COUNT = "게임기회가 부족합니다.";
    ERROR.PASS_INPUT = "잘못된 초대번호입니다.<br>다시 입력해주세요.";
    ERROR.ALREADY_PASS_INPUT = "이미 초대번호를 입력한 이력이 있습니다.";
    ERROR.PASS_INPUT_MYSELF = "초대한 사용자와 초대받는 사용자가 동일합니다.";
    ERROR.GET_MDN = "사용자 핸드폰번호 조회 오류입니다.<br>다시 시도해주세요.";
    ERROR.EVENT_OVER = "이벤트가 종료되었습니다.";

    USER.MBR_ID = (typeof MBR_ID !== "undefined") ? MBR_ID : null;
    USER.GAME_COUNT = 0;

    var show = function($el) {
        return $el.removeClass("hidden").addClass("shown");
    };
    var hide = function($el) {
        return $el.removeClass("shown").addClass("hidden");
    };

    var requestDecryptString = function (URIEncodedBase64str, enc, callback) {
        if (DEBUG) {
            //DEV
            callback.call(null, "112746715"); //김준기M MBR_ID
            return;
        }

        if (queryString.app_type === "and") {
            callback.call(null, OcbAppInterface.decryptString(URIEncodedBase64str, enc || ""));
        } else {
            var callbackname = "decryptcb" + (+new Date());
            window[callbackname] = function(str){
                callback.call(null, str);
                delete window[callbackname];
            };
            window.location = "ocbt://type=decrypt&str=" + URIEncodedBase64str + "&enc=" + enc + "&callback=" + callbackname;
        }
    };

    var encrypt = function(text, key) {
        return CryptoJS.SEED.encrypt(C.enc.Latin1.parse(text + ""), C.enc.Latin1.parse(key || API.WEB_KEY), { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.AnsiX923 }).ciphertext.toString(CryptoJS.enc.Base64);
    };
    var decrypt = function(text, key) {
        return CryptoJS.SEED.decrypt(C.lib.CipherParams.create({ ciphertext: C.enc.Base64.parse(text) }), C.enc.Latin1.parse(key || API.WEB_KEY), { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.AnsiX923 }).toString(CryptoJS.enc.Utf8);
    };
    var currency = function(n) {
        if (isNaN(n * 1)) {
            return n;
        }
        n = n * 1 + "";
        var pattern = /(-?[0-9]+)([0-9]{3})/;
        while (pattern.test(n)) {
            n = n.replace(pattern,"$1,$2");
        }
        return n;
    };
    var isValidPhoneNumber = function(str) {
        str += "";
        if ((str.length === 10 || str.length === 11) && str[3] !== "0") {
            if (["010", "011", "016", "017", "018", "019"].indexOf(str.substr(0,3)) > -1) {
                return true;
            }
        }
        return false;
    };
    var tocbRegistLink = function(appType) {
        if (appType === 'ios') {
            location.href = 'ocbt://type=move&move=openRegist';
        } else if (appType === 'and') {
            location.href = 'ocbt://com.skmc.okcashbag.home_google/openCertification';
        }
    };

    var apicall = function(type, req) {
        var url,
            data = {
                S_ID : (typeof req !== "undefined" && typeof req.S_ID !== "undefined") ? req.S_ID : API.WEB_S_ID,
                t : +new Date()
            };

        switch (type) {
            case "getkey":
                url = API.GETKEY;
            break;
            case "user_info":
                url = API.USER_INFO;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
            break;
            case "point_list":
                url = API.POINT_LIST;
                data.GID = encrypt(GID);
            break;
            case "invite_list":
                url = API.INVITE_LIST;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
            break;
            case "part_game":
                url = API.PART_GAME;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
            break;
            case "save_point":
                url = API.SAVE_POINT;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
                data.POINT = encrypt(req.points);
            break;
            case "send_sms":
                url = API.SEND_SMS;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
                data.HP_NO = encrypt(req.hp_no);
                data.SEND = encrypt(req.send);
            break;
            case "rank_list":
                url = API.RANK_LIST;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
            break;
            case "see_ranking":
                url = API.RANK_LIST;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
            break;
            case "get_msg":
                url = API.GET_MSG;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
            break;
            case "pass_input":
                url = API.PASS_INPUT;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
                data.PASS = encrypt(req.pass);
            break;
            case "get_mdn":
                url = API.GET_MDN;
                data.MBR_ID = encrypt(USER.MBR_ID);
            break;
        }

        //DEV
        if (DEBUG) {
            data.url = url;
            url = url + "?";
            var qs = [];
            for (var key in data) {
                qs.push(key + "=" + encodeURIComponent(data[key]));
            }
            url += qs.join("&");

            return $.ajax({
                url: "http://10.202.29.233:3388",
                dataType: "xml",
                data: {
                    url : url
            },
                timeout: 30000
            });
        }

        return $.ajax({
            url: url,
            dataType: "xml",
            data: data,
            timeout: 30000
        });
    };

    var apicallback = {
        point_list : function(e) {
            var con = $(".gamePop4").find("._pointTable"),
                code = $("CD", e).text(),
                grade = [],
                point = [],
                gamepoint = [],
                data = {
                    lists : []
                },
                tmpl,
                gradeTo = [100, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

            if (code === "00") {
                tmpl = $("#tmpl_point_list").html();

                $("GRADE", e).each(function(){
                    grade.push(decrypt($(this).text()));
                });
                $("POINT", e).each(function(){
                    point.push(decrypt($(this).text()));
                });
                $("GAME_POINT", e).each(function(){
                    gamepoint.push(decrypt($(this).text()));
                });

                grade.forEach(function(v, i, o){
                    data.lists.push({
                        grade : currency(grade[i]),
                        gradeTo : currency(gradeTo[i]),
                        point : currency(point[i]),
                        gamepoint : currency(gamepoint[i])
                    });
                });

                con.html(Mustache.render(tmpl, data));
            }
        },
        invite_list : function(e) {
            var con = $(".gamePop2"),
                code = $("CD", e).text();

            if (code === "00") {
                con.find("._snsCount").text(currency(decrypt($("SNS_COUNT", e).text())));
                con.find("._smsCount").text(currency(decrypt($("SMS_COUNT", e).text())));
                con.find("._snsGameCount").text(currency(decrypt($("SNS_GAME_COUNT", e).text())));
                con.find("._smsGameCount").text(currency(decrypt($("SMS_GAME_COUNT", e).text())));
            }
        },
        get_mdn : function(e) {
            var con = $(".gamePop1"),
                code;

            if (e && $("CD", e).text() === "00") {
                con.find("._smsSender").val($("MDN", e).text()).attr("disabled", "disabled");
            } else {
                con.find("._smsSender").val("").attr("disabled", null);
            }
        },
        see_ranking : function(e) {
            var code = $("CD", e).text(),
                myRank, myGamePoint, myBenefitPoint,
                parent = $(".gamePop5"),
                con1 = parent.find("._rankList1"),
                con2 = parent.find("._rankList2"),
                ranks, points, rewards, data1, data2, target, tmpl;

            if (code === "00") {
                tmpl = $("#tmpl_rank_list").html();
                myRank = decrypt($("MYRANK", e).text());
                myGamePoint = decrypt($("MYPOINT", e).text());
                myBenefitPoint = decrypt($("MYREWARD", e).text());

                parent.find("._myRank").text(myRank);
                parent.find("._myGamePoint").text(currency(myGamePoint));
                parent.find("._myBenefitPoint").text(currency(myBenefitPoint));

                ranks = [];
                points = [];
                rewards = [];
                data1 = {
                    lists : []
                };
                data2 = {
                    lists : []
                };

                $("RANK", e).each(function(i){
                    ranks.push(decrypt($(this).text()));
                });
                $("POINT", e).each(function(){
                    points.push(decrypt($(this).text()));
                });
                $("REWARD", e).each(function(){
                    rewards.push(decrypt($(this).text()));
                });

                ranks.forEach(function(v, i, o){
                    if (i < 50) {
                        target = data1;
                    } else {
                        target = data2;
                    }
                    target.lists.push({
                        rank : ranks[i],
                        point : currency(points[i]),
                        reward : currency(rewards[i])
                    });

                    if (ranks[i] === myRank) {
                        target.lists[target.lists.length - 1].me = true;
                    }
                });

                con1.html(Mustache.render(tmpl, data1));
                con2.html(Mustache.render(tmpl, data2));
            }
        }
    };

    var successPopup = function(button, msg) {
        var popupLayer = $(".gamePop[data-id=success]");
        popupLayer.find("._msg").html(msg);
        _openPopup(popupLayer, button);
    };

    var errorPopup = function(button, msg) {
        var popupLayer = $(".gamePop[data-id=error]");
        popupLayer.find("._msg").html(msg);
        _openPopup(popupLayer, button);
    };

    var exit = function(msg) {
        $(".evtWrap").removeClass("invisible");
        show($(".popupContainer"));
        var popupLayer = $(".gamePop[data-id=error]");
        popupLayer.css("top", 10);
        popupLayer.find("._msg").html(msg);
        popupLayer.find("._popupClose").remove();
        show(popupLayer);
    };

    var _openPopup = function(popupLayer, button) {
        var bh, ph;

        window.location.hash = "popup";
        hide($(".gamePop"));
        show($(".popupContainer"));
        if (typeof button !== "undefined") {
            popupLayer.css({
                top: button ? $(button).offset().top : 10
            });
        }
        show(popupLayer);

        bh = $(document.body).height();
        ph = popupLayer.height();
        if (popupLayer.offset().top + ph > bh) {
            popupLayer.css({
                top: Math.max(0, bh - ph - 10)
            });
        }
    };

    var closePopup = function(popup) {
        hide($(".popupContainer"));
        if (typeof popup !== "undefined") {
            hide($(popup).closest(".gamePop"));
        } else {
            hide($(".gamePop"));
        }
    };

    var updateUserInfo = function(closePopup, callback) {
        apicall("user_info").done(function(e){
            var code = $("CD", e).text(),
                gameCount = decrypt($("GAME_COUNT", e).text()),
                myRank = decrypt($("MY_RANK", e).text()),
                myGamePoint = decrypt($("MY_GAME_POINT", e).text()),
                myBenefitPoint = decrypt($("MY_BENEFIT_POINT", e).text()),
                myInviteRank = decrypt($("MY_INVITE_RANK", e).text()),
                myInvitePoint = decrypt($("MY_INVITE_POINT", e).text()),
                myLuckyPoint = decrypt($("MY_LUCKY_POINT", e).text()),
                parent = $(".evtArea2");

            if (code === "00") {
                USER.GAME_COUNT = gameCount;
                parent.find("._gameCount").text(gameCount);
                parent.find("._myRank").text(myRank);
                parent.find("._myGamePoint").text(currency(myGamePoint));
                parent.find("._myBenefitPoint").text(currency(myBenefitPoint));
                parent.find("._myInviteRank").text(currency(myInviteRank));
                parent.find("._myInvitePoint").text(currency(myInvitePoint));
                parent.find("._myLuckyPoint").text(currency(myLuckyPoint));
                if (closePopup) {
                    hide($(".popupContainer"));
                }
                if (callback) {
                    callback.call(null, myRank * 1, myGamePoint * 1);
                }
            } else {
                errorPopup(null, ERROR.USER_INFO);
            }
        }).fail(function(){
            errorPopup(null, ERROR.USER_INFO);
        });
    };

    var triesApp = 4,
        triesWeb = 4;

    var init = function() {

        //to be modified
        // apicall("getkey", {
        //     S_ID : API.APP_S_ID
        // }).done(function(e){
        //     API.APP_KEY = $("KEY", e).text();
        //     if (queryString.CI_YN === "Y" && queryString.mbr_id) {
        //         USER.MBR_ID = decrypt(queryString.mbr_id, API.APP_KEY);

        // ERROR.INIT += API.GETKEY + USER.MBR_ID + API.WEB_S_ID;

                //remain
                apicall("getkey", {
                    S_ID : API.WEB_S_ID
                }).done(function(e){
                    API.WEB_KEY = $("KEY", e).text();
                    $(".evtWrap").removeClass("invisible");
                    if (queryString.CI_YN === "Y") {
                        updateUserInfo(true);
                    } else {
                        hide($(".popupContainer"));
                    }
                }).fail(function(){
                    if (triesWeb--) {
                        init();
                    } else {
                        exit(ERROR.INIT);
                    }
                });
                //remain
        //     }
        // }).fail(function(){
        //     if (triesApp--) {
        //         init();
        //     } else {
        //         exit(ERROR.INIT);
        //     }
        // });
    };

    $(document).ready(function() {
        window.onhashchange = function(e) {
            var hash = window.location.hash.substring(1);
            if (!hash.length) {
                closePopup();
            }
        };

        // var ih = window.innerHeight,
        //     topHeight = Math.max(0, (ih - 400)) / 2,
        //     bottomHeight;

        // topHeight = topHeight - topHeight % 4;
        // bottomHeight = ih - topHeight - 400;

        // $(".gameCanvas .bgt").height(topHeight);
        // $(".gameCanvas .bgb").height(bottomHeight);
        // $(".gameResult").css("top", topHeight + "px");

        AlienInvasionGame.initialize($("._gameCanvas").get(0), "images/sp.png", {
            width : 320,
            height : 400
        });

        if (AlienInvasionGame.canvas.__directCanvasId__) { //planet.webview canvas 위치조정
            window.onscroll = function() {
                DirectCanvasSync.setCanvasY(AlienInvasionGame.canvas.__directCanvasId__, -window.scrollY);
            };
        }

        var ua = window.navigator.userAgent;
        if (!(/SHV-E300/i).test(ua) && !(/SHV-E330/i).test(ua) && !(/Android 4.4/i).test(ua)) { //gs4
            $(".gameCanvas .bg").css("backgroundImage", "url('images/bg.png')");
        }

        $(".evtWrap").removeClass("invisible");

        if (queryString.CI_YN === "Y" && queryString.mbr_id) {
            requestDecryptString(queryString.mbr_id, "utf-8", function(str) {
                USER.MBR_ID = str;
                init();
            });
        } else {
            init();
        }
    });

    $(".gameCanvas").on("finish", function(e, point){
        var callback = function() {
            show($(".gameMain"));
            hide($(".gameCanvas"));
        };

        $(".gameRanking ._rankList").html("");
        show($(".gameCanvas .gameResult"));

        //DEV
        if (DEBUG) {
            updateUserInfo(false, function(myRank, myGamePoint){
                var tmpl = $("#tmpl_rank_list").html(),
                    con = $(".gameRanking ._rankList");

                if (myRank <= 10000) {
                    con.html(Mustache.render(tmpl, {
                        lists : [{
                            grade : myRank,
                            point : currency(myGamePoint)
                        }]
                    }));
                    hide($(".gameRanking ._rankOver")).html("");
                    show($(".gameRanking ._rankTable")).removeClass("shown").css("display", "table");
                } else {
                    show($(".gameRanking ._rankOver")).html("1만등까지만 랭킹을 보여줍니다~<br>더 분발하세요^^");
                    hide($(".gameRanking ._rankTable"));
                }
            });
            return;
        }

        apicall("save_point", {
            points : point || 0
        }).done(function(e){
            var code = $("CD", e).text();
            if (code === "00") {
                updateUserInfo(false, function(myRank, myGamePoint){
                    var tmpl = $("#tmpl_rank_list").html(),
                        con = $(".gameRanking ._rankList");

                    if (myRank <= 10000) {
                        con.html(Mustache.render(tmpl, {
                            lists : [{
                                grade : myRank,
                                point : currency(myGamePoint)
                            }]
                        }));
                        hide($(".gameRanking ._rankOver")).html("");
                        show($(".gameRanking ._rankTable")).removeClass("shown").css("display", "table");
                    } else {
                        show($(".gameRanking ._rankOver")).html("1만등까지만 랭킹을 보여줍니다~<br>더 분발하세요^^");
                        hide($(".gameRanking ._rankTable"));
                    }
                });
            } else {
                errorPopup(null, ERROR.SAVE_POINT);
            }
        }).fail(function(e){
            errorPopup(null, ERROR.SAVE_POINT);
        });
    });

    //game start
    $("._gameStart, .gameCanvas ._playGame").on("click", function(e){
        e.stopPropagation();
        e.preventDefault();

        //DEV
        if (DEBUG) {
            hide($(".gameResult"));
            hide($(".gameMain"));
            show($(".gameCanvas"));
            // hide($(".evtArea"));
            // show($(".evtArea.evtArea1"));
            AlienInvasionGame.playGame();

            if (AlienInvasionGame.canvas.__directCanvasId__) { //planet.webview canvas 위치조정
                DirectCanvasSync.setCanvasX(AlienInvasionGame.canvas.__directCanvasId__, $(".bg.bglr").eq(0).width() * devicePixelRatio);
                // DirectCanvasSync.setCanvasY(AlienInvasionGame.canvas.__directCanvasId__, $(".bg.bgt").height() * devicePixelRatio);
            }
            return;
        }

        if (queryString.CI_YN !== "Y") {
            tocbRegistLink(queryString.app_type);
            return;
        }

        if ($(this).data("loading")) {
            return;
        }

        var $this = $(this),
            error = function(msg) {
                errorPopup($this, msg);
            };

        if (USER.GAME_COUNT > 0) {
            $this.data("loading", true);
            apicall("part_game").done(function(e){
                $this.removeData("loading");
                var code = $("CD", e).text(),
                    gameCount;

                if (code === "00") {
                    USER.GAME_COUNT -= 1;
                    $(".evtArea2 ._gameCount").text(Math.max(0, USER.GAME_COUNT));
                    hide($(".gameResult"));
                    hide($(".gameMain"));
                    show($(".gameCanvas"));
                    // hide($(".evtArea"));
                    // show($(".evtArea.evtArea1"));
                    AlienInvasionGame.playGame();

                    if (AlienInvasionGame.canvas.__directCanvasId__) { //planet.webview canvas 위치조정
                        DirectCanvasSync.setCanvasX(AlienInvasionGame.canvas.__directCanvasId__, $(".bg.bglr").eq(0).width() * devicePixelRatio);
                        // DirectCanvasSync.setCanvasY(AlienInvasionGame.canvas.__directCanvasId__, $(".bg.bgt").height() * devicePixelRatio);
                    }
                } else if (code === "15") {
                    error(ERROR.EVENT_OVER);
                } else {
                    error(ERROR.PART_GAME);
                }
            }).fail(function(){
                $this.removeData("loading");
                error(ERROR.PART_GAME);
            });
        } else {
            error(ERROR.NOT_ENOUGH_GAME_COUNT);
        }
    });

    //game end and back
    $(".gameCanvas ._back").on("click", function(e){
        e.stopPropagation();
        e.preventDefault();
        show($(".gameMain"));
        hide($(".gameCanvas"));
    });


    //소문내기 scheme
    $("#scheme").on("click", "a", function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this),
            $scheme = $("#scheme");
        if ($scheme.data("loading")) {
            return;
        }

        if (queryString.CI_YN !== "Y") {
            tocbRegistLink(queryString.app_type);
            return;
        }

        if (MSG.SNS_MSG && MSG.SNS_URL) {
            sharingSNS($this.data("value"));
        } else {
            $scheme.data("loading", true);
            apicall("get_msg").done(function(e){
                $scheme.removeData("loading");
                var code = $("CD", e).text();
                if (code === "00") {
                    MSG.SNS_MSG = $("MESSAGE", e).text();
                    MSG.SNS_URL = $("URL", e).text();
                    sharingSNS($this.data("value"));
                } else {
                    exit(ERROR.GET_MSG);
                }
            }).fail(function(e){
                $scheme.removeData("loading");
                exit(ERROR.GET_MSG);
            });
        }
    });

    var sharingSNS = function(type) {
        var message = encodeURIComponent(MSG.SNS_MSG),//encodeURIComponent(document.getElementById("message").value),
            url = encodeURIComponent(MSG.SNS_URL),//encodeURIComponent(document.getElementById("url").value),
            shareType = type,
            urlPrefix = "ocbt://com.skmc.okcashbag.home_google/sharing?";

        if (queryString.app_type === "ios") {
            urlPrefix = "ocbt://type=sharing&";
        }

        window.location.href = urlPrefix + "share_type=" + shareType + "&url=" + url + "&msg=" + message;
    };

     //주소록 연동 콜백
    if (queryString.app_type === "and") {

        //안드로이드의 경우 주소록 버튼 노축
        $("._smsReceiver").removeClass("maxwidth");
        $("._smsContact").css("display", "inline-block");

        //안드로이드의 경우 주소록 연동
        $("._smsContact").on("click", function(e){
            e.stopPropagation();
            e.preventDefault();

            //android
            window.location.href = "ocbt://com.skmc.okcashbag.home_google/requestContact?callBack=sendSMSViaContacts";
        });

        window.sendSMSViaContacts = function(receivers) {
            var $button = $("._SMSViaContacts"),
                sender,
                receiver = receivers.toString().replace(/[^0-9]/gi, "");

            $("._smsReceiver").val(receiver);
        };
    }

    //기본 sms팝업에서 sms 전송버튼
    $("._sendSMS").on("click", function(e){
        e.stopPropagation();
        e.preventDefault();

        if ($(this).data("loading")) {
            return;
        }

        var $this = $(this),
            $button = $("._popupButton[data-popup-id=send_sms]"),
            sender = $("._smsSender").val().toString().replace(/[^0-9]/gi, ""),
            receiver = $("._smsReceiver").val().toString().replace(/[^0-9]/gi, "");

        if (sender === receiver) {
            errorPopup($button, ERROR.SEND_SMS_MYSELF);
            return;
        }

        if (isValidPhoneNumber(sender) && isValidPhoneNumber(receiver)) {
            $this.data("loading", true);
            apicall("send_sms", {
                send : sender,
                hp_no : receiver
            }).done(function(e){
                $this.removeData("loading");
                var code = $("CD", e).text();
                if (code === "00") {
                    successPopup($button, MSG.SEND_SMS);
                    updateUserInfo(false);
                } else if (code === "20") {
                    errorPopup($button, ERROR.SEND_SMS_AGAIN);
                } else if (code === "15") {
                    errorPopup($button, ERROR.EVENT_OVER);
                } else {
                    errorPopup($button, ERROR.SEND_SMS);
                }
                $("._smsReceiver").val("");
            }).fail(function(){
                $this.removeData("loading");
                errorPopup($button, ERROR.SEND_SMS);
                $("._smsReceiver").val("");
            });
        } else {
            errorPopup($button, ERROR.INVALID_PHONE_NUMBER);
        }
    });

    //초대번호 입력
    $("._submitInvitationCode").on("click", function(e){
        e.stopPropagation();
        e.preventDefault();

        if ($(this).data("loading")) {
            return;
        }

        var $this = $(this),
            $button = $("._popupButton[data-popup-id=type_invitation]"),
            code = $("._invitationCode").val();

        $this.data("loading", true);
        apicall("pass_input", {
            pass : code
        }).done(function(e){
            $this.removeData("loading");
            var code = $("CD", e).text();
            if (code === "00") {
                successPopup($button, MSG.PASS_INPUT);
            } else if (code === "34") {
                errorPopup($button, ERROR.ALREADY_PASS_INPUT);
            } else if (code === "21") {
                errorPopup($button, ERROR.PASS_INPUT_MYSELF);
            } else if (code === "15") {
                errorPopup($button, ERROR.EVENT_OVER);
            } else {
                errorPopup($button, ERROR.PASS_INPUT);
            }
        }).fail(function(){
            $this.removeData("loading");
            errorPopup($button, ERROR.PASS_INPUT);
        });
    });

    //open popup
    $(document).on("click", "._popupButton", function(e){
        e.stopPropagation();
        e.preventDefault();

        if ($(this).data("loading")) {
            return;
        }

        var $this = $(this),
            apimsg = $this.data("apicall"),
            useCache = ($this.data("usecache") === true) ? true : false,
            positionTop = ($this.data("position") === "top") ? true : false,
            popupid = $this.data("popup-id"),
            popupLayer = $(".gamePop[data-id=" + popupid + "]"),
            popup = function() {
                if (positionTop) {
                    _openPopup(popupLayer);
                } else {
                    _openPopup(popupLayer, $this);
                }
            };

        if ($this.data("auth")) { //인증된 사용자만
            if (queryString.CI_YN !== "Y") {
                tocbRegistLink(queryString.app_type);
                return;
            }
        }

        if (!apimsg || (useCache && $this.data("cache"))) {
            popup();
        } else {
            $this.data("loading", true);
            apicall(apimsg).done(function(e){
                $this.removeData("loading");
                if ($("CD", e).text() === "00") {
                   $this.data("cache", e);
                }
                if (typeof apicallback[apimsg] === "function") {
                    apicallback[apimsg](e);
                }
                popup();
            }).fail(function(){
                $this.removeData("loading");
                if (apimsg === "get_mdn") {
                    apicallback[apimsg](false);
                    popup();
                    return;
                }
                errorPopup($this, ERROR[apimsg.toUpperCase()]);
            });
        }
    });

    //close popup
    $(document).on("click", "._popupClose", function(e){
        e.stopPropagation();
        e.preventDefault();

        closePopup($(this));
        history.go(-1);
    });
}(jQuery));