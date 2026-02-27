import { WishProvider } from "@/lib/WishContext";

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <WishProvider>{children}</WishProvider>;
}
