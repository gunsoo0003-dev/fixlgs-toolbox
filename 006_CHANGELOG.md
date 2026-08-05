# TOOLBOX 006 Image Resizer

## Added
- `/ko|en|ja/image-resizer`
- Pixel, percentage, long-edge, and short-edge resize modes
- Aspect-ratio lock and maximum-box fit
- Prevent/allow upscaling
- Batch and per-file settings, exclusion, reorder, delete, retry, reset
- Expected dimensions before processing
- JPG/PNG/WebP format preservation, transparency, EXIF orientation normalization
- Animated WebP/APNG rejection, signature checks, duplicate prevention
- Individual and ZIP downloads
- Korean, English, and Japanese page content, FAQ, structured data, canonical/hreflang
- Sitemap, category card, validation registry, and Playwright suite registration

## Verification status in this delivery environment
- Source-level integration completed.
- `npm run build` and Playwright could not be executed because the review archive intentionally excluded `node_modules`, and the available package registry did not provide `@playwright/test`.
- Run the included commands in the original project after overlaying this archive.
