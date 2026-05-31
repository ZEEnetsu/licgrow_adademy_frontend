import React from 'react'

const AdminLayout = ({children}) => {
  return (
    <div className='bg-zinc-950 h-screen text-zinc-300 grid grid-cols-8 grid-rows-12'>{children}</div>
  )
}

export default AdminLayout