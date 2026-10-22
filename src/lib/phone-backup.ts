import { strToU8, zipSync } from "fflate";
import { getAllData } from "@/lib/store";

export function createPhoneBackup(now = new Date()) {
  const data = {
    formatVersion: 1,
    exportedAt: now.toISOString(),
    moodScaleVersion: localStorage.getItem("ms_scale_v2"),
    ...getAllData(),
  };
  const archive = zipSync({ "Mindsight/data.json": strToU8(JSON.stringify(data, null, 2)) });
  const blob = new Blob([new Uint8Array(archive)], { type: "application/zip" });
  return new File([blob], `Mindsight-${now.toISOString().slice(0, 10)}.zip`, { type: "application/zip" });
}

export async function savePhoneBackup(): Promise<"shared" | "downloaded" | "cancelled"> {
  const file = createPhoneBackup();
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Mindsight backup" });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
      // The browser may advertise sharing but reject ZIPs; offer a download instead.
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return "downloaded";
}