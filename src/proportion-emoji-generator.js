// Taken from http://stackoverflow.com/a/2998874/760389
function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

module.exports = function(proportion) {
  const scale = 5;

  proportion = Math.max(proportion, 0);
  proportion = Math.min(proportion, 1);

  const percent = proportion*100;
  const closestPercent = Math.round(percent/scale)*scale;

  return `:sb-${zeroPad(closestPercent, 2)}:`;
}
