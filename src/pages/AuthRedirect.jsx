import { useUser, SignIn } from "@clerk/react-router";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function AuthRedirect() {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignIn routing="hash" />
      </div>
    );
  }

  return null;
}
