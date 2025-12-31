import inquirer from 'inquirer';
import chalk from 'chalk';
import generatePage from '../commands/generatePage';
import deletePage from '../commands/deletePage';

export default async function pagesMenu() {
  console.clear();
  console.log(chalk.bold.cyan('\n Page Management\n'));

  const { action } = await inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        { name: 'Create New Page', value: 'create' },
        { name: 'Delete Page', value: 'delete' },
        { name: '← Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  switch (action) {
    case 'create':
      await generatePage();
      await promptReturnToMenu();
      break;
    case 'delete':
      await deletePage();
      await promptReturnToMenu();
      break;
  }
}

async function promptReturnToMenu() {
  const { returnToMenu } = await inquirer.prompt([
    {
      name: 'returnToMenu',
      type: 'confirm',
      message: 'Return to pages menu?',
      default: true,
    },
  ]);

  if (returnToMenu) {
    await pagesMenu();
  } else {
    console.log(chalk.cyan('\n Goodbye!\n'));
    process.exit(0);
  }
}