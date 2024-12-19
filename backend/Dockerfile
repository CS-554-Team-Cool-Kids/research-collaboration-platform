FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the application files
COPY . .

# Expose the port Apollo server will run on
EXPOSE 4000

# Command to run the Apollo server
CMD ["npm", "start"]
