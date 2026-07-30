FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git python3 py3-pip

COPY package*.json ./
RUN npm ci --quiet 2>/dev/null || true

COPY . .

ENV NODE_ENV=test

CMD ["npm", "run", "test"]
