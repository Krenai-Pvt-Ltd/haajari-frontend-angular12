/**
 * Theme: Dastyle - Responsive Bootstrap 4 Admin Dashboard
 * Author: Mannatthemes
 * Ecommerce Dashboard Js
 */


var options = {
    chart: {
      height: 340,
      type: 'bar',
      toolbar: {
        show: false
      },
    },
    colors: ['#2a76f4'],
    dataLabels: {
        enabled: false
    },
    plotOptions: {
      bar: {
          horizontal: false,
          columnWidth: '30%',
      },
    },
    stroke: {
        show: false,
        width: 2,
    },
    series: [{
        name: 'Income',
        data: [0, 160, 100, 210, 145, 400, 155, 210, 120, 275, 110, 200, 100, 90, 220, 100, 180, 140, 315, 130, 105, 165, 120, 160, 100, 210, 145, 400, 155, 210, 120]
    }],
    labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
     "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", 
     "24", "25", "26", "27", "28", "29", "30", "31",],
    
    yaxis: {
      labels: {      
        offsetX: -12,
        offsetY: 0,      
      }
    },
    grid: {
      borderColor: '#e0e6ed',
      strokeDashArray: 4,
      xaxis: {
          lines: {
              show: false
          }
      },   
      yaxis: {
          lines: {
              show: true,
          }
      },
    }, 
    legend: {
     show: false
    },
    tooltip: {
      marker: {
        show: true,
      },
      x: {
        show: false,
      }
    },
    yaxis: {
        labels: {
            formatter: function (value) {
                return "$" + value ;
            }
        },
    },
  };
  
  var chart = new ApexCharts(document.querySelector("#Revenu_Status"), options);
  chart.render();

// Bar chart

  var options = {
    chart: {
      height: 100,
      type: 'bar',
      toolbar: {
        show: false
      },
    },
    plotOptions: {
      bar: {
          horizontal: false,
          columnWidth: '50%',
      },
    },
    colors: ['#e5effe'],
    dataLabels: {
        enabled: false
    },
    
    
    stroke: {
        show: true,
        width: 2,
    },
    series: [{
        name: 'Income',
        data: [0, 160, 100, 210, 145, 400, 155, 210, 120, 275, 110, 200, 100, 90, 220, 100, 180, 140, 315, 130, 105, 165, 120, 160, 100, 210, 145, 400, 155, 210, 120]
    }],
    labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
     "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", 
     "24", "25", "26", "27", "28", "29", "30", "31",],
    
    xaxis: {
      labels: {  
        show: false,  
      },

      axisTicks: {
        show: false,
      },
    },
    grid: {
      borderColor: '#e5effe',
      strokeDashArray: 2,
      xaxis: {
          lines: {
              show: false,
          },
      },   
      yaxis: {
          lines: {
              show: false,
          },
      },
    }, 
    legend: {
     show: false
    },
    tooltip: {
      marker: {
        show: true,
      },
      x: {
        show: false,
      }
    },
    yaxis: {
        labels: {
          show: false,
            formatter: function (value) {
                return "$" + value ;
            },
            offsetX: -12,
            offsetY: 0, 
        },
    },
    fill: {
      opacity: 1,
    },
  };
  
  var chart = new ApexCharts(document.querySelector("#Revenu_Status_bar"), options);
  chart.render();
