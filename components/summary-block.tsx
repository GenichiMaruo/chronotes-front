import React from 'react';

interface SummaryBlockProps {
  title: string;
  summary: string;
}

const SummaryBlock: React.FC<SummaryBlockProps> = ({ title, summary }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-600">
        {summary ? summary : 'No summary available.'}
      </p>
    </div>
  );
};

export default SummaryBlock;
