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
    let player: any = null;
    let isMounted = true;
    
    const loadSvga = async () => {
      try {
        const { Player, Parser } = await import("svgaplayerweb");
        if (!isMounted || !containerRef.current) return;
        
        // Clear previous content
        containerRef.current.innerHTML = "";
        
        // Setup player
        player = new Player(containerRef.current);
        player.setContentMode("AspectFill");
        const parser = new Parser();
        
        parser.load(url, (videoItem: any) => {
          if (!isMounted) return;
          player.setVideoItem(videoItem);
          player.startAnimation();
        }, (error: any) => {
          console.error("SVGA Load Error:", error);
        });
      } catch (err) {
        console.error("SVGA Player Init Error:", err);
      }
    };

    if (url) {
      loadSvga();
    }

    return () => {
      isMounted = false;
      if (player) {
        try {
          player.stopAnimation();
          player.clear();
        } catch (e) {}
      }
    };
  }, [url]);

  return <div id={id} ref={containerRef} className={className} style={{ width: "100%", height: "100%", ...style }} />;
};

export default SvgaPlayer;
