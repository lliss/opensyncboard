const wsRouter = (express) => {
  const router = express.Router();

  return router.ws('/draw', function(ws, req) {
    ws.on('message', function(msg) {
      console.log(msg);
    });
  });
}

module.exports = wsRouter;
