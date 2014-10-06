requirejs.config({
    baseUrl: DEBUG ? 'engine/module' : './',
    paths:{
        lib:'lib',
        ocb: DEBUG ? '../../js' : 'js'
    },
    waitSeconds: 15,
    urlArgs: "bust=4351215041"
});

var ua = window.navigator.userAgent;
var app_type = (/iphone|ipad|ipod/i).test(ua) ? "ios" : "and";
if ((/iphone|ipad|ipod/i).test(ua) && window.innerHeight <= 1) {
    window.location.href = "ocbt://type=requestRender";
    app_type = "ios";
}

require(["ocb/main", "ocb/invalidPhoneNums", "ocb/resource"], function(cashpang, invalidNums, resource) {
// (function($){
    var API = {};
    var ERROR = {};
    var USER = {};
    var MSG = {};
    var BUYINFO = {};
    var GID = "5";
    var C = CryptoJS;
    var maxScore = 0;
    var maxRank = 0;
    var lastState = null;
    var lastBtn = null;
    var userStatus = "";
    var statusCode = 1;
    var loaded = false;
    var started = false;
    var errorFlag = false;
    var lastOpenFlag = false;
    var lastParentBtn = null;
    var currentPoint = null;
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

    queryString.app_type = app_type;
    API.PATH = "https://egame.skmcgw.com/mgw/";
    //DEV
    if (DEBUG) {
        API.PATH = "http://egame.skmcgw.com/mgw/";
        queryString.mbr_id = encodeURIComponent("+mK/A/ipc2nVvId5Xz8AWA==");
        queryString.CI_YN = "Y";
    }
    // API.APP_S_ID = "w3JSPv/UyGt4cLmi"; //to be modified
    // API.APP_S_ID = "moRl20w1PghdNt5I"; //to be modified
    API.WEB_S_ID = "nGvDvIduQ11SNYo9";
    API.GETKEY = API.PATH + "game/glg/getkey.jsp";
    API.USER_INFO = API.PATH + "game/glg/user_info.jsp";
    API.PART_GAME = API.PATH + "game/glg/part_game.jsp";
    API.INVITE_LIST = API.PATH + "game/glg/invite_list.jsp";
    API.SEND_SMS = API.PATH + "game/glg/send_sms.jsp";
    API.SEND_SMS2 = API.PATH + "game/glg/send_sms2.jsp";
    API.RANK_LIST = API.PATH + "game/glg/gameover_ranklist.jsp";
    API.GET_MSG = API.PATH + "game/glg/get_msg.jsp";
    API.PASS_INPUT = API.PATH + "game/glg/pass_input.jsp";
    API.POINT_LIST = API.PATH + "game/glg/point_list.jsp";
    API.SAVE_POINT = API.PATH + "game/glg/save_point.jsp";
    API.GET_MDN = API.PATH + "game/glg/get_mdn.jsp";
    API.WEB_KEY = "nGvDvIduQ11SNYo9";
    API.FRIEND_RANKLIST = API.PATH + "game/glg/friend_ranklist.jsp";
    // API.SAVE_AGREEMENT = API.PATH + "game/glg/get_mdn.jsp";
    API.GET_AGREEMENT = API.PATH + "game/glg/get_agree.jsp";
    API.BUY_GAME_COUNT = API.PATH + "game/glg/buy_game_count.jsp";
    API.BUY_GAME_COUNT_LIST = API.PATH + "game/glg/buy_game_count_list.jsp";
    API.GET_USER_POINT = API.PATH + "game/glg/get_user_point.jsp";
    API.GET_USER_CI = API.PATH + "game/glg/get_user_ci.jsp";

    MSG.SEND_SMS = "SMS 발송이 완료되었습니다.";
    MSG.PASS_INPUT = "친구가 나의 친구간 랭킹에 등록되었습니다.";
    MSG.BUYCOUNT = "게임기회 구매가 완료되었습니다.";
    MSG.GIFTCHANCE = "게임기회를 선물하였습니다.";

    ERROR.INIT = "게임 이벤트 초기화가 지연되고 있습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.POINT_LIST = "랭킹별 시상금 정보를 가져올 수 없습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.INVITE_LIST = "초대실적 정보를 가져올 수 없습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.GET_MSG = "문자메시지 정보를 가져올 수 없습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.SEND_SMS = "SMS 발송 오류입니다.<br>잠시후 다시 시도해주세요.";
    ERROR.SAME_NAME = "게임기회를 선물하였습니다.<br>(연속하여 동일인에게 선물하신 경우,안내문자는 한 번만 전송됩니다.)";
    ERROR.SEND_SMS_MYSELF = "보내는 사람과 받는 사람의 핸드폰번호가 같습니다.";
    ERROR.SEND_SMS_AGAIN = "이미 문자로 초대한 핸드폰번호입니다.";
    ERROR.INVALID_PHONE_NUMBER = "유효하지 않은 핸드폰번호입니다.<br>다시 입력하여 주세요.";
    ERROR.USER_INFO = "실시간 점수/랭킹/게임기회 정보 노출이 지연되고 있습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.RANK_LIST = "랭킹 조회가 지연되고 있습니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.PART_GAME = "게임 참여 오류입니다.<br>잠시 후 다시 시도해주세요.";
    ERROR.PART_GAME_LATELY = "이벤트가 종료되었습니다.";
    ERROR.SAVE_POINT = "게임 점수 저장 실패입니다. <br> 재시도 해주세요.";
    ERROR.NOT_ENOUGH_GAME_COUNT = "게임기회가 부족합니다.";
    ERROR.MBR_ID = "동일한 계정으로 선물할 수 없습니다.";
    ERROR.PASS_INPUT = "잘못된 초대번호입니다.<br>다시 입력해주세요.";
    ERROR.ALREADY_PASS_INPUT = "이미 친구로 등록된 사용자 입니다.";
    ERROR.PASS_INPUT_MYSELF = "초대한 사용자와 초대받는 사용자가 동일합니다.";
    ERROR.GET_MDN = "사용자 핸드폰번호 조회 오류입니다.<br>다시 시도해주세요.";
    ERROR.NO_GMCNT = "게임 기회를 입력해 주세요.";
    ERROR.NOT_MATCH_PWD = "비밀번호가 틀렸습니다. <br> 다시 시도해주세요";
    ERROR.NO_PWD = "비밀번호를 입력해 주세요";
    ERROR.OVERFLOW_COUNT = "일일 10회 이상 구매할 수 없습니다.";
    ERROR.BUY_UNKNOWN_ERROR = "알 수 없는 오류 입니다.";
    ERROR.BUY_FAIL = "구매에 실패했습니다 <br> 다시시도해 주세요";
    ERROR.BUY_SERVER_ERROR = "서버에 연결할 수 없습니다 <br> 다시 시도해 주세요";
    ERROR.EVENT_ENT = "이벤트가 종료되었습니다.";
    ERROR.EMERGENCY = "임시점검중입니다.";
    ERROR.NO_APP = "OCB 앱에서만 실행가능합니다. <br> 게임을 종료합니다.";
    USER.MBR_ID = (typeof MBR_ID !== "undefined") ? MBR_ID : null;
    USER.GAME_COUNT = 0;
    USER.AGREED = "N";

    var show = function($el) {
        return $el.removeClass("hidden").addClass("shown");
    };
    var hide = function($el) {
        return $el.removeClass("shown").addClass("hidden");
    };

    var requestDecryptString = function (URIEncodedBase64str, enc, callback) {
        if (DEBUG) {
            //DEV
            // callback.call(null, "112746715"); //김준기M MBR_ID
            // callback.call(null, "110873171"); // 윤정민M MBR_ID
             callback.call(null, "112209551"); // 배철민M MBR_ID

             // callback.call(null, "114666410"); // 윤순영M MBR_ID
            return;
        }

        if (queryString.app_type === "and") {
            callback.call(null, OcbAppInterface.decryptString(URIEncodedBase64str, enc || ""));
        } else {
            var callbackname = "decryptcb" + (+new Date());

            window[callbackname] = function(str){
                // alert(str);
                callback.call(null, str);
                // delete window[callbackname];
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
    var maskPhoneNumber = function(str) {
        str = str.replace(/[^0-9]/gi, "");

        var middle = str.slice(3, str.length-4).replace(/[0-9]/gi, "*");
        return str.slice(0,3) + "-" + middle + "-" + str.slice(str.length-4, str.length);
    };
    var isValidPhoneNumber = function(str) {
        str += "";
        if ((str.length === 10 || str.length === 11) && str[3] !== "0") {
            if (["010", "011", "016", "017", "018", "019"].indexOf(str.substr(0,3)) > -1 && invalidNums.indexOf(str) < 0) {
                return true;
            }
        }
        return false;
    };
    var tocbRegistLink = function(appType) { // 인증 체크
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
                // console.log("save_point points :" + req.points);
                data.POINT = encrypt(req.points);
            break;
            case "send_sms":
                url = API.SEND_SMS;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
                data.HP_NO = encrypt(req.hp_no);
                data.SEND = encrypt(req.send);
            break;
            case "send_sms2":
                url = API.SEND_SMS2;
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
            case "friend_ranklist":
                url = API.FRIEND_RANKLIST;
                // console.log(url);
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
            break;
            case "save_agreement":
                url = API.SAVE_AGREEMENT;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.DATE = encrypt(new Date().toString());
            break;
            case "get_agreement":
                url = API.GET_AGREEMENT;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
                data.CI_YN = encrypt();
            break;
            case "buy_game_count":
                url = API.BUY_GAME_COUNT;
                // console.log(BUYINFO.GM_CNT + ", " + BUYINFO.GM_POINT);
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
                data.CI = BUYINFO.CI;
                data.GM_CNT = encrypt(BUYINFO.GM_CNT);
                data.GM_POINT = encrypt(BUYINFO.GM_POINT);
                data.TYPE = encrypt(BUYINFO.TYPE);
                data.GIFT = encrypt(BUYINFO.GIFT);
                // data.OCB_PWD = encrypt(BUYINFO.PWD);
            break;
            case "buy_game_count_list":
                // console.log("1");
                url = API.BUY_GAME_COUNT_LIST;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.TYPE=encrypt( req === undefined ? "B" : req.type);
                data.GID = encrypt(GID);
            break;
            case "get_user_point" :
                url = API.GET_USER_POINT;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
            break;
            case "get_user_ci" :
                url = API.GET_USER_CI;
                data.MBR_ID = encrypt(USER.MBR_ID);
                data.GID = encrypt(GID);
                data.APP_PWD = encrypt(BUYINFO.PWD);
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
                url: "http://10.202.212.13:3388",
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
            var con = $(".rank").find("._pointTable"),
                code = $("CD", e).text(),
                grade = [],
                point = [],
                gamepoint = [],
                data = {
                    lists : []
                },
                tmpl,
                gradeTo = [100, 200, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

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

                grade.sort(function(a, b) {
                    return parseInt(a, 10) - parseInt(b, 10);
                });

                point.sort(function(a, b) {
                    return parseInt(b, 10) - parseInt(a, 10);
                });

                gamepoint.sort(function(a, b) {
                    return parseInt(b, 10) - parseInt(a, 10);
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
            var con = $(".smsPop"),
                code;

            if (e && $("CD", e).text() === "00") {
                USER.PHONE = $("MDN", e).text();
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
        },

        friend_ranklist : function(e) {

            var code = $("CD", e).text(),
                parent = $(".rankPrice"),
                con = parent.find("._friendRankTable"),
                ranks = [],
                points = [],
                mdns = [],
                category = [],
                data = { lists:[] },
                totalCnt = parseInt($("TOTALCNT", e).text(), 10),
                tmpl,
                ceil = 5;

            if (code === "00") {

                tmpl = $("#tmpl_friend_list").html();
                $("RANK", e).each(function(){
                    ranks.push($(this).text() + (totalCnt >= 5 ? "등": ""));
                });
                $("MDN", e).each(function(){
                    mdns.push($(this).text());
                });
                $("POINT", e).each(function(){
                    points.push($(this).text());
                });
                $("GUBUN", e).each(function(){
                    category.push(+$(this).text() || false);
                });

                function showList(start, ceil) {
                    for(var i = start; i < Math.min(ranks.length, ceil); i++) {
                        data.lists.push({
                            rank : ranks[i],
                            mdn : maskPhoneNumber(mdns[i]),
                            gamepoint : currency(points[i]),
                            my: category[i]
                        });
                    }

                    con.html(Mustache.render(tmpl, data));
                }
                showList(0, ranks.length);

                if(totalCnt === 1) {
                    con.append('<tr><td colspan="3">함께 게임하는 친구가 없습니다.</td></tr>');
                }
            }
        },

        get_agreement: function(e) {
            USER.AGREED = decrypt($("AGREEYN", e).text());
            // alert(USER.AGREED);
            if(USER.AGREED === "Y") {
                hide($("._agreement"));
                hide($(".piDesc"));
            } else {
                show($("._agreement"));

                $("._agreeCheck").on("click", function() {
                    if($(this).is(":checked")) {
                        hide($("._agreement .alert"));
                    } else {
                        show($("._agreement .alert"));
                    }
                });
            }
        },

        buy_game_count_list : function(e) {
            var code = $('CD',e).text(),
                parent = $('.rankPrice'),
                con = parent.find('._countbuylist'),
                dateList = [],
                pointList = [],
                data = { lists:[]},
                GMCNTList = [];
            // console.log("1");
            if(code === "00") {

                tmpl = $("#tmpl_countbuy_list").html();
                $("TYPE", e).each(function(){
                    switch(decrypt($(this).text())){
                        case 'G' :
                        dateList.push("선물");
                        break;
                        case 'B' :
                        dateList.push("구매");
                        break;
                    }
                    // dateList.push(decrypt($(this).text()));
                });
                $("DATE", e).each(function(){
                    pointList.push(decrypt($(this).text()));
                });
                $("GMCNT", e).each(function(){
                    GMCNTList.push(decrypt($(this).text()));
                });

                function showList(start, ceil) {
                    for(var i = start; i < ceil; i++) {
                        data.lists.push({
                            date : dateList[i],
                            point: pointList[i],
                            gmcnt : GMCNTList[i]
                        });
                    }

                    con.html(Mustache.render(tmpl, data));
                }
                showList(0, dateList.length);

                if(dateList.length === 0) {
                    con.append('<tr><td colspan="3">구매하신 포인트 내역이 없습니다.</td></tr>');
                }
            }
        },

        get_user_point : function(e) {
            var code = $('CD',e).text(),
                parent = $('.chanceBuy'),
                giftParent = $('.chancePresent'),
                con = parent.find('._myPoint'),
                giftCon = giftParent.find('._myPoint'),
                point = 0;

            if(code === "00") {
                point = decrypt($('POINT',e).text());
                con.text(currency(point)+" P");
                $(giftCon[0]).text(currency(point)+" P");

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
        errorFlag = true;
        _openPopup(popupLayer, button);
    };

    var retryPopup = function(button, msg) {
        var popupLayer = $(".gamePop[data-id=retry]");
        popupLayer.find("._msg").html(msg);
        _openPopup(popupLayer, button);
    };

    var exit = function(msg) {
        resizePopupContainer();
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

        if($(button).hasClass('btn04') && $(popupLayer).hasClass('chanceBuy')) {
            if(USER.PLAYED_GAME_COUNT>=10 || lastOpenFlag) {
                show(popupLayer);
            } else {
                _openPopup($('.chanceBuyNotice'),button);
                lastParentBtn = button;
                lastOpenFlag = true;
            }
        }else {
            show(popupLayer);
        }



        bh = $(document.body).height();
        ph = popupLayer.height();
        if (popupLayer.offset().top + ph > bh) {
            popupLayer.css({
                top: Math.max(0, bh - ph - 10)
            });
        }

        resizePopupContainer();
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
                playedGameCount = decrypt($("PALY_GAME_COUNT",e).text()),
                myGamePoint = decrypt($("MY_GAME_POINT", e).text()),
                myState = $("STATE", e).text(),
                parent = $(".status");
                // console.log("userStatus : " + userStatus);
            statusCode = myState * 1;
            console.log("count : " + playedGameCount);
            if(statusCode===9) {
                exit(ERROR.EMERGENCY);
                return;
            }

            if (code === "00") {
                USER.GAME_COUNT = gameCount;
                USER.PLAYED_GAME_COUNT = playedGameCount;
                parent.find("._gameCount").text(gameCount);
                parent.find("._myRank").text(currency(myRank));
                parent.find("._myScore").text(currency(myGamePoint));

                maxRank = myRank;
                maxScore = myGamePoint;

                if (closePopup) {
                    hide($(".popupContainer"));
                }
                if (callback) {
                    callback.call(null, myRank * 1, myGamePoint * 1);
                }
            } else {
                errorPopup(null, code);
            }
        }).fail(function(){
           if(userStatus ==="init") {
                exit(ERROR.USER_INFO);
           } else {
                errorPopup(null, ERROR.USER_INFO);
           }

        });
    };

    var triesApp = 4,
        triesWeb = 4;
    var resizePopupContainer = function() {
       var hei = $(document.body).height();

            $( '.layerBg' ).css('height', hei+'px');
            $( '.layerPop' ).css({
                'height': hei + 'px',
                'box-sizing': 'border-box'
            });

    };

    var init = function() {

        resizePopupContainer();
        userStatus = "init";

        cashpang.game.loader.loadResources(resource).then(function(){
            loaded = true;
            $(".evt-wrap").removeClass("invisible");
            if (queryString.mbr_id) {
                updateUserInfo(true);
            } else {
                hide($(".popupContainer"));
            }
        }, function(){
            //TODO
            exit("네트워크 장애로 인해 게임 로드에 실패했습니다.<br> 잠시 후 다시 시도해주세요.");
        });
    };

    $(document).ready(function() {

        window.onhashchange = function(e) {
            var hash = window.location.hash.substring(1);


            if (hash === "game") {
                 closePopup();
                return;
            }

            if(($(".gameCanvas").hasClass("shown") || $('.gameResult').hasClass("shown")) && !/popup$/.test(hash)) { //
                hide($(".gameCanvas"));
                hide($(".gameResult"));
                show($(".header"));
                $(document).off("touchstart touchmove", disableScroll);
                $(document.body).css("overflow", "auto");
                // console.log("change hash");

                cashpang.game.trigger("abort");

                started = false;
                return;
            }

            if (!hash.length || /game$/.test(hash)) {
                closePopup();
            }
        };

        if (cashpang.game.canvas.element.__directCanvasId__) { //planet.webview canvas 위치조정
            window.onscroll = function() {
                // console.log("scroll : " + (-window.scrollY));
                DirectCanvasSync.setCanvasY(cashpang.game.canvas.element.__directCanvasId__, -window.scrollY);
            };
        }

        $(".evt-wrap").removeClass("invisible");

        if (queryString.mbr_id) {

            requestDecryptString(queryString.mbr_id, "utf-8", function(str) {

                USER.MBR_ID = str;
                init();
            });

            // alert(str);
        } else {
            init();
        }
    });

    $(".gameCanvas").on("finish", function(e, point){
        var callback = function() {
            hide($(".gameCanvas"));
        };
        $(document).off("touchstart touchmove", disableScroll);
        $(document.body).css("overflow", "auto");

        $(".gameResult .myRank").text("");
        $(".gameResult .myScore").text("");
        $(".gameResult .score>span").text(currency(point));

        currentPoint = point;

        show($(".gameResult"))
            .css("opacity", 0)
            .animate({
                    opacity: 1
                }, 500, function() {
                    $(this).css("opacity", 1);
                    $(".gameCanvas").css("height",$(".gameResult > img").height() + "px");
                    // console.log($(this).height());
            });

        $('.gameResult').find('._back').css('z-index',1000);
        //DEV
        if (DEBUG) {

             if(maxScore > point) {

                if (maxRank <= 10000) {
                    hide($(".noRank"));
                    show($(".myPosition"));
                    show($('._first'));
                    $(".gameResult .myRank").html(currency(maxRank) + " <i>등</i>");
                    $(".gameResult .myScore").html(currency(maxScore) + " <i>점</i>");
                } else {
                    show($(".gameResult .noRank"));
                    hide($(".gameResult .endStatus"));
                }
            } else {
                apicall("save_point", {
                    points : point || 0
                }).done(function(e){

                    var code = $("CD", e).text();

                    if (code === "00") {
                        updateUserInfo(false, function(myRank, myGamePoint){
                        if (myRank <= 10000) {
                            hide($(".noRank"));
                            show($(".myPosition"));
                            show($('._first'));
                            $(".gameResult .myRank").html(currency(myRank) + " <i>등</i>");
                            $(".gameResult .myScore").html(currency(myGamePoint) + " <i>점</i>");
                        } else {
                            show($(".gameResult .noRank"));
                            hide($(".gameResult .endStatus"));
                        }
                        });
                    } else {
                        retryPopup(null, ERROR.SAVE_POINT);
                    }
                }).fail(function(e){
                    retryPopup(null, ERROR.SAVE_POINT);
                });
            }
            return;
        }

        if(maxScore > point) {
            if (maxRank <= 10000) {
                hide($(".noRank"));
                show($(".myPosition"));
                show($('._first'));
                $(".gameResult .myRank").html(currency(maxRank) + " <i>등</i>");
                $(".gameResult .myScore").html(currency(maxScore) + " <i>점</i>");
            } else {
                show($(".gameResult .noRank"));
                hide($(".gameResult .endStatus"));
            }
        } else {
            apicall("save_point", {
                points : point || 0
            }).done(function(e){
                var code = $("CD", e).text();
                if (code === "00") {
                    updateUserInfo(false, function(myRank, myGamePoint){
                        if (myRank <= 10000) {
                            hide($(".noRank"));
                            show($(".myPosition"));
                            show($('._first'));
                            $(".gameResult .myRank").html(currency(myRank) + " <i>등</i>");
                            $(".gameResult .myScore").html(currency(myGamePoint) + " <i>점</i>");
                        } else {
                            show($(".gameResult .noRank"));
                            hide($(".gameResult .endStatus"));
                        }
                    });
                } else {
                    retryPopup(null, ERROR.SAVE_POINT);
                }
            }).fail(function(e){
               retryPopup(null, ERROR.SAVE_POINT);
            });
        }

    });

    var disableScroll = function(e) {
        e.stopPropagation();
        e.preventDefault();
        // window.scrollTo(0,0);
    };


    var showCanvas = function() {
        $(".gameCanvas").css("height","");
         hide($(".header")); //hide section header
         hide($('._first'));
         hide($('.popupContainer'));
         hide($(".gameResult"));      //hide gameResult

         $(".gameResult").css({"left": 0}).removeClass("shown").addClass("hidden");
         show($(".gameCanvas"));       //show gamecanvas


    }

    var gameStart = function() {
             showCanvas();
             started = true;
             cashpang.game.trigger("ready");
    };

    //game start
    $("._playGame, ._gameStart").on("click", function(e){
        e.stopPropagation();
        e.preventDefault();
        // console.log(e);
        cashpang.game.soundManager.playSound("unlock");



        if( statusCode === 2 ) {
            errorPopup(null, ERROR.EVENT_ENT);
            return;
        }


        window.scrollTo(0,0);
        //DEV
        if (DEBUG) {
               userStatus = "game";
                // console.log("UserStatus : " + userStatus);
            window.location.hash = "game";
             $(document).on("touchstart touchmove", disableScroll);

            if(cashpang.game.runtime.planetWebview && $(e.currentTarget).hasClass("_gameStart")) {
                // planet.webview에서 게임시작 버튼 클릭 직후 mousemove 이벤트 발생시 화면이 계속 남아있는 버그 수정용

                $(".gameResult").animate({
                    left: "-1000px"
                }, 150, function() {

                    show($('.popupContainer'));
                    gameStart();
                });
            } else {
                show($('.popupContainer'));
                gameStart();
            }

            $("#cashpangCanvas").css("border-bottom", "none");

            return;
        }

        if (!USER.MBR_ID) {
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
            userStatus = "game";
            // console.log("userStatus : " + userStatus);
            apicall("part_game").done(function(e){
                $this.removeData("loading");
                var code = $("CD", e).text(),
                    gameCount;

                if (code === "00") {
                    USER.GAME_COUNT -= 1;
                    $("._gameCount").text(Math.max(0, USER.GAME_COUNT));
                    window.location.hash = "game";
                    show($('.popupContainer'));
                    $(document).on("touchstart touchmove", disableScroll);
                    if(cashpang.game.canvas.element.__directCanvasId__ && $(e.currentTarget).hasClass("_gameStart")) {

                        $(".gameResult").animate({
                            left: "-1000px"
                        }, 150, function() {
                            gameStart();
                        });
                    } else {
                        gameStart();
                    }

                    $("#cashpangCanvas").css("border-bottom", "none");

                } else if (code === "15") {
                    error(ERROR.PART_GAME_LATELY);
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

    cashpang.game.renderer.on("log", function(time){
        console.log("backward", time); //log abuser here.
    });


    //소문내기 scheme
    $("#scheme").on("click", "a", function(e) {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this),
            $scheme = $("#scheme");

        if( statusCode === 2 ) {
            errorPopup(null, ERROR.EVENT_ENT);
            return;
        }

        if ($scheme.data("loading")) {
            return;
        }

        if (!USER.MBR_ID) {
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
                    updateUserInfo(false);
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

    $( '.tabcont2 h3 button' ).on( 'click', function(){
        $( this ).parent().parent().addClass( 'on' ).siblings().removeClass( 'on' );
        apicall("buy_game_count_list",{type : "G"}).done(function(e) {

                var code = $('CD',e).text(),
                    parent = $('.rankPrice'),
                    con = parent.find('._giftbuylist'),
                    dateList = [],
                    hpList = [],
                    data = { lists:[]},
                    GMCNTList = [];
                // console.log("1");
                if(code === "00") {

                    tmpl = $("#tmpl_countgift_list").html();
                    $("DATE", e).each(function(){
                        dateList.push(decrypt($(this).text()));
                    });
                    $("HP_NO", e).each(function(){
                        hpList.push(maskPhoneNumber(decrypt($(this).text())));
                    });
                    $("GMCNT", e).each(function(){
                        GMCNTList.push(decrypt($(this).text()));
                    });

                    function showList(start, ceil) {
                        for(var i = start; i < ceil; i++) {
                            data.lists.push({
                                date : dateList[i],
                                hpno: hpList[i],
                                gmcnt : GMCNTList[i]
                            });
                        }

                        con.html(Mustache.render(tmpl, data));
                    }
                    showList(0, dateList.length);

                    if(dateList.length === 0) {
                        con.append('<tr><td colspan="3">선물 받으신 이력이 없습니다.</td></tr>');
                    }
                }


            }).fail(function(e){
                $scheme.removeData("loading");
                exit(ERROR.GET_MSG);
            });
    });


    $($('.buyCount')[0]).change(function(e) {
            var buycount = $(this).val(),
                buypoint = buycount*10;

            if(buycount > 10) {
                $(this).val("10");
                buycount = 10;
                buypoint = buycount * 10;
            }

            if(isNaN(buycount)) {
                buypoint = 0;
            }

            $($('.buyPoint')[0]).text(currency(buypoint) + " P");
            BUYINFO.GM_CNT = buycount;
            BUYINFO.GM_POINT = buypoint;
    });

    $($('.buyCount')[1]).change(function(e) {
            var buycount = $(this).val(),
                buypoint = buycount*10;

            if(buycount > 10) {
                $(this).val("10");
                buycount = 10;
                buypoint = buycount * 10;
            }

            if(isNaN(buycount)) {
                buypoint = 0;
            }

            $($('.buyPoint')[1]).text(currency(buypoint) + " P");
            BUYINFO.GM_CNT = buycount;
            BUYINFO.GM_POINT = buypoint;
    });

    $('._last').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        if( statusCode === 2 ) {
            errorPopup(null, ERROR.EVENT_ENT);
            return;
        }

        closePopup($(this));
        _openPopup($(".chanceBuy"),lastParentBtn);
    })
    //buy game count
    $('._buyBtn').on('click',function(e) {
        e.stopPropagation();
        e.preventDefault();

        if( statusCode === 2 ) {
            errorPopup(null, ERROR.EVENT_ENT);
            return;
        }

        var pwd = $('#appPwd'),
            count = $($('#buyCount')[0]),
            point = $($('.buyPoint')[0]),
            countVal = count.val(),
            $button = $("._popupButton[data-popup-id=_buyChance]");


        if($(recentBtn).attr('class') === "trans-link btn04 _popupButton _first") {
            $button = $button[0];
        } else {
            $button = $button[1];
        }

        BUYINFO.PWD = pwd.val();

        lastState = $('.chanceBuy');
        lastBtn = $button;

        if(countVal === "") {
              errorPopup($button,"수량을 입력하세요");
        }

        //BUYINFO 정보가 없는경우 or 구매할 게임기회가 잘못된경우 error 팝업
        if(BUYINFO.GM_POINT === 0 || BUYINFO.GM_CNT === undefined) {
            errorPopup($button, ERROR.NO_GMCNT);
            return;
        }

        if(BUYINFO.PWD !== "") {
            //apicall
            apicall("get_user_ci").done(function(e) {
                // console.log("done");
                var code = $('CD',e).text(),
                    ciValue = null;
                if(code==="00") {
                    BUYINFO.GM_CNT =parseInt(countVal,10);
                    BUYINFO.GM_POINT = BUYINFO.GM_CNT * 10;
                    BUYINFO.CI = $('USER_CI',e).text();
                    BUYINFO.TYPE="B";
                    BUYINFO.GIFT = USER.MBR_ID;
                    // console.log(BUYINFO);
                    apicall("buy_game_count").done(function(e) {
                        var code = $('CD',e).text();

                        if(code==="00") {
                            //성공
                            // console.log("success");
                            successPopup($button, MSG.BUYCOUNT);
                            updateUserInfo(false);

                        } else if(code==="12") {
                            //서버장애
                            errorPopup($button, ERROR.BUY_SERVER_ERROR);
                        } else if(code==="20") {
                            //총 누적횟수 500이상임
                            errorPopup($button, ERROR.OVERFLOW_COUNT);
                        } else {
                            //알 수 없는 오류
                            errorPopup($button, ERROR.BUY_UNKNOWN_ERROR);
                        }


                    }).fail(function() {
                        // console.log("fail");
                        errorPopup($button, ERROR.BUY_FAIL);

                    });
                } else {
                    errorPopup($button, ERROR.NOT_MATCH_PWD);
                }

                // closePopup();

                // show($('.layerBg'));
            });
        } else {
            errorPopup($button, ERROR.NO_PWD);
        }

        pwd.val("");
        count.val("");
        point.text("0 p");
        BUYINFO = {};
        lastOpenFlag = false;
        hide($('.chanceBuy').find('.alert'));
    });

    var sharingSNS = function(type) {
        var message = encodeURIComponent(MSG.SNS_MSG),//encodeURIComponent(document.getElementById("message").value),
            url = encodeURIComponent(MSG.SNS_URL),//encodeURIComponent(document.getElementById("url").value),
            shareType = type,
            urlPrefix = "ocbt://com.skmc.okcashbag.home_google/sharing?";

        if (queryString.app_type === "ios") {
            url = MSG.SNS_URL;
            urlPrefix = "ocbt://type=sharing&";
        }

        window.location.href = urlPrefix + "share_type=" + shareType + "&url=" + url + "&msg=" + message;
    };

    //안드로이드의 경우 주소록 버튼 노출
    $("._smsReceiver").removeClass("maxwidth");
    $("._smsContact").css("display", "inline-block");

    //안드로이드의 경우 주소록 연동
    $("._smsContact").on("click", function(e){
        e.stopPropagation();
        e.preventDefault();

        _openContact();
    });

    var _openContact = function() {
        if (queryString.app_type === "and") {
            //android
            window.location.href = "ocbt://com.skmc.okcashbag.home_google/requestContact?callBack=sendSMSViaContacts";
        } else if ( /*queryString.app_type === "ios") {*/ (/iphone|ipad|ipod/i).test(window.navigator.userAgent)) {
            window.location.href = "ocbt://type=requestContact&callBack=sendSMSViaContacts";
        }
    };

    window.sendSMSViaContacts = function(receivers) {
        var $button = $("._SMSViaContacts"),
            sender,
            receiver = receivers.toString().replace(/[^0-9]/gi, "");

        $("._smsReceiver").val(receiver);
    };


    //선물하기
    $("._giftGameChance").on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        if( statusCode === 2 ) {
            errorPopup(null, ERROR.EVENT_ENT);
            return;
        }


        if(USER.AGREED === "N" && !$("._agreeCheck").is(":checked")) {
            show($("._agreement .alert"));
            // another alert
            $("._agreeCheck").focus();
            $('._agreeCheck').parent().find('.agMsg').remove();
            $('._agreeCheck').parent().append("<span class='agMsg'>동의해주셔야 구매가 진행됩니다</span>");
            return;
        }

        var $this = $(this),
            $pwd = $('.appPwd'),
            $button = $("._popupButton[data-popup-id=_giftChance]"),
            sender = null,
            // receiver = "01030236738";
            receiver = $(this).parent().parent().parent().find("._smsReceiver").val().toString().replace(/[^0-9]/gi, "");

        lastState = $('.chancePresent');
        lastBtn = $button;


        if($($('.buyCount')[1]).val() === "") {
              errorPopup($button,"수량을 입력하세요");
              return;
        }

        apicall("get_mdn").done(function(e) {
            sender = $("MDN", e).text();

            if (sender === receiver) {
                errorPopup($button, ERROR.SEND_SMS_MYSELF);
                return;
            }

            if (isValidPhoneNumber(sender) && isValidPhoneNumber(receiver)) {

                 BUYINFO.PWD = $pwd.val();

                //BUYINFO 정보가 없는경우 or 구매할 게임기회가 잘못된경우 error 팝업
                if(BUYINFO.GM_POINT === 0 || BUYINFO.GM_CNT === undefined) {
                    errorPopup($button, ERROR.NO_GMCNT);
                    return;
                }

                    if(BUYINFO.PWD !== "") {
                        //apicall
                        apicall("get_user_ci").done(function(e) {
                            var code = $('CD',e).text(),
                                ciValue = null;
                        if(code==="00") {
                            BUYINFO.GM_CNT =parseInt(BUYINFO.GM_CNT,10);
                            BUYINFO.GM_POINT = BUYINFO.GM_CNT * 10;
                            BUYINFO.CI = $('USER_CI',e).text();
                            BUYINFO.TYPE="G";
                            BUYINFO.GIFT = receiver;
                            // console.log(BUYINFO);
                            apicall("buy_game_count").done(function(e) {
                                var code = $('CD',e).text();

                                if(code==="00") {
                                    //성공
                                    // console.log("success");
                                    //sendSMS
                                    apicall("send_sms2", {
                                        send : sender,
                                        hp_no : receiver
                                    }).done(function(e){
                                        $this.removeData("loading");
                                        var code = $("CD", e).text();
                                        if (code === "00") {
                                            // console.log("success");
                                            successPopup($button, MSG.GIFTCHANCE);
                                            updateUserInfo(false);
                                        } else if (code === "20") {
                                            errorPopup($button, ERROR.SEND_SMS_AGAIN);
                                        } else if (code === "21") {
                                            errorPopup($button, ERROR.SAME_NAME);
                                        } else {
                                            errorPopup($button, ERROR.SEND_SMS);
                                        }

                                        $("._smsReceiver").val("");
                                        $pwd.val("");
                                        $($('.buyCount')[1]).val("");
                                        $($('.buyPoint')[1]).text("0P");
                                    }).fail(function(){
                                        $this.removeData("loading");
                                        // console.log("fail");
                                        errorPopup($button, ERROR.SEND_SMS);
                                    });
                                } else if(code==="12") {
                                    //서버장애
                                    errorPopup($button, ERROR.BUY_SERVER_ERROR);
                                } else if(code==="20") {
                                    //총 누적횟수 500이상임
                                    errorPopup($button, ERROR.OVERFLOW_COUNT);
                                } else if(code==="21") {
                                    errorPopup($button, ERROR.MBR_ID);
                                }else {
                                    //알 수 없는 오류
                                    errorPopup($button, ERROR.BUY_UNKNOWN_ERROR);
                                }


                            }).fail(function() {
                                // console.log("fail");
                                errorPopup($button, ERROR.BUY_FAIL);

                            });
                        } else {
                            errorPopup($button, ERROR.NOT_MATCH_PWD);
                        }

                    });
                } else {
                     errorPopup($button, ERROR.NO_PWD);
                }
            } else {
                errorPopup($button, ERROR.INVALID_PHONE_NUMBER);
            }
        });
    });
    //기본 sms팝업에서 sms 전송버튼
    $("._sendSMS").on("click", function(e){
        e.stopPropagation();
        e.preventDefault();

        if( statusCode === 2 ) {
            errorPopup(null, ERROR.EVENT_ENT);
            return;
        }

        if ($(this).data("loading")) {
            return;
        }
        if(USER.AGREED === "N" && !$("._agreeCheck").is(":checked")) {
            show($("._agreement .alert"));
            // another alert
            $("._agreeCheck").focus();
            return;
        }

        var $this = $(this),
            $button = $("._popupButton[data-popup-id=send_sms]"),
            sender = $("._smsSender").val().toString().replace(/[^0-9]/gi, ""),
            receiver = $(this).parent().find("._smsReceiver").val().toString().replace(/[^0-9]/gi, "");

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
                    // console.log("success");
                    successPopup($button, MSG.SEND_SMS);
                    updateUserInfo(false);
                } else if (code === "20") {
                    // console.log("error 20");
                    errorPopup($button, ERROR.SEND_SMS_AGAIN);
                } else {
                    // console.log("err nothing");
                    errorPopup($button, ERROR.SEND_SMS);
                }
            }).fail(function(){
                $this.removeData("loading");
                // console.log("fail");
                errorPopup($button, ERROR.SEND_SMS);
            });
        } else {
            errorPopup($button, ERROR.INVALID_PHONE_NUMBER);
        }

        $("._smsReceiver").val("");

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
                $("._invitationCode").val("");
                successPopup($button, MSG.PASS_INPUT);
            } else if (code === "34") {
                errorPopup($button, ERROR.ALREADY_PASS_INPUT);
            } else if (code === "21") {
                errorPopup($button, ERROR.PASS_INPUT_MYSELF);
            } else {
                errorPopup($button, ERROR.PASS_INPUT);
            }
        }).fail(function(){
            $this.removeData("loading");
            errorPopup($button, ERROR.PASS_INPUT);
        });
    });
    var recentBtn = null;
    //open popup
    $(document).on("click", "._popupButton", function(e){
        e.stopPropagation();
        e.preventDefault();

        if ($(this).data("loading")) {
            return;
        }

        var $this = $(this),
            apimsg = $this.data("apicall") && $this.data("apicall").split(" "),
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
            },
            idx;
        recentBtn = this;

        if (popupid==="_buyChance" || popupid==="send_sms") {
            if (statusCode === 2) {
                errorPopup(null, ERROR.EVENT_ENT);
                return;
            }
        }
        if ($this.data("auth")) { //인증된 사용자만
            if (!USER.MBR_ID) {
                tocbRegistLink(queryString.app_type);
                return;
            }
        }
        // console.log(apimsg);
        if (!apimsg || (useCache && $this.data("cache"))) {
            if(apimsg && (idx = apimsg.indexOf("get_agreement")) > 0 && USER.AGREED === "N") {
                apicall(apimsg[idx]).done(function(e) {
                    apicallback[apimsg[idx]](e);
                }).fail(function() {
                    apicallback[apimsg[idx]](false);
                });
            }

            popup();
        } else {
            apimsg.forEach(function (api) {
                $this.data("loading", true);
                apicall(api).done(function(e){
                    $this.removeData("loading");
                    if ($("CD", e).text() === "00") {
                       $this.data("cache", e);
                    }
                    if (typeof apicallback[api] === "function") {
                        apicallback[api](e);
                    }
                    popup();
                }).fail(function(){
                    $this.removeData("loading");
                    if (api === "get_mdn") {
                        apicallback[api](false);
                        popup();
                        return;
                    }
                    errorPopup($this, ERROR[api.toUpperCase()]);
                });
            });
        }
    });

    //close popup
    $(document).on("click", ".layer_close, ._popupClose", function(e){
        e.stopPropagation();
        e.preventDefault();

        lastOpenFlag = false;

        if(errorFlag) {
            if(lastState === null) {
                closePopup($(this));
                history.go(-1);
            } else {
                _openPopup(lastState, lastBtn);
                lastState = null;
                lastBtn = null;
            }
            errorFlag = false;
        } else {
            closePopup($(this));
            history.go(-1);
        }



    });

    //game end and back
    $(document).on("click","._back" ,function(e){
        e.stopPropagation();
        e.preventDefault();
        history.go(-1);
        userStatus = "init";
    });

    $(document).on("click", "._retry", function(e) {
        e.stopPropagation();
        e.preventDefault();
        apicall("save_point", {
            points : currentPoint || 0
        }).done(function(e){
            var code = $("CD", e).text();

            closePopup($(this));

            if (code === "00") {
                updateUserInfo(false, function(myRank, myGamePoint){
                    if (myRank <= 10000) {
                        hide($(".noRank"));
                        show($(".myPosition"));
                        show($('._first'));
                        $(".gameResult .myRank").html(currency(myRank) + " <i>등</i>");
                        $(".gameResult .myScore").html(currency(myGamePoint) + " <i>점</i>");
                    } else {
                        show($(".gameResult .noRank"));
                        hide($(".gameResult .endStatus"));
                    }
                });
            } else {
                retryPopup(null, ERROR.SAVE_POINT);
            }

        }).fail(function(e){
            closePopup($(this));
            retryPopup(null, ERROR.SAVE_POINT);
        });
    })
// }(jQuery));
});
