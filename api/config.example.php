<?php
// Reference template only — db.php no longer reads this file automatically.
// For production, copy this content into a file named `nitwebs_config.php`
// placed ONE LEVEL ABOVE public_html on Hostinger (outside the git-deployed
// directory), so a redeploy can never delete or reset it.
// For local dev, copy this file to api/config.php instead.

define("DB_HOST", "localhost");
define("DB_NAME", "u123456789_nitwebs");
define("DB_USER", "u123456789_admin");
define("DB_PASS", "YourHostingerDatabasePassword");

define("JWT_SECRET", "nitwebs_secret_key_2026");
