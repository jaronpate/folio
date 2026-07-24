import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const resumeHtml = resolve(root, 'public/resume/index.html');
const outputPath = resolve(
    process.argv[2] ?? resolve(root, 'public/resume/paper.pdf'),
);

async function main() {
    await mkdir(dirname(outputPath), { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(`file://${resumeHtml}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
        await document.fonts.ready;
    });

    await page.pdf({
        path: outputPath,
        format: 'Letter',
        printBackground: true,
        margin: {
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
        },
    });

    await browser.close();
    console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
