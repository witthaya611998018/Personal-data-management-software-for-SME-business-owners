$.ajax({
    url: '/micro_block?',
    method: "POST",
    data: { get_param: 1 },
    success: function (result) {
        // var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
        let name_blocks = []
        let list_blocks = []
        let use_color = []
        for (var i = 0; i < result.total_run_chain; i++) {
            use_color.push('#' + Math.floor(Math.random() * 16777215).toString(16))
        }
        for (var i = 0; i < result.blocks.length; i++) {
            name_blocks.push(result.blocks[i].name)
            list_blocks.push((result.blocks[i].list).length)
        }
        var check = 0
        for (var i=0; i < result.status_chain.length;i++) {
            if (result.status_chain[i].status == "True") {
                check = 1;
            } else {
                check = 0;
                break;
            }
        }
        "use strict";
        if (check == 1) {
            // -----------------------------------------------------------------------
            // Revenue Statistics
            // -----------------------------------------------------------------------
            var Revenue_Statistics = {
                series:
                    [
                        {
                            name: "จำนวนทั้งหมด",
                            data: list_blocks,
                        },
                    ]
                ,
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
                    colors: ["#778899"],
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
                colors: ["#FF0000"],
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: "smooth",
                    width: 1,
                    colors: ["#00008B"],
                },
                markers: {
                    size: 3,
                    colors: ["#FF0000"],
                    strokeColors: "transparent",
                },
                xaxis: {
                    axisBorder: {
                        show: true,
                    },
                    axisTicks: {
                        show: true,
                    },
                    categories: name_blocks,
                    // ['0', '4', '8', '12', '16', '20', '24', '30'],
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
            new ApexCharts(document.querySelector("#revenue"), Revenue_Statistics).render();
        } else {
            // -----------------------------------------------------------------------
            // Revenue Statistics
            // -----------------------------------------------------------------------
            var Revenue_Statistics = {
                series:
                    [
                        {
                            name: "จำนวนทั้งหมด",
                            data: list_blocks,
                        },
                    ]
                ,
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
                    colors: ["#FF0000"],
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
                colors: ["#778899"],
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: "smooth",
                    width: 1,
                    colors: ["#00008B"],
                },
                markers: {
                    size: 3,
                    colors: ["#778899"],
                    strokeColors: "transparent",
                },
                xaxis: {
                    axisBorder: {
                        show: true,
                    },
                    axisTicks: {
                        show: true,
                    },
                    categories: name_blocks,
                    // ['0', '4', '8', '12', '16', '20', '24', '30'],
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
            new ApexCharts(document.querySelector("#revenue"), Revenue_Statistics).render();
        }
    }
})
