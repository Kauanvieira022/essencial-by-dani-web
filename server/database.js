const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Database = require('better-sqlite3');

const defaultDataRoot = process.platform === 'win32'
  ? process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
  : process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
const defaultDatabasePath = path.join(defaultDataRoot, 'essencial-by-dani', 'essencial-by-dani.sqlite');
const databasePath = path.resolve(process.env.DATABASE_PATH || defaultDatabasePath);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new Database(databasePath);
database.pragma('foreign_keys = ON');
database.pragma('journal_mode = WAL');
database.pragma('busy_timeout = 5000');
database.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

module.exports = database;
