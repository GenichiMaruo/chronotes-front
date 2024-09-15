import { Button } from "@/components/ui/button";
import Link from "next/link";
import Chronotes from "@/app/chronotes";

export default function HomeContent({ isLoggedIn }: { isLoggedIn: boolean }) {

  return (
    <div>
      {isLoggedIn ? (
        <Chronotes />
      ) : (
        <div className="min-h-screen flex flex-col">
          <header className="w-full p-4 flex justify-between items-center">
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
          </header>
          <main className="flex-grow flex items-center justify-center px-4">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to Our Application</h1>
              <p className="text-xl text-muted-foreground">
                This is a brief introduction to our amazing application. It's designed to help you achieve great things and simplify your daily tasks. Whether you're a professional looking to boost productivity or an individual seeking to organize your life, our app has got you covered.
              </p>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
