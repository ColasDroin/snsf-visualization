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
  const [isReversed, setIsReversed] = useState(false); // Track reverse state
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

  const initialCircles = useRef<CircleData[]>([]);
  const movedCircles = useRef<CircleData[]>([]);

  const playAnimation = () => {
    if (isPlaying || !circleSelectionRef.current) return;
    setIsPlaying(true);

    currentTransitionRef.current = circleSelectionRef.current
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .delay((d, i) => i * 3)
      .attr("cx", (d) => (isReversed ? d.x! : movedCircles.current[d.idx].x!))
      .attr("cy", (d) => (isReversed ? d.y! : movedCircles.current[d.idx].y!))
      .attr("fill", (d) => d.fill)
      .on("end", () => setIsPlaying(false));
  };

  const pauseAnimation = () => {
    if (!isPlaying || !circleSelectionRef.current) return;
    setIsPlaying(false);
    circleSelectionRef.current.interrupt();
  };

  const restartAnimation = () => {
    pauseAnimation();
    if (!circleSelectionRef.current) return;
    setIsReversed(false);
    circleSelectionRef.current
      .attr("cx", (d) => initialCircles.current[d.idx].x!)
      .attr("cy", (d) => initialCircles.current[d.idx].y!)
      .attr("fill", (d) => initialCircles.current[d.idx].fill);
    playAnimation();
  };

  const reverseAnimation = () => {
    pauseAnimation();
    setIsReversed((prev) => !prev);
    playAnimation();
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

    groups.forEach((group, groupIndex) => {
      circlesPerGroup[group].forEach((circle, index) => {
        movedCircles.current.push({
          ...circle,
          x: circlesPerGroup[group][index].x! + xOffset,
          y: circlesPerGroup[group][index].y! + yOffsetPerGroup * groupIndex,
          fill: group === "cats" ? "#76c893" : "#1a759f",
        });
      });
    });

    movedCircles.current.sort((a, b) => a.idx - b.idx);
    initialCircles.current = circles;

    const selection = svg
      .selectAll<SVGCircleElement, CircleData>("circle")
      .data(circles, (d) => d.idx)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x!)
      .attr("cy", (d) => d.y!)
      .attr("r", (d) => d.r - padding)
      .attr("fill", (d) => d.fill);

    circleSelectionRef.current = selection;

    // Optionally, start animation automatically
    // playAnimation();

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
