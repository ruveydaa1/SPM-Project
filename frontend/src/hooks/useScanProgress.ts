import { useEffect, useRef, useState } from "react";
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

    const scanRunIdRef = useRef<number | null>(scanRunId);
    const connectionRef =
        useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        scanRunIdRef.current = scanRunId;

        if (scanRunId !== null) {
            setProgress([]);
        }
    }, [scanRunId]);

    useEffect(() => {
        if (!assetId) {
            return;
        }

        let isDisposed = false;
        let connectionStarted = false;

        const connection =
            new signalR.HubConnectionBuilder()
                .withUrl(
                    "http://localhost:5245/hubs/scan-progress"
                )
                .withAutomaticReconnect()
                .configureLogging(
                    signalR.LogLevel.Warning
                )
                .build();

        connectionRef.current = connection;

        const handleScanProgress = (
            data: ScanProgress
        ) => {
            if (isDisposed) {
                return;
            }

            if (data.assetId !== assetId) {
                return;
            }

            const currentScanRunId =
                scanRunIdRef.current;

            if (currentScanRunId === null) {
                return;
            }

            if (
                data.scanRunId !==
                currentScanRunId
            ) {
                return;
            }

            console.log(
                "SignalR ScanProgress:",
                data
            );

            setProgress((current) => [
                ...current,
                data,
            ]);
        };

        connection.on(
            "ScanProgress",
            handleScanProgress
        );

        const startConnection = async () => {
            try {
                await connection.start();

                connectionStarted = true;

                if (!isDisposed) {
                    console.log(
                        "SignalR connection established."
                    );
                } else {
                    await connection.stop();
                }
            } catch (error) {
                /*
                 * Component unmount olduğunda SignalR
                 * negotiation devam ediyor olabilir.
                 *
                 * Bu durumda oluşan AbortError'ı
                 * gerçek bir bağlantı hatası olarak
                 * console'a yazmıyoruz.
                 */
                if (!isDisposed) {
                    console.error(
                        "SignalR connection failed:",
                        error
                    );
                }
            }
        };

        startConnection();

        return () => {
            isDisposed = true;

            connection.off(
                "ScanProgress",
                handleScanProgress
            );

            /*
             * Eğer bağlantı henüz kurulmadıysa
             * negotiation aşamasında olabilir.
             *
             * Bu durumda hemen stop() çağırmıyoruz.
             * start() tamamlandığında yukarıdaki
             * isDisposed kontrolü bağlantıyı kapatacak.
             */
            if (
                connectionStarted &&
                connection.state !==
                    signalR.HubConnectionState.Disconnected
            ) {
                connection
                    .stop()
                    .catch(() => {});
            }

            if (
                connectionRef.current === connection
            ) {
                connectionRef.current = null;
            }
        };
    }, [assetId]);

    return progress;
}