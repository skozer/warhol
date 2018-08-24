// Inspired by:
// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/#demo-simple
// https://hacks.mozilla.org/2009/06/pop-art-video/
// http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html

const numBoards = 6
const context = new Array(numBoards)
const colours = {
  dark: ['#201f7c', '#ec027b', '#e9061d', '#7d4292', '#212025', '#ed6c03'],
  light: ['#8cb21d', '#fefb00', '#f693c3', '#7dbbf4', '#fcfafb', '#fcfea8'],
  background: ['#fefa08', '#0279ea', '#281f80', '#ee8609', '#e30f21', '#90b70b'],
}

// Holds the current state of the entire artwork
let clickX = new Array()
let clickY = new Array()
let clickDrag = new Array()
let clickShade = new Array()
let clickRadius = new Array()

// Holds the current state
let curShade = 'dark'
let curRadius = 5
let paint = false

const prepareCanvas = canvasId => {
  const selector = $('canvas[data-id="' + canvasId + '"]')
  const ctx = selector[0].getContext('2d')
  context[canvasId] = ctx

  // Set the background colour
  ctx.fillStyle = colours.background[canvasId]
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Set up touch events for mobile, etc
  ctx.canvas.addEventListener(
    'touchstart',
    function(e) {
      mousePos = getTouchPos(ctx.canvas, e)
      var touch = e.touches[0]
      var mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
      ctx.canvas.dispatchEvent(mouseEvent)
    },
    false
  )
  ctx.canvas.addEventListener(
    'touchend',
    function(e) {
      var mouseEvent = new MouseEvent('mouseup', {})
      ctx.canvas.dispatchEvent(mouseEvent)
    },
    false
  )
  ctx.canvas.addEventListener(
    'touchmove',
    function(e) {
      var touch = e.touches[0]
      var mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
      ctx.canvas.dispatchEvent(mouseEvent)
    },
    false
  )

  // Get the position of a touch relative to the canvas
  function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect()
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top,
    }
  }

  // Add mouse events
  selector.mousedown(e => {
    // Mouse down location
    const mouseX = e.pageX - e.target.offsetLeft
    const mouseY = e.pageY - e.target.offsetTop

    paint = true
    addClick(mouseX, mouseY, false)
    redraw()
  })

  selector.mousemove(e => {
    if (paint) {
      addClick(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, true)
      redraw()
    }
  })

  selector.mouseup(() => {
    paint = false
    redraw()
  })

  selector.mouseleave(() => {
    paint = false
  })
}

const addClick = (x, y, dragging) => {
  clickX.push(x)
  clickY.push(y)
  clickDrag.push(dragging)
  clickShade.push(curShade)
  clickRadius.push(curRadius)
}

const clearCanvas = () => {
  context.forEach(ctx => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Set the background colour
    ctx.fillStyle = colours.background[ctx.canvas.dataset.id]
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  })
}

const redraw = () => {
  clearCanvas()

  context.forEach(ctx => {
    ctx.lineJoin = 'round'
  })

  for (let i = 0; i < clickX.length; i++) {
    context.forEach(ctx => {
      const canvasId = ctx.canvas.dataset.id
      const shade = clickShade[i]
      const strokeColour = colours[shade][canvasId]

      ctx.beginPath()
      if (clickDrag[i] && i) {
        ctx.moveTo(clickX[i - 1], clickY[i - 1])
      } else {
        ctx.moveTo(clickX[i] - 1, clickY[i])
      }
      ctx.lineTo(clickX[i], clickY[i])
      ctx.closePath()
      ctx.strokeStyle = strokeColour
      ctx.lineWidth = clickRadius[i]
      ctx.stroke()
    })
  }
}

const main = () => {
  for (let i = 0; i < numBoards; i++) {
    prepareCanvas(i)
  }

  $('#shades button').click(e => {
    curShade = e.target.dataset.shade
  })

  $('#sizes button').click(e => {
    curRadius = e.target.dataset.radius
  })

  $('#clearCanvas').click(() => {
    clickX = new Array()
    clickY = new Array()
    clickDrag = new Array()
    clickShade = new Array()
    clickRadius = new Array()
    clearCanvas()
  })
}

main()
