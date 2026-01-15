import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { addFeature } from "../../features/addFeature.js";
import { addPage } from "../../pages/addPage.js";
import { cartTemplate } from '../../pages/templates/cartTemplate.js';
import { checkoutTemplate } from '../../pages/templates/checkeoutTemplate.js';
import { ordersTemplate } from '../../pages/templates/ordersTemplate.js';
import { orderCompleteTemplate } from '../../pages/templates/orderCompleteTemplate.js';
import { productsTemplate } from '../../pages/templates/productsTemplate.js';
import { productTemplate } from '../../pages/templates/productTemplate.js';
import { useCartTemplate } from '../../../shared/templates/useCartTemplate.js';
import { ordersApiTemplate } from '../../../shared/templates/ordersApiTemplate.js';
import { orderSummaryTemplate } from '../../../shared/templates/orderSummaryTemplate.js';
import { ordersRoutesTemplate } from '../../../shared/templates/orders.routes.template.js';
import { cartItemTemplate } from '../../../shared/templates/cartItemTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function enableEcommerce() {
    const targetDir = path.resolve(__dirname, '../../../../../web/src/pages/cart');
    const ordersApiPath = path.resolve(__dirname, '../../../../../web/src/app/store/api/ordersApi.ts');
    const ordersRoutePath = path.resolve(__dirname, '../../../../../api/src/routes/orders.routes.ts');
    const orderSummaryDir = path.resolve(__dirname, '../../../../../web/src/features/orderSummary');

    await addFeature({
        featureName: "Product",
        addTimestamps: true,
        addToCms: true,
        schema: {
            name: "Product",
            fields: [
                { name: "product_name", type: "String", required: true },
                { name: "product_category", type: "String", required: true },
                { name: "product_description", type: "String", required: true },
                { name: "product_price", type: "Number", required: true },
                { name: "product_image", type: "String", required: false },
            ],
        },
    });
        
    await addFeature({
        featureName: "Order",
        addTimestamps: true,
        addToCms: true,
        schema: {
            name: "Order",
            fields: [
            {
                name: "order_user_id",
                type: "ObjectId",
                ref: "User",
                required: true,
            },
            {
                name: "order_item_count",
                type: "Number",
                required: true,
            },
            {
                name: "order_items",
                type: "Array",
                required: true,
                ref: "Product",
            },
            {
                name: "order_item_subtotal",
                type: "Number",
                required: true,
            },
            {
                name: "order_item_tax",
                type: "Number",
                required: true,
            },
            {
                name: "order_item_shipping",
                type: "Number",
                required: true,
            },
            {
                name: "order_item_total",
                type: "Number",
                required: true,
            },
            {
                name: "order_paid",
                type: "Boolean",
                required: true,
            },
            {
                name: "order_shipped",
                type: "Boolean",
                required: false,
            },
            {
                name: "order_status",
                type: "String",
                required: true,
                enum: ["pending", "purchased", "completed"],
                default: "pending",
            },
            ],
        },
    });

    await addPage({
        pageName: 'Checkout',
        routePath: '/checkout',
        addToNavbar: false,
        template: checkoutTemplate
    });

    await addPage({
        pageName: 'Cart',
        routePath: '/cart',
        addToNavbar: false,
        template: cartTemplate
    });

    await addPage({
        pageName: 'Orders',
        routePath: '/orders',
        addToNavbar: false,
        template: ordersTemplate
    });

    await addPage({
        pageName: 'OrderComplete',
        routePath: '/order-complete/:id',
        addToNavbar: false,
        template: orderCompleteTemplate
    });

    await addPage({
        pageName: 'Products',
        routePath: '/products',
        addToNavbar: true,
        template: productsTemplate
    });

    await addPage({
        pageName: 'Product',
        routePath: '/product/:id',
        addToNavbar: false,
        template: productTemplate
    });

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = 'CartItem.tsx';
    const content = cartItemTemplate('CartItem');

    fs.writeFileSync(path.join(targetDir, fileName), content, 'utf8');

    const hookFileName = 'useCart.ts';
    const hookContent = useCartTemplate();

    fs.writeFileSync(path.join(targetDir, hookFileName), hookContent, 'utf8');
    
    const ordersApiContent = ordersApiTemplate();

    fs.writeFileSync(ordersApiPath, ordersApiContent, 'utf8');

    const ordersRouteContent = ordersRoutesTemplate();

    fs.writeFileSync(ordersRoutePath, ordersRouteContent, 'utf8');1
    
    if (!fs.existsSync(orderSummaryDir)) {
        fs.mkdirSync(orderSummaryDir, { recursive: true });
    }

    const orderSummaryFileName = 'OrderSummary.tsx';
    const orderSummaryContent = orderSummaryTemplate();

    fs.writeFileSync(path.join(orderSummaryDir, orderSummaryFileName), orderSummaryContent, 'utf8');

}