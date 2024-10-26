import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { ApiHandler } from "@/hooks/use-api";

interface WordCloudProps {
  from: string;
  to: string;
}

const WordCloud: React.FC<WordCloudProps> = ({ from, to }) => {
  const [wordCloudData, setWordCloudData] = useState<{ text: string; value: number }[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { apiRequest } = ApiHandler();

  useEffect(() => {
    const fetchTags = async () => {
      const endpoint = `/notes?from=${from}&to=${to}&fields=tags`;
      try {
        const data = await apiRequest({
          method: "GET",
          url: endpoint,
        });

        const allTags = data.notes.flatMap((note: { tags: string }) => note.tags.split(','));
        const tagFrequency = allTags.reduce((acc: { [x: string]: number; }, tag: string) => {
          const trimmedTag = tag.trim();
          acc[trimmedTag] = (acc[trimmedTag] || 0) + 1;
          return acc;
        }, {});

        const wordCloudData = Object.entries(tagFrequency).map(([text, value]) => ({ text, value: value as number }));
        setWordCloudData(wordCloudData);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchTags();
  }, [from, to]);

  useEffect(() => {
    if (wordCloudData.length === 0) return;

    const width = 500;
    const height = 300;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')

    svg.selectAll('*').remove();

    const fontSizeScale = d3.scaleLinear()
      .domain([1, d3.max(wordCloudData, d => d.value) || 1])
      .range([10, width / 10]);

    // Reduced padding between words
    const layout = cloud()
      .size([width, height])
      .words(wordCloudData.map(d => ({ text: d.text, size: fontSizeScale(d.value) })))
      .padding(0)  // Reduced padding value to make words closer
      .rotate(() => [-30, 0, 30, 90][Math.floor(Math.random() * 4)])
      .fontSize(d => d.size || 10)
      .on('end', draw);

    layout.start();

    function draw(words: { text: string; size: number; x: number; y: number; rotate: number }[]) {
      svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
        .selectAll('text')
        .data(words)
        .enter().append('text')
        .style('font-size', (d: { size: number }) => `${d.size}px`)
        .style('fill', (d, i) => d3.schemeCategory10[i % 10])
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }, [wordCloudData]);

  return (
    <div className="w-full">
      <svg ref={svgRef} className="mx-auto" />
    </div>
  );
};

export default WordCloud;
