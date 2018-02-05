// Mostly copied and edited
  // - https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/

'use strict'
// >> variables
const canvas = document.getElementById('canvas')
const context = canvas.getContext("webgl")

// >> Functions
const draw = {}

draw.background = function () {
  context.clearColor(0.0, 0.0, 0.0, 0.75);
  context.clear(context.COLOR_BUFFER_BIT);
}

// >> Events
window.onload = function () {
  draw.background()
}
