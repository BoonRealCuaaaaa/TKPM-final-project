import Sequelize from "sequelize";

//const Sequelize = require('sequelize');

const sequelize = new Sequelize("ptudw", "root", "tuilaemga", {
  dialect: "mysql",
  host: "localhost",
  logging: false,
});

export default sequelize;

// const sequelize = new Sequelize({
//   dialect: 'mysql',
//   host: '35.202.16.106', // Thay đổi thành địa chỉ IP của Google Cloud MySQL
//   username: 'boonreal',
//   password: 'tuilaemga',
//   database: 'ptudw',
//   logging:false
// });

// export default sequelize
