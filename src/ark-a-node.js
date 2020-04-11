const { initAudio } = require('./helpers/sounds')
const { initCanvas, writeText } = require('./helpers/drawing')
const { generateWall, play } = require('./helpers/game')

function start (selector, {
  screenWidth = 640,
  screenHeight = 480,
  wallWidth = 7,
  wallHeight = 6
}) {
  const options = {
    screenWidth,
    screenHeight,
    wallWidth,
    wallHeight,

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

  const canvas = initCanvas(selector, screenWidth, screenHeight)
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
    const wall = generateWall(wallWidth, wallHeight)

    play(
      ctx,
      wall,
      screenWidth / 2,
      [screenWidth / 2, screenHeight - options.padHeight - options.ballSize],
      [0, 0],
      status,
      options
    )
  }

  canvas.addEventListener('mousemove', e => {
    status.mouseX = e.movementX
  })

  canvas.addEventListener('click', beginGame)

  document.fonts.ready.then((font) => {
    writeText(ctx, 'click to play', options)
  })
}

exports.start = start
