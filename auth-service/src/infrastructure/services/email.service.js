const nodemailer = require('nodemailer');
const conexaoFila = require('../config/rabbitmq.config');

class ServicoEmail {
  constructor() {
    this.transportador = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.tentativasMaximas = 5;
    this.tempoEspera = 5000;
  }

  async iniciar() {
    for (let tentativa = 1; tentativa <= this.tentativasMaximas; tentativa++) {
      try {
        console.log(`[E-mail] Tentando conexão com RabbitMQ (${tentativa}/${this.tentativasMaximas})`);
        await conexaoFila.iniciar();
        await this.configurarFila();
        console.log('[E-mail] Serviço de e-mail ativado');
        return;
      } catch (erro) {
        console.error(`[E-mail] Erro na tentativa ${tentativa}:`, erro);
        if (tentativa < this.tentativasMaximas) {
          console.log(`[E-mail] Aguardando ${this.tempoEspera / 1000}s antes de nova tentativa...`);
          await new Promise(resolve => setTimeout(resolve, this.tempoEspera));
        }
      }
    }
    throw new Error('[E-mail] Falha ao iniciar serviço após várias tentativas');
  }

  async configurarFila() {
    const canal = conexaoFila.canal;
    await canal.assertQueue('email_queue', { durable: true });

    canal.consume('email_queue', async (mensagem) => {
      if (!mensagem) return;

      try {
        const dados = JSON.parse(mensagem.content.toString());
        console.log('[E-mail] Mensagem recebida:', dados);

        if (dados.type === 'password_reset') {
          await this.enviarEmailRecuperacao(dados.email, dados.code);
        }

        canal.ack(mensagem);
      } catch (erro) {
        console.error('[E-mail] Erro ao processar mensagem:', erro);
        canal.nack(mensagem); // devolve para a fila
      }
    });

    console.log('[E-mail] Fila e consumidor configurados');
  }

  async enviarEmailRecuperacao(destinatario, codigo) {
    try {
      const mensagem = {
        from: process.env.SMTP_USER,
        to: destinatario,
        subject: 'Código para Redefinição de Senha',
        html: `
          <h2>Olá!</h2>
          <p>Seu código de redefinição é: <strong>${codigo}</strong></p>
          <p>Este código expira em 15 minutos.</p>
          <p>Se você não pediu isso, pode ignorar este e-mail.</p>
        `
      };

      const resultado = await this.transportador.sendMail(mensagem);
      console.log(`[E-mail] Mensagem enviada com sucesso: ${resultado.messageId}`);
    } catch (erro) {
      console.error('[E-mail] Erro ao enviar e-mail:', erro);
      throw erro;
    }
  }
}

module.exports = new ServicoEmail();
