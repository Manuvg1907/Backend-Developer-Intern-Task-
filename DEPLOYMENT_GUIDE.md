# Deployment Guide

Complete guide for deploying the Secure REST API with React Frontend to production.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Environment Configuration](#environment-configuration)
7. [SSL/TLS Setup](#ssltls-setup)
8. [Monitoring & Logging](#monitoring--logging)

## Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Update CORS origins to match production domain
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Review and harden database credentials
- [ ] Set strong database admin passwords
- [ ] Enable database authentication
- [ ] Configure firewall rules
- [ ] Set up rate limiting

### Performance
- [ ] Add database indexes
- [ ] Configure caching (Redis)
- [ ] Enable response compression
- [ ] Optimize static assets
- [ ] Setup CDN for frontend assets

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Configure logging (Winston, Bunyan)
- [ ] Setup performance monitoring (New Relic, Datadog)
- [ ] Configure alerts
- [ ] Backup strategy in place

## Database Setup

### MongoDB Atlas (Cloud)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Click "Create a Deployment"
   - Choose free tier (M0)
   - Select your region closest to users

3. **Security Setup**
   - Create admin user (not root)
   - Add IP addresses to whitelist
   - Create application user with limited permissions

4. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

### MongoDB Local/Self-Hosted

1. **Install MongoDB Community**
   - Download from https://www.mongodb.com/try/download/community
   - Install following official documentation

2. **Enable Authentication**
   - Create admin user
   - Create application user
   - Update MongoDB config to require authentication

3. **Setup Backups**
   ```bash
   mongodump --out /backup/path
   mongoexport --db dbname --collection name --out export.json
   ```

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set PORT=5000
   heroku config:set MONGODB_URI=mongodb+srv://...
   heroku config:set JWT_SECRET=your-very-long-secret-key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Monitor Logs**
   ```bash
   heroku logs --tail
   ```

### Option 2: AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS AMI
   - Use t3.micro for free tier
   - Configure security groups (allow ports 80, 443, 22)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm git
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/yourname/securerestapi.git
   cd securerestapi/backend
   npm install
   ```

5. **Setup Environment**
   ```bash
   nano .env  # Add production environment variables
   ```

6. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "api"
   pm2 startup
   pm2 save
   ```

### Option 3: Google Cloud Run

1. **Create GCP Account**
   - Visit https://cloud.google.com
   - Setup billing account

2. **Install Google Cloud CLI**
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

3. **Build Container**
   ```bash
   gcloud builds submit --tag gcr.io/your-project/securerestapi-backend
   ```

4. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy securerestapi-backend \
     --image gcr.io/your-project/securerestapi-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

5. **Set Environment Variables**
   - Set in Cloud Run settings
   - Update MONGODB_URI, JWT_SECRET, etc.

### Option 4: DigitalOcean App Platform

1. **Connect GitHub**
   - Link your GitHub repository to DigitalOcean
   - Authorize DigitalOcean to access your repo

2. **Create App**
   - New App → Backend → Select Repository
   - Choose "Starter" tier

3. **Configure Build**
   - Set build command: `npm install`
   - Set run command: `npm start`

4. **Add Environment Variables**
   - PORT=5000
   - MONGODB_URI=...
   - JWT_SECRET=...
   - NODE_ENV=production

5. **Deploy**
   - Click "Create Resources"
   - DigitalOcean automatically deploys on git push

## Frontend Deployment

### Option 1: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment**
   - Add `VITE_API_URL` in Vercel dashboard
   - Point to your backend API URL

4. **Auto-Deploy**
   - Connect GitHub repository
   - Auto-deploy on push to main branch

### Option 2: Netlify

1. **Connect Repository**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Authorize and select repository

2. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Add `VITE_API_URL` with backend URL
   - Add other environment variables

4. **Deploy**
   - Auto-deploys on git push
   - Preview builds for pull requests

### Option 3: AWS S3 + CloudFront

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-app-bucket
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-app-bucket --delete
   ```

4. **Create CloudFront Distribution**
   - Set origin to S3 bucket
   - Set default root object to `index.html`
   - Create invalidation for updates

5. **Configure Domain**
   - Update Route 53 records
   - Point to CloudFront distribution

### Option 4: GitHub Pages (Static Site)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to GitHub Pages**
   - Commit `dist` folder
   - Enable GitHub Pages in repository settings
   - Select `gh-pages` branch

3. **Custom Domain**
   - Add CNAME file with your domain
   - Update DNS records

## Docker Deployment

### Build Docker Images

1. **Backend Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   
   # Install dependencies
   RUN npm ci --only=production
   
   # Copy application
   COPY . .
   
   # Expose port
   EXPOSE 5000
   
   # Health check
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
   
   # Start application
   CMD ["npm", "start"]
   ```

2. **Frontend Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS builder
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   
   # Install dependencies
   RUN npm install
   
   # Copy application
   COPY . .
   
   # Build
   RUN npm run build
   
   # Production stage
   FROM nginx:alpine
   
   # Copy built application
   COPY --from=builder /app/dist /usr/share/nginx/html
   
   # Copy nginx config
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   
   # Expose port
   EXPOSE 80
   
   # Start nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **nginx.conf**
   ```nginx
   server {
     listen 80;
     location / {
       root /usr/share/nginx/html;
       try_files $uri $uri/ /index.html;
     }
     location /api {
       proxy_pass http://backend:5000;
     }
   }
   ```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/securerestapi
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:5000/api/v1
    networks:
      - app-network

  mongo:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
    driver: bridge
```

### Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Configuration

### Production .env (Backend)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=Your db uri
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters
JWT_EXPIRE=7d
```

### Production .env (Frontend)

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_ENV=production
```

## SSL/TLS Setup

### Let's Encrypt with Certbot (Nginx)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
   
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
   
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
   
       # ... rest of config
   }
   
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

4. **Auto-Renew**
   ```bash
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer
   ```

### AWS Certificate Manager

1. **Request Certificate**
   - In ACM console, request new certificate
   - Verify domain ownership
   - Attach to ALB

## Monitoring & Logging

### Application Performance Monitoring

1. **Sentry (Error Tracking)**
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

   ```javascript
   const Sentry = require("@sentry/node");
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     tracesSampleRate: 1.0,
   });
   
   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.errorHandler());
   ```

2. **Winston Logging**
   ```bash
   npm install winston
   ```

   ```javascript
   const logger = require('./logger'); // create logger config
   logger.info('Server started');
   ```

3. **Datadog**
   - Install Datadog agent
   - Monitor metrics and logs
   - Setup alerts

### Database Monitoring

- MongoDB Atlas: Built-in monitoring
- Check database size regularly
- Monitor query performance
- Setup backups

### Server Monitoring

- **Uptime Monitoring**: Uptimerobot, Pingdom
- **Server Resources**: htop, Grafana
- **Network**: Cloudflare Analytics
- **Error Tracking**: Sentry, Rollbar

## Scalability Tips

1. **Caching**
   - Add Redis for session caching
   - Cache frequently accessed data
   - Invalidate cache on updates

2. **Load Balancing**
   - Use Nginx/HAProxy for load balancing
   - Run multiple backend instances
   - Use sticky sessions if needed

3. **Database Optimization**
   - Add indexes on frequently queried fields
   - Implement pagination
   - Archive old data

4. **CDN**
   - Use CloudFlare for frontend
   - Cache static assets
   - Global distribution

5. **Auto-Scaling**
   - Kubernetes for containerized apps
   - AWS Auto Scaling Groups
   - Google Cloud Auto Scaling

## Backup Strategy

### Database Backups

```bash
# MongoDB backup
mongodump --uri "mongodb+srv:Enter your database location for backup

# Schedule with cron
0 2 * * * /path/to/backup.sh
```

### Automated Backups

- AWS S3: Enable versioning
- GCP: Cloud Storage with retention
- Heroku: Automated backups
- DigitalOcean: Database backups

## Troubleshooting

### High Memory Usage
- Check for memory leaks
- Increase Node heap: `node --max-old-space-size=4096 server.js`
- Use clustering for multiple workers

### Slow Queries
- Add database indexes
- Check slow query logs
- Optimize queries
- Use query analysis tools

### Connection Errors
- Check MongoDB connection string
- Verify firewall rules
- Check credentials
- Monitor connection pools

### CORS Issues
- Update CORS origins
- Check headers
- Enable credentials if needed

---

**Version**: 1.0.0
**Last Updated**: November 2025
