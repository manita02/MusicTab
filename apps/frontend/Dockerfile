FROM node:20

WORKDIR /usr/src/app

COPY . .

RUN corepack enable && corepack prepare yarn@4.10.3 --activate

WORKDIR /usr/src/app/apps/frontend

RUN yarn install

EXPOSE 5173

CMD ["yarn", "dev"]