TOOL016 12MP-class native camera allowance patch

Evidence from real Android device:
- Camera photo decoded as 3024 x 4032 = 12,192,768 pixels
- Existing maxPixels = 12,000,000 -> rejected by 192,768 pixels
- Screenshot decoded as 1080 x 2400 = 2,592,000 pixels -> passed
- decodeError = null in both diagnostics

Patch:
1) Removes temporary TOOL016 HARD DIAG UI by restoring clean component source.
2) Changes TOOL016 maxPixels from 12,000,000 to 12,500,000.
3) Keeps maxSide=6000 and maxFileBytes=15 MiB unchanged.
4) Does NOT modify StableMobileImageFileInput or TOOL001 golden mobile capture path.

Important correction:
The uploaded chat copy of a phone screenshot can be resized by the chat/file pipeline. The real device diagnostic showed the native S21+ screenshot size 1080x2400. Therefore this patch does not alter the common mobile capture code.

After overlay/deploy, retest TOOL016 with the same Camera slot 1 photo.
Expected: attachment should pass the pixel limit and proceed to preview/workflow.
