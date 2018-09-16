// Inspired by:
// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/#demo-simple
// https://hacks.mozilla.org/2009/06/pop-art-video/
// http://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
// https://github.com/demihe/HTML5-Canvas-Paint-Application
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

const numBoards = 6
const context = new Array(numBoards)
const colours = {
  dark: ['#201f7c', '#ec027b', '#e9061d', '#7d4292', '#212025', '#ed6c03'],
  light: ['#8cb21d', '#fefb00', '#f693c3', '#7dbbf4', '#fcfafb', '#fcfea8'],
  background: ['#fefa08', '#0279ea', '#281f80', '#ee8609', '#e30f21', '#90b70b'],
}

// Initialize mouse coordinates to (0, 0)
let mouse = {x: 0, y: 0}
let shade = 'dark'
let radius = 5

// Paint
const paint = () => {
  context.forEach(ctx => {
    const id = ctx.canvas.dataset.id
    const colour = colours[shade][id]

    ctx.lineTo(mouse.x, mouse.y)
    ctx.lineWidth = radius
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = colour
    ctx.stroke()
  })
}

// User clicks down on canvas to trigger paint
const handleMouseDown = e => {
  context.forEach(ctx => {
    ctx.beginPath()
    ctx.moveTo(mouse.x, mouse.y)
  })
  e.target.addEventListener('mousemove', paint, false)
}

// Find mouse coordinates relative to canvas
const handleMouseMove = e => {
  mouse.x = e.pageX - e.target.offsetLeft
  mouse.y = e.pageY - e.target.offsetTop
}

// When mouse lifts up, line stops painting
const handleMouseUp = e => {
  e.target.removeEventListener('mousemove', paint, false)
}

// When mouse leaves canvas, line stops painting
const handleMouseOut = e => {
  e.target.removeEventListener('mousemove', paint, false)
}

// Convert touchstart event to a mousedown event
const handleTouchStart = e => {
  const canvas = e.target
  const touch = e.touches[0]

  // Convert touch position to mouse position
  const rect = canvas.getBoundingClientRect()
  mouse.x = touch.clientX - rect.left
  mouse.y = touch.clientY - rect.top

  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  canvas.dispatchEvent(mouseEvent)
}

// Convert touchmove event to a mousemove event
const handleTouchMove = e => {
  const canvas = e.target
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  canvas.dispatchEvent(mouseEvent)
}

// Convert touchend event to a mouseup event
const handleTouchEnd = e => {
  const canvas = e.target
  const mouseEvent = new MouseEvent('mouseup', {})
  canvas.dispatchEvent(mouseEvent)
}

// Set the background colour
const clearCanvas = () => {
  context.forEach(ctx => {
    const id = ctx.canvas.dataset.id
    ctx.fillStyle = colours.background[id]
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  })
}

// Set the shade of the brush
const handleShadeClick = e => {
  if (e.target.tagName === 'BUTTON') {
    shade = e.target.dataset.shade
  }
}

// Set the size of the brush
const handleSizeClick = e => {
  if (e.target.tagName === 'BUTTON') {
    radius = e.target.dataset.radius
  }
}


// Load the contexts into memory and add event listeners to the canvases
const prepareCanvases = () => {
  for (id = 0; id < numBoards; id++) {
    const canvas = document.querySelector(`canvas[data-id="${id}"]`)
    const ctx = canvas.getContext('2d')
    context[id] = ctx

    // Set size of canvas
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Set the background colour
    ctx.fillStyle = colours.background[id]
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Event listeners that will trigger the paint functions
    canvas.addEventListener('mousedown', handleMouseDown, false)
    canvas.addEventListener('mousemove', handleMouseMove, false)
    canvas.addEventListener('mouseup', handleMouseUp, false)
    canvas.addEventListener('mouseout', handleMouseOut, false)
    canvas.addEventListener('touchstart', handleTouchStart, false)
    canvas.addEventListener('touchmove', handleTouchMove, false)
    canvas.addEventListener('touchend', handleTouchEnd, false)
  }
}

const prepareToolbar = () => {
  document.querySelector('#clear').addEventListener('click', clearCanvas)
  document.querySelector('#shades').addEventListener('click', handleShadeClick)
  document.querySelector('#sizes').addEventListener('click', handleSizeClick)
}

prepareCanvases()
prepareToolbar()
