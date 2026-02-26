// Server-side cookie management for Next.js
// These functions are no longer needed as Next.js handles cookies differently
// Use cookies() from 'next/headers' in Server Components or API routes

export const setSessionCookies = async (data: {
  access_token: string;
  refresh_token: string;
}) => {
  // This is now handled client-side or via API routes
  return { success: true };
};

export const clearSessionCookies = async () => {
  // This is now handled client-side or via API routes
  return { success: true };
};

