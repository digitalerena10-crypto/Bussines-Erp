const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');
const http = require('isomorphic-git/http/node');

async function run() {
    const dir = '.';
    
    console.log('--- Git Progress ---');
    
    try {
        // 1. Initialize
        await git.init({ fs, dir });
        console.log('✅ Repo initialized.');

        // 2. Add files
        await git.add({ fs, dir, filepath: '.' });
        console.log('✅ Files staged.');

        // 3. Commit
        const sha = await git.commit({
            fs,
            dir,
            message: 'Modernize Kinnetic Vault ERP for production deployment',
            author: {
                name: 'Kinnetic Vault ERP',
                email: 'support@kinneticvault.com'
            }
        });
        console.log(`✅ Committed: ${sha}`);

        // 4. Add Remote
        await git.addRemote({
            fs,
            dir,
            remote: 'origin',
            url: 'https://github.com/digitalerena10-crypto/Bussines-Erp.git'
        });
        console.log('✅ Remote added.');

        console.log('\n--- Final Step Required ---');
        console.log('The repository is now fully prepared locally on your computer!');
        console.log('To push to GitHub, you need to provide your credentials.');
        console.log('\nPlease run the final push manually once you install Git, or use a GitHub Token.');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

run();
