FROM node:17-alpine
WORKDIR /
COPY . .
EXPOSE 3000
RUN npm install
CMD ["node","index.js"]