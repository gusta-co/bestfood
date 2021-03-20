const { Pool } = require('pg'); //from node-postgres.com

const pool = new Pool(); //Informações de auth salvas do dotenv, de acordo com documentação não precisam ser adicionadas

module.exports = {
  query: (text, params) => pool.query(text, params),
}


