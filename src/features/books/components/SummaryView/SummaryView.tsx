import { Book } from '@core/domain';

export interface SummaryViewProps {
  book: Book;
}

function SummaryView({ book }: SummaryViewProps) {
  // Split summary into paragraphs for better readability
  const paragraphs = book.summary.split('\n\n');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {book.title}
        </h2>
        <p className="text-lg text-gray-600">
          by {book.author}
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        {paragraphs.map((paragraph, index) => {
          // Check if paragraph is a heading (starts with ** or #)
          const isHeading = paragraph.trim().startsWith('**') || paragraph.trim().startsWith('#');

          if (isHeading) {
            // Remove markdown formatting
            const headingText = paragraph
              .replace(/\*\*/g, '')
              .replace(/#{1,6}\s/, '')
              .trim();

            return (
              <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                {headingText}
              </h3>
            );
          }

          // Regular paragraph - preserve markdown bold formatting
          const formattedParagraph = paragraph.split('**').map((part, i) => {
            if (i % 2 === 1) {
              return <strong key={i}>{part}</strong>;
            }
            return part;
          });

          return (
            <p key={index} className="text-gray-700 leading-relaxed mb-4">
              {formattedParagraph}
            </p>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {book.category.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SummaryView;
