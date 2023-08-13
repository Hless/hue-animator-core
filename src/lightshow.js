const nodeHueApi = require("node-hue-api"); 
const { api:hueApi } = nodeHueApi;
const listenUDP = require("./osc");
const noteStates = {};

const ipaddress =  "192.168.178.250";
const config = {
  username: "eWeVRWa8LDEIE2AsgayCGZb-wqmTFL2lDpV2W7vr",
  clientkey: "3C99C713E8FB8D049C845DE9CE21CECE",
  ipaddress
};

async function lightShow() {
  const api = await hueApi
    .createLocal(ipaddress)
    .connect(config.username);
  
  const lights = await api.lights.getAll();

  function getLightId(name) {
    return lights.find(light => light.name === name)?.id;
  }

  const mapLights = {
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

  function onNoteChange(valueBuffer){
    Object.assign(noteStates, { [valueBuffer.pitch]: valueBuffer.velocity });
    api.lights.setLightState(mapLights[valueBuffer.pitch], {on: !!valueBuffer.velocity});
  }

  listenUDP(9000, onNoteChange);
  listenUDP(9001, onNoteChange);

}

lightShow();