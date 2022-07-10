import { defineConfig } from '@modern-js/module-tools';

export type Config = Parameters<typeof defineConfig>[0];

export const commonConfig: Config = {
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
};
