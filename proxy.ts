import { withAuth } from 'next-auth/middleware';

export default withAuth;

export const config = {
  matcher: ['/api/admin/:path*', '/api/broadcast'],
};
