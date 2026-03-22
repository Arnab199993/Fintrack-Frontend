export const FormGroup = ({ label, children, hint }) =>{
  return (
    <div>
      {label && <label className="field-label">{label}</label>}
      {children}
      {hint && <p className="text-[11px] text-ink-500 mt-1">{hint}</p>}
    </div>
  )
}



export const Input = ({ className = '', ...props }) => {
  return <input className={`field ${className}`} {...props} />
}



export const  Select = ({ className = '', children, ...props }) => {
  return (
    <select className={`field ${className}`} {...props}>
      {children}
    </select>
  )
}

export const Textarea = ({ className = '', ...props }) => {
  return <textarea className={`field resize-none ${className}`} rows={3} {...props} />
}
