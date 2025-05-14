# Imagem base com Node.js (leve e otimizada)
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte para o container
COPY . .

# Expõe a porta padrão da aplicação (ajuste se necessário)
EXPOSE 3000

# Comando para iniciar o serviço em modo desenvolvimento
CMD ["npm", "run", "dev"]
