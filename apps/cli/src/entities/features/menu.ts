import { showMenu } from "../../shared/menu.js";

export async function featuresMenu() {
  let back = false;

  while (!back) {
    const action = await showMenu('Features: What would you like to do?', [
        { label: 'Add feature', value: 'add' },
        { label: 'Delete feature', value: 'delete' },
        { label: 'Back to Main Menu', value: 'back' }, 
    ]);

    switch (action) {
      case 'add':
        await console.log('add');
        break;
      case 'delete':
        await console.log('del');
        break;
      case 'back':
        back = true;
        break;
      default:
        console.log(`Pages → ${action} (not implemented yet)`);
    }
  }
}
