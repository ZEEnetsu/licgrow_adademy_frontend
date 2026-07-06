import { createPortal } from "react-dom";
import close from '../assets/close.svg';
const ProtalLayout = ({ onClose , children , heading }) => {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80"
      onClick={onClose}  // click backdrop to close
    >
      <div
        className="relative p-2 min-w-100 border rounded-md"
        onClick={(e) => e.stopPropagation()}  // don't close when clicking inside
      >
        <div className="sticky top-0 w-full border-b border-zinc-800 flex justify-between">
         <div className="text-zinc-300 font-semibold text-xl px-4 py-1">{heading}</div>
          <button
          onClick={onClose}
          className="flex items-center justify-center bg-zinc-800 hover:bg-red-500/70 transition-all duration-200 w-10 text-sm text-white font-semibold"
        >
          <img src={close} alt={close} className="h-4"/>
        </button> 
        </div>
        <div className="text-white mb-4 p-4 ">{children}</div>
        
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default ProtalLayout;