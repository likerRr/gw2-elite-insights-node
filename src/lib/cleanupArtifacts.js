import fs from 'fs/promises';
import { glob } from 'glob';
import path from 'path';
import { UPLOAD_DIR } from '../config.js';

export const cleanupArtifacts = async (filename, keepJson = false) => {
  try {
    const pattern = path.join(UPLOAD_DIR, `${filename}*`);
    const matchingFiles = await glob(pattern);

    for (const filePath of matchingFiles) {
      if (keepJson && filePath.endsWith('.json')) {
        continue;
      }

      try {
        await fs.unlink(filePath);
        console.log(`Cleaned up artifact: ${filePath}`);
      } catch (unlinkError) {
        console.error(`Failed to delete file ${filePath}:`, unlinkError);
      }
    }
  } catch (error) {
    console.error(`Error during cleanup for ${filename}:`, error);
  }
}
