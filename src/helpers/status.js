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

module.exports = {
  isGameOver,
  isVictory
}
