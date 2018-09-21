// Config constants
const NUM_BOARDS = 6
const MAX_STATES = 10
const COLOURS = {
  dark: ['#201f7c', '#ec027b', '#e9061d', '#7d4292', '#404b9c', '#ed6c03'],
  light: ['#8cb21d', '#fefb00', '#f693c3', '#7dbbf4', '#fcfafb', '#fcfea8'],
  background: ['#fefa08', '#0279ea', '#281f80', '#ee8609', '#e30f21', '#90b70b'],
}
const IDLE_TIMEOUT = 60 // 60 seconds

// State constants
const context = new Array(NUM_BOARDS)
const history = []

// Initialize mouse coordinates to (0, 0)
let mouse = {x: 0, y: 0}
let isPaint = false
let shade = 'dark'
let radius = 20
let idleTime = 0
let idleInterval

// Paint
const paint = () => {
  idleTime = 0
  isPaint = true
  context.forEach(ctx => {
    const id = ctx.canvas.dataset.id
    const colour = COLOURS[shade][id]

    ctx.lineTo(mouse.x, mouse.y)
    ctx.lineWidth = radius
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = colour
    ctx.stroke()
  })
}

// Save state
const saveState = () => {
  const currentState = context.map(
    ctx => ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  )
  history.unshift(currentState)
  if (history.length > MAX_STATES) {
    history.length = MAX_STATES
  }

  handleStateChange()
  console.log('Saved state')
  console.log('Num states: ' + history.length)
}

// Undo state
const undoState = () => {
  history.shift()
  const previousState = history[0]
  context.forEach(ctx => {
    const id = ctx.canvas.dataset.id
    ctx.putImageData(previousState[id], 0, 0)
  })

  handleStateChange()
  console.log('Undo state')
  console.log('Num states: ' + history.length)
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
  if (isPaint) {
    saveState()
  }
  isPaint = false
  e.target.removeEventListener('mousemove', paint, false)
}

// When mouse leaves canvas, line stops painting
const handleMouseOut = e => {
  if (isPaint) {
    saveState()
  }
  isPaint = false
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

// Handle undo click
const handleUndo = () => {
  if (history.length > 1) {
    undoState()
  }
}

// Handle state change
const handleStateChange = () => {
  if (history.length > 1) {
    document.getElementById('undo').classList.remove('disabled')
  } else {
    document.getElementById('undo').classList.add('disabled')
  }
}

// Set the background colour
const handleClearCanvas = (clearHistory = false) => {
  history.length = 0
  context.forEach(ctx => {
    const id = ctx.canvas.dataset.id
    ctx.fillStyle = COLOURS.background[id]
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  })
  if (clearHistory) {
    MicroModal.show('welcome-modal', {
      onShow: () => clearInterval(idleInterval),
      onClose: startTimer,
      awaitCloseAnimation: true,
    })
  }
  saveState()
}

// Set the shade of the brush
const handleShadeClick = e => {
  if (e.target.tagName === 'IMG') {
    document.querySelector('#shades .active').classList.remove('active')
    shade = e.target.dataset.shade
    e.target.classList.add('active')
  }
}

// Set the size of the brush
const handleSizeClick = e => {
  if (e.target.tagName === 'IMG') {
      document.querySelector('#sizes .active').classList.remove('active')
      radius = e.target.dataset.radius
      e.target.classList.add('active')
  }
}

// show help modal
const handleHelp = () => {
  MicroModal.show('welcome-modal', {awaitCloseAnimation: true})
}

// change background
const handleBackgroundClick = e => {
    if (e.target.tagName === 'IMG') {
      document.querySelector('#backgrounds .active').classList.remove('active')
      let cv = document.querySelectorAll('.canvas')
      cv.forEach(c => (
        c.style.backgroundImage = `url("${e.target.dataset.bg}")`
      ))
      e.target.classList.add('active')
    }
}

// Load the contexts into memory and add event listeners to the canvases
const prepareCanvases = () => {
  for (let id = 0; id < NUM_BOARDS; id++) {
    const canvas = document.querySelector(`canvas[data-id="${id}"]`)
    const ctx = canvas.getContext('2d')
    context[id] = ctx

    // Set size of canvas
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Set the background colour
    ctx.fillStyle = COLOURS.background[id]
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
  document.querySelector('#clear').addEventListener('click', () => {handleClearCanvas(false)})
  document.querySelector('#undo').addEventListener('click', handleUndo)
  document.querySelector('#shades').addEventListener('click', handleShadeClick)
  document.querySelector('#sizes').addEventListener('click', handleSizeClick)
  document.querySelector('#help').addEventListener('click', handleHelp)
  document.querySelector('#backgrounds').addEventListener('click', handleBackgroundClick)
}

const prepareModals = () => {
  document.getElementById('reset-canvas').addEventListener('click', evt => {
    handleClearCanvas(true)
    clearInterval(idleInterval)
  })
  MicroModal.show('welcome-modal', {
    onShow: () => clearInterval(idleInterval),
    onClose: startTimer,
    awaitCloseAnimation: true,
  })
}

const startTimer = () => {
  idleTime = 0
  clearInterval(idleInterval)
  idleInterval = setInterval(() => {
    idleTime++
    console.log(idleTime)
    if (idleTime > IDLE_TIMEOUT) {
      const inactivityModal = document.getElementById('inactivity-modal')
      if (inactivityModal.classList.contains('is-open')) {
        // User has not dismissed the inactivity modal,
        // therefore clear the canvas
        MicroModal.close('inactivity-modal')
        handleClearCanvas(true)
      } else {
        MicroModal.show('inactivity-modal', {
          onShow: () => {
            // Start a new timer when the inactivity modal is shown
            clearInterval(idleInterval)
            startTimer()
          },
          onClose: () => {
            const welcomeModal = document.getElementById('welcome-modal')
            if (!welcomeModal.classList.contains('is-open')) {
              // Start the timer if the welcome modal isn't open
              startTimer()
            }
          },
          awaitCloseAnimation: true
        })
      }
    }
  }, 1000) // increment the idle time every second
}

prepareCanvases()
saveState()
prepareToolbar()
prepareModals()
