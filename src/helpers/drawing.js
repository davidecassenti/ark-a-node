const { matrix2coords } = require('./coords')

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

const drawBall = (canvas, [x, y], color, options) => {
  canvas.beginPath()
  canvas.arc(x, y, options.ballSize, 0, 2 * Math.PI, false)
  canvas.fillStyle = color
  canvas.fill()
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

const writeText = (canvas, text, options) => {
  canvas.font = `${options.fontSize}px sans-serif`
  canvas.textAlign = 'center'
  canvas.fillStyle = 'white'

  canvas.fillText(text, options.screenWidth / 2, options.screenHeight / 2)
}

const clear = (canvas, options) => {
  canvas.fillStyle = 'black'
  canvas.fillRect(0, 0, options.screenWidth, options.screenHeight)
}

module.exports = {
  initCanvas,
  drawBall,
  drawPad,
  drawWall,
  writeText,
  clear
}
