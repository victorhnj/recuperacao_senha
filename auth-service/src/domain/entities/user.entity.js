const bcrypt = require('bcryptjs');

class Usuario {
  constructor(id, email, senha, codigoRecuperacao = null, validadeCodigo = null) {
    this.id = id;
    this.email = email;
    this.senha = senha;
    this.codigoRecuperacao = codigoRecuperacao;
    this.validadeCodigo = validadeCodigo;
  }

  async hashPassword() {
    console.log(`[Segurança] Gerando hash da senha para: ${this.email}`);
    this.senha = await bcrypt.hash(this.senha, 10);
  }

  async comparePassword(senhaDigitada) {
    console.log(`[Segurança] Validando senha para: ${this.email}`);
    return await bcrypt.compare(senhaDigitada, this.senha);
  }

  setRecoveryCode(codigo) {
    this.codigoRecuperacao = codigo;
    this.validadeCodigo = new Date(Date.now() + 15 * 60 * 1000); 
  }

  verifyRecoveryCode(codigoInformado) {
    return (
      this.codigoRecuperacao === codigoInformado &&
      this.validadeCodigo &&
      this.validadeCodigo > new Date()
    );
  }
}

module.exports = Usuario;
