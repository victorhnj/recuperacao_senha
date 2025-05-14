const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] Conexão estabelecida com sucesso');
    await sequelize.sync();
  } catch (err) {
    console.error('[DB] Erro ao conectar com o banco de dados:', err);
  }
};

module.exports = {
  sequelize,
  syncDatabase
};
