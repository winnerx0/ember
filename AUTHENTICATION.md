# Authentication

The app now requires authentication for all protected routes. Guest mode has been removed.

## Authentication Flow

1. **Public Routes** (no auth required):
   - `/` - Landing page
   - `/auth` - Sign in page

2. **Protected Routes** (auth required):
   - `/app` - Project dashboard
   - `/app/:projectId` - ERD editor
   - `/profile` - User profile
   - `/settings` - User settings

## Implementation

### Middleware Protection

Server-side middleware (`src/middleware.ts`) checks for authentication on all non-public routes:

```typescript
// Check for session - all /app routes require authentication
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  // Redirect to auth page
  return redirect("/auth");
}
```

### Client-Side Protection

Each protected route also has a `beforeLoad` check that redirects to `/auth`:

```typescript
beforeLoad: async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw redirect({ to: "/auth" });
  }
}
```

This provides double protection:
1. Server-side redirect (middleware)
2. Client-side redirect (route guards)

## Sign In Methods

Currently supported:
- **Google OAuth** - Primary authentication method

## User Experience

1. User visits any `/app/*` route without authentication
2. User is automatically redirected to `/auth` page
3. User signs in with Google
4. After successful authentication, user is redirected to `/app`
5. Session is maintained across page refreshes

## Session Management

- Sessions are managed by Supabase Auth
- Session tokens are stored in cookies
- Auth state is checked on every protected route access
- Users can sign out from the settings page

## Future Enhancements

Potential authentication improvements:
- Email/password authentication
- Magic link authentication
- Two-factor authentication (2FA)
- Social auth providers (GitHub, Microsoft, etc.)
- Session timeout warnings
- Remember me functionality
