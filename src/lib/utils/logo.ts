/**
 * Load * TKI logo PNG and convert to base64 data URL
 * This uses fetch to work in both client and server contexts
 */
export async function getTKILogoDataUrl(): Promise<string> {
  try {
    const response = await fetch('/logo-tki.png');
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load TKI logo:', error);
    // Fallback to a transparent 1x1 PNG if file cannot be loaded
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
}