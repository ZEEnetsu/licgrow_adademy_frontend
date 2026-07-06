import React from 'react'

const AdminLayout = ({children}) => {
  return (
    <div className='bg-surface h-screen text-text-primary grid grid-cols-8 grid-rows-12'>{children}</div>
  )
}

export default AdminLayout