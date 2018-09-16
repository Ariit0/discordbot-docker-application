FROM node:latest
# Create directory
RUN npm install -g nodemon
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot
# Copy packages and install
COPY package.json /usr/src/bot
RUN npm install
# Copy bot code
COPY . /usr/src/bot
# Run application
CMD ["nodemon", "index.js"]

