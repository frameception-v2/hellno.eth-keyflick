import { ImageResponse } from "next/og";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = PROJECT_TITLE;
export const contentType = "image/png";

// Function to load font with error handling
async function loadFont(fontPath: string): Promise<Buffer> {
  try {
    const fontData = readFileSync(fontPath);
    return fontData;
  } catch (error) {
    // Fallback to loading from absolute path
    try {
      const absolutePath = join(
        process.cwd(),
        "public",
        "fonts",
        fontPath.split("/").pop()!
      );
      return readFileSync(absolutePath);
    } catch (fallbackError) {
      throw new Error(`Failed to load font ${fontPath}: ${error}`);
    }
  }
}

// Create reusable options object
let imageOptions: any = null;

// Initialize fonts
async function initializeFonts() {
  if (imageOptions) return imageOptions;

  try {
    const regularFont = await loadFont(
      join(process.cwd(), "public/fonts/Nunito-Regular.ttf")
    );
    const semiBoldFont = await loadFont(
      join(process.cwd(), "public/fonts/Nunito-SemiBold.ttf")
    );

    imageOptions = {
      width: 1200,
      height: 800, // Adjusted height for more content
      fonts: [
        {
          name: "Nunito",
          data: regularFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Nunito",
          data: semiBoldFont,
          weight: 600,
          style: "normal",
        },
      ],
    };

    return imageOptions;
  } catch (error) {
    throw error;
  }
}

export default async function Image() {
  const options = await initializeFonts();

  const BACKGROUND_GRADIENT_START = "#2c3e50"; // Slightly different dark blue/grey
  const BACKGROUND_GRADIENT_END = "#4ca1af"; // Tealish end color
  const WARNING_COLOR = "#facc15"; // Yellow for warning (kept)
  const TEXT_COLOR = "#f9fafb"; // Light text (kept)

  const BACKGROUND_GRADIENT_STYLE = {
    backgroundImage: `linear-gradient(to bottom right, ${BACKGROUND_GRADIENT_START}, ${BACKGROUND_GRADIENT_END})`, // Changed gradient direction
    color: TEXT_COLOR,
  };

  /*
  Satori documentation: https://github.com/vercel/satori#css
  */
  return new ImageResponse(
    (
      <div
        tw="h-full w-full flex flex-col justify-center items-center relative p-10" // Added padding
        style={BACKGROUND_GRADIENT_STYLE}
      >
        {/* Changed Icon */}
        <h1 tw="text-7xl text-center font-semibold mb-4">⚡️ {PROJECT_TITLE}</h1>
        <h3 tw="text-3xl font-normal text-center mb-8">{PROJECT_DESCRIPTION}</h3>
        {/* Warning Message */}
        <div tw="flex items-center justify-center p-4 border-2 rounded-lg" style={{ borderColor: WARNING_COLOR }}>
           <span tw="text-4xl mr-4" style={{ color: WARNING_COLOR }}>⚠️</span>
           <h3 tw="text-3xl font-semibold text-center" style={{ color: WARNING_COLOR }}>
             NEVER use these keys for significant funds! <br/> They are generated in your browser and are not secure.
           </h3>
        </div>
      </div>
    ),
    options
  );
}
