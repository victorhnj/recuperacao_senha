require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const rotasAutenticacao = require('./presentation/routes/auth.routes');
const { syncDatabase } = require('./infrastructure/config/database.config');
const servicoEmail = require('./infrastructure/services/email.service');
const servicoEventos = require('./infrastructure/services/event.service');

const app = express();
const porta = process.env.PORT || 3001;

// 🔒 Segurança e parsing
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// 🔧 Rota básica
app.get('/', (req, res) => {
  res.json({ mensagem: 'API de autenticação ativa!' });
});

// 📌 Rotas principais
app.use('/api/auth', rotasAutenticacao);

// 🚀 Inicialização
const iniciarServidor = async () => {
  try {
    await syncDatabase();
    await servicoEmail.iniciar();
    await servicoEventos.iniciar();

    console.log('[Sistema] Eventos de domínio disponíveis:');
    Object.values(servicoEventos.filas || {}).forEach(ev => console.log(`- ${ev}`));

    app.listen(porta, '0.0.0.0', () => {
      console.log(`Servidor disponível em http://localhost:${porta}`);
      console.log('Rotas principais:');
      console.log('- POST /api/auth/cadastro');
      console.log('- POST /api/auth/login');
      console.log('- POST /api/auth/token');
      console.log('- POST /api/auth/logout');
      console.log('- POST /api/auth/senha/solicitar');
      console.log('- POST /api/auth/senha/redefinir');
    });
  } catch (erro) {
    console.error('[Falha] Erro ao iniciar o servidor:', erro);
    process.exit(1);
  }
};

iniciarServidor();
