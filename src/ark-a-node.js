/* global screen */
const { initAudio } = require('./helpers/sounds')
const { initCanvas, writeText } = require('./helpers/drawing')
const { generateWall, play } = require('./helpers/game')

const getOptions = (selector) => {
  const game = document.querySelector(selector)

  let screenWidth = game.clientWidth
  let screenHeight = screenWidth * 9 / 16

  if (screenHeight > game.clientHeight) {
    screenHeight = game.clientHeight
    screenWidth = screenHeight * 16 / 9
  }

  return {
    screenWidth,
    screenHeight,
    wallWidth: 7,
    wallHeight: 6,

    fontSize: 24 * screenHeight / 480,
    speed: Math.ceil(10 * 480 / screenHeight),
    ballSize: 7 * screenHeight / 480,
    wallPieceHeight: 10 * screenHeight / 240,
    padWidth: 120 * screenWidth / 640,
    padHeight: 15 * screenHeight / 480,
    wallColors: [
      'black',
      'indianred',
      'seagreen',
      'dodgerblue',
      'orange',
      'mediumpurple',
      'gold',
      'whitesmoke'
    ]
  }
}

function start (selector) {
  const options = getOptions(selector)

  const canvas = initCanvas(selector, options.screenWidth, options.screenHeight)
  const ctx = canvas.getContext('2d')

  const status = {
    status: 'gameover',
    mouseX: 0
  }

  const beginGame = () => {
    initAudio()

    switch (status.status) {
      case 'victory':
      case 'gameover': {
        status.status = 'ready'
        break
      }

      case 'ready': {
        status.status = 'playing'
        canvas.requestPointerLock()
        return
      }

      case 'playing': return

      default:
    }

    canvas.requestPointerLock()
    const wall = generateWall(options.wallWidth, options.wallHeight)

    play(
      ctx,
      wall,
      options.screenWidth / 2,
      [options.screenWidth / 2, options.screenHeight - options.padHeight - options.ballSize],
      [0, 0],
      status,
      options
    )
  }

  const onMouseMove = e => {
    status.mouseX = e.movementX
  }

  const onOrientationChange = () => {
    status.status = 'closed'
    setTimeout(() => {
      canvas.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('orientationchange', onOrientationChange)
      window.removeEventListener('devicemotion', onDeviceMotion)
      canvas.removeEventListener('click', beginGame)
      document.querySelector(selector).innerText = ''
      start(selector, {})
    }, 250)
  }

  const onDeviceMotion = e => {
    status.mouseX = 2.5 * (
      screen.orientation.angle === 0 ? -e.accelerationIncludingGravity.x :
      screen.orientation.angle === 90 ? e.accelerationIncludingGravity.y :
      screen.orientation.angle === 180 ? e.accelerationIncludingGravity.x :
      screen.orientation.angle === 270 ? -e.accelerationIncludingGravity.y :
      /* else */ 0
    )
  }

  canvas.addEventListener('mousemove', onMouseMove)
  window.addEventListener('orientationchange', onOrientationChange)
  window.addEventListener('devicemotion', onDeviceMotion)
  canvas.addEventListener('click', beginGame)

  document.fonts.ready.then((font) => {
    writeText(ctx, 'Ark-a-Node', options)
  })
}

exports.start = start
