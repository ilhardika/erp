import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignOutButton,
  useUser,
} from "@clerk/react-router";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import DropdownNavigation from "./ui/DropdownNavigation";
import { useState } from "react";

const MobileProductDropdown = ({ onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const productItems = [
    {
      name: "Semua Produk",
      href: "/products",
      description: "Kelola produk & inventori",
    },
    {
      name: "Kategori",
      href: "/categories",
      description: "Kelola kategori produk",
    },
  ];

  const isGroupActive = productItems.some(
    (item) =>
      location.pathname === item.href || location.pathname.startsWith(item.href)
  );

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (href) => {
    setIsOpen(false);
    onLinkClick();
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
          isGroupActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center">
          <span className="mr-3 text-gray-400">📦</span>
          <span>Produk</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="ml-6 mt-1 space-y-1">
          {productItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => handleItemClick(item.href)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function Header() {
  const { isSignedIn, user } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [{ name: "Dashboard", href: "/dashboard" }];

  const catalogNavigation = {
    title: "Katalog",
    items: [
      {
        name: "Produk",
        href: "/products",
        icon: "📦",
        description: "Kelola produk & inventori",
      },
      {
        name: "Kategori",
        href: "/categories",
        icon: "📂",
        description: "Kelola kategori produk",
      },
    ],
  };

  const isActive = (href) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Mobile Menu + Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button - moved to left */}
            {isSignedIn && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}

            <Link
              to="/dashboard"
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                BizFlow ERP
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <DropdownNavigation
                title={catalogNavigation.title}
                items={catalogNavigation.items}
              />
            </nav>
          )}

          {/* Right Section - Auth only */}
          <div className="flex items-center">
            {/* Auth Buttons */}
            {!isSignedIn ? (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Masuk
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Daftar</Button>
                </SignUpButton>
              </div>
            ) : (
              <div className="hidden md:block">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu - slide from left */}
        {isSignedIn && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
              <div className="p-4">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* User Profile in Mobile */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10",
                        },
                      }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user?.primaryEmailAddress?.emailAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span className="mr-3 text-gray-400">📊</span>
                      {item.name}
                    </Link>
                  ))}

                  {/* Mobile Product Dropdown */}
                  <MobileProductDropdown
                    onLinkClick={() => setIsMobileMenuOpen(false)}
                  />
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
