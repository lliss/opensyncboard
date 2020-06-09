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

}

module.exports = DrawingChannel;
