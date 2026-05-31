import { img } from "framer-motion/client"

const Icon = ({imageURL}) => {
  return (
     <img
     src={imageURL}
     alt={imageURL}
     className="h-8 w-8 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700/80 cursor-pointer transition-all duration-200"
     />
  )
}

export default Icon