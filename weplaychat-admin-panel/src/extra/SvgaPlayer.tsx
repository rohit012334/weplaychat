"use client";
import React, { useEffect, useRef } from "react";

interface SvgaPlayerProps {
  url: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

const SvgaPlayer: React.FC<SvgaPlayerProps> = ({ url, style, className, id = "svga-player" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    let player: any = null;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanupPlayer = () => {
      if (player) {
        try {
          player.stopAnimation();
          player.clear();
        } catch (_err) {
          // Ignore cleanup errors from third-party player internals.
        }
      }
      player = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };

    const runPlayer = async (withRetry = true) => {
      try {
        const { Player, Parser } = await import("svgaplayerweb");
        if (cancelled || !containerRef.current) return;

        cleanupPlayer();
        player = new Player(containerRef.current);
        player.setContentMode("AspectFit");
        player.loops = 0;

        const parser = new Parser();
        parser.load(
          url,
          (videoItem: any) => {
            if (cancelled || !player) return;
            player.setVideoItem(videoItem);
            player.startAnimation();
          },
          (err: any) => {
            if (cancelled) return;
            console.error("SVGA Parser Error:", url, err);
            // Some files fail on first parse in certain environments; one retry helps.
            if (withRetry) {
              retryTimer = setTimeout(() => runPlayer(false), 250);
            }
          }
        );
      } catch (err) {
        if (!cancelled) console.error("SVGA Init Error:", err);
      }
    };

    runPlayer(true);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      cleanupPlayer();
    };
  }, [url]);

  return (
    <div
      id={id}
      ref={containerRef} 
      className={className}
      style={{ 
        width: "100%", 
        height: "100%", 
        minWidth: 1,
        minHeight: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style 
      }} 
    />
  );
};

export default SvgaPlayer;
