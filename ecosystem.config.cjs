module.exports = {
	apps: [
		{
			name: 'glx-link',
			script: 'build/index.js',
			instances: 'max', // Gunakan semua CPU cores yang tersedia
			exec_mode: 'cluster',
			env: {
				NODE_ENV: 'production',
				PORT: 5000,
				// Database configuration
				DB_HOST: 'localhost',
				DB_USER: 'your_db_user',
				DB_PASSWORD: 'your_db_password',
				DB_NAME: 'glx_link',
				DB_PORT: 3306,
				// Application configuration
				ORIGIN: 'https://yourdomain.com'
				// Add other environment variables here
			},
			// Logging
			error_file: './logs/pm2-error.log',
			out_file: './logs/pm2-out.log',
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			merge_logs: true,
			// Auto restart configuration
			max_memory_restart: '500M',
			autorestart: true,
			watch: false,
			// Graceful shutdown
			kill_timeout: 5000,
			wait_ready: true,
			listen_timeout: 10000
		}
	]
};
