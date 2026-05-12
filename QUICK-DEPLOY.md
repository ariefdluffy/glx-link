# 🚀 Quick Deploy Guide - GLX-Link

Panduan singkat untuk deployment cepat ke production menggunakan PM2.

---

## ⚡ Quick Start (5 Menit)

### 1. Persiapan Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx
```

### 2. Setup Database

```bash
# Login ke MySQL
sudo mysql -u root -p

# Jalankan SQL berikut:
```

```glx-link/QUICK-DEPLOY.md#L1-30
CREATE DATABASE glx_link CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'glx_link_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON glx_link.* TO 'glx_link_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone & Setup Aplikasi

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-username/glx-link.git
cd glx-link
sudo chown -R $USER:$USER /var/www/glx-link

# Install dependencies
npm install

# Install adapter-node
npm install -D @sveltejs/adapter-node

# Setup environment
cp .env.example .env
nano .env  # Edit dengan konfigurasi Anda
```

### 4. Build & Deploy

```bash
# Import database schema
mysql -u glx_link_user -p glx_link < schema.sql

# Build aplikasi
npm run build

# Buat direktori logs
mkdir -p logs

# Start dengan PM2
pm2 start ecosystem.config.cjs --env production

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
# Jalankan command yang diberikan PM2
```

### 5. Setup Nginx

```bash
# Buat konfigurasi
sudo nano /etc/nginx/sites-available/glx-link
```

Paste konfigurasi ini:

```glx-link/QUICK-DEPLOY.md#L70-95
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/glx-link-access.log;
    error_log /var/log/nginx/glx-link-error.log;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/glx-link /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup SSL (Opsional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ✅ Verifikasi

```bash
# Cek status PM2
pm2 status

# Cek logs
pm2 logs glx-link

# Test aplikasi
curl http://localhost:3000
```

---

## 🔄 Update Aplikasi

```bash
cd /var/www/glx-link
git pull origin main
npm ci --production=false
npm run build
pm2 reload glx-link
```

Atau gunakan script otomatis:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 Command Penting

```bash
# Status aplikasi
pm2 status

# Logs real-time
pm2 logs glx-link

# Restart aplikasi
pm2 restart glx-link

# Reload (zero-downtime)
pm2 reload glx-link

# Stop aplikasi
pm2 stop glx-link

# Monitor resource
pm2 monit
```

---

## 🔧 Troubleshooting Cepat

### Aplikasi tidak start?
```bash
pm2 logs glx-link --lines 100
pm2 restart glx-link
```

### Database error?
```bash
mysql -u glx_link_user -p glx_link -e "SHOW TABLES;"
```

### Nginx 502?
```bash
pm2 status
curl http://localhost:3000
sudo systemctl restart nginx
```

---

## 📚 Dokumentasi Lengkap

Untuk panduan lengkap, lihat: [DEPLOYMENT-PM2.md](./DEPLOYMENT-PM2.md)

---

**Selamat! Aplikasi Anda sudah running di production! 🎉**
