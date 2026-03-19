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

    let player: any;
    const loadPlayer = async () => {
        try {
            const { Player, Parser } = await import("svgaplayerweb");
            const parser = new Parser();
            player = new Player(containerRef.current!);
            
            player.setContentMode("AspectFill");
            player.loops = 0; // infinite
            
            parser.load(url, (videoItem: any) => {
                if (player) {
                    player.setVideoItem(videoItem);
                    player.startAnimation();
                }
            }, (err: any) => {
                console.error("SvgaPlayer: Parser error for", url, err);
            });
        } catch (err) {
            console.error("SvgaPlayer: Init error", err);
        }
    };

    if (typeof window !== "undefined") {
        loadPlayer();
    }

    return () => {
        if (player) {
            player.stopAnimation();
            player.clear();
        }
    };
  }, [url]);

  return <div id={id} ref={containerRef} className={className} style={{ width: "100%", height: "100%", ...style }} />;
};

export default SvgaPlayer;
