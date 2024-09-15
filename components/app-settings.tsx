"use client"

import * as React from "react"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function AppSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setTheme } = useTheme();
  const [language, setLanguage] = useState('en');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // 言語変更処理
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem('language', value);
    // 他の言語変更ロジックはここに追加
  };

  // パスワード変更処理
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!response.ok) throw new Error('パスワード変更に失敗しました');
      console.log('Password changed to:', newPassword);
      setNewPassword('');
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // メール変更処理
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail }),
      });
      if (!response.ok) throw new Error('メール変更に失敗しました');
      console.log('Email changed to:', newEmail);
      setNewEmail('');
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* テーマ設定 */}
          <div className="grid grid-cols-5 items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 言語設定 */}
            <Label htmlFor="language" className="text-right">
              Language
            </Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* パスワード変更 */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="password">
              <AccordionTrigger>Change Password</AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-password" className="text-right">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Change Password
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>

            {/* メール変更 */}
            <AccordionItem value="email">
              <AccordionTrigger>Change Email</AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-email" className="text-right">
                      New Email
                    </Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Change Email
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
