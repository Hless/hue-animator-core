const discoverAndCreateUser = require("./discover");

async function main() {
  const result = await discoverAndCreateUser();
  console.log(result);
}

main();