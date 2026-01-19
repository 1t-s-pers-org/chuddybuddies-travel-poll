import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AdminLoginProps {
  onLoggedIn?: () => void;
}

export function AdminLogin({ onLoggedIn }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      logger.error('Login error:', { code: error.code, message: error.message });
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Welcome back, Admin!' });
    onLoggedIn?.();
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({
        title: 'Enter your email first',
        description: 'Type your admin email above, then click “Forgot Password?”.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });

    // Always show success to prevent email enumeration
    if (error) {
      logger.error('Password reset error:', { code: error.code, message: error.message });
    }
    toast({
      title: 'Password reset email sent',
      description: 'If that email exists, check your inbox for a reset link.',
    });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              autoComplete="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </Button>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot Password?
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
