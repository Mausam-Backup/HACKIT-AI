const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function test() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'data', 'test-debug.db');
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  let sqlDb;
  if (fs.existsSync(dbPath)) {
    sqlDb = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    sqlDb = new SQL.Database();
  }

  sqlDb.run(
    'CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime("now")))'
  );

  sqlDb.run('INSERT INTO todos (title) VALUES (?)', ['Test debug']);

  let stmt = sqlDb.prepare('SELECT last_insert_rowid() AS id');
  stmt.bind([]);
  console.log('Step result:', stmt.step());
  let row = stmt.getAsObject();
  console.log('Row:', JSON.stringify(row));
  console.log('Id:', row ? row.id : null);
  stmt.free();

  stmt = sqlDb.prepare('SELECT * FROM todos WHERE id = ?');
  stmt.bind([1]);
  if (stmt.step()) {
    let todo = stmt.getAsObject();
    console.log('Todo:', JSON.stringify(todo));
  } else {
    console.log('No todo found');
  }
  stmt.free();

  // Save and cleanup
  const data = sqlDb.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  console.log('Done');
}
test().catch(console.error);
