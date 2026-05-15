module.exports = {
	apps: [
		{
			name: 'glx-link',
			script: 'build/index.js',
			instances: 'max', // Gunakan semua CPU cores yang tersedia
			exec_mode: 'fork',
			env: {
				NODE_ENV: 'production',
				PUBLIC_BASE_URL: 'https://glx.my.id',
				UPLOAD_DIR: '/glx-link/uploads'
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
