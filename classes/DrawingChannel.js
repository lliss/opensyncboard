const WebSocket = require('ws');

class DrawingChannel {
  constructor(key) {
    this.key = key;
    this.producer = null;
    this.consumers = [];
    this.events = [];
  }

  setProducer(ws) {
    this.producer = ws;
  }

  addConsumer(ws) {
    this.consumers.push(ws);
  }

  addEvent(evnt) {
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
    if (msgObject.type === 'heartbeat') {
      return;
    }

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
