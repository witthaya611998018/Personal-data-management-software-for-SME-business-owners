if (document.getElementById('file_log_ag')) {
    $.ajax({
        method: "POST",
        url: "/file_log_ag",
        data: {value:1},
        success: function(result){
            // console.log(result)
            let total_date = []
            let index = 0
            for (var d = 0; d < result.files.length; d++) {
                if (d == 0) {
                    total_date.push({ 'date': convert_datetime(new Date(result.files[d]._get), result.files[d]._get), "count": 1 })
                } else {
                    if (total_date[index].date == convert_datetime(new Date(result.files[d]._get), result.files[d]._get)) {
                        total_date[index].count++
                    } else {
                        index++
                        total_date.push({ 'date': convert_datetime(new Date(result.files[d]._get), result.files[d]._get), "count": 0 })
                        if (total_date[index].date == convert_datetime(new Date(result.files[d]._get), result.files[d]._get)) {
                            total_date[index].count++
                        }
                    }
                }
            }
            $(function () {
                var _date_ = []
                var _count_ = []
                for (d in total_date){
                    _date_.push(total_date[d].date)
                    _count_.push(total_date[d].count)
                }
                "use strict";
                // -----------------------------------------------------------------------
                // Sales of the Month
                // -----------------------------------------------------------------------
                var option_Sales_of_the_Month = {
                    series: [9, 3, 2, 2],
                    labels: ["Item A", "Item B", "Item C", "Item D"],
                    chart: {
                        type: 'donut',
                        height: 280,
                        fontFamily: 'Rubik,sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        width: 0,
                    },
                    plotOptions: {
                        pie: {
                            expandOnClick: true,
                            donut: {
                                size: '88',
                                labels: {
                                    show: false,
                                    name: {
                                        show: true,
                                        offsetY: 7,
        
                                    },
                                    value: {
                                        show: false,
                                    },
                                    total: {
                                        show: false,
                                        color: '#a1aab2',
                                        fontSize: '13px',
                                        label: 'Our Visitor',
                                    }
                                },
                            },
                        },
                    },
                    colors: ['#edf1f5', '#009efb', '#55ce63', '#745af2'],
                    tooltip: {
                        show: true,
                        fillSeriesColor: false,
                    },
                    legend: {
                        show: false
                    },
                };
                new ApexCharts(document.querySelector("#sales-of-the-month"), option_Sales_of_the_Month);
                // -----------------------------------------------------------------------
                // Revenue Statistics
                // -----------------------------------------------------------------------
                var Revenue_Statistics = {
                    series: [
                        {
                            name: "จำนวนทั้งหมด",
                            data: _count_,
                        },
                        // {
                        //     name: "Product B ",
                        //     data: [0, 4, 0, 4, 0, 4, 0, 4],
                        // },
                    ],
                    chart: {
                        fontFamily: 'Rubik,sans-serif',
                        height: 350,
                        type: "area",
                        toolbar: {
                            show: false,
                        },
                    },
                    fill: {
                        type: 'solid',
                        opacity: 0.2,
                        colors: ["#FF4500"],
                    },
                    grid: {
                        show: true,
                        borderColor: "rgba(0,0,0,0.1)",
                        strokeDashArray: 3,
                        xaxis: {
                            lines: {
                                show: true
                            }
                        },
                    },
                    colors: ["#FF4500"],
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        curve: "smooth",
                        width: 1,
                        colors: ["#FF4500"],
                    },
                    markers: {
                        size: 3,
                        colors: ["#FF4500"],
                        strokeColors: "transparent",
                    },
                    xaxis: {
                        axisBorder: {
                            show: true,
                        },
                        axisTicks: {
                            show: true,
                        },
                        categories: _date_,
                        labels: {
                            style: {
                                colors: "#a1aab2",
                            },
                        },
                    },
                    yaxis: {
                        tickAmount: 9,
                        labels: {
                            style: {
                                colors: "#a1aab2",
                            },
                        },
                    },
                    tooltip: {
                        x: {
                            format: "dd/MM/yy HH:mm",
                        },
                        theme: "dark",
                    },
                    legend: {
                        show: false,
                    },
                };
                var chartRevnue = new ApexCharts(document.querySelector("#revenue-statistics"), Revenue_Statistics);
                chartRevnue.render();
                // ----------------------------------------------------------------------- 
                // Sales difference
                // -----------------------------------------------------------------------
                var option_Sales_Difference = {
                    series: [35, 15, 10],
                    labels: ["", "", ""],
                    chart: {
                        type: 'donut',
                        height: 140,
                        fontFamily: 'Rubik,sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        width: 0,
                    },
        
                    plotOptions: {
                        pie: {
                            expandOnClick: true,
                            donut: {
                                size: '65%',
                                labels: {
                                    show: false,
                                    name: {
                                        show: true,
                                        offsetY: 7,
        
                                    },
                                    value: {
                                        show: false,
                                    },
                                    total: {
                                        show: false,
                                        color: '#a1aab2',
                                        fontSize: '13px',
                                        label: 'Visits',
                                    }
                                },
                            },
                        },
                    },
                    colors: ['#39c449', '#ebf3f5', '#009efb'],
                    tooltip: {
                        show: true,
                        fillSeriesColor: false,
                    },
                    legend: {
                        show: false
                    },
                    responsive: [{
                        breakpoint: 426,
                        options: {
                            chart: {
                                height: 130,
                                offsetY: 10,
                                offsetX: -35,
                                width: 200
                            },
                        }
                    }]
                };
                new ApexCharts(document.querySelector("#sales-difference"), option_Sales_Difference);
                // ----------------------------------------------------------------------- 
                // Sales Prediction
                // ----------------------------------------------------------------------- 
                var option_Sales_Prediction = {
                    chart: {
                        height: 170,
                        type: "radialBar",
                        fontFamily: 'Rubik,sans-serif',
                        spacingTop: 0,
                        spacingBottom: 0,
                        spacingLeft: 0,
                        spacingRight: 0,
                        offsetY: -30,
                        sparkline: {
                            enabled: true
                        }
                    },
                    series: [60],
                    colors: ["#1badcb"],
                    stroke: {
                        dashArray: 2
                    },
                    plotOptions: {
                        radialBar: {
                            startAngle: -135,
                            endAngle: 135,
                            track: {
                                background: '#f1f1f1',
                                startAngle: -135,
                                endAngle: 135,
                            },
                            hollow: {
                                size: '30%',
                                background: 'transparent',
                            },
                            dataLabels: {
                                show: true,
                                name: {
                                    show: false,
                                },
                                value: {
                                    show: false,
                                },
                                total: {
                                    show: true,
                                    fontSize: '20px',
                                    color: '#000',
                                    label: '91.4 %',
                                }
                            }
                        }
                    },
                    fill: {
                        type: "solid",
                    },
                    tooltip: {
                        enabled: true,
                        fillSeriesColor: false,
                        theme: "dark"
                    },
                    responsive: [{
                        breakpoint: 426,
                        options: {
                            chart: {
                                offsetX: -15,
                            }
                        }
                    }],
                    labels: ["Progress"]
                };
                new ApexCharts(document.querySelector("#sales-prediction"), option_Sales_Prediction);
            });
        }
    })
} 
else if (document.getElementById('logger_hash_ag')) {
    $.ajax({
        method: "POST",
        url: "/logger_ag",
        data: { value: 1 },
        success: function (result) {
            var total_date = []
            var index = 0
            for (var d = 0; d < result.hash.length; d++) {
                if (d == 0) {
                    total_date.push({ 'date': result.hash[d].date_now, "count": 1 })
                } else {
                    if (total_date[index].date == result.hash[d].date_now) {
                        total_date[index].count++
                    } else {
                        index++
                        total_date.push({ 'date': result.hash[d].date_now, "count": 0 })
                        if (total_date[index].date == result.hash[d].date_now) {
                            total_date[index].count++
                        }
                    }
                }
            }
            $(function () {
                var _date_ = []
                var _count_ = []
                for (d in total_date){
                    _date_.push(total_date[d].date)
                    _count_.push(total_date[d].count)
                }
                "use strict";
                // -----------------------------------------------------------------------
                // Sales of the Month
                // -----------------------------------------------------------------------
                var option_Sales_of_the_Month = {
                    series: [9, 3, 2, 2],
                    labels: ["Item A", "Item B", "Item C", "Item D"],
                    chart: {
                        type: 'donut',
                        height: 280,
                        fontFamily: 'Rubik,sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        width: 0,
                    },
                    plotOptions: {
                        pie: {
                            expandOnClick: true,
                            donut: {
                                size: '88',
                                labels: {
                                    show: false,
                                    name: {
                                        show: true,
                                        offsetY: 7,

                                    },
                                    value: {
                                        show: false,
                                    },
                                    total: {
                                        show: false,
                                        color: '#a1aab2',
                                        fontSize: '13px',
                                        label: 'Our Visitor',
                                    }
                                },
                            },
                        },
                    },
                    colors: ['#edf1f5', '#009efb', '#55ce63', '#745af2'],
                    tooltip: {
                        show: true,
                        fillSeriesColor: false,
                    },
                    legend: {
                        show: false
                    },
                };
                new ApexCharts(document.querySelector("#sales-of-the-month"), option_Sales_of_the_Month);
                // -----------------------------------------------------------------------
                // Revenue Statistics
                // -----------------------------------------------------------------------
                var Revenue_Statistics = {
                    series: [
                        {
                            name: "จำนวนทั้งหมด",
                            data: _count_,
                        },
                    ],
                    chart: {
                        fontFamily: 'Rubik,sans-serif',
                        height: 350,
                        type: "area",
                        toolbar: {
                            show: false,
                        },
                    },
                    fill: {
                        type: 'solid',
                        opacity: 0.2,
                        colors: ["#FF4500"],
                    },
                    grid: {
                        show: true,
                        borderColor: "rgba(0,0,0,0.1)",
                        strokeDashArray: 3,
                        xaxis: {
                            lines: {
                                show: true
                            }
                        },
                    },
                    colors: ["#FF4500"],
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        curve: "smooth",
                        width: 1,
                        colors: ["#FF4500"],
                    },
                    markers: {
                        size: 3,
                        colors: ["#FF4500"],
                        strokeColors: "transparent",
                    },
                    xaxis: {
                        axisBorder: {
                            show: true,
                        },
                        axisTicks: {
                            show: true,
                        },
                        // categories: ['0', '4', '8', '12', '16', '20', '24', '30'],
                        categories: _date_,
                        labels: {
                            style: {
                                colors: "#a1aab2",
                            },
                        },
                    },
                    yaxis: {
                        tickAmount: 9,
                        labels: {
                            style: {
                                colors: "#a1aab2",
                            },
                        },
                    },
                    tooltip: {
                        x: {
                            format: "dd/MM/yy HH:mm",
                        },
                        theme: "dark",
                    },
                    legend: {
                        show: false,
                    },
                };
                var chartRevnue = new ApexCharts(document.querySelector("#revenue-statistics"), Revenue_Statistics);
                chartRevnue.render();
                // ----------------------------------------------------------------------- 
                // Sales difference
                // -----------------------------------------------------------------------
                var option_Sales_Difference = {
                    series: [35, 15, 10],
                    labels: ["", "", ""],
                    chart: {
                        type: 'donut',
                        height: 140,
                        fontFamily: 'Rubik,sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        width: 0,
                    },

                    plotOptions: {
                        pie: {
                            expandOnClick: true,
                            donut: {
                                size: '65%',
                                labels: {
                                    show: false,
                                    name: {
                                        show: true,
                                        offsetY: 7,

                                    },
                                    value: {
                                        show: false,
                                    },
                                    total: {
                                        show: false,
                                        color: '#a1aab2',
                                        fontSize: '13px',
                                        label: 'Visits',
                                    }
                                },
                            },
                        },
                    },
                    colors: ['#39c449', '#ebf3f5', '#009efb'],
                    tooltip: {
                        show: true,
                        fillSeriesColor: false,
                    },
                    legend: {
                        show: false
                    },
                    responsive: [{
                        breakpoint: 426,
                        options: {
                            chart: {
                                height: 130,
                                offsetY: 10,
                                offsetX: -35,
                                width: 200
                            },
                        }
                    }]
                };
                new ApexCharts(document.querySelector("#sales-difference"), option_Sales_Difference);
                // ----------------------------------------------------------------------- 
                // Sales Prediction
                // ----------------------------------------------------------------------- 
                var option_Sales_Prediction = {
                    chart: {
                        height: 170,
                        type: "radialBar",
                        fontFamily: 'Rubik,sans-serif',
                        spacingTop: 0,
                        spacingBottom: 0,
                        spacingLeft: 0,
                        spacingRight: 0,
                        offsetY: -30,
                        sparkline: {
                            enabled: true
                        }
                    },
                    series: [60],
                    colors: ["#1badcb"],
                    stroke: {
                        dashArray: 2
                    },
                    plotOptions: {
                        radialBar: {
                            startAngle: -135,
                            endAngle: 135,
                            track: {
                                background: '#f1f1f1',
                                startAngle: -135,
                                endAngle: 135,
                            },
                            hollow: {
                                size: '30%',
                                background: 'transparent',
                            },
                            dataLabels: {
                                show: true,
                                name: {
                                    show: false,
                                },
                                value: {
                                    show: false,
                                },
                                total: {
                                    show: true,
                                    fontSize: '20px',
                                    color: '#000',
                                    label: '91.4 %',
                                }
                            }
                        }
                    },
                    fill: {
                        type: "solid",
                    },
                    tooltip: {
                        enabled: true,
                        fillSeriesColor: false,
                        theme: "dark"
                    },
                    responsive: [{
                        breakpoint: 426,
                        options: {
                            chart: {
                                offsetX: -15,
                            }
                        }
                    }],
                    labels: ["Progress"]
                };
                new ApexCharts(document.querySelector("#sales-prediction"), option_Sales_Prediction);
            });
        }
    })
}
else if (document.getElementById('database_ag')) {
    $.ajax({
        method: "POST",
        url: "/database_ag",
        daata: {value:1},
        success: function(result){
            var total_date = []
            var index = 0
            for (var d = 0; d < result.data.length; d++) {
                if (d == 0) {
                    total_date.push({ 'date': result.data[d]._get, "count": 1 })
                } else {
                    if (total_date[index].date == result.data[d]._get) {
                        total_date[index].count++
                    } else {
                        index++
                        total_date.push({ 'date': result.data[d]._get, "count": 0 })
                        if (total_date[index].date == result.data[d]._get) {
                            total_date[index].count++
                        }
                    }
                }
            }
            $(function () {
                var _date_ = []
                var _count_ = []
                for (d in total_date){
                   _date_.push(convert_datetime(new Date(total_date[d].date), total_date[d].date))
                    _count_.push(total_date[d].count)
                }
                "use strict";
                // -----------------------------------------------------------------------
                // Sales of the Month
                // -----------------------------------------------------------------------
                var option_Sales_of_the_Month = {
                    series: [9, 3, 2, 2],
                    labels: ["Item A", "Item B", "Item C", "Item D"],
                    chart: {
                        type: 'donut',
                        height: 280,
                        fontFamily: 'Rubik,sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        width: 0,
                    },
                    plotOptions: {
                        pie: {
                            expandOnClick: true,
                            donut: {
                                size: '88',
                                labels: {
                                    show: false,
                                    name: {
                                        show: true,
                                        offsetY: 7,
        
                                    },
                                    value: {
                                        show: false,
                                    },
                                    total: {
                                        show: false,
                                        color: '#a1aab2',
                                        fontSize: '13px',
                                        label: 'Our Visitor',
                                    }
                                },
                            },
                        },
                    },
                    colors: ['#edf1f5', '#009efb', '#55ce63', '#745af2'],
                    tooltip: {
                        show: true,
                        fillSeriesColor: false,
                    },
                    legend: {
                        show: false
                    },
                };
                new ApexCharts(document.querySelector("#sales-of-the-month"), option_Sales_of_the_Month);
                // -----------------------------------------------------------------------
                // Revenue Statistics
                // -----------------------------------------------------------------------
                var Revenue_Statistics = {
                    series: [
                        {
                            name: "จำนวนทั้งหมด",
                            data: _count_,
                        },
                    ],
                    chart: {
                        fontFamily: 'Rubik,sans-serif',
                        height: 350,
                        type: "area",
                        toolbar: {
                            show: false,
                        },
                    },
                    fill: {
                        type: 'solid',
                        opacity: 0.2,
                        colors: ["#FF4500"],
                    },
                    grid: {
                        show: true,
                        borderColor: "rgba(0,0,0,0.1)",
                        strokeDashArray: 3,
                        xaxis: {
                            lines: {
                                show: true
                            }
                        },
                    },
                    colors: ["#FF4500"],
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        curve: "smooth",
                        width: 1,
                        colors: ["#FF4500"],
                    },
                    markers: {
                        size: 3,
                        colors: ["#FF4500"],
                        strokeColors: "transparent",
                    },
                    xaxis: {
                        axisBorder: {
                            show: true,
                        },
                        axisTicks: {
                            show: true,
                        },
                        categories: _date_,
                        labels: {
                            style: {
                                colors: "#a1aab2",
                            },
                        },
                    },
                    yaxis: {
                        tickAmount: 9,
                        labels: {
                            style: {
                                colors: "#a1aab2",
                            },
                        },
                    },
                    tooltip: {
                        x: {
                            format: "dd/MM/yy HH:mm",
                        },
                        theme: "dark",
                    },
                    legend: {
                        show: false,
                    },
                };
                var chartRevnue = new ApexCharts(document.querySelector("#revenue-statistics"), Revenue_Statistics);
                chartRevnue.render();
                // ----------------------------------------------------------------------- 
                // Sales difference
                // -----------------------------------------------------------------------
                var option_Sales_Difference = {
                    series: [35, 15, 10],
                    labels: ["", "", ""],
                    chart: {
                        type: 'donut',
                        height: 140,
                        fontFamily: 'Rubik,sans-serif',
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        width: 0,
                    },
        
                    plotOptions: {
                        pie: {
                            expandOnClick: true,
                            donut: {
                                size: '65%',
                                labels: {
                                    show: false,
                                    name: {
                                        show: true,
                                        offsetY: 7,
        
                                    },
                                    value: {
                                        show: false,
                                    },
                                    total: {
                                        show: false,
                                        color: '#a1aab2',
                                        fontSize: '13px',
                                        label: 'Visits',
                                    }
                                },
                            },
                        },
                    },
                    colors: ['#39c449', '#ebf3f5', '#009efb'],
                    tooltip: {
                        show: true,
                        fillSeriesColor: false,
                    },
                    legend: {
                        show: false
                    },
                    responsive: [{
                        breakpoint: 426,
                        options: {
                            chart: {
                                height: 130,
                                offsetY: 10,
                                offsetX: -35,
                                width: 200
                            },
                        }
                    }]
                };
                new ApexCharts(document.querySelector("#sales-difference"), option_Sales_Difference);
                // ----------------------------------------------------------------------- 
                // Sales Prediction
                // ----------------------------------------------------------------------- 
                var option_Sales_Prediction = {
                    chart: {
                        height: 170,
                        type: "radialBar",
                        fontFamily: 'Rubik,sans-serif',
                        spacingTop: 0,
                        spacingBottom: 0,
                        spacingLeft: 0,
                        spacingRight: 0,
                        offsetY: -30,
                        sparkline: {
                            enabled: true
                        }
                    },
                    series: [60],
                    colors: ["#1badcb"],
                    stroke: {
                        dashArray: 2
                    },
                    plotOptions: {
                        radialBar: {
                            startAngle: -135,
                            endAngle: 135,
                            track: {
                                background: '#f1f1f1',
                                startAngle: -135,
                                endAngle: 135,
                            },
                            hollow: {
                                size: '30%',
                                background: 'transparent',
                            },
                            dataLabels: {
                                show: true,
                                name: {
                                    show: false,
                                },
                                value: {
                                    show: false,
                                },
                                total: {
                                    show: true,
                                    fontSize: '20px',
                                    color: '#000',
                                    label: '91.4 %',
                                }
                            }
                        }
                    },
                    fill: {
                        type: "solid",
                    },
                    tooltip: {
                        enabled: true,
                        fillSeriesColor: false,
                        theme: "dark"
                    },
                    responsive: [{
                        breakpoint: 426,
                        options: {
                            chart: {
                                offsetX: -15,
                            }
                        }
                    }],
                    labels: ["Progress"]
                };
                new ApexCharts(document.querySelector("#sales-prediction"), option_Sales_Prediction);
            });
        }
    })
} 
else if (document.getElementById('a-sniffer')){
    $.post('/agent_sniffer/charts',{value: "@lltr@@gentSn1fferCh@rt"}).done(function(result){
        $(function () {
            "use strict";
            // -----------------------------------------------------------------------
            // Revenue Statistics
            // -----------------------------------------------------------------------
            var Revenue_Statistics = {
                series: [
                    {
                        name: "จำนวนทั้งหมด",
                        data: result.len,
                    },
                ],
                chart: {
                    fontFamily: 'Rubik,sans-serif',
                    height: 350,
                    type: "area",
                    toolbar: {
                        show: false,
                    },
                },
                fill: {
                    type: 'solid',
                    opacity: 0.2,
                    colors: ["#FF4500"],
                },
                grid: {
                    show: true,
                    borderColor: "rgba(0,0,0,0.1)",
                    strokeDashArray: 3,
                    xaxis: {
                        lines: {
                            show: true
                        }
                    },
                },
                colors: ["#FF4500"],
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: "smooth",
                    width: 1,
                    colors: ["#FF4500"],
                },
                markers: {
                    size: 3,
                    colors: ["#FF4500"],
                    strokeColors: "transparent",
                },
                xaxis: {
                    axisBorder: {
                        show: true,
                    },
                    axisTicks: {
                        show: true,
                    },
                    categories: result.data,
                    labels: {
                        style: {
                            colors: "#a1aab2",
                        },
                    },
                },
                yaxis: {
                    tickAmount: 9,
                    labels: {
                        style: {
                            colors: "#a1aab2",
                        },
                    },
                },
                tooltip: {
                    x: {
                        format: "dd/MM/yy HH:mm",
                    },
                    theme: "dark",
                },
                legend: {
                    show: false,
                },
            };
            new ApexCharts(document.querySelector("#revenue-statistics"), Revenue_Statistics).render();
        });
    })
}
