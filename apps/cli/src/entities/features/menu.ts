import { showMenu } from "../../shared/menu.js";
import { addFeature } from "./addFeature.js";

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
        try {
          await addFeature();
        } catch (error) {
          if (error instanceof Error) {
            console.error(`\n Error: ${error.message}\n`);
          } else {
            console.error('\n An unexpected error occurred\n');
          }
        }
        break;
      case 'delete':
        console.log('Delete feature functionality coming soon!');
        break;
      case 'back':
        back = true;
        break;
      default:
        console.log(`Features → ${action} (not implemented yet)`);
    }
  }
}