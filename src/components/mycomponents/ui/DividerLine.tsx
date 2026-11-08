
type DividerLineProps = {
  text: string;
};

const DividerLine = ({ text }: DividerLineProps) => {
    return (
    <div className="my-7 flex w-full items-center gap-4">
    <div className="h-px min-w-0 flex-1 bg-border" />

    <span className="shrink-0 text-center text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {text}
    </span>

    <div className="h-px min-w-0 flex-1 bg-border" />
  </div>
    );
};

export default DividerLine;