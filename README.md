# Folio

portfolio/blog site

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

## Production

```bash
# Build the project
bun run build

# Preview the production build
bun run preview
```

## Resume PDF

Converts `public/resume/index.html` to a Letter-size PDF.

```bash
# One-time: install Chromium for Playwright
bunx playwright install chromium

# Generate PDF (writes public/resume/jaron-pate-resume.pdf)
bun run resume:pdf

# Optional custom output path
bun run resume:pdf ./out/resume.pdf
```
