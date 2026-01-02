import { showMenu } from "../../shared/menu.js";
import { addPage } from "./addPage.js";
import { deletePage } from "./deletePage.js";

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

  if (action === 'delete') {
    await deletePage();
    return;
  }

  console.log(`Pages → ${action} (not implemented yet)`);
}
