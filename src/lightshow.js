const nodeHueApi = require("node-hue-api"); 
const Phea = require("phea");
const { api:hueApi } = nodeHueApi;
const listenUDP = require("./osc");
const noteStates = {};

const ipaddress =  "<IPADDRESS>";

const config = {
  username: "<USERNAME>",
  clientkey: "<CLIENTKEY>",
  ipaddress
};

async function lightShow() {
  const api = await hueApi
    .createLocal(ipaddress)
    .connect(config.username);
  
  const lights = await api.lights.getAll();

  const syncGroup = (await api.groups.getGroupByName("Sync"))[0];


  function getLightId(name) {
    return lights.find(light => light.name === name)?.id;
  }

  const socketMap = {
    "60": getLightId("Socket 1"),
    "61": getLightId("Socket 2"),
    "62": getLightId("Socket 3"),
    "63": getLightId("Socket 4"),
    "64": getLightId("Socket 5"),
    "65": getLightId("Socket 6"),
    "66": getLightId("Socket 7"),
    "67": getLightId("Socket 8"),
    "68": getLightId("Socket 9"),
    "69": getLightId("Socket 10"),
    "70": getLightId("Socket 11"),
    "71": getLightId("Socket 12"),
    "72": getLightId("Socket 13"),
    "73": getLightId("Socket 14"),
    "74": getLightId("Socket 15"),
    "75": getLightId("Socket 16")
  };

  function onSocketNoteChange(valueBuffer){
    Object.assign(noteStates, { [valueBuffer.pitch]: valueBuffer.velocity });
    api.lights.setLightState(socketMap[valueBuffer.pitch], {on: !!valueBuffer.velocity});
  }

  listenUDP(9000, onSocketNoteChange);
  listenUDP(9001, onSocketNoteChange);


  const animMap = {
    "48": getLightId("Bulb 1"),
    "49": getLightId("Bulb 2"),
    "50": getLightId("Bulb 3"),
    "51": getLightId("Bulb 4"),
    "52": getLightId("Bar 2"),
    "53": getLightId("Bar 4"),
    "54": getLightId("Bar 3"),
    "55": getLightId("Bar 1"),
  };

  const bridge = await Phea.bridge({
    address: config.ipaddress,
    username: config.username,
    psk: config.clientkey
  });


  const colorMap = {
    "36": [255, 155, 0], // Orange
    "37": [255, 255, 255], // White
    "38": [255, 0, 0], // Red
    "39": [0, 255, 30], // Green
    "40": [144, 0, 255], // Purple
    "41": [0, 68, 255], // Blue
    "42":  [255, 0, 241] // Pink
  };

  const transitionTimeMap = {};

  // Connect to the group with syncable lights
  await bridge.start(+syncGroup.id);
  
  let lightBulbColor = colorMap["36"];

  listenUDP(9003, function(valueBuffer) {
    if(!valueBuffer.velocity) return;
    lightBulbColor = colorMap[valueBuffer.pitch];
  });

  let barColor = colorMap["36"];
  listenUDP(9004, function(valueBuffer) {
    if(!valueBuffer.velocity) return;
    barColor = colorMap[valueBuffer.pitch];
  });

  function getTransitionTime(velocity) {
    if(velocity > 120) return 0;
    if(velocity > 90) return 100;
    if(velocity > 60)  return 200;
    if(velocity > 30) return 300;

    return 400;
  }

  listenUDP(9002, function(valueBuffer) {
    const off = [0, 0, 0];

    if(animMap[valueBuffer.pitch]) {
      const color = +valueBuffer.pitch >=52 ? barColor : lightBulbColor;

      const transTime = valueBuffer.velocity ? 
        getTransitionTime(valueBuffer.velocity) : 
        (transitionTimeMap[valueBuffer.pitch] || 0);
      transitionTimeMap[valueBuffer.pitch] = transTime;

      bridge.transition(animMap[valueBuffer.pitch], valueBuffer.velocity ? color : off, transTime);

    }
  });
}

lightShow();