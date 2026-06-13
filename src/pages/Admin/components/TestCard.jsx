import { useState } from "react"

const TestCard = ({title , iconURL , timeAgo , Id}) => {
  
  const testId  = String(Id).slice(0,8);
  console.log(testId);
  return (
    <div className='flex gap-4 border border-zinc-800 p-3 rounded-md bg-zinc-900 hover:bg-zinc-800 transition-all duration-200 cursor-pointer'>
        <img src={iconURL} alt={iconURL} className='w-12'/>
        <div className="text-[10px] mt-2 flex flex-col justify-between">
            <div className="flex justify-between">
              <span className="text-green-300">{testId}</span>
            </div>
            <p className='text-xs text-start'>{title}</p>
        </div>
    </div>
  )
}

export default TestCard