import { showMenu } from "../../shared/menu.js";

export async function featuresMenu() {
  const action = await showMenu('Features: What would you like to do?', [
    { label: 'Add feature', value: 'add' },
    { label: 'Edit feature', value: 'edit' },
    { label: 'Delete feature', value: 'delete' },
  ]);

  console.log(`Features → ${action}`);
}
