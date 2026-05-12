# 📁 Deployment Files

File-file yang digunakan untuk deployment production dengan PM2.

---

## 📄 File List

### 1. `ecosystem.config.cjs`
File konfigurasi PM2 untuk menjalankan aplikasi di production.

**Fitur:**
- Cluster mode dengan multiple instances
- Auto restart on crash
- Memory limit management
- Logging configuration
- Environment variables

**Edit sebelum deploy:**
- `env.DB_HOST` - Host database Anda
- `env.DB_USER` - Username database
- `env.DB_PASSWORD` - Password database
- `env.DB_NAME` - Nama database
- `env.ORIGIN` - Domain production Anda
- `env.PORT` - Port aplikasi (default: 3000)

### 2. `.env.example`
Template untuk environment variables production.

**Cara pakai:**
```bash
cp .env.example .env
nano .env  # Edit dengan nilai sebenarnya
```

**Yang harus diisi:**
- Database credentials
- Session secret (generate dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Domain/Origin
- API keys (jika ada)

### 3. `deploy.sh`
Script otomatis untuk deployment.

**Cara pakai:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Yang dilakukan script:**
1. Pull latest code dari git
2. Install dependencies
3. Build aplikasi
4. Run database migrations
5. Reload PM2 (zero-downtime)
6. Save PM2 configuration

**Edit sebelum pakai:**
- `APP_DIR` - Path aplikasi di server
- `REPO_URL` - URL git repository

### 4. `DEPLOYMENT-PM2.md`
Dokumentasi lengkap deployment production.

**Isi:**
- Persiapan server
- Instalasi dependencies
- Konfigurasi aplikasi
- Setup database
- Build & deploy
- Monitoring & maintenance
- Troubleshooting
- Security best practices

### 5. `QUICK-DEPLOY.md`
Panduan quick start untuk deployment cepat (5 menit).

**Untuk:**
- Developer yang sudah familiar dengan deployment
- Quick reference
- Emergency deployment

---

## 🚀 Deployment Flow

```
1. Persiapan Server
   ├── Install Node.js
   ├── Install PM2
   ├── Install MySQL
   └── Install Nginx

2. Setup Aplikasi
   ├── Clone repository
   ├── Install dependencies
   ├── Setup .env
   └── Edit ecosystem.config.cjs

3. Setup Database
   ├── Create database
   ├── Create user
   └── Import schema

4. Build & Deploy
   ├── npm run build
   ├── pm2 start ecosystem.config.cjs
   └── pm2 save

5. Setup Nginx
   ├── Create config
   ├── Enable site
   └── Setup SSL (optional)

6. Monitoring
   ├── pm2 status
   ├── pm2 logs
   └── pm2 monit
```

---

## 📋 Pre-Deployment Checklist

- [ ] Server memenuhi spesifikasi minimum
- [ ] Node.js v18+ terinstall
- [ ] PM2 terinstall global
- [ ] MySQL/MariaDB terinstall
- [ ] Nginx terinstall
- [ ] Domain sudah pointing ke server
- [ ] SSL certificate ready (optional)
- [ ] Database credentials ready
- [ ] Git repository accessible dari server
- [ ] `.env` file sudah dikonfigurasi
- [ ] `ecosystem.config.cjs` sudah disesuaikan

---

## 🔄 Update Process

### Manual Update
```bash
cd /var/www/glx-link
git pull origin main
npm ci --production=false
npm run build
pm2 reload glx-link
```

### Automated Update
```bash
./deploy.sh
```

---

## 📊 Monitoring Commands

```bash
# Status
pm2 status

# Logs
pm2 logs glx-link
pm2 logs glx-link --lines 100
pm2 logs glx-link --err

# Monitor
pm2 monit

# Info
pm2 show glx-link

# Restart
pm2 restart glx-link

# Reload (zero-downtime)
pm2 reload glx-link

# Stop
pm2 stop glx-link
```

---

## 🔧 Common Issues

### Port Already in Use
```bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000

# Kill the process
sudo kill -9 <PID>

# Or change port in ecosystem.config.cjs
```

### Database Connection Failed
```bash
# Test connection
mysql -u glx_link_user -p -h localhost glx_link

# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql
```

### Build Failed
```bash
# Clear cache
rm -rf node_modules .svelte-kit build
npm install
npm run build
```

### PM2 Not Starting on Boot
```bash
# Setup startup script
pm2 startup

# Run the command PM2 gives you
# Then save
pm2 save
```

---

## 🔐 Security Notes

1. **Never commit `.env` file** - Contains sensitive data
2. **Use strong passwords** - For database and session secret
3. **Enable firewall** - Only allow necessary ports
4. **Setup SSL** - Use Let's Encrypt for free SSL
5. **Regular updates** - Keep system and packages updated
6. **Backup database** - Setup automated daily backups
7. **Monitor logs** - Check for suspicious activities

---

## 📞 Support

Jika ada masalah:

1. Cek logs: `pm2 logs glx-link`
2. Cek status: `pm2 status`
3. Cek dokumentasi: `DEPLOYMENT-PM2.md`
4. Cek troubleshooting section

---

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [SvelteKit Deployment](https://kit.svelte.dev/docs/adapters)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Last Updated:** 2026-05-11  
**Version:** 1.0.0
