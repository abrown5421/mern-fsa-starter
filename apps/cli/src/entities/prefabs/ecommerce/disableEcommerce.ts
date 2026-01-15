import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deleteFeature } from '../../features/deleteFeature.js';
import { deletePage } from '../../pages/deletePage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function disableEcommerce() {
    const cartDir = path.resolve(__dirname, '../../../../../web/src/pages/cart');
    const ordersApiPath = path.resolve(__dirname, '../../../../../web/src/app/store/api/ordersApi.ts');
    const orderSummaryDir = path.resolve(__dirname, '../../../../../web/src/features/orderSummary');

    await deleteFeature({ featureName: "Product" });
    await deleteFeature({ featureName: "Order" });

    await deletePage({ pageName: 'Checkout' });
    await deletePage({ pageName: 'Cart' });
    await deletePage({ pageName: 'Orders' });
    await deletePage({ pageName: 'OrderComplete' });
    await deletePage({ pageName: 'Products' });
    await deletePage({ pageName: 'Product' });

    const cartFiles = ['CartItem.tsx', 'useCart.ts'];
    cartFiles.forEach(file => {
        const filePath = path.join(cartDir, file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`${file} deleted from ${cartDir}`);
        }
    });

    if (fs.existsSync(ordersApiPath)) {
        fs.unlinkSync(ordersApiPath);
        console.log(`ordersApi.ts deleted from ${ordersApiPath}`);
    }

    if (fs.existsSync(orderSummaryDir)) {
        fs.rmSync(orderSummaryDir, { recursive: true, force: true });
        console.log(`OrderSummary folder deleted from ${orderSummaryDir}`);
    }

    if (fs.existsSync(cartDir) && fs.readdirSync(cartDir).length === 0) {
        fs.rmdirSync(cartDir);
        console.log(`Cart folder removed as it is now empty`);
    }
}
