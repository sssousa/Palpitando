# ---- dependências ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ---- CLI do Prisma isolado, com a árvore completa de dependências ----
# (usado pelo entrypoint para aplicar as migrações na inicialização)
FROM node:22-alpine AS prisma-cli
RUN apk add --no-cache openssl
WORKDIR /prisma-cli
RUN npm install prisma@6.19.3

# ---- runtime ----
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# aplicação (output standalone do Next.js)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# CLI do Prisma para aplicar as migrações na inicialização
COPY --from=prisma-cli /prisma-cli/node_modules /opt/prisma-cli/node_modules
COPY --from=builder /app/prisma ./prisma

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && mkdir -p /app/data

EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
