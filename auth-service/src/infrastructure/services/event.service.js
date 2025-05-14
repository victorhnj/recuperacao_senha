const rabbitmqConfig = require('../config/rabbitmq.config');

class EventService {
  constructor() {
    this.filas = {
      USER_CREATED: 'auth.user.created',
      USER_UPDATED: 'auth.user.updated',
      USER_DELETED: 'auth.user.deleted',
      PASSWORD_CHANGED: 'auth.password.changed',
      LOGIN_SUCCESS: 'auth.login.success',
      LOGIN_FAILED: 'auth.login.failed'
    };
  }

  async iniciar() {
    try {
      await rabbitmqConfig.iniciar();
      console.log('[Fila] Serviço de eventos iniciado');
    } catch (erro) {
      console.error('[Fila] Erro ao iniciar serviço de eventos:', erro);
      throw erro;
    }
  }

  async publicarUsuarioCriado(usuario) {
    await this.publicar(this.filas.USER_CREATED, {
      id: usuario.id,
      email: usuario.email,
      criadoEm: new Date()
    });
  }

  async publicarUsuarioAtualizado(usuario) {
    await this.publicar(this.filas.USER_UPDATED, {
      id: usuario.id,
      email: usuario.email,
      atualizadoEm: new Date()
    });
  }

  async publicarUsuarioExcluido(usuario) {
    await this.publicar(this.filas.USER_DELETED, {
      id: usuario.id,
      email: usuario.email,
      excluidoEm: new Date()
    });
  }

  async publicarSenhaAlterada(usuario) {
    await this.publicar(this.filas.PASSWORD_CHANGED, {
      id: usuario.id,
      email: usuario.email,
      alteradaEm: new Date()
    });
  }

  async publicarLoginSucesso(usuario) {
    await this.publicar(this.filas.LOGIN_SUCCESS, {
      id: usuario.id,
      email: usuario.email,
      dataHora: new Date()
    });
  }

  async publicarLoginFalha(email, motivo) {
    await this.publicar(this.filas.LOGIN_FAILED, {
      email,
      motivo,
      dataHora: new Date()
    });
  }

  async publicar(fila, dados) {
    try {
      await rabbitmqConfig.enviar(fila, dados);
      console.log(`[Fila] Evento publicado na fila: ${fila}`);
    } catch (erro) {
      console.error(`[Fila] Erro ao publicar evento ${fila}:`, erro);
      throw erro;
    }
  }
}

module.exports = new EventService();
