# Hostinger Shared Hosting Deployment Guide (PHP + MySQL)

Follow these steps to deploy **Nitwebs** to your Hostinger Shared Hosting environment.

---

## Step 1: Create MySQL Database on Hostinger
1. Log in to your **Hostinger hPanel**.
2. Go to **Databases** > **Management** > **Create a New MySQL Database and Database User**.
3. Set your Database Name, Username, and Password (e.g. `u123456789_nitwebs`, `u123456789_admin`, `YourPassword123!`).
4. Note down your Database Name, User, and Password.

---

## Step 2: Import Database Tables
1. In Hostinger hPanel, click **Enter phpMyAdmin** for your newly created database.
2. Click the **Import** tab at the top.
3. Choose file: Select `api/schema.sql` from this repository.
4. Click **Go** (or **Execute**) at the bottom.
5. All database tables will be created and the default admin user seeded:
   - **Username**: `admin`
   - **Password**: `Admin@Nitwebs2026`

---

## Step 3: Configure Database Credentials in PHP
1. Open `api/config.php` (either on your computer before uploading or via Hostinger File Manager).
2. Update lines 4-6 with your actual Hostinger credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_nitwebs'); // Your DB Name
define('DB_USER', 'u123456789_admin');   // Your DB Username
define('DB_PASS', 'YourPassword123!');   // Your DB Password
```

---

## Step 4: Build and Upload Frontend & Backend
1. Build the production React frontend bundle:
   ```bash
   npm run build
   ```
   *(This outputs compiled production files into the `dist/` directory)*.

2. Upload files to Hostinger `public_html` via Hostinger File Manager or FTP:
   - Copy **everything inside `dist/`** into `public_html/` on Hostinger:
     - `public_html/index.html`
     - `public_html/assets/...`
     - `public_html/.htaccess`
   - Copy the **`api/` folder** into `public_html/api/`:
     - `public_html/api/config.php`
     - `public_html/api/db.php`
     - `public_html/api/auth.php`
     - `public_html/api/content.php`
     - `public_html/api/jobs.php`
     - `public_html/api/applications.php`
     - `public_html/api/contact.php`
     - `public_html/api/pages.php`
     - `public_html/api/gallery.php`
     - `public_html/api/nav.php`
     - `public_html/api/footer.php`
     - `public_html/api/.htaccess`
     - `public_html/api/uploads/resumes/`
     - `public_html/api/uploads/gallery/`

---

## Step 5: Directory Permissions (Uploads)
Ensure folder write permissions (755 or 777) in Hostinger File Manager for:
- `public_html/api/uploads/resumes/`
- `public_html/api/uploads/gallery/`

---

## Step 6: Access Admin Panel
- Go to `https://yourdomain.com/admin` in your web browser.
- Log in with:
  - **Username**: `admin`
  - **Password**: `Admin@Nitwebs2026`
- You now have **100% full Admin Dashboard access** to manage site content, careers, job applications, custom dynamic pages, team gallery, navigation links, and footer settings without any limitations!
