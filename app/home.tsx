import Chronotes from "@/app/chronotes";

export default function HomeContent({ isLoggedIn }: { isLoggedIn: boolean }) {

  return (
    <div>
      {isLoggedIn ? (
        <Chronotes />
      ) : (
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow flex items-center justify-center px-4">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to Our Application</h1>
              <p className="text-xl text-muted-foreground">
                This is a brief introduction to our amazing application. It&apos;s designed to help you achieve great things and simplify your daily tasks. Whether you&apos;re a professional looking to boost productivity or an individual seeking to organize your life, our app has got you covered.
              </p>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
