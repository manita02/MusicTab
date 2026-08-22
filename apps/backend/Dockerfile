FROM node:20

WORKDIR /usr/src/app

COPY tsconfig.json tsconfig.json
COPY domain domain
COPY apps/backend apps/backend

WORKDIR /usr/src/app/domain
RUN npm install && npm run build

WORKDIR /usr/src/app/apps/backend

RUN npm install
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npx ts-node -r tsconfig-paths/register src/main.ts"]
