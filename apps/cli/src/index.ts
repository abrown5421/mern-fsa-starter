#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import pagesMenu from './menus/pagesMenu';

export async function mainMenu() {
  console.clear();
  console.log(chalk.bold.cyan('\n MERN FSA Starter CLI\n'));

  const { action } = await inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'Manage Pages',
        'Exit',
      ],
    },
  ]);

  switch (action) {
    case 'Manage Pages':
      await pagesMenu();
      break;
    case 'Exit':
      console.log(chalk.cyan('\n Goodbye!\n'));
      process.exit(0);
      break;
  }
}

mainMenu();