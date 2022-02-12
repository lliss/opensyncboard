const WebSocket = require('ws');

class DrawingChannel {
  constructor(key) {
    this.key = key;
    this.producer = null;
    this.consumers = [];
    this.events = [];
    this.lastMessageTime = Date.now();
  }

  hasLivingSocket() {
    return this.producer !== null && this.producer.isAlive;
  }

  getLastMessageTime() {
    return this.lastMessageTime;
  }

  setProducer(ws) {
    this.producer = ws;
  }

  addConsumer(ws) {
    this.consumers.push(ws);
  }

  addEvent(evnt) {
    this.lastMessageTime = Date.now();
    if (evnt.type === 'clear') {
      this.clearEvents();
    } else {
      this.events.push(evnt);
    }
    return this.events;
  }

  getEvents() {
    return this.events;
  }

  getProducer() {
    return this.producer;
  }

  getConsumers() {
    return this.consumers;
  }

  clearEvents() {
    this.events = [];
  }

  sendMessageObjectToConsumers(msgObject) {
    this.getConsumers().forEach((consumerWs) => {
      if (consumerWs.readyState === WebSocket.OPEN) {
        consumerWs.send(JSON.stringify(msgObject));
      }
    });
  }

  alertProducerOfActiveConsumers() {
    let count = this.getConsumers()
                  .filter(consumerWs => consumerWs.readyState === WebSocket.OPEN)
                  .length;
    this.getProducer().send(JSON.stringify({ count }));
  }

  cleanupConsumer(ws) {
    const index = this.consumers.indexOf(ws);
    // Fastest way to delete an item... swap it to the end of the array... then pop.
    if (index !== -1) {
      this.consumers[index] = this.consumers[this.consumers.length - 1];
      this.consumers.pop();
    }
  }

}

module.exports = DrawingChannel;
