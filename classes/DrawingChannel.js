class DrawingChannel {
  constructor(key) {
    this.key = key;
    this.producer = null;
    this.consumers = [];
  }

  setProducer(ws) {
    this.producer = ws;
  }

  addConsumer(ws) {
    this.consumers.push(ws);
  }
}

module.exports = DrawingChannel;
