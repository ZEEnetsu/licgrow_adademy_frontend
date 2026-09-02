import { createPortal } from "react-dom";
import close from "../assets/close.svg";
const ProtalLayout = ({ onClose, children, heading }) => {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // click backdrop to close
    >
      <div
        className="relative px-4 py-4 min-w-100 rounded-md bg-surface-elevated shadow-lg "
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside
      >
        <div className="sticky top-0 w-full flex justify-between items-center px-4">
          <div className="text-text-primary font-semibold text-xl py-5">
            {heading}
          </div>
          <button
            onClick={onClose}
            className="h-10 flex items-center justify-center bg-surface hover:bg-danger transition-all duration-200 w-10 text-sm text-text-primary font-semibold"
          >
            <img src={close} alt={close} className="h-4" />
          </button>
        </div>
        <div className="text-text-primary mb-4 p-4">{children}</div>
      </div>
    </div>,
    document.getElementById("portal-root"),
  );
};

export default ProtalLayout;
