import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, "/tmp/uploads/");
    cb(null, "/app/uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(null, `${Date.now()}${ext}`);
  },
});

const app = express();
const upload = multer({ storage });

const PARSER_PATH = path.join(__dirname, "GW2EIParser");
const CLI_PATH = path.join(PARSER_PATH, "GuildWars2EliteInsights-CLI");
const CLI_CONFIG_PATH = path.join(PARSER_PATH, "gw2ei.conf");

app.get("/", async (req, res) => {
  res('Hello World');
});

app.post("/parseFile", upload.array("files"), async (req, res) => {
  if (!req.files || (req.files).length === 0) {
    return res.status(400).send("No files uploaded");
  }

  const files = req.files;

  for (const file of files) {
    console.log(`Processing file: ${file.path}`);

    const child = spawn(CLI_PATH, ["-c", CLI_CONFIG_PATH, file.path]);

    child.stdout.on("data", (data) => {
      console.log(`[${file.originalname} STDOUT] ${data.toString()}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`[${file.originalname} STDERR] ${data.toString()}`);
    });

    child.on("close", (code) => {
      console.log(`[${file.originalname}] Process exited with code ${code}`);
    });
  }

  res.send({
    message: "Files received. Processing in background.",
    files: files.map((f) => ({
      filename: f.filename,
      oFilename: f.originalname,
    })),
  });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
