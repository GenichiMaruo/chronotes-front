import { useState } from 'react'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteCookie } from "@/lib/cookie";
import { useRouter } from "next/navigation";
import AppSettings from '@/components/app-settings'

interface HeaderMobileProps {
  isLoggedIn: boolean;
  isSidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}

export default function HeaderMobile({ isLoggedIn, isSidebarVisible, setSidebarVisible }: HeaderMobileProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    deleteCookie('token')  // トークンを削除
    router.push('/login')  // ログイン画面へリダイレクト
  }

  return (
    <header className="w-full h-[10vh] p-4 flex justify-between items-center">


      {isLoggedIn ? (
        <>
          {/* サイドバーの表示非表示ボタン（小さい画面用） */}
          <Button
            onClick={() => setSidebarVisible(!isSidebarVisible)}
            className="lg:hidden p-2 z-50"
          >
            {isSidebarVisible ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
          </Button>
          <div className="flex-grow flex justify-center lg:justify-start">
            <h1 className="text-2xl font-bold">
              <Link href="/">Chronotes</Link>
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src="/placeholder-image?width=200&height=200&background=rgb(41, 122, 137)&color=white" alt="User" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* 設定モーダル */}
          <AppSettings open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">
            <Link href="/">Chronotes</Link>
          </h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </li>
              <li>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
