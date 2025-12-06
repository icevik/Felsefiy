FROM node:20-alpine

# Prisma için gerekli kütüphaneler ve dos2unix
RUN apk add --no-cache openssl openssl-dev libc6-compat dos2unix

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Entrypoint script'i çalıştırılabilir yap (CRLF -> LF dönüşümü)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN dos2unix /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/docker-entrypoint.sh"]
