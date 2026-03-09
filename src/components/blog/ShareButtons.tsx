import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ShareButtonsProps {
  url?: string;
}

const ShareButtons = ({ url }: ShareButtonsProps) => {
  const { t } = useTranslation();
  const shareUrl = url || window.location.href;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(t('blog.share.copied'));
  };

  return (
    <button
      onClick={copyLink}
      aria-label={t('blog.share.copyLink')}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
    >
      <Link2 className="w-4 h-4" />
      {t('blog.share.copyLink')}
    </button>
  );
};

export default ShareButtons;
