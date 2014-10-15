$(document).ready(function() {
    $("#secondaryChart").hide();

    var GID =  4;

    var dates = [],
        numOfUsers = [],
        numOfNewUsers = [],
        totalNewUsers = [],
        landingPageView = [],
        x,
        colors = [
            "#00aadd",
            "#55bb00"
        ];

    var parseDate = function(str) {
        var year = parseInt(str.slice(0,4), 10),
            month = parseInt(str.slice(4,6), 10),
            date = parseInt(str.slice(6,8), 10);

        return [year, month-1, date];
    };

    var apicall = function(num) {
        if(DEBUG) {
            return $.ajax({
                dataType: "html",
                url: "http://10.202.212.13:3388",
                data: {
                    url: num !== 0 ? "http://egame.skmcgw.com/mgw/game/glg/game_stats_" + num + ".jsp?GID=" + GID : "http://egame.skmcgw.com/mgw/game/glg/game_stats.jsp?GID=" + GID
                }
            });
        }
        return $.ajax({
            dataType: "html",
            url: num !== 0 ? "http://egame.skmcgw.com/mgw/game/glg/game_stats_" + num + ".jsp" : "http://egame.skmcgw.com/mgw/game/glg/game_stats.jsp",
            data: {
                GID: GID
            }
        });
    };
    var apicallback = function(num, e, noDraw) {
        switch(num) {
            case 0:
                var res = $("#test").contents().find("html").html(e);
                var prev = 0;
                landingPageView = [];
                $.each(res.find("table tr td:nth-child(2)"), function (i, v) {
                    var text = $(v).text();
                    if(!/[^0-9]/g.test(text)) {
                        landingPageView.push([new Date(dates[i-1][0], dates[i-1][1], dates[i-1][2]), parseInt(text, 10)]);
                    }
                });

                if(!noDraw) {
                    $("#chart1Header").text("일별 랜딩 페이지 접속자 수");
                    drawChart('chart', landingPageView, numOfNewUsers, {y_axis_scale: [0, 100000], max_y_labels: 11});
                }

                break;
            case 6:
                var res = $("#test").contents().find("html").html(e);
                numOfUsers = [];

                if(dates.length === 0) {
                    $.each(res.find("table tr td:nth-child(1)"), function (i, v) {
                        var text = $(v).text();
                        if(!/[^0-9]/g.test(text)) {
                            dates.push(parseDate(text));
                        }
                    });
                }


                $.each(res.find("table tr td:nth-child(2)"), function (i, v) {
                    var text = $(v).text();
                    if(!/[^0-9]/g.test(text)) {
                        numOfUsers.push([new Date(dates[i-1][0], dates[i-1][1], dates[i-1][2]), parseInt(text, 10)]);
                    }
                });
                $("#chart1Header").text("일별 사용자 수 추이");
                apicall(5).done(function(e) {
                    apicallback(5, e, true);
                    drawChart('chart', numOfUsers, numOfNewUsers, {
                        y_axis_scale: [0, 80000],
                        max_y_labels: 9,
                        max_x_labels: dates.length * 3,
                        y_label_size: 10
                    });

                    $("#secondaryChart").show();
                    $("#chart2Header").text("일별 재방문(게임 플레이)율");
                    $("#chart2").css({width: "800px", height: "150px"});
                    drawBarChart('chart2', numOfUsers.map(function(v, i) {
                        return [v[0].getMonth()+1 + "/" + (v[0].getUTCDate()+1), (v[1] - numOfNewUsers[i][1])/v[1] * 100];
                    }), {
                        y_axis_scale: [0, 100],
                        max_y_labels: 11,
                        max_x_labels: dates.length * 2,
                        y_label_size: 10,
                        label_format: "%m%d"
                    });
                });

                break;

            case 5:
                var res = $("#test").contents().find("html").html(e),
                    prev = 0;
                numOfNewUsers = [];
                totalNewUsers = [];
                $.each(res.find("table tr td:nth-child(2)"), function (i, v) {
                    var text = $(v).text();
                    if(!/[^0-9]/g.test(text)) {
                        numOfNewUsers.push([new Date(dates[i-1][0], dates[i-1][1], dates[i-1][2]), parseInt(text, 10)]);
                        totalNewUsers.push([new Date(dates[i-1][0], dates[i-1][1], dates[i-1][2]), parseInt(text, 10) + prev]);
                        prev = totalNewUsers[totalNewUsers.length-1][1];
                    }
                });

                if(!noDraw) {
                    $("#chart1Header").text("일별 누적 새 사용자");
                    drawChart('chart', totalNewUsers, {
                        y_axis_scale: [0, 1000000],
                        max_y_labels: 16,
                        max_x_labels: dates.length * 2,
                        y_label_size: 10
                    });
                }

                break;

            case 12:
                var res = $("#test").contents().find("html").html(e),
                    prev = 0;
                numOfbuyCount = [];
                totalNewUsers = [];
                $.each(res.find("table tr td:nth-child(2)"), function (i, v) {
                    var text = $(v).text();
                   if(i>0) {
                        if(!/[^0-9]/g.test(text)) {
                        numOfbuyCount.push([new Date(dates[i][0], dates[i][1], dates[i][2]), parseInt(text, 10)]);
                        // totalNewUsers.push([new Date(dates[i-1][0], dates[i-1][1], dates[i-1][2]), parseInt(text, 10) + prev]);
                        // numOfbuyCount.push(text);
                        // prev = totalNewUsers[totalNewUsers.length-1][1];
                    }
                   }

                });

                if(!noDraw) {
                    $("#chart1Header").text("일일 포인트 구매 횟수");
                    drawChart('chart', numOfbuyCount, {
                        y_axis_scale: [0, 500000],
                        max_y_labels: 16,
                        max_x_labels: dates.length * 2,
                        y_label_size: 10
                    });
                }

                break;
        }

    };

    var drawLegend = function() {

        var legend_new = new Charts.LineChart('legend_newUsers', {
            show_grid: false,
            show_y_labels: false,
            show_x_labels: false,
            label_max: false,
            label_min: false,
            multi_axis: false,
            x_padding: 10
        });

        var legend_users = new Charts.LineChart('legend_users', {
            show_grid: false,
            show_y_labels: false,
            show_x_labels: false,
            label_max: false,
            label_min: false,
            multi_axis: false,
            x_padding: 10
        });

        legend_users.add_line({
            data: [[1, 100], [2,100]],
            options : {
                line_color: "#00aadd",
                dot_color: "#00aadd",
                area_color: "#00aadd",
                dot_size: 5,
                line_width: 4
            }
        });
        legend_new.add_line({
            data: [[1, 100], [2,100]],
            options: {
                line_color: "#55bb00",
                dot_color: "#55bb00",
                area_color: "#55bb00",
                dot_size: 5,
                line_width: 4
            }
        });

        legend_new.draw();
        legend_users.draw();

    }


    var drawChart = function(id) {
        clearChart(id);
        var opt = {
            show_grid: true,
            show_y_labels: true,
            label_max: true,
            label_min: true,
            multi_axis: false,
            x_padding: 45,
            y_padding: 25,
            max_y_labels: 16,
            max_x_labels: dates.length * 2,
            y_label_size: 10

        };

        var options = arguments[arguments.length-1];
        if(typeof options === "object" && !Array.isArray(options)) {
            for(var prop in options) {
                if(options.hasOwnProperty(prop)) {
                    opt[prop] = options[prop];
                }
            }
        }
        var chart = new Charts.LineChart(id, opt);

        for(var i = 1; i < arguments.length; i++) {
            data = arguments[i];
            if(Array.isArray(data)) {
                chart.add_line({
                    data: data,
                    options : {
                        line_color: colors[i-1],
                        dot_color: colors[i-1],
                        area_color: colors[i-1],
                        dot_size: 5,
                        line_width: 4
                    }
                });
            }
        }

        chart.draw();
    };

    var drawBarChart = function(id) {
        clearChart(id);
        var opt = {
            show_grid: true,
            show_y_labels: true,
            x_padding: 45,
            y_padding: 25,
            y_label_size: 10

        };

        var options = arguments[arguments.length-1];
        if(typeof options === "object" && !Array.isArray(options)) {
            for(var prop in options) {
                if(options.hasOwnProperty(prop)) {
                    opt[prop] = options[prop];
                }
            }
        }
        var chart = new Charts.BarChart(id, opt);

        for(var i = 1; i < arguments.length; i++) {
            data = arguments[i];
            if(Array.isArray(data)) {
                data.forEach(function(v, i) {
                    chart.add({
                        label: v[0],
                        value: v[1],
                        options : {
                            bar_color: colors[0]
                        }
                    });
                });
            }
        }

        chart.draw();

    };

    var clearChart = function(id) {
        $("#" + id).html("");
    };

    $("nav").on("click", "button", function(e) {
        var $this = $(this),
            num = $this.data("num");

        $("nav button").removeClass("active");
        $this.addClass("active");
        $(".legend").hide();
        $("#secondaryChart").hide();

        if(num === 9) {
            apicall(0).done(function(e) {
                apicallback(0, e, true);
                apicall(5).done(function(e) {
                    apicallback(5, e, true);
                    $("#chart1Header").text("일별 페이지 최초 접속자 대비 최초 플레이 유저 비율");
                    drawBarChart('chart', landingPageView.map(function(v, i) {
                        return [v[0].getMonth()+1 + "/" + (v[0].getUTCDate()+1), numOfNewUsers[i][1]/v[1] * 100];
                    }), {
                        show_grid:true,
                        y_axis_scale: [0, 100],
                        max_y_labels: 11,
                        max_x_labels: dates.length * 2,
                        y_label_size: 10
                    });
                });
            });
            return;
        }

        apicall(num).done(function(e) {
            apicallback(num, e);
            if(num === 6) {
                $(".legend").show();
                $(".legend th").eq(0).text("일별 새 사용자 수");
                $(".legend th").eq(1).text("일별 게임 참여 사용자 수 (unique)");
            } else if(num === 0) {
                $(".legend").show();
                $(".legend th").eq(1).text("일별 랜딩 페이지 접속자");
                $(".legend th").eq(0).text("일별 게임 새 사용자");
            }
        });
    });

    apicall(6).done(function(e) {
        apicallback(6, e);
        drawLegend();
    });


});
