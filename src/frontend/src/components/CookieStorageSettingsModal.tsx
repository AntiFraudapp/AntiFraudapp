import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdvancedContactLookupCache } from "@/hooks/useAdvancedContactLookupCache";
import { useI18n } from "@/i18n/I18nProvider";
import { clearAllUserData } from "@/utils/userProfileStorage";
import { Cookie, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CookieStorageSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookieStorageSettingsModal({
  open,
  onOpenChange,
}: CookieStorageSettingsModalProps) {
  const { t } = useI18n();
  const { clearCache } = useAdvancedContactLookupCache();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      // Clear lookup cache
      clearCache();

      // Clear all user data (history, etc.)
      clearAllUserData();

      toast.success(t.cookieSettingsHistoryCleared);
    } catch (error) {
      console.error("Error clearing history:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            <DialogTitle>{t.cookieSettingsTitle}</DialogTitle>
          </div>
          <DialogDescription>{t.cookieSettingsDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* What we store */}
          <div>
            <h3 className="font-semibold text-sm mb-3">
              {t.cookieSettingsWhatWeStore}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t.cookieSettingsLanguagePreference}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t.cookieSettingsLocalHistory}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t.cookieSettingsAnonymousStats}</span>
              </li>
            </ul>
          </div>

          {/* Clear history action */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm mb-1">{t.clearHistory}</h4>
                <p className="text-xs text-muted-foreground">
                  {t.cookieSettingsNote}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
                disabled={isClearing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isClearing
                  ? t.cookieSettingsClearingHistory
                  : t.cookieSettingsClearHistoryButton}
              </Button>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              {t.cookieSettingsCloseButton}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
