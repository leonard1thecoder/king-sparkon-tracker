export type FaqItem = { question: string; answer: string };

export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="ks-faq mx-auto max-w-3xl">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
