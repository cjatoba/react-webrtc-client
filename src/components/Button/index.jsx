export const Button = ({ children, ...props }) => {
  const { className, ...rest } = props;

  return (
    <button
      className={`text-green-950 bg-green-200 rounded-lg font-bold ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
