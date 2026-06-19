import { useSelector, useDispatch } from "react-redux"
import { setValue } from "../../redux/slices/tabsSlice"

function Tabs({ defaultValue, onValueChange, ...props }) {
  // const dispatch = useDispatch()

  return (
    <div {...props} />
  )
}

const TabsList = ({ className, ...props }) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    {...props}
  />
)
TabsList.displayName = "TabsList"

const TabsTrigger = ({ className, value, ...props }) => {
  const dispatch = useDispatch()
  const currentValue = useSelector((state) => state.tabs.value)
  const isActive = currentValue === value

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? "bg-background text-foreground shadow-sm" : ""} ${className}`}
      onClick={() => dispatch(setValue(value))}
      {...props}
    />
  )
}
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = ({ className, value, ...props }) => {
  const currentValue = useSelector((state) => state.tabs.value)

  return currentValue === value ? (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    />
  ) : null
}
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }

