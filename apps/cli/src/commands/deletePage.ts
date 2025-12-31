import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

async function formatWithPrettier(filePath: string) {
  try {
    const prettier = await import('prettier');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const parser = filePath.endsWith('.tsx') || filePath.endsWith('.ts') 
      ? 'typescript' 
      : 'babel';
    
    const formatted = await prettier.format(fileContent, {
      parser,
      filepath: filePath,
      singleQuote: true,
      trailingComma: 'es5',
      tabWidth: 2,
      semi: true,
    });
    
    await fs.writeFile(filePath, formatted);
    console.log(chalk.green(`Formatted ${path.basename(filePath)}`));
  } catch (error) {
    return;
  }
}

export default async function deletePage() {
  const frontendPath = path.resolve(__dirname, '../../../web/src/pages');
  
  const pageDirectories = await fs.readdir(frontendPath);
  const validPages = [];

  for (const dir of pageDirectories) {
    const dirPath = path.join(frontendPath, dir);
    const stats = await fs.stat(dirPath);
    
    if (stats.isDirectory()) {
      const files = await fs.readdir(dirPath);
      const hasComponent = files.some(file => file.endsWith('.tsx'));
      if (hasComponent) {
        validPages.push(dir);
      }
    }
  }

  if (validPages.length === 0) {
    console.log(chalk.yellow('\n⚠ No pages found to delete.\n'));
    return;
  }

  const { selectedPage } = await inquirer.prompt([
    {
      name: 'selectedPage',
      type: 'list',
      message: 'Select a page to delete:',
      choices: [
        ...validPages,
        new inquirer.Separator(),
        'Cancel',
      ],
    },
  ]);

  if (selectedPage === 'Cancel') {
    console.log(chalk.gray('\nDeletion cancelled.\n'));
    return;
  }

  const { confirmDelete } = await inquirer.prompt([
    {
      name: 'confirmDelete',
      type: 'confirm',
      message: chalk.red(`Are you sure you want to delete the "${selectedPage}" page? This cannot be undone.`),
      default: false,
    },
  ]);

  if (!confirmDelete) {
    console.log(chalk.gray('\nDeletion cancelled.\n'));
    return;
  }

  console.log(chalk.cyan(`\n Deleting "${selectedPage}" page...\n`));

  const pageDir = path.join(frontendPath, selectedPage);
  await fs.remove(pageDir);
  console.log(chalk.green(`Deleted page directory: ${selectedPage}/`));

  const pageName = selectedPage
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  await removeFromAppTsx(pageName, selectedPage);
  await removeFromNavbar(pageName);
  await removeFromDrawerNavbar(pageName);

  console.log(chalk.bold.green(`\n Page "${selectedPage}" successfully deleted!\n`));
}

async function removeFromAppTsx(pageName: string, directoryName: string) {
  const appFile = path.resolve(__dirname, '../../../web/src/App.tsx');
  let appContent = await fs.readFile(appFile, 'utf-8');

  const importRegex = new RegExp(`import ${pageName} from ['"]\\.\\/pages\\/${directoryName}\\/${pageName}['"];?\\n?`, 'g');
  appContent = appContent.replace(importRegex, '');

  const routeRegex = new RegExp(`\\s*<Route[^>]*element={<${pageName}[^>]*\\/>}[^>]*\\/>\\n?`, 'g');
  appContent = appContent.replace(routeRegex, '');

  await fs.writeFile(appFile, appContent);
  console.log(chalk.green(`Removed route from App.tsx`));
  await formatWithPrettier(appFile);
}

async function removeFromNavbar(pageName: string) {
  const navbarFile = path.resolve(__dirname, '../../../web/src/features/navbar/Navbar.tsx');
  
  const fileExists = await fs.pathExists(navbarFile);
  if (!fileExists) {
    return;
  }

  let navbarContent = await fs.readFile(navbarFile, 'utf-8');

  const linkRegex = new RegExp(`\\s*<Link[^>]*>\\s*${pageName}\\s*<\\/Link>\\n?`, 'g');
  navbarContent = navbarContent.replace(linkRegex, '');

  await fs.writeFile(navbarFile, navbarContent);
  console.log(chalk.green(`Removed link from Navbar.tsx`));
  await formatWithPrettier(navbarFile);
}

async function removeFromDrawerNavbar(pageName: string) {
  const drawerNavbarFile = path.resolve(__dirname, '../../../web/src/features/navbar/NavbarDrawer.tsx');
  
  const fileExists = await fs.pathExists(drawerNavbarFile);
  if (!fileExists) {
    return;
  }

  let drawerContent = await fs.readFile(drawerNavbarFile, 'utf-8');

  const linkRegex = new RegExp(`\\s*<Link[^>]*>\\s*${pageName}\\s*<\\/Link>\\n?`, 'g');
  drawerContent = drawerContent.replace(linkRegex, '');

  await fs.writeFile(drawerNavbarFile, drawerContent);
  console.log(chalk.green(`Removed link from DrawerNavbar.tsx`));
  await formatWithPrettier(drawerNavbarFile);
}