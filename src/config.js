import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const UPLOAD_DIR = path.resolve("/tmp/uploads/");
export const PARSER_DIR = path.join(__dirname, "../GW2EIParser");
export const CLI_PATH = path.join(PARSER_DIR, "GuildWars2EliteInsights-CLI");
export const CLI_CONFIG_PATH = path.join(PARSER_DIR, "gw2ei.conf");
