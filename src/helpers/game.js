const { coords2matrix } = require('./coords')
const { drawBall, drawPad, drawWall, writeText, clear } = require('./drawing')
const { isVictory, isGameOver } = require('./status')
const { beep, playVictorySound } = require('./sounds')

// BALL

const getBallDirection = (ball, direction, hit, options) => {
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

const getBallPosition = ([x, y], [dx, dy]) => {
  return [
    x + dx,
    y + dy
  ]
}

// PAD

const getPadHit = (ball, pad, options) => {
  const [bx, by] = ball

  const minX = pad - (options.padWidth / 2)
  const maxX = pad + (options.padWidth / 2)

  return (
    bx > minX && bx < maxX &&
    by > options.screenHeight - options.padHeight - (options.ballSize / 2)
  )
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

// WALL

const generateWall = (width, height) => {
  return [...Array(height)].map(row => (
    [...Array(width)].map(() => parseInt(Math.random() * 7) + 1)
  ))
}

const getWallHit = (wall, nextWall) => {
  return wall !== nextWall
}

const updateWall = (wall, ball, options) => {
  const [bmx, bmy] = coords2matrix(ball, options)

  const wallRow = wall[bmy] || []
  const wallPiece = wallRow[bmx] || 0

  return wallPiece > 0
    ? [...wall].map((row, r) => [...row].map((col, c) => r === bmy && c === bmx ? 0 : col))
    : wall
}

// GAME

const play = (canvas, wall, pad, ball, direction, status, options) => {
  const [dx, dy] = direction
  const [, by] = ball

  const nextWall = updateWall(wall, ball, options)
  const nextPad = getPadPosition(pad, status.mouseX, options)

  const wallHit = getWallHit(wall, nextWall)
  const padHit = getPadHit(ball, nextPad, options)
  const hit = wallHit || padHit

  const nextDirection = (
    (status.status === 'playing' && (!dx || !dy)) ? [5, -5] :
    getBallDirection(ball, direction, hit, options)
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

const resetGame = (statusObject, status) => {
  statusObject.status = status
  document.exitPointerLock()
}

module.exports = {
  getBallDirection,
  getBallPosition,
  getPadPosition,
  generateWall,
  getWallHit,
  updateWall,
  play,
  resetGame
}
