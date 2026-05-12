# 🚀 Panduan Deployment Production dengan PM2

Dokumentasi lengkap untuk deploy aplikasi GLX-Link ke server production menggunakan PM2.

---

## 📋 Daftar Isi

1. [Persiapan Server](#persiapan-server)
2. [Instalasi Dependencies](#instalasi-dependencies)
3. [Konfigurasi Aplikasi](#konfigurasi-aplikasi)
4. [Setup Database](#setup-database)
5. [Build & Deploy](#build--deploy)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ Persiapan Server

### 1. Spesifikasi Minimum Server

- **OS**: Ubuntu 20.04 LTS atau lebih baru / CentOS 7+
- **RAM**: Minimal 2GB (Rekomendasi 4GB+)
- **CPU**: Minimal 2 cores
- **Storage**: Minimal 20GB
- **Node.js**: v18.x atau lebih baru

### 2. Update System

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 3. Install Node.js & npm

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

### 4. Install PM2 Global

```bash
sudo npm install -g pm2

# Verifikasi instalasi
pm2 --version
```

### 5. Setup PM2 Startup Script

```bash
# Generate startup script
pm2 startup

# Jalankan command yang diberikan oleh PM2 (contoh):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-user --hp /home/your-user
```

---

## 📦 Instalasi Dependencies

### 1. Install MySQL/MariaDB

```bash
# Ubuntu/Debian
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

### 2. Install Git

```bash
sudo apt install -y git
```

### 3. Install Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## ⚙️ Konfigurasi Aplikasi

### 1. Clone Repository

```bash
# Buat direktori aplikasi
sudo mkdir -p /var/www
cd /var/www

# Clone repository (ganti dengan URL repo Anda)
sudo git clone https://github.com/your-username/glx-link.git
cd glx-link

# Set ownership
sudo chown -R $USER:$USER /var/www/glx-link
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# Copy template .env
cp .env.example .env

# Edit file .env dengan editor favorit
nano .env
```

**Isi file `.env` dengan konfigurasi production:**

```env
NODE_ENV=production
PORT=3000
ORIGIN=https://yourdomain.com

# Database Configuration
DB_HOST=localhost
DB_USER=glx_link_user
DB_PASSWORD=your_secure_password_here
DB_NAME=glx_link
DB_PORT=3306

# Session Secret (generate random string)
SESSION_SECRET=generate-random-string-here-min-32-chars

# Cloudflare Turnstile (jika digunakan)
PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key
```

**Generate Session Secret:**

```bash
# Generate random string untuk SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Edit Konfigurasi PM2

Edit file `ecosystem.config.cjs` dan sesuaikan dengan environment Anda:

```bash
nano ecosystem.config.cjs
```

---

## 🗄️ Setup Database

### 1. Login ke MySQL

```bash
sudo mysql -u root -p
```

### 2. Buat Database dan User

```sql
-- Buat database
CREATE DATABASE glx_link CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user
CREATE USER 'glx_link_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';

-- Berikan privileges
GRANT ALL PRIVILEGES ON glx_link.* TO 'glx_link_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Keluar
EXIT;
```

### 3. Import Schema Database

```bash
# Import schema awal
mysql -u glx_link_user -p glx_link < schema.sql

# Atau jalankan migration
npm run db:migrate
```

### 4. Verifikasi Database

```bash
mysql -u glx_link_user -p glx_link -e "SHOW TABLES;"
```

---

## 🔨 Build & Deploy

### 1. Build Aplikasi

```bash
cd /var/www/glx-link

# Build production
npm run build
```

### 2. Buat Direktori Logs

```bash
mkdir -p logs
```

### 3. Start Aplikasi dengan PM2

```bash
# Start aplikasi
pm2 start ecosystem.config.cjs --env production

# Atau start dengan nama spesifik
pm2 start ecosystem.config.cjs --only glx-link --env production
```

### 4. Save PM2 Configuration

```bash
# Save konfigurasi PM2
pm2 save

# Verifikasi startup script
pm2 startup
```

### 5. Verifikasi Aplikasi Berjalan

```bash
# Cek status
pm2 status

# Cek logs
pm2 logs glx-link --lines 50

# Test aplikasi
curl http://localhost:3000
```

---

## 🌐 Setup Nginx Reverse Proxy

### 1. Buat Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/glx-link
```

**Isi dengan konfigurasi berikut:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (setelah SSL setup)
    # return 301 https://$server_name$request_uri;

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
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/glx-link-access.log;
    error_log /var/log/nginx/glx-link-error.log;
}
```

### 2. Enable Site

```bash
# Buat symbolic link
sudo ln -s /etc/nginx/sites-available/glx-link /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Setup SSL dengan Let's Encrypt (Opsional tapi Direkomendasikan)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Dapatkan SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal sudah disetup otomatis, test dengan:
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Maintenance

### Command PM2 yang Berguna

```bash
# Lihat status semua aplikasi
pm2 status

# Lihat logs real-time
pm2 logs glx-link

# Lihat logs dengan filter
pm2 logs glx-link --err  # Error logs only
pm2 logs glx-link --out  # Output logs only

# Monitor resource usage
pm2 monit

# Restart aplikasi
pm2 restart glx-link

# Reload aplikasi (zero-downtime)
pm2 reload glx-link

# Stop aplikasi
pm2 stop glx-link

# Delete aplikasi dari PM2
pm2 delete glx-link

# Flush logs
pm2 flush

# Show detailed info
pm2 show glx-link
```

### Setup PM2 Web Dashboard (Opsional)

```bash
# Install PM2 Plus (gratis untuk 1 server)
pm2 link <secret_key> <public_key>

# Atau gunakan PM2 Web
pm2 web
```

### Monitoring Logs

```bash
# Tail logs
tail -f logs/pm2-out.log
tail -f logs/pm2-error.log

# Nginx logs
sudo tail -f /var/log/nginx/glx-link-access.log
sudo tail -f /var/log/nginx/glx-link-error.log
```

---

## 🔄 Update & Deployment

### Manual Deployment

```bash
cd /var/www/glx-link

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production=false

# Build
npm run build

# Run migrations (jika ada)
npm run db:migrate

# Reload PM2 (zero-downtime)
pm2 reload glx-link
```

### Automated Deployment dengan Script

```bash
# Buat script executable
chmod +x deploy.sh

# Jalankan deployment
./deploy.sh
```

### Setup Git Hooks untuk Auto Deploy (Opsional)

```bash
# Di server, setup post-receive hook
# Atau gunakan GitHub Actions / GitLab CI
```

---

## 🔧 Troubleshooting

### Aplikasi Tidak Start

```bash
# Cek logs PM2
pm2 logs glx-link --lines 100

# Cek apakah port sudah digunakan
sudo netstat -tulpn | grep :3000

# Cek environment variables
pm2 show glx-link

# Restart dengan logs verbose
pm2 delete glx-link
pm2 start ecosystem.config.cjs --env production
```

### Database Connection Error

```bash
# Test koneksi database
mysql -u glx_link_user -p -h localhost glx_link

# Cek MySQL service
sudo systemctl status mysql

# Cek MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### High Memory Usage

```bash
# Cek memory usage
pm2 monit

# Restart aplikasi
pm2 restart glx-link

# Kurangi jumlah instances di ecosystem.config.cjs
# Ubah instances: 'max' menjadi instances: 2
```

### Nginx 502 Bad Gateway

```bash
# Cek apakah aplikasi berjalan
pm2 status

# Cek Nginx error logs
sudo tail -f /var/log/nginx/glx-link-error.log

# Test koneksi ke aplikasi
curl http://localhost:3000

# Restart Nginx
sudo systemctl restart nginx
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/glx-link

# Fix logs directory
chmod 755 logs
```

---

## 🔐 Security Best Practices

### 1. Firewall Setup

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2Ban (Opsional)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure untuk Nginx
sudo nano /etc/fail2ban/jail.local
```

### 3. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update npm packages
npm outdated
npm update

# Update PM2
sudo npm update -g pm2
pm2 update
```

### 4. Backup Database

```bash
# Buat script backup
nano /home/$USER/backup-db.sh
```

**Isi script:**

```bash
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u glx_link_user -p'your_password' glx_link > $BACKUP_DIR/glx_link_$DATE.sql
gzip $BACKUP_DIR/glx_link_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "glx_link_*.sql.gz" -mtime +7 -delete
```

**Setup cron job:**

```bash
chmod +x /home/$USER/backup-db.sh

# Edit crontab
crontab -e

# Tambahkan (backup setiap hari jam 2 pagi)
0 2 * * * /home/$USER/backup-db.sh
```

---

## 📝 Checklist Deployment

- [ ] Server sudah disetup dan diupdate
- [ ] Node.js & PM2 terinstall
- [ ] MySQL/MariaDB terinstall dan dikonfigurasi
- [ ] Database dibuat dan schema diimport
- [ ] Repository di-clone ke server
- [ ] File `.env` dikonfigurasi dengan benar
- [ ] Dependencies terinstall (`npm install`)
- [ ] Aplikasi berhasil di-build (`npm run build`)
- [ ] PM2 startup script disetup
- [ ] Aplikasi berjalan dengan PM2
- [ ] Nginx dikonfigurasi sebagai reverse proxy
- [ ] SSL certificate terinstall (Let's Encrypt)
- [ ] Firewall dikonfigurasi
- [ ] Backup database disetup
- [ ] Monitoring disetup
- [ ] Testing aplikasi di browser

---

## 📞 Support

Jika mengalami masalah, cek:

1. PM2 logs: `pm2 logs glx-link`
2. Nginx logs: `sudo tail -f /var/log/nginx/glx-link-error.log`
3. MySQL logs: `sudo tail -f /var/log/mysql/error.log`
4. System logs: `sudo journalctl -xe`

---

**Dibuat pada:** 11 Mei 2026  
**Versi:** 1.0.0  
**Project:** GLX-Link
