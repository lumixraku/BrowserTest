var unit = 'rem';
function process(periodId, percents, canvasWidth, canvasHeight, lineWidth) {
  var canvasSelector = '.canvas-wrapper.' + periodId +' canvas';
  var canvasWidth = canvasWidth || 320;
  var canvasHeight = canvasHeight || 320;
  var lineWidth = lineWidth || 20;
  var canvas = document.querySelector(canvasSelector);
  // var canvasvalue = canvas.getAttribute("value");
  var context = canvas.getContext('2d');
  var scale = window.devicePixelRatio;
  var center = [canvasWidth / 2 * scale, canvasHeight / 2 * scale];
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  lineWidth = lineWidth * scale;

  // 画进度(红色)
  // context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
  var startAngle = 0;
  var endAngle = 0;
  var colorIndex  = 0;
  while (percent = percents.shift()) {
    endAngle =  startAngle + percent * 2 * Math.PI
    context.beginPath();
    context.arc(center[0], center[1], center[0] - lineWidth, startAngle, endAngle, false);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors[(colorIndex++)%colors.length];
    context.stroke();
    context.closePath();
    startAngle = endAngle;
  }

}
// process("procanvas", [0.3, 0.4, 0.1, 0.1, 0.1], 320, 320, 12);

module.exports = process;