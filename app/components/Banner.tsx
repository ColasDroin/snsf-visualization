"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface CircleData {
  r: number;
  fill: string;
  idx: number;
  group: string;
  x?: number;
  y?: number;
}

const D3Banner: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTransitionRef = useRef<d3.Transition<
    SVGCircleElement,
    CircleData,
    SVGGElement,
    unknown
  > | null>(null);
  const circleSelectionRef = useRef<d3.Selection<
    SVGCircleElement,
    CircleData,
    SVGGElement,
    unknown
  > | null>(null);

  const playAnimation = () => {
    console.log("play");
    console.log(isPlaying);
    if (isPlaying || !circleSelectionRef.current) return;
    setIsPlaying(true);
    currentTransitionRef.current = circleSelectionRef.current
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .delay((d, i) => i * 3)
      .attr("cx", (d) => d.x!)
      .attr("cy", (d) => d.y!)
      .attr("fill", (d) => d.fill)
      .on("end", () => setIsPlaying(false)); // Reset playing state when animation ends
  };

  const pauseAnimation = () => {
    if (!isPlaying || !circleSelectionRef.current) return;
    setIsPlaying(false);
    circleSelectionRef.current.interrupt();
  };

  const restartAnimation = () => {
    pauseAnimation();
    if (!circleSelectionRef.current) return;
    circleSelectionRef.current
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) => d.fill);
    playAnimation();
  };

  const reverseAnimation = () => {
    pauseAnimation();
    if (!circleSelectionRef.current) return;
    circleSelectionRef.current
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .delay((d, i) => i * 3)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("fill", (d) => d.fill);
  };

  useEffect(() => {
    const width = window.innerWidth;
    const height = 600;
    const radius = 1.7;
    const padding = 1;
    const n = 1000; // Reduced number for performance

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const circles: CircleData[] = d3.packSiblings(
      d3.range(n).map((idx) => ({
        r: radius + padding,
        fill: "#ffafcc",
        idx,
        group: idx % 4 === 0 ? "pandas" : "cats",
      }))
    );

    const groups = ["pandas", "cats"];
    const circlesPerGroup: Record<string, CircleData[]> = {};

    groups.forEach((group) => {
      circlesPerGroup[group] = d3.packSiblings(
        circles
          .filter((circle) => circle.group === group)
          .map((circle) => ({
            ...circle,
            r: radius + padding,
          }))
      );
    });

    const xOffset = width / 2;
    const yOffsetPerGroup = height / 3;
    const movedCircles: CircleData[] = [];

    groups.forEach((group, groupIndex) => {
      circlesPerGroup[group].forEach((circle, index) => {
        movedCircles.push({
          ...circle,
          x: circlesPerGroup[group][index].x! + xOffset,
          y: circlesPerGroup[group][index].y! + yOffsetPerGroup * groupIndex,
          fill: group === "cats" ? "#76c893" : "#1a759f",
        });
      });
    });

    movedCircles.sort((a, b) => a.idx - b.idx);

    const selection_1 = svg
      .selectAll<SVGCircleElement, CircleData>("circle")
      .data(circles, (d) => d.idx)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r - padding)
      .attr("fill", (d) => d.fill);

    const selection_2 = svg
      .selectAll<SVGCircleElement, CircleData>("circle")
      .data(movedCircles, (d) => d.idx)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r - padding)
      .attr("fill", (d) => d.fill);

    circleSelectionRef.current = selection_1;

    // Optionally, start animation automatically
    // playAnimation();

    // Cleanup on unmount
    return () => {
      if (circleSelectionRef.current) {
        circleSelectionRef.current.interrupt();
      }
    };
  }, []);

  return (
    <div
      style={{ width: "100%", backgroundColor: "#22223b", overflow: "hidden" }}
    >
      <svg ref={svgRef} style={{ display: "block", margin: "auto" }}></svg>
      <div style={{ textAlign: "center", margin: "20px 0", color: "#f8f3e6" }}>
        <button onClick={playAnimation} disabled={isPlaying}>
          Play
        </button>
        <button onClick={pauseAnimation} disabled={!isPlaying}>
          Pause
        </button>
        <button onClick={restartAnimation}>Restart</button>
        <button onClick={reverseAnimation}>Reverse</button>
      </div>
    </div>
  );
};

export default D3Banner;
