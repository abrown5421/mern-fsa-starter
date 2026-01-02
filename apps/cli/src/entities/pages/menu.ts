import { showMenu } from "../../shared/menu.js";
import { addPage } from "./addPage.js";

export async function pagesMenu() {
  const action = await showMenu('Pages: What would you like to do?', [
    { label: 'Add page', value: 'add' },
    { label: 'Edit page', value: 'edit' },
    { label: 'Delete page', value: 'delete' },
  ]);

  if (action === 'add') {
    await addPage();
    return;
  }

  console.log(`Pages → ${action} (not implemented yet)`);
}
