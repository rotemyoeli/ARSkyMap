# Deterministic build for the Vite/React PWA. Nixpacks auto-detection was flaky on
# Railway's Metal builder for this monorepo subdir, so we pin the toolchain here.
FROM node:20-alpine

WORKDIR /app

# Install deps first (cache-friendly). Dev deps are required for `vite build`.
COPY package.json package-lock.json ./
RUN npm ci

# Build the static bundle. VITE_API_BASE is a build-time var injected by Railway.
COPY . .
RUN npm run build

# Railway sets PORT; vite preview binds to it (see package.json "preview").
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "run", "preview"]
