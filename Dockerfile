FROM node:18-bullseye
RUN apt-get update && apt-get install -y chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
COPY . .
RUN npm install
CMD ["node", "index.js"]
