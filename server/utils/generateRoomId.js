const crypto = require('crypto');

/**
 * Generates a random alphanumeric room code
 * Format: 3 groups of 4 characters, e.g., "abcd-efgh-ijkl"
 * @returns {string}
 */
const generateRoomId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segment = () => {
    let str = '';
    for (let i = 0; i < 4; i++) {
      const idx = crypto.randomInt(0, chars.length);
      str += chars[idx];
    }
    return str;
  };
  return `${segment()}-${segment()}-${segment()}`;
};

module.exports = generateRoomId;
