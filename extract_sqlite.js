const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function extract() {
    // We need to use a separate prisma client that points to the SQLite file
    // But @prisma/client is already generated for MongoDB.
    // So we'll use a direct sqlite3 connection.
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./prisma/dev.db');

    const tables = [
        'User', 'ServiceCategory', 'Service', 'Project', 'BlogPost', 
        'BlogCategory', 'Testimonial', 'TeamMember', 'FAQ', 'SiteSetting', 'SeoMeta'
    ];

    const data = {};

    for (const table of tables) {
        data[table] = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM ${table}`, (err, rows) => {
                if (err) {
                    console.log(`Table ${table} might not exist or error: ${err.message}`);
                    resolve([]);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    fs.writeFileSync('extracted_data.json', JSON.stringify(data, null, 2));
    console.log('Data extracted to extracted_data.json');
    db.close();
}

extract().catch(console.error);
