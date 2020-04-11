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

const jingle = (...args) => {
  return async () => {
    for (const note of args) {
      const [freq, duration] = Array.isArray(note) ? note : [0, note]
      await (freq > 0 ? beep(freq, duration) : pause(duration))
    }
  }
}

const playVictorySound = jingle(
  [523, 100], 100,
  [440, 100], 100,
  [523, 100], 100,
  [698, 500]
)

beep(0, 0)

module.exports = {
  beep,
  pause,
  jingle,
  playVictorySound
}
