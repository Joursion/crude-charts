const pie = new Pie({
  canvasId: 'pie',
  cBackgroundColor: '#fff',
  cHeight: 500,
  cWidth: 500,
  tagW: 40,
  tagH: 20,
  tipLine: 20,
  pieY: 250,
  tagFont: 'normal 13px Arial',
  data: [
    {
      color: '#60b794',
      value: 10,
      text: 'Apple'
    },
    {
      color: '#616afb',
      value: 30,
      text: 'Organge'
    },
    {
      color: '#ff6565',
      value: 250,
      text: 'watermelon'
    }
  ]
});

pie.draw();
