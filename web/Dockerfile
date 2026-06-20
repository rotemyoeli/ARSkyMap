# Deterministic build for the Vite/React PWA. Nixpacks auto-detection was flaky on
# Railway's Metal builder for this monorepo subdir, so we pin the toolchain here.
FROM node:20-alpine

WORKDIR /app

# Install deps first (cache-friendly). Dev deps are required for `vite build`.
COPY package.json package-lock.json ./
RUN npm ci

# Build the static bundle. VITE_API_BASE must be declared as ARG so Railway's
# service variable flows into the Docker build; Vite bakes import.meta.env.VITE_*
# at build time, so it MUST be set as ENV before `npm run build`. Without this the
# bundle falls back to http://localhost:8000 and never reaches the prod backend.
COPY . .
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

# Railway sets PORT; vite preview binds to it (see package.json "preview").
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "run", "preview"]
