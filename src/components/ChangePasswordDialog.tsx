'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { KeyRoundIcon } from 'lucide-react';

interface ChangePasswordDialogProps {
  hasExistingPassword: boolean;
}

export function ChangePasswordDialog({ hasExistingPassword }: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>
        <KeyRoundIcon />
        Trocar senha
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trocar senha</DialogTitle>
          <DialogDescription>Defina uma nova senha para sua conta.</DialogDescription>
        </DialogHeader>
        <ChangePasswordForm hasExistingPassword={hasExistingPassword} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
