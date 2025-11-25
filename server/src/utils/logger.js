const LEVELS = ['error', 'warn', 'info', 'debug'];

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

/**
 * Get the index of the level to filter messages
 * @param {string} level
 * @returns {number}
 */
const getLevelIdx = (level) => {
  const envLevel = (level || process.env.LOG_LEVEL || 'info').toLowerCase();
  const idx = LEVELS.indexOf(envLevel);
  return idx === -1 ? LEVELS.indexOf('info') : idx;
};

const levelIdx = getLevelIdx();

/**
 * Format a log message with timestamp and level
 * @param {string} level
 * @param {Array} args
 * @returns {string}
 */
function format(level, args) {
  const timestamp = new Date().toISOString();
  const message = args
    .map((a) => {
      if (a instanceof Error) return a.stack || a.message;
      try {
        return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
      } catch {
        return String(a);
      }
    })
    .join(' ');
  return `[${timestamp}] ${level.toUpperCase()} - ${message}`;
}


const logger = {};
LEVELS.forEach((lvl, idx) => {
  logger[lvl] = (...args) => {
    if (idx <= levelIdx) {
      let out = format(lvl, args);

      // Add color for error and warn
      if (lvl === 'error') out = `${COLORS.red}${out}${COLORS.reset}`;
      if (lvl === 'warn') out = `${COLORS.yellow}${out}${COLORS.reset}`;
      if (lvl === 'info') out = `${COLORS.cyan}${out}${COLORS.reset}`;

      // Output to correct console method
      if (lvl === 'error') console.error(out);
      else if (lvl === 'warn') console.warn(out);
      else console.log(out);
    }
  };
});

module.exports = logger;
