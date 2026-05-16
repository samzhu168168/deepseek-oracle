/**
 * PayPalButton — PayPal Smart Payment Button
 * Loads PayPal JS SDK, renders checkout button, handles full payment flow.
 */
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: Error) => void;
        style?: Record<string, string>;
      }) => {
        render: (el: string | HTMLElement) => Promise<void>;
      };
      FundingSource?: Record<string, string>;
    };
  }
}

interface PayPalButtonProps {
  /** Price in USD */
  price?: string;
  /** Person data for report generation */
  person1: { date: string; time: string; gender: string };
  person2: { date: string; time: string; gender: string };
  score: number;
  elementPair: string;
  /** Called on successful payment + report generation */
  onSuccess: (report: any) => void;
  /** Called on error */
  onError?: (msg: string) => void;
  /** Called when payment starts (show loading) */
  onStart?: () => void;
  /** Called when payment finishes (hide loading) */
  onFinish?: () => void;
}

export function PayPalButton({
  price = "24.90",
  person1,
  person2,
  score,
  elementPair,
  onSuccess,
  onError,
  onStart,
  onFinish,
}: PayPalButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  // Determine API base URL (same origin in prod, VITE_API_URL in dev)
  const apiBase = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    if (loaded) return;
    if (typeof window === "undefined") return;

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setError("PayPal not configured. Use Gumroad instead.");
      return;
    }

    // Avoid loading script twice
    if (document.getElementById("paypal-sdk")) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError("Failed to load PayPal. Use Gumroad instead.");
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount (component may remount)
    };
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !buttonRef.current || !window.paypal) return;

    let cancelled = false;

    window.paypal
      .Buttons({
        createOrder: async () => {
          onStart?.();
          const resp = await fetch(`${apiBase}/api/paypal/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price }),
          });
          const data = await resp.json();
          if (!data.success) throw new Error(data.error || "Failed to create order");
          return data.order_id;
        },
        onApprove: async (data: { orderID: string }) => {
          try {
            const resp = await fetch(`${apiBase}/api/paypal/capture-order`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: data.orderID,
                person1,
                person2,
                score,
                element_pair: elementPair,
              }),
            });
            const result = await resp.json();
            if (!result.success) throw new Error(result.error || "Payment verification failed");
            if (!cancelled) onSuccess(result.report);
          } catch (err: any) {
            if (!cancelled) {
              const msg = err.message || "Payment failed. Please try again.";
              setError(msg);
              onError?.(msg);
            }
          } finally {
            if (!cancelled) onFinish?.();
          }
        },
        onError: (err: Error) => {
          if (!cancelled) {
            const msg = err.message || "PayPal error. Please try again.";
            setError(msg);
            onError?.(msg);
            onFinish?.();
          }
        },
        style: {
          color: "gold",
          shape: "rect",
          label: "pay",
          height: "48",
        },
      })
      .render(buttonRef.current)
      .catch((_err: Error) => {
        if (!cancelled) {
          setError("PayPal render failed. Use Gumroad.");
          onFinish?.();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loaded, apiBase, price, person1, person2, score, elementPair, onSuccess, onError, onStart, onFinish]);

  if (error) {
    return <p style={{ color: "#e55", fontSize: "13px", textAlign: "center" }}>{error}</p>;
  }

  return (
    <div>
      <div ref={buttonRef} style={{ minHeight: "48px" }} />
      {!loaded && (
        <p style={{ color: "#888", fontSize: "13px", textAlign: "center" }}>
          Loading PayPal...
        </p>
      )}
    </div>
  );
}

export default PayPalButton;
