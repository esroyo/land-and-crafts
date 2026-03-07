import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'list',
    use: {
        baseURL: process.env.CI
            ? 'http://localhost:8000'
            : 'http://localhost:4321',
        trace: 'on-first-retry',
    },
    webServer: {
        command: process.env.CI ? 'deno task preview' : 'deno task dev',
        url: process.env.CI ? 'http://localhost:8000' : 'http://localhost:4321',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
