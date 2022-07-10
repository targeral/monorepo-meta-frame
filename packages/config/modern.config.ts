import { defineConfig } from '@modern-js/module-tools';

// https://modernjs.dev/docs/apis/config/overview
export default defineConfig({
  output: {
    buildConfig: [
      {
        buildType: 'bundleless',
      },
      {
        enableDts: true,
        dtsOnly: true,
        outputPath: './types',
      },
    ],
  },
});
