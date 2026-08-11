type FileInputWithShowPicker = HTMLInputElement & { showPicker?: () => void };

export function openFilePicker(input: HTMLInputElement | null) {
  if (!input) return;
  const picker = input as FileInputWithShowPicker;
  if (typeof picker.showPicker === 'function') {
    try {
      picker.showPicker();
      return;
    } catch {
      // Older/partial mobile implementations can expose showPicker but reject it.
    }
  }
  input.click();
}
