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
    let isMounted = true;

    const initPlayer = async () => {
      try {
        const { Player, Parser } = await import("svgaplayerweb");
        if (!isMounted || !containerRef.current) return;

        // Clean previous
        containerRef.current.innerHTML = "";
        
        player = new Player(containerRef.current);
        player.setContentMode("AspectFit");
        player.loops = 0;

        const parser = new Parser();
        parser.load(url, (videoItem: any) => {
          if (!isMounted || !player) return;
          player.setVideoItem(videoItem);
          player.startAnimation();
        }, (err: any) => {
          console.error("SVGA Parser Error:", url, err);
        });
      } catch (err) {
        console.error("SVGA Init Error:", err);
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
      if (player) {
        player.stopAnimation();
        player.clear();
      }
    };
  }, [url]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        width: "100%", 
        height: "100%", 
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
