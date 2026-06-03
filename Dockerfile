FROM node:20-bullseye

# Install python3, gcc, and g++ for native code execution/compilation
RUN apt-get update && apt-get install -y python3 gcc g++

WORKDIR /app

# Install npm dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# The Gemini API Key needs to be baked into the frontend bundle at build time.
# You can pass this via --build-arg GEMINI_API_KEY=your_key_here
ARG GEMINI_API_KEY
RUN echo "GEMINI_API_KEY=$GEMINI_API_KEY" > .env

# Build the frontend
RUN npm run build

# Expose the server port
EXPOSE 3000

# Start the Express server
CMD ["node", "server.js"]
