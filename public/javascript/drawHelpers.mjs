import constants from './constants.mjs';

function redraw(events, surface) {
  events.forEach((evnt) => {
    routeDrawEvent(evnt, surface);
  });
}

function routeDrawEvent(drawEvent, surface) {
  let theEvent = drawEvent.event;
  switch (drawEvent.type) {
    case constants.DRAW_EVENT_TYPE_SEGMENT:
      let from = surface.makeAbsolutePosition(theEvent.from);
      let to = surface.makeAbsolutePosition(theEvent.to);
      let width = surface.calculateActualLineWidth(theEvent.width);
      surface.drawSegment(from, to, width, theEvent.color);
      break;

    case constants.DRAW_EVENT_TYPE_CIRCLE:
      let center = surface.makeAbsolutePosition(theEvent.center);
      let diameter = surface.calculateActualLineWidth(theEvent.diameter);
      surface.drawCircle(center, diameter, theEvent.color);
      break;

    default:
    // NoOp
  }
}

export {
  redraw,
  routeDrawEvent,
};
