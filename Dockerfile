FROM node:19-alpine
WORKDIR /app
COPY . .
EXPOSE 3001
RUN npm install
CMD ["node","index.js"]