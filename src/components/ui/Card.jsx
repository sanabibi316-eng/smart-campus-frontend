const Card = ({ children, className = '', ...rest }) => (
  <div className={`card ${className}`} {...rest}>
    {children}
  </div>
);

export default Card;