# 🐳 Docker Guide - AI Data Engineering Orchestrator

## Quick Start

### Development Mode (with hot reload)
```bash
# Start development container with volume mapping
docker-compose up dev

# Or run in background
docker-compose up -d dev

# View logs
docker-compose logs -f dev
```

Access at: http://localhost:5173

### Production Mode
```bash
# Build and run production container
docker-compose up prod

# Or run in background
docker-compose up -d prod
```

Access at: http://localhost:8080

## Volume Mapping

The development container uses volume mapping for hot reload:

```yaml
volumes:
  - ./src:/app/src                    # Source code
  - ./public:/app/public              # Public assets
  - ./index.html:/app/index.html      # HTML entry
  - ./vite.config.ts:/app/vite.config.ts
  - /app/node_modules                 # Exclude node_modules
```

**Benefits:**
- Changes to source files instantly reflect in the browser
- No need to rebuild container during development
- node_modules isolated in container (faster, consistent)

## Docker Commands

### Build & Run
```bash
# Build specific stage
docker build --target dev -t ai-data-eng:dev .
docker build --target production -t ai-data-eng:prod .

# Run manually with volume mapping
docker run -p 5173:5173 \
  -v "$(pwd)/src:/app/src" \
  -v "$(pwd)/public:/app/public" \
  -v /app/node_modules \
  ai-data-eng:dev
```

### Management
```bash
# Stop containers
docker-compose down

# Rebuild containers
docker-compose build

# Remove volumes and rebuild
docker-compose down -v
docker-compose up --build

# Shell access to running container
docker exec -it ai-data-eng-dev sh
```

### Cleanup
```bash
# Remove stopped containers
docker-compose rm

# Remove images
docker rmi ai-data-eng:dev ai-data-eng:prod

# Full cleanup (careful!)
docker system prune -a
```

## Windows Specific Notes

### PowerShell
```powershell
# Navigate to project
cd C:\Users\nitza\devprojects\langchain

# Start dev environment
docker-compose up dev

# View logs
docker-compose logs -f dev
```

### Path Issues
If you encounter volume mounting issues on Windows:

1. **Enable WSL2 backend** in Docker Desktop settings
2. **Share drives** in Docker Desktop → Settings → Resources → File Sharing
3. **Use forward slashes** in docker-compose.yml (already configured)

### Performance
For better performance on Windows:
- Use **WSL2** backend (not Hyper-V)
- Keep project files in WSL filesystem if possible
- Consider moving to `/home/nitza/devprojects/` in WSL

## Multi-Stage Build Explained

```dockerfile
# Stage 1: deps - Install dependencies
FROM node:18-alpine AS deps
COPY package*.json ./
RUN npm ci

# Stage 2: dev - Development with hot reload
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
CMD ["npm", "run", "dev"]

# Stage 3: builder - Build production assets
FROM base AS builder
RUN npm run build

# Stage 4: production - Serve with nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Advantages:**
- Smaller production images (no dev dependencies)
- Cached dependency layer (faster rebuilds)
- Separate dev/prod configurations

## Troubleshooting

### Port Already in Use
```bash
# Windows - Find process using port 5173
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Or change port in docker-compose.yml
ports:
  - "3000:5173"  # Access at localhost:3000
```

### Hot Reload Not Working
```bash
# Ensure Vite is configured for Docker
# Already set in vite.config.ts:
server: {
  host: '0.0.0.0',
  watch: {
    usePolling: true  # Required for Docker
  }
}
```

### Permission Errors
```bash
# Run with correct user (Linux/WSL)
docker-compose run --user "$(id -u):$(id -g)" dev

# Windows - ensure Docker has access to the directory
```

## Environment Variables

Create `.env` file for local development:
```env
# Example environment variables
VITE_API_URL=http://localhost:3000
VITE_ENABLE_ANALYTICS=false
```

Docker Compose will automatically load `.env` file.

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Build Docker image
  run: docker build --target production -t ai-data-eng:${{ github.sha }} .

- name: Run tests in container
  run: docker run ai-data-eng:${{ github.sha }} npm test
```

## Best Practices

1. **Development**: Always use `docker-compose up dev` for local work
2. **Testing**: Run `docker-compose up prod` before deploying
3. **Cleanup**: Regularly run `docker-compose down` to free resources
4. **Updates**: After changing `package.json`, rebuild: `docker-compose up --build`
5. **Security**: Never commit `.env` files with secrets

---

**Need help?** Check Docker Desktop logs or open an issue.
