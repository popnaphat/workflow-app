# Use Node.js base image
FROM node:18-alpine

# Step 1: Set working directory
WORKDIR /app

# Step 2: Copy package.json and package-lock.json
COPY package*.json ./

# Step 3: Install dependencies
RUN npm install

# Step 4: Copy the rest of the application
COPY . .

# Step 5: Build the Angular application
RUN npm run build --prod

# Step 6: Expose the port the app runs on (default 4200 for Angular)
EXPOSE 4200

# Step 7: Command to run the Angular application
CMD ["npm", "start"]
