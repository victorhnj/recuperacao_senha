const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const User = require('../../domain/entities/user.entity');

class UserModel extends Model {}

UserModel.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recoveryCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recoveryExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users'
});

class UserRepository {
  async create(data) {
    console.log(`[DB] Creating user: ${data.email}`);
    const created = await UserModel.create({
      email: data.email,
      password: data.password
    });

    return new User(
      created.id,
      created.email,
      created.password,
      created.recoveryCode,
      created.recoveryExpires
    );
  }

  async findByEmail(email) {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.password,
      user.recoveryCode,
      user.recoveryExpires
    );
  }

  async findById(id) {
    const user = await UserModel.findByPk(id);
    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.password,
      user.recoveryCode,
      user.recoveryExpires
    );
  }

  async update(id, newData) {
    const user = await UserModel.findByPk(id);
    if (!user) throw new Error('User not found for update');

    await user.update({
      email: newData.email,
      password: newData.password,
      recoveryCode: newData.recoveryCode,
      recoveryExpires: newData.recoveryExpires
    });

    return new User(
      user.id,
      user.email,
      user.password,
      user.recoveryCode,
      user.recoveryExpires
    );
  }

  async delete(id) {
    const user = await UserModel.findByPk(id);
    if (!user) throw new Error('User not found for deletion');
    await user.destroy();
  }
}

module.exports = new UserRepository();
