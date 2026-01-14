import fs from "node:fs";

export function fileExists(path: string): boolean {
  return fs.existsSync(path);
}

export type Prefab = {
  label: string;
  enabled: boolean; 
  enable: () => Promise<void>;
  disable: () => Promise<void>;
};

export const prefabs = {
  blog: {
    label: "Blog",
    enabled: false,
    enable: async () => {
      const { enableBlog } = await import("./blog/enableBlog.js");
      await enableBlog();
      prefabs.blog.enabled = true;
    },
    disable: async () => {
      const { disableBlog } = await import("./blog/disableBlog.js");
      await disableBlog();
      prefabs.blog.enabled = false;
    },
  },

  contact: {
    label: "Contact",
    enabled: false,
    enable: async () => { console.log("Enable Contact"); prefabs.contact.enabled = true; },
    disable: async () => { console.log("Disable Contact"); prefabs.contact.enabled = false; },
  },

  ecommerce: {
    label: "Ecommerce",
    enabled: false,
    enable: async () => { console.log("Enable Ecommerce"); prefabs.ecommerce.enabled = true; },
    disable: async () => { console.log("Disable Ecommerce"); prefabs.ecommerce.enabled = false; },
  },

  staff: {
    label: "Staff",
    enabled: false,
    enable: async () => { console.log("Enable Staff"); prefabs.staff.enabled = true; },
    disable: async () => { console.log("Disable Staff"); prefabs.staff.enabled = false; },
  },
};
