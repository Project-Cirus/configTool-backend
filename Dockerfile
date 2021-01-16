FROM node:15

WORKDIR /app
COPY . .
VOLUME [ "/app/generated" ]

RUN npm install

EXPOSE 80
ENV NODE_ENV=production
CMD [ "node", "src/app.js" ]