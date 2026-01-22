import { useMemo } from "react";
import { type BrandingStrings, brandingStrings } from "@calunga-ui/common";

/**
 * Process branding strings to replace template variables with actual values.
 * Specifically replaces <%= brandingRoot %> with the actual branding path.
 */
const processBrandingStrings = (raw: BrandingStrings): BrandingStrings => {
  // Determine the branding root path based on the environment
  const publicPath = import.meta.env.PUBLIC_PATH || "/";

  // Remove trailing slash and append /branding
  const brandingRoot = publicPath.replace(/\/$/, "") + "/branding";

  // Helper function to replace template variables in a string
  const replaceTemplateVars = (str: string): string => {
    return str.replace(/<%= brandingRoot %>/g, brandingRoot);
  };

  // Deep clone and process the branding strings
  const processed: BrandingStrings = {
    application: { ...raw.application },
    about: {
      ...raw.about,
      imageSrc: raw.about.imageSrc
        ? replaceTemplateVars(raw.about.imageSrc)
        : undefined,
    },
    masthead: {
      ...raw.masthead,
      leftBrand: raw.masthead.leftBrand
        ? {
            ...raw.masthead.leftBrand,
            src: replaceTemplateVars(raw.masthead.leftBrand.src),
          }
        : undefined,
      rightBrand: raw.masthead.rightBrand
        ? {
            ...raw.masthead.rightBrand,
            src: replaceTemplateVars(raw.masthead.rightBrand.src),
          }
        : undefined,
    },
  };

  return processed;
};

/**
 * Wrap the branding strings in a hook so components access it in a standard
 * React way instead of a direct import.  This allows the branding implementation
 * to change in future with a minimal amount of refactoring in existing components.
 */
export const useBranding = (): BrandingStrings => {
  return useMemo(() => processBrandingStrings(brandingStrings), []);
};

export default useBranding;
