# ⚽ Palpitando — Bolão da Copa do Mundo 2026

Site de bolão entre amigos para a Copa do Mundo FIFA 2026. Cada participante
palpita no placar dos jogos que ainda não começaram; os jogos e resultados vêm
da API gratuita do [Football-Data.org](https://www.football-data.org/).

## Regras

- **Placar exato: 3 pontos** · **Resultado certo: 1 ponto** (não cumulativo).
- Fase de grupos: vale o placar do tempo normal.
- Mata-mata: o placar exato é avaliado ao fim da prorrogação (sem pênaltis).
  O ponto de resultado é acertar **quem se classificou** (pênaltis contam).
  Em palpite de placar empatado, o participante escolhe quem passa nos pênaltis.
- Palpites podem ser feitos/alterados **até o horário de início** de cada jogo.
- Os palpites dos outros só ficam visíveis **depois que o jogo começa**.
- Desempate no ranking: maior número de placares exatos.

## Stack

Next.js 16 (React 19, App Router, TypeScript) · Tailwind CSS 4 · Prisma 6 +
SQLite · Docker Compose. Interface em pt-BR, horários no fuso de Brasília.

## Rodando localmente

```bash
npm install
npx prisma migrate dev   # cria o banco prisma/dev.db
npm run dev              # http://localhost:3000
```

Configure o `.env` (copie de `.env.example`):

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Caminho do SQLite (padrão `file:./dev.db`) |
| `FOOTBALL_DATA_TOKEN` | Token da API ([registre-se grátis](https://www.football-data.org/client/register)) |
| `SESSION_SECRET` | Segredo dos cookies de sessão (`openssl rand -hex 32`) |
| `INVITE_CODE` | Código de convite inicial para registro |
| `COOKIE_SECURE` | `true` quando o site estiver atrás de HTTPS |

## Primeiros passos

1. **A primeira conta registrada vira admin automaticamente** — registre-se
   antes de divulgar o link.
2. No painel **Admin**, clique em **"Sincronizar agora"** para a carga inicial
   dos 104 jogos da Copa (ou rode `npm run sync` no terminal).
3. Compartilhe o link e o código de convite com os amigos.

A sincronização de placares roda sozinha **todos os dias às 06:00 (Brasília)**,
depois do fim dos jogos do dia. O admin também pode sincronizar manualmente e
corrigir placares na mão (útil se a API atrasar).

## Deploy com Docker

No servidor (qualquer VPS Linux com Docker, ou Windows com Docker Desktop):

```bash
git clone <seu-repositorio> palpitando
cd palpitando
cp .env.example .env      # edite token, segredo e SITE_DOMAIN
docker compose up -d --build
```

O compose sobe dois containers: o app e o **Caddy**, que faz o proxy reverso
e emite/renova o certificado HTTPS sozinho (Let's Encrypt). Pré-requisitos:

- DNS do `SITE_DOMAIN` apontando para o IP do servidor;
- portas 80 e 443 abertas no firewall
  (`firewall-cmd --permanent --add-service=http --add-service=https && firewall-cmd --reload`).

O banco fica em `./data/palpitando.db` no host — **backup = copiar essa
pasta**. Para atualizar a aplicação:

```bash
git pull && docker compose up -d --build
```

> Sem domínio (acesso por IP): remova o serviço `caddy` do compose, troque a
> porta do app para `"3000:3000"` e defina `COOKIE_SECURE=false` no `.env`.

## Scripts úteis

| Comando | O que faz |
| --- | --- |
| `npm run sync` | Carga/sincronização manual com a Football-Data.org |
| `npm run db:studio` | Abre o Prisma Studio para inspecionar o banco |
| `npx tsx scripts/test-scoring.ts` | Roda os testes das regras de pontuação |
