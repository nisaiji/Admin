const fs = require('fs');
const path = require('path');

const componentsDir = path.join('c:', 'Users', 'nikhi', 'Desktop', 'SchoolProject', 'Admin', 'src', 'components');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.jsx')) {
            results.push(filePath);
        }
    });
    return results;
}

const allJsxFiles = walk(componentsDir);
const noLightThemeComponents = [];

allJsxFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('isDarkMode')) {
        noLightThemeComponents.push(file);
    }
});

console.log(JSON.stringify(noLightThemeComponents, null, 2));
