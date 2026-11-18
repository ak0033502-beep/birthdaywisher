import dns from "node:dns";
import net from "node:net";

const g = globalThis as unknown as { __bwNetFixApplied?: boolean };

/**
 * Node 20–24 sets Happy Eyeballs per-address attempt timeout to 250ms by default.
 * On high-latency links (e.g. India -> AWS us-east-1 Neon ~260–350ms RTT) where
 * DNS returns both IPv4 and unroutable IPv6, Node aborts every IPv4 SYN at 250ms
 * and fails with UND_ERR_CONNECT_TIMEOUT after 10s.
 *
 * Prefer IPv4 first and raise the attempt timeout to 5000ms so TLS/TCP handshakes
 * succeed on the first attempt while keeping IPv6 fallback intact if needed.
 */
export function applyNodeNetFix(): void {
    if (g.__bwNetFixApplied) return;
    g.__bwNetFixApplied = true;
    try {
        dns.setDefaultResultOrder?.("ipv4first");
        net.setDefaultAutoSelectFamilyAttemptTimeout?.(5000);
    } catch {
        // Ignore in non-Node runtimes
    }
}

applyNodeNetFix();
