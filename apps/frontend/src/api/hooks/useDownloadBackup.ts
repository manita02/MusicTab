import { useCallback, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

const FALLBACK_FILENAME = "musictab-backup.sql";

export function filenameFromContentDisposition(header: string | undefined): string {
  if (!header) return FALLBACK_FILENAME;

  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header);
  if (star?.[1]) {
    const raw = star[1].replace(/"/g, "").trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw || FALLBACK_FILENAME;
    }
  }

  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted?.[1]) return quoted[1];

  const plain = /filename=([^;]+)/i.exec(header);
  if (plain?.[1]) return plain[1].trim().replace(/^["']|["']$/g, "") || FALLBACK_FILENAME;

  return FALLBACK_FILENAME;
}

export function backupErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.response?.status === 403) {
      return "You do not have permission to download a backup.";
    }
    return err.message || "Could not download the SQL backup. Try again.";
  }
  return "Could not download the SQL backup. Try again.";
}

export function useDownloadBackup() {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async () => {
    setIsDownloading(true);
    try {
      const response = await api.get<Blob>(ENDPOINTS.backup.download, {
        responseType: "blob",
      });
      const filename = filenameFromContentDisposition(
        typeof response.headers["content-disposition"] === "string"
          ? response.headers["content-disposition"]
          : undefined,
      );
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "application/sql;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { download, isDownloading };
}
