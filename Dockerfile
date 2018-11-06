
# Buid from official NodeJS image.
FROM node

# Expose Ribamar default port.
EXPOSE 6776

# Copy NPM package files.
WORKDIR /usr/src/ribamar
COPY package*.json ./

# Install dependencies.
RUN npm i -P

# Copy sorrounding source code into image.
COPY . .

# Set command for starting Ribamar.
CMD npm start ./conf.yml
