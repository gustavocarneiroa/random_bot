const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');
db.serialize(() => db.run(`
       CREATE TABLE IF NOT EXISTS commands (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          json_data TEXT
        )     
`));
db.close((err) => err && console.error(err.message));

function insert(data) {
    const query = 'INSERT INTO commands (json_data) VALUES (?)';
    const db = new sqlite3.Database('db.sqlite');
    db.run(query, [JSON.stringify(data)], err => console.error(err.message));
    db.close((err) => err && console.error(err.message));
}

async function get() {
    const db = new sqlite3.Database('db.sqlite');
    try {
        const dbRows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM commands', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        return dbRows
      } catch (error) {
        console.error(error.message);
      } finally {
        await db.close();
      }
}

async function remove(id) {
  const db = new sqlite3.Database('db.sqlite');

  try {
    const query = 'DELETE FROM commands WHERE id = ?';
    await db.run(query, [id]);
    console.log(`Comando com ID ${id} deletado com sucesso.`);
  } catch (error) {
    console.error(`Erro ao deletar comando: ${error.message}`);
  } finally {
    await db.close();
  }
}

module.exports = {
    insert, get, remove
}