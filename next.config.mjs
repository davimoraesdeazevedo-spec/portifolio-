/** @type {import('next').NextConfig} */

// In the Base44 sandbox the preview is served from a different public origin
// (https://3000-<suffix>) than the dev server, and Next.js blocks dev assets and
// HMR requests whose Origin is not allowed. Allow the preview origin only when
// the sandbox flag is explicitly "1"; otherwise keep the original behavior.
const allowedDevOrigins = [];
if (process.env.BASE44_PREVIEW_MODE === '1' && process.env.BASE44_PUBLIC_HOST_SUFFIX) {
  allowedDevOrigins.push('3000-' + process.env.BASE44_PUBLIC_HOST_SUFFIX);
}

const nextConfig = {
  allowedDevOrigins,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
