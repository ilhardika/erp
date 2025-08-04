import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex justify-center">
          <CardTitle className="text-center">Bizflow Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Masuk
                </Button>
              </div>
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
