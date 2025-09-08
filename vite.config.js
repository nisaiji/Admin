import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "public/firebase-messaging-sw.js",
          dest: ".",
          transform: (contents) =>
            contents
              .toString()
              .replace(/__API_KEY__/g, process.env.VITE_API_KEY)
              .replace(/__AUTH_DOMAIN__/g, process.env.VITE_AUTH_DOMAIN)
              .replace(/__PROJECT_ID__/g, process.env.VITE_PROJECT_ID)
              .replace(/__STORAGE_BUCKET__/g, process.env.VITE_STORAGE_BUCKET)
              .replace(
                /__MESSAGING_SENDER_ID__/g,
                process.env.VITE_MESSAGING_SENDER_ID
              )
              .replace(/__APP_ID__/g, process.env.VITE_APP_ID)
              .replace(/__MEASUREMENT_ID__/g, process.env.VITE_MEASUREMENT_ID),
        },
      ],
    }),
  ],
});
