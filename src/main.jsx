import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { ClerkProvider } from "@clerk/react-router";
import "./index.css";
import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Clerk localization lengkap untuk bahasa Indonesia
const clerkLocalization = {
  signIn: {
    start: {
      title: "Masuk ke BizFlow ERP+POS",
      subtitle: "Selamat datang kembali! Silakan masuk ke akun Anda.",
      actionText: "Belum punya akun?",
      actionLink: "Daftar",
    },
    emailCode: {
      title: "Periksa email Anda",
      subtitle: "untuk melanjutkan ke BizFlow ERP+POS",
      formTitle: "Kode verifikasi",
      formSubtitle:
        "Masukkan kode verifikasi yang dikirim ke alamat email Anda",
      resendButton: "Kirim ulang kode",
    },
    password: {
      title: "Masukkan kata sandi Anda",
      subtitle: "untuk melanjutkan ke BizFlow ERP+POS",
      formTitle: "Kata sandi",
      formSubtitle: "Masukkan kata sandi yang terkait dengan akun Anda",
    },
  },
  signUp: {
    start: {
      title: "Buat akun Anda",
      subtitle: "Selamat datang! Silakan isi detail untuk memulai.",
      actionText: "Sudah punya akun?",
      actionLink: "Masuk",
    },
    emailCode: {
      title: "Verifikasi alamat email Anda",
      subtitle: "untuk melanjutkan ke BizFlow ERP+POS",
      formTitle: "Kode verifikasi",
      formSubtitle:
        "Masukkan kode verifikasi yang dikirim ke alamat email Anda",
      resendButton: "Kirim ulang kode",
    },
  },
  userProfile: {
    navbar: {
      title: "Profil",
      description: "Kelola informasi profil Anda.",
    },
  },
  userButton: {
    action__manageAccount: "Kelola akun",
    action__signOut: "Keluar",
    action__signOutAll: "Keluar dari semua perangkat",
  },
  // Form labels
  formFieldLabel__emailAddress: "Alamat email",
  formFieldLabel__password: "Kata sandi",
  formFieldLabel__firstName: "Nama depan",
  formFieldLabel__lastName: "Nama belakang",
  formFieldLabel__confirmPassword: "Konfirmasi kata sandi",

  // Form buttons
  formButtonPrimary__signIn: "Masuk",
  formButtonPrimary__signUp: "Daftar",
  formButtonPrimary__continue: "Lanjutkan",
  formButtonPrimary__verify: "Verifikasi",

  // Form placeholders
  formFieldInputPlaceholder__emailAddress: "Masukkan alamat email",
  formFieldInputPlaceholder__password: "Masukkan kata sandi",
  formFieldInputPlaceholder__firstName: "Nama depan",
  formFieldInputPlaceholder__lastName: "Nama belakang",
  formFieldInputPlaceholder__confirmPassword: "Konfirmasi kata sandi",

  // Form hints
  formFieldHintText__password: "Minimal 6 karakter",

  // Footer links
  footerActionLink__signIn: "Masuk",
  footerActionLink__signUp: "Daftar",

  // Error messages
  formFieldError__notProvided: "Wajib diisi",
  formFieldError__invalidEmailAddress: "Format email tidak valid",
  formFieldError__passwordTooShort: "Kata sandi terlalu pendek",
  formFieldError__passwordTooWeak: "Kata sandi terlalu lemah",
  formFieldError__emailAddressNotFound: "Email tidak ditemukan",
  formFieldError__incorrectPassword: "Kata sandi salah",
  formFieldError__emailAddressExists: "Email sudah terdaftar",
  formFieldError__passwordsMismatch: "Kata sandi tidak cocok",

  // Success messages
  formFieldSuccessText__emailAddress: "Email valid",
  formFieldSuccessText__password: "Kata sandi valid",

  // Verification
  verificationCode: {
    loading: "Memverifikasi...",
    success: "Verifikasi berhasil",
    error: "Kode verifikasi salah",
  },
};

// Appearance customization
const clerkAppearance = {
  variables: {
    colorPrimary: "#2563eb",
    colorText: "#374151",
    colorTextSecondary: "#6b7280",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#111827",
    borderRadius: "0.5rem",
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "#1d4ed8",
      },
    },
    card: {
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    },
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        localization={clerkLocalization}
        appearance={clerkAppearance}
        signInUrl="/"
        signUpUrl="/"
        fallbackRedirectUrl="/dashboard"
      >
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
