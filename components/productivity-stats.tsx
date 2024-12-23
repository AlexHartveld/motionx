'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const data = [
  { name: 'Mon', productivity: 4 },
  { name: 'Tue', productivity: 3 },
  { name: 'Wed', productivity: 5 },
  { name: 'Thu', productivity: 2 },
  { name: 'Fri', productivity: 4 },
  { name: 'Sat', productivity: 6 },
  { name: 'Sun', productivity: 3 },
]

export default function ProductivityStats() {
  return (
    <Card className="brutalist-border brutalist-hover bg-blue-100 dark:bg-blue-900">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">PRODUCTIVITY STATS</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
            <Bar dataKey="productivity" fill="#000000" radius={[4, 4, 0, 0]} className="animate-grow" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

