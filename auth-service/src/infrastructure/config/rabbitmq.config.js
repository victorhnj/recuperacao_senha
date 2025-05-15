const amqp = require('amqplib');

class ConexaoFila {
  constructor() {
    this.connection = null;
    this.channel = null; // <- Aqui deve ser "channel"
    this.connecting = false;
  }

  async start() {
    if (this.connection || this.connecting) return;

    this.connecting = true;

    try {
      console.log('[Fila] Conectando ao servidor RabbitMQ...');
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel(); // <- E aqui também

      console.log('[Fila] Conexão estabelecida com sucesso.');

      this.connection.on('error', (err) => {
        console.error('[Fila] Erro na conexão:', err);
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('close', () => {
        console.warn('[Fila] Conexão encerrada.');
        this.connection = null;
        this.channel = null;
      });

    } catch (err) {
      console.error('[Fila] Falha ao conectar:', err);
      throw err;
    } finally {
      this.connecting = false;
    }
  }

  async sendToQueue(queue, content) {
    try {
      if (!this.connection || !this.channel) {
        await this.start();
      }

      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)));

      console.log(`[Fila] Mensagem enviada para "${queue}" com sucesso.`);
    } catch (err) {
      console.error('[Fila] Erro ao enviar mensagem:', err);
      throw err;
    }
  }
}

module.exports = new ConexaoFila();
