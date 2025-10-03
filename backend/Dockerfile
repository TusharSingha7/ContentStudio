FROM node:20-alpine

WORKDIR /app

COPY *.json ./
COPY tsconfig.* ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

ENV NODE_ENV="production"

CMD [ "npm" , "run" , "start"]