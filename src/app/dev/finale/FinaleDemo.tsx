"use client";

import { BlockViewer } from "@/components/viewer/BlockViewer";
import type { WishDataV2 } from "@/lib/wish/schema";

export function FinaleDemo({
    effect,
    theme,
    style,
    name,
    age,
    type,
    finaleOnly = false,
    withPhotos = false,
}: {
    effect: string;
    theme: string;
    style: string;
    name: string;
    age: string;
    type: "birthday" | "anniversary";
    finaleOnly?: boolean;
    withPhotos?: boolean;
}) {
    const photoBlock = withPhotos
        ? [
              {
                  id: "bp",
                  type: "photos" as const,
                  config: {
                      items: [
                          { type: "photo" as const, url: "/icon-192.png", caption: "" },
                          { type: "photo" as const, url: "/icon-192.png", caption: "" },
                          { type: "photo" as const, url: "/icon-192.png", caption: "" },
                      ],
                  },
              },
          ]
        : [];
    const wish: WishDataV2 = {
        schemaVersion: 2,
        wishType: type,
        recipient: { name, age, gender: "", nickname: "", relationship: "best friend", vibe: "", coupleName: type === "anniversary" ? `${name} & Rahul` : "", anniversaryYear: "3" },
        blocks: finaleOnly
            ? [...photoBlock, { id: "b5", type: "finale", config: { effect } }]
            : [
                  { id: "b1", type: "intro", config: {} },
                  { id: "b2", type: "memory", config: { text: "From late-night Maggi runs to laughing until we cried — every single year with you is my favourite chapter." } },
                  ...photoBlock,
                  { id: "bpuz", type: "puzzle", config: { imageUrl: "/icon-192.png" } },
                  { id: "b3", type: "roast", config: { level: 74 } },
                  { id: "b4", type: "message", config: { text: "May this year bring you big wins, warm hugs, zero stress, and every dream you have been quietly working towards." } },
                  { id: "b5", type: "finale", config: { effect } },
              ],
        look: { theme, presentationStyle: style, soundtrack: "", language: "en" },
        unlock: { date: "" },
        meta: { timeCapsule: "", extra: {} },
    };
    return <BlockViewer wish={wish} vaultWishId="de0001" previewOnly />;
}
