import fs from 'node:fs';
import path from 'node:path';
import { input, confirm } from '@inquirer/prompts';
import { isPascalCase, toCamelCase } from '../../shared/case.js';
import { pagesDir } from '../../shared/paths.js';
import { pageTemplate } from './templates/pageTemplate.js';
import { updateAppRoutes } from './updateAppRoutes.js';
import { updateNavbar } from './updateNavbar.js';

export async function addPage() {
  const pageName = await input({
    message: 'Enter page name (PascalCase):',
    validate: (value) =>
      isPascalCase(value) || 'Page name must be PascalCase',
  });

  const routePath = await input({
    message: 'Enter route path (must start with /):',
    validate: (value) =>
      value.startsWith('/') || 'Path must start with "/"',
  });

  const addToNavbar = await confirm({
    message: 'Add this page to the navbar?',
    default: true,
  });
  
  const camelName = toCamelCase(pageName);
  const pageFolder = path.join(pagesDir, camelName);
  const pageFile = path.join(pageFolder, `${pageName}.tsx`);

  if (fs.existsSync(pageFolder)) {
    throw new Error(`Page "${pageName}" already exists`);
  }

  if (addToNavbar) {
    await updateNavbar(pageName, routePath);
    console.log(`Page "${pageName}" added to the navbar`);
  }

  fs.mkdirSync(pageFolder, { recursive: true });
  fs.writeFileSync(pageFile, pageTemplate(pageName));

  await updateAppRoutes({
    pageName,
    camelName,
    routePath,
  });

  console.log(`Page "${pageName}" created at ${routePath}`);
}
