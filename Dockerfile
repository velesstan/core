FROM node:15-slim AS development
WORKDIR /core
COPY package.json /core
RUN npm install
COPY . /core
RUN npm run build

FROM node:15-slim as production
RUN  apt-get update \
    && apt-get install -y wget gnupg ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/* \
    && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
    && chmod +x /usr/sbin/wait-for-it.sh
WORKDIR /core
COPY package*.json ./
RUN npm i --only=production
COPY --from=development /core/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]