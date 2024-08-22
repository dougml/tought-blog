const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("toughts", "root", "", {
    host: "localhost",
    port: 3307,
    dialect: "mysql",
});

try {
    sequelize.authenticate();
    console.log("Conectado ao Banco");
} catch (err) {
    console.log(`Erro ao conectar com o Banco ${err}`);
}

module.exports = sequelize;
