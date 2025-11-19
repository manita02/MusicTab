FROM node:20

WORKDIR /usr/src/app

COPY tsconfig.json tsconfig.json
COPY domain domain
COPY apps/backend apps/backend

WORKDIR /usr/src/app/apps/backend

RUN npm install
RUN npx prisma generate

EXPOSE 3000

CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/main.ts"]