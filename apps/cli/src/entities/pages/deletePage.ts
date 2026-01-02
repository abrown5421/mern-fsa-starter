import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import { input } from '@inquirer/prompts';
import { pagesDir, webSrc } from '../../shared/paths.js';
import { toCamelCase } from '../../shared/case.js';

const appFile = path.join(webSrc, 'App.tsx');
const navbarFile = path.join(webSrc, 'features/navbar/Navbar.tsx');
const drawerFile = path.join(webSrc, 'features/navbar/NavbarDrawer.tsx');

export async function deletePage() {
  const pageName = await input({
    message: 'Enter the page name to delete (PascalCase):',
    validate: (value) => value.length > 0 || 'Page name cannot be empty',
  });

  const camelName = toCamelCase(pageName);
  const pageFolder = path.join(pagesDir, camelName);

  if (!fs.existsSync(pageFolder)) {
    console.log(`Page "${pageName}" does not exist.`);
    return;
  }

  fs.rmSync(pageFolder, { recursive: true, force: true });
  console.log(`Deleted folder: ${pageFolder}`);

  let appContent = fs.readFileSync(appFile, 'utf-8');

  const routePathRegex = new RegExp(
    `<Route\\s+path=["']([^"']+)["']\\s+element=\\{<${pageName}[^>]*>?\\}\\s*\\/>`,
    'g'
  );
  const routeMatch = routePathRegex.exec(appContent);
  const routePath = routeMatch ? routeMatch[1] : null;

  if (routePath) {
    console.log(`Found route path: ${routePath}`);
  } else {
    console.log(`Warning: Could not find route path for ${pageName}`);
  }

  const importRegex = new RegExp(
    `import\\s+${pageName}\\s+from\\s+["'][^"']+["'];?\\s*\n?`,
    'gm'
  );
  appContent = appContent.replace(importRegex, '');

  const routeRemovalRegex = new RegExp(
    `\\s*<Route\\s+path=["'][^"']+["']\\s+element=\\{<${pageName}[^>]*>?\\}\\s*\\/>\\s*\n?`,
    'gm'
  );
  appContent = appContent.replace(routeRemovalRegex, '');

  fs.writeFileSync(appFile, await prettier.format(appContent, { parser: 'typescript' }));
  console.log(`Removed ${pageName} from App.tsx`);

  if (routePath) {
    let navContent = fs.readFileSync(navbarFile, 'utf-8');
    navContent = removeLinksByPath(navContent, routePath);
    fs.writeFileSync(navbarFile, await prettier.format(navContent, { parser: 'typescript' }));

    let drawerContent = fs.readFileSync(drawerFile, 'utf-8');
    drawerContent = removeLinksByPath(drawerContent, routePath);
    fs.writeFileSync(drawerFile, await prettier.format(drawerContent, { parser: 'typescript' }));

    console.log(`Removed ${pageName} links from Navbar files`);
  } else {
    console.log('Skipping navbar link removal (no route path found)');
  }
}

function removeLinksByPath(content: string, routePath: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;
  let skipUntilClosing = false;
  
  while (i < lines.length) {
    const line = lines[i];
    
    if (skipUntilClosing) {
      if (line.includes('</Link>')) {
        skipUntilClosing = false;
      }
      i++;
      continue;
    }
    
    if (line.includes('<Link') && line.includes(`to="${routePath}"`)) {
      if (line.includes('</Link>')) {
        i++;
        continue;
      } else {
        skipUntilClosing = true;
        i++;
        continue;
      }
    }
    
    result.push(line);
    i++;
  }
  
  return result.join('\n');
}