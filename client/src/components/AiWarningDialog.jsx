import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function AiWarningDialog({ open, onOpenChange, onConfirm }) {
  const [suppress, setSuppress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (suppress) {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      try {
        await axios.post(
          "https://the-blog-zone-server.vercel.app/api/auth/suppress-warning",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Warning successfully suppressed
      } catch (error) {
        console.error("Failed to suppress warning", error);
        toast.error("Failed to save your preference.");
        setIsSubmitting(false);
        return; // Stop if we can't save preference
      }
      setIsSubmitting(false);
    }

    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Privacy Notice
          </DialogTitle>
          <DialogDescription className="pt-2">
            This feature uses an external AI service to process your text.
            <strong> Please do not use this feature for highly confidential, secure, or private posts.</strong>
            <br /><br />
            Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="suppress"
            checked={suppress}
            onCheckedChange={setSuppress}
            disabled={isSubmitting}
          />
          <Label htmlFor="suppress" className="text-sm cursor-pointer">
            Don't show this warning again
          </Label>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
