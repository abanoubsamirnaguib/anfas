# Laravel Backend with Dashboard

This is a Laravel application set up with Laravel Breeze for authentication and a basic dashboard.

## Setup Instructions

1. **Install Dependencies:**
   - Composer dependencies are already installed.
   - Install Node.js dependencies: `npm install`

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Configure your database settings in `.env` (e.g., for MySQL in Laragon)

3. **Database Setup:**
   - Create a database in your MySQL (via Laragon)
   - Run migrations: `php artisan migrate`

4. **Build Assets:**
   - `npm run build` (for production) or `npm run dev` (for development)

5. **Run the Application:**
   - `php artisan serve`
   - Access at `http://localhost:8000`

## Dashboard

- Register/Login at the home page
- After login, access the dashboard at `/dashboard`

## Troubleshooting

- Ensure PHP and Composer are in PATH or use full paths as in Laragon.
- If npm commands fail, ensure Node.js is installed.
- For database issues, check .env DB_CONNECTION, DB_DATABASE, etc.

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
