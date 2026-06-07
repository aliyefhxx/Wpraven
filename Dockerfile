FROM node:18-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
