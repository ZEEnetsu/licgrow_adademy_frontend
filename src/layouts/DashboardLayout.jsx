const DashboardLayout = ({children}) => {
  return (
    <div className="row-span-11 col-span-7 h-full overflow-y-auto [&::-webkit-scrollbar]:w-0">{children}</div>
  )
}

export default DashboardLayout