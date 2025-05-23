const bcrypt = require('bcryptjs');

class UsuarioModel {
  constructor(id, email, password, codigo = null, expiracao = null) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.codigo = codigo;
    this.expiracao = expiracao;
  }

  async criptografarpassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async passwordCorreta(passwordInformada) {
    return await bcrypt.compare(passwordInformada, this.password);
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
