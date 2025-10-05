import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { generateSignInCode } from "../lib/supabaseClient";


export function QRBlock({
  data = null,
  className = ""
}: {
  data?: any | null
  className?: string
}) {
  const [value, setValue] = useState(data);

  useEffect(() => {
    const trySession = async () => {
      const signInCode = await generateSignInCode()
      if (signInCode) {
        setValue(JSON.stringify(signInCode))
      }
    }

    if (data) {
      setValue(JSON.stringify(data))
      return
    } else {
      trySession()
    }
  }, [data])

  return (
    <div className={`border-4 p-0.5 rounded m-1 min-h-80 min-w-80 ${className}`}>
      {value && (
        <QRCodeSVG className="w-full h-full" height={320} width={320} value={value} />
      )}
    </div>
  )
}
