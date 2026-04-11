const ThemeToggle = ({ dark, setDark }) => {
  return (
    <button
      onClick={() => setDark(prev => !prev)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: dark ? "#2563eb" : "#e5e7eb",
        border: "none",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.3s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: dark ? 22 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#ffffff",
          transition: "left 0.25s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
};

export default ThemeToggle;