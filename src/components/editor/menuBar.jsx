export const MenuBar = ({ editor }) => {
    if (!editor) return null;

    return (
        <div className="menu-bar">
            <>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`boldd ${editor.isActive("bold") ? "is-active" : ""}`}
                >
                    Bold
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={`italicc ${editor.isActive("italic") ? "is-active" : ""}`}
                >
                    Italic
                </button>
                <button
                    onClick={() => editor.chain().focus().setColor("#8000FF").run()}
                    className={`color color-purple ${editor.isActive("textStyle", { color: "#8000FF" }) ? "is-active" : ""}`}
                ></button>
                <button
                    onClick={() => editor.chain().focus().setColor("#EE4949").run()}
                    className={`color color-red ${editor.isActive("textStyle", { color: "#EE4949" }) ? "is-active" : ""}`}
                ></button>
                <button
                    onClick={() => editor.chain().focus().setColor("#00AC6E").run()}
                    className={`color color-green ${editor.isActive("textStyle", { color: "#00AC6E" }) ? "is-active" : ""}`}
                ></button>
                <button
                    onClick={() => editor.chain().focus().setColor("#0066FF").run()}
                    className={`color color-blue ${editor.isActive("textStyle", { color: "#0066FF" }) ? "is-active" : ""}`}
                ></button>
            </>
        </div>
    );
};
