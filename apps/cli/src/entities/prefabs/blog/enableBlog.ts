import { addFeature } from "../../features/addFeature.js";
import { addPage } from "../../pages/addPage.js";
import { blogPostTemplate } from "../../pages/templates/blogPostTemplate.js";
import { blogTemplate } from "../../pages/templates/blogTemplate.js";

const blogPosts = [
    {post_title: 'Test Blog Post', post_body: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p> <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>', post_author: 'Test Admin', post_category: 'Uncategorized', post_image: 'https://pinewoodchristian.org/header-placeholder/'}
]

export async function enableBlog() {
    await addPage({
        pageName: 'Blog',
        routePath: '/blog',
        addToNavbar: true,
        template: blogTemplate
    });

    await addPage({
        pageName: 'BlogPost',
        routePath: '/blog/:id',
        addToNavbar: false,
        template: blogPostTemplate
    });

    await addFeature({
        featureName: "BlogPost",
        addTimestamps: true,
        addToCms: true,
        schema: {
            name: "BlogPost",
            fields: [
                { name: "post_title", type: "String", required: true },
                { name: "post_body", type: "String", required: true },
                { name: "post_author", type: "String", required: true },
                { name: "post_category", type: "String", required: true },
                { name: "post_image", type: "String", required: false },
            ],
        },
    });
}