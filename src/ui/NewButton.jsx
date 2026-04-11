const NewButton = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-semibold px-3.5 xl:px-5 xl:py-2.5 py-2 rounded-full transition shadow-sm hover:shadow-md"
    >
      {children}
    </button>
  )
}

export default NewButton;


