
const fs = require('fs');
const path = require('path');

try {
    const stats = fs.statSync('prisma/dev.db');
    fs.writeFileSync('db-stats.txt', `Size: ${stats.size}\nModified: ${stats.mtime}`);
} catch (e) {
    fs.writeFileSync('db-stats.txt', `Error: ${e.message}`);
}
