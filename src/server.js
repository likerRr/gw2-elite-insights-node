import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve("/tmp/uploads/");
const PARSER_DIR = path.join(__dirname, "../GW2EIParser");
const CLI_PATH = path.join(PARSER_DIR, "GuildWars2EliteInsights-CLI");
const CLI_CONFIG_PATH = path.join(PARSER_DIR, "gw2ei.conf");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(null, `${Date.now()}${ext}`);
  },
});

const app = express();
const upload = multer({ storage });

app.get("/", async (req, res) => {
  res.send('Hello World');
});

app.get("/read", async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).json({ error: "filename parameter is required" });
    }

    const pattern = path.join(UPLOAD_DIR, `${filename}_*.json`);
    const matchingFiles = await glob(pattern);

    if (matchingFiles.length === 0) {
      console.warn(`File matching pattern "${filename}_*.json" not found`);

      return res.status(404).json({ error: `File not found` });
    }

    const filePath = matchingFiles[0];
    const fileContent = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    res.json(jsonData);
  } catch (error) {
    console.error('Error reading file:', error);

    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid JSON format in file" });
    }

    res.status(500).json({ error: "Internal server error while reading file" });
  }
});

app.post("/parse", upload.array("files"), async (req, res) => {
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

    child.on("error", (err) => {
      console.error(`[${file.originalname}] Failed to start process: ${err}`);
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

app.on("error", (err) => {
  console.error("Server error:", err);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
