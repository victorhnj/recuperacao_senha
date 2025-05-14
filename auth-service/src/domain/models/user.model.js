const bcrypt = require('bcryptjs');

class UsuarioModel {
  constructor(id, email, senha, codigo = null, expiracao = null) {
    this.id = id;
    this.email = email;
    this.senha = senha;
    this.codigo = codigo;
    this.expiracao = expiracao;
  }

  async criptografarSenha() {
    this.senha = await bcrypt.hash(this.senha, 10);
  }

  async senhaCorreta(senhaInformada) {
    return await bcrypt.compare(senhaInformada, this.senha);
  }

  gerarCodigoRecuperacao(codigoGerado) {
    this.codigo = codigoGerado;
    this.expiracao = new Date(Date.now() + 15 * 60000); // expira em 15 minutos
  }

  codigoValido(codigoEnviado) {
    return (
      this.codigo === codigoEnviado &&
      this.expiracao &&
      this.expiracao > new Date()
    );
  }
}

module.exports = UsuarioModel;
