interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
    <h2 className="text-2xl font-bold tracking-tight text-foreground">
      {title}
    </h2>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default ComingSoon;
