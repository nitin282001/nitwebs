import * as ftp from "basic-ftp";
import * as path from "path";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const FTP_HOST = process.env.FTP_SERVER || process.env.FTP_HOST || "";
const FTP_USER = process.env.FTP_USERNAME || process.env.FTP_USER || "";
const FTP_PASSWORD = process.env.FTP_PASSWORD || process.env.FTP_PASS || "";
const FTP_PORT = parseInt(process.env.FTP_PORT || "21", 10);
const REMOTE_ROOT = process.env.FTP_REMOTE_ROOT || "/";

if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error("\n❌ FTP Credentials missing!");
  console.error("Please add FTP_SERVER, FTP_USERNAME, and FTP_PASSWORD to your .env.local file.\n");
  console.error("Example .env.local:");
  console.error("FTP_SERVER=ftp.yourdomain.com");
  console.error("FTP_USERNAME=u123456789");
  console.error("FTP_PASSWORD=YourPasswordHere\n");
  process.exit(1);
}

async function deploy() {
  const client = new ftp.Client(10000);
  client.ftp.verbose = true;

  try {
    console.log(`\n🚀 Connecting to Hostinger FTP (${FTP_HOST}:${FTP_PORT})...`);
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      port: FTP_PORT,
      secure: false
    });

    console.log("✅ FTP Connected successfully!");

    const distPath = path.resolve(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      console.log("\n📦 Uploading frontend assets (dist/) to root...");
      await client.uploadFromDir(distPath, REMOTE_ROOT);
      console.log("✅ Frontend assets deployed successfully!");
    } else {
      console.error("❌ dist/ folder not found. Run 'npm run build' first.");
    }

    const apiPath = path.resolve(process.cwd(), "api");
    const remoteApiPath = path.posix.join(REMOTE_ROOT, "api");

    if (fs.existsSync(apiPath)) {
      console.log("\n⚡ Uploading API backend (api/) to /api/...");
      await client.ensureDir(remoteApiPath);
      await client.uploadFromDir(apiPath, remoteApiPath);
      console.log("✅ Backend API deployed successfully!");
    }

    console.log("\n🎉 Deployment completed cleanly!");
  } catch (err) {
    console.error("❌ Deployment failed:", err);
  } finally {
    client.close();
  }
}

deploy();
