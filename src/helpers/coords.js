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

module.exports = {
  coords2matrix,
  matrix2coords
}
