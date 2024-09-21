import * as React from "react";
import { useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ServiceHelpModalProps {
  className?: string; // 外部からクラスを指定できるようにする
}

export default function ServiceHelpModal({ className = "" }: ServiceHelpModalProps) {
  const [open, setOpen] = useState(false);

  // モーダルの開閉を管理
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      {/* FaExclamationCircle アイコンに className を適用 */}
      <FaExclamationCircle
        className={`text-red-500 cursor-pointer ${className}`}
        onClick={handleOpen}
      />
      
      {/* モーダル */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Account Link Help</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Here are the steps to link your account:</p>
            <ul className="list-disc pl-5">
              <li><strong>GitHub:</strong> Provide your GitHub ID to link.</li>
              <li><strong>Slack:</strong> Provide your Slack ID to link.</li>
              <li><strong>Discord:</strong> Provide your Discord ID to link.</li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
