"use client";

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface VirtualListHandle {
    scrollToIndex: (
        index: number,
        options?: { align?: "start" | "center" | "end" | "auto"; behavior?: "auto" | "smooth" }
    ) => void;
    scrollToOffset: (offset: number, options?: { behavior?: "auto" | "smooth" }) => void;
    getTotalSize: () => number;
    measure: () => void;
}

export interface VirtualListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    estimateSize?: number;          // Estimated row height in px (default: 80)
    overscan?: number;              // Extra buffer rows to pre-render (default: 5)
    gap?: number;                   // Gap between items in px (default: 0)
    className?: string;             // Responsive Tailwind classes (e.g. "h-[60vh] sm:h-[600px] w-full")
    containerHeight?: number | string; // Optional fixed height override (e.g. "500px", "100%")
    getItemKey?: (item: T, index: number) => string | number;
    emptyComponent?: React.ReactNode;
    paddingStart?: number;
    paddingEnd?: number;
    allowHorizontalScroll?: boolean; // When true, enables horizontal scroll on mobile instead of clipping
}

function VirtualListInner<T>(
    {
        items,
        renderItem,
        estimateSize = 80,
        overscan = 5,
        gap = 0,
        className = "h-[500px] w-full",
        containerHeight,
        getItemKey,
        emptyComponent,
        paddingStart = 0,
        paddingEnd = 0,
        allowHorizontalScroll = false,
    }: VirtualListProps<T>,
    ref: React.Ref<VirtualListHandle>
) {
    const parentRef = useRef<HTMLDivElement>(null);

    // 1. Initialize TanStack Virtualizer
    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateSize,
        overscan,
        gap,
        paddingStart,
        paddingEnd,
        getItemKey: (index) => {
            const item = items[index];
            if (getItemKey && item) {
                return getItemKey(item, index);
            }
            if (item && typeof item === "object" && "id" in item) {
                return (item as any).id;
            }
            return index;
        },
    });

    // 2. Responsive Remeasurement:
    // When the browser window or parent container resizes (e.g. phone orientation change,
    // tablet breakpoint switch, or window resizing), rows may wrap from 1 line to 2-3 lines.
    // Calling rowVirtualizer.measure() recalculates all dynamic row heights to completely
    // prevent row collisions, text overlaps, and content clipping ("loss of content").
    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        let prevWidth = el.clientWidth;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const currentWidth = entry.contentRect.width;
                if (Math.abs(currentWidth - prevWidth) > 1) {
                    prevWidth = currentWidth;
                    rowVirtualizer.measure();
                }
            }
        });

        resizeObserver.observe(el);
        return () => resizeObserver.disconnect();
    }, [rowVirtualizer]);

    // 3. Expose programmatic scroll controls via ref
    useImperativeHandle(ref, () => ({
        scrollToIndex: (index, options) => {
            rowVirtualizer.scrollToIndex(index, options);
        },
        scrollToOffset: (offset, options) => {
            rowVirtualizer.scrollToOffset(offset, options);
        },
        getTotalSize: () => rowVirtualizer.getTotalSize(),
        measure: () => rowVirtualizer.measure(),
    }));

    if (items.length === 0) {
        if (emptyComponent) {
            return <>{emptyComponent}</>;
        }
        return (
            <div
                ref={parentRef}
                style={{
                    ...(containerHeight ? { height: containerHeight } : {}),
                }}
                className={`flex items-center justify-center p-8 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-mono text-[var(--muted)] ${className}`}
            >
                No items to display.
            </div>
        );
    }

    const virtualRows = rowVirtualizer.getVirtualItems();

    return (
        <div
            ref={parentRef}
            style={{
                ...(containerHeight ? { height: containerHeight } : {}),
                contain: "paint", // "paint" avoids layout clipping on responsive flex/grid wrappers
            }}
            className={`overflow-y-auto ${
                allowHorizontalScroll ? "overflow-x-auto" : "overflow-x-hidden"
            } relative rounded-xl border border-[var(--line)] bg-[var(--surface)] ${className}`}
        >
            {/* Total height spacer ensuring native scrollbar reflects exact collection height */}
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {/* Only mounted elements inside visible window + overscan exist in DOM */}
                {virtualRows.map((virtualRow) => {
                    const item = items[virtualRow.index];
                    if (!item) return null;

                    const key = getItemKey
                        ? getItemKey(item, virtualRow.index)
                        : (item as any)?.id ?? virtualRow.index;

                    return (
                        <div
                            key={key}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement} // Auto-measures dynamic item heights on every layout change
                            className="absolute top-0 left-0 w-full min-w-0"
                            style={{
                                transform: `translateY(${virtualRow.start}px)`,
                                willChange: "transform",
                            }}
                        >
                            {renderItem(item, virtualRow.index)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const VirtualList = forwardRef(VirtualListInner) as <T>(
    props: VirtualListProps<T> & { ref?: React.Ref<VirtualListHandle> }
) => React.ReactElement;

export default VirtualList;
