$(function() {
    "use strict";

    var stackedareaChart = echarts.init(document.getElementById('stacked-area'));
    var option = {

        grid: {
            left: '1%',
            right: '2%',
            bottom: '3%',
            containLabel: true
        },
        tooltip: {
            trigger: 'axis'
        },
        // Add legend
        legend: {
            data: ['Elite admin']
        },

        // Add custom colors
        color: ['#212529', '#7460ee', '#f62d51', '#36bea6', '#009efb'],

        // Enable drag recalculate
        calculable: true,

        // Hirozontal axis
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: [
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
            ]
        }],

        // Vertical axis
        yAxis: [{
            type: 'value'
        }],

        // Add series
        series: [{
                    name: 'Elite admin',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    data: [120, 132, 101, 5000, 90, 230, 210]
                },

            ]
            // Add series

    };
    stackedareaChart.setOption(option);


});