/**
 * Created by dev_bcm@sk.com on 2014. 9. 5..
 */
requirejs.config({
    baseUrl: 'engine/module',
    paths:{
        lib:'lib',
        ocb: '../../js'
    },
    waitSeconds: 15
});


require(["ocb/main","ocb/resource"], function(cashpang,resource) {

    var loaded = false,
        $scoreText = $('.score'),
        score,
        localStorageManager;

    var ua = navigator.userAgent.toLowerCase();


    var init = function() {
        // $('.restartBtn').addClass('hidden');
        // $('.backBtn').addClass('hidden');
        // $('.layerBg').addClass('hidden');
        cashpang.game.trigger("ready");
    };

    $(document).ready(function() {
        var storedInfo;
        var width = (window.innerWidth - 200) / 2;

        // $('.restartBtn').css('left',width+"px");
        // $('.backBtn').css('left', width+'px');
        if (!(/Android 2/i).test(ua)) {
            localStorageManager = new LocalStorageManager("cashpang");
            storedInfo = localStorageManager.load();
            score = storedInfo === null? 0 : storedInfo.score;
            $scoreText.text(score);
            //best score를 읽었으면 해당 rate와 level을 기록한다
            //매번 기록하는 것 보다 best score는 있는데, 없을 경우만 기록하도록 하는게 좋겠음
            //IMPROVE ME
            if(score > 0){
                var obj = {},
                    res = intepretGameResult(score);
                obj.score = score;
                obj.level = res.levelID;
                obj.rate = res.rate;

                localStorageManager.save(obj);
            }
        }

        cashpang.game.loader.loadResources(resource).then(function(){
            loaded = true;
            init();
        }, function(){
            //TODO
            alert("네트워크 장애로 인해 게임 로드에 실패했습니다.<br> 잠시 후 다시 시도해주세요.");
        });
    });

    function intepretGameResult(point){
        //정규 분포에 따라서 level의 분포 구간은 정함
        //IMPROVE ME
        //실제 정규 분포의 PDF에 따라서 score를 probability로 변경하지는 않음
        //똑똑한 배철민 매니저가 해줄 것임
        //http://hyperphysics.phy-astr.gsu.edu/hbase/math/immath/gauds.gif
        //levelID는 css style의 class 명과 동일해야하므로 고치지 마시오. 아니면 두개를 같이 고치시오
        var scoreDB = [
            {
                levelDesc: "초하수",
                levelID: "lv-6",
                startPnt: 0,
                endPnt: 31500,
                startRate:  97,
                endRate: 100
            },
            {
                levelDesc: "하수",
                levelID: "lv-5",
                startPnt: 31501,
                endPnt: 63750,
                startRate: 84,
                endRate: 97
            },
            {
                levelDesc: "중수",
                levelID: "lv-4",
                startPnt: 63751,
                endPnt: 291500,
                startRate: 16,
                endRate: 84
            },
            {
                levelDesc: "고수",
                levelID: "lv-3",
                startPnt: 291501,
                endPnt: 456000,
                startRate: 4,
                endRate: 16
            },
            {
                levelDesc: "초고수",
                levelID: "lv-2",
                startPnt: 456001,
                endPnt: 828250,
                startRate: 0.1,
                endRate: 3
            },
            {
                levelDesc: "신(神)",
                levelID: "lv-1",
                startPnt: 828251,
                endPnt: "Infinity",
                startRate: 0,
                endRate: 0.1
            }
        ];

        var score, i,
            levelDesc, levelID, rate,
            levelNum = scoreDB.length;

        for (i=0;i<levelNum;i++){
            score = scoreDB[i];
            if (score.startPnt > point || score.endPnt < point) {
                continue;
            }
            levelDesc = score.levelDesc;
            levelID = score.levelID;
            rate = (function(){
                // % 표시 방식
                // 0 - 0.1: 0.1%
                // 0.2 - 1.0: 1.0%
                // 1.1% - 99.9%: 소수점 두째자리 이하 날림
                // 100% : 소수점 없음
                var  res,
                    ratePerPoint = (score.endRate-score.startRate)/(score.endPnt - score.startPnt);
                res = score.endRate - ratePerPoint * (point - score.startPnt);
                if (res <= 0.1) {
                    res = 0.1;
                }
                if (res > 100) {
                    res = 100;
                }
                if (res>0.1) {
                    res = res*10;
                    res = Math.ceil(res);
                    res = res/10;
                }
                return res.toString();
            })();
            break;
        }
        console.log(levelDesc);
        console.log(levelID);
        console.log(rate);

        return {
            levelDesc: levelDesc,
            levelID: levelID,
            rate: rate
        }
    }
    $('._gameCanvas').on('finish', function(e, point) {

        var obj = {},
            res = intepretGameResult(point);

        $('.p2 strong').addClass(res.levelID);
        $('.p1 strong').text(res.rate);

        $('.game-result').removeClass('hidden');

        obj.score = point;
        obj.level = res.levelID;
        obj.rate = res.rate;

        if(score < point) {
            if (!(/Android 2/i).test(ua)) {
                localStorageManager.save(obj);
            }
            $scoreText.text(point);
            console.log(point);
        }
    });

    $('.restartBtn').on('click', function(e) {
        window.location.reload();
    });

    $('.backBtn').on('click', function(e) {
        window.location.href="http://egame.skmcgw.com/planetArcade/client/index.html";
    });

});