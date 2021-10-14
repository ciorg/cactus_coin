ARG PORT=3000

FROM node:14-alpine AS node

# Builder stage
FROM node AS builder

# Instal yarn
# RUN npm install yarn --global

WORKDIR /app            

COPY package.json yarn.lock tsconfig.json ./

RUN mkdir ./src

COPY src ./src

RUN yarn && yarn build

# Final stage
FROM node AS final

# Set node environment to production
ENV NODE_ENV production

# Prepare destination directory and ensure user node owns it
RUN mkdir -p /home/node/app/dist && chown -R node:node /home/node/app

# Set CWD
WORKDIR /home/node/app

# Copy package.json, package-lock.json and process.yml
COPY package.json yarn.lock ./

# Switch to user node
USER node

# Install libraries as user node
RUN yarn --production

# Copy js files and change ownership to user node
COPY --chown=node:node --from=builder /app/dist ./dist

RUN mkdir ./static
RUN mkdir ./views

COPY static ./static
COPY views ./views

COPY categories.json config.yaml ./

# Open desired port
EXPOSE ${PORT}

# Use PM2 to run the application as stated in config file
# CMD ["node", "./dist/index.js"]
