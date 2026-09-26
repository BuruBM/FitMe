"use client";

import { useEffect, useRef, useState } from "react";
import { X, ScanLine } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

// Restricting to retail package formats (not QR/Aztec/etc.) makes decoding
// faster and avoids false positives on unrelated codes in frame.
const RETAIL_FORMATS = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E];

export function BarcodeScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, RETAIL_FORMATS);
    const reader = new BrowserMultiFormatReader(hints);
    let controls: { stop: () => void } | null = null;
    let stopped = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && !stopped) {
          stopped = true;
          controls?.stop();
          onDetected(result.getText());
        }
      })
      .then((c) => {
        controls = c;
        if (stopped) controls.stop();
      })
      .catch(() => {
        setError("No pudimos acceder a la cámara. Revisá los permisos del navegador, o cargá el producto por texto.");
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <ScanLine size={16} />
          Escanear código de barras
        </span>
        <button onClick={onClose} aria-label="Cerrar" className="p-1">
          <X size={20} />
        </button>
      </div>

      <div className="relative flex-1">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
        {!error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80%] max-w-xs h-24 border-2 border-white/80 rounded-lg" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <p className="text-sm text-white text-center">{error}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-white/70 text-center px-6 py-3">
        Apuntá al código de barras del paquete, bien iluminado y de cerca.
      </p>
    </div>
  );
}
