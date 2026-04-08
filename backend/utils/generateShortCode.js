const crypto = require("crypto");

const CHARSET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

module.exports = function generateShortCode(length = 7) {
  return Array.from({ length }, () =>
    CHARSET[crypto.randomInt(0, CHARSET.length)],
  ).join("");
};
