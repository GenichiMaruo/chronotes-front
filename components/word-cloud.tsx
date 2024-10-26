import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { ApiHandler } from "@/hooks/use-api";

interface WordCloudProps {
  from: string;
  to: string;
}

const WordCloud: React.FC<WordCloudProps> = ({ from, to }) => {
  const [wordCloudData, setWordCloudData] = useState<{ text: string; value: number }[]>([]);
  const { apiRequest } = ApiHandler();


  // fromとtoが変更されたときにタグデータをフェッチする
  useEffect(() => {
    const fetchTags = async () => {
      const endpoint = `/notes?from=${from}&to=${to}&fields=tags`;
      try {
        const data = await apiRequest({
          method: "GET",
          url: endpoint,
        });
        
        // 各ノートのタグを分割し、すべてのタグの頻度を集計
        const allTags = data.notes.flatMap((note: { tags: string }) => note.tags.split(','));
        const tagFrequency = allTags.reduce((acc: { [x: string]: number; }, tag: string) => {
          const trimmedTag = tag.trim();
          acc[trimmedTag] = (acc[trimmedTag] || 0) + 1;
          return acc;
        }, {});

        // ワードクラウド用のデータ形式に変換
        const wordCloudData = Object.entries(tagFrequency).map(([text, value]) => ({ text, value: value as number }));
        setWordCloudData(wordCloudData);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchTags();
  }, [from, to]); // from, toが変更されるたびに再フェッチ

  // ワードクラウドの描画
  useEffect(() => {
    if (wordCloudData.length === 0) return;

    const width = 500;
    const height = 300;

    // SVGの初期化
    const svg = d3.select('#word-cloud')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f0f0f0');

    // SVG内をクリア
    svg.selectAll('*').remove();

    // d3-cloudによるレイアウト設定
    const layout = cloud()
      .size([width, height])
      .words(wordCloudData.map(d => ({ text: d.text, size: 10 + d.value * 5 })))
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .fontSize(d => d.size || 10)
      .on('end', draw);

    layout.start();

    // ワードクラウド描画
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

  return <svg id="word-cloud"></svg>;
};

export default WordCloud;
