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
    console.log(chalk.green(`Formatted ${path.basename(filePath)} with Prettier`));
  } catch (error) {
    return;
  }
}

export default async function generatePage() {
  const answers = await inquirer.prompt([
    {
      name: 'pageName',
      type: 'input',
      message: 'Enter the page component name (PascalCase):',
      validate: (input) => {
        if (!input) return 'Page name is required';
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
          return 'Page name must be in PascalCase (e.g., AboutUs, ContactPage)';
        }
        return true;
      }
    },
    {
      name: 'routePath',
      type: 'input',
      message: 'Enter the route path (e.g., /about):',
      validate: (input) => {
        if (!input) return 'Route path is required';
        if (!input.startsWith('/')) return 'Route path must start with /';
        return true;
      }
    },
    {
      name: 'addToNavbar',
      type: 'confirm',
      message: 'Do you want to add this page to the navbar?',
      default: false
    }
  ]);

  const { pageName, routePath, addToNavbar } = answers;
  const frontendPath = path.resolve(__dirname, '../../../web/src/pages');
  const pageDir = path.join(frontendPath, pageName.toLowerCase());
  const pageFile = path.join(pageDir, `${pageName}.tsx`);

  await fs.ensureDir(pageDir);

  const componentTemplate = `import { motion } from 'framer-motion';

const ${pageName} = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-neutral minus-nav relative z-0 p-4"
    >
      ${pageName}
    </motion.div>
  );
};

export default ${pageName};
`;

  await fs.writeFile(pageFile, componentTemplate);
  console.log(chalk.green(`Page component created at ${pageFile}`));
  await formatWithPrettier(pageFile);

  const appFile = path.resolve(frontendPath, '../App.tsx');
  let appContent = await fs.readFile(appFile, 'utf-8');

  const importStatement = `import ${pageName} from './pages/${pageName.toLowerCase()}/${pageName}';`;
  if (!appContent.includes(importStatement)) {
    const lastImportIndex = appContent.lastIndexOf('import ');
    const endOfLastImport = appContent.indexOf('\n', lastImportIndex);
    appContent = 
      appContent.slice(0, endOfLastImport + 1) + 
      importStatement + '\n' + 
      appContent.slice(endOfLastImport + 1);
  }

  const routeTag = `<Route path="${routePath}" element={<${pageName} />} />`;
  if (!appContent.includes(routeTag)) {
    const markerRegex = /(\s*{\/\*\s*new routes inserted here\s*\*\/})/;
    if (markerRegex.test(appContent)) {
      appContent = appContent.replace(markerRegex, `  ${routeTag}\n$1`);
    } else {
      console.log(chalk.yellow('Could not find route marker comment. Adding route before </Routes>'));
      appContent = appContent.replace('</Routes>', `  ${routeTag}\n        </Routes>`);
    }
  }

  await fs.writeFile(appFile, appContent);
  console.log(chalk.green(`Route added to App.tsx`));
  await formatWithPrettier(appFile);

  if (addToNavbar) {
    await updateNavbar(pageName, routePath);
    await updateDrawerNavbar(pageName, routePath);
  }

  console.log(chalk.bold.green('\n Page generation complete!\n'));
}

async function updateNavbar(pageName: string, routePath: string) {
  const navbarFile = path.resolve(__dirname, '../../../web/src/features/navbar/Navbar.tsx');
  let navbarContent = await fs.readFile(navbarFile, 'utf-8');

  const newLink = `<Link className="px-4" to="${routePath}">\n          ${pageName}\n        </Link>`;

  const markerRegex = /(\s*{\/\*\s*new links inserted here\s*\*\/})/;
  if (markerRegex.test(navbarContent)) {
    navbarContent = navbarContent.replace(markerRegex, `${newLink}\n        $1`);
    await fs.writeFile(navbarFile, navbarContent);
    console.log(chalk.green(`Link added to Navbar.tsx`));
    await formatWithPrettier(navbarFile);
  } else {
    console.log(chalk.yellow('⚠ Could not find navbar link marker comment. Skipping Navbar update.'));
  }
}

async function updateDrawerNavbar(pageName: string, routePath: string) {
  const drawerNavbarFile = path.resolve(__dirname, '../../../web/src/features/drawer/DrawerNavbar.tsx');
  
  const fileExists = await fs.pathExists(drawerNavbarFile);
  if (!fileExists) {
    console.log(chalk.yellow('⚠ DrawerNavbar.tsx not found. Skipping drawer navbar update.'));
    return;
  }

  let drawerContent = await fs.readFile(drawerNavbarFile, 'utf-8');

  const newLink = `<Link onClick={closeOnClick} className={classString("${routePath}")} to="${routePath}">${pageName}</Link>`;

  const markerRegex = /(\s*{\/\*\s*new routes inserted here\s*\*\/})/;
  if (markerRegex.test(drawerContent)) {
    drawerContent = drawerContent.replace(markerRegex, `${newLink}\n            $1`);
    await fs.writeFile(drawerNavbarFile, drawerContent);
    console.log(chalk.green(`Link added to DrawerNavbar.tsx`));
    await formatWithPrettier(drawerNavbarFile);
  } else {
    console.log(chalk.yellow('⚠ Could not find drawer navbar link marker comment. Skipping DrawerNavbar update.'));
  }
}