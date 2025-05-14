const amqp = require('amqplib');

class ConexaoFila {
  constructor() {
    this.conexao = null;
    this.canal = null;
    this.conectando = false;
  }

  async iniciar() {
    if (this.conexao || this.conectando) return;

    this.conectando = true;

    try {
      console.log('[Fila] Conectando ao servidor RabbitMQ...');
      this.conexao = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.canal = await this.conexao.createChannel();
      console.log('[Fila] Conexão estabelecida com sucesso.');

      // Eventos de erro e fechamento
      this.conexao.on('error', (err) => {
        console.error('[Fila] Erro na conexão:', err);
        this.conexao = null;
        this.canal = null;
      });

      this.conexao.on('close', () => {
        console.warn('[Fila] Conexão encerrada.');
        this.conexao = null;
        this.canal = null;
      });

    } catch (err) {
      console.error('[Fila] Falha ao conectar:', err);
      throw err;
    } finally {
      this.conectando = false;
    }
  }

  async enviar(paraFila, conteudo) {
    try {
      if (!this.conexao || !this.canal) {
        await this.iniciar();
      }

      await this.canal.assertQueue(paraFila, { durable: true });
      this.canal.sendToQueue(paraFila, Buffer.from(JSON.stringify(conteudo)));

      console.log(`[Fila] Mensagem enviada para "${paraFila}" com sucesso.`);
    } catch (err) {
      console.error('[Fila] Erro ao enviar mensagem:', err);
      throw err;
    }
  }
}

module.exports = new ConexaoFila();
