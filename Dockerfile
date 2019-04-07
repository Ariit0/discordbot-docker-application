FROM node:latest
# Create directory
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot
# Copy packages and install
COPY package.json /usr/src/bot
RUN npm install
# Copy bot code
COPY . /usr/src/bot
# Run application
CMD ["node", "index.js"]

