const api = require("node-hue-api"); 
// const storage = require("node-persist");

const { discovery, api:hueApi } = api;

const appName = "hue-animator";
const deviceName = "lightshow-macbook";

async function findLightShowBridge() {
  const discoveryResults = await discovery.nupnpSearch();

  const lightShowBridge = discoveryResults.find((bridge) => bridge.config?.name === "LightShow");

  if (!lightShowBridge) {
    throw new Error("Failed to resolve LightShow Bridge.");
  } else {
    return lightShowBridge.ipaddress;
  }
}

async function discoverAndCreateUser() {
  const ipaddress = await findLightShowBridge();

  // Create an unauthenticated instance of the Hue API so that we can create a new user
  const unauthenticatedApi = await hueApi.createLocal(ipaddress).connect();

  try {
    const createdUser = await unauthenticatedApi.users.createUser(
      appName,
      deviceName
    );

  
    return {
      ...createdUser,
      ipaddress
    };
  } catch (err) {
    if (err.getHueErrorType?.() === 101) {
      console.log(err);
      throw new Error(
        "The Link button on the bridge was not pressed. Please press the Link button and try again."
      );
    }
    throw err;
  }
}

module.exports = discoverAndCreateUser;