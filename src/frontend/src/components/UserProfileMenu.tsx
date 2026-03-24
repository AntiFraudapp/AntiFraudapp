import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useI18n } from "@/i18n/I18nProvider";
import { History, Settings, Trash2, User } from "lucide-react";
import { useState } from "react";
import { CookieStorageSettingsModal } from "./CookieStorageSettingsModal";

export function UserProfileMenu() {
  const { identity, clear } = useInternetIdentity();
  const { history, clearHistory } = useUserProfile();
  const { t } = useI18n();
  const [cookieModalOpen, setCookieModalOpen] = useState(false);

  const principal = identity?.getPrincipal().toString() || "";
  const truncatedPrincipal =
    principal.length > 20
      ? `${principal.substring(0, 10)}...${principal.substring(principal.length - 10)}`
      : principal;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getHistoryTypeLabel = (type: string) => {
    switch (type) {
      case "phone":
        return t.tabPhone;
      case "crypto":
        return t.tabCrypto;
      case "message":
        return t.tabMessage;
      case "email":
        return t.tabEmail;
      default:
        return type;
    }
  };

  return (
    <>
      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{t.loggedInAs}</p>
          </div>
          <p className="text-xs text-muted-foreground font-mono break-all">
            {truncatedPrincipal}
          </p>
        </div>

        <Separator />

        {/* Cookie Settings Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCookieModalOpen(true)}
          className="w-full justify-start"
        >
          <Settings className="h-4 w-4 mr-2" />
          {t.footerManageCookies}
        </Button>

        <Separator />

        {/* History Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{t.history}</p>
            </div>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-8 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {t.clearHistory}
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {t.noHistory}
            </p>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {history
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div
                      key={item.timestamp}
                      className="p-2 rounded-md bg-muted/50 border border-border space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary">
                          {getHistoryTypeLabel(item.type)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-foreground break-all">
                        {item.input}
                      </p>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <Separator />

        {/* Logout Button */}
        <Button
          onClick={clear}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          {t.logout}
        </Button>
      </div>

      <CookieStorageSettingsModal
        open={cookieModalOpen}
        onOpenChange={setCookieModalOpen}
      />
    </>
  );
}
