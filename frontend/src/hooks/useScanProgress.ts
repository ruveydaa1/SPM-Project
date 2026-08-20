import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export interface ScanProgress {
    assetId: number;
    scanRunId: number;
    status: string;
    message: string;
    timestamp: string;
}

export function useScanProgress(
    assetId: number,
    scanRunId: number | null
) {
    const [progress, setProgress] = useState<ScanProgress[]>([]);

    useEffect(() => {
        if (!scanRunId) {
            return;
        }

        const connection =
            new signalR.HubConnectionBuilder()
                .withUrl(
                    "http://localhost:5245/hubs/scan-progress"
                )
                .withAutomaticReconnect()
                .build();

        connection.on(
            "ScanProgress",
            (data: ScanProgress) => {
                if (
                    data.assetId === assetId &&
                    data.scanRunId === scanRunId
                ) {
                    setProgress((current) => [
                        ...current,
                        data,
                    ]);
                }
            }
        );

        connection
            .start()
            .catch((error) => {
                console.error(
                    "SignalR bağlantısı kurulamadı:",
                    error
                );
            });

        return () => {
            connection.stop();
        };
    }, [assetId, scanRunId]);

    return progress;
}