import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const ComingSoon = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coming Soon!</CardTitle>

      </CardHeader>
      <CardContent>
        <Link href="/">
          Back to Home
        </Link>
      </CardContent>
    </Card>
  )
}

export default ComingSoon