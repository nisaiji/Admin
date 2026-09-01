const fs = require('fs');
const path = require('path');

const targetDir = path.join('c:', 'Users', 'nikhi', 'Desktop', 'SchoolProject', 'Admin', 'src', 'components', 'transferCertificate');
const files = ['AlumniStep.jsx', 'PendingStep.jsx', 'SelectionStep.jsx', 'shared.jsx', 'TCFormStep.jsx'];

for (const file of files) {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace TH and C imports safely
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+["']\.\/constants["'];/g, (match, p1) => {
    let imports = p1.split(',').map(s => s.trim()).filter(Boolean);
    let hasC = false;
    let hasTH = false;
    
    imports = imports.filter(imp => {
        if (imp === 'C') { hasC = true; return false; }
        if (imp === 'TH') { hasTH = true; return false; }
        return true;
    });
    
    if (hasTH) imports.push('getTH');
    
    let res = '';
    if (imports.length > 0) {
        res += 'import { ' + imports.join(', ') + ' } from "./constants";\n';
    }
    if (hasC) {
        res += 'import { useTCTheme } from "./ThemeContext";\n';
    }
    return res.trim();
  });

  // Inject into functions starting with uppercase (React components)
  content = content.replace(/function ([A-Z][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{/g, 'function $1($2) {\n  const C = useTCTheme();\n  const TH = typeof getTH !== "undefined" ? getTH(C) : {};');
  content = content.replace(/const ([A-Z][a-zA-Z0-9_]*)\s*=\s*\(([^)]*)\)\s*=>\s*\{/g, 'const $1 = ($2) => {\n  const C = useTCTheme();\n  const TH = typeof getTH !== "undefined" ? getTH(C) : {};');

  // Fix SelectionStep.jsx specifically
  if (file === 'SelectionStep.jsx') {
    content = content.replace(/const filterSelectSx = \{([\s\S]*?)\};/g, 'const getFilterSelectSx = (C) => ({\n$1\n});');
    content = content.replace(/const paginationSelectSx = \{([\s\S]*?)\};/g, 'const getPaginationSelectSx = (C) => ({\n$1\n});');
    content = content.replace(/sx=\{filterSelectSx\}/g, 'sx={getFilterSelectSx(C)}');
    content = content.replace(/sx=\{paginationSelectSx\}/g, 'sx={getPaginationSelectSx(C)}');
  }

  fs.writeFileSync(filePath, content);
  console.log('Refactored ' + file);
}
