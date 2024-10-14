"use client";

import type * as React from "react";
import { useState } from "react";
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
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { deleteCookie } from "@/lib/cookie";
import { ApiHandler } from "@/hooks/use-api";
import AccountLinking from "./account-linking";

export default function AppSettings({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const { setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showDeleteNotesDialog, setShowDeleteNotesDialog] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [githubId, setGithubId] = useState("");
  const [slackId, setSlackId] = useState("");
  const [discordId, setDiscordId] = useState("");

  // ダイアログを閉じる処理
  const handleClose = () => {
    onClose();
    setSelectedService(""); // サービス選択をリセット
    setGithubId(""); // GitHub IDをリセット
    setSlackId(""); // Slack IDをリセット
    setDiscordId(""); // Discord IDをリセット
  };

  // 言語変更処理
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("language", value);
  };

  // パスワード変更処理
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!response.ok) throw new Error("パスワード変更に失敗しました");
      console.log("Password changed to:", newPassword);
      setNewPassword("");
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // メール変更処理
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail }),
      });
      if (!response.ok) throw new Error("メール変更に失敗しました");
      console.log("Email changed to:", newEmail);
      setNewEmail("");
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    const { apiRequest } = ApiHandler();

    try {
      // APIリクエストをuseApiフックで実行
      const response = await apiRequest({
        method: "DELETE",
        url: `/users/me`,
      });

      if (response) {
        console.log("Account deleted");
        deleteCookie("token"); // トークンの削除
        onClose(); // ダイアログ等の閉じる処理
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // ノート全削除処理
  const handleDeleteNotes = async () => {
    try {
      const response = await fetch("/api/delete-notes", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("ノート削除に失敗しました");
      console.log("All notes deleted");
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* アカウント連携セクション */}
          <AccountLinking
            selectedService={selectedService}
            githubId={githubId}
            slackId={slackId}
            discordId={discordId}
            setSelectedService={setSelectedService}
            setGithubId={setGithubId}
            setSlackId={setSlackId}
            setDiscordId={setDiscordId}
          />

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
                <SelectItem value="ja">日本語</SelectItem>
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

          {/* デンジャーゾーン */}
          <div className="mt-8">
            <h2 className="text-red-600 text-lg font-bold">Danger Zone</h2>
            <div className="mt-4">
              {/* アカウント削除ボタン */}
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteAccountDialog(true)}
              >
                Delete Account
              </Button>

              {/* ノート全削除ボタン */}
              <Button
                variant="destructive"
                className="w-full mt-2"
                onClick={() => setShowDeleteNotesDialog(true)}
              >
                Delete All Notes
              </Button>
            </div>
          </div>

          {/* アカウント削除確認ダイアログ */}
          <Dialog
            open={showDeleteAccountDialog}
            onOpenChange={setShowDeleteAccountDialog}
          >
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
              </DialogHeader>
              <p>
                Do you really want to delete your account? This action cannot be
                undone.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteAccountDialog(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ノート全削除確認ダイアログ */}
          <Dialog
            open={showDeleteNotesDialog}
            onOpenChange={setShowDeleteNotesDialog}
          >
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
              </DialogHeader>
              <p>
                Do you really want to delete all notes? This action cannot be
                undone.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteNotesDialog(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteNotes}>
                  Delete All Notes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
