const pause = to => new Promise((resolve) => setTimeout(resolve, to))

const beep = (frequency = 440, duration = 25) => new Promise((resolve) => {
  if (!window.AudioContext) return

  const ctx = new window.AudioContext()

  const gain = ctx.createGain()
  gain.gain.value = 0.1
  gain.connect(ctx.destination)

  const osc = ctx.createOscillator()
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)
  osc.type = 'square'
  osc.connect(gain)
  osc.start()
  setTimeout(() => { osc.stop(); resolve() }, duration)
})

const playVictorySound = async () => {
  await beep(523, 100)
  await pause(100)
  await beep(440, 100)
  await pause(100)
  await beep(523, 100)
  await pause(100)
  await beep(698, 500)
}

const writeText = (canvas, text, options) => {
  canvas.font = `${options.fontSize}px sans-serif`
  canvas.textAlign = 'center'
  canvas.fillStyle = 'white'

  canvas.fillText(text, options.screenWidth / 2, options.screenHeight / 2)
}

const resetGame = (statusObject, status) => {
  statusObject.status = status
  document.exitPointerLock()
}

const isVictory = wall => {
  return wall.every(row => row.every(col => col <= 0))
}

const isGameOver = (ball, pad, options) => {
  const [bx, by] = ball
  const halfPad = options.padWidth / 2

  return (
    by >= options.screenHeight - options.padHeight - (options.ballSize / 2) &&
    (bx > pad + halfPad || bx < pad - halfPad)
  )
}

const initCanvas = (selector, screenWidth, screenHeight) => {
  const container = document.querySelector(selector)
  container.innerText = ''

  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', screenWidth)
  canvas.setAttribute('height', screenHeight)
  container.appendChild(canvas)

  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, screenWidth, screenHeight)

  return canvas
}

const generateWall = (width, height) => {
  return [...Array(height)].map(row => (
    [...Array(width)].map(() => parseInt(Math.random() * 7) + 1)
  ))
}

const coords2matrix = ([x, y], options) => {
  return [
    Math.floor(x / (options.screenWidth / options.wallWidth)),
    Math.floor(y / options.wallPieceHeight)
  ]
}

const matrix2coords = ([mx, my], options) => {
  return [
    mx * (options.screenWidth / options.wallWidth),
    my * options.wallPieceHeight
  ]
}

const drawWall = (canvas, wall, options) => {
  wall.forEach((row, r) => {
    row.forEach((color, c) => {
      canvas.fillStyle = options.wallColors[color]
      canvas.strokeStyle = 'black'

      const [x, y] = matrix2coords([c, r], options)

      canvas.fillRect(x, y, options.screenWidth / options.wallWidth, options.wallPieceHeight)
      canvas.strokeRect(x, y, options.screenWidth / options.wallWidth, options.wallPieceHeight)
    })
  })

  canvas.fillStyle = '#000'
}

const drawPad = (canvas, position, options) => {
  const x = position - (options.padWidth / 2)
  const y = options.screenHeight - options.padHeight - 1
  const w = options.padWidth
  const h = options.padHeight

  const gradient = canvas.createLinearGradient(x, y, x, y + h)
  gradient.addColorStop(0, 'lightslategray')
  gradient.addColorStop(0.2, 'lightsteelblue')
  gradient.addColorStop(1, 'slategray')

  canvas.fillStyle = gradient
  canvas.fillRect(
    x,
    y,
    w,
    h
  )
}

const drawBall = (canvas, [x, y], color, options) => {
  canvas.beginPath()
  canvas.arc(x, y, options.ballSize, 0, 2 * Math.PI, false)
  canvas.fillStyle = color
  canvas.fill()
}

const getBallPosition = ([x, y], [dx, dy]) => {
  return [
    x + dx,
    y + dy
  ]
}

const getDirection = (ball, direction, hit, options) => {
  const [bx, by] = ball
  const [dx, dy] = direction

  const halfSize = options.ballSize / 2

  const nextDX = (bx >= options.screenWidth - halfSize || bx < halfSize) ? -dx : dx
  const nextDY = (hit || by < halfSize) ? -dy : dy

  return [
    nextDX,
    nextDY
  ]
}

const updateWall = (wall, ball, options) => {
  const [bmx, bmy] = coords2matrix(ball, options)

  const wallRow = wall[bmy] || []
  const wallPiece = wallRow[bmx] || 0

  return wallPiece > 0
    ? [...wall].map((row, r) => [...row].map((col, c) => r === bmy && c === bmx ? 0 : col))
    : wall
}

const clear = (canvas, options) => {
  canvas.fillStyle = 'black'
  canvas.fillRect(0, 0, options.screenWidth, options.screenHeight)
}

const getPadPosition = (pad, delta, options) => {
  return Math.max(
    options.padWidth / 2,
    Math.min(
      pad + delta,
      options.screenWidth - (options.padWidth / 2)
    )
  )
}

const getPadHit = (ball, options) => {
  const [, by] = ball
  return by > options.screenHeight - options.padHeight - (options.ballSize / 2)
}

const getWallHit = (wall, nextWall) => {
  return wall !== nextWall
}

const play = (canvas, wall, pad, ball, direction, status, options) => {
  const [dx, dy] = direction
  const [, by] = ball

  const nextWall = updateWall(wall, ball, options)
  const nextPad = getPadPosition(pad, status.mouseX, options)

  const wallHit = getWallHit(wall, nextWall)
  const padHit = getPadHit(ball, options)
  const hit = wallHit || padHit

  const nextDirection = (
    (status.status === 'playing' && (!dx || !dy)) ? [5, -5] :
    getDirection(ball, direction, hit, options)
  )

  const nextBall = (
    status.status === 'ready' ? [pad, by] :
    getBallPosition(ball, nextDirection)
  )

  clear(canvas, options)
  drawWall(canvas, nextWall, options)

  drawPad(canvas, nextPad, options)

  if (isVictory(wall)) {
    playVictorySound()
    writeText(canvas, 'YOU WON!', options)
    resetGame(status, 'victory')
    return
  }

  if (isGameOver(nextBall, nextPad, options)) {
    writeText(canvas, 'GAME OVER', options)
    beep(100, 250)
    resetGame(status, 'gameover')
    return
  }

  drawBall(canvas, nextBall, 'white', options)

  if (wallHit) beep(440, 50)
  else if (padHit) beep(220, 50)

  return setTimeout(() => {
    play(
      canvas,
      nextWall,
      nextPad,
      nextBall,
      nextDirection,
      status,
      options
    )
  }, options.speed)
}

function start (selector, {
  screenWidth = 640,
  screenHeight = 480,
  wallWidth = 7,
  wallHeight = 5
}) {
  const options = {
    screenWidth,
    screenHeight,
    wallWidth,
    wallHeight,

    fontSize: 42 * screenHeight / 480,
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
  const wall = generateWall(wallWidth, wallHeight)

  const status = {
    status: 'gameover',
    mouseX: 0
  }

  canvas.addEventListener('mousemove', e => {
    status.mouseX = e.movementX
  })

  canvas.addEventListener('click', e => {
    switch (status.status) {
      case 'victory':
      case 'gameover': {
        status.status = 'ready'
        break
      }

      case 'ready': {
        status.status = 'playing'
        return
      }

      case 'playing': return

      default:
    }

    canvas.requestPointerLock()

    play(
      canvas.getContext('2d'),
      wall,
      screenWidth / 2,
      [screenWidth / 2, screenHeight - options.padHeight - options.ballSize],
      [0, 0],
      status,
      options
    )
  })
}

exports.start = start
