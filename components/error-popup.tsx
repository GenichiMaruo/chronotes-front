export default function ErrorPopup({ message }: { message: string }) {
  return (
    <div className="absolute z-10 right-[-10px] bottom-[30px] bg-red-100 border border-red-500 text-red-500 p-2 rounded-md shadow-md">
      {message}
    </div>
  );
}
