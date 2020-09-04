const DEFAULT_LINE_COLOR = '#025bd1';
const DEFAULT_LINE_WIDTH = 1;
const PADDING_PERCENT = 5;
const DRAW_EVENT_TYPE_CIRCLE = 'circle';
const DRAW_EVENT_TYPE_CLEAR = 'clear';
const DRAW_EVENT_TYPE_SEGMENT = 'segment';
const DRAW_EVENT_TYPE_SYNC = 'sync';
const PRODUCER_EVENT_STATUS_CHANGE = 'producer_status_change';
const RATIO_HEIGHT = 9;
const RATIO_WIDTH = 16;
const HOSTNAME = window.location.hostname;
const PROTOCOL = window.location.protocol === 'https:' ? 'wss' : 'ws';
const SOCKET_DRAW_BASE_URL = `${PROTOCOL}://${HOSTNAME}/socket/draw`;
const SOCKET_VIEW_BASE_URL = `${PROTOCOL}://${HOSTNAME}/socket/view/`;

export default {
  DEFAULT_LINE_COLOR,
  DEFAULT_LINE_WIDTH,
  DRAW_EVENT_TYPE_CIRCLE,
  DRAW_EVENT_TYPE_CLEAR,
  DRAW_EVENT_TYPE_SEGMENT,
  DRAW_EVENT_TYPE_SYNC,
  PADDING_PERCENT,
  PRODUCER_EVENT_STATUS_CHANGE,
  RATIO_HEIGHT,
  RATIO_WIDTH,
  SOCKET_DRAW_BASE_URL,
  SOCKET_VIEW_BASE_URL,
};
