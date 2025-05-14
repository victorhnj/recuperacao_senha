const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.config');
const Usuario = require('../../domain/entities/user.entity');

class UsuarioModel extends Model {}

UsuarioModel.init({
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
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigoRecuperacao: {
    type: DataTypes.STRING,
    allowNull: true
  },
  validadeCodigo: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Usuario',
  tableName: 'usuarios'
});

class UsuarioRepositorio {
  async criar(dados) {
    console.log(`[BD] Inserindo usuário: ${dados.email}`);
    const novo = await UsuarioModel.create({
      email: dados.email,
      senha: dados.senha
    });

    return new Usuario(
      novo.id,
      novo.email,
      novo.senha,
      novo.codigoRecuperacao,
      novo.validadeCodigo
    );
  }

  async findByEmail(email) {
    const usuario = await UsuarioModel.findOne({ where: { email } });
    if (!usuario) return null;
  
    return new Usuario(
      usuario.id,
      usuario.email,
      usuario.senha,
      usuario.codigoRecuperacao,
      usuario.validadeCodigo
    );
  }

  async buscarPorId(id) {
    const usuario = await UsuarioModel.findByPk(id);
    if (!usuario) return null;

    return new Usuario(
      usuario.id,
      usuario.email,
      usuario.senha,
      usuario.codigoRecuperacao,
      usuario.validadeCodigo
    );
  }

  async atualizar(id, novosDados) {
    const usuario = await UsuarioModel.findByPk(id);
    if (!usuario) throw new Error('Usuário não encontrado para atualização');

    await usuario.update({
      email: novosDados.email,
      senha: novosDados.senha,
      codigoRecuperacao: novosDados.codigoRecuperacao,
      validadeCodigo: novosDados.validadeCodigo
    });

    return new Usuario(
      usuario.id,
      usuario.email,
      usuario.senha,
      usuario.codigoRecuperacao,
      usuario.validadeCodigo
    );
  }
}

module.exports = new UsuarioRepositorio();
