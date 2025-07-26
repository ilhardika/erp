import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignOutButton,
  useUser,
} from "@clerk/react-router";
import { Button } from "./ui/button";

export function Header() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title - Mobile First */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              BizFlow ERP+POS
            </h1>
            <span className="hidden sm:block text-xs sm:text-sm text-gray-500">
              Sistem Manajemen Bisnis Terpadu
            </span>
          </div>

          {/* User Section - Mobile First */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isSignedIn ? (
              <>
                {/* User Info - Hidden on mobile */}
                <span className="hidden md:block text-sm text-gray-600">
                  Selamat datang,{" "}
                  {user.firstName || user.emailAddresses[0].emailAddress}!
                </span>

                {/* Mobile: Show only UserButton */}
                <div className="sm:hidden">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </div>

                {/* Desktop: Show UserButton + Explicit Logout */}
                <div className="hidden sm:flex items-center space-x-3">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8",
                      },
                    }}
                  />
                  <SignOutButton>
                    <Button variant="outline" size="sm" className="text-xs">
                      Keluar
                    </Button>
                  </SignOutButton>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Masuk
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="text-xs sm:text-sm">
                    Daftar
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
