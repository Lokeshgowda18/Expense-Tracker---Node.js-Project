// db/index.js

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: 'localhost',
    dialect: 'mysql',
  }
);

// Models
const User = require('./models/users')(sequelize, DataTypes);
const Expense = require('./models/expenses')(sequelize, DataTypes);
const Order = require('./models/orders')(sequelize, DataTypes);
const ForgotPassword = require('./models/forgotPassword')(sequelize, DataTypes); // ✅ fixed: lowercase 'f'

// Associations
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// ForgotPassword associations
User.hasMany(ForgotPassword, { foreignKey: 'userId' });
ForgotPassword.belongsTo(User, { foreignKey: 'userId' });

// Export
module.exports = {
  sequelize,
  User,
  Expense,
  Order,
  ForgotPassword
};
