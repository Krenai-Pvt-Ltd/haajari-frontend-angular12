/**
 * Theme: Dastone - Responsive Bootstrap 4 Admin Dashboard
 * Author: Mannatthemes
 * Project Dashboard Js
 */

 var ctx2 = document.getElementById('bar').getContext('2d');
 var myChart = new Chart(ctx2, {
     type: 'bar',
     data: {
         labels: ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
         datasets: [{
             label: 'Monthly Report',
             data: [12, 19, 13, 9, 12, 11, 12, 19, 13, 9, 12, 11],
             borderRadius: 100,
             borderSkipped: false,
             backgroundColor: '#367de4',
             borderColor: '#367de4',
             borderWidth: 1,
             indexAxis: 'x',
             barThickness: 15,
             grouped: true,
             maxBarThickness: 9,  
             barPercentage: 50
         },
         {
            label: 'Monthly Report',
            data: [8, 12, 15, 11, 8, 14, 16, 13, 10, 7, 19, 16],
            borderRadius: 100,
            borderSkipped: false,
            backgroundColor: '#dbe8fa',
            borderColor: '#dbe8fa',
            borderWidth: 1,
            indexAxis: 'x',
            barThickness: 15,
            grouped: true,
            maxBarThickness: 9,            
        }]
     },
    
     options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: 'top',
            labels: {                   
                color: '#7c8ea7',
            }
          },
          title: {
            display: false,
            text: 'Chart.js Bar Chart'
          }
        },
        scales: {            
            y: {
                beginAtZero: true,
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return '$' + value;
                    },
                    color: '#7c8ea7',
                },               
                grid: {
                    drawBorder: 'border',
                    color: 'rgba(132, 145, 183, 0.15)',
                    borderDash: [3],
                    borderColor: 'rgba(132, 145, 183, 0.15)',
                } ,
                beginAtZero: true,
            },
            x: {   
              ticks: {
                color: '#7c8ea7',
              },            
                grid: {
                    display: false,
                    color: 'rgba(132, 145, 183, 0.09)',
                    borderDash: [3],
                    borderColor: 'rgba(132, 145, 183, 0.09)',
                }    
            }            
         },
    },
 });

// Radial

var options = {
  chart: {
    type: 'radialBar',
    height: 265,
    dropShadow: {
      enabled: true,
      top: 5,
      left: 0,
      bottom: 0,
      right: 0,
      blur: 5,
      color: '#45404a2e',
      opacity: 0.35
    },
  },
  plotOptions: {
    radialBar: {
      offsetY: -10,
      startAngle: 0,
      endAngle: 270,
      hollow: {
        margin: 5,
        size: '50%',
        background: 'transparent',  
      },
      track: {
        show: false,
      },
      dataLabels: {
        name: {
            fontSize: '18px',
        },
        value: {
            fontSize: '16px',
            color: '#50649c',
        },
        
      }
    },
  },
  colors: ["#2a76f4","rgba(42, 118, 244, .5)","rgba(42, 118, 244, .18)"],
  stroke: {
    lineCap: 'round'
  },
  series: [71, 63, 100],
  labels: ['Completed', 'Active', 'Assigned'],
  legend: {
    show: true,
    floating: true,
    position: 'left',
    offsetX: -10,
    offsetY: 0,
  },
  responsive: [{
      breakpoint: 480,
      options: {
          legend: {
              show: true,
              floating: true,
              position: 'left',
              offsetX: 10,
              offsetY: 0,
          }
      }
  }]
}


var chart = new ApexCharts(
  document.querySelector("#task_status"),
  options
);

chart.render();

