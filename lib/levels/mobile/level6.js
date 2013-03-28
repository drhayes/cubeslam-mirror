module.exports = {
  ai: {
    maxSpeed: 17,
    reaction: 0.3,
    viewRange: 0.4
  },

  puck: {
    speed: 1.5,
    speedup: .1,
    maxspeed: 2
  },

  player: {
    shields: 6
  },

  set: 'hexagon',

  extras: [
    {id: 'extralife', probability: 3},
    {id: 'fog', duration: 10, probability: 2},
    {id: 'bulletproof', probability:3}
    
  ]
}