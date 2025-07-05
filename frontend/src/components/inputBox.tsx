import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export default function InputWithLabel({label , placeholder , className = "",type = ''} : {
  label? : string,
  placeholder?: string,
  className? : string,
  type? : string
}) {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={placeholder}>{ label} </Label>
      <Input className={className} type={type} id={placeholder} placeholder={placeholder} />
    </div>
  )
}
