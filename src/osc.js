const osc = require("osc");
const requiredValuesForNote = 2;

function listenUDP(port, onValueChange) {
  let valueBuffer = {};
  const udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: port
  });

  udpPort.on("ready", function() {
    console.log(`Listening for OSC over UDP on port ${port}.`);

    udpPort.on("message", ({ address, args }) => {
      if (address === "/pitch") valueBuffer.pitch = args[0];
      if (address === "/velocity") valueBuffer.velocity = args[0];

      if (Object.keys(valueBuffer).length === requiredValuesForNote) {
      // Emit socket to (webGL) client
        onValueChange(valueBuffer);
        valueBuffer = {};

      }
    });
  });

  udpPort.on("error", function(err) {
    console.log(err);
  });

  udpPort.open();
}

module.exports = listenUDP;