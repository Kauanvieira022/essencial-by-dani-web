const portValue = process.env.PORT === undefined ? '3000' : process.env.PORT;
const port = Number(portValue);

if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
  throw new Error('Configure um PORT entre 1 e 65535 no arquivo .env.');
}

module.exports = { port };
