import { featuresMenu } from "../entities/features/menu.js";
import { pagesMenu } from "../entities/pages/menu.js";
import { showMenu } from "../shared/menu.js";

export async function run() {
  const domain = await showMenu('What would you like to manage?', [
    { label: 'Pages', value: 'pages' },
    { label: 'Features', value: 'features' },
  ]);

  switch (domain) {
    case 'pages':
      await pagesMenu();
      break;
    case 'features':
      await featuresMenu();
      break;
  }
}
