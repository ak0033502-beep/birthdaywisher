import Link from "next/link";
import { PartyPage } from "@/components/party/PartyPage";
import { Balloons, Bunting } from "@/components/party/Decor";

export default function NotFound() {
    return (
        <PartyPage>
            <section className="bw-hero bw-page-hero is-center" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
                <Bunting />
                <Balloons count={5} />
                <div className="bw-container bw-page-hero-in">
                    <div style={{ fontSize: 76, lineHeight: 1 }} aria-hidden="true">🎈</div>
                    <h1>Oops! This balloon floated away</h1>
                    <p className="bw-sub">The page you&apos;re looking for doesn&apos;t exist. If you opened a birthday surprise link, it may have expired and self-destructed for privacy.</p>
                    <div className="bw-hero-ctas" style={{ justifyContent: "center" }}>
                        <Link href="/" className="bw-btn bw-btn-ghost">🏠 Back home</Link>
                        <Link href="/create" className="bw-btn bw-btn-primary">🎁 Create a birthday surprise</Link>
                    </div>
                </div>
            </section>
        </PartyPage>
    );
}
