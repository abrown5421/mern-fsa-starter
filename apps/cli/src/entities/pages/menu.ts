import { showMenu } from "../../shared/menu.js";

export async function pagesMenu() {
  const action = await showMenu('Pages: What would you like to do?', [
    { label: 'Add page', value: 'add' },
    { label: 'Edit page', value: 'edit' },
    { label: 'Delete page', value: 'delete' },
  ]);

  console.log(`Pages → ${action}`);
}
