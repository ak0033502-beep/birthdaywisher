"use client";

import { WishData } from "@/lib/WishContext";
import { StoryViewer } from "./StoryViewer";

// We will add more viewers here as we build them.
import { TerminalViewer } from "./TerminalViewer";
import { StorybookViewer } from "./StorybookViewer";
import { MessengerViewer } from "./MessengerViewer";
import { GalaxyViewer } from "./GalaxyViewer";
import { GalleryViewer } from "./GalleryViewer";

export function StoryViewerRouter({ data }: { data: WishData }) {
    // Default to cinematic if not specified
    const style = data.presentationStyle || "cinematic";

    switch (style) {
        case "cinematic":
            return <StoryViewer data={data} />;
        case "terminal":
            return <TerminalViewer data={data} />;
        case "storybook":
            return <StorybookViewer data={data} />;
        case "messenger":
            return <MessengerViewer data={data} />;
        case "galaxy":
            return <GalaxyViewer data={data} />;
        case "gallery":
            return <GalleryViewer data={data} />;
        default:
            return <StoryViewer data={data} />;
    }
}
