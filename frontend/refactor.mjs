import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');

const configFiles = [
  'AnthropicConfig.tsx', 'CodexConfig.tsx', 'CustomConfig.tsx', 'GoogleConfig.tsx',
  'OllamaConfig.tsx', 'OpenAIConfig.tsx', 'BedrockManualFields.tsx',
  'VertexAzureManualFields.tsx', 'ImageSelectionConfig.tsx', 
  'OpenAICompatibleImageFields.tsx', 'LLMSelection.tsx'
];

const commonFiles = [
  'Announcement.tsx', 'BackBtn.tsx', 'Header.tsx', 'Home.tsx',
  'ToolTip.tsx', 'Wrapper.tsx', 'MarkDownRender.tsx'
];

const fileMoves = {};
configFiles.forEach(f => fileMoves[f.replace('.tsx', '')] = `config/${f.replace('.tsx', '')}`);
commonFiles.forEach(f => fileMoves[f.replace('.tsx', '')] = `common/${f.replace('.tsx', '')}`);

// Fix relative imports in files to be moved
for (const [oldBase, newRel] of Object.entries(fileMoves)) {
  const filePath = path.join(COMPONENTS_DIR, oldBase + '.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/from\s+["']\.\/([^"']+)["']/g, (match, p1) => {
      if (fileMoves[p1] && fileMoves[p1].split('/')[0] === newRel.split('/')[0]) {
        return match; // keep as "./OtherConfig"
      }
      return `from "@/components/${p1}"`;
    });
    fs.writeFileSync(filePath, content);
  }
}

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.ts') || dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const allFiles = walkSync(SRC_DIR);
allFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  // parse imports: from "..."
  const importRegex = /from\s+["']([^"']+)["']/g;
  content = content.replace(importRegex, (match, importPath) => {
    if (importPath.startsWith('@/components/')) {
       const relativeToComponents = importPath.replace('@/components/', '');
       if (fileMoves[relativeToComponents]) {
         changed = true;
         return `from "@/components/${fileMoves[relativeToComponents]}"`;
       }
    } else if (importPath.startsWith('.')) {
       // resolve relative import
       const absoluteImportPath = path.resolve(path.dirname(f), importPath);
       // check if this resolves to one of the moved files in components
       for (const [oldBase, newRel] of Object.entries(fileMoves)) {
         const targetAbsolute = path.resolve(COMPONENTS_DIR, oldBase);
         if (absoluteImportPath === targetAbsolute) {
           changed = true;
           return `from "@/components/${newRel}"`;
         }
       }
    }
    return match;
  });
  
  // Also handle dynamic imports import("...")
  const dynamicImportRegex = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
  content = content.replace(dynamicImportRegex, (match, importPath) => {
    if (importPath.startsWith('@/components/')) {
       const relativeToComponents = importPath.replace('@/components/', '');
       if (fileMoves[relativeToComponents]) {
         changed = true;
         return `import("@/components/${fileMoves[relativeToComponents]}")`;
       }
    } else if (importPath.startsWith('.')) {
       const absoluteImportPath = path.resolve(path.dirname(f), importPath);
       for (const [oldBase, newRel] of Object.entries(fileMoves)) {
         const targetAbsolute = path.resolve(COMPONENTS_DIR, oldBase);
         if (absoluteImportPath === targetAbsolute) {
           changed = true;
           return `import("@/components/${newRel}")`;
         }
       }
    }
    return match;
  });
  
  if (changed) {
    fs.writeFileSync(f, content);
  }
});

// Move files
fs.mkdirSync(path.join(COMPONENTS_DIR, 'config'), { recursive: true });
fs.mkdirSync(path.join(COMPONENTS_DIR, 'common'), { recursive: true });

for (const [oldBase, newRel] of Object.entries(fileMoves)) {
  const oldPath = path.join(COMPONENTS_DIR, oldBase + '.tsx');
  const newPath = path.join(COMPONENTS_DIR, newRel + '.tsx');
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${oldBase} to ${newRel}`);
  }
}
