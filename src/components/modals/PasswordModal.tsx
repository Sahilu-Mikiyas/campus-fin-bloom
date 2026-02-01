import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function PasswordModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Please enter your password to confirm this action.',
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Server-side password verification via edge function
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        setError('You must be logged in to perform this action');
        setIsLoading(false);
        return;
      }

      const response = await supabase.functions.invoke('verify-password', {
        body: { password },
      });

      if (response.error) {
        console.error('Password verification error:', response.error);
        setError('Verification failed. Please try again.');
        setIsLoading(false);
        return;
      }

      const result = response.data;

      if (!result.valid) {
        setError(result.error || 'Invalid password');
        setIsLoading(false);
        return;
      }

      // Password verified successfully
      setPassword('');
      setError('');
      setIsLoading(false);
      onConfirm();
    } catch (err) {
      console.error('Password verification error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="animate-scale-in sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="text-sm">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="hover-scale">
            {isLoading ? 'Verifying...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}