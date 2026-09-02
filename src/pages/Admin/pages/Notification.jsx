import { useState } from "react"
import ProtalLayout from "../../../layouts/PortalLayput";
import DraftTestFrom from "../../../modals/DraftTestFrom.jsx";
const Notification = () => {

  const [open , setOpen] = useState(false);
  
  return (
    <div>
      <button onClick={()=> setOpen(true)} className="px-4 py-2 bg-accent rounded-md text-text-primary font-semibold">open portal</button>

      {
        open && <ProtalLayout onClose={ ()=> setOpen(false)}>
           <DraftTestFrom />
        </ProtalLayout>
      }

    </div>
  )
}

export default Notification