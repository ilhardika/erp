import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen gap-6",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Login Bizflow</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email anda"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password anda"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Masuk
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Belum punya akun?{" "}
              <a href="#" className="underline underline-offset-4">
                Daftar
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
