import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '~CardLib': path.resolve(__dirname, './CardLib'),
      '~Games': path.resolve(__dirname, './Games'),
      '~Images': path.resolve(__dirname, './Images')
    }
  }
});
