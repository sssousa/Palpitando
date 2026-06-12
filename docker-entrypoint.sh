#!/bin/sh
set -e

echo "Aplicando migrações do banco de dados..."
node /opt/prisma-cli/node_modules/prisma/build/index.js migrate deploy

echo "Iniciando o Palpitando..."
exec node server.js
