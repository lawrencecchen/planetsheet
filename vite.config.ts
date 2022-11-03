import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import Unocss from "unocss/vite";
import { presetWind, presetIcons, presetTypography } from "unocss";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    rakkas(),
    Unocss({
      presets: [
        presetWind(),
        presetIcons({
          extraProperties: {
            display: "inline-block",
            "vertical-align": "middle",
          },
        }),
        presetTypography(),
      ],
    }),
  ],
});
