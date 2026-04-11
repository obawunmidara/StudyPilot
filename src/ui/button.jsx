const Button = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        bg-blue-600 hover:bg-blue-700
        text-white font-semibold
        px-5 py-2.5
        rounded-full
        transition
        shadow-sm hover:shadow-md
      "
    >
      {children}
    </button>
  )
}

export default Button;


