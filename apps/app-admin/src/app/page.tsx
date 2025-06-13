import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    const adminRole = cookieStore.get('adminRole');

    return !!(
      accessToken &&
      adminRole &&
      (adminRole.value === 'MANAGER' || adminRole.value === 'SUPER_ADMIN')
    );
  } catch {
    return false;
  }
}

export default async function Home() {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect('/login');
  }

  // Show hello message for authenticated admin
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">Hello Admin!</h1>
        <p className="text-xl text-black mb-8">Welcome to the admin portal</p>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="border border-black text-black px-6 py-3 font-medium hover:bg-black hover:text-white transition duration-200"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
