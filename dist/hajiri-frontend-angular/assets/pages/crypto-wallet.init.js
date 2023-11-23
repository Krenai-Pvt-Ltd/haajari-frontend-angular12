/**
 * Theme: Unikit - Responsive Bootstrap 4 Admin Dashboard
 * Author: Mannatthemes
 * Wallet Js
 */


 var wallet_kra = {
    
  chart: {
      type: 'area',
      height: 60,
      sparkline: {
          enabled: true
      },
  },
  stroke: {
      curve: 'smooth',
      width: 2
    },
  fill: {
      opacity: 1,
      gradient: {
        shade: '#2c77f4',
        type: "horizontal",
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 0.1,
        opacityTo: 0.1,
        stops: [0, 80, 100],
        colorStops: []
    },
  },
  series: [{
    data: [4, 8, 5, 10, 4, 16, 5, 11, 6, 11, 30, 10, 13, 4, 6, 3, 6]
  }],
  yaxis: {
      min: 0
  },
  colors: ['#2c77f4'],
  tooltip: {
    show: false,
  }
}
new ApexCharts(document.querySelector("#wallet_kra"), wallet_kra).render();


var wallet_coi = {
    
  chart: {
      type: 'area',
      height: 60,
      sparkline: {
          enabled: true
      },
  },
  stroke: {
      curve: 'smooth',
      width: 2
    },
  fill: {
      opacity: 1,
      gradient: {
        shade: '#fdb5c8',
        type: "horizontal",
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 0.1,
        opacityTo: 0.1,
        stops: [0, 80, 100],
        colorStops: []
    },
  },
  series: [{
    data: [4, 8, 5, 10, 4, 25, 5, 11, 6, 11, 5, 10, 3, 14, 6, 8, 6]
  }],
  yaxis: {
      min: 0
  },
  colors: ['#2c77f4'],
}
new ApexCharts(document.querySelector("#wallet_coi"), wallet_coi).render();