FROM node:lts-alpine3.23 as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci 

COPY . .

RUN npm run build

FROM node:lts-alpine3.23

WORKDIR /app

COPY package*.json ./ 

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]