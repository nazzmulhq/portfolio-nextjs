export interface TocItem {
    id: string;
    title: string;
    level: number;
    raw: string;
}

export type DeviceMode = "responsive" | "mobile" | "tablet" | "laptop" | "desktop" | "split";

export interface DeviceSpec {
    id: DeviceMode;
    name: string;
    width: number;
    height: number;
    icon: string;
    description: string;
    hasOrientation?: boolean;
}

export const DEVICE_SPECS: Record<Exclude<DeviceMode, "responsive" | "split">, DeviceSpec> = {
    mobile: {
        id: "mobile",
        name: "iPhone 16 Pro",
        width: 393,
        height: 852,
        icon: "mobile",
        description: "Mobile viewport (393 × 852)",
        hasOrientation: true,
    },
    tablet: {
        id: "tablet",
        name: "iPad Pro 11″",
        width: 834,
        height: 1194,
        icon: "tablet",
        description: "Tablet viewport (834 × 1194)",
        hasOrientation: true,
    },
    laptop: {
        id: "laptop",
        name: "MacBook Pro 14″",
        width: 1280,
        height: 800,
        icon: "laptop",
        description: "Laptop viewport (1280 × 800)",
        hasOrientation: false,
    },
    desktop: {
        id: "desktop",
        name: "Desktop Display",
        width: 1440,
        height: 900,
        icon: "desktop",
        description: "Widescreen desktop (1440 × 900)",
        hasOrientation: false,
    },
};

export interface DocStats {
    words: number;
    chars: number;
    readTimeMin: number;
    headingsCount: number;
    codeBlocksCount: number;
    tablesCount: number;
}
